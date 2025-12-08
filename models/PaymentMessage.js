import mongoose from "mongoose";

const paymentMessageSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    paymentInfo: {
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded", "partial"],
        default: "pending",
      },
      paymentMethod: {
        type: String,
        default: "razorpay",
      },
      transactionId: String,
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      razorpayUTR: String,
      paidAmount: {
        type: Number,
        default: 0,
      },
      paymentDate: Date,
    },

    pricing: {
      advanceAmount: Number,
      securityDeposit: Number,
      totalAmount: Number,
      monthlyRent: Number,
      totalRent: Number,
      maintenanceFee: {
        type: Number,
        default: 0,
      },
    },

    transferDetails: {
      totalAmount: Number,
      platformCommission: Number,
      gstOnCommission: Number,
      totalPlatformEarnings: Number,
      clientAmount: Number,
      clientTransferStatus: {
        type: String,
        enum: [
          "pending",
          "processing",
          "completed",
          "failed",
          "pending_bank_details",
          "manual_pending",
        ],
        default: "manual_pending",
      },
      bankAccount: {
        accountNumber: String,
        bankName: String,
        ifscCode: String,
        accountHolderName: String,
      },
      payoutId: String,
      clientTransferProcessedAt: Date,
      completedAt: Date,
      transferError: String,
      transferNotes: String,
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      processedAt: Date,
      breakdown: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },

    payments: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        amount: {
          type: Number,
          required: true,
        },
        method: {
          type: String,
          default: "razorpay",
        },
        transactionId: String,
        status: {
          type: String,
          enum: ["pending", "completed", "failed", "refunded"],
          default: "pending",
        },
        description: String,
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,

        review: {
          rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null
          },
          comment: {
            type: String,
            default: null
          },
          reviewDate: {
            type: Date,
            default: null
          },
        },
        
        type: {
          type: String,
          enum: ["rent", "booking", "security_deposit", "maintenance", "other"],
          default: "rent"
        },
        month: String,
        year: Number,
        dueDate: Date,
        paidDate: {
          type: Date,
          default: Date.now
        }
      }
    ],

    paymentrequest: [{
      date: {
        type: Date,
        default: Date.now
      },
      amount: {
        type: Number,
        required: true
      },
      message: {
        type: String,
        required: true
      },
      type: {
        type: String,
      },
      userId: {
        type: String,
        required: true
      },
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true
      },
      status: {
        type: String,
        enum: ["pending", "paid", "cancelled"],
        default: "pending"
      },
      dueDate: {
        type: Date
      }
    }], 

    note: String,
  },
  { timestamps: true }
);

// Add method to add payment request
paymentMessageSchema.methods.addPaymentRequest = function(paymentRequestData) {
  this.paymentrequest.push(paymentRequestData);
  return this.save();
};

const PaymentMessage = mongoose.model("PaymentMessage", paymentMessageSchema);
export default PaymentMessage;