// import Notification from '../models/Notification.js';
// import User from '../models/User.js';
// import Booking from '../models/Booking.js';
// import Property from '../models/Property.js';
// import Admin from '../models/Admin.js';
// // Notification service class
// class NotificationService {
//   // Create notification
//   static async createNotification(notificationData) {
//     try {
//       const notification = new Notification(notificationData);
//       await notification.save();
      
//       // Emit real-time notification (if using Socket.io)
//       // this.emitNotification(notification);
      
//       return notification;
//     } catch (error) {
//       console.error('Error creating notification:', error);
//       throw error;
//     }
//   }

//   // Create booking notification for both user and client
//   static async createBookingNotification(booking, type) {
//     try {
//       const property = await Property.findById(booking.propertyId);
//       if (!property) return;

//       const notifications = [];
//       const bookingUser = await User.findById(booking.userId);
//       const clientUser = await User.findOne({ clientId: booking.clientId });

//       // Notification for user
//       const userNotification = {
//         userId: booking.userId,
//         propertyId: booking.propertyId,
//         bookingId: booking._id,
//         type: type,
//         title: this.getNotificationTitle(type, 'user'),
//         message: this.getNotificationMessage(type, 'user', {
//           propertyName: property.name,
//           bookingId: booking._id
//         }),
//         priority: 'high',
//         metadata: {
//           bookingId: booking._id,
//           propertyId: booking.propertyId
//         }
//       };

//       // Notification for client
//       if (clientUser) {
//         const clientNotification = {
//           userId: clientUser._id,
//           clientId: booking.clientId,
//           propertyId: booking.propertyId,
//           bookingId: booking._id,
//           type: type,
//           title: this.getNotificationTitle(type, 'client'),
//           message: this.getNotificationMessage(type, 'client', {
//             userName: bookingUser?.name || 'User',
//             propertyName: property.name,
//             bookingId: booking._id
//           }),
//           priority: 'high',
//           metadata: {
//             bookingId: booking._id,
//             propertyId: booking.propertyId,
//             userId: booking.userId
//           }
//         };
//         notifications.push(clientNotification);
//       }

//       notifications.push(userNotification);
      
//       // Create all notifications
//       await Notification.insertMany(notifications);
      
//       return notifications;
//     } catch (error) {
//       console.error('Error creating booking notification:', error);
//       throw error;
//     }
//   }


//    // Create admin notification// Create admin notification - FIXED version
// static async createAdminNotification(type, title, message, metadata = {}, specificAdminId = null) {
//   try {
//     const adminNotification = {
//       adminId: specificAdminId || 'admin', // Use specific admin ID or general 'admin'
//       type: type,
//       title: title,
//       message: message,
//       priority: 'high',
//       metadata: metadata,
//       isRead: false
//     };

//     console.log('Creating admin notification:', adminNotification);
    
//     const notification = new Notification(adminNotification);
//     await notification.save();
    
//     console.log('Admin notification created successfully:', notification._id);
    
//     return notification;
//   } catch (error) {
//     console.error('Error creating admin notification:', error);
//     throw error;
//   }
// }

// // Create property approval notification for admin - FIXED
// static async createPropertyApprovalNotification(property, action, specificAdminId = null) {
//   try {
//     const title = action === 'submitted' 
//       ? 'New Property Submitted for Approval'
//       : `Property ${action}`;
    
//     const message = action === 'submitted'
//       ? `New property "${property.name}" has been submitted for approval.`
//       : `Property "${property.name}" has been ${action}.`;

//     console.log(`Creating property ${action} notification for admin`);

//     return await this.createAdminNotification(
//       'property_approval',
//       title,
//       message,
//       {
//         propertyId: property._id,
//         propertyName: property.name,
//         action: action
//       },
//       specificAdminId
//     );
//   } catch (error) {
//     console.error('Error creating property approval notification:', error);
//     throw error;
//   }
// }

//   static getNotificationTitle(type, recipient) {
//     const titles = {
//       booking_created: {
//         user: 'Booking Submitted',
//         client: 'New Booking Request',
//         admin: 'New Booking Submitted'
//       },
//       booking_approved: {
//         user: 'Booking Approved!',
//         client: 'Booking Approved',
//         admin: 'Booking Approved'
//       },
//       booking_rejected: {
//         user: 'Booking Declined',
//         client: 'Booking Rejected',
//         admin: 'Booking Rejected'
//       },
//       booking_cancelled: {
//         user: 'Booking Cancelled',
//         client: 'Booking Cancelled',
//         admin: 'Booking Cancelled'
//       },
//       payment_received: {
//         user: 'Payment Successful',
//         client: 'Payment Received',
//         admin: 'Payment Received'
//       },

//       // NEW PROPERTY NOTIFICATION TITLES
//     property_submitted: {
//       client: 'Property Submitted Successfully',
//       admin: 'New Property Submitted for Approval'
//     },
//     property_approved: {
//       client: 'Property Approved!',
//       admin: 'Property Approved'
//     },
//     property_rejected: {
//       client: 'Property Rejected',
//       admin: 'Property Rejected'
//     },
//     property_revision_requested: {
//       client: 'Revision Requested for Property',
//       admin: 'Revision Requested for Property'
//     },
//     property_deleted: {
//       client: 'Property Deleted',
//       admin: 'Property Deleted'
//     }
//     };
//     return titles[type]?.[recipient] || 'Notification';
//   }

//   static getNotificationMessage(type, recipient, data) {
//     const messages = {
//       booking_created: {
//         user: `Your booking for ${data.propertyName} has been submitted and is under review.`,
//         client: `New booking request for ${data.propertyName} from ${data.userName}.`,
//         admin: `A new booking has been submitted for ${data.propertyName}.`
//       },
//       booking_approved: {
//         user: `Your booking for ${data.propertyName} has been approved! Welcome!`,
//         client: `You approved booking #${data.bookingId} for ${data.propertyName}.`,
//         admin: `Booking #${data.bookingId} for ${data.propertyName} has been approved.`
//       },
//       booking_rejected: {
//         user: `Your booking for ${data.propertyName} was not approved. Contact support for details.`,
//         client: `You rejected booking #${data.bookingId} for ${data.propertyName}.`,
//         admin: `Booking #${data.bookingId} for ${data.propertyName} has been rejected.`
//       },
//       payment_received: {
//         user: `Payment for booking #${data.bookingId} was successful.`,
//         client: `Payment received for booking #${data.bookingId} from ${data.userName}.`,
//         admin: `Payment received for booking #${data.bookingId}.`
//       },

//        property_submitted: {
//       client: `Your property "${data.propertyName}" has been submitted for admin approval.`,
//       admin: `New property "${data.propertyName}" has been submitted by client ${data.clientId}.`
//     },
//     property_approved: {
//       client: `Congratulations! Your property "${data.propertyName}" has been approved and is now live.`,
//       admin: `Property "${data.propertyName}" has been approved.`
//     },
//     property_rejected: {
//       client: `Your property "${data.propertyName}" was rejected. Reason: ${data.rejectionReason}`,
//       admin: `Property "${data.propertyName}" has been rejected.`
//     },
//     property_revision_requested: {
//       client: `Revision requested for your property "${data.propertyName}". Notes: ${data.revisionNotes}`,
//       admin: `Revision requested for property "${data.propertyName}".`
//     },
//     property_deleted: {
//       client: `Your property "${data.propertyName}" has been deleted successfully.`,
//       admin: `Property "${data.propertyName}" has been deleted by client ${data.clientId}.`
//     }
//     };
//     return messages[type]?.[recipient] || 'You have a new notification.';
//   }
// }

// // Controller methods
// export const getUserNotifications = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { page = 1, limit = 20, unreadOnly = false } = req.query;

//     const query = { userId };
//     if (unreadOnly === 'true') {
//       query.isRead = false;
//     }

//     const notifications = await Notification.find(query)
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .populate('propertyId', 'name locality')
//       .populate('bookingId', 'bookingStatus');

//     const total = await Notification.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       notifications,
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//       total,
//       unreadCount: await Notification.countDocuments({ userId, isRead: false })
//     });
//   } catch (error) {
//     console.error('Get user notifications error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch notifications',
//       error: error.message
//     });
//   }
// };

// // In your notificationController.js
// export const getClientNotifications = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId);
    
//     console.log('Client notification request from user:', {
//       userId,
//       role: user?.role,
//       clientId: user?.clientId
//     });

//     if (!user || user.role !== 'client') {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied. Client role required.'
//       });
//     }

//     const clientId = user.clientId;
//     const { page = 1, limit = 20, unreadOnly = false } = req.query;

//     // Query for client notifications
//     const query = { 
//       $or: [
//         { clientId: clientId },
//         { userId: userId }
//       ]
//     };
    
//     if (unreadOnly === 'true') {
//       query.isRead = false;
//     }

//     console.log('Query for client notifications:', query);

//     const notifications = await Notification.find(query)
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .populate('propertyId', 'name locality')
//       .populate('bookingId', 'bookingStatus')
//       .populate('userId', 'name phone');

//     const total = await Notification.countDocuments(query);

//     console.log('Found notifications:', notifications.length);

//     res.status(200).json({
//       success: true,
//       notifications,
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//       total,
//       unreadCount: await Notification.countDocuments({ 
//         $or: [
//           { clientId: clientId, isRead: false },
//           { userId: userId, isRead: false }
//         ]
//       })
//     });
//   } catch (error) {
//     console.error('Get client notifications error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch notifications',
//       error: error.message
//     });
//   }
// }; 

