import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  clientId: {
    type: String,
    required: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  bankAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['initiated', 'processing', 'completed', 'failed'],
    default: 'initiated'
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String,
  manualTransfer: {
    type: Boolean,
    default: false
  },
  transferDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    branchName: String,
    utrNumber: String,
    transactionReference: String
  },
  razorpayPayoutId: String,
  failureReason: String
}, {
  timestamps: true
});

const Transfer = mongoose.model('Transfer', transferSchema);
export default Transfer;