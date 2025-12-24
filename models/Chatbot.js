import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userType: {
    type: String,
    enum: ['user', 'client', 'guest'],
    default: 'guest'
  },
  message: {
    type: String,
    required: true
  },
  intent: {
    type: String,
    enum: ['greeting', 'availability', 'pricing', 'booking', 'contact', 'support', 'other'],
    default: 'other'
  },
  response: {
    type: String,
    required: true
  },
  quickReplies: [{
    text: String,
    action: String
  }],
  actions: [{
    type: String,
    url: String,
    label: String
  }],
  isBot: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userType: {
    type: String,
    enum: ['user', 'client', 'guest'],
    default: 'guest'
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ sessionId: 1, timestamp: -1 });
sessionSchema.index({ userId: 1 });
sessionSchema.index({ 'lastInteraction': -1 });

const ChatbotMessage = mongoose.model('ChatbotMessage', messageSchema);
const ChatbotSession = mongoose.model('ChatbotSession', sessionSchema);

export { ChatbotMessage, ChatbotSession };