// // Admin notifications controller
// export const getAdminNotifications = async (req, res) => {
//   try {
//     const adminId = req.user.id;
//     const admin = await Admin.findById(adminId);
    
//     console.log('Admin notification request from:', {
//       adminId,
//       role: admin?.role,
//       name: admin?.name
//     });

//     if (!admin || admin.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied. Admin role required.'
//       });
//     }

//     const { page = 1, limit = 20, unreadOnly = false } = req.query;

//     // FIXED: Query for admin notifications - use actual admin ID or special identifier
//     const query = { 
//       $or: [
//         { adminId: 'admin' }, // Special identifier for system admin notifications
//         { adminId: adminId }  // Notifications specific to this admin
//       ]
//     };
    
//     if (unreadOnly === 'true') {
//       query.isRead = false;
//     }

//     console.log('Query for admin notifications:', query);

//     const notifications = await Notification.find(query)
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .populate('propertyId', 'name locality')
//       .populate('bookingId', 'bookingStatus')
//       .populate('userId', 'name phone');

//     const total = await Notification.countDocuments(query);

//     console.log('Found admin notifications:', notifications.length);
//     console.log('Sample notification:', notifications[0]);

//     res.status(200).json({
//       success: true,
//       notifications,
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//       total,
//       unreadCount: await Notification.countDocuments({ 
//         $or: [
//           { adminId: 'admin', isRead: false },
//           { adminId: adminId, isRead: false }
//         ]
//       })
//     });
//   } catch (error) {
//     console.error('Get admin notifications error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch admin notifications',
//       error: error.message
//     });
//   }
// };
// // export const markAsRead = async (req, res) => {
// //   try {
// //     const { notificationId } = req.params;


// //     const notification = await Notification.findByIdAndUpdate(
// //       notificationId,
// //       { isRead: true },
// //       { new: true }
// //     );

// //     if (!notification) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Notification not found'
// //       });
// //     }

// //     res.status(200).json({
// //       success: true,
// //       message: 'Notification marked as read',
// //       notification
// //     });
// //   } catch (error) {
// //     console.error('Mark as read error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to mark notification as read',
// //       error: error.message
// //     });
// //   }
// // };

// // export const markAllAsRead = async (req, res) => {
// //   try {
// //     const userId = req.user.id;
// //     const user = await User.findById(userId);

// //     let query = { userId };
// //     if (user.role === 'client') {
// //       query = { clientId: user.clientId };
// //     }

// //     await Notification.updateMany(
// //       query,
// //       { isRead: true }
// //     );

// //     res.status(200).json({
// //       success: true,
// //       message: 'All notifications marked as read'
// //     });
// //   } catch (error) {
// //     console.error('Mark all as read error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to mark all notifications as read',
// //       error: error.message
// //     });
// //   }
// // };

// // export const getUnreadCount = async (req, res) => {
// //   try {
// //     const userId = req.user.id;
// //     const user = await User.findById(userId);

// //     let query = { userId };
// //     if (user.role === 'client') {
// //       query = { clientId: user.clientId };
// //     }

// //     const unreadCount = await Notification.countDocuments({
// //       ...query,
// //       isRead: false
// //     });

// //     res.status(200).json({
// //       success: true,
// //       unreadCount
// //     });
// //   } catch (error) {
// //     console.error('Get unread count error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to get unread count',
// //       error: error.message
// //     });
// //   }
// // };

// // export const deleteNotification = async (req, res) => {
// //   try {
// //     const { notificationId } = req.params;
// //     const userId = req.user.id;

// //     const notification = await Notification.findOneAndDelete({
// //       _id: notificationId,
// //       userId
// //     });

// //     if (!notification) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Notification not found'
// //       });
// //     }

// //     res.status(200).json({
// //       success: true,
// //       message: 'Notification deleted successfully'
// //     });
// //   } catch (error) {
// //     console.error('Delete notification error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to delete notification',
// //       error: error.message
// //     });
// //   }
// // };

// export const markAsRead = async (req, res) => {
//   try {
//     const { notificationId } = req.params;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     let query = { _id: notificationId };
    
//     // Different query based on user role
//     if (userRole === 'admin') {
//       query.adminId = 'admin';
//     } else if (userRole === 'client') {
//       const user = await User.findById(userId);
//       query.$or = [
//         { _id: notificationId, clientId: user.clientId },
//         { _id: notificationId, userId: userId }
//       ];
//     } else {
//       // Regular user
//       query.userId = userId;
//     }

//     const notification = await Notification.findOneAndUpdate(
//       query,
//       { isRead: true },
//       { new: true }
//     );

//     if (!notification) {
//       return res.status(404).json({
//         success: false,
//         message: 'Notification not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Notification marked as read',
//       notification
//     });
//   } catch (error) {
//     console.error('Mark as read error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to mark notification as read',
//       error: error.message
//     });
//   }
// };

// export const markAllAsRead = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     let query = {};
    
//     if (userRole === 'admin') {
//       query = { adminId: 'admin' };
//     } else if (userRole === 'client') {
//       const user = await User.findById(userId);
//       query = { 
//         $or: [
//           { clientId: user.clientId },
//           { userId: userId }
//         ]
//       };
//     } else {
//       query = { userId };
//     }

//     await Notification.updateMany(
//       query,
//       { isRead: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'All notifications marked as read'
//     });
//   } catch (error) {
//     console.error('Mark all as read error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to mark all notifications as read',
//       error: error.message
//     });
//   }
// };

// export const getUnreadCount = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     let query = {};
    
//     if (userRole === 'admin') {
//       query = { adminId: 'admin', isRead: false };
//     } else if (userRole === 'client') {
//       const user = await User.findById(userId);
//       query = { 
//         $or: [
//           { clientId: user.clientId, isRead: false },
//           { userId: userId, isRead: false }
//         ]
//       };
//     } else {
//       query = { userId, isRead: false };
//     }

//     const unreadCount = await Notification.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       unreadCount
//     });
//   } catch (error) {
//     console.error('Get unread count error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get unread count',
//       error: error.message
//     });
//   }
// };

// export const deleteNotification = async (req, res) => {
//   try {
//     const { notificationId } = req.params;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     let query = { _id: notificationId };
    
//     if (userRole === 'admin') {
//       query.adminId = 'admin';
//     } else if (userRole === 'client') {
//       const user = await User.findById(userId);
//       query.$or = [
//         { _id: notificationId, clientId: user.clientId },
//         { _id: notificationId, userId: userId }
//       ];
//     } else {
//       query.userId = userId;
//     }

//     const notification = await Notification.findOneAndDelete(query);

//     if (!notification) {
//       return res.status(404).json({
//         success: false,
//         message: 'Notification not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Notification deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete notification error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete notification',
//       error: error.message
//     });
//   }
// };
// export { NotificationService };




// import Notification from '../models/Notification.js';
// import User from '../models/User.js';
// import Booking from '../models/Booking.js';
// import Property from '../models/Property.js';
// import Admin from '../models/Admin.js';

// // Enhanced Notification service class
// class NotificationService {
//   // Create notification
//   static async createNotification(notificationData) {
//     try {
//       console.log('📧 Creating notification:', {
//         type: notificationData.type,
//         title: notificationData.title,
//         userId: notificationData.userId,
//         clientId: notificationData.clientId,
//         adminId: notificationData.adminId
//       });
      
//       const notification = new Notification(notificationData);
//       await notification.save();
      
//       console.log('✅ Notification created successfully:', notification._id);
//       return notification;
//     } catch (error) {
//       console.error('❌ Error creating notification:', error);
//       throw error;
//     }
//   }

//   // Create admin notification - FIXED VERSION
//   static async createAdminNotification(type, title, message, metadata = {}) {
//     try {
//       const adminNotification = {
//         adminId: 'admin', // Use 'admin' consistently
//         type: type,
//         title: title,
//         message: message,
//         priority: 'high',
//         metadata: metadata,
//         isRead: false
//       };

//       console.log('📧 Creating admin notification:', adminNotification);
      
//       const notification = new Notification(adminNotification);
//       await notification.save();
      
//       console.log('✅ Admin notification created successfully:', notification._id);
//       return notification;
//     } catch (error) {
//       console.error('❌ Error creating admin notification:', error);
//       throw error;
//     }
//   }

//   // Create property notification for both client and admin
//   static async createPropertyNotification(property, action, additionalData = {}) {
//     try {
//       const notifications = [];
      
//       // Get client user details
//       const clientUser = await User.findOne({ clientId: property.clientId });
      
//       // Client notification
//       if (clientUser) {
//         const clientNotification = {
//           userId: clientUser._id,
//           clientId: property.clientId,
//           propertyId: property._id,
//           type: `property_${action}`,
//           title: this.getNotificationTitle(`property_${action}`, 'client'),
//           message: this.getNotificationMessage(`property_${action}`, 'client', {
//             propertyName: property.name,
//             clientId: property.clientId,
//             ...additionalData
//           }),
//           priority: action === 'approved' ? 'high' : 'medium',
//           metadata: {
//             propertyId: property._id,
//             propertyName: property.name,
//             clientId: property.clientId,
//             action: action,
//             ...additionalData
//           }
//         };
//         notifications.push(clientNotification);
//       }

