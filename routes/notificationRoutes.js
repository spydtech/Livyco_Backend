// import express from 'express';
// import {
//   getUserNotifications,
//   getClientNotifications,
//   getAdminNotifications,
//   markAsRead,
//   markAllAsRead,
//   getUnreadCount,
//   deleteNotification,
//   getAllNotificationsDebug,
//   createTestAdminNotification
// } from '../controllers/notificationController.js';
// import { verifyToken } from '../utils/jwtUtils.js';
// import { protectAdmin } from '../middlewares/authMiddleware.js';

// const router = express.Router();

// // All routes are protected
// router.use(verifyToken);

// // Get notifications based on user role

// router.get('/', (req, res) => {
//   console.log('🔔 Notification route - User role:', req.user.role);
//   console.log('🔔 User ID:', req.user.id);
  
//   // Add more specific role checks
//   if (req.user.role === 'admin') {
//     console.log('📋 Routing to admin notifications');
//     return getAdminNotifications(req, res);
//   } else if (req.user.role === 'client') {
//     console.log('📋 Routing to client notifications');
//     return getClientNotifications(req, res);
//   } else if (req.user.role === 'user') {
//     console.log('📋 Routing to user notifications');
//     return getUserNotifications(req, res);
//   } else {
//     console.log('❌ Unknown role, defaulting to user notifications');
//     return getUserNotifications(req, res);
//   }
// });

// router.get('/unread-count', getUnreadCount);
// router.patch('/read/:notificationId', markAsRead);
// router.patch('/read-all', markAllAsRead);
// router.delete('/:notificationId', deleteNotification);

// // Debug and test routes for admin
// router.get('/debug/all', protectAdmin, getAllNotificationsDebug);
// router.post('/test/admin', protectAdmin, createTestAdminNotification);

// export default router;




import express from 'express';
import {
  getUserNotifications,
  getClientNotifications,
  getAdminNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  // getAllNotificationsDebug,
  createTestAdminNotification,
  getUserNotificationsDebug,
  createTestUserNotification,
  createTestPaymentNotification
} from '../controllers/notificationController.js';
import { verifyToken } from '../utils/jwtUtils.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(verifyToken);

// Get notifications based on user role - FIXED VERSION
router.get('/', (req, res) => {
  console.log('🔔 Notification route - User role:', req.user.role);
  console.log('🔔 User ID:', req.user.id);
  
  // Simplified role routing
  if (req.user.role === 'admin') {
    console.log('📋 Routing to admin notifications');
    return getAdminNotifications(req, res);
  } else if (req.user.role === 'client') {
    console.log('📋 Routing to client notifications');
    return getClientNotifications(req, res);
  } else {
    
    // For all other roles (user, customer, tenant, etc.), use user notifications
    console.log('📋 Routing to user notifications');
    return getUserNotifications(req, res);
  }
});

router.get('/unread-count', getUnreadCount);
router.patch('/read/:notificationId', markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:notificationId', deleteNotification);

// Debug and test routes
// router.get('/debug/all', protectAdmin, getAllNotificationsDebug);
router.get('/debug/user', getUserNotificationsDebug);
router.post('/test/user', createTestUserNotification);
router.post('/test/payment', createTestPaymentNotification);
router.post('/test/admin', protectAdmin, createTestAdminNotification);

export default router;