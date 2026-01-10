import mongoose from 'mongoose';

const manualTransferSchema = new mongoose.Schema({
  // Basic Info
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  clientName: {
    type: String,
    required: true
  },
  
  // Amount Details
  originalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  platformCommission: {
    type: Number,
    default: 0
  },
  
  gstOnCommission: {
    type: Number,
    default: 0
  },
  
  // ManualTransfer 
transferAmount: {
  type: Number,
  default: 0,
  min: 0
},
  // Bank Details
  bankAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  bankDetails: {
    accountHolderName: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String
  },
  
  // Transaction Info
  transactionReference: {
    type: String,
    required: true,
    unique: true
  },
  
  utrNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  paymentMode: {
    type: String,
    default: 'Bank Transfer'
  },
  
  screenshotUrl: String,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  
  notes: String,
  
  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


manualTransferSchema.pre('save', function(next) {
  
  this.platformCommission = this.originalAmount * 0.05;
  this.gstOnCommission = this.platformCommission * 0.18;
  this.transferAmount = this.originalAmount - (this.platformCommission + this.gstOnCommission);
  
  // Update timestamp
  this.updatedAt = Date.now();
  
  next();
});

const ManualTransfer = mongoose.model('ManualTransfer', manualTransferSchema);
export default ManualTransfer;