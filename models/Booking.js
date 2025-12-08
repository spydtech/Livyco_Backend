// // models/Booking.js
// import mongoose from 'mongoose';

// const bookingSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User', // Reference to the User model (assuming you have one)
//     required: true
//   },
 
//   // clientId: {
//   //   type: String,
//   //   required: true
//   // },
 
//   propertyId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Property', // Reference to the Property model
//     required: true
//   },
//   roomType: { // Stores a snapshot of the room type details at the time of booking
//     typeId: { // The actual _id of the roomType subdocument from the Room model
//       type: mongoose.Schema.Types.ObjectId,
//       required: true
//       // ref: 'Room.roomTypes' is conceptual; Mongoose doesn't populate subdocument refs directly.
//       // We manually fetch this in the controller.
//     },
//     name: { // Store the name (e.g., 'single', 'double') for easier access
//       type: String,
//       required: true
//     },
//     capacity: { // Store capacity for convenience
//       type: Number,
//       required: true
//     }
//   },
//   room: { // Specific room details (e.g., A-100 on Floor 1)
//     number: { // The specific room number (e.g., "A-100")
//       type: String,
//       required: true
//     },
//     floor: { // The floor number where the room is located
//       type: Number,
//       required: true
//     }
//   },
//   moveInDate: {
//     type: Date,
//     required: true
//   },
//   moveOutDate: Date, // Optional: Booking can be open-ended if not provided

//   pricing: { // Nested object to hold pricing details for consistency
//     monthlyRent: {
//       type: Number,
//       required: true
//     },
//     securityDeposit: {
//       type: Number,
//       required: true
//     },
//     maintenanceFee: { // Optional: If you collect this
//       type: Number,
//       default: 0
//     }
//   },

//   bookingStatus: {
//     type: String,
//     enum: ['pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out', 'terminated'],
//     default: 'pending' // Most new bookings start as pending approval/payment
//   },
//   paymentStatus: {
//     type: String,
//     enum: ['pending', 'partial', 'paid', 'refunded', 'failed'],
//     default: 'pending'
//   },

//   amenitiesIncluded: [String], // Optional: Could be populated from roomType.amenities
//   specialRequests: String,    // Optional field for tenant requests

//   // Mongoose will automatically add `createdAt` and `updatedAt` fields.
// }, { timestamps: true });

// // Compound index to help prevent duplicate bookings for the exact same room on the same move-in date.
// // Note: The controller also includes a more robust check for date *overlaps*.
// // bookingSchema.index({
// //   propertyId: 1,
// //   'room.number': 1,
// //   moveInDate: 1
// // }, { unique: true });

// const Booking = mongoose.model('Booking', bookingSchema);
// export default Booking;

// import mongoose from 'mongoose';

// const bookingSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   clientId: {
//     type: String,
//     required: true,
//   },
//   propertyId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Property',
//     required: true,
//   },
//   roomType: {
//     typeId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     capacity: {
//       type: Number,
//       required: true,
//     },
//   },
//   room: {
//     number: {
//       type: String,
//       required: true,
//     },
//     floor: {
//       type: Number,
//       required: true,
//     },
//     bed: {
//       type: String,
//       required: true,
//     },
//   },
//   moveInDate: {
//     type: Date,
//     required: true,
//   },
//   moveOutDate: {
//     type: Date,
//   },
//   pricing: {
//     monthlyRent: {
//       type: Number,
//       required: true,
//     },
//     securityDeposit: {
//       type: Number,
//       required: true,
//     },
//     maintenanceFee: {
//       type: Number,
//       default: 0,
//     },
//   },
//   bookingStatus: {
//     type: String,
//     enum: ['pending', 'approved', 'confirmed', 'cancelled', 'checked_in', 'checked_out', 'rejected', 'terminated'],
//     default: 'pending',
//   },
//   paymentStatus: {
//     type: String,
//     enum: ['pending', 'partial', 'paid', 'refunded', 'failed'],
//     default: 'pending',
//   },
//   amenitiesIncluded: [String],
//   specialRequests: String,
//   personCount: {
//     type: Number,
//     default: 1
//   },
//   approvedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   },
//   approvedAt: {
//     type: Date,
//   },
//   rejectedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   },
//   rejectionReason: {
//     type: String,
//   },
//   rejectedAt: {
//     type: Date,
//   }
// }, { timestamps: true });

// // Updated compound index to include bed number
// bookingSchema.index({
//   propertyId: 1,
//   'room.number': 1,
//   'room.bed': 1,
//   moveInDate: 1,
//   bookingStatus: 1
// }, { 
//   unique: true,
//   partialFilterExpression: {
//     bookingStatus: { $in: ['pending', 'approved', 'confirmed', 'checked_in'] }
//   }
// });

// const Booking = mongoose.model('Booking', bookingSchema);
// export default Booking;


// import mongoose from 'mongoose';

