import Contact from "../models/Contact.js";
import User from "../models/User.js";
import Property from "../models/Property.js";
import PGProperty from "../models/PGProperty.js";

// Create contact record when user contacts client
export const createContact = async (req, res) => {
  try {
    const { 
      propertyId, 
      propertyName, 
      clientId, 
      clientName, 
      clientPhone,
      contactMethod = 'call', 
      contactType = 'inquiry', 
      message = "" 
    } = req.body;
    
    const userId = req.user.id;

    // 1. Validate user exists
    const user = await User.findById(userId).select('name phone');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 2. Validate client exists
    const client = await User.findById(clientId).select('name phone profileImage');
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Property owner not found"
      });
    }

    // 3. Try to get property details from Property model
    let property = await Property.findById(propertyId)
      .select('name images ownerId');
    
    // 4. If not found in Property, try PGProperty
    if (!property) {
      property = await PGProperty.findById(propertyId)
        .select('name images ownerId image');
    }

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // 5. Get property image
    let propertyImage = null;
    if (property.images && property.images.length > 0) {
      propertyImage = property.images[0].url;
    } else if (property.image) {
      propertyImage = property.image;
    }

    // 6. Check for duplicate contacts (within last 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentContact = await Contact.findOne({
      userId,
      propertyId,
      clientId,
      contactMethod,
      contactedAt: { $gte: oneHourAgo }
    });

    let contact;

    if (recentContact) {
      // Update existing contact
      recentContact.contactedAt = new Date();
      recentContact.message = message || recentContact.message;
      contact = await recentContact.save();
      
      return res.status(200).json({
        success: true,
        message: "Contact recorded (updated)",
        data: contact,
        isUpdated: true
      });
    }

    // 7. Create new contact
    contact = new Contact({
      userId,
      userName: user.name,
      userPhone: user.phone || '',
      userImage: user.profileImage || '',
      propertyId,
      propertyName: propertyName || property.name || 'Property',
      propertyImage,
      clientId,
      clientName: clientName || client.name || 'Property Owner',
      clientPhone: clientPhone || client.phone || '',
      clientImage: client.profileImage || '',
      contactMethod,
      contactType,
      message: message || `Interested in ${property.name || 'property'}`
    });
    
    await contact.save();

    res.status(200).json({
      success: true,
      message: "Contact recorded successfully",
      data: contact,
      isUpdated: false
    });

  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to record contact",
      error: error.message
    });
  }
};

// Get user's contacted properties
export const getUserContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const contacts = await Contact.find({ userId })
      .sort({ contactedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Contact.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: contacts,
      count: contacts.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Get user contacts error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
      error: error.message
    });
  }
};

// Get client's received contacts
export const getClientContacts = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const contacts = await Contact.find({ clientId })
      .sort({ contactedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Contact.countDocuments({ clientId });

    res.status(200).json({
      success: true,
      data: contacts,
      count: contacts.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Get client contacts error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
      error: error.message
    });
  }
};

// Update contact status
export const updateContactStatus = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { status } = req.body;
    const clientId = req.user.id;

    const contact = await Contact.findOne({ 
      _id: contactId, 
      clientId 
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    contact.status = status || contact.status;
    await contact.save();

    res.status(200).json({
      success: true,
      message: "Contact status updated",
      data: contact
    });

  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update contact",
      error: error.message
    });
  }
};

// Delete contact
export const deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user.id;

    const contact = await Contact.findOne({ 
      _id: contactId, 
      userId 
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      message: "Contact deleted"
    });

  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete contact",
      error: error.message
    });
  }
};

// Get contact statistics
export const getContactStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Contact.aggregate([
      {
        $match: { userId }
      },
      {
        $group: {
          _id: null,
          totalContacts: { $sum: 1 },
          calls: {
            $sum: { $cond: [{ $eq: ["$contactMethod", "call"] }, 1, 0] }
          },
          chats: {
            $sum: { $cond: [{ $eq: ["$contactMethod", "chat"] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalContacts: 0,
        calls: 0,
        chats: 0
      }
    });

  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get statistics",
      error: error.message
    });
  }
};

// ============== ADMIN FUNCTION ==============
// Get ALL contacts for admin dashboard
export const getAllContactsForAdmin = async (req, res) => {
  try {
    // Simple function to get all contacts
    const contacts = await Contact.find({})
      .sort({ contactedAt: -1 })
      .limit(100)
      .lean();

    console.log(`✅ Found ${contacts.length} contacts in database`);

    res.status(200).json({
      success: true,
      data: contacts,
      count: contacts.length,
      message: `Found ${contacts.length} contacts`
    });

  } catch (error) {
    console.error('Get all contacts for admin error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
      error: error.message
    });
  }
};