//       // Admin notification
//       const adminNotification = {
//         adminId: 'admin', // Consistent adminId
//         propertyId: property._id,
//         type: `property_${action}`,
//         title: this.getNotificationTitle(`property_${action}`, 'admin'),
//         message: this.getNotificationMessage(`property_${action}`, 'admin', {
//           propertyName: property.name,
//           clientId: property.clientId,
//           ...additionalData
//         }),
//         priority: 'high',
//         metadata: {
//           propertyId: property._id,
//           propertyName: property.name,
//           clientId: property.clientId,
//           action: action,
//           ...additionalData
//         }
//       };
//       notifications.push(adminNotification);

//       // Create all notifications
//       const createdNotifications = await Notification.insertMany(notifications);
//       console.log(`✅ Created ${createdNotifications.length} notifications for property ${action}`);
      
//       return createdNotifications;
//     } catch (error) {
//       console.error('❌ Error creating property notifications:', error);
//       throw error;
//     }
//   }

//   static getNotificationTitle(type, recipient) {
//     const titles = {
//       property_submitted: {
//         client: 'Property Submitted Successfully',
//         admin: 'New Property Submitted for Approval'
//       },
//       property_approved: {
//         client: 'Property Approved!',
//         admin: 'Property Approved'
//       },
//       property_rejected: {
//         client: 'Property Rejected',
//         admin: 'Property Rejected'
//       },
//       property_revision_requested: {
//         client: 'Revision Requested for Property',
//         admin: 'Revision Requested for Property'
//       },
//       property_deleted: {
//         client: 'Property Deleted',
//         admin: 'Property Deleted'
//       },
//       booking_created: {
//         user: 'Booking Submitted',
//         client: 'New Booking Request',
//         admin: 'New Booking Submitted'
//       },
//       booking_approved: {
//         user: 'Booking Approved!',
//         client: 'Booking Approved',
//         admin: 'Booking Approved'
//       },
//       booking_rejected: {
//         user: 'Booking Declined',
//         client: 'Booking Rejected',
//         admin: 'Booking Rejected'
//       }
//     };
//     return titles[type]?.[recipient] || 'Notification';
//   }

//   static getNotificationMessage(type, recipient, data) {
//     const messages = {
//       property_submitted: {
//         client: `Your property "${data.propertyName}" has been submitted for admin approval.`,
//         admin: `New property "${data.propertyName}" has been submitted by client ${data.clientId}. Please review and approve.`
//       },
//       property_approved: {
//         client: `Congratulations! Your property "${data.propertyName}" has been approved and is now live on the platform.`,
//         admin: `Property "${data.propertyName}" has been approved and is now live.`
//       },
//       property_rejected: {
//         client: `Your property "${data.propertyName}" was rejected. Reason: ${data.rejectionReason}`,
//         admin: `Property "${data.propertyName}" has been rejected. Reason: ${data.rejectionReason}`
//       },
//       property_revision_requested: {
//         client: `Revision requested for your property "${data.propertyName}". Notes: ${data.revisionNotes}`,
//         admin: `Revision requested for property "${data.propertyName}". Notes: ${data.revisionNotes}`
//       },
//       property_deleted: {
//         client: `Your property "${data.propertyName}" has been deleted successfully.`,
//         admin: `Property "${data.propertyName}" has been deleted by client ${data.clientId}.`
//       },
//       booking_created: {
//         user: `Your booking for ${data.propertyName} has been submitted and is under review.`,
//         client: `New booking request for ${data.propertyName} from ${data.userName}.`,
//         admin: `A new booking has been submitted for ${data.propertyName}.`
//       }
//     };
//     return messages[type]?.[recipient] || 'You have a new notification.';
//   }
// }

// // Get admin notifications - COMPLETELY FIXED VERSION
// export const getAdminNotifications = async (req, res) => {
//   try {
//     console.log('🔔 Admin notification request received');
//     console.log('User role:', req.user?.role);
//     console.log('User ID:', req.user?.id);
    
//     // Check if user is admin
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied. Admin role required.'
//       });
//     }

//     const { page = 1, limit = 50, unreadOnly = false, type } = req.query;

//     // SIMPLE QUERY: Get all notifications with adminId field
//     const query = { 
//       adminId: { $exists: true } // This will match any document that has adminId field
//     };
    
//     if (unreadOnly === 'true') {
//       query.isRead = false;
//     }
    
//     if (type) {
//       query.type = type;
//     }

//     console.log('📋 Admin notification query:', JSON.stringify(query, null, 2));

//     // First, let's check what notifications exist in the database
//     const allAdminNotifications = await Notification.find({ adminId: { $exists: true } })
//       .select('type title adminId createdAt')
//       .sort({ createdAt: -1 })
//       .limit(10)
//       .lean();

//     console.log('📊 Existing admin notifications in DB:', allAdminNotifications);

//     const notifications = await Notification.find(query)
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .populate('propertyId', 'name locality city')
//       .populate('bookingId', 'bookingStatus totalAmount')
//       .populate('userId', 'name email phone');

//     const total = await Notification.countDocuments(query);
//     const unreadCount = await Notification.countDocuments({ 
//       ...query, 
//       isRead: false 
//     });

//     console.log(`✅ Found ${notifications.length} admin notifications out of ${total} total`);

//     res.status(200).json({
//       success: true,
//       data: {
//         notifications,
//         totalPages: Math.ceil(total / limit),
//         currentPage: parseInt(page),
//         total,
//         unreadCount,
//         debug: {
//           queryUsed: query,
//           sampleNotifications: allAdminNotifications
//         }
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get admin notifications error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch admin notifications',
//       error: error.message
//     });
//   }
// };

// // Get client notifications
// export const getClientNotifications = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId);
    
//     console.log('👤 Client notification request from user:', {
//       userId,
//       role: user?.role,
//       clientId: user?.clientId
//     });

//     if (!user || user.role !== 'client') {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied. Client role required.'
//       });
//     }

//     const clientId = user.clientId;
//     const { page = 1, limit = 20, unreadOnly = false } = req.query;

//     const query = { 
//       $or: [
//         { clientId: clientId },
//         { userId: userId }
//       ]
//     };
    
//     if (unreadOnly === 'true') {
//       query.isRead = false;
//     }

//     console.log('🔍 Query for client notifications:', query);

//     const notifications = await Notification.find(query)
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .populate('propertyId', 'name locality')
//       .populate('bookingId', 'bookingStatus')
//       .populate('userId', 'name phone');

//     const total = await Notification.countDocuments(query);
//     const unreadCount = await Notification.countDocuments({ 
//       $or: [
//         { clientId: clientId, isRead: false },
//         { userId: userId, isRead: false }
//       ]
//     });

//     console.log(`✅ Found ${notifications.length} client notifications`);

//     res.status(200).json({
//       success: true,
//       data: {
//         notifications,
//         totalPages: Math.ceil(total / limit),
//         currentPage: parseInt(page),
//         total,
//         unreadCount
//       }
//     });
//   } catch (error) {
//     console.error('❌ Get client notifications error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch notifications',
//       error: error.message
//     });
//   }
// };

// // Get user notifications
// export const getUserNotifications = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { page = 1, limit = 20, unreadOnly = false } = req.query;

//     const query = { userId };
//     if (unreadOnly === 'true') {
//       query.isRead = false;
//     }

//     const notifications = await Notification.find(query)
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .populate('propertyId', 'name locality')
//       .populate('bookingId', 'bookingStatus');

//     const total = await Notification.countDocuments(query);
//     const unreadCount = await Notification.countDocuments({ userId, isRead: false });

//     res.status(200).json({
//       success: true,
//       data: {
//         notifications,
//         totalPages: Math.ceil(total / limit),
//         currentPage: parseInt(page),
//         total,
//         unreadCount
//       }
//     });
//   } catch (error) {
//     console.error('Get user notifications error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch notifications',
//       error: error.message
//     });
//   }
// };

// // Mark as read
// export const markAsRead = async (req, res) => {
//   try {
//     const { notificationId } = req.params;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     let query = { _id: notificationId };
    
//     if (userRole === 'admin') {
//       query.adminId = { $exists: true };
//     } else if (userRole === 'client') {
//       const user = await User.findById(userId);
//       query.$or = [
//         { _id: notificationId, clientId: user.clientId },
//         { _id: notificationId, userId: userId }
//       ];
//     } else {
//       query.userId = userId;
//     }

//     const notification = await Notification.findOneAndUpdate(
//       query,
//       { isRead: true },
//       { new: true }
//     );

//     if (!notification) {
//       return res.status(404).json({
//         success: false,
//         message: 'Notification not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Notification marked as read',
//       data: notification
//     });
//   } catch (error) {
//     console.error('Mark as read error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to mark notification as read',
//       error: error.message
//     });
//   }
// };

// // Mark all as read
// export const markAllAsRead = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     let query = {};
    
//     if (userRole === 'admin') {
//       query = { adminId: { $exists: true } };
//     } else if (userRole === 'client') {
//       const user = await User.findById(userId);
//       query = { 
//         $or: [
//           { clientId: user.clientId },
//           { userId: userId }
//         ]
//       };
//     } else {
//       query = { userId };
//     }

//     const result = await Notification.updateMany(
//       query,
//       { isRead: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: `All notifications marked as read. Updated ${result.modifiedCount} notifications.`
//     });
//   } catch (error) {
//     console.error('Mark all as read error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to mark all notifications as read',
//       error: error.message
//     });
//   }
// };

