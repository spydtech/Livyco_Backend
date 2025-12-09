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

// Enhanced Notification service class with COMPLETE admin exclusion for chat
class NotificationService {
  // Check if notification type is chat-related
  static isChatType(type) {
    return type.includes('chat') || 
           type.includes('message') || 
           type === 'new_message' ||
           type === 'message_received';
  }

  // Create notification with COMPLETE admin exclusion for chat
  static async createNotification(notificationData) {
    try {
      console.log('📧 Creating notification:', {
        type: notificationData.type,
        title: notificationData.title,
        userId: notificationData.userId,
        clientId: notificationData.clientId,
        adminId: notificationData.adminId
      });
      
      // ✅ COMPLETE EXCLUSION: Prevent ALL chat-related notifications for admin
      if (notificationData.type && this.isChatType(notificationData.type)) {
        // 1. Check if this is explicitly an admin notification
        if (notificationData.adminId) {
          console.log('🚫 COMPLETE EXCLUSION: Skipping chat notification for admin (adminId present)');
          return null;
        }
        
        // 2. Check if recipient is admin (by userId)
        if (notificationData.userId) {
          const user = await User.findById(notificationData.userId).select('role');
          if (user && user.role === 'admin') {
            console.log('🚫 COMPLETE EXCLUSION: Skipping chat notification for admin user');
            return null;
          }
        }
        
        // 3. Check if sender is admin (if senderId provided in metadata)
        if (notificationData.metadata && notificationData.metadata.senderId) {
          const sender = await User.findById(notificationData.metadata.senderId).select('role');
          if (sender && sender.role === 'admin') {
            console.log('🚫 COMPLETE EXCLUSION: Skipping chat notification from admin sender');
            return null;
          }
        }
        
        // 4. Skip any chat notification that mentions admin in metadata
        if (notificationData.metadata && notificationData.metadata.notificationFor === 'admin') {
          console.log('🚫 COMPLETE EXCLUSION: Skipping chat notification for admin role');
          return null;
        }
      }
      
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

      // Admin notification for all payment types (EXCLUDE CHAT)
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
        populatedBooking = await booking.populate('propertyId').populate('userId');
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

      // Admin notification (EXCLUDE CHAT)
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

      // Admin notification (EXCLUDE CHAT)
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

  // Create vacate notification for user, client, and admin
  static async createVacateNotification(booking, vacateData, action) {
    try {
      const notifications = [];
      
      // Ensure booking is populated with property and user
      let populatedBooking = booking;
      if (typeof booking.populate === 'function') {
        populatedBooking = await booking.populate('propertyId').populate('userId');
      } else if (!booking.propertyId || typeof booking.propertyId === 'string') {
        populatedBooking = await Booking.findById(booking._id)
          .populate('propertyId')
          .populate('userId');
      }

      const property = populatedBooking.propertyId;
      const user = populatedBooking.userId;

      if (!property) {
        console.error('❌ Property not found for vacate notification');
        throw new Error('Property not found for vacate notification');
      }

      // User notification
      if (user) {
        const userNotification = {
          userId: user._id,
          bookingId: populatedBooking._id,
          propertyId: property._id,
          type: `vacate_${action}`,
          title: this.getVacateTitle(action, 'user'),
          message: this.getVacateMessage(action, 'user', property.name, vacateData),
          priority: this.getVacatePriority(action),
          metadata: {
            bookingId: populatedBooking._id,
            propertyId: property._id,
            propertyName: property.name,
            action: action,
            vacateDate: vacateData.vacateDate,
            reason: vacateData.reason,
            refundAmount: vacateData.refundAmount,
            ...vacateData
          },
          isRead: false
        };
        notifications.push(userNotification);
        console.log(`👤 Created user notification for vacate ${action}`);
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
            type: `vacate_${action}`,
            title: this.getVacateTitle(action, 'client'),
            message: this.getVacateMessage(action, 'client', property.name, vacateData),
            priority: this.getVacatePriority(action),
            metadata: {
              bookingId: populatedBooking._id,
              propertyId: property._id,
              propertyName: property.name,
              action: action,
              vacateDate: vacateData.vacateDate,
              reason: vacateData.reason,
              refundAmount: vacateData.refundAmount,
              ...vacateData
            },
            isRead: false
          };
          notifications.push(clientNotification);
          console.log(`🏢 Created client notification for vacate ${action}`);
        }
      }

      // Admin notification (EXCLUDE CHAT)
      const adminNotification = {
        adminId: 'admin',
        bookingId: populatedBooking._id,
        propertyId: property._id,
        type: `vacate_${action}`,
        title: this.getVacateTitle(action, 'admin'),
        message: this.getVacateMessage(action, 'admin', property.name, vacateData),
        priority: this.getVacatePriority(action),
        metadata: {
          bookingId: populatedBooking._id,
          propertyId: property._id,
          propertyName: property.name,
          action: action,
          vacateDate: vacateData.vacateDate,
          reason: vacateData.reason,
          refundAmount: vacateData.refundAmount,
          ...vacateData
        },
        isRead: false
      };
      notifications.push(adminNotification);
      console.log(`👑 Created admin notification for vacate ${action}`);

      // Create all notifications
      if (notifications.length > 0) {
        const createdNotifications = await Notification.insertMany(notifications);
        console.log(`✅ Created ${createdNotifications.length} notifications for vacate ${action}`);
        return createdNotifications;
      } else {
        console.log('⚠️ No notifications created for vacate');
        return [];
      }
    } catch (error) {
      console.error('❌ Error creating vacate notifications:', error);
      throw error;
    }
  }

