 
// import OfflineBooking from "../models/OfflineBooking.js";
// import User from "../models/User.js";
// import Property from "../models/Property.js";
 
// // Create or update offline booking
// export const createOfflineBooking = async (req, res) => {
//   try {
//     const { tenant, propertyId } = req.body;
 
//     if (!tenant || !propertyId) {
//       return res.status(400).json({ message: "Tenant and Property ID are required" });
//     }
 
   
//     let existingBooking = await OfflineBooking.findOne({ tenant, propertyId });
 
//     if (existingBooking) {
     
//       Object.assign(existingBooking, req.body);
//       existingBooking.bookingStatus = "confirmed";
//       await existingBooking.save();
//       return res.status(200).json({ message: "Booking updated successfully", booking: existingBooking });
//     }
 
//     // Create new booking
//     const booking = new OfflineBooking(req.body);
//     await booking.save();
//     res.status(201).json({ message: "Offline booking created successfully", booking });
//   } catch (error) {
//     console.error(error);
//     res.status(400).json({ message: error.message });
//   }
// };
 
// // Get all offline bookings
// export const getAllOfflineBookings = async (req, res) => {
//   try {
//     const bookings = await OfflineBooking.find()
//       .populate({
//         path: "tenant",
//         model: User,
//         select: "name phone clientId email"
//       })
//       .populate({
//         path: "propertyId",
//         model: Property,
//         select: "name locality city"
//       });
   
//     res.status(200).json(bookings);
//   } catch (error) {
//     console.error("Error fetching offline bookings:", error);
//     res.status(500).json({ message: error.message });
//   }
// };
 
// export const getOfflineBookingById = async (req, res) => {
//   try {
//     const booking = await OfflineBooking.findById(req.params.id)
//       .populate({
//         path: "tenant",
//         model: User,
//         select: "name phone clientId email"
//       })
//       .populate({
//         path: "propertyId",
//         model: Property,
//         select: "name locality city"
//       });
   
//     if (!booking) return res.status(404).json({ message: "Booking not found" });
//     res.status(200).json(booking);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
 
// export const updateOfflineBooking = async (req, res) => {
//   try {
//     const booking = await OfflineBooking.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!booking) return res.status(404).json({ message: "Booking not found" });
//     res.status(200).json({ message: "Booking updated successfully", booking });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };
 
// export const deleteOfflineBooking = async (req, res) => {
//   try {
//     const booking = await OfflineBooking.findByIdAndDelete(req.params.id);
//     if (!booking) return res.status(404).json({ message: "Booking not found" });
//     res.status(200).json({ message: "Booking deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// export const updateOfflineBookingStatus = async (req, res) => {
//   try {
//     console.log('📝 Updating offline booking status...', req.params, req.body);
 
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required"
//       });
//     }
 
//     const { id } = req.params;
//     const { bookingStatus } = req.body;
 
//     // Validate booking ID
//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Booking ID is required"
//       });
//     }
 
//     // Validate booking status
//     const validStatuses = ["pending", "confirmed", "cancelled", "checked_in", "checked_out", "terminated"];
//     if (!bookingStatus || !validStatuses.includes(bookingStatus)) {
//       return res.status(400).json({
//         success: false,
//         message: `Valid booking status is required. Allowed values: ${validStatuses.join(', ')}`
//       });
//     }
 
//     // Find the booking
//     const booking = await OfflineBooking.findById(id);
   
//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Offline booking not found"
//       });
//     }
 
//     // Get user role
//     const userId = req.user.id;
//     const userRole = req.user.role;
 
//     // Check permissions
//     let hasPermission = false;
   
//     // Admin can update any booking
//     if (userRole === 'admin') {
//       hasPermission = true;
//     }
//     // Client can update bookings for their properties
//     else if (userRole === 'client') {
//       // Check if client owns this property
//       const property = await Property.findById(booking.propertyId);
//       if (property && property.clientId === (req.user.clientId || userId)) {
//         hasPermission = true;
//       }
//     }
//     // User can only update their own bookings
//     else if (userRole === 'user') {
//       if (booking.tenant.toString() === userId) {
//         hasPermission = true;
//       }
//     }
 
//     if (!hasPermission) {
//       return res.status(403).json({
//         success: false,
//         message: "You do not have permission to update this booking"
//       });
//     }
 
//     // Update booking status
//     const updatedBooking = await OfflineBooking.findByIdAndUpdate(
//       id,
//       {
//         bookingStatus,
//         ...(bookingStatus === 'checked_in' && { approvedBy: userId, approvedAt: new Date() })
//       },
//       {
//         new: true,
//         runValidators: true
//       }
//     )
//     .populate({
//       path: "tenant",
//       model: User,
//       select: "name phone clientId email"
//     })
//     .populate({
//       path: "propertyId",
//       model: Property,
//       select: "name locality city"
//     });
 