// // Get unread count
// export const getUnreadCount = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     let query = { isRead: false };
    
//     if (userRole === 'admin') {
//       query.adminId = { $exists: true };
//     } else if (userRole === 'client') {
//       const user = await User.findById(userId);
//       query.$or = [
//         { clientId: user.clientId },
//         { userId: userId }
//       ];
//     } else {
//       query.userId = userId;
//     }

//     const unreadCount = await Notification.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       data: { unreadCount }
//     });
//   } catch (error) {
//     console.error('Get unread count error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get unread count',
//       error: error.message
//     });
//   }
// };

// // Delete notification
// export const deleteNotification = async (req, res) => {
//   try {
//     const { notificationId } = req.params;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     let query = { _id: notificationId };
    
//     if (userRole === 'admin') {
//       query.adminId = { $exists: true };
//     } else if (userRole === 'client') {
//       const user = await User.findById(userId);
//       query.$or = [
//         { _id: notificationId, clientId: user.clientId },
//         { _id: notificationId, userId: userId }
//       ];
//     } else {
//       query.userId = userId;
//     }

//     const notification = await Notification.findOneAndDelete(query);

//     if (!notification) {
//       return res.status(404).json({
//         success: false,
//         message: 'Notification not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Notification deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete notification error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete notification',
//       error: error.message
//     });
//   }
// };

// // Debug endpoint to check all notifications
// export const getAllNotificationsDebug = async (req, res) => {
//   try {
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied. Admin role required.'
//       });
//     }

//     const allNotifications = await Notification.find({})
//       .sort({ createdAt: -1 })
//       .populate('propertyId', 'name')
//       .populate('userId', 'name')
//       .lean();

//     const adminNotifications = allNotifications.filter(n => n.adminId);
//     const clientNotifications = allNotifications.filter(n => n.clientId);
//     const userNotifications = allNotifications.filter(n => n.userId && !n.clientId);

//     res.status(200).json({
//       success: true,
//       data: {
//         total: allNotifications.length,
//         admin: {
//           count: adminNotifications.length,
//           notifications: adminNotifications.slice(0, 10)
//         },
//         client: {
//           count: clientNotifications.length,
//           notifications: clientNotifications.slice(0, 10)
//         },
//         user: {
//           count: userNotifications.length,
//           notifications: userNotifications.slice(0, 10)
//         },
//         allNotifications: allNotifications.slice(0, 20)
//       }
//     });
//   } catch (error) {
//     console.error('Debug notifications error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch debug notifications',
//       error: error.message
//     });
//   }
// };

// // Create test notification for admin
// export const createTestAdminNotification = async (req, res) => {
//   try {
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied. Admin role required.'
//       });
//     }

//     const testNotification = {
//       adminId: 'admin',
//       type: 'property_submitted',
//       title: 'Test Admin Notification',
//       message: 'This is a test notification for admin',
//       priority: 'high',
//       metadata: {
//         test: true,
//         timestamp: new Date().toISOString()
//       },
//       isRead: false
//     };

//     const notification = await NotificationService.createNotification(testNotification);

//     res.status(200).json({
//       success: true,
//       message: 'Test notification created successfully',
//       data: notification
//     });
//   } catch (error) {
//     console.error('Create test notification error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create test notification',
//       error: error.message
//     });
//   }
// };

// export { NotificationService };






// import Notification from '../models/Notification.js';
// import User from '../models/User.js';
// import Booking from '../models/Booking.js';
// import Property from '../models/Property.js';
// import Admin from '../models/Admin.js';

// // Enhanced Notification service class
// class NotificationService {
//   // Create notification
//   static async createNotification(notificationData) {
//     try {
//       console.log('📧 Creating notification:', {
//         type: notificationData.type,
//         title: notificationData.title,
//         userId: notificationData.userId,
//         clientId: notificationData.clientId,
//         adminId: notificationData.adminId
//       });
      
//       const notification = new Notification(notificationData);
//       await notification.save();
      
//       console.log('✅ Notification created successfully:', notification._id);
//       return notification;
//     } catch (error) {
//       console.error('❌ Error creating notification:', error);
//       throw error;
//     }
//   }

//   // Create admin notification - FIXED VERSION
//   static async createAdminNotification(type, title, message, metadata = {}) {
//     try {
//       const adminNotification = {
//         adminId: 'admin', // Use 'admin' consistently
//         type: type,
//         title: title,
//         message: message,
//         priority: 'high',
//         metadata: metadata,
//         isRead: false
//       };

//       console.log('📧 Creating admin notification:', adminNotification);
      
//       const notification = new Notification(adminNotification);
//       await notification.save();
      
//       console.log('✅ Admin notification created successfully:', notification._id);
//       return notification;
//     } catch (error) {
//       console.error('❌ Error creating admin notification:', error);
//       throw error;
//     }
//   }

//   // Create user notification
//   static async createUserNotification(userId, type, title, message, metadata = {}) {
//     try {
//       const userNotification = {
//         userId: userId,
//         type: type,
//         title: title,
//         message: message,
//         priority: 'medium',
//         metadata: metadata,
//         isRead: false
//       };

//       console.log('📧 Creating user notification:', userNotification);
      
//       const notification = new Notification(userNotification);
//       await notification.save();
      
//       console.log('✅ User notification created successfully:', notification._id);
//       return notification;
//     } catch (error) {
//       console.error('❌ Error creating user notification:', error);
//       throw error;
//     }
//   }

//   // Create property notification for both client and admin
//   static async createPropertyNotification(property, action, additionalData = {}) {
//     try {
//       const notifications = [];
      
//       // Get client user details
//       const clientUser = await User.findOne({ clientId: property.clientId });
      
//       // Client notification
//       if (clientUser) {
//         const clientNotification = {
//           userId: clientUser._id,
//           clientId: property.clientId,
//           propertyId: property._id,
//           type: `property_${action}`,
//           title: this.getNotificationTitle(`property_${action}`, 'client'),
//           message: this.getNotificationMessage(`property_${action}`, 'client', {
//             propertyName: property.name,
//             clientId: property.clientId,
//             ...additionalData
//           }),
//           priority: action === 'approved' ? 'high' : 'medium',
//           metadata: {
//             propertyId: property._id,
//             propertyName: property.name,
//             clientId: property.clientId,
//             action: action,
//             ...additionalData
//           }
//         };
//         notifications.push(clientNotification);
//       }

//       // Admin notification
//       const adminNotification = {
//         adminId: 'admin', // Consistent adminId
//         propertyId: property._id,
//         type: `property_${action}`,
//         title: this.getNotificationTitle(`property_${action}`, 'admin'),
//         message: this.getNotificationMessage(`property_${action}`, 'admin', {
//           propertyName: property.name,
//           clientId: property.clientId,
//           ...additionalData
//         }),
//         priority: 'high',
//         metadata: {
//           propertyId: property._id,
//           propertyName: property.name,
//           clientId: property.clientId,
//           action: action,
//           ...additionalData
//         }
//       };
//       notifications.push(adminNotification);

//       // Create all notifications
//       const createdNotifications = await Notification.insertMany(notifications);
//       console.log(`✅ Created ${createdNotifications.length} notifications for property ${action}`);
      
//       return createdNotifications;
//     } catch (error) {
//       console.error('❌ Error creating property notifications:', error);
//       throw error;
//     }
//   }

//   // Create booking notification for user, client, and admin
//   static async createBookingNotification(booking, action, additionalData = {}) {
//     try {
//       const notifications = [];
//       const property = await Property.findById(booking.propertyId);
      
//       if (!property) {
//         throw new Error('Property not found for booking notification');
//       }

//       // User notification
//       const userNotification = {
//         userId: booking.userId,
//         clientId: booking.clientId,
//         bookingId: booking._id,
//         propertyId: booking.propertyId,
//         type: `booking_${action}`,
//         title: this.getNotificationTitle(`booking_${action}`, 'user'),
//         message: this.getNotificationMessage(`booking_${action}`, 'user', {
//           propertyName: property.name,
//           bookingId: booking._id,
//           ...additionalData
//         }),
//         priority: action === 'approved' ? 'high' : 'medium',
//         metadata: {
//           bookingId: booking._id,
//           propertyId: booking.propertyId,
//           propertyName: property.name,
//           action: action,
//           ...additionalData
//         }
//       };
//       notifications.push(userNotification);

//       // Client notification (if client exists)
//       if (property.clientId) {
//         const clientUser = await User.findOne({ clientId: property.clientId });
//         if (clientUser) {
//           const clientNotification = {
//             userId: clientUser._id,
//             clientId: property.clientId,
//             bookingId: booking._id,
//             propertyId: booking.propertyId,
//             type: `booking_${action}`,
//             title: this.getNotificationTitle(`booking_${action}`, 'client'),
//             message: this.getNotificationMessage(`booking_${action}`, 'client', {
//               propertyName: property.name,
//               bookingId: booking._id,
//               ...additionalData
//             }),
//             priority: 'medium',
//             metadata: {
//               bookingId: booking._id,
//               propertyId: booking.propertyId,
//               propertyName: property.name,
//               action: action,
//               ...additionalData
//             }
//           };
//           notifications.push(clientNotification);
//         }
//       }