// const bookingSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   clientId: {
//     type: String,
//     required: true,
//   },
//   propertyId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Property',
//     required: true,
//   },
//   roomType: {
//     type: {
//       type: String,
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     capacity: {
//       type: Number,
//       required: true,
//     },
//   },
//   roomDetails: [{
//     roomIdentifier: {
//       type: String,
//       required: true,
//     },
//     sharingType: {
//       type: String,
//       required: true,
//     },
//     floor: {
//       type: Number,
//       required: true,
//     },
//     roomNumber: {
//       type: String,
//       required: true,
//     },
//     bed: {
//       type: String,
//       required: true,
//     }
//   }],
//   moveInDate: {
//     type: Date,
//     required: true,
//   },
//   personCount: {
//     type: Number,
//     required: true,
//   },
//   customerDetails: {
//     name: String,
//     age: Number,
//     gender: String,
//     mobile: String,
//     email: String,
//     idProofType: String,
//     idProofNumber: String,
//     idProofFile: String,
//     purpose: String,
//     saveForFuture: Boolean
//   },
//   pricing: {
//     monthlyRent: {
//       type: Number,
//       required: true,
//     },
//     securityDeposit: {
//       type: Number,
//       required: true,
//     },
//     maintenanceFee: {
//       type: Number,
//       default: 0,
//     },
//   },
//   paymentInfo: {
//     amountPaid: {
//       type: Number,
//       default: 0
//     },
//     paymentMethod: {
//       type: String,
//       default: 'razorpay'
//     },
//     paymentStatus: {
//       type: String,
//       enum: ['pending', 'partial', 'completed', 'refunded', 'failed'],
//       default: 'pending'
//     },
//     transactionId: String,
//     paymentDate: Date
//   },
// bookingStatus: {
//   type: String,
//   enum: ['pending', 'approved', 'confirmed', 'cancelled', 'checked_in', 'checked_out', 'terminated'],
//   default: 'pending',
// },

//   amenitiesIncluded: [String],
//   specialRequests: String,
  

  
//   approvedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   },
//   approvedAt: {
//     type: Date,
//   }
// }, { timestamps: true });

// // Index for efficient querying
// bookingSchema.index({ userId: 1, createdAt: -1 });
// bookingSchema.index({ propertyId: 1, bookingStatus: 1 });
// bookingSchema.index({ 'roomDetails.roomIdentifier': 1, moveInDate: 1 });

// const Booking = mongoose.model('Booking', bookingSchema);
// export default Booking;


// import mongoose from 'mongoose';

// const bookingSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   clientId: {
//     type: String,
//     required: true,
//   },
//   propertyId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Property',
//     required: true,
//   },
//   roomType: {
//     type: {
//       type: String,
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     capacity: {
//       type: Number,
//       required: true,
//     },
//   },
//   roomDetails: [{
//     roomIdentifier: {
//       type: String,
//       required: true,
//     },
//     sharingType: {
//       type: String,
//       required: true,
//     },
//     floor: {
//       type: Number,
//       required: true,
//     },
//     roomNumber: {
//       type: String,
//       required: true,
//     },
//     bed: {
//       type: String,
//       required: true,
//     }
//   }],
//   moveInDate: {
//     type: Date,
//     required: true,
//   },
//   personCount: {
//     type: Number,
//     required: true,
//   },
//   customerDetails: {
//     name: String,
//     age: Number,
//     gender: String,
//     mobile: String,
//     email: String,
//     idProofType: String,
//     idProofNumber: String,
//     idProofFile: String,
//     purpose: String,
//     saveForFuture: Boolean
//   },
//   pricing: {
//     monthlyRent: {
//       type: Number,
//       required: true,
//     },
//     securityDeposit: {
//       type: Number,
//       required: true,
//     },
//     maintenanceFee: {
//       type: Number,
//       default: 0,
//     },
//   },
//   paymentInfo: {
//     amountPaid: {
//       type: Number,
//       default: 0
//     },
//     paymentMethod: {
//       type: String,
//       default: 'razorpay'
//     },
//     paymentStatus: {
//       type: String,
//       enum: ['pending', 'partial', 'completed', 'refunded', 'failed'],
//       default: 'pending'
//     },
//     transactionId: String,
//     paymentDate: Date
//   },
//   bookingStatus: {
//     type: String,
//     enum: ['pending', 'approved', 'confirmed', 'cancelled', 'checked_in', 'checked_out', 'terminated'],
//     default: 'pending',
//   },
//   amenitiesIncluded: [String],
//   specialRequests: String,
  
//   // Payment tracking
//   payments: [{
//     date: Date,
//     amount: Number,
//     method: {
//       type: String,
//       enum: ['online', 'offline', 'wallet','cash', 'bank_transfer']
//     },
//     transactionId: String,
//     status: {
//       type: String,
//       enum: ['pending', 'completed', 'failed', 'refunded'],
//       default: 'pending'
//     },
//     description: String
//   }],
  
//   // Outstanding amount tracking
//   outstandingAmount: {
//     type: Number,
//     default: 0
//   },
  
//   approvedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   },
//   approvedAt: {
//     type: Date,
//   },
  
//   // Reference to vacate request (if any)
//   vacateRequestId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'VacateRequest',
//   },
//   // Checkout information
//   checkoutDate: {
//     type: Date
//   },
//   checkoutStatus: {
//     type: String,
//     enum: ['pending', 'approved', 'completed'],
//     default: 'pending'
//   }
// }, { timestamps: true });

// // Index for efficient querying
// bookingSchema.index({ userId: 1, createdAt: -1 });
// bookingSchema.index({ propertyId: 1, bookingStatus: 1 });
// bookingSchema.index({ 'roomDetails.roomIdentifier': 1, moveInDate: 1 });
// bookingSchema.index({ clientId: 1 });

// // Calculate outstanding amount before saving
// bookingSchema.pre('save', function(next) {
//   if (this.isModified('payments') || this.isModified('pricing')) {
//     const totalPaid = this.payments
//       .filter(p => p.status === 'completed')
//       .reduce((sum, payment) => sum + payment.amount, 0);
    
//     const totalDue = (this.pricing.monthlyRent || 0) + 
//                     (this.pricing.securityDeposit || 0) + 
//                     (this.pricing.maintenanceFee || 0);
    
//     this.outstandingAmount = Math.max(0, totalDue - totalPaid);
    
//     // Update payment status based on outstanding amount
//     if (totalPaid >= totalDue) {
//       this.paymentInfo.paymentStatus = 'completed';
//       this.paymentInfo.amountPaid = totalPaid;
//     } else if (totalPaid > 0) {
//       this.paymentInfo.paymentStatus = 'partial';
//       this.paymentInfo.amountPaid = totalPaid;
//     } else {
//       this.paymentInfo.paymentStatus = 'pending';
//       this.paymentInfo.amountPaid = 0;
//     }
//   }
//   next();
// });

// // Virtual for total amount due
// bookingSchema.virtual('totalAmountDue').get(function() {
//   return (this.pricing.monthlyRent || 0) + 
//          (this.pricing.securityDeposit || 0) + 
//          (this.pricing.maintenanceFee || 0);
// });

// // Virtual for amount paid
// bookingSchema.virtual('amountPaid').get(function() {
//   return this.payments
//     .filter(p => p.status === 'completed')
//     .reduce((sum, payment) => sum + payment.amount, 0);
// });

// const Booking = mongoose.model('Booking', bookingSchema);
// export default Booking;


// import mongoose from 'mongoose';

// const bookingSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   clientId: {
//     type: String,
//     required: true,
//   },
//   propertyId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Property',
//     required: true,
//   },
//   roomType: {
//     type: {
//       type: String,
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     capacity: {
//       type: Number,
//       required: true,
//     },
//   },
//   roomDetails: [{
//     roomIdentifier: {
//       type: String,
//       required: true,
//     },
//     sharingType: {
//       type: String,
//       required: true,
//     },
//     floor: {
//       type: Number,
//       required: true,
//     },
//     roomNumber: {
//       type: String,
//       required: true,
//     },
//     bed: {
//       type: String,
//       required: true,
//     }
//   }],
//   moveInDate: {
//     type: Date,
//     required: true,
//   },
//   personCount: {
//     type: Number,
//     required: true,
//   },
//   customerDetails: {
//     name: String,
//     age: Number,
//     gender: String,
//     mobile: String,
//     email: String,
//     idProofType: String,
//     idProofNumber: String,
//     idProofFile: String,
//     purpose: String,
//     saveForFuture: Boolean
//   },
//   pricing: {
//     monthlyRent: {
//       type: Number,
//       required: true,
//     },
//     securityDeposit: {
//       type: Number,
//       required: true,
//     },
//     maintenanceFee: {
//       type: Number,
//       default: 0,
//     },
//   },
//   paymentInfo: {
//     amountPaid: {
//       type: Number,
//       default: 0
//     },
//     paymentMethod: {
//       type: String,
//       default: 'razorpay'
//     },
//     paymentStatus: {
//       type: String,
//       enum: ['pending', 'partial', 'completed', 'refunded', 'failed'],
//       default: 'pending'
//     },
//     transactionId: String,
//     paymentDate: Date
//   },
//   bookingStatus: {
//     type: String,
//     enum: ['pending', 'approved', 'confirmed', 'cancelled', 'checked_in', 'checked_out', 'terminated'],
//     default: 'pending',
//   },
//   amenitiesIncluded: [String],
//   specialRequests: String,
  
//   // Payment tracking
//   payments: [{
//     date: {
//       type: Date,
//       default: Date.now
//     },
//     amount: {
//       type: Number,
//       required: true
//     },
//     method: {
//       type: String,
//       enum: ['online', 'offline', 'wallet', 'cash', 'bank_transfer'],
//       required: true
//     },
//     transactionId: String,
//     status: {
//       type: String,
//       enum: ['pending', 'completed', 'failed', 'refunded'],
//       default: 'pending'
//     },
//     description: String,
//     razorpayOrderId: String,
//     razorpayPaymentId: String,
//     razorpaySignature: String
//   }],
  
//   // Outstanding amount tracking
//   outstandingAmount: {
//     type: Number,
//     default: 0
//   },
  
//   approvedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   },
//   approvedAt: {
//     type: Date,
//   },
  
//   // Reference to vacate request (if any)
//   vacateRequestId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'VacateRequest',
//   },
//   // Checkout information
//   checkoutDate: {
//     type: Date
//   },
//   checkoutStatus: {
//     type: String,
//     enum: ['pending', 'approved', 'completed'],
//     default: 'pending'
//   }
// }, { timestamps: true });

// // Index for efficient querying
// bookingSchema.index({ userId: 1, createdAt: -1 });
// bookingSchema.index({ propertyId: 1, bookingStatus: 1 });
// bookingSchema.index({ 'roomDetails.roomIdentifier': 1, moveInDate: 1 });
// bookingSchema.index({ clientId: 1 });

// // Calculate outstanding amount before saving
// bookingSchema.pre('save', function(next) {
//   if (this.isModified('payments') || this.isModified('pricing')) {
//     const totalPaid = this.payments
//       .filter(p => p.status === 'completed')
//       .reduce((sum, payment) => sum + payment.amount, 0);
    
//     const totalDue = (this.pricing.monthlyRent || 0) + 
//                     (this.pricing.securityDeposit || 0) + 
//                     (this.pricing.maintenanceFee || 0);
    
//     this.outstandingAmount = Math.max(0, totalDue - totalPaid);
    
//     // Update payment status based on outstanding amount
//     if (totalPaid >= totalDue) {
//       this.paymentInfo.paymentStatus = 'completed';
//       this.paymentInfo.amountPaid = totalPaid;
//     } else if (totalPaid > 0) {
//       this.paymentInfo.paymentStatus = 'partial';
//       this.paymentInfo.amountPaid = totalPaid;
//     } else {
//       this.paymentInfo.paymentStatus = 'pending';
//       this.paymentInfo.amountPaid = 0;
//     }
//   }
//   next();
// });

// // Virtual for total amount due
// bookingSchema.virtual('totalAmountDue').get(function() {
//   return (this.pricing.monthlyRent || 0) + 
//          (this.pricing.securityDeposit || 0) + 
//          (this.pricing.maintenanceFee || 0);
// });

// // Virtual for amount paid
// bookingSchema.virtual('amountPaid').get(function() {
//   return this.payments
//     .filter(p => p.status === 'completed')
//     .reduce((sum, payment) => sum + payment.amount, 0);
// });

// const Booking = mongoose.model('Booking', bookingSchema);
// export default Booking;





// import mongoose from 'mongoose';

// const bookingSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   clientId: {
//     type: String,
//     required: true,
//   },
//   propertyId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Property',
//     required: true,
//   },
//   roomType: {
//     type: {
//       type: String,
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     capacity: {
//       type: Number,
//       required: true,
//     },
//   },
//   roomDetails: [{
//     roomIdentifier: {
//       type: String,
//       required: true,
//     },
//     sharingType: {
//       type: String,
//       required: true,
//     },
//     floor: {
//       type: Number,
//       required: true,
//     },
//     roomNumber: {
//       type: String,
//       required: true,
//     },
//     bed: {
//       type: String,
//       required: true,
//     }
//   }],
//   moveInDate: {
//     type: Date,
//     required: true,
//   },
//   moveOutDate: {
//     type: Date,
//     required: true,
//   },
//   durationType: {
//     type: String,
//     enum: ['monthly', 'daily', 'custom'],
//     default: 'monthly',
//   },
//   durationDays: {
//     type: Number,
//     default: null,
//   },
//   durationMonths: {
//     type: Number,
//     default: null,
//   },
//   personCount: {
//     type: Number,
//     required: true,
//   },
//   customerDetails: {
//     name: String,
//     age: Number,
//     gender: String,
//     mobile: String,
//     email: String,
//     idProofType: String,
//     idProofNumber: String,
//     idProofFile: String,
//     purpose: String,
//     saveForFuture: Boolean
//   },
//  // Consolidated Payment Information
//   paymentInfo: {
//     paymentStatus: {
//       type: String,
//       enum: ['pending', 'paid', 'failed', 'refunded', 'partial'],
//       default: 'pending'
//     },
//     paymentMethod: {
//       type: String,
//       default: 'razorpay'
//     },
//     transactionId: String,
//     razorpayOrderId: String,
//     razorpayPaymentId: String,
//     razorpaySignature: String,
//     paidAmount: {
//       type: Number,
//       default: 0
//     },
//     paymentDate: Date
//   },
  
//   // Consolidated Pricing Information
//   pricing: {
//     advanceAmount: Number,
//     securityDeposit: Number,
//     totalAmount: Number,
//     monthlyRent: Number,
//     totalRent: Number,
//     maintenanceFee: {
//       type: Number,
//       default: 0
//     }
//   },

//   // Automatic Transfer Fields
//   transferStatus: {
//     type: String,
//     enum: ['pending', 'processing', 'completed', 'failed', 'pending_bank_details'],
//     default: 'pending'
//   },
  
//   transferDetails: {
//     totalAmount: Number,
//     platformCommission: Number,
//     clientAmount: Number,
//     clientTransferStatus: {
//       type: String,
//       enum: ['pending', 'processing', 'completed', 'failed', 'pending_bank_details'],
//       default: 'pending'
//     },
//     adminTransferStatus: {
//       type: String,
//       enum: ['pending', 'processing', 'completed', 'failed'],
//       default: 'pending'
//     },
//     bankAccount: {
//       accountNumber: String,
//       bankName: String,
//       ifscCode: String
//     },
//     payoutId: String,
//     clientTransferProcessedAt: Date,
//     adminCommissionProcessedAt: Date,
//     clientTransferError: String,
//     adminTransferError: String
//   },
  
//   transferMessage: String,


//   bookingStatus: {
//     type: String,
//     enum: ['pending', 'approved', 'confirmed', 'cancelled', 'checked_in', 'checked_out', 'terminated'],
//     default: 'pending',
//   },
//   amenitiesIncluded: [String],
//   specialRequests: String,
  
//   // Payment tracking
//   payments: [{
//     date: {
//       type: Date,
//       default: Date.now
//     },
//     amount: {
//       type: Number,
//       required: true
//     },
//     method: {
//       type: String,
//       enum: ['online', 'offline', 'wallet', 'cash', 'bank_transfer', 'razorpay'],
//       required: true
//     },
//     transactionId: String,
//     status: {
//       type: String,
//       enum: ['pending', 'completed', 'failed', 'refunded'],
//       default: 'pending'
//     },
//     description: String,
//     razorpayOrderId: String,
//     razorpayPaymentId: String,
//     razorpaySignature: String
//   }],
  
//   // Outstanding amount tracking
//   outstandingAmount: {
//     type: Number,
//     default: 0
//   },
  
//   approvedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   },
//   approvedAt: {
//     type: Date,
//   },
  
//   // Reference to vacate request (if any)
//   vacateRequestId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'VacateRequest',
//   },
//   // Checkout information
//   checkoutDate: {
//     type: Date
//   },
//   checkoutStatus: {
//     type: String,
//     enum: ['pending', 'approved', 'completed'],
//     default: 'pending'
//   }
// }, { timestamps: true });

// /// Indexes for better performance
// bookingSchema.index({ propertyId: 1, moveInDate: 1 });
// bookingSchema.index({ userId: 1 });
// bookingSchema.index({ clientId: 1 });
// bookingSchema.index({ 'paymentInfo.paymentStatus': 1 });
// bookingSchema.index({ transferStatus: 1 });
// bookingSchema.index({ bookingStatus: 1 });
// bookingSchema.index({ 'roomDetails.roomIdentifier': 1, moveInDate: 1 });

// // Calculate outstanding amount before saving
// bookingSchema.pre('save', function(next) {
//   if (this.isModified('payments') || this.isModified('pricing')) {
//     const totalPaid = this.payments
//       .filter(p => p.status === 'completed')
//       .reduce((sum, payment) => sum + payment.amount, 0);
    
//     const totalDue = (this.pricing.totalAmount || 0) + 
//                     (this.pricing.securityDeposit || 0) + 
//                     (this.pricing.maintenanceFee || 0);
    
//     this.outstandingAmount = Math.max(0, totalDue - totalPaid);
    
//     // Update payment status based on outstanding amount
//     if (totalPaid >= totalDue) {
//       this.paymentInfo.paymentStatus = 'paid';
//       this.paymentInfo.paidAmount = totalPaid;
//     } else if (totalPaid > 0) {
//       this.paymentInfo.paymentStatus = 'partial';
//       this.paymentInfo.paidAmount = totalPaid;
//     } else {
//       this.paymentInfo.paymentStatus = 'pending';
//       this.paymentInfo.paidAmount = 0;
//     }
//   }
//   next();
// });

// // Virtual for total amount due
// bookingSchema.virtual('totalAmountDue').get(function() {
//   return (this.pricing.totalAmount || 0) + 
//          (this.pricing.securityDeposit || 0) + 
//          (this.pricing.maintenanceFee || 0);
// });

// // Virtual for amount paid
// bookingSchema.virtual('amountPaid').get(function() {
//   return this.payments
//     .filter(p => p.status === 'completed')
//     .reduce((sum, payment) => sum + payment.amount, 0);
// });

// // Virtual for total booking amount
// bookingSchema.virtual('totalBookingAmount').get(function() {
//   return (this.pricing.advanceAmount || 0) + 
//          (this.pricing.securityDeposit || 0) + 
//          (this.pricing.monthlyRent || 0);
// });

// // Method to check if booking is active
// bookingSchema.methods.isActive = function() {
//   const activeStatuses = ['confirmed', 'approved', 'checked_in'];
//   return activeStatuses.includes(this.bookingStatus);
// };

// // Method to check if booking can be cancelled
// bookingSchema.methods.canBeCancelled = function() {
//   const cancellableStatuses = ['pending', 'confirmed', 'approved'];
//   return cancellableStatuses.includes(this.bookingStatus);
// };

// const Booking = mongoose.model('Booking', bookingSchema);
// export default Booking;








// import mongoose from 'mongoose';
// import Razorpay from 'razorpay';

// // Initialize Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// const bookingSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   clientId: {
//     type: String,
//     required: true,
//   },
//   propertyId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Property',
//     required: true,
//   },
//   roomType: {
//     type: {
//       type: String,
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     capacity: {
//       type: Number,
//       required: true,
//     },
//   },
//   roomDetails: [{
//     roomIdentifier: {
//       type: String,
//       required: true,
//     },
//     sharingType: {
//       type: String,
//       required: true,
//     },
//     floor: {
//       type: Number,
//       required: true,
//     },
//     roomNumber: {
//       type: String,
//       required: true,
//     },
//     bed: {
//       type: String,
//       required: true,
//     }
//   }],
//   moveInDate: {
//     type: Date,
//     required: true,
//   },
//   moveOutDate: {
//     type: Date,
//     required: true,
//   },
//   durationType: {
//     type: String,
//     enum: ['monthly', 'daily', 'custom'],
//     default: 'monthly',
//   },
//   durationDays: {
//     type: Number,
//     default: null,
//   },
//   durationMonths: {
//     type: Number,
//     default: null,
//   },
//   personCount: {
//     type: Number,
//     required: true,
//   },
//   customerDetails: {
//     name: String,
//     age: Number,
//     gender: String,
//     mobile: String,
//     email: String,
//     idProofType: String,
//     idProofNumber: String,
//     idProofFile: String,
//     purpose: String,
//     saveForFuture: Boolean
//   },
//   // Consolidated Payment Information
//   paymentInfo: {
//     paymentStatus: {
//       type: String,
//       enum: ['pending', 'paid', 'failed', 'refunded', 'partial'],
//       default: 'pending'
//     },
//     paymentMethod: {
//       type: String,
//       default: 'razorpay'
//     },
//     transactionId: String,
//     razorpayOrderId: String,
//     razorpayPaymentId: String,
//     razorpaySignature: String,
//     paidAmount: {
//       type: Number,
//       default: 0
//     },
//     paymentDate: Date
//   },
  
//   // Consolidated Pricing Information
//   pricing: {
//     advanceAmount: Number,
//     securityDeposit: Number,
//     totalAmount: Number,
//     monthlyRent: Number,
//     totalRent: Number,
//     maintenanceFee: {
//       type: Number,
//       default: 0
//     }
//   },

//   // Automatic Transfer Fields
//   transferStatus: {
//     type: String,
//     enum: ['pending', 'processing', 'completed', 'failed', 'pending_bank_details'],
//     default: 'pending'
//   },
  
//   transferDetails: {
//     totalAmount: Number,
//     platformCommission: Number,
//     gstOnCommission: Number,
//     totalPlatformEarnings: Number,
//     clientAmount: Number,
//     clientTransferStatus: {
//       type: String,
//       enum: ['pending', 'processing', 'completed', 'failed', 'pending_bank_details'],
//       default: 'pending'
//     },
//     adminTransferStatus: {
//       type: String,
//       enum: ['pending', 'processing', 'completed', 'failed'],
//       default: 'pending'
//     },
//     bankAccount: {
//       accountNumber: String,
//       bankName: String,
//       ifscCode: String,
//       accountHolderName: String
//     },
//     payoutId: String,
//     clientTransferProcessedAt: Date,
//     adminCommissionProcessedAt: Date,
//     clientTransferError: String,
//     adminTransferError: String,
//     breakdown: {
//       type: mongoose.Schema.Types.Mixed,
//       default: {}
//     }
//   },
  
//   transferMessage: String,

//   bookingStatus: {
//     type: String,
//     enum: ['pending', 'approved', 'confirmed', 'cancelled', 'checked_in', 'checked_out', 'terminated'],
//     default: 'pending',
//   },
//   amenitiesIncluded: [String],
//   specialRequests: String,
  
//   // Payment tracking
//   payments: [{
//     date: {
//       type: Date,
//       default: Date.now
//     },
//     amount: {
//       type: Number,
//       required: true
//     },
//     method: {
//       type: String,
//       enum: ['online', 'offline', 'wallet', 'cash', 'bank_transfer', 'razorpay'],
//       required: true
//     },
//     transactionId: String,
//     status: {
//       type: String,
//       enum: ['pending', 'completed', 'failed', 'refunded'],
//       default: 'pending'
//     },
//     description: String,
//     razorpayOrderId: String,
//     razorpayPaymentId: String,
//     razorpaySignature: String
//   }],
  
//   // Outstanding amount tracking
//   outstandingAmount: {
//     type: Number,
//     default: 0
//   },
  
//   approvedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   },
//   approvedAt: {
//     type: Date,
//   },
  
//   // Reference to vacate request (if any)
//   vacateRequestId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'VacateRequest',
//   },
//   // Checkout information
//   checkoutDate: {
//     type: Date
//   },
//   checkoutStatus: {
//     type: String,
//     enum: ['pending', 'approved', 'completed'],
//     default: 'pending'
//   }
// }, { timestamps: true });

// /// Indexes for better performance
// bookingSchema.index({ propertyId: 1, moveInDate: 1 });
// bookingSchema.index({ userId: 1 });
// bookingSchema.index({ clientId: 1 });
// bookingSchema.index({ 'paymentInfo.paymentStatus': 1 });
// bookingSchema.index({ transferStatus: 1 });
// bookingSchema.index({ bookingStatus: 1 });
// bookingSchema.index({ 'roomDetails.roomIdentifier': 1, moveInDate: 1 });

// // Calculate outstanding amount before saving
// bookingSchema.pre('save', function(next) {
//   if (this.isModified('payments') || this.isModified('pricing')) {
//     const totalPaid = this.payments
//       .filter(p => p.status === 'completed')
//       .reduce((sum, payment) => sum + payment.amount, 0);
    
//     const totalDue = (this.pricing.totalAmount || 0) + 
//                     (this.pricing.securityDeposit || 0) + 
//                     (this.pricing.maintenanceFee || 0);
    
//     this.outstandingAmount = Math.max(0, totalDue - totalPaid);
    
//     // Update payment status based on outstanding amount
//     if (totalPaid >= totalDue) {
//       this.paymentInfo.paymentStatus = 'paid';
//       this.paymentInfo.paidAmount = totalPaid;
//     } else if (totalPaid > 0) {
//       this.paymentInfo.paymentStatus = 'partial';
//       this.paymentInfo.paidAmount = totalPaid;
//     } else {
//       this.paymentInfo.paymentStatus = 'pending';
//       this.paymentInfo.paidAmount = 0;
//     }
//   }
//   next();
// });

// // Virtual for total amount due
// bookingSchema.virtual('totalAmountDue').get(function() {
//   return (this.pricing.totalAmount || 0) + 
//          (this.pricing.securityDeposit || 0) + 
//          (this.pricing.maintenanceFee || 0);
// });

// // Virtual for amount paid
// bookingSchema.virtual('amountPaid').get(function() {
//   return this.payments
//     .filter(p => p.status === 'completed')
//     .reduce((sum, payment) => sum + payment.amount, 0);
// });

// // Virtual for total booking amount
// bookingSchema.virtual('totalBookingAmount').get(function() {
//   return (this.pricing.advanceAmount || 0) + 
//          (this.pricing.securityDeposit || 0) + 
//          (this.pricing.monthlyRent || 0);
// });

// // Method to check if booking is active
// bookingSchema.methods.isActive = function() {
//   const activeStatuses = ['confirmed', 'approved', 'checked_in'];
//   return activeStatuses.includes(this.bookingStatus);
// };

// // Method to check if booking can be cancelled
// bookingSchema.methods.canBeCancelled = function() {
//   const cancellableStatuses = ['pending', 'confirmed', 'approved'];
//   return cancellableStatuses.includes(this.bookingStatus);
// };

// // Method to calculate transfer amounts
// bookingSchema.methods.calculateTransferAmounts = function() {
//   const totalAmount = this.pricing.totalAmount || 0;
//   const securityDeposit = this.pricing.securityDeposit || 0;
//   const advanceAmount = this.pricing.advanceAmount || 0;
//   const maintenanceFee = this.pricing.maintenanceFee || 0;
  
//   const totalPayment = totalAmount + securityDeposit + advanceAmount + maintenanceFee;
  
//   // Platform commission (5%)
//   const platformCommission = totalPayment * 0.05;
  
//   // GST on platform commission (18%)
//   const gstOnCommission = platformCommission * 0.18;
  
//   // Total platform earnings (commission + GST)
//   const totalPlatformEarnings = platformCommission + gstOnCommission;
  
//   // Client amount (total payment - platform earnings)
//   const clientAmount = totalPayment - totalPlatformEarnings;
  
//   return {
//     totalAmount: totalPayment,
//     platformCommission,
//     gstOnCommission,
//     totalPlatformEarnings,
//     clientAmount,
//     breakdown: {
//       rent: totalAmount,
//       securityDeposit,
//       advanceAmount,
//       maintenanceFee,
//       platformCommissionRate: '5%',
//       gstRate: '18%',
//       totalPayment
//     }
//   };
// };

// // Method to initiate transfer
// bookingSchema.methods.initiateTransfer = async function() {
//   try {
//     const transferAmounts = this.calculateTransferAmounts();
    
//     console.log('Initiating transfer with amounts:', transferAmounts);
    
//     // Update transfer details
//     this.transferDetails = {
//       totalAmount: transferAmounts.totalAmount,
//       platformCommission: transferAmounts.platformCommission,
//       gstOnCommission: transferAmounts.gstOnCommission,
//       totalPlatformEarnings: transferAmounts.totalPlatformEarnings,
//       clientAmount: transferAmounts.clientAmount,
//       clientTransferStatus: 'pending',
//       adminTransferStatus: 'pending',
//       breakdown: transferAmounts.breakdown
//     };
    
//     this.transferStatus = 'processing';
//     this.transferMessage = 'Transfer initiated';
    
//     await this.save();
    
//     // Initiate transfers
//     const clientTransfer = await this.transferToClient();
//     const platformTransfer = await this.transferToPlatform();
    
//     this.transferStatus = 'completed';
//     this.transferMessage = 'Transfer completed successfully';
    
//     await this.save();
    
//     return {
//       ...transferAmounts,
//       clientTransfer,
//       platformTransfer
//     };
//   } catch (error) {
//     console.error('Transfer initiation error:', error);
//     this.transferStatus = 'failed';
//     this.transferMessage = error.message;
//     await this.save();
//     throw error;
//   }
// };

// // Method to transfer to client
// bookingSchema.methods.transferToClient = async function() {
//   try {
//     const BankAccount = mongoose.model('BankAccount');
    
//     // Get client's bank account
//     const bankAccount = await BankAccount.findOne({
//       clientId: this.clientId,
//       propertyId: this.propertyId,
//       isVerified: true,
//       isActive: true
//     });
    
//     if (!bankAccount) {
//       throw new Error('No verified bank account found for client');
//     }
    
//     if (!bankAccount.razorpayFundAccountId) {
//       throw new Error('Bank account not linked with Razorpay. Please contact support.');
//     }
    
//     const transferAmounts = this.calculateTransferAmounts();
    
//     // Create Razorpay payout
//     const payout = await razorpay.payouts.create({
//       account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
//       fund_account_id: bankAccount.razorpayFundAccountId,
//       amount: Math.round(transferAmounts.clientAmount * 100), // Convert to paise
//       currency: 'INR',
//       mode: 'IMPS',
//       purpose: 'payout',
//       queue_if_low_balance: true,
//       reference_id: `payout_${this._id}_${Date.now()}`,
//       narration: `Payment for booking ${this._id} - ${this.propertyId.name || 'Property'}`
//     });
    
//     console.log('Razorpay payout created:', payout.id);
    
//     // Update transfer details
//     this.transferDetails.clientTransferStatus = 'processing';
//     this.transferDetails.payoutId = payout.id;
//     this.transferDetails.bankAccount = {
//       accountNumber: bankAccount.maskedAccountNumber,
//       bankName: bankAccount.bankName,
//       ifscCode: bankAccount.ifscCode,
//       accountHolderName: bankAccount.accountHolderName
//     };
//     this.transferDetails.clientTransferProcessedAt = new Date();
    
//     await this.save();
    
//     return {
//       payoutId: payout.id,
//       status: payout.status,
//       amount: transferAmounts.clientAmount,
//       bankAccount: {
//         accountHolderName: bankAccount.accountHolderName,
//         bankName: bankAccount.bankName,
//         maskedAccountNumber: bankAccount.maskedAccountNumber
//       }
//     };
//   } catch (error) {
//     console.error('Client transfer error:', error);
//     this.transferDetails.clientTransferStatus = 'failed';
//     this.transferDetails.clientTransferError = error.message;
//     await this.save();
//     throw error;
//   }
// };

// // Method to handle platform earnings
// bookingSchema.methods.transferToPlatform = async function() {
//   try {
//     const transferAmounts = this.calculateTransferAmounts();
    
//     // Platform earnings are automatically credited to your Razorpay account
//     // We just track this for accounting purposes
    
//     this.transferDetails.adminTransferStatus = 'completed';
//     this.transferDetails.adminCommissionProcessedAt = new Date();
    
//     await this.save();
    
//     return {
//       platformCommission: transferAmounts.platformCommission,
//       gstOnCommission: transferAmounts.gstOnCommission,
//       totalPlatformEarnings: transferAmounts.totalPlatformEarnings,
//       status: 'completed'
//     };
//   } catch (error) {
//     console.error('Platform transfer error:', error);
//     this.transferDetails.adminTransferStatus = 'failed';
//     this.transferDetails.adminTransferError = error.message;
//     await this.save();
//     throw error;
//   }
// };

// // Method to check transfer status
// bookingSchema.methods.checkTransferStatus = async function() {
//   try {
//     if (!this.transferDetails.payoutId) {
//       return {
//         status: 'no_payout_id',
//         message: 'No payout ID found'
//       };
//     }

//     const payout = await razorpay.payouts.fetch(this.transferDetails.payoutId);
    
//     // Update status based on Razorpay response
//     if (payout.status === 'processed') {
//       this.transferDetails.clientTransferStatus = 'completed';
//       this.transferStatus = 'completed';
//       this.transferMessage = 'Transfer completed successfully';
//     } else if (payout.status === 'failed') {
//       this.transferDetails.clientTransferStatus = 'failed';
//       this.transferStatus = 'failed';
//       this.transferDetails.clientTransferError = payout.utr || 'Transfer failed';
//     } else {
//       this.transferDetails.clientTransferStatus = 'processing';
//     }
    
//     await this.save();
    
//     return {
//       payoutStatus: payout.status,
//       utr: payout.utr,
//       transferDetails: this.transferDetails
//     };
//   } catch (error) {
//     console.error('Check transfer status error:', error);
//     throw error;
//   }
// };

// const Booking = mongoose.model('Booking', bookingSchema);
// export default Booking;



// import mongoose from 'mongoose';
// import Razorpay from 'razorpay';

// // Initialize Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// const bookingSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   clientId: {
//     type: String,
//     required: true,
//   },
//   propertyId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Property',
//     required: true,
//   },
//   roomType: {
//     type: {
//       type: String,
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     capacity: {
//       type: Number,
//       required: true,
//     },
//   },
//   roomDetails: [{
//     roomIdentifier: {
//       type: String,
//       required: true,
//     },
//     sharingType: {
//       type: String,
//       required: true,
//     },
//     floor: {
//       type: Number,
//       required: true,
//     },
//     roomNumber: {
//       type: String,
//       required: true,
//     },
//     bed: {
//       type: String,
//       required: true,
//     }
//   }],
//   moveInDate: {
//     type: Date,
//     required: true,
//   },
//   moveOutDate: {
//     type: Date,
//     required: true,
//   },
//   durationType: {
//     type: String,
//     enum: ['monthly', 'daily', 'custom'],
//     default: 'monthly',
//   },
//   durationDays: {
//     type: Number,
//     default: null,
//   },
//   durationMonths: {
//     type: Number,
//     default: null,
//   },
//   personCount: {
//     type: Number,
//     required: true,
//   },
//   customerDetails: {
//     primary: {
//       name: String,
//       age: Number,
//       gender: String,
//       mobile: String,
//       email: String,
//       idProofType: String,
//       idProofNumber: String,
//       purpose: String
//     },
//     additional: [{
//       name: String,
//       age: Number,
//       gender: String,
//       idProofType: String,
//       idProofNumber: String
//     }],
//     saveForFuture: Boolean
//   },
  
//   // Payment Information
//   paymentInfo: {
//     paymentStatus: {
//       type: String,
//       enum: ['pending', 'paid', 'failed', 'refunded', 'partial'],
//       default: 'pending'
//     },
//     paymentMethod: {
//       type: String,
//       default: 'razorpay'
//     },
//     transactionId: String,
//     razorpayOrderId: String,
//     razorpayPaymentId: String,
//     razorpaySignature: String,
//     paidAmount: {
//       type: Number,
//       default: 0
//     },
//     paymentDate: Date
//   },
  
//   // Pricing Information
//   pricing: {
//     advanceAmount: Number,
//     securityDeposit: Number,
//     totalAmount: Number,
//     monthlyRent: Number,
//     totalRent: Number,
//     maintenanceFee: {
//       type: Number,
//       default: 0
//     }
//   },

//   // Automatic Transfer Fields
//   transferStatus: {
//     type: String,
//     enum: ['pending', 'processing', 'completed', 'failed', 'pending_bank_details'],
//     default: 'pending'
//   },
  
//   transferDetails: {
//     totalAmount: Number,
//     platformCommission: Number,
//     gstOnCommission: Number,
//     totalPlatformEarnings: Number,
//     clientAmount: Number,
//     clientTransferStatus: {
//       type: String,
//       enum: ['pending', 'processing', 'completed', 'failed', 'pending_bank_details'],
//       default: 'pending'
//     },
//     bankAccount: {
//       accountNumber: String,
//       bankName: String,
//       ifscCode: String,
//       accountHolderName: String
//     },
//     payoutId: String,
//     clientTransferProcessedAt: Date,
//     completedAt: Date,
//     transferError: String,
//     breakdown: {
//       type: mongoose.Schema.Types.Mixed,
//       default: {}
//     }
//   },
  
//   transferMessage: String,

//   bookingStatus: {
//     type: String,
//     enum: ['pending_payment', 'confirmed', 'approved', 'cancelled', 'checked_in', 'checked_out'],
//     default: 'pending_payment',
//   },
  
//   // Payment tracking
//   payments: [{
//     date: {
//       type: Date,
//       default: Date.now
//     },
//     amount: {
//       type: Number,
//       required: true
//     },
//     method: {
//       type: String,
//       enum: ['online', 'offline', 'wallet', 'cash', 'bank_transfer', 'razorpay'],
//       required: true
//     },
//     transactionId: String,
//     status: {
//       type: String,
//       enum: ['pending', 'completed', 'failed', 'refunded'],
//       default: 'pending'
//     },
//     description: String,
//     razorpayOrderId: String,
//     razorpayPaymentId: String,
//     razorpaySignature: String
//   }],
  
//   // Outstanding amount tracking
//   outstandingAmount: {
//     type: Number,
//     default: 0
//   },
  
//   approvedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   },
//   approvedAt: {
//     type: Date,
//   }
// }, { 
//   timestamps: true 
// });

// // Indexes for better performance
// bookingSchema.index({ propertyId: 1, moveInDate: 1 });
// bookingSchema.index({ userId: 1 });
// bookingSchema.index({ clientId: 1 });
// bookingSchema.index({ 'paymentInfo.paymentStatus': 1 });
// bookingSchema.index({ transferStatus: 1 });
// bookingSchema.index({ bookingStatus: 1 });
// bookingSchema.index({ 'roomDetails.roomIdentifier': 1, moveInDate: 1 });

// // Calculate outstanding amount before saving
// bookingSchema.pre('save', function(next) {
//   if (this.isModified('payments') || this.isModified('pricing')) {
//     const totalPaid = this.payments
//       .filter(p => p.status === 'completed')
//       .reduce((sum, payment) => sum + payment.amount, 0);
    
//     const totalDue = (this.pricing.totalAmount || 0) + 
//                     (this.pricing.securityDeposit || 0) + 
//                     (this.pricing.maintenanceFee || 0);
    
//     this.outstandingAmount = Math.max(0, totalDue - totalPaid);
    
//     // Update payment status based on outstanding amount
//     if (totalPaid >= totalDue) {
//       this.paymentInfo.paymentStatus = 'paid';
//       this.paymentInfo.paidAmount = totalPaid;
//     } else if (totalPaid > 0) {
//       this.paymentInfo.paymentStatus = 'partial';
//       this.paymentInfo.paidAmount = totalPaid;
//     } else {
//       this.paymentInfo.paymentStatus = 'pending';
//       this.paymentInfo.paidAmount = 0;
//     }
//   }
//   next();
// });

// // Virtual for total amount due
// bookingSchema.virtual('totalAmountDue').get(function() {
//   return (this.pricing.totalAmount || 0) + 
//          (this.pricing.securityDeposit || 0) + 
//          (this.pricing.maintenanceFee || 0);
// });

// // Virtual for amount paid
// bookingSchema.virtual('amountPaid').get(function() {
//   return this.payments
//     .filter(p => p.status === 'completed')
//     .reduce((sum, payment) => sum + payment.amount, 0);
// });

// // Method to check if booking is active
// bookingSchema.methods.isActive = function() {
//   const activeStatuses = ['confirmed', 'approved', 'checked_in'];
//   return activeStatuses.includes(this.bookingStatus);
// };

// // Method to check if booking can be cancelled
// bookingSchema.methods.canBeCancelled = function() {
//   const cancellableStatuses = ['pending_payment', 'confirmed', 'approved'];
//   return cancellableStatuses.includes(this.bookingStatus);
// };

// // Calculate transfer amounts
// bookingSchema.methods.calculateTransferAmounts = function() {
//   const totalAmount = this.pricing.totalAmount || 0;
  
//   // Platform commission (5%)
//   const platformCommission = totalAmount * 0.05;
  
//   // GST on platform commission (18%)
//   const gstOnCommission = platformCommission * 0.18;
  
//   // Total platform earnings (commission + GST)
//   const totalPlatformEarnings = platformCommission + gstOnCommission;
  
//   // Client amount (total payment - platform earnings)
//   const clientAmount = totalAmount - totalPlatformEarnings;
  
//   return {
//     totalAmount: totalAmount,
//     platformCommission,
//     gstOnCommission,
//     totalPlatformEarnings,
//     clientAmount,
//     breakdown: {
//       totalPayment: totalAmount,
//       platformCommissionRate: '5%',
//       gstRate: '18%',
//       platformCommission: platformCommission,
//       gstOnCommission: gstOnCommission,
//       clientAmount: clientAmount
//     }
//   };
// };

// const Booking = mongoose.model('Booking', bookingSchema);
// export default Booking;


import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  roomType: {
    type: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
  },
  roomDetails: [{
    roomIdentifier: {
      type: String,
      required: true,
    },
    sharingType: {
      type: String,
      required: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    bed: {
      type: String,
      required: true,
    }
  }],
  moveInDate: {
    type: Date,
    required: true,
  },
  moveOutDate: {
    type: Date,
    required: true,
  },
  durationType: {
    type: String,
    enum: ['monthly', 'daily', 'custom'],
    default: 'monthly',
  },
  durationDays: {
    type: Number,
    default: null,
  },
  durationMonths: {
    type: Number,
    default: null,
  },
  personCount: {
    type: Number,
    required: true,
  },
  customerDetails: {
    primary: {
      name: String,
      age: Number,
      gender: String,
      mobile: String,
      email: String,
      idProofType: String,
      idProofNumber: String,
      purpose: String
    },
    additional: [{
      name: String,
      age: Number,
      gender: String,
      idProofType: String,
      idProofNumber: String
    }],
    saveForFuture: Boolean
  },
  
  paymentInfo: {
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partial'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      default: 'razorpay'
    },
    transactionId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paidAmount: {
      type: Number,
      default: 0
    },
    paymentDate: Date
  },
  
  pricing: {
    advanceAmount: Number,
    securityDeposit: Number,
    totalAmount: Number,
    monthlyRent: Number,
    totalRent: Number,
    maintenanceFee: {
      type: Number,
      default: 0
    }
  },

  transferStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'pending_bank_details', 'manual_pending'],
    default: 'manual_pending'
  },
  
  transferDetails: {
    totalAmount: Number,
    platformCommission: Number,
    gstOnCommission: Number,
    totalPlatformEarnings: Number,
    clientAmount: Number,
    clientTransferStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'pending_bank_details', 'manual_pending'],
      default: 'manual_pending'
    },
    bankAccount: {
      accountNumber: String,
      bankName: String,
      ifscCode: String,
      accountHolderName: String
    },
    payoutId: String,
    clientTransferProcessedAt: Date,
    completedAt: Date,
    transferError: String,
    transferNotes: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    processedAt: Date,
    breakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },

  bookingStatus: {
    type: String,
    enum: ['pending_payment', 'confirmed', 'approved', 'cancelled', 'checked_in', 'checked_out'],
    default: 'pending_payment',
  },
  
  payments: [{
    date: {
      type: Date,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true
    },
    method: {
      type: String,
      enum: ['online', 'offline', 'wallet', 'cash', 'bank_transfer', 'razorpay'],
      required: true
    },
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    description: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    razorpayUTR: String,
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
      enum: ['booking', 'rent', 'security_deposit', 'maintenance', 'other'],
      default: 'rent'
    },
    month: String,
    year: Number,
    dueDate: Date,
    paidDate: {
      type: Date,
      default: Date.now
    }
  }],

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
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending"
    },
    dueDate: {
      type: Date
    }
  }], 

  outstandingAmount: {
    type: Number,
    default: 0
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
  }
}, { 
  timestamps: true 
});

