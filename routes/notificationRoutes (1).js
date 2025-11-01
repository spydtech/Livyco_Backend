import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';

const router = express.Router();

// Get notifications for a user
router.get('/:userId', getNotifications);

// Mark single notification as read
router.patch('/read/:id', markAsRead);

// Mark all notifications as read
router.patch('/read-all/:userId', markAllAsRead);

export default router;
