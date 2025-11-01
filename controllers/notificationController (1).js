import Notification from "../models/Notification.js";

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(notifications); // should be array, not { notifications }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error });
  }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to mark as read", error });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark all as read", error });
  }
};
