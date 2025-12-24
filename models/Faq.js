import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['general', 'booking', 'payment', 'amenities', 'rules', 'safety', 'technical'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  keywords: [String],
  priority: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  notHelpfulCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const FAQ = mongoose.model('FAQ', faqSchema);
export default FAQ;