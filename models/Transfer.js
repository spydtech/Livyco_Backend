// import mongoose from 'mongoose';

// const transferSchema = new mongoose.Schema({
//   bookingId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Booking',
//     required: true
//   },
//   clientId: {
//     type: String,
//     required: true
//   },
//   propertyId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Property'
//   },
//   bankAccountId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'BankAccount',
//     required: true
//   },
//   amount: {
//     type: Number,
//     required: true
//   },
//   currency: {
//     type: String,
//     default: 'INR'
//   },
//   status: {
//     type: String,
//     enum: ['initiated', 'processing', 'completed', 'failed'],
//     default: 'initiated'
//   },
//   initiatedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   notes: String,
//   manualTransfer: {
//     type: Boolean,
//     default: false
//   },
//   transferDetails: {
//     accountHolderName: String,
//     accountNumber: String,
//     bankName: String,
//     ifscCode: String,
//     branchName: String,
//     utrNumber: String,
//     transactionReference: String
//   },
//   razorpayPayoutId: String,
//   failureReason: String
// }, {
//   timestamps: true
// });

// const Transfer = mongoose.model('Transfer', transferSchema);
// export default Transfer;





import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
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
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'manual_pending', 'reversed'],
    default: 'pending'
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  
  // Razorpay fields
  razorpayPayoutId: String,
  razorpayContactId: String,
  razorpayFundAccountId: String,
  
  // Transfer details
  transferDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    paymentAmount: Number,
    platformCommission: Number,
    gstOnCommission: Number,
    totalPlatformEarnings: Number,
    razorpayData: {
      payoutId: String,
      status: String,
      utr: String,
      fees: Number,
      tax: Number,
      mode: String,
      reference_id: String
    }
  },
  
  // Transfer type
  razorpayTransfer: {
    type: Boolean,
    default: false
  },
  manualTransfer: {
    type: Boolean,
    default: false
  },
  testMode: {
    type: Boolean,
    default: false
  },
  liveMode: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Transfer', transferSchema);