//       // Admin notification
//       const adminNotification = {
//         adminId: 'admin',
//         bookingId: booking._id,
//         propertyId: booking.propertyId,
//         type: `booking_${action}`,
//         title: this.getNotificationTitle(`booking_${action}`, 'admin'),
//         message: this.getNotificationMessage(`booking_${action}`, 'admin', {
//           propertyName: property.name,
//           bookingId: booking._id,
//           ...additionalData
//         }),
//         priority: 'medium',
//         metadata: {
//           bookingId: booking._id,
//           propertyId: booking.propertyId,
//           propertyName: property.name,
//           action: action,
//           ...additionalData
//         }
//       };
//       notifications.push(adminNotification);

//       // Create all notifications
//       const createdNotifications = await Notification.insertMany(notifications);
//       console.log(`✅ Created ${createdNotifications.length} notifications for booking ${action}`);
      
//       return createdNotifications;
//     } catch (error) {
//       console.error('❌ Error creating booking notifications:', error);
//       throw error;
//     }
//   }

//   static getNotificationTitle(type, recipient) {
//     const titles = {
//       property_submitted: {
//         client: 'Property Submitted Successfully',
//         admin: 'New Property Submitted for Approval'
//       },
//       property_approved: {
//         client: 'Property Approved!',
//         admin: 'Property Approved'
//       },
//       property_rejected: {
//         client: 'Property Rejected',
//         admin: 'Property Rejected'
//       },
//       property_revision_requested: {
//         client: 'Revision Requested for Property',
//         admin: 'Revision Requested for Property'
//       },
//       property_deleted: {
//         client: 'Property Deleted',
//         admin: 'Property Deleted'
//       },
//       booking_created: {
//         user: 'Booking Submitted',
//         client: 'New Booking Request',
//         admin: 'New Booking Submitted'
//       },
//       booking_approved: {
//         user: 'Booking Approved!',
//         client: 'Booking Approved',
//         admin: 'Booking Approved'
//       },
//       booking_rejected: {
//         user: 'Booking Declined',
//         client: 'Booking Rejected',
//         admin: 'Booking Rejected'
//       },
//       booking_cancelled: {
//         user: 'Booking Cancelled',
//         client: 'Booking Cancelled',
//         admin: 'Booking Cancelled'
//       },
//       payment_received: {
//         user: 'Payment Received',
//         client: 'Payment Received',
//         admin: 'Payment Received'
//       },
//       payment_failed: {
//         user: 'Payment Failed',
//         client: 'Payment Failed',
//         admin: 'Payment Failed'
//       }
//     };
//     return titles[type]?.[recipient] || 'Notification';
//   }

//   static getNotificationMessage(type, recipient, data) {
//     const messages = {
//       property_submitted: {
//         client: `Your property "${data.propertyName}" has been submitted for admin approval.`,
//         admin: `New property "${data.propertyName}" has been submitted by client ${data.clientId}. Please review and approve.`
//       },
//       property_approved: {
//         client: `Congratulations! Your property "${data.propertyName}" has been approved and is now live on the platform.`,
//         admin: `Property "${data.propertyName}" has been approved and is now live.`
//       },
//       property_rejected: {
//         client: `Your property "${data.propertyName}" was rejected. Reason: ${data.rejectionReason}`,
//         admin: `Property "${data.propertyName}" has been rejected. Reason: ${data.rejectionReason}`
//       },
//       property_revision_requested: {
//         client: `Revision requested for your property "${data.propertyName}". Notes: ${data.revisionNotes}`,
//         admin: `Revision requested for property "${data.propertyName}". Notes: ${data.revisionNotes}`
//       },
//       property_deleted: {
//         client: `Your property "${data.propertyName}" has been deleted successfully.`,
//         admin: `Property "${data.propertyName}" has been deleted by client ${data.clientId}.`
//       },
//       booking_created: {
//         user: `Your booking for ${data.propertyName} has been submitted and is under review.`,
//         client: `New booking request for ${data.propertyName} from user.`,
//         admin: `A new booking has been submitted for ${data.propertyName}.`
//       },
//       booking_approved: {
//         user: `Your booking for ${data.propertyName} has been approved! You can now proceed with payment.`,
//         client: `Booking for ${data.propertyName} has been approved.`,
//         admin: `Booking for ${data.propertyName} has been approved.`
//       },
//       booking_rejected: {
//         user: `Your booking for ${data.propertyName} has been declined.`,
//         client: `Booking for ${data.propertyName} has been rejected.`,
//         admin: `Booking for ${data.propertyName} has been rejected.`
//       },
//       booking_cancelled: {
//         user: `Your booking for ${data.propertyName} has been cancelled.`,
//         client: `Booking for ${data.propertyName} has been cancelled.`,
//         admin: `Booking for ${data.propertyName} has been cancelled.`
//       }
//     };
//     return messages[type]?.[recipient] || 'You have a new notification.';
//   }
// }

// // Get admin notifications - COMPLETELY FIXED VERSION
// export const getAdminNotifications = async (req, res) => {
//   try {
//     console.log('🔔 Admin notification request received');
//     console.log('User role:', req.user?.role);
//     console.log('User ID:', req.user?.id);
    
//     // Check if user is admin
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied. Admin role required.'
//       });
//     }

//     const { page = 1, limit = 50, unreadOnly = false, type } = req.query;

//     // SIMPLE QUERY: Get all notifications with adminId field
//     const query = { 
//       adminId: { $exists: true } // This will match any document that has adminId field
//     };
    
//     if (unreadOnly === 'true') {
//       query.isRead = false;
//     }
    
//     if (type) {
//       query.type = type;
//     }

//     console.log('📋 Admin notification query:', JSON.stringify(query, null, 2));

//     // First, let's check what notifications exist in the database
//     const allAdminNotifications = await Notification.find({ adminId: { $exists: true } })
//       .select('type title adminId createdAt')
//       .sort({ createdAt: -1 })
//       .limit(10)
//       .lean();

//     console.log('📊 Existing admin notifications in DB:', allAdminNotifications);

//     const notifications = await Notification.find(query)
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .populate('propertyId', 'name locality city')
//       .populate('bookingId', 'bookingStatus totalAmount')
//       .populate('userId', 'name email phone');

//     const total = await Notification.countDocuments(query);
//     const unreadCount = await Notification.countDocuments({ 
//       ...query, 
//       isRead: false 
//     });

//     console.log(`✅ Found ${notifications.length} admin notifications out of ${total} total`);

//     res.status(200).json({
//       success: true,
//       data: {
//         notifications,
//         totalPages: Math.ceil(total / limit),
//         currentPage: parseInt(page),
//         total,
//         unreadCount,
//         debug: {
//           queryUsed: query,
//           sampleNotifications: allAdminNotifications
//         }
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get admin notifications error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch admin notifications',
//       error: error.message
//     });
//   }
// };

// // Get client notifications
// export const getClientNotifications = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId);
    
//     console.log('👤 Client notification request from user:', {
//       userId,
//       role: user?.role,
//       clientId: user?.clientId
//     });

//     if (!user || user.role !== 'client') {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied. Client role required.'
//       });
//     }

//     const clientId = user.clientId;
//     const { page = 1, limit = 20, unreadOnly = false } = req.query;

//     const query = { 
//       $or: [
//         { clientId: clientId },
//         { userId: userId }
//       ]
//     };
    
//     if (unreadOnly === 'true') {
//       query.isRead = false;
//     }

//     console.log('🔍 Query for client notifications:', query);

//     const notifications = await Notification.find(query)
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .populate('propertyId', 'name locality')
//       .populate('bookingId', 'bookingStatus')
//       .populate('userId', 'name phone');

//     const total = await Notification.countDocuments(query);
//     const unreadCount = await Notification.countDocuments({ 
//       $or: [
//         { clientId: clientId, isRead: false },
//         { userId: userId, isRead: false }
//       ]
//     });

//     console.log(`✅ Found ${notifications.length} client notifications`);

//     res.status(200).json({
//       success: true,
//       data: {
//         notifications,
//         totalPages: Math.ceil(total / limit),
//         currentPage: parseInt(page),
//         total,
//         unreadCount
//       }
//     });
//   } catch (error) {
//     console.error('❌ Get client notifications error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch notifications',
//       error: error.message
//     });
//   }
// };

// // Get user notifications - ENHANCED VERSION
// export const getUserNotifications = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userRole = req.user.role;
    
//     console.log('👤 User notification request:', {
//       userId,
//       userRole,
//       query: req.query
//     });

//     // Validate user role but don't block if role is unexpected
//     if (userRole !== 'user' && userRole !== 'customer' && userRole !== 'tenant') {
//       console.log('⚠️ User role might not match expected types:', userRole);
//       // Don't return error, just log and proceed
//     }

//     const { page = 1, limit = 20, unreadOnly = false, type } = req.query;

//     // Build query - include both userId and check for user-specific notifications
//     const query = { 
//       $or: [
//         { userId: userId },
//         // Add any other user-specific criteria here
//       ]
//     };
    
//     if (unreadOnly === 'true') {
//       query.isRead = false;
//     }
    
//     if (type) {
//       query.type = type;
//     }

//     console.log('🔍 User notification query:', query);

//     const notifications = await Notification.find(query)
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .populate('propertyId', 'name locality city images')
//       .populate('bookingId', 'bookingStatus totalAmount checkInDate checkOutDate')
//       .lean(); // Use lean() for better performance

//     const total = await Notification.countDocuments(query);
//     const unreadCount = await Notification.countDocuments({ 
//       ...query, 
//       isRead: false 
//     });