// Indexes
bookingSchema.index({ propertyId: 1, moveInDate: 1 });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ clientId: 1 });
bookingSchema.index({ 'paymentInfo.paymentStatus': 1 });
bookingSchema.index({ transferStatus: 1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ 'roomDetails.roomIdentifier': 1, moveInDate: 1 });
bookingSchema.index({ 'payments.review.rating': 1 });
bookingSchema.index({ 'payments.month': 1, 'payments.year': 1 });
bookingSchema.index({ 'paymentrequest.status': 1 });

// Calculate outstanding amount before saving
bookingSchema.pre('save', function(next) {
  if (this.isModified('payments') || this.isModified('pricing')) {
    const totalPaid = this.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const totalDue = (this.pricing.totalAmount || 0) + 
                    (this.pricing.securityDeposit || 0) + 
                    (this.pricing.maintenanceFee || 0);
    
    this.outstandingAmount = Math.max(0, totalDue - totalPaid);
    
    if (totalPaid >= totalDue) {
      this.paymentInfo.paymentStatus = 'paid';
      this.paymentInfo.paidAmount = totalPaid;
    } else if (totalPaid > 0) {
      this.paymentInfo.paymentStatus = 'partial';
      this.paymentInfo.paidAmount = totalPaid;
    } else {
      this.paymentInfo.paymentStatus = 'pending';
      this.paymentInfo.paidAmount = 0;
    }
  }
  next();
});

