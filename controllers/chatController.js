// controllers/chatController.js
// controllers/chatController.js
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import { NotificationService } from '../controllers/notificationController.js';

// Get all conversations for a user (EXCLUDE ADMIN COMPLETELY)
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('role');
    
    // If user is admin, return empty conversations
    if (user.role === 'admin') {
      return res.status(200).json({
        success: true,
        conversations: []
      });
    }

    // Find all unique users this user has chatted with
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { recipient: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
              "$recipient",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          property: { $first: "$property" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        // Filter out admin users from conversations
        $match: {
          "user.role": { $ne: "admin" }
        }
      },
      {
        $lookup: {
          from: "properties",
          localField: "property",
          foreignField: "_id",
          as: "property"
        }
      },
      {
        $unwind: "$property"
      },
      {
        $project: {
          "user._id": 1,
          "user.name": 1,
          "user.profileImage": 1,
          "user.online": 1,
          "user.role": 1,
          "lastMessage.content": 1,
          "lastMessage.createdAt": 1,
          "lastMessage.read": 1,
          "property._id": 1,
          "property.name": 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
};

// Get messages between two users for a specific property
export const getMessages = async (req, res) => {
  try {
    const { recipientId, propertyId } = req.params;
    const userId = req.user.id;

    // Check if user is admin
    const user = await User.findById(userId).select('role');
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin cannot access chat messages'
      });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(recipientId) || 
        !mongoose.Types.ObjectId.isValid(propertyId) ||
        !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    // Check if recipient is admin
    const recipient = await User.findById(recipientId).select('role');
    if (recipient && recipient.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot access admin messages'
      });
    }

    // Mark messages as read
    await Message.updateMany(
      {
        sender: recipientId,
        recipient: userId,
        property: propertyId,
        read: false
      },
      { $set: { read: true } }
    );

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId, property: propertyId },
        { sender: recipientId, recipient: userId, property: propertyId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name profileImage role');

    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// Send a message with notifications (COMPLETELY EXCLUDE ADMIN)
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, propertyId, content } = req.body;
    const senderId = req.user.id;

    if (!recipientId || !propertyId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Recipient, property, and content are required'
      });
    }

    // Check if sender is admin
    const sender = await User.findById(senderId).select('role');
    if (sender.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin cannot send chat messages'
      });
    }

    // Check if recipient is admin
    const recipient = await User.findById(recipientId).select('role');
    if (recipient && recipient.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send messages to admin users'
      });
    }

    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      property: propertyId,
      content
    });

    await message.save();

    // Update last message for both users (only if not admin)
    await User.findByIdAndUpdate(senderId, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt
    });

    await User.findByIdAndUpdate(recipientId, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt
    });

    // Populate sender info for real-time updates
    const populatedMessage = await Message.populate(message, {
      path: 'sender',
      select: 'name profileImage'
    });

    // ✅ ADD CHAT NOTIFICATIONS (ONLY FOR USER ↔ CLIENT)
    try {
      // Get sender and recipient details
      const [senderUser, recipientUser, property] = await Promise.all([
        User.findById(senderId).select('name role clientId'),
        User.findById(recipientId).select('name role clientId'),
        Property.findById(propertyId).select('name clientId')
      ]);

      if (senderUser && recipientUser && property) {
        // Only notify if both are non-admin
        if (senderUser.role !== 'admin' && recipientUser.role !== 'admin') {
          const notificationType = 'chat_message_received';
          const senderName = senderUser.name || 'User';
          const propertyName = property.name || 'Property';

          // Create notification for recipient
          await NotificationService.createNotification({
            userId: recipientId,
            type: notificationType,
            title: 'New Message',
            message: `New message from ${senderName} about ${propertyName}`,
            priority: 'medium',
            metadata: {
              messageId: message._id,
              senderId: senderId,
              senderName: senderName,
              recipientId: recipientId,
              propertyId: propertyId,
              propertyName: propertyName,
              content: content.substring(0, 100), // First 100 chars
              action: 'chat_message'
            }
          });

          console.log('✅ Chat notification created for:', recipientUser.role);
        }

        // Only notify admin about urgent messages
        if (content.toLowerCase().includes('urgent') || content.toLowerCase().includes('emergency')) {
          const senderName = senderUser.name || 'User';
          const propertyName = property.name || 'Property';
          
          await NotificationService.createNotification({
            adminId: 'admin',
            type: 'chat_urgent_message',
            title: 'Urgent Chat Message',
            message: `Urgent message from ${senderName} about ${propertyName}`,
            priority: 'high',
            metadata: {
              messageId: message._id,
              senderId: senderId,
              senderName: senderName,
              propertyId: propertyId,
              propertyName: propertyName,
              content: content.substring(0, 100),
              action: 'urgent_chat'
            }
          });

          console.log('⚠️ Urgent message notification sent to admin');
        }
      }
    } catch (notificationError) {
      console.error('❌ Error creating chat notification:', notificationError);
      // Don't fail the message send if notifications fail
    }

    res.status(201).json({
      success: true,
      message: populatedMessage
    });

    // Emit real-time event (handled by WebSocket)
    if (req.io) {
      const recipientSocket = req.connectedUsers[recipientId];
      if (recipientSocket) {
        req.io.to(recipientSocket).emit('newMessage', populatedMessage);
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Get unread message count (EXCLUDE ADMIN COMPLETELY)
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user is admin
    const user = await User.findById(userId).select('role');
    if (user.role === 'admin') {
      return res.status(200).json({
        success: true,
        count: 0
      });
    }

    // Get count of unread messages where sender is not admin
    const count = await Message.aggregate([
      {
        $match: {
          recipient: new mongoose.Types.ObjectId(userId),
          read: false
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'senderInfo'
        }
      },
      {
        $unwind: '$senderInfo'
      },
      {
        $match: {
          'senderInfo.role': { $ne: 'admin' }
        }
      },
      {
        $count: 'count'
      }
    ]);

    res.status(200).json({
      success: true,
      count: count[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.id;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: 'Message IDs array is required'
      });
    }

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        recipient: userId
      },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};