  // Create food menu notification for ALL users in the property
  static async createFoodMenuNotification(foodItemData, action, changedBy, additionalData = {}) {
    try {
      console.log('🍽️ Creating food menu notification:', {
        propertyId: foodItemData.propertyId,
        action,
        changedBy,
        foodName: foodItemData.name
      });
      
      const notifications = [];
      
      const { 
        propertyId, 
        bookingId, 
        name: foodName, 
        day, 
        category,
        oldData = {},
        newData = {}
      } = foodItemData;
      
      // Get property details
      const property = await Property.findById(propertyId);
      if (!property) {
        console.error('❌ Property not found:', propertyId);
        throw new Error('Property not found');
      }
      
      // Get user who made the change
      const changedByUser = await User.findById(changedBy);
      const changedByName = changedByUser ? changedByUser.name : 'Unknown';
      
      // Get ALL users with active bookings in this property
      console.log(`🔍 Finding all active users in property: ${property.name}`);
      
      const activeBookings = await Booking.find({
        propertyId: propertyId,
        bookingStatus: { 
          $in: [
            'confirmed', 
            'active', 
            'paid', 
            'approved',
            'checked_in',
            'ongoing'
          ] 
        },
        userId: { $exists: true, $ne: null }
      })
      .populate('userId', '_id name email phone')
      .select('userId bookingStatus');
      
      console.log(`✅ Found ${activeBookings.length} active bookings in property`);
      
      // Extract unique users
      const uniqueUserMap = new Map();
      const usersToNotify = [];
      
      for (const booking of activeBookings) {
        if (booking.userId && booking.userId._id) {
          const userId = booking.userId._id.toString();
          if (!uniqueUserMap.has(userId)) {
            uniqueUserMap.set(userId, true);
            usersToNotify.push(booking.userId);
            console.log(`👤 Will notify user: ${booking.userId._id} (${booking.userId.name})`);
          }
        }
      }
      
      console.log(`📢 Total unique users to notify: ${usersToNotify.length}`);
      
      // 1. USER NOTIFICATIONS (All active users in property)
      for (const user of usersToNotify) {
        const userNotification = {
          userId: user._id,
          bookingId: bookingId,
          propertyId: propertyId,
          type: `food_${action}`,
          title: this.getFoodMenuTitle(action, 'user'),
          message: this.getFoodMenuMessage(action, 'user', property.name, foodName, day, category, changedByName, oldData, newData),
          priority: this.getFoodMenuPriority(action),
          metadata: {
            propertyId: propertyId,
            propertyName: property.name,
            bookingId: bookingId,
            foodItemName: foodName,
            foodItemId: foodItemData._id || foodItemData.id,
            day: day,
            category: category,
            action: action,
            changedBy: changedBy,
            changedByName: changedByName,
            oldData: oldData,
            newData: newData,
            timestamp: new Date().toISOString(),
            isPropertyMenu: !bookingId,
            isFoodNotification: true,
            notificationFor: 'user',
            ...additionalData
          },
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        notifications.push(userNotification);
      }
      
      // 2. CLIENT NOTIFICATION (Property owner)
      if (property.clientId) {
        const clientUser = await User.findOne({ clientId: property.clientId });
        if (clientUser) {
          const clientNotification = {
            userId: clientUser._id,
            clientId: property.clientId,
            propertyId: propertyId,
            bookingId: bookingId,
            type: `food_${action}`,
            title: this.getFoodMenuTitle(action, 'client'),
            message: this.getFoodMenuMessage(action, 'client', property.name, foodName, day, category, changedByName, oldData, newData),
            priority: this.getFoodMenuPriority(action),
            metadata: {
              propertyId: propertyId,
              propertyName: property.name,
              bookingId: bookingId,
              foodItemName: foodName,
              foodItemId: foodItemData._id || foodItemData.id,
              day: day,
              category: category,
              action: action,
              changedBy: changedBy,
              changedByName: changedByName,
              oldData: oldData,
              newData: newData,
              timestamp: new Date().toISOString(),
              isFoodNotification: true,
              notificationFor: 'client',
              ...additionalData
            },
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          notifications.push(clientNotification);
          console.log(`🏢 Created notification for client: ${clientUser._id}`);
        }
      }
      
      // 3. ADMIN NOTIFICATION (EXCLUDE CHAT)
      const adminNotification = {
        adminId: 'admin',
        propertyId: propertyId,
        bookingId: bookingId,
        type: `food_${action}`,
        title: this.getFoodMenuTitle(action, 'admin'),
        message: this.getFoodMenuMessage(action, 'admin', property.name, foodName, day, category, changedByName, oldData, newData),
        priority: this.getFoodMenuPriority(action),
        metadata: {
          propertyId: propertyId,
          propertyName: property.name,
          bookingId: bookingId,
          foodItemName: foodName,
          foodItemId: foodItemData._id || foodItemData.id,
          day: day,
          category: category,
          action: action,
          changedBy: changedBy,
          changedByName: changedByName,
          oldData: oldData,
          newData: newData,
          timestamp: new Date().toISOString(),
          isFoodNotification: true,
          notificationFor: 'admin',
          ...additionalData
        },
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      notifications.push(adminNotification);
      
      // Create all notifications
      if (notifications.length > 0) {
        console.log(`📤 Inserting ${notifications.length} notifications to database...`);
        const createdNotifications = await Notification.insertMany(notifications);
        console.log(`✅ Successfully created ${createdNotifications.length} food menu notifications`);
        
        // Log summary
        const userCount = usersToNotify.length;
        const clientCount = property.clientId ? 1 : 0;
        const adminCount = 1;
        
        console.log(`
        📊 Food Menu Notification Summary:
        ==================================
        Property: ${property.name}
        Action: ${action}
        Food Item: ${foodName}
        ------------------
        Users Notified: ${userCount}
        Client Notified: ${clientCount}
        Admin Notified: ${adminCount}
        Total: ${createdNotifications.length}
        ==================================
        `);
        
        return createdNotifications;
      } else {
        console.log('⚠️ No notifications created for food menu');
        return [];
      }
    } catch (error) {
      console.error('❌ Error creating food menu notifications:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        propertyId: foodItemData?.propertyId
      });
      throw error;
    }
  }

  // Special method to force notify a specific user about food menu changes
  static async createFoodMenuNotificationForUser(userId, foodItemData, action, changedBy, additionalData = {}) {
    try {
      console.log(`🍽️ FORCING food notification for specific user: ${userId}`);
      
      const { 
        propertyId, 
        name: foodName, 
        day, 
        category,
        oldData = {},
        newData = {}
      } = foodItemData;
      
      // Get property details
      const property = await Property.findById(propertyId);
      if (!property) {
        throw new Error('Property not found');
      }
      
      // Get user who made the change
      const changedByUser = await User.findById(changedBy);
      const changedByName = changedByUser ? changedByUser.name : 'Unknown';
      
      // Get the target user
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        throw new Error('Target user not found');
      }
      
      console.log(`🍽️ Creating notification for user: ${targetUser.name} (${targetUser._id})`);
      
      // Create user notification
      const userNotification = {
        userId: userId,
        propertyId: propertyId,
        type: `food_${action}`,
        title: this.getFoodMenuTitle(action, 'user'),
        message: this.getFoodMenuMessage(action, 'user', property.name, foodName, day, category, changedByName, oldData, newData),
        priority: this.getFoodMenuPriority(action),
        metadata: {
          propertyId: propertyId,
          propertyName: property.name,
          foodItemName: foodName,
          day: day,
          category: category,
          action: action,
          changedBy: changedBy,
          changedByName: changedByName,
          oldData: oldData,
          newData: newData,
          timestamp: new Date().toISOString(),
          isFoodNotification: true,
          notificationFor: 'user',
          forcedNotification: true,
          ...additionalData
        },
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const notification = await Notification.create(userNotification);
      console.log(`✅ FORCED notification created for user ${userId}: ${notification._id}`);
      
      return notification;
    } catch (error) {
      console.error('❌ Error creating forced food notification:', error);
      throw error;
    }
  }

  // Create bulk food menu update notification
  static async createBulkFoodMenuNotification(propertyId, action, changedBy, changesSummary, additionalData = {}) {
    try {
      console.log('🍽️ Creating bulk food menu notification:', {
        propertyId,
        action,
        changedBy,
        changesSummary
      });
      
      const notifications = [];
      
      // Get property details
      const property = await Property.findById(propertyId);
      if (!property) {
        throw new Error('Property not found');
      }
      
      // Get user who made the change
      const changedByUser = await User.findById(changedBy);
      const changedByName = changedByUser ? changedByUser.name : 'Unknown';
      
      // Get ALL active users in the property
      const activeBookings = await Booking.find({
        propertyId: propertyId,
        bookingStatus: { 
          $in: [
            'confirmed', 
            'active', 
            'paid', 
            'approved',
            'checked_in',
            'ongoing'
          ] 
        },
        userId: { $exists: true, $ne: null }
      })
      .populate('userId', '_id name')
      .select('userId');
      
      // Extract unique users
      const uniqueUserMap = new Map();
      const usersToNotify = [];
      
      for (const booking of activeBookings) {
        if (booking.userId && booking.userId._id) {
          const userId = booking.userId._id.toString();
          if (!uniqueUserMap.has(userId)) {
            uniqueUserMap.set(userId, true);
            usersToNotify.push(booking.userId);
          }
        }
      }
      
      console.log(`📢 Notifying ${usersToNotify.length} users for bulk update`);
      
      // 1. USER NOTIFICATIONS (All active property users)
      for (const user of usersToNotify) {
        const userNotification = {
          userId: user._id,
          propertyId: propertyId,
          type: `food_${action}`,
          title: this.getFoodMenuTitle(action, 'user'),
          message: this.getFoodMenuBulkMessage(action, 'user', property.name, changedByName, changesSummary),
          priority: this.getFoodMenuPriority(action),
          metadata: {
            propertyId: propertyId,
            propertyName: property.name,
            action: action,
            changedBy: changedBy,
            changedByName: changedByName,
            changesSummary: changesSummary,
            timestamp: new Date().toISOString(),
            isBulkUpdate: true,
            isFoodNotification: true,
            notificationFor: 'user',
            ...additionalData
          },
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        notifications.push(userNotification);
      }
      
      // 2. CLIENT NOTIFICATION
      if (property.clientId) {
        const clientUser = await User.findOne({ clientId: property.clientId });
        if (clientUser) {
          const clientNotification = {
            userId: clientUser._id,
            clientId: property.clientId,
            propertyId: propertyId,
            type: `food_${action}`,
            title: this.getFoodMenuTitle(action, 'client'),
            message: this.getFoodMenuBulkMessage(action, 'client', property.name, changedByName, changesSummary),
            priority: this.getFoodMenuPriority(action),
            metadata: {
              propertyId: propertyId,
              propertyName: property.name,
              action: action,
              changedBy: changedBy,
              changedByName: changedByName,
              changesSummary: changesSummary,
              timestamp: new Date().toISOString(),
              isBulkUpdate: true,
              isFoodNotification: true,
              notificationFor: 'client',
              ...additionalData
            },
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          notifications.push(clientNotification);
        }
      }
      
      // 3. ADMIN NOTIFICATION (EXCLUDE CHAT)
      const adminNotification = {
        adminId: 'admin',
        propertyId: propertyId,
        type: `food_${action}`,
        title: this.getFoodMenuTitle(action, 'admin'),
        message: this.getFoodMenuBulkMessage(action, 'admin', property.name, changedByName, changesSummary),
        priority: this.getFoodMenuPriority(action),
        metadata: {
          propertyId: propertyId,
          propertyName: property.name,
          action: action,
          changedBy: changedBy,
          changedByName: changedByName,
          changesSummary: changesSummary,
          timestamp: new Date().toISOString(),
          isBulkUpdate: true,
          isFoodNotification: true,
          notificationFor: 'admin',
          ...additionalData
        },
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      notifications.push(adminNotification);
      
      // Create all notifications
      if (notifications.length > 0) {
        const createdNotifications = await Notification.insertMany(notifications);
        console.log(`✅ Created ${createdNotifications.length} bulk food menu notifications`);
        return createdNotifications;
      } else {
        console.log('⚠️ No notifications created for bulk food menu');
        return [];
      }
    } catch (error) {
      console.error('❌ Error creating bulk food menu notifications:', error);
      throw error;
    }
  }

  static async createVacateRejectionNotification(vacateRequest, property, rejectionReason, rejectedByUserId) {
      try {
        console.log('🔴 Creating vacate rejection notification:', {
          vacateRequestId: vacateRequest._id,
          propertyName: property.name,
          rejectionReason
        });
        
        const notifications = [];
        
        // Get user details
        const user = await User.findById(vacateRequest.userId);
        const rejectedByUser = await User.findById(rejectedByUserId);
        const rejectedByName = rejectedByUser ? rejectedByUser.name : 'Unknown';
        
        // 1. User notification (Tenant)
        const userNotification = {
          userId: vacateRequest.userId,
          bookingId: vacateRequest.bookingId,
          propertyId: vacateRequest.propertyId,
          type: 'vacate_rejected',
          title: 'Vacate Request Rejected ❌',
          message: `Your vacate request for "${property.name}" has been rejected. Reason: ${rejectionReason || 'Not specified'}`,
          priority: 'high',
          metadata: {
            bookingId: vacateRequest.bookingId,
            propertyId: vacateRequest.propertyId,
            propertyName: property.name,
            vacateRequestId: vacateRequest._id,
            rejectedBy: rejectedByUserId,
            rejectedByName: rejectedByName,
            rejectionReason: rejectionReason,
            rejectedAt: new Date(),
            action: 'rejected',
            notificationFor: 'user'
          },
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        notifications.push(userNotification);
        
        console.log(`👤 Created rejection notification for user: ${user?.name || vacateRequest.userId}`);
  
        // 2. Client notification (Property Owner)
        const clientUser = await User.findOne({ clientId: property.clientId });
        if (clientUser) {
          const clientNotification = {
            userId: clientUser._id,
            clientId: property.clientId,
            bookingId: vacateRequest.bookingId,
            propertyId: vacateRequest.propertyId,
            type: 'vacate_rejected',
            title: 'Vacate Request Rejected',
            message: `You rejected a vacate request for "${property.name}". Reason: ${rejectionReason || 'Not specified'}`,
            priority: 'medium',
            metadata: {
              bookingId: vacateRequest.bookingId,
              propertyId: vacateRequest.propertyId,
              propertyName: property.name,
              vacateRequestId: vacateRequest._id,
              rejectedBy: rejectedByUserId,
              rejectedByName: rejectedByName,
              rejectionReason: rejectionReason,
              rejectedAt: new Date(),
              action: 'rejected',
              notificationFor: 'client'
            },
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          notifications.push(clientNotification);
          console.log(`🏢 Created rejection notification for client: ${clientUser._id}`);
        }
  
        // 3. Admin notification
        const adminNotification = {
          adminId: 'admin',
          bookingId: vacateRequest.bookingId,
          propertyId: vacateRequest.propertyId,
          type: 'vacate_rejected',
          title: 'Vacate Request Rejected',
          message: `Vacate request for "${property.name}" has been rejected by ${rejectedByName}. Reason: ${rejectionReason || 'Not specified'}`,
          priority: 'medium',
          metadata: {
            bookingId: vacateRequest.bookingId,
            propertyId: vacateRequest.propertyId,
            propertyName: property.name,
            vacateRequestId: vacateRequest._id,
            clientId: property.clientId,
            rejectedBy: rejectedByUserId,
            rejectedByName: rejectedByName,
            rejectionReason: rejectionReason,
            rejectedAt: new Date(),
            action: 'rejected',
            notificationFor: 'admin'
          },
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        notifications.push(adminNotification);
        console.log(`👑 Created rejection notification for admin`);
  
        // Create all notifications
        if (notifications.length > 0) {
          const createdNotifications = await Notification.insertMany(notifications);
          console.log(`✅ Successfully created ${createdNotifications.length} rejection notifications`);
          
          console.log(`
          📊 Vacate Rejection Notification Summary:
          =========================================
          Property: ${property.name}
          Request ID: ${vacateRequest._id}
          Rejection Reason: ${rejectionReason || 'Not specified'}
          ------------------
          User Notified: ✅
          Client Notified: ${property.clientId ? '✅' : '❌'}
          Admin Notified: ✅
          Total: ${createdNotifications.length}
          =========================================
          `);
          
          return createdNotifications;
        } else {
          console.log('⚠️ No notifications created for vacate rejection');
          return [];
        }
      } catch (error) {
        console.error('❌ Error creating vacate rejection notifications:', error);
        console.error('❌ Error details:', {
          message: error.message,
          stack: error.stack,
          vacateRequestId: vacateRequest?._id
        });
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

  // Helper methods for vacate notifications
  static getVacateTitle(action, recipient) {
    const titles = {
      requested: {
        user: 'Vacate Request Submitted 🏠',
        client: 'Vacate Request Received',
        admin: 'New Vacate Request'
      },
      approved: {
        user: 'Vacate Request Approved ✅',
        client: 'Vacate Request Approved',
        admin: 'Vacate Request Approved'
      },
      rejected: {
        user: 'Vacate Request Rejected ❌',
        client: 'Vacate Request Rejected',
        admin: 'Vacate Request Rejected'
      },
      completed: {
        user: 'Vacate Process Completed 🎉',
        client: 'Vacate Process Completed',
        admin: 'Vacate Process Completed'
      },
      cancelled: {
        user: 'Vacate Request Cancelled',
        client: 'Vacate Request Cancelled',
        admin: 'Vacate Request Cancelled'
      }
    };
    return titles[action]?.[recipient] || 'Vacate Notification';
  }

  static getVacateMessage(action, recipient, propertyName, data) {
    const messages = {
      requested: {
        user: `Your vacate request for "${propertyName}" has been submitted successfully. Expected vacate date: ${new Date(data.vacateDate).toLocaleDateString()}.`,
        client: `Tenant has requested to vacate "${propertyName}". Expected vacate date: ${new Date(data.vacateDate).toLocaleDateString()}.`,
        admin: `Vacate request received for "${propertyName}". Expected vacate date: ${new Date(data.vacateDate).toLocaleDateString()}.`
      },
      approved: {
        user: `Your vacate request for "${propertyName}" has been approved. You can proceed with the vacate process.`,
        client: `Vacate request for "${propertyName}" has been approved.`,
        admin: `Vacate request for "${propertyName}" has been approved.`
      },
      rejected: {
        user: `Your vacate request for "${propertyName}" has been rejected. Reason: ${data.rejectionReason || 'Not specified'}`,
        client: `Vacate request for "${propertyName}" has been rejected. Reason: ${data.rejectionReason || 'Not specified'}`,
        admin: `Vacate request for "${propertyName}" has been rejected. Reason: ${data.rejectionReason || 'Not specified'}`
      },
      completed: {
        user: `Vacate process for "${propertyName}" has been completed successfully. Thank you for staying with us!`,
        client: `Vacate process for "${propertyName}" has been completed. The property is now available for new bookings.`,
        admin: `Vacate process for "${propertyName}" has been completed successfully.`
      },
      cancelled: {
        user: `Your vacate request for "${propertyName}" has been cancelled.`,
        client: `Vacate request for "${propertyName}" has been cancelled by the tenant.`,
        admin: `Vacate request for "${propertyName}" has been cancelled.`
      }
    };
    return messages[action]?.[recipient] || `Vacate update for ${propertyName}.`;
  }

  static getVacatePriority(action) {
    const priorities = {
      requested: 'high',
      approved: 'medium',
      rejected: 'medium',
      completed: 'high',
      cancelled: 'medium'
    };
    return priorities[action] || 'medium';
  }

  // Helper methods for food menu notifications
  static getFoodMenuTitle(action, recipient) {
    const titles = {
      item_added: {
        user: 'New Food Item Added 🍽️',
        client: 'Food Item Added',
        admin: 'Food Item Added'
      },
      item_updated: {
        user: 'Food Item Updated ✏️',
        client: 'Food Item Updated',
        admin: 'Food Item Updated'
      },
      item_deleted: {
        user: 'Food Item Removed 🗑️',
        client: 'Food Item Deleted',
        admin: 'Food Item Deleted'
      },
      price_changed: {
        user: 'Food Price Updated 💰',
        client: 'Food Price Changed',
        admin: 'Food Price Changed'
      },
      menu_cleared: {
        user: 'Menu Cleared 📋',
        client: 'Day Menu Cleared',
        admin: 'Day Menu Cleared'
      },
      bulk_updated: {
        user: 'Weekly Menu Updated 📅',
        client: 'Weekly Menu Updated',
        admin: 'Weekly Menu Updated'
      }
    };
    return titles[action]?.[recipient] || 'Food Menu Update';
  }

  static getFoodMenuMessage(action, recipient, propertyName, foodName, day, category, changedByName, oldData, newData) {
    // Enhanced user messages
    const userMessages = {
      item_added: `New "${foodName}" has been added to the ${day} ${category} menu at ${propertyName}.`,
      item_updated: `"${foodName}" in your ${day} ${category} menu has been updated at ${propertyName}.`,
      item_deleted: `"${foodName}" has been removed from the ${day} ${category} menu at ${propertyName}.`,
      price_changed: `Price for "${foodName}" (${day} ${category}) changed from ₹${oldData.price || 'N/A'} to ₹${newData.price || 'N/A'} at ${propertyName}.`,
      menu_cleared: `All items have been cleared from the ${day} menu at ${propertyName}.`
    };

    const clientMessages = {
      item_added: `You added "${foodName}" to ${day} ${category} menu at ${propertyName}.`,
      item_updated: `You updated "${foodName}" in ${day} ${category} menu at ${propertyName}.`,
      item_deleted: `You removed "${foodName}" from ${day} ${category} menu at ${propertyName}.`,
      price_changed: `You changed price for "${foodName}" from ₹${oldData.price || 'N/A'} to ₹${newData.price || 'N/A'} at ${propertyName}.`,
      menu_cleared: `You cleared all items from ${day} menu at ${propertyName}.`
    };

    const adminMessages = {
      item_added: `"${changedByName}" added "${foodName}" to ${day} ${category} menu at ${propertyName}.`,
      item_updated: `"${changedByName}" updated "${foodName}" in ${day} ${category} menu at ${propertyName}.`,
      item_deleted: `"${changedByName}" removed "${foodName}" from ${day} ${category} menu at ${propertyName}.`,
      price_changed: `"${changedByName}" changed price for "${foodName}" from ₹${oldData.price || 'N/A'} to ₹${newData.price || 'N/A'} at ${propertyName}.`,
      menu_cleared: `"${changedByName}" cleared all items from ${day} menu at ${propertyName}.`
    };

    if (recipient === 'user') return userMessages[action] || `Food menu updated at ${propertyName}.`;
    if (recipient === 'client') return clientMessages[action] || `Food menu updated at ${propertyName}.`;
    return adminMessages[action] || `Food menu updated at ${propertyName}.`;
  }

  static getFoodMenuBulkMessage(action, recipient, propertyName, changedByName, changesSummary) {
    if (recipient === 'user') {
      return `The weekly menu at ${propertyName} has been updated. ${changesSummary}`;
    } else if (recipient === 'client') {
      return `You updated the weekly menu at ${propertyName}. ${changesSummary}`;
    } else {
      return `${changedByName} updated the weekly menu at ${propertyName}. ${changesSummary}`;
    }
  }

  static getFoodMenuPriority(action) {
    const priorities = {
      item_added: 'medium',
      item_updated: 'medium',
      item_deleted: 'medium',
      price_changed: 'high',
      menu_cleared: 'medium',
      bulk_updated: 'high'
    };
    return priorities[action] || 'medium';
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

    // Log food notifications specifically
    const foodNotifications = notifications.filter(n => n.type && n.type.startsWith('food_'));
    if (foodNotifications.length > 0) {
      console.log(`🍽️ Found ${foodNotifications.length} food notifications for user ${userId}`);
    }

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

    // Check for food notifications specifically
    const foodNotifications = allUserNotifications.filter(n => n.type && n.type.startsWith('food_'));
    console.log(`🍽️ Debug - Found ${foodNotifications.length} food notifications`);

    res.status(200).json({
      success: true,
      data: {
        userId,
        userDetails: user,
        totalNotifications: notificationCount,
        foodNotificationsCount: foodNotifications.length,
        foodNotifications: foodNotifications,
        allNotifications: allUserNotifications,
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

// Create test vacate notification
export const createTestVacateNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's booking for testing
    const booking = await Booking.findOne({ userId }).populate('propertyId');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'No booking found for user'
      });
    }

    const vacateData = {
      vacateDate: new Date(),
      reason: 'Test vacate reason',
      refundAmount: 5000
    };

    const notifications = await NotificationService.createVacateNotification(booking, vacateData, 'requested');

    res.status(200).json({
      success: true,
      message: 'Test vacate notification created successfully',
      data: notifications
    });
  } catch (error) {
    console.error('Create test vacate notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test vacate notification',
      error: error.message
    });
  }
};

// Create test food menu notification
export const createTestFoodMenuNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    console.log('🍽️ Creating test food menu notification for user:', userId);
    
    // Get any property for testing
    const property = await Property.findOne().limit(1);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'No property found for testing'
      });
    }

    console.log('🍽️ Using property for test:', property.name);

    // Get active bookings in this property
    const activeBookings = await Booking.find({
      propertyId: property._id,
      bookingStatus: { $in: ['confirmed', 'active', 'paid', 'approved'] },
      userId: { $exists: true, $ne: null }
    })
    .populate('userId', '_id name')
    .limit(5);

    console.log(`🍽️ Found ${activeBookings.length} active bookings in property`);

    // Create test food item data
    const foodItemData = {
      propertyId: property._id,
      bookingId: activeBookings[0]?._id,
      name: 'Test Pasta 🍝',
      day: 'Monday',
      category: 'Dinner',
      oldData: { price: 120, name: 'Old Pasta' },
      newData: { price: 150, name: 'Test Pasta 🍝' }
    };

    console.log('🍽️ Test food item data:', foodItemData);

    // Create the notification
    const notifications = await NotificationService.createFoodMenuNotification(
      foodItemData, 
      'price_changed', 
      userId, 
      { 
        test: true,
        testType: 'food_menu_notification'
      }
    );

    // Get user count from created notifications
    const userNotifications = notifications.filter(n => !n.adminId && !n.clientId);
    const clientNotifications = notifications.filter(n => n.clientId);
    const adminNotifications = notifications.filter(n => n.adminId);

    res.status(200).json({
      success: true,
      message: 'Test food menu notification created successfully',
      data: {
        notificationsCount: notifications.length,
        summary: {
          usersNotified: userNotifications.length,
          clientsNotified: clientNotifications.length,
          adminsNotified: adminNotifications.length,
          total: notifications.length
        },
        property: {
          id: property._id,
          name: property.name,
          clientId: property.clientId
        },
        testDetails: {
          foodItem: 'Test Pasta 🍝',
          action: 'price_changed',
          day: 'Monday',
          category: 'Dinner'
        }
      }
    });
  } catch (error) {
    console.error('❌ Create test food menu notification error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create test food menu notification',
      error: error.message,
      details: error.stack
    });
  }
};

// Special test endpoint to trigger food menu notifications for a specific user
export const triggerFoodNotificationForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.body;
    
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'targetUserId is required'
      });
    }

    console.log(`🍽️ Triggering food notification for user: ${targetUserId}`);
    
    // Get target user's active booking
    const activeBooking = await Booking.findOne({
      userId: targetUserId,
      bookingStatus: { $in: ['confirmed', 'active', 'paid', 'approved'] }
    }).populate('propertyId');

    if (!activeBooking) {
      return res.status(404).json({
        success: false,
        message: 'No active booking found for target user'
      });
    }

    console.log(`🍽️ Found active booking for user ${targetUserId} in property: ${activeBooking.propertyId.name}`);

    // Create test food item data
    const foodItemData = {
      propertyId: activeBooking.propertyId._id,
      bookingId: activeBooking._id,
      name: 'Test Burger 🍔',
      day: 'Friday',
      category: 'Lunch',
      oldData: { price: 80 },
      newData: { price: 100 }
    };

    // Create notification specifically for this user
    const notificationData = {
      userId: targetUserId,
      propertyId: activeBooking.propertyId._id,
      bookingId: activeBooking._id,
      type: 'food_price_changed',
      title: 'Food Price Updated 💰',
      message: `Price for "Test Burger 🍔" in your Friday Lunch menu has changed from ₹80 to ₹100 at ${activeBooking.propertyId.name}.`,
      priority: 'high',
      metadata: {
        propertyId: activeBooking.propertyId._id,
        propertyName: activeBooking.propertyId.name,
        bookingId: activeBooking._id,
        foodItemName: 'Test Burger 🍔',
        day: 'Friday',
        category: 'Lunch',
        action: 'price_changed',
        changedBy: userId,
        oldData: { price: 80 },
        newData: { price: 100 },
        timestamp: new Date().toISOString(),
        isFoodNotification: true,
        notificationFor: 'user',
        test: true
      },
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const notification = await NotificationService.createNotification(notificationData);

    res.status(200).json({
      success: true,
      message: 'Food notification triggered successfully',
      data: {
        notificationId: notification._id,
        targetUserId: targetUserId,
        property: activeBooking.propertyId.name,
        foodItem: 'Test Burger 🍔',
        message: notificationData.message
      }
    });
  } catch (error) {
    console.error('❌ Trigger food notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger food notification',
      error: error.message
    });
  }
};

