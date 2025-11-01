import CustomReview from '../models/CustomReview.js';
import Property from '../models/Property.js';

// Get all custom reviews for admin with filters
export const getAdminCustomReviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { isCustom: true };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } }
      ];
    }

    const customReviews = await CustomReview.find(query)
      .populate('propertyId', 'name city locality street')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CustomReview.countDocuments(query);

    // Get counts for filters
    const pendingCount = await CustomReview.countDocuments({ ...query, status: 'pending' });
    const approvedCount = await CustomReview.countDocuments({ ...query, status: 'approved' });
    const rejectedCount = await CustomReview.countDocuments({ ...query, status: 'rejected' });

    res.json({
      success: true,
      data: customReviews,
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: total
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get admin custom reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom reviews'
    });
  }
};

// Create a custom review (Admin function)
export const createCustomReview = async (req, res) => {
  try {
    const { propertyId, userName, userAvatar, rating, comment, images } = req.body;
    const adminId = req.admin?._id;

    // Validate required fields
    if (!propertyId || !userName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Property ID, user name, rating, and comment are required"
      });
    }

    // Validate property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Create custom review
    const customReview = await CustomReview.create({
      propertyId,
      userName,
      userAvatar: userAvatar || `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70)}`,
      rating,
      comment,
      images: images || [],
      status: "approved",
      isCustom: true,
      createdBy: adminId
    });

    // Populate property details for response
    const populatedReview = await CustomReview.findById(customReview._id)
      .populate('propertyId', 'name city locality street');

    res.status(201).json({
      success: true,
      message: "Custom review created successfully",
      data: populatedReview
    });

  } catch (error) {
    console.error('Create custom review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create custom review'
    });
  }
};

// Get all properties for dropdown (Admin function)
export const getPropertiesForReview = async (req, res) => {
  try {
    const properties = await Property.find({})
      .select('_id name city locality street')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: properties,
      count: properties.length
    });
  } catch (error) {
    console.error('Get properties for review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties'
    });
  }
};

// Get custom reviews for a specific property (if needed)
export const getCustomReviewsByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const customReviews = await CustomReview.find({ 
      propertyId: propertyId,
      status: 'approved'
    })
    .populate('propertyId', 'name city locality street')
    .sort({ isFeatured: -1, createdAt: -1 });

    res.json({
      success: true,
      data: customReviews
    });
  } catch (error) {
    console.error('Get custom reviews by property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews for property'
    });
  }
};

// Approve a custom review
export const approveCustomReview = async (req, res) => {
  try {
    const customReview = await CustomReview.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('propertyId', 'name city locality street');

    if (!customReview) {
      return res.status(404).json({
        success: false,
        message: 'Custom review not found'
      });
    }

    res.json({
      success: true,
      message: 'Custom review approved successfully',
      data: customReview
    });
  } catch (error) {
    console.error('Approve custom review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve review'
    });
  }
};

// Reject a custom review
export const rejectCustomReview = async (req, res) => {
  try {
    const customReview = await CustomReview.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (!customReview) {
      return res.status(404).json({
        success: false,
        message: 'Custom review not found'
      });
    }

    res.json({
      success: true,
      message: 'Custom review rejected successfully',
      data: customReview
    });
  } catch (error) {
    console.error('Reject custom review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject review'
    });
  }
};

// Add admin response to custom review
export const addAdminResponse = async (req, res) => {
  try {
    const { response } = req.body;

    const customReview = await CustomReview.findByIdAndUpdate(
      req.params.id,
      { adminResponse: response },
      { new: true }
    ).populate('propertyId', 'name city locality street');

    if (!customReview) {
      return res.status(404).json({
        success: false,
        message: 'Custom review not found'
      });
    }

    res.json({
      success: true,
      message: 'Response added successfully',
      data: customReview
    });
  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response'
    });
  }
};

// Toggle featured status
export const toggleFeatured = async (req, res) => {
  try {
    const customReview = await CustomReview.findById(req.params.id);

    if (!customReview) {
      return res.status(404).json({
        success: false,
        message: 'Custom review not found'
      });
    }

    customReview.isFeatured = !customReview.isFeatured;
    await customReview.save();

    res.json({
      success: true,
      message: `Custom review ${customReview.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: customReview
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle featured status'
    });
  }
};

// Get approved custom reviews for preview (user view)
export const getApprovedCustomReviews = async (req, res) => {
  try {
    const customReviews = await CustomReview.find({ 
      status: 'approved',
      isCustom: true
    })
    .populate('propertyId', 'name city locality street')
    .sort({ isFeatured: -1, createdAt: -1 });

    res.json({
      success: true,
      data: customReviews,
      count: customReviews.length
    });
  } catch (error) {
    console.error('Get approved custom reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved reviews'
    });
  }
};