import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  // User who is contacting (tenant)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userPhone: {
    type: String
  },
  
  // Property being contacted about
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  propertyName: {
    type: String,
    required: true
  },
  
  // Client/Owner being contacted
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientPhone: {
    type: String
  },
  
  // Contact details
  contactMethod: {
    type: String,
    enum: ['call', 'chat'],
    required: true
  },
  contactType: {
    type: String,
    enum: ['inquiry', 'booking', 'general'],
    default: 'inquiry'
  },
  message: {
    type: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'contacted', 'responded'],
    default: 'contacted'
  },
  contactedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
contactSchema.index({ userId: 1, contactedAt: -1 });
contactSchema.index({ clientId: 1 });
contactSchema.index({ propertyId: 1 });

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;