// Debug endpoint to check user's active bookings and properties
export const getUserActiveBookingsDebug = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('🔍 Checking active bookings for user:', userId);
    
    const activeBookings = await Booking.find({
      userId: userId,
      bookingStatus: { 
        $in: [
          'confirmed', 
          'active', 
          'paid', 
          'approved',
          'checked_in',
          'ongoing'
        ] 
      }
    })
    .populate('propertyId', 'name clientId locality city')
    .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${activeBookings.length} active bookings for user ${userId}`);
    
    // Get all properties user has bookings in
    const propertyIds = [...new Set(activeBookings.map(b => b.propertyId._id.toString()))];
    
    // Get all users in these properties
    const propertyUsers = [];
    for (const propertyId of propertyIds) {
      const usersInProperty = await Booking.find({
        propertyId: propertyId,
        bookingStatus: { $in: ['confirmed', 'active', 'paid', 'approved', 'checked_in', 'ongoing'] },
        userId: { $exists: true, $ne: null }
      })
      .populate('userId', '_id name email')
      .distinct('userId');
      
      propertyUsers.push({
        propertyId: propertyId,
        userCount: usersInProperty.length,
        users: usersInProperty.map(u => ({ id: u._id, name: u.name, email: u.email }))
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        userId,
        activeBookingsCount: activeBookings.length,
        activeBookings: activeBookings.map(b => ({
          id: b._id,
          propertyId: b.propertyId._id,
          propertyName: b.propertyId.name,
          clientId: b.propertyId.clientId,
          bookingStatus: b.bookingStatus,
          propertyDetails: {
            name: b.propertyId.name,
            locality: b.propertyId.locality,
            city: b.propertyId.city
          }
        })),
        propertiesSummary: {
          totalProperties: propertyIds.length,
          properties: propertyIds,
          propertyUsers: propertyUsers
        }
      }
    });
  } catch (error) {
    console.error('❌ User active bookings debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
};

// Debug endpoint to check food notifications in system
export const getFoodNotificationsDebug = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('🍽️ Checking food notifications for user:', userId);
    
    // Get user's food notifications
    const foodNotifications = await Notification.find({
      userId: userId,
      $or: [
        { type: { $regex: /^food_/ } },
        { 'metadata.isFoodNotification': true }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('propertyId', 'name')
    .lean();
    
    // Get all food notifications in system (for admin)
    let allFoodNotifications = [];
    if (req.user.role === 'admin') {
      allFoodNotifications = await Notification.find({
        $or: [
          { type: { $regex: /^food_/ } },
          { 'metadata.isFoodNotification': true }
        ]
      })
      .sort({ createdAt: -1 })
      .populate('propertyId', 'name')
      .populate('userId', 'name email')
      .limit(50)
      .lean();
    }
    
    res.status(200).json({
      success: true,
      data: {
        userId,
        userFoodNotifications: {
          count: foodNotifications.length,
          notifications: foodNotifications.map(n => ({
            id: n._id,
            type: n.type,
            title: n.title,
            message: n.message,
            property: n.propertyId?.name,
            createdAt: n.createdAt,
            isRead: n.isRead
          }))
        },
        ...(req.user.role === 'admin' && {
          allFoodNotifications: {
            count: allFoodNotifications.length,
            notifications: allFoodNotifications.map(n => ({
              id: n._id,
              type: n.type,
              title: n.title,
              userId: n.userId?._id,
              userName: n.userId?.name,
              property: n.propertyId?.name,
              createdAt: n.createdAt
            }))
          }
        })
      }
    });
  } catch (error) {
    console.error('❌ Food notifications debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
};

// Emergency fix endpoint - Manually trigger food notifications for all users in a property
export const emergencyFixFoodNotifications = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { propertyId, foodName = 'Emergency Food Item', day = 'Monday', category = 'Lunch' } = req.body;
    
    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'propertyId is required'
      });
    }

    console.log(`🚨 EMERGENCY FIX: Triggering food notifications for property: ${propertyId}`);
    
    // Get property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Get ALL active users in the property
    const activeBookings = await Booking.find({
      propertyId: propertyId,
      bookingStatus: { $in: ['confirmed', 'active', 'paid', 'approved', 'checked_in', 'ongoing'] },
      userId: { $exists: true, $ne: null }
    })
    .populate('userId', '_id name email')
    .select('userId bookingStatus');
    
    console.log(`🚨 Found ${activeBookings.length} active bookings in property`);
    
    // Extract unique users
    const uniqueUserMap = new Map();
    const usersToNotify = [];
    
    for (const booking of activeBookings) {
      if (booking.userId && booking.userId._id) {
        const userId = booking.userId._id.toString();
        if (!uniqueUserMap.has(userId)) {
          uniqueUserMap.set(userId, true);
          usersToNotify.push(booking.userId);
          console.log(`🚨 Will notify user: ${booking.userId._id} (${booking.userId.name})`);
        }
      }
    }
    
    console.log(`🚨 Total unique users to notify: ${usersToNotify.length}`);
    
    const notifications = [];
    
    // Create notifications for each user
    for (const user of usersToNotify) {
      const notification = {
        userId: user._id,
        propertyId: propertyId,
        type: 'food_item_updated',
        title: 'Food Menu Updated ✏️',
        message: `"${foodName}" in your ${day} ${category} menu has been updated at ${property.name}.`,
        priority: 'medium',
        metadata: {
          propertyId: propertyId,
          propertyName: property.name,
          foodItemName: foodName,
          day: day,
          category: category,
          action: 'item_updated',
          changedBy: req.user.id,
          changedByName: req.user.name,
          timestamp: new Date().toISOString(),
          isFoodNotification: true,
          notificationFor: 'user',
          emergencyFix: true
        },
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      notifications.push(notification);
    }
    
    // Insert all notifications
    let createdNotifications = [];
    if (notifications.length > 0) {
      createdNotifications = await Notification.insertMany(notifications);
      console.log(`🚨 Successfully created ${createdNotifications.length} emergency notifications`);
    }
    
    res.status(200).json({
      success: true,
      message: 'Emergency fix applied successfully',
      data: {
        property: {
          id: property._id,
          name: property.name
        },
        usersNotified: usersToNotify.length,
        notificationsCreated: createdNotifications.length,
        users: usersToNotify.map(u => ({
          id: u._id,
          name: u.name,
          email: u.email
        }))
      }
    });
  } catch (error) {
    console.error('❌ Emergency fix error:', error);
    res.status(500).json({
      success: false,
      message: 'Emergency fix failed',
      error: error.message
    });
  }
};

export { NotificationService }; 



// //testing notification
// import Notification from '../models/Notification.js';
// import User from '../models/User.js';
// import Booking from '../models/Booking.js';
// import Property from '../models/Property.js';

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

//   // Create payment notification for user, client, and admin
//   static async createPaymentNotification(userId, paymentType, amount, bookingId, metadata = {}) {
//     try {
//       const notifications = [];
      
//       // Get user and booking details
//       const user = await User.findById(userId);
//       if (!user) {
//         throw new Error('User not found');
//       }

//       const booking = await Booking.findById(bookingId)
//       .populate('propertyId')
//       .populate('userId');
//       if (!booking) {
//         throw new Error('Booking not found');
//       }

//       const property = booking.propertyId;

//       // User notification
//       const userNotification = {
//         userId: userId,
//         type: paymentType,
//         title: this.getPaymentTitle(paymentType, 'user'),
//         message: this.getPaymentMessage(paymentType, 'user', amount, property?.name),
//         priority: paymentType === 'payment_failed' ? 'high' : 'medium',
//         metadata: {
//           amount: amount,
//           bookingId: bookingId,
//           propertyId: property?._id,
//           propertyName: property?.name,
//           paymentType: paymentType,
//           timestamp: new Date().toISOString(),
//           ...metadata
//         },
//         isRead: false
//       };
//       notifications.push(userNotification);

//        // Client notification (if property has clientId) - FIXED LOGIC
//       if (property?.clientId) {
//         console.log('🔍 Looking for client user with clientId:', property.clientId);
        
//         // Find ALL users that have this clientId (could be multiple client users)
//         const clientUsers = await User.find({ clientId: property.clientId });
//         console.log(`👥 Found ${clientUsers.length} client users for clientId: ${property.clientId}`);
        
//         for (const clientUser of clientUsers) {
//           const clientNotification = {
//             userId: clientUser._id, // This is crucial - client notifications need userId
//             clientId: property.clientId,
//             type: paymentType,
//             title: this.getPaymentTitle(paymentType, 'client'),
//             message: this.getPaymentMessage(paymentType, 'client', amount, property.name),
//             priority: 'medium',
//             metadata: {
//               amount: amount,
//               bookingId: bookingId,
//               propertyId: property._id,
//               propertyName: property.name,
//               paymentType: paymentType,
//               timestamp: new Date().toISOString(),
//               ...metadata
//             },
//             isRead: false
//           };
//           notifications.push(clientNotification);
//           console.log(`✅ Created client notification for user: ${clientUser._id}`);
//         }
//       } else {
//         console.log('⚠️ No clientId found for property:', property?._id);
//       }

//       // Admin notification for all payment types
//       const adminNotification = {
//         adminId: 'admin',
//         type: paymentType,
//         title: this.getPaymentTitle(paymentType, 'admin'),
//         message: this.getPaymentMessage(paymentType, 'admin', amount, property?.name),
//         priority: paymentType === 'payment_failed' ? 'high' : 'medium',
//         metadata: {
//           amount: amount,
//           bookingId: bookingId,
//           propertyId: property?._id,
//           propertyName: property?.name,
//           paymentType: paymentType,
//           timestamp: new Date().toISOString(),
//           ...metadata
//         },
//         isRead: false
//       };
//       notifications.push(adminNotification);

//       // Create all notifications
//       const createdNotifications = await Notification.insertMany(notifications);
//       console.log(`💰 Created ${createdNotifications.length} payment notifications for ${paymentType}`);
//       return createdNotifications;

//     } catch (error) {
//       console.error('❌ Error creating payment notification:', error);
//       throw error;
//     }
//   }

//   // Create booking notification for user, client, and admin
//   static async createBookingNotification(booking, action, additionalData = {}) {
//     try {
//       const notifications = [];
      
//       // Ensure booking is populated with property
//       let populatedBooking = booking;
//       if (typeof booking.populate === 'function') {
//         populatedBooking = await booking.populate('propertyId').populate('userId').execPopulate();
//       } else if (!booking.propertyId || typeof booking.propertyId === 'string') {
//         populatedBooking = await Booking.findById(booking._id)
//           .populate('propertyId')
//           .populate('userId');
//       }

//       const property = populatedBooking.propertyId;
//       const user = populatedBooking.userId;

//       if (!property) {
//         console.error('❌ Property not found for booking notification');
//         throw new Error('Property not found for booking notification');
//       }

//       // User notification
//       if (user) {
//         const userNotification = {
//           userId: user._id,
//           bookingId: populatedBooking._id,
//           propertyId: property._id,
//           type: `booking_${action}`,
//           title: this.getBookingTitle(action, 'user'),
//           message: this.getBookingMessage(action, 'user', property.name, additionalData),
//           priority: this.getBookingPriority(action),
//           metadata: {
//             bookingId: populatedBooking._id,
//             propertyId: property._id,
//             propertyName: property.name,
//             action: action,
//             ...additionalData
//           },
//           isRead: false
//         };
//         notifications.push(userNotification);
//         console.log(`👤 Created user notification for booking ${action}`);
//       }

//        // Client notification - FIXED LOGIC
//       if (property.clientId) {
//         console.log(`🔍 Looking for client users with clientId: ${property.clientId}`);
        
//         const clientUsers = await User.find({ clientId: property.clientId });
//         console.log(`👥 Found ${clientUsers.length} client users for clientId: ${property.clientId}`);
        
//         for (const clientUser of clientUsers) {
//           const clientNotification = {
//             userId: clientUser._id, // This is crucial for client notifications
//             clientId: property.clientId,
//             bookingId: populatedBooking._id,
//             propertyId: property._id,
//             type: `booking_${action}`,
//             title: this.getBookingTitle(action, 'client'),
//             message: this.getBookingMessage(action, 'client', property.name, additionalData),
//             priority: this.getBookingPriority(action),
//             metadata: {
//               bookingId: populatedBooking._id,
//               propertyId: property._id,
//               propertyName: property.name,
//               action: action,
//               ...additionalData
//             },
//             isRead: false
//           };
//           notifications.push(clientNotification);
//           console.log(`🏢 Created client notification for user: ${clientUser._id}`);
//         }
//       } else {
//         console.log('⚠️ No clientId found for property:', property._id);
//       }

//       // Admin notification
//       const adminNotification = {
//         adminId: 'admin',
//         bookingId: populatedBooking._id,
//         propertyId: property._id,
//         type: `booking_${action}`,
//         title: this.getBookingTitle(action, 'admin'),
//         message: this.getBookingMessage(action, 'admin', property.name, additionalData),
//         priority: this.getBookingPriority(action),
//         metadata: {
//           bookingId: populatedBooking._id,
//           propertyId: property._id,
//           propertyName: property.name,
//           action: action,
//           ...additionalData
//         },
//         isRead: false
//       };
//       notifications.push(adminNotification);
//       console.log(`👑 Created admin notification for booking ${action}`);

//       // Create all notifications
//       if (notifications.length > 0) {
//         const createdNotifications = await Notification.insertMany(notifications);
//         console.log(`✅ Created ${createdNotifications.length} notifications for booking ${action}`);
//         return createdNotifications;
//       } else {
//         console.log('⚠️ No notifications created for booking');
//         return [];
//       }
//     } catch (error) {
//       console.error('❌ Error creating booking notifications:', error);
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
//           title: this.getPropertyTitle(action, 'client'),
//           message: this.getPropertyMessage(action, 'client', property.name, additionalData),
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
//         adminId: 'admin',
//         propertyId: property._id,
//         type: `property_${action}`,
//         title: this.getPropertyTitle(action, 'admin'),
//         message: this.getPropertyMessage(action, 'admin', property.name, additionalData),
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

//   // Helper methods for payment notifications
//   static getPaymentTitle(paymentType, recipient) {
//     const titles = {
//       payment_received: {
//         user: 'Payment Received Successfully 💰',
//         client: 'Payment Received',
//         admin: 'Payment Received'
//       },
//       payment_failed: {
//         user: 'Payment Failed ❌',
//         client: 'Payment Failed',
//         admin: 'Payment Failed'
//       },
//       payment_refunded: {
//         user: 'Payment Refunded',
//         client: 'Payment Refunded',
//         admin: 'Payment Refunded'
//       },
//       booking_paid: {
//         user: 'Booking Confirmed! 🎉',
//         client: 'Booking Payment Received',
//         admin: 'Booking Payment Completed'
//       }
//     };
//     return titles[paymentType]?.[recipient] || 'Payment Notification';
//   }

//   static getPaymentMessage(paymentType, recipient, amount, propertyName) {
//     const messages = {
//       payment_received: {
//         user: `Your payment of ₹${amount} has been received successfully. Thank you for your payment!`,
//         client: `Payment of ₹${amount} has been received for booking at ${propertyName}.`,
//         admin: `Payment of ₹${amount} has been received for booking at ${propertyName}.`
//       },
//       payment_failed: {
//         user: `Your payment of ₹${amount} failed. Please try again or contact support if the issue persists.`,
//         client: `Payment of ₹${amount} failed for booking at ${propertyName}.`,
//         admin: `Payment of ₹${amount} failed for booking at ${propertyName}.`
//       },
//       payment_refunded: {
//         user: `Your payment of ₹${amount} has been refunded successfully.`,
//         client: `Payment of ₹${amount} has been refunded for booking at ${propertyName}.`,
//         admin: `Payment of ₹${amount} has been refunded for booking at ${propertyName}.`
//       },
//       booking_paid: {
//         user: `Your booking for "${propertyName}" is now confirmed! Payment of ₹${amount} received. Welcome to your new home! 🏠`,
//         client: `Booking for "${propertyName}" has been paid and confirmed. Payment received: ₹${amount}`,
//         admin: `Booking for "${propertyName}" has been paid and confirmed. Payment received: ₹${amount}`
//       }
//     };
//     return messages[paymentType]?.[recipient] || `Payment of ₹${amount} has been processed.`;
//   }

//   // Helper methods for booking notifications
//   static getBookingTitle(action, recipient) {
//     const titles = {
//       created: {
//         user: 'Booking Submitted Successfully',
//         client: 'New Booking Request',
//         admin: 'New Booking Submitted'
//       },
//       approved: {
//         user: 'Booking Approved! 🎉',
//         client: 'Booking Approved',
//         admin: 'Booking Approved'
//       },
//       rejected: {
//         user: 'Booking Declined',
//         client: 'Booking Rejected',
//         admin: 'Booking Rejected'
//       },
//       cancelled: {
//         user: 'Booking Cancelled',
//         client: 'Booking Cancelled',
//         admin: 'Booking Cancelled'
//       },
//       paid: {
//         user: 'Booking Confirmed! 🎉',
//         client: 'Booking Payment Received',
//         admin: 'Booking Payment Completed'
//       }
//     };
//     return titles[action]?.[recipient] || 'Booking Notification';
//   }

//   static getBookingMessage(action, recipient, propertyName, data) {
//     const messages = {
//       created: {
//         user: `Your booking for "${propertyName}" has been submitted successfully and is under review. You will be notified once it's approved.`,
//         client: `New booking request for "${propertyName}" from a user. Please review and approve.`,
//         admin: `A new booking has been submitted for "${propertyName}".`
//       },
//       approved: {
//         user: `Great news! Your booking for "${propertyName}" has been approved. You can now proceed with the payment to confirm your booking.`,
//         client: `Booking for "${propertyName}" has been approved.`,
//         admin: `Booking for "${propertyName}" has been approved.`
//       },
//       rejected: {
//         user: `Your booking for "${propertyName}" has been declined. Reason: ${data.rejectionReason || 'Not specified'}`,
//         client: `Booking for "${propertyName}" has been rejected.`,
//         admin: `Booking for "${propertyName}" has been rejected.`
//       },
//       cancelled: {
//         user: `Your booking for "${propertyName}" has been cancelled.`,
//         client: `Booking for "${propertyName}" has been cancelled.`,
//         admin: `Booking for "${propertyName}" has been cancelled.`
//       },
//       paid: {
//         user: `Your booking for "${propertyName}" is now confirmed! Payment received. Welcome to your new home! 🏠`,
//         client: `Booking for "${propertyName}" has been paid and confirmed.`,
//         admin: `Booking for "${propertyName}" has been paid and confirmed.`
//       }
//     };
//     return messages[action]?.[recipient] || `Booking update for ${propertyName}.`;
//   }