//     console.log(`✅ Found ${notifications.length} user notifications for user ${userId}`);

//     res.status(200).json({
//       success: true,
//       data: {
//         notifications,
//         totalPages: Math.ceil(total / limit),
//         currentPage: parseInt(page),
//         total,
//         unreadCount,
//         userInfo: {
//           userId,
//           role: userRole
//         }
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get user notifications error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch user notifications',
//       error: error.message,
//       userInfo: {
//         userId: req.user?.id,
//         role: req.user?.role
//       }
//     });
//   }
// };

// // Debug endpoint for user notifications
// export const getUserNotificationsDebug = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     console.log('🐛 User notifications debug for user:', userId);
    
//     // Get all user notifications without filters
//     const allUserNotifications = await Notification.find({ userId })
//       .sort({ createdAt: -1 })
//       .populate('propertyId', 'name')
//       .populate('bookingId', 'bookingStatus')
//       .lean();

//     // Check database for any notifications with this user ID
//     const notificationCount = await Notification.countDocuments({ userId });
    
//     // Check user details
//     const user = await User.findById(userId).select('name email role');
    
//     console.log(`📊 Debug - Found ${notificationCount} total notifications for user ${userId}`);

//     res.status(200).json({
//       success: true,
//       data: {
//         userId,
//         userDetails: user,
//         totalNotifications: notificationCount,
//         notifications: allUserNotifications,
//         userInfo: req.user
//       }
//     });
//   } catch (error) {
//     console.error('❌ User notifications debug error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Debug failed',
//       error: error.message
//     });
//   }
// };

// // Mark as read
// export const markAsRead = async (req, res) => {
//   try {
//     const { notificationId } = req.params;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     let query = { _id: notificationId };
    
//     if (userRole === 'admin') {
//       query.adminId = { $exists: true };
//     } else if (userRole === 'client') {
//       const user = await User.findById(userId);
//       query.$or = [
//         { _id: notificationId, clientId: user.clientId },
//         { _id: notificationId, userId: userId }
//       ];
//     } else {
//       query.userId = userId;
//     }

//     const notification = await Notification.findOneAndUpdate(
//       query,
//       { isRead: true },
//       { new: true }
//     );

//     if (!notification) {
//       return res.status(404).json({
//         success: false,
//         message: 'Notification not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Notification marked as read',
//       data: notification
//     });
//   } catch (error) {
//     console.error('Mark as read error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to mark notification as read',
//       error: error.message
//     });
//   }
// };

// // Mark all as read
// export const markAllAsRead = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     let query = {};
    
//     if (userRole === 'admin') {
//       query = { adminId: { $exists: true } };
//     } else if (userRole === 'client') {
//       const user = await User.findById(userId);
//       query = { 
//         $or: [
//           { clientId: user.clientId },
//           { userId: userId }
//         ]
//       };
//     } else {
//       query = { userId };
//     }

//     const result = await Notification.updateMany(
//       query,
//       { isRead: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: `All notifications marked as read. Updated ${result.modifiedCount} notifications.`
//     });
//   } catch (error) {
//     console.error('Mark all as read error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to mark all notifications as read',
//       error: error.message
//     });
//   }
// };

// // Get unread count
// export const getUnreadCount = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     let query = { isRead: false };
    
//     if (userRole === 'admin') {
//       query.adminId = { $exists: true };
//     } else if (userRole === 'client') {
//       const user = await User.findById(userId);
//       query.$or = [
//         { clientId: user.clientId },
//         { userId: userId }
//       ];
//     } else {
//       query.userId = userId;
//     }

//     const unreadCount = await Notification.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       data: { unreadCount }
//     });
//   } catch (error) {
//     console.error('Get unread count error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get unread count',
//       error: error.message
//     });
//   }
// };

// // Delete notification
// export const deleteNotification = async (req, res) => {
//   try {
//     const { notificationId } = req.params;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     let query = { _id: notificationId };
    
//     if (userRole === 'admin') {
//       query.adminId = { $exists: true };
//     } else if (userRole === 'client') {
//       const user = await User.findById(userId);
//       query.$or = [
//         { _id: notificationId, clientId: user.clientId },
//         { _id: notificationId, userId: userId }
//       ];
//     } else {
//       query.userId = userId;
//     }

//     const notification = await Notification.findOneAndDelete(query);

//     if (!notification) {
//       return res.status(404).json({
//         success: false,
//         message: 'Notification not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Notification deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete notification error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete notification',
//       error: error.message
//     });
//   }
// };

// // Debug endpoint to check all notifications
// export const getAllNotificationsDebug = async (req, res) => {
//   try {
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied. Admin role required.'
//       });
//     }

//     const allNotifications = await Notification.find({})
//       .sort({ createdAt: -1 })
//       .populate('propertyId', 'name')
//       .populate('userId', 'name')
//       .lean();

//     const adminNotifications = allNotifications.filter(n => n.adminId);
//     const clientNotifications = allNotifications.filter(n => n.clientId);
//     const userNotifications = allNotifications.filter(n => n.userId && !n.clientId);

//     res.status(200).json({
//       success: true,
//       data: {
//         total: allNotifications.length,
//         admin: {
//           count: adminNotifications.length,
//           notifications: adminNotifications.slice(0, 10)
//         },
//         client: {
//           count: clientNotifications.length,
//           notifications: clientNotifications.slice(0, 10)
//         },
//         user: {
//           count: userNotifications.length,
//           notifications: userNotifications.slice(0, 10)
//         },
//         allNotifications: allNotifications.slice(0, 20)
//       }
//     });
//   } catch (error) {
//     console.error('Debug notifications error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch debug notifications',
//       error: error.message
//     });
//   }
// };

// // Create test notification for admin
// export const createTestAdminNotification = async (req, res) => {
//   try {
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied. Admin role required.'
//       });
//     }

//     const testNotification = {
//       adminId: 'admin',
//       type: 'property_submitted',
//       title: 'Test Admin Notification',
//       message: 'This is a test notification for admin',
//       priority: 'high',
//       metadata: {
//         test: true,
//         timestamp: new Date().toISOString()
//       },
//       isRead: false
//     };

//     const notification = await NotificationService.createNotification(testNotification);

//     res.status(200).json({
//       success: true,
//       message: 'Test notification created successfully',
//       data: notification
//     });
//   } catch (error) {
//     console.error('Create test notification error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create test notification',
//       error: error.message
//     });
//   }
// };

// export { NotificationService };



//testing notification
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Property from '../models/Property.js';