//     console.log('✅ Offline booking status updated successfully:', updatedBooking._id);
 
//     return res.status(200).json({
//       success: true,
//       message: "Offline booking status updated successfully",
//       booking: {
//         id: updatedBooking._id,
//         tenant: updatedBooking.tenant ? {
//           name: updatedBooking.tenant.name,
//           email: updatedBooking.tenant.email,
//           phone: updatedBooking.tenant.phone
//         } : null,
//         property: updatedBooking.propertyId ? {
//           name: updatedBooking.propertyId.name,
//           locality: updatedBooking.propertyId.locality,
//           city: updatedBooking.propertyId.city
//         } : null,
//         roomDetails: updatedBooking.roomDetails,
//         stayType: updatedBooking.stayType,
//         checkInDate: updatedBooking.checkInDate,
//         checkOutDate: updatedBooking.checkOutDate,
//         bookingStatus: updatedBooking.bookingStatus,
//         paymentStatus: updatedBooking.paymentInfo?.paymentStatus,
//         pricing: updatedBooking.pricing,
//         createdAt: updatedBooking.createdAt,
//         updatedAt: updatedBooking.updatedAt
//       }
//     });
 
//   } catch (error) {
//     console.error('❌ Update offline booking status error:', error);
   
//     if (error.name === 'CastError') {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid booking ID format"
//       });
//     }
   
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({
//         success: false,
//         message: "Validation error",
//         errors: Object.values(error.errors).map(err => err.message)
//       });
//     }
   
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };
 







import OfflineBooking from "../models/OfflineBooking.js";
import User from "../models/User.js";
import Property from "../models/Property.js";

// Create or update offline booking
export const createOfflineBooking = async (req, res) => {
  try {
    const { tenant, propertyId } = req.body;

    if (!tenant || !propertyId) {
      return res.status(400).json({ message: "Tenant and Property ID are required" });
    }

    // Check if user has permission to create booking for this property
    if (req.user && req.user.role === 'client') {
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Check if client owns this property
      const clientPropertyId = req.user.clientId || req.user.id;
      if (property.clientId.toString() !== clientPropertyId.toString()) {
        return res.status(403).json({ 
          message: "You don't have permission to create bookings for this property" 
        });
      }
    }

    let existingBooking = await OfflineBooking.findOne({ tenant, propertyId });

    if (existingBooking) {
      Object.assign(existingBooking, req.body);
      existingBooking.bookingStatus = "confirmed";
      await existingBooking.save();
      return res.status(200).json({ message: "Booking updated successfully", booking: existingBooking });
    }

    // Create new booking
    const booking = new OfflineBooking(req.body);
    await booking.save();
    
    res.status(201).json({ message: "Offline booking created successfully", booking });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Get all offline bookings (with client filtering)
export const getAllOfflineBookings = async (req, res) => {
  try {
    let query = {};

    // If user is a client, filter by their properties
    if (req.user && req.user.role === 'client') {
      const clientId = req.user.clientId || req.user.id;
      
      // Find all properties owned by this client
      const clientProperties = await Property.find({ clientId });
      const propertyIds = clientProperties.map(property => property._id);
      
      // Filter bookings by these property IDs
      query.propertyId = { $in: propertyIds };
    }
    
    // If specific propertyId is provided in query
    if (req.query.propertyId) {
      query.propertyId = req.query.propertyId;
    }

    const bookings = await OfflineBooking.find(query)
      .populate({
        path: "tenant",
        model: User,
        select: "name phone clientId email"
      })
      .populate({
        path: "propertyId",
        model: Property,
        select: "name locality city clientId"
      });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching offline bookings:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get offline booking by ID (with permission check)
export const getOfflineBookingById = async (req, res) => {
  try {
    const booking = await OfflineBooking.findById(req.params.id)
      .populate({
        path: "tenant",
        model: User,
        select: "name phone clientId email"
      })
      .populate({
        path: "propertyId",
        model: Property,
        select: "name locality city clientId"
      });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check permissions if user is logged in
    if (req.user) {
      const userId = req.user.id;
      const userRole = req.user.role;

      // Admin can view any booking
      if (userRole === 'admin') {
        return res.status(200).json(booking);
      }

      // Client can only view bookings for their properties
      if (userRole === 'client') {
        const clientId = req.user.clientId || req.user.id;
        
        // Check if booking belongs to client's property
        if (booking.propertyId && booking.propertyId.clientId) {
          if (booking.propertyId.clientId.toString() === clientId.toString()) {
            return res.status(200).json(booking);
          }
        }
        
        return res.status(403).json({ 
          message: "You don't have permission to view this booking" 
        });
      }

      // User can only view their own bookings
      if (userRole === 'user') {
        if (booking.tenant && booking.tenant._id.toString() === userId) {
          return res.status(200).json(booking);
        }
        return res.status(403).json({ 
          message: "You don't have permission to view this booking" 
        });
      }
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update offline booking (with permission check)
export const updateOfflineBooking = async (req, res) => {
  try {
    // First check permissions
    const booking = await OfflineBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check permissions if user is logged in
    if (req.user) {
      const userId = req.user.id;
      const userRole = req.user.role;

      let hasPermission = false;

      if (userRole === 'admin') {
        hasPermission = true;
      } else if (userRole === 'client') {
        const property = await Property.findById(booking.propertyId);
        const clientId = req.user.clientId || req.user.id;
        if (property && property.clientId.toString() === clientId.toString()) {
          hasPermission = true;
        }
      } else if (userRole === 'user') {
        if (booking.tenant.toString() === userId) {
          hasPermission = true;
        }
      }

      if (!hasPermission) {
        return res.status(403).json({ 
          message: "You don't have permission to update this booking" 
        });
      }
    }

    // If all checks pass, update the booking
    const updatedBooking = await OfflineBooking.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate({
      path: "tenant",
      model: User,
      select: "name phone clientId email"
    }).populate({
      path: "propertyId",
      model: Property,
      select: "name locality city"
    });
    
    res.status(200).json({ message: "Booking updated successfully", booking: updatedBooking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete offline booking (with permission check)
export const deleteOfflineBooking = async (req, res) => {
  try {
    // First check permissions
    const booking = await OfflineBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check permissions if user is logged in
    if (req.user) {
      const userId = req.user.id;
      const userRole = req.user.role;

      let hasPermission = false;

      if (userRole === 'admin') {
        hasPermission = true;
      } else if (userRole === 'client') {
        const property = await Property.findById(booking.propertyId);
        const clientId = req.user.clientId || req.user.id;
        if (property && property.clientId.toString() === clientId.toString()) {
          hasPermission = true;
        }
      }

      if (!hasPermission) {
        return res.status(403).json({ 
          message: "You don't have permission to delete this booking" 
        });
      }
    }

    await OfflineBooking.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update offline booking status (with permission check)
export const updateOfflineBookingStatus = async (req, res) => {
  try {
    console.log('📝 Updating offline booking status...', req.params, req.body);

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { id } = req.params;
    const { bookingStatus } = req.body;

    // Validate booking ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required"
      });
    }

    // Validate booking status
    const validStatuses = ["pending", "confirmed", "cancelled", "checked_in", "checked_out", "terminated"];
    if (!bookingStatus || !validStatuses.includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: `Valid booking status is required. Allowed values: ${validStatuses.join(', ')}`
      });
    }

    // Find the booking
    const booking = await OfflineBooking.findById(id);
   
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Offline booking not found"
      });
    }

    // Get user role
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check permissions
    let hasPermission = false;
   
    // Admin can update any booking
    if (userRole === 'admin') {
      hasPermission = true;
    }
    // Client can update bookings for their properties
    else if (userRole === 'client') {
      // Check if client owns this property
      const property = await Property.findById(booking.propertyId);
      if (property && property.clientId.toString() === (req.user.clientId || userId).toString()) {
        hasPermission = true;
      }
    }
    // User can only update their own bookings
    else if (userRole === 'user') {
      if (booking.tenant.toString() === userId) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this booking"
      });
    }

    // Update booking status
    const updatedBooking = await OfflineBooking.findByIdAndUpdate(
      id,
      {
        bookingStatus,
        ...(bookingStatus === 'checked_in' && { approvedBy: userId, approvedAt: new Date() })
      },
      {
        new: true,
        runValidators: true
      }
    )
    .populate({
      path: "tenant",
      model: User,
      select: "name phone clientId email"
    })
    .populate({
      path: "propertyId",
      model: Property,
      select: "name locality city"
    });

    console.log('✅ Offline booking status updated successfully:', updatedBooking._id);

    return res.status(200).json({
      success: true,
      message: "Offline booking status updated successfully",
      booking: {
        id: updatedBooking._id,
        tenant: updatedBooking.tenant ? {
          name: updatedBooking.tenant.name,
          email: updatedBooking.tenant.email,
          phone: updatedBooking.tenant.phone
        } : null,
        property: updatedBooking.propertyId ? {
          name: updatedBooking.propertyId.name,
          locality: updatedBooking.propertyId.locality,
          city: updatedBooking.propertyId.city
        } : null,
        roomDetails: updatedBooking.roomDetails,
        stayType: updatedBooking.stayType,
        checkInDate: updatedBooking.checkInDate,
        checkOutDate: updatedBooking.checkOutDate,
        bookingStatus: updatedBooking.bookingStatus,
        paymentStatus: updatedBooking.paymentInfo?.paymentStatus,
        pricing: updatedBooking.pricing,
        createdAt: updatedBooking.createdAt,
        updatedAt: updatedBooking.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Update offline booking status error:', error);
   
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format"
      });
    }
   
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
   
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};