//   static getBookingPriority(action) {
//     const priorities = {
//       created: 'medium',
//       approved: 'high',
//       rejected: 'medium',
//       cancelled: 'medium',
//       paid: 'high'
//     };
//     return priorities[action] || 'medium';
//   }

//   // Helper methods for property notifications
//   static getPropertyTitle(action, recipient) {
//     const titles = {
//       submitted: {
//         client: 'Property Submitted Successfully',
//         admin: 'New Property Submitted for Approval'
//       },
//       approved: {
//         client: 'Property Approved!',
//         admin: 'Property Approved'
//       },
//       rejected: {
//         client: 'Property Rejected',
//         admin: 'Property Rejected'
//       },
//       revision_requested: {
//         client: 'Revision Requested for Property',
//         admin: 'Revision Requested for Property'
//       },
//       deleted: {
//         client: 'Property Deleted',
//         admin: 'Property Deleted'
//       }
//     };
//     return titles[action]?.[recipient] || 'Property Notification';
//   }

//   static getPropertyMessage(action, recipient, propertyName, data) {
//     const messages = {
//       submitted: {
//         client: `Your property "${propertyName}" has been submitted for admin approval.`,
//         admin: `New property "${propertyName}" has been submitted by client ${data.clientId}. Please review and approve.`
//       },
//       approved: {
//         client: `Congratulations! Your property "${propertyName}" has been approved and is now live on the platform.`,
//         admin: `Property "${propertyName}" has been approved and is now live.`
//       },
//       rejected: {
//         client: `Your property "${propertyName}" was rejected. Reason: ${data.rejectionReason}`,
//         admin: `Property "${propertyName}" has been rejected. Reason: ${data.rejectionReason}`
//       },
//       revision_requested: {
//         client: `Revision requested for your property "${propertyName}". Notes: ${data.revisionNotes}`,
//         admin: `Revision requested for property "${propertyName}". Notes: ${data.revisionNotes}`
//       },
//       deleted: {
//         client: `Your property "${propertyName}" has been deleted successfully.`,
//         admin: `Property "${propertyName}" has been deleted by client ${data.clientId}.`
//       }
//     };
//     return messages[action]?.[recipient] || `Property update for ${propertyName}.`;
//   }
// }