// Virtual for total amount due
bookingSchema.virtual('totalAmountDue').get(function() {
  return (this.pricing.totalAmount || 0) + 
         (this.pricing.securityDeposit || 0) + 
         (this.pricing.maintenanceFee || 0);
});

// Virtual for amount paid
bookingSchema.virtual('amountPaid').get(function() {
  return this.payments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
});

// Method to get payments with reviews
bookingSchema.methods.getPaymentsWithReviews = function() {
  return this.payments.filter(payment => payment.review && payment.review.rating);
};

// Method to get average rating from all payment reviews
bookingSchema.methods.getAverageRating = function() {
  const paymentsWithReviews = this.getPaymentsWithReviews();
  if (paymentsWithReviews.length === 0) return 0;
  
  const totalRating = paymentsWithReviews.reduce((sum, payment) => 
    sum + payment.review.rating, 0
  );
  return totalRating / paymentsWithReviews.length;
};

// Method to check if booking is active
bookingSchema.methods.isActive = function() {
  const activeStatuses = ['confirmed', 'approved', 'checked_in'];
  return activeStatuses.includes(this.bookingStatus);
};

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const cancellableStatuses = ['pending_payment', 'confirmed', 'approved'];
  return cancellableStatuses.includes(this.bookingStatus);
};

// Calculate transfer amounts
bookingSchema.methods.calculateTransferAmounts = function() {
  const totalAmount = this.pricing.totalAmount || 0;
  
  const platformCommission = totalAmount * 0.05;
  const gstOnCommission = platformCommission * 0.18;
  const totalPlatformEarnings = platformCommission + gstOnCommission;
  const clientAmount = totalAmount - totalPlatformEarnings;
  
  return {
    totalAmount: totalAmount,
    platformCommission,
    gstOnCommission,
    totalPlatformEarnings,
    clientAmount,
    breakdown: {
      totalPayment: totalAmount,
      platformCommissionRate: '5%',
      gstRate: '18%',
      platformCommission: platformCommission,
      gstOnCommission: gstOnCommission,
      clientAmount: clientAmount
    }
  };
};

// Method to add payment request
bookingSchema.methods.addPaymentRequest = function(paymentRequestData) {
  this.paymentrequest.push(paymentRequestData);
  return this.save();
};

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;