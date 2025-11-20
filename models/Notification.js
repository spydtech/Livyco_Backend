// import mongoose from 'mongoose';

// const notificationSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: false
//   },
//   clientId: {
//     type: String,
//     ref: 'User',
//     required: false
//   },
//   adminId: {
//     type: mongoose.Schema.Types.Mixed,
//     required: false
//   },
//   propertyId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Property',
//     required: false
//   },
//   bookingId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Booking',
//     required: false
//   },
//   type: {
//     type: String,
//     enum: [
//       'property_submitted',
//       'property_approved',
//       'property_rejected',
//       'property_revision_requested',
//       'property_deleted',
//       'booking_created',
//       'booking_approved',
//       'booking_rejected',
//       'booking_cancelled',
//       'booking_paid',
//       'payment_received',
//       'payment_failed',
//       'payment_refunded',
//       'tenant_added',
//       'property_updated',
//       'system_alert',
//       'reminder'
//     ],
//     required: true
//   },
//   title: {
//     type: String,
//     required: true
//   },
//   message: {
//     type: String,
//     required: true
//   },
//   isRead: {
//     type: Boolean,
//     default: false
//   },
//   priority: {
//     type: String,
//     enum: ['low', 'medium', 'high'],
//     default: 'medium'
//   },
//   metadata: {
//     type: Object,
//     default: {}
//   }
// }, {
//   timestamps: true
// });

// // Index for faster queries
// notificationSchema.index({ userId: 1, createdAt: -1 });
// notificationSchema.index({ clientId: 1, createdAt: -1 });
// notificationSchema.index({ adminId: 1, createdAt: -1 });
// notificationSchema.index({ isRead: 1 });
// notificationSchema.index({ type: 1 });

// const Notification = mongoose.model('Notification', notificationSchema);
// export default Notification;




import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  clientId: {
    type: String,
    required: false
  },
  adminId: {
    type: String,
    required: false,
    default: null
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: false
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: false
  },
  type: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ clientId: 1, createdAt: -1 });
notificationSchema.index({ adminId: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;