// // Get user notifications
// export const getUserNotifications = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userRole = req.user.role;
    
//     console.log('👤 User notification request:', {
//       userId,
//       userRole,
//       query: req.query
//     });

//     const { page = 1, limit = 20, unreadOnly = false, type } = req.query;

//     const query = { userId: userId };
    
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
//       .populate('bookingId', 'bookingStatus totalAmount moveInDate moveOutDate')
      
//       .lean();

//     const total = await Notification.countDocuments(query);
//     const unreadCount = await Notification.countDocuments({ 
//       userId: userId, 
//       isRead: false 
//     });

//     console.log(`✅ Found ${notifications.length} user notifications for user ${userId}`);

//     res.status(200).json({
//       success: true,
//       notifications: notifications,
//       unreadCount: unreadCount,
//       total: total,
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(total / limit)
//     });

//   } catch (error) {
//     console.error('❌ Get user notifications error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch user notifications',
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
//       notifications: notifications,
//       unreadCount: unreadCount,
//       total: total,
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(total / limit)
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

// // Get admin notifications
// export const getAdminNotifications = async (req, res) => {
//   try {
//     console.log('🔔 Admin notification request received');
//     console.log('User role:', req.user?.role);
//     console.log('User ID:', req.user?.id);
    
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied. Admin role required.'
//       });
//     }