// Enhanced Notification service class
class NotificationService {
  // Create notification
  static async createNotification(notificationData) {
    try {
      console.log('📧 Creating notification:', {
        type: notificationData.type,
        title: notificationData.title,
        userId: notificationData.userId,
        clientId: notificationData.clientId,
        adminId: notificationData.adminId
      });
      
      const notification = new Notification(notificationData);
      await notification.save();
      
      console.log('✅ Notification created successfully:', notification._id);
      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  // Create payment notification for user, client, and admin
  static async createPaymentNotification(userId, paymentType, amount, bookingId, metadata = {}) {
    try {
      const notifications = [];
      
      // Get user and booking details
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const booking = await Booking.findById(bookingId).populate('propertyId');
      if (!booking) {
        throw new Error('Booking not found');
      }

      const property = booking.propertyId;

      // User notification
      const userNotification = {
        userId: userId,
        type: paymentType,
        title: this.getPaymentTitle(paymentType, 'user'),
        message: this.getPaymentMessage(paymentType, 'user', amount, property?.name),
        priority: paymentType === 'payment_failed' ? 'high' : 'medium',
        metadata: {
          amount: amount,
          bookingId: bookingId,
          propertyId: property?._id,
          propertyName: property?.name,
          paymentType: paymentType,
          timestamp: new Date().toISOString(),
          ...metadata
        },
        isRead: false
      };
      notifications.push(userNotification);

      // Client notification (if property has clientId)
      if (property?.clientId) {
        const clientUser = await User.findOne({ clientId: property.clientId });
        if (clientUser) {
          const clientNotification = {
            userId: clientUser._id,
            clientId: property.clientId,
            type: paymentType,
            title: this.getPaymentTitle(paymentType, 'client'),
            message: this.getPaymentMessage(paymentType, 'client', amount, property.name),
            priority: 'medium',
            metadata: {
              amount: amount,
              bookingId: bookingId,
              propertyId: property._id,
              propertyName: property.name,
              paymentType: paymentType,
              timestamp: new Date().toISOString(),
              ...metadata
            },
            isRead: false
          };
          notifications.push(clientNotification);
        }
      }

      // Admin notification for all payment types
      const adminNotification = {
        adminId: 'admin',
        type: paymentType,
        title: this.getPaymentTitle(paymentType, 'admin'),
        message: this.getPaymentMessage(paymentType, 'admin', amount, property?.name),
        priority: paymentType === 'payment_failed' ? 'high' : 'medium',
        metadata: {
          amount: amount,
          bookingId: bookingId,
          propertyId: property?._id,
          propertyName: property?.name,
          paymentType: paymentType,
          timestamp: new Date().toISOString(),
          ...metadata
        },
        isRead: false
      };
      notifications.push(adminNotification);

      // Create all notifications
      const createdNotifications = await Notification.insertMany(notifications);
      console.log(`💰 Created ${createdNotifications.length} payment notifications for ${paymentType}`);
      return createdNotifications;

    } catch (error) {
      console.error('❌ Error creating payment notification:', error);
      throw error;
    }
  }

  // Create booking notification for user, client, and admin
  static async createBookingNotification(booking, action, additionalData = {}) {
    try {
      const notifications = [];
      
      // Ensure booking is populated with property
      let populatedBooking = booking;
      if (typeof booking.populate === 'function') {
        populatedBooking = await booking.populate('propertyId').populate('userId').execPopulate();
      } else if (!booking.propertyId || typeof booking.propertyId === 'string') {
        populatedBooking = await Booking.findById(booking._id)
          .populate('propertyId')
          .populate('userId');
      }

      const property = populatedBooking.propertyId;
      const user = populatedBooking.userId;

      if (!property) {
        console.error('❌ Property not found for booking notification');
        throw new Error('Property not found for booking notification');
      }

      // User notification
      if (user) {
        const userNotification = {
          userId: user._id,
          bookingId: populatedBooking._id,
          propertyId: property._id,
          type: `booking_${action}`,
          title: this.getBookingTitle(action, 'user'),
          message: this.getBookingMessage(action, 'user', property.name, additionalData),
          priority: this.getBookingPriority(action),
          metadata: {
            bookingId: populatedBooking._id,
            propertyId: property._id,
            propertyName: property.name,
            action: action,
            ...additionalData
          },
          isRead: false
        };
        notifications.push(userNotification);
        console.log(`👤 Created user notification for booking ${action}`);
      }

      // Client notification
      if (property.clientId) {
        const clientUser = await User.findOne({ clientId: property.clientId });
        if (clientUser) {
          const clientNotification = {
            userId: clientUser._id,
            clientId: property.clientId,
            bookingId: populatedBooking._id,
            propertyId: property._id,
            type: `booking_${action}`,
            title: this.getBookingTitle(action, 'client'),
            message: this.getBookingMessage(action, 'client', property.name, additionalData),
            priority: this.getBookingPriority(action),
            metadata: {
              bookingId: populatedBooking._id,
              propertyId: property._id,
              propertyName: property.name,
              action: action,
              ...additionalData
            },
            isRead: false
          };
          notifications.push(clientNotification);
          console.log(`🏢 Created client notification for booking ${action}`);
        }
      }

      // Admin notification
      const adminNotification = {
        adminId: 'admin',
        bookingId: populatedBooking._id,
        propertyId: property._id,
        type: `booking_${action}`,
        title: this.getBookingTitle(action, 'admin'),
        message: this.getBookingMessage(action, 'admin', property.name, additionalData),
        priority: this.getBookingPriority(action),
        metadata: {
          bookingId: populatedBooking._id,
          propertyId: property._id,
          propertyName: property.name,
          action: action,
          ...additionalData
        },
        isRead: false
      };
      notifications.push(adminNotification);
      console.log(`👑 Created admin notification for booking ${action}`);

      // Create all notifications
      if (notifications.length > 0) {
        const createdNotifications = await Notification.insertMany(notifications);
        console.log(`✅ Created ${createdNotifications.length} notifications for booking ${action}`);
        return createdNotifications;
      } else {
        console.log('⚠️ No notifications created for booking');
        return [];
      }
    } catch (error) {
      console.error('❌ Error creating booking notifications:', error);
      throw error;
    }
  }

  // Create property notification for both client and admin
  static async createPropertyNotification(property, action, additionalData = {}) {
    try {
      const notifications = [];
      
      // Get client user details
      const clientUser = await User.findOne({ clientId: property.clientId });
      
      // Client notification
      if (clientUser) {
        const clientNotification = {
          userId: clientUser._id,
          clientId: property.clientId,
          propertyId: property._id,
          type: `property_${action}`,
          title: this.getPropertyTitle(action, 'client'),
          message: this.getPropertyMessage(action, 'client', property.name, additionalData),
          priority: action === 'approved' ? 'high' : 'medium',
          metadata: {
            propertyId: property._id,
            propertyName: property.name,
            clientId: property.clientId,
            action: action,
            ...additionalData
          }
        };
        notifications.push(clientNotification);
      }

      // Admin notification
      const adminNotification = {
        adminId: 'admin',
        propertyId: property._id,
        type: `property_${action}`,
        title: this.getPropertyTitle(action, 'admin'),
        message: this.getPropertyMessage(action, 'admin', property.name, additionalData),
        priority: 'high',
        metadata: {
          propertyId: property._id,
          propertyName: property.name,
          clientId: property.clientId,
          action: action,
          ...additionalData
        }
      };
      notifications.push(adminNotification);

      // Create all notifications
      const createdNotifications = await Notification.insertMany(notifications);
      console.log(`✅ Created ${createdNotifications.length} notifications for property ${action}`);
      
      return createdNotifications;
    } catch (error) {
      console.error('❌ Error creating property notifications:', error);
      throw error;
    }
  }

  // Helper methods for payment notifications
  static getPaymentTitle(paymentType, recipient) {
    const titles = {
      payment_received: {
        user: 'Payment Received Successfully 💰',
        client: 'Payment Received',
        admin: 'Payment Received'
      },
      payment_failed: {
        user: 'Payment Failed ❌',
        client: 'Payment Failed',
        admin: 'Payment Failed'
      },
      payment_refunded: {
        user: 'Payment Refunded',
        client: 'Payment Refunded',
        admin: 'Payment Refunded'
      },
      booking_paid: {
        user: 'Booking Confirmed! 🎉',
        client: 'Booking Payment Received',
        admin: 'Booking Payment Completed'
      }
    };
    return titles[paymentType]?.[recipient] || 'Payment Notification';
  }

  static getPaymentMessage(paymentType, recipient, amount, propertyName) {
    const messages = {
      payment_received: {
        user: `Your payment of ₹${amount} has been received successfully. Thank you for your payment!`,
        client: `Payment of ₹${amount} has been received for booking at ${propertyName}.`,
        admin: `Payment of ₹${amount} has been received for booking at ${propertyName}.`
      },
      payment_failed: {
        user: `Your payment of ₹${amount} failed. Please try again or contact support if the issue persists.`,
        client: `Payment of ₹${amount} failed for booking at ${propertyName}.`,
        admin: `Payment of ₹${amount} failed for booking at ${propertyName}.`
      },
      payment_refunded: {
        user: `Your payment of ₹${amount} has been refunded successfully.`,
        client: `Payment of ₹${amount} has been refunded for booking at ${propertyName}.`,
        admin: `Payment of ₹${amount} has been refunded for booking at ${propertyName}.`
      },
      booking_paid: {
        user: `Your booking for "${propertyName}" is now confirmed! Payment of ₹${amount} received. Welcome to your new home! 🏠`,
        client: `Booking for "${propertyName}" has been paid and confirmed. Payment received: ₹${amount}`,
        admin: `Booking for "${propertyName}" has been paid and confirmed. Payment received: ₹${amount}`
      }
    };
    return messages[paymentType]?.[recipient] || `Payment of ₹${amount} has been processed.`;
  }

  // Helper methods for booking notifications
  static getBookingTitle(action, recipient) {
    const titles = {
      created: {
        user: 'Booking Submitted Successfully',
        client: 'New Booking Request',
        admin: 'New Booking Submitted'
      },
      approved: {
        user: 'Booking Approved! 🎉',
        client: 'Booking Approved',
        admin: 'Booking Approved'
      },
      rejected: {
        user: 'Booking Declined',
        client: 'Booking Rejected',
        admin: 'Booking Rejected'
      },
      cancelled: {
        user: 'Booking Cancelled',
        client: 'Booking Cancelled',
        admin: 'Booking Cancelled'
      },
      paid: {
        user: 'Booking Confirmed! 🎉',
        client: 'Booking Payment Received',
        admin: 'Booking Payment Completed'
      }
    };
    return titles[action]?.[recipient] || 'Booking Notification';
  }

  static getBookingMessage(action, recipient, propertyName, data) {
    const messages = {
      created: {
        user: `Your booking for "${propertyName}" has been submitted successfully and is under review. You will be notified once it's approved.`,
        client: `New booking request for "${propertyName}" from a user. Please review and approve.`,
        admin: `A new booking has been submitted for "${propertyName}".`
      },
      approved: {
        user: `Great news! Your booking for "${propertyName}" has been approved. You can now proceed with the payment to confirm your booking.`,
        client: `Booking for "${propertyName}" has been approved.`,
        admin: `Booking for "${propertyName}" has been approved.`
      },
      rejected: {
        user: `Your booking for "${propertyName}" has been declined. Reason: ${data.rejectionReason || 'Not specified'}`,
        client: `Booking for "${propertyName}" has been rejected.`,
        admin: `Booking for "${propertyName}" has been rejected.`
      },
      cancelled: {
        user: `Your booking for "${propertyName}" has been cancelled.`,
        client: `Booking for "${propertyName}" has been cancelled.`,
        admin: `Booking for "${propertyName}" has been cancelled.`
      },
      paid: {
        user: `Your booking for "${propertyName}" is now confirmed! Payment received. Welcome to your new home! 🏠`,
        client: `Booking for "${propertyName}" has been paid and confirmed.`,
        admin: `Booking for "${propertyName}" has been paid and confirmed.`
      }
    };
    return messages[action]?.[recipient] || `Booking update for ${propertyName}.`;
  }

  static getBookingPriority(action) {
    const priorities = {
      created: 'medium',
      approved: 'high',
      rejected: 'medium',
      cancelled: 'medium',
      paid: 'high'
    };
    return priorities[action] || 'medium';
  }

  // Helper methods for property notifications
  static getPropertyTitle(action, recipient) {
    const titles = {
      submitted: {
        client: 'Property Submitted Successfully',
        admin: 'New Property Submitted for Approval'
      },
      approved: {
        client: 'Property Approved!',
        admin: 'Property Approved'
      },
      rejected: {
        client: 'Property Rejected',
        admin: 'Property Rejected'
      },
      revision_requested: {
        client: 'Revision Requested for Property',
        admin: 'Revision Requested for Property'
      },
      deleted: {
        client: 'Property Deleted',
        admin: 'Property Deleted'
      }
    };
    return titles[action]?.[recipient] || 'Property Notification';
  }

  static getPropertyMessage(action, recipient, propertyName, data) {
    const messages = {
      submitted: {
        client: `Your property "${propertyName}" has been submitted for admin approval.`,
        admin: `New property "${propertyName}" has been submitted by client ${data.clientId}. Please review and approve.`
      },
      approved: {
        client: `Congratulations! Your property "${propertyName}" has been approved and is now live on the platform.`,
        admin: `Property "${propertyName}" has been approved and is now live.`
      },
      rejected: {
        client: `Your property "${propertyName}" was rejected. Reason: ${data.rejectionReason}`,
        admin: `Property "${propertyName}" has been rejected. Reason: ${data.rejectionReason}`
      },
      revision_requested: {
        client: `Revision requested for your property "${propertyName}". Notes: ${data.revisionNotes}`,
        admin: `Revision requested for property "${propertyName}". Notes: ${data.revisionNotes}`
      },
      deleted: {
        client: `Your property "${propertyName}" has been deleted successfully.`,
        admin: `Property "${propertyName}" has been deleted by client ${data.clientId}.`
      }
    };
    return messages[action]?.[recipient] || `Property update for ${propertyName}.`;
  }
}

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log('👤 User notification request:', {
      userId,
      userRole,
      query: req.query
    });

    const { page = 1, limit = 20, unreadOnly = false, type } = req.query;

    const query = { userId: userId };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    if (type) {
      query.type = type;
    }

    console.log('🔍 User notification query:', query);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('propertyId', 'name locality city images')
      .populate('bookingId', 'bookingStatus totalAmount moveInDate moveOutDate')
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      userId: userId, 
      isRead: false 
    });

    console.log(`✅ Found ${notifications.length} user notifications for user ${userId}`);

    res.status(200).json({
      success: true,
      notifications: notifications,
      unreadCount: unreadCount,
      total: total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('❌ Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user notifications',
      error: error.message
    });
  }
};

