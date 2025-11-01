import mongoose from 'mongoose';

const customReviewSchema = new mongoose.Schema({
  // Direct fields for custom reviews (no user reference needed)
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userAvatar: {
    type: String,
    default: ''
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // Auto-approve custom reviews since admin creates them
  },
  adminResponse: {
    type: String,
    default: ''
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isCustom: {
    type: Boolean,
    default: true
  },
  // Admin who created this review
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Index for better query performance
customReviewSchema.index({ propertyId: 1, status: 1 });
customReviewSchema.index({ isFeatured: -1, createdAt: -1 });

export default mongoose.model('CustomReview', customReviewSchema);