//     const { page = 1, limit = 50, unreadOnly = false, type } = req.query;

//     const query = { 
//       adminId: { $exists: true }
//     };
    
//     if (unreadOnly === 'true') {
//       query.isRead = false;
//     }
    
//     if (type) {
//       query.type = type;
//     }

//     console.log('📋 Admin notification query:', JSON.stringify(query, null, 2));

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
//       notifications: notifications,
//       unreadCount: unreadCount,
//       total: total,
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(total / limit)
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

// // Get notifications based on user role - UNIVERSAL ENDPOINT
// export const getNotifications = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userRole = req.user.role;
    
//     console.log('🔔 Universal notification request:', {
//       userId,
//       userRole,
//       query: req.query
//     });

//     const { page = 1, limit = 20, unreadOnly = false, type } = req.query;

//     let query = {};
    
//     // Build query based on user role
//     if (userRole === 'admin') {
//       query = { adminId: { $exists: true } };
//     } else if (userRole === 'client') {
//       const user = await User.findById(userId);
//       if (!user) {
//         return res.status(404).json({
//           success: false,
//           message: 'User not found'
//         });
//       }
//       query = { 
//         $or: [
//           { clientId: user.clientId },
//           { userId: userId }
//         ]
//       };
//     } else {
//       // Regular user
//       query = { userId: userId };
//     }
    