// Get client notifications
export const getClientNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    console.log('👤 Client notification request from user:', {
      userId,
      role: user?.role,
      clientId: user?.clientId
    });

    if (!user || user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Client role required.'
      });
    }

    const clientId = user.clientId;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { 
      $or: [
        { clientId: clientId },
        { userId: userId }
      ]
    };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    console.log('🔍 Query for client notifications:', query);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('propertyId', 'name locality')
      .populate('bookingId', 'bookingStatus')
      .populate('userId', 'name phone');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      $or: [
        { clientId: clientId, isRead: false },
        { userId: userId, isRead: false }
      ]
    });

    console.log(`✅ Found ${notifications.length} client notifications`);

    res.status(200).json({
      success: true,
      notifications: notifications,
      unreadCount: unreadCount,
      total: total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Get client notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Get admin notifications
export const getAdminNotifications = async (req, res) => {
  try {
    console.log('🔔 Admin notification request received');
    console.log('User role:', req.user?.role);
    console.log('User ID:', req.user?.id);
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { page = 1, limit = 50, unreadOnly = false, type } = req.query;

    const query = { 
      adminId: { $exists: true }
    };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    if (type) {
      query.type = type;
    }

    console.log('📋 Admin notification query:', JSON.stringify(query, null, 2));

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('propertyId', 'name locality city')
      .populate('bookingId', 'bookingStatus totalAmount')
      .populate('userId', 'name email phone');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      ...query, 
      isRead: false 
    });

    console.log(`✅ Found ${notifications.length} admin notifications out of ${total} total`);

    res.status(200).json({
      success: true,
      notifications: notifications,
      unreadCount: unreadCount,
      total: total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('❌ Get admin notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin notifications',
      error: error.message
    });
  }
};

// Get notifications based on user role - UNIVERSAL ENDPOINT
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log('🔔 Universal notification request:', {
      userId,
      userRole,
      query: req.query
    });

    const { page = 1, limit = 20, unreadOnly = false, type } = req.query;

    let query = {};
    
    // Build query based on user role
    if (userRole === 'admin') {
      query = { adminId: { $exists: true } };
    } else if (userRole === 'client') {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      query = { 
        $or: [
          { clientId: user.clientId },
          { userId: userId }
        ]
      };
    } else {
      // Regular user
      query = { userId: userId };
    }
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    if (type) {
      query.type = type;
    }

    console.log('🔍 Universal notification query:', query);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('propertyId', 'name locality city images')
      .populate('bookingId', 'bookingStatus totalAmount')
      .populate('userId', 'name email phone')
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      ...query, 
      isRead: false 
    });

    console.log(`✅ Found ${notifications.length} notifications for ${userRole} ${userId}`);

    res.status(200).json({
      success: true,
      notifications: notifications,
      unreadCount: unreadCount,
      total: total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      userInfo: {
        userId,
        role: userRole
      }
    });

  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = { isRead: false };
    
    if (userRole === 'admin') {
      query.adminId = { $exists: true };
    } else if (userRole === 'client') {
      const user = await User.findById(userId);
      query.$or = [
        { clientId: user.clientId },
        { userId: userId }
      ];
    } else {
      query.userId = userId;
    }

    const unreadCount = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      unreadCount: unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

// Mark as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = { _id: notificationId };
    
    if (userRole === 'admin') {
      query.adminId = { $exists: true };
    } else if (userRole === 'client') {
      const user = await User.findById(userId);
      query.$or = [
        { _id: notificationId, clientId: user.clientId },
        { _id: notificationId, userId: userId }
      ];
    } else {
      // For regular users, only allow marking their own notifications as read
      query.userId = userId;
    }

    const notification = await Notification.findOneAndUpdate(
      query,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = {};
    
    if (userRole === 'admin') {
      query = { adminId: { $exists: true } };
    } else if (userRole === 'client') {
      const user = await User.findById(userId);
      query = { 
        $or: [
          { clientId: user.clientId },
          { userId: userId }
        ]
      };
    } else {
      query = { userId };
    }

    const result = await Notification.updateMany(
      query,
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: `All notifications marked as read. Updated ${result.modifiedCount} notifications.`
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = { _id: notificationId };
    
    if (userRole === 'admin') {
      query.adminId = { $exists: true };
    } else if (userRole === 'client') {
      const user = await User.findById(userId);
      query.$or = [
        { _id: notificationId, clientId: user.clientId },
        { _id: notificationId, userId: userId }
      ];
    } else {
      query.userId = userId;
    }

    const notification = await Notification.findOneAndDelete(query);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Debug endpoint for user notifications
export const getUserNotificationsDebug = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('🐛 User notifications debug for user:', userId);
    
    // Get all user notifications without filters
    const allUserNotifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .populate('propertyId', 'name')
      .populate('bookingId', 'bookingStatus')
      .lean();

    // Check database for any notifications with this user ID
    const notificationCount = await Notification.countDocuments({ userId });
    
    // Check user details
    const user = await User.findById(userId).select('name email role clientId');
    
    console.log(`📊 Debug - Found ${notificationCount} total notifications for user ${userId}`);

    res.status(200).json({
      success: true,
      data: {
        userId,
        userDetails: user,
        totalNotifications: notificationCount,
        notifications: allUserNotifications,
        userInfo: req.user
      }
    });
  } catch (error) {
    console.error('❌ User notifications debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
};

// Create test notification for user
export const createTestUserNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const testNotification = {
      userId: userId,
      type: 'booking_approved',
      title: 'Test User Notification',
      message: 'This is a test notification for user',
      priority: 'medium',
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      },
      isRead: false
    };

    const notification = await NotificationService.createNotification(testNotification);

    res.status(200).json({
      success: true,
      message: 'Test notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Create test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test notification',
      error: error.message
    });
  }
};

// Create test payment notification for user
export const createTestPaymentNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const testNotification = {
      userId: userId,
      type: 'payment_received',
      title: 'Test Payment Notification',
      message: 'This is a test payment notification for user',
      priority: 'medium',
      metadata: {
        test: true,
        amount: 1000,
        timestamp: new Date().toISOString()
      },
      isRead: false
    };

    const notification = await NotificationService.createNotification(testNotification);

    res.status(200).json({
      success: true,
      message: 'Test payment notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Create test payment notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test payment notification',
      error: error.message
    });
  }
};

// Create test notification for admin
export const createTestAdminNotification = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const testNotification = {
      adminId: 'admin',
      type: 'property_submitted',
      title: 'Test Admin Notification',
      message: 'This is a test notification for admin',
      priority: 'high',
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      },
      isRead: false
    };

    const notification = await NotificationService.createNotification(testNotification);

    res.status(200).json({
      success: true,
      message: 'Test notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Create test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test notification',
      error: error.message
    });
  }
};

export { NotificationService };