//     if (unreadOnly === 'true') {
//       query.isRead = false;
//     }
    
//     if (type) {
//       query.type = type;
//     }

//     console.log('🔍 Universal notification query:', query);

//     const notifications = await Notification.find(query)
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .populate('propertyId', 'name locality city images')
//       .populate('bookingId', 'bookingStatus totalAmount')
//       .populate('userId', 'name email phone')
//       .lean();

//     const total = await Notification.countDocuments(query);
//     const unreadCount = await Notification.countDocuments({ 
//       ...query, 
//       isRead: false 
//     });

//     console.log(`✅ Found ${notifications.length} notifications for ${userRole} ${userId}`);

//     res.status(200).json({
//       success: true,
//       notifications: notifications,
//       unreadCount: unreadCount,
//       total: total,
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(total / limit),
//       userInfo: {
//         userId,
//         role: userRole
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get notifications error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch notifications',
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
//       unreadCount: unreadCount
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
//       // For regular users, only allow marking their own notifications as read
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
//     const user = await User.findById(userId).select('name email role clientId');
    
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

// // Create test notification for user
// export const createTestUserNotification = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     const testNotification = {
//       userId: userId,
//       type: 'booking_approved',
//       title: 'Test User Notification',
//       message: 'This is a test notification for user',
//       priority: 'medium',
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

// // Create test payment notification for user
// export const createTestPaymentNotification = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     const testNotification = {
//       userId: userId,
//       type: 'payment_received',
//       title: 'Test Payment Notification',
//       message: 'This is a test payment notification for user',
//       priority: 'medium',
//       metadata: {
//         test: true,
//         amount: 1000,
//         timestamp: new Date().toISOString()
//       },
//       isRead: false
//     };

//     const notification = await NotificationService.createNotification(testNotification);

//     res.status(200).json({
//       success: true,
//       message: 'Test payment notification created successfully',
//       data: notification
//     });
//   } catch (error) {
//     console.error('Create test payment notification error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create test payment notification',
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