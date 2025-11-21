// import Razorpay from 'razorpay';
// import crypto from 'crypto';
// import Booking from '../models/Booking.js';
// import VacateRequest from '../models/VacateRequest.js';

// // Initialize Razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXXX',
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// // Create Razorpay order
// export const createOrder = async (req, res) => {
//   try {
//     const { amount, currency = 'INR', receipt } = req.body;

//     console.log('Creating order with:', { amount, currency, receipt });

//     if (!amount) {
//       return res.status(400).json({
//         success: false,
//         message: 'Amount is required'
//       });
//     }

//     // Generate a receipt if not provided
//     const finalReceipt = receipt || `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

//     const options = {
//       amount: parseInt(amount), // amount in paise
//       currency,
//       receipt: finalReceipt,
//       payment_capture: 1 // Auto capture payment
//     };

//     const order = await razorpay.orders.create(options);

//     console.log('Order created successfully:', order.id);

//     res.status(200).json({
//       success: true,
//       order: {
//         id: order.id,
//         amount: order.amount,
//         currency: order.currency,
//         receipt: order.receipt
//       }
//     });

//   } catch (error) {
//     console.error('Razorpay order creation error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create payment order',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Validate payment signature
// export const validatePayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       bookingId,
//       amount
//     } = req.body;

//     console.log('Validating payment for booking:', bookingId);

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing payment verification data'
//       });
//     }

//     // Generate expected signature
//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest('hex');

//     // Verify signature
//     const isAuthentic = expectedSignature === razorpay_signature;

//     if (!isAuthentic) {
//       console.error('Invalid signature detected');
//       return res.status(400).json({
//         success: false,
//         message: 'Payment verification failed: Invalid signature'
//       });
//     }

//     // Update booking payment status if bookingId is provided
//     if (bookingId) {
//       try {
//         const updatedBooking = await Booking.findByIdAndUpdate(
//           bookingId,
//           {
//             'paymentInfo.paymentStatus': 'completed',
//             'paymentInfo.transactionId': razorpay_payment_id,
//             'paymentInfo.paymentDate': new Date(),
//             'paymentInfo.amountPaid': amount ? amount / 100 : 0,
//             'bookingStatus': 'confirmed'
//           },
//           { new: true }
//         ).populate('propertyId', 'name');

//         if (!updatedBooking) {
//           console.warn('Booking not found for ID:', bookingId);
//         } else {
//           console.log('Booking updated successfully:', updatedBooking._id);
//         }
//       } catch (updateError) {
//         console.error('Error updating booking:', updateError);
//         // Don't fail the payment validation if booking update fails
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Payment verified successfully',
//       paymentId: razorpay_payment_id,
//       orderId: razorpay_order_id
//     });

//   } catch (error) {
//     console.error('Payment validation error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Payment validation failed',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get payment details
// export const getPaymentDetails = async (req, res) => {
//   try {
//     const { paymentId } = req.params;

//     if (!paymentId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Payment ID is required'
//       });
//     }

//     const payment = await razorpay.payments.fetch(paymentId);

//     res.status(200).json({
//       success: true,
//       payment
//     });

//   } catch (error) {
//     console.error('Get payment details error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch payment details',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Refund payment
// export const refundPayment = async (req, res) => {
//   try {
//     const { paymentId, amount, bookingId } = req.body;

//     if (!paymentId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Payment ID is required'
//       });
//     }

//     const refund = await razorpay.payments.refund(paymentId, {
//       amount: amount ? parseInt(amount) : undefined
//     });

//     // Update booking status if refund is successful and bookingId is provided
//     if (bookingId) {
//       try {
//         await Booking.findByIdAndUpdate(
//           bookingId,
//           {
//             'paymentInfo.paymentStatus': 'refunded',
//             'bookingStatus': 'cancelled'
//           }
//         );
//       } catch (updateError) {
//         console.error('Error updating booking status during refund:', updateError);
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Refund processed successfully',
//       refund
//     });

//   } catch (error) {
//     console.error('Refund error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to process refund',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };



// // Send payment request to user
// export const sendPaymentRequest = async (req, res) => {
//   try {
//     const { userId, amount, description, dueDate, bookingId } = req.body;
    
//     if (!userId || !amount) {
//       return res.status(400).json({
//         success: false,
//         message: 'User ID and amount are required'
//       });
//     }

//     // For now, we'll just return success as the full implementation
//     // would require User model and notification services
//     console.log('Payment request sent to user:', { userId, amount, description, dueDate, bookingId });

//     res.status(200).json({
//       success: true,
//       message: 'Payment request sent successfully',
//       data: {
//         userId,
//         amount,
//         description,
//         dueDate,
//         bookingId
//       }
//     });

//   } catch (error) {
//     console.error('Send payment request error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to send payment request',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };


// //get all payments of clients for a booking by propertyid and bookingid
// export const getClientPaymentsForBooking = async (req, res) => {
//   try {
//     const { propertyId, bookingId } = req.params;
    
//     if (!propertyId || !bookingId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Property ID and Booking ID are required'
//       });
//     }
    
//     const booking = await Booking.findOne({ _id: bookingId, propertyId })
//       .select('payments')
//       .lean();
//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: 'Booking not found for the given property'
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       payments: booking.payments || []
//     });
    
//   }
//   catch (error) {
//     console.error('Get client payments for booking error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch client payments for booking',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get payment history for a booking
// // export const getPaymentHistory = async (req, res) => {
// //   try {
// //     const { bookingId } = req.params;

// //     if (!bookingId) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Booking ID is required'
// //       });
// //     }

// //     const booking = await Booking.findById(bookingId)
// //       .select('payments pricing outstandingAmount')
// //       .lean();

// //     if (!booking) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Booking not found'
// //       });
// //     }

// //     res.status(200).json({
// //       success: true,
// //       payments: booking.payments,
// //       outstandingAmount: booking.outstandingAmount,
// //       totalAmount: booking.pricing.monthlyRent + booking.pricing.securityDeposit + booking.pricing.maintenanceFee
// //     });

// //   } catch (error) {
// //     console.error('Get payment history error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to fetch payment history',
// //       error: process.env.NODE_ENV === 'development' ? error.message : undefined
// //     });
// //   }
// // };



// // controllers/paymentController.js

// export const getPaymentHistory = async (req, res) => {
//   try {
//     const { bookingId } = req.params;

//     if (!bookingId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Booking ID is required'
//       });
//     }

//     // Find the booking and its payments
//     const booking = await Booking.findById(bookingId)
//       .select('payments pricing outstandingAmount userId propertyId customerDetails')
//       .lean();

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: 'Booking not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       payments: booking.payments || [],
//       outstandingAmount: booking.outstandingAmount,
//       totalAmount: (booking.pricing.monthlyRent || 0) + 
//                    (booking.pricing.securityDeposit || 0) +
//                    (booking.pricing.maintenanceFee || 0),
//       userId: booking.userId,
//       propertyId: booking.propertyId,
//       customerDetails: booking.customerDetails
//     });

//   } catch (error) {
//     console.error('Get payment history error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch payment history'
//     });
//   }
// };







// // controllers/paymentController.js
// import Razorpay from 'razorpay';
// import crypto from 'crypto';
// import Booking from '../models/Booking.js';
// import VacateRequest from '../models/VacateRequest.js';

// // Initialize Razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// // Create Razorpay order
// export const createOrder = async (req, res) => {
//   try {
//     const { amount, currency = 'INR', receipt, bookingId } = req.body;

//     console.log('Creating order for booking:', bookingId, 'Amount:', amount);

//     if (!amount) {
//       return res.status(400).json({
//         success: false,
//         message: 'Amount is required'
//       });
//     }

//     // Validate booking exists
//     if (bookingId) {
//       const booking = await Booking.findById(bookingId);
//       if (!booking) {
//         return res.status(404).json({
//           success: false,
//           message: 'Booking not found'
//         });
//       }
//     }

//     // Generate a receipt if not provided
//     const finalReceipt = receipt || `receipt_${bookingId || Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

//     const options = {
//       amount: parseInt(amount), // amount in paise
//       currency,
//       receipt: finalReceipt,
//       payment_capture: 1, // Auto capture payment
//       notes: {
//         bookingId: bookingId || 'unknown'
//       }
//     };

//     const order = await razorpay.orders.create(options);

//     console.log('Order created successfully:', order.id);

//     res.status(200).json({
//       success: true,
//       order: {
//         id: order.id,
//         amount: order.amount,
//         currency: order.currency,
//         receipt: order.receipt
//       }
//     });

//   } catch (error) {
//     console.error('Razorpay order creation error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create payment order',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Validate payment signature and initiate transfer
// export const validatePayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       bookingId,
//       amount,
//       description = 'Booking payment'
//     } = req.body;

//     console.log('Validating payment for booking:', bookingId);

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing payment verification data'
//       });
//     }

//     // Generate expected signature
//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest('hex');

//     // Verify signature
//     const isAuthentic = expectedSignature === razorpay_signature;

//     if (!isAuthentic) {
//       console.error('Invalid signature detected');
//       return res.status(400).json({
//         success: false,
//         message: 'Payment verification failed: Invalid signature'
//       });
//     }

//     // Update booking payment status and initiate transfer
//     if (bookingId) {
//       try {
//         const booking = await Booking.findById(bookingId);
        
//         if (!booking) {
//           throw new Error('Booking not found');
//         }

//         // Add payment record
//         const paymentRecord = {
//           date: new Date(),
//           amount: amount ? amount / 100 : 0,
//           method: 'razorpay',
//           transactionId: razorpay_payment_id,
//           status: 'completed',
//           description: description,
//           razorpayOrderId: razorpay_order_id,
//           razorpayPaymentId: razorpay_payment_id,
//           razorpaySignature: razorpay_signature
//         };

//         booking.payments.push(paymentRecord);
        
//         // Update payment info
//         booking.paymentInfo = {
//           paymentStatus: 'completed',
//           paymentMethod: 'razorpay',
//           transactionId: razorpay_payment_id,
//           razorpayOrderId: razorpay_order_id,
//           razorpayPaymentId: razorpay_payment_id,
//           razorpaySignature: razorpay_signature,
//           paidAmount: amount ? amount / 100 : 0,
//           paymentDate: new Date()
//         };

//         booking.bookingStatus = 'confirmed';

//         await booking.save();

//         console.log('Payment recorded for booking:', bookingId);

//         // Initiate automatic transfer to client and platform
//         try {
//           const transferAmounts = await booking.initiateTransfer();
          
//           console.log('Transfer initiated successfully for booking:', bookingId, transferAmounts);
          
//           res.status(200).json({
//             success: true,
//             message: 'Payment verified successfully and transfer initiated',
//             paymentId: razorpay_payment_id,
//             orderId: razorpay_order_id,
//             transferInitiated: true,
//             transferAmounts,
//             bookingStatus: booking.bookingStatus
//           });
          
//         } catch (transferError) {
//           console.error('Transfer initiation failed for booking:', bookingId, transferError);
          
//           // Payment is still successful, but transfer failed
//           res.status(200).json({
//             success: true,
//             message: 'Payment verified but transfer failed. Please initiate transfer manually.',
//             paymentId: razorpay_payment_id,
//             orderId: razorpay_order_id,
//             transferInitiated: false,
//             transferError: transferError.message,
//             bookingStatus: booking.bookingStatus
//           });
//         }

//       } catch (updateError) {
//         console.error('Error updating booking:', updateError);
//         throw updateError;
//       }
//     } else {
//       res.status(200).json({
//         success: true,
//         message: 'Payment verified successfully',
//         paymentId: razorpay_payment_id,
//         orderId: razorpay_order_id
//       });
//     }

//   } catch (error) {
//     console.error('Payment validation error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Payment validation failed',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get payment details
// export const getPaymentDetails = async (req, res) => {
//   try {
//     const { paymentId } = req.params;

//     if (!paymentId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Payment ID is required'
//       });
//     }

//     const payment = await razorpay.payments.fetch(paymentId);

//     res.status(200).json({
//       success: true,
//       payment
//     });

//   } catch (error) {
//     console.error('Get payment details error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch payment details',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Refund payment
// export const refundPayment = async (req, res) => {
//   try {
//     const { paymentId, amount, bookingId } = req.body;

//     if (!paymentId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Payment ID is required'
//       });
//     }

//     const refund = await razorpay.payments.refund(paymentId, {
//       amount: amount ? parseInt(amount) : undefined
//     });

//     // Update booking status if refund is successful and bookingId is provided
//     if (bookingId) {
//       try {
//         await Booking.findByIdAndUpdate(
//           bookingId,
//           {
//             'paymentInfo.paymentStatus': 'refunded',
//             'bookingStatus': 'cancelled'
//           }
//         );
//       } catch (updateError) {
//         console.error('Error updating booking status during refund:', updateError);
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Refund processed successfully',
//       refund
//     });

//   } catch (error) {
//     console.error('Refund error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to process refund',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Send payment request to user
// export const sendPaymentRequest = async (req, res) => {
//   try {
//     const { userId, amount, description, dueDate, bookingId } = req.body;
    
//     if (!userId || !amount) {
//       return res.status(400).json({
//         success: false,
//         message: 'User ID and amount are required'
//       });
//     }

//     // For now, we'll just return success as the full implementation
//     // would require User model and notification services
//     console.log('Payment request sent to user:', { userId, amount, description, dueDate, bookingId });

//     res.status(200).json({
//       success: true,
//       message: 'Payment request sent successfully',
//       data: {
//         userId,
//         amount,
//         description,
//         dueDate,
//         bookingId
//       }
//     });

//   } catch (error) {
//     console.error('Send payment request error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to send payment request',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get client payments for a booking
// export const getClientPaymentsForBooking = async (req, res) => {
//   try {
//     const { propertyId, bookingId } = req.params;
    
//     if (!propertyId || !bookingId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Property ID and Booking ID are required'
//       });
//     }
    
//     const booking = await Booking.findOne({ _id: bookingId, propertyId })
//       .select('payments transferDetails')
//       .lean();
      
//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: 'Booking not found for the given property'
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       payments: booking.payments || [],
//       transferDetails: booking.transferDetails || {}
//     });
    
//   } catch (error) {
//     console.error('Get client payments for booking error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch client payments for booking',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get payment history for a booking
// export const getPaymentHistory = async (req, res) => {
//   try {
//     const { bookingId } = req.params;

//     if (!bookingId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Booking ID is required'
//       });
//     }

//     // Find the booking and its payments
//     const booking = await Booking.findById(bookingId)
//       .select('payments pricing outstandingAmount userId propertyId customerDetails transferDetails')
//       .lean();

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: 'Booking not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       payments: booking.payments || [],
//       outstandingAmount: booking.outstandingAmount,
//       totalAmount: (booking.pricing.monthlyRent || 0) + 
//                    (booking.pricing.securityDeposit || 0) +
//                    (booking.pricing.maintenanceFee || 0),
//       transferDetails: booking.transferDetails || {},
//       userId: booking.userId,
//       propertyId: booking.propertyId,
//       customerDetails: booking.customerDetails
//     });

//   } catch (error) {
//     console.error('Get payment history error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch payment history'
//     });
//   }
// };





// import Razorpay from 'razorpay';
// import crypto from 'crypto';
// import mongoose from 'mongoose';
// import Booking from '../models/Booking.js';

// // Initialize Razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// // Test Razorpay configuration
// export const testRazorpay = async (req, res) => {
//   try {
//     // Test Razorpay connection by fetching payments (empty list)
//     const payments = await razorpay.payments.all({ count: 1 });
    
//     res.status(200).json({
//       success: true,
//       message: 'Razorpay is configured correctly',
//       razorpay: {
//         key_id: process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Missing',
//         account_number: process.env.RAZORPAY_ACCOUNT_NUMBER ? 'Configured' : 'Missing'
//       }
//     });
//   } catch (error) {
//     console.error('Razorpay test error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Razorpay configuration error',
//       error: error.message
//     });
//   }
// };

// // Check Razorpay configuration
// export const checkRazorpayConfig = async (req, res) => {
//   const config = {
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET ? '***' + process.env.RAZORPAY_KEY_SECRET.slice(-4) : 'Missing',
//     account_number: process.env.RAZORPAY_ACCOUNT_NUMBER
//   };
  
//   res.status(200).json({
//     success: true,
//     config
//   });
// };

// // Create Razorpay order
// export const createOrder = async (req, res) => {
//   try {
//     const { amount, currency = 'INR', receipt, bookingData } = req.body;

//     console.log('Creating order for booking data:', bookingData, 'Amount:', amount);

//     if (!amount) {
//       return res.status(400).json({
//         success: false,
//         message: 'Amount is required'
//       });
//     }

//     // Generate a receipt if not provided
//     const finalReceipt = receipt || `receipt_${Date.now()}`;

//     const options = {
//       amount: Math.round(parseFloat(amount)), // amount in paise
//       currency,
//       receipt: finalReceipt,
//       payment_capture: 1, // Auto capture payment
//       notes: {
//         bookingData: JSON.stringify(bookingData || {})
//       }
//     };

//     console.log('Creating Razorpay order with options:', options);

//     const order = await razorpay.orders.create(options);

//     console.log('Order created successfully:', order.id);

//     res.status(200).json({
//       success: true,
//       order: {
//         id: order.id,
//         amount: order.amount,
//         currency: order.currency,
//         receipt: order.receipt
//       }
//     });

//   } catch (error) {
//     console.error('Razorpay order creation error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create payment order',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Validate payment signature and create booking
// export const validatePayment = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
  
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       bookingData,
//       amount,
//       description = 'Booking payment'
//     } = req.body;

//     console.log('Validating payment and creating booking...');
//     console.log('Payment details:', {
//       order_id: razorpay_order_id,
//       payment_id: razorpay_payment_id,
//       amount: amount
//     });

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       await session.abortTransaction();
//       return res.status(400).json({
//         success: false,
//         message: 'Missing payment verification data'
//       });
//     }

//     // Generate expected signature
//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest('hex');

//     // Verify signature
//     const isAuthentic = expectedSignature === razorpay_signature;

//     if (!isAuthentic) {
//       await session.abortTransaction();
//       console.error('Invalid signature detected');
//       return res.status(400).json({
//         success: false,
//         message: 'Payment verification failed: Invalid signature'
//       });
//     }

//     // Create booking only after successful payment verification
//     if (bookingData) {
//       try {
//         // Validate required booking data
//         if (!bookingData.propertyId || !bookingData.roomType || !bookingData.selectedRooms || !bookingData.moveInDate) {
//           throw new Error('Incomplete booking data provided');
//         }

//         // Check room availability before creating booking
//         const roomAvailability = await checkRoomAvailabilityBeforeBooking(
//           bookingData.propertyId, 
//           bookingData.selectedRooms, 
//           bookingData.moveInDate,
//           bookingData.endDate,
//           session
//         );

//         if (!roomAvailability.available) {
//           await session.abortTransaction();
//           return res.status(409).json({
//             success: false,
//             message: 'Some selected rooms are no longer available.',
//             unavailableRooms: roomAvailability.unavailableRooms,
//             suggestion: 'Please select different rooms or choose a different date.'
//           });
//         }

//         // Get user and property details
//         const [property, user] = await Promise.all([
//           Property.findById(bookingData.propertyId),
//           User.findById(req.user.id)
//         ]);

//         if (!property || property.status !== 'approved') {
//           throw new Error('Property not available for booking');
//         }

//         if (!user || !user.clientId) {
//           throw new Error('User or clientId not found');
//         }

//         // Get room configuration
//         const roomConfig = await Room.findOne({ propertyId: bookingData.propertyId });
//         if (!roomConfig) {
//           throw new Error('Room configuration not found for this property');
//         }

//         const roomTypeConfig = roomConfig.roomTypes.find(rt => rt.type === bookingData.roomType);
//         if (!roomTypeConfig) {
//           throw new Error('Selected room type not found');
//         }

//         // Calculate total amount
//         const securityDeposit = roomTypeConfig.deposit * bookingData.selectedRooms.length;
//         const advanceAmount = roomTypeConfig.price;
//         const totalAmount = (bookingData.pricing?.totalAmount || 0) + securityDeposit + advanceAmount;

//         // Create final booking data
//         const finalBookingData = {
//           userId: req.user.id,
//           clientId: user.clientId,
//           propertyId: bookingData.propertyId,
//           roomType: {
//             type: roomTypeConfig.type,
//             name: roomTypeConfig.label || roomTypeConfig.type,
//             capacity: roomTypeConfig.capacity
//           },
//           roomDetails: bookingData.selectedRooms.map(roomInfo => {
//             const parts = roomInfo.split('-');
//             if (parts.length < 3) {
//               return {
//                 roomIdentifier: roomInfo,
//                 sharingType: 'unknown',
//                 floor: 1,
//                 roomNumber: 'unknown',
//                 bed: 'unknown'
//               };
//             }
            
//             const sharingType = parts[0];
//             const roomNumber = parts.slice(1, parts.length - 1).join('-');
//             const bedFromRequest = parts[parts.length - 1];
            
//             // Find actual bed name (simplified for brevity)
//             let actualBedName = bedFromRequest;
//             let floorNumber = 1;
            
//             for (const floorConfig of roomConfig.floorConfig.floors) {
//               if (floorConfig.rooms && floorConfig.rooms.has(roomNumber)) {
//                 const beds = floorConfig.rooms.get(roomNumber);
//                 const foundBed = beds.find(bed => 
//                   bed.replace(/\s+/g, '') === bedFromRequest.replace(/\s+/g, '')
//                 );
//                 if (foundBed) {
//                   actualBedName = foundBed;
//                   floorNumber = floorConfig.floor;
//                   break;
//                 }
//               }
//             }
            
//             return {
//               roomIdentifier: `${sharingType}-${roomNumber}-${actualBedName}`,
//               sharingType,
//               floor: floorNumber,
//               roomNumber,
//               bed: actualBedName
//             };
//           }),
//           moveInDate: new Date(bookingData.moveInDate),
//           moveOutDate: bookingData.endDate ? new Date(bookingData.endDate) : new Date(new Date(bookingData.moveInDate).setMonth(new Date(bookingData.moveInDate).getMonth() + 1)),
//           durationType: bookingData.durationType || 'monthly',
//           durationDays: bookingData.durationDays || null,
//           durationMonths: bookingData.durationMonths || null,
//           personCount: parseInt(bookingData.personCount) || 1,
//           customerDetails: bookingData.customerDetails || {},
//           pricing: {
//             monthlyRent: roomTypeConfig.price * bookingData.selectedRooms.length,
//             totalRent: bookingData.pricing?.totalRent || roomTypeConfig.price * bookingData.selectedRooms.length,
//             securityDeposit: securityDeposit,
//             advanceAmount: advanceAmount,
//             totalAmount: totalAmount,
//             maintenanceFee: 0
//           },
//           paymentInfo: {
//             paymentStatus: 'paid',
//             paymentMethod: 'razorpay',
//             transactionId: razorpay_payment_id,
//             razorpayOrderId: razorpay_order_id,
//             razorpayPaymentId: razorpay_payment_id,
//             razorpaySignature: razorpay_signature,
//             paidAmount: amount ? amount / 100 : totalAmount,
//             paymentDate: new Date()
//           },
//           bookingStatus: 'confirmed',
//           transferStatus: 'pending',
//           payments: [{
//             date: new Date(),
//             amount: amount ? amount / 100 : totalAmount,
//             method: 'razorpay',
//             transactionId: razorpay_payment_id,
//             status: 'completed',
//             description: 'Booking payment',
//             razorpayOrderId: razorpay_order_id,
//             razorpayPaymentId: razorpay_payment_id,
//             razorpaySignature: razorpay_signature
//           }],
//           outstandingAmount: 0
//         };

//         console.log('Creating booking with data:', finalBookingData);

//         // Create and save the booking
//         const newBooking = new Booking(finalBookingData);
//         await newBooking.save({ session });

//         console.log('✅ Booking created successfully after payment:', newBooking._id);

//         // Initiate automatic transfer to client
//         let transferResult = null;
//         let transferInitiated = false;
//         let transferError = null;
        
//         try {
//           transferResult = await newBooking.initiateTransfer();
//           transferInitiated = true;
//           console.log('Transfer initiated successfully for booking:', newBooking._id, transferResult);
//         } catch (transferError) {
//           console.error('Transfer initiation failed for booking:', newBooking._id, transferError);
//           transferInitiated = false;
//           transferError = transferError.message;
//         }

//         await session.commitTransaction();
//         session.endSession();
        
//         // Prepare response
//         const response = {
//           success: true,
//           message: 'Payment verified successfully and booking created',
//           paymentId: razorpay_payment_id,
//           orderId: razorpay_order_id,
//           booking: {
//             id: newBooking._id,
//             property: property.name,
//             roomType: newBooking.roomType.name,
//             rooms: newBooking.roomDetails,
//             moveInDate: newBooking.moveInDate.toISOString().split('T')[0],
//             moveOutDate: newBooking.moveOutDate.toISOString().split('T')[0],
//             status: newBooking.bookingStatus,
//             paymentStatus: newBooking.paymentInfo.paymentStatus,
//             transferStatus: newBooking.transferStatus
//           },
//           transferInitiated: transferInitiated
//         };

//         if (transferInitiated && transferResult) {
//           response.transferDetails = transferResult;
//           response.message += ' and transfer initiated';
//           response.transferAmounts = transferResult.transferAmounts;
//         } else if (!transferInitiated) {
//           response.message += ' but transfer failed. Please initiate transfer manually.';
//           response.transferError = transferError;
//         }

//         console.log('Payment validation and booking creation completed:', response);
//         res.status(200).json(response);

//       } catch (bookingError) {
//         await session.abortTransaction();
//         session.endSession();
//         console.error('Booking creation error after payment:', bookingError);
//         throw new Error(`Booking creation failed after payment: ${bookingError.message}`);
//       }
//     } else {
//       await session.commitTransaction();
//       session.endSession();
//       res.status(200).json({
//         success: true,
//         message: 'Payment verified successfully',
//         paymentId: razorpay_payment_id,
//         orderId: razorpay_order_id
//       });
//     }

//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error('Payment validation error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Payment validation failed',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Helper function to check room availability before booking creation
// const checkRoomAvailabilityBeforeBooking = async (propertyId, selectedRooms, moveInDate, endDate, session) => {
//   const parsedMoveInDate = new Date(moveInDate);
//   parsedMoveInDate.setUTCHours(0, 0, 0, 0);

//   let parsedEndDate;
//   if (endDate) {
//     parsedEndDate = new Date(endDate);
//     parsedEndDate.setUTCHours(0, 0, 0, 0);
//   } else {
//     parsedEndDate = new Date(parsedMoveInDate);
//     parsedEndDate.setMonth(parsedMoveInDate.getMonth() + 1);
//   }

//   const unavailableRooms = [];

//   for (const roomInfo of selectedRooms) {
//     const parts = roomInfo.split('-');
//     if (parts.length < 3) {
//       unavailableRooms.push(roomInfo);
//       continue;
//     }

//     const sharingType = parts[0];
//     const roomNumber = parts.slice(1, parts.length - 1).join('-');
//     const bedFromRequest = parts[parts.length - 1];

//     // Get room configuration to find actual bed name
//     const roomConfig = await Room.findOne({ propertyId });
//     if (!roomConfig) continue;

//     let actualBedName = bedFromRequest;
//     for (const floorConfig of roomConfig.floorConfig.floors) {
//       if (floorConfig.rooms && floorConfig.rooms.has(roomNumber)) {
//         const beds = floorConfig.rooms.get(roomNumber);
//         const foundBed = beds.find(bed => 
//           bed.replace(/\s+/g, '') === bedFromRequest.replace(/\s+/g, '')
//         );
//         if (foundBed) {
//           actualBedName = foundBed;
//           break;
//         }
//       }
//     }

//     const roomIdentifier = `${sharingType}-${roomNumber}-${actualBedName}`;

//     // Check for existing bookings
//     const conflict = await Booking.findOne({
//       propertyId,
//       'roomDetails.roomIdentifier': roomIdentifier,
//       bookingStatus: { $nin: ['cancelled', 'checked_out', 'rejected'] },
//       $or: [
//         {
//           moveInDate: { $lte: parsedMoveInDate },
//           moveOutDate: { $gte: parsedMoveInDate }
//         },
//         {
//           moveInDate: { $gte: parsedMoveInDate, $lte: parsedEndDate }
//         },
//         {
//           moveInDate: { $lte: parsedMoveInDate },
//           moveOutDate: { $gte: parsedEndDate }
//         }
//       ]
//     }).session(session);

//     if (conflict) {
//       unavailableRooms.push(roomInfo);
//     }
//   }

//   return {
//     available: unavailableRooms.length === 0,
//     unavailableRooms
//   };
// };

// // Manual transfer initiation endpoint
// export const initiateManualTransfer = async (req, res) => {
//   try {
//     const { bookingId } = req.params;

//     const booking = await Booking.findById(bookingId);
    
//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: 'Booking not found'
//       });
//     }

//     if (booking.paymentInfo.paymentStatus !== 'paid') {
//       return res.status(400).json({
//         success: false,
//         message: 'Booking payment not completed'
//       });
//     }

//     if (booking.transferStatus === 'completed') {
//       return res.status(400).json({
//         success: false,
//         message: 'Transfer already completed'
//       });
//     }

//     const transferResult = await booking.initiateTransfer();

//     res.status(200).json({
//       success: true,
//       message: 'Transfer initiated successfully',
//       transferDetails: transferResult,
//       booking: {
//         id: booking._id,
//         transferStatus: booking.transferStatus
//       }
//     });

//   } catch (error) {
//     console.error('Manual transfer initiation error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to initiate transfer',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Check transfer status
// export const checkTransferStatus = async (req, res) => {
//   try {
//     const { bookingId } = req.params;

//     const booking = await Booking.findById(bookingId);
    
//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: 'Booking not found'
//       });
//     }

//     const transferStatus = await booking.checkTransferStatus();

//     res.status(200).json({
//       success: true,
//       transferStatus: booking.transferStatus,
//       transferDetails: booking.transferDetails,
//       payoutStatus: transferStatus
//     });

//   } catch (error) {
//     console.error('Check transfer status error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to check transfer status'
//     });
//   }
// };

// // Get payment details
// export const getPaymentDetails = async (req, res) => {
//   try {
//     const { paymentId } = req.params;

//     if (!paymentId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Payment ID is required'
//       });
//     }

//     const payment = await razorpay.payments.fetch(paymentId);

//     res.status(200).json({
//       success: true,
//       payment
//     });

//   } catch (error) {
//     console.error('Get payment details error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch payment details',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Refund payment
// export const refundPayment = async (req, res) => {
//   try {
//     const { paymentId, amount, bookingId } = req.body;

//     if (!paymentId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Payment ID is required'
//       });
//     }

//     const refund = await razorpay.payments.refund(paymentId, {
//       amount: amount ? parseInt(amount) : undefined
//     });

//     // Update booking status if refund is successful and bookingId is provided
//     if (bookingId) {
//       try {
//         await Booking.findByIdAndUpdate(
//           bookingId,
//           {
//             'paymentInfo.paymentStatus': 'refunded',
//             'bookingStatus': 'cancelled'
//           }
//         );
//       } catch (updateError) {
//         console.error('Error updating booking status during refund:', updateError);
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Refund processed successfully',
//       refund
//     });

//   } catch (error) {
//     console.error('Refund error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to process refund',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Send payment request to user
// export const sendPaymentRequest = async (req, res) => {
//   try {
//     const { userId, amount, description, dueDate, bookingId } = req.body;
    
//     if (!userId || !amount) {
//       return res.status(400).json({
//         success: false,
//         message: 'User ID and amount are required'
//       });
//     }

//     console.log('Payment request sent to user:', { userId, amount, description, dueDate, bookingId });

//     res.status(200).json({
//       success: true,
//       message: 'Payment request sent successfully',
//       data: {
//         userId,
//         amount,
//         description,
//         dueDate,
//         bookingId
//       }
//     });

//   } catch (error) {
//     console.error('Send payment request error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to send payment request',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get client payments for a booking
// export const getClientPaymentsForBooking = async (req, res) => {
//   try {
//     const { propertyId, bookingId } = req.params;
    
//     if (!propertyId || !bookingId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Property ID and Booking ID are required'
//       });
//     }
    
//     const booking = await Booking.findOne({ _id: bookingId, propertyId })
//       .select('payments transferDetails pricing')
//       .lean();
      
//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: 'Booking not found for the given property'
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       payments: booking.payments || [],
//       transferDetails: booking.transferDetails || {},
//       pricing: booking.pricing || {}
//     });
    
//   } catch (error) {
//     console.error('Get client payments for booking error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch client payments for booking',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get payment history for a booking
// export const getPaymentHistory = async (req, res) => {
//   try {
//     const { bookingId } = req.params;

//     if (!bookingId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Booking ID is required'
//       });
//     }

//     // Find the booking and its payments
//     const booking = await Booking.findById(bookingId)
//       .select('payments pricing outstandingAmount userId propertyId customerDetails transferDetails')
//       .lean();

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: 'Booking not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       payments: booking.payments || [],
//       outstandingAmount: booking.outstandingAmount,
//       totalAmount: (booking.pricing.totalAmount || 0) + 
//                    (booking.pricing.securityDeposit || 0) +
//                    (booking.pricing.maintenanceFee || 0),
//       transferDetails: booking.transferDetails || {},
//       userId: booking.userId,
//       propertyId: booking.propertyId,
//       customerDetails: booking.customerDetails
//     });

//   } catch (error) {
//     console.error('Get payment history error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch payment history'
//     });
//   }
// };




import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import BankAccount from '../models/BankAccount.js'; // Add this line
import Transfer from '../models/Transfer.js'; // Add this line
import Admin from '../models/Admin.js';
import { NotificationService } from './notificationController.js';

// Initialize Razorpay
// Initialize Razorpay with error handling
let razorpay;
try {
  console.log('🔧 Initializing Razorpay...');
  console.log('💰 Key ID:', process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing');
  console.log('🔑 Key Secret:', process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing');
  
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials missing in environment variables');
  }
  
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  
  console.log('Razorpay initialized successfully');
  console.log('Environment:', process.env.RAZORPAY_KEY_ID.includes('_live_') ? 'LIVE' : 'TEST');
  
} catch (error) {
  console.error(' Razorpay initialization failed:', error.message);
  razorpay = null;
}






// Room availability check function
// Room availability check function
const checkRoomAvailabilityBeforeBooking = async (propertyId, selectedRooms, moveInDate, endDate, session) => {
  const unavailableRooms = [];

  for (const roomIdentifier of selectedRooms) {
    const conflict = await Booking.findOne({
      propertyId,
      'roomDetails.roomIdentifier': roomIdentifier,
      bookingStatus: { $nin: ['cancelled', 'checked_out', 'rejected'] },
      $or: [
        { 
          moveInDate: { $lt: endDate }, 
          moveOutDate: { $gt: moveInDate } 
        }
      ]
    }).session(session);

    if (conflict) {
      unavailableRooms.push(roomIdentifier);
    }
  }

  return {
    available: unavailableRooms.length === 0,
    unavailableRooms
  };
};

// Calculate transfer breakdown
const calculateTransferBreakdown = (totalAmount) => {
  const platformCommission = totalAmount * 0.05;
  const gstOnCommission = platformCommission * 0.18;
  const totalPlatformEarnings = platformCommission + gstOnCommission;
  const clientAmount = totalAmount - totalPlatformEarnings;

  return {
    platformCommission,
    gstOnCommission,
    totalPlatformEarnings,
    clientAmount,
    breakdown: {
      totalPayment: totalAmount,
      platformCommissionRate: '5%',
      gstRate: '18%',
      platformCommission,
      gstOnCommission,
      clientAmount
    }
  };
};

// Create Razorpay order - FIXED VERSION
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, bookingData } = req.body;

    console.log('💰 Creating order for amount:', amount, 'Currency:', currency);

    // Validate Razorpay instance
    if (!razorpay) {
      console.error('❌ Razorpay not initialized');
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not initialized. Please check server configuration.'
      });
    }

    // Validate amount - FIXED: Handle both string and number
    let amountInPaise;
    if (typeof amount === 'string') {
      amountInPaise = parseInt(amount);
    } else if (typeof amount === 'number') {
      amountInPaise = Math.round(amount);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount format'
      });
    }

    // Validate minimum amount
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      console.log('⚠️ Amount too low, setting to minimum 100 paise (1 INR)');
      amountInPaise = 100; // Minimum 1 INR for testing
    }

    // For testing with very small amounts, ensure minimum
    if (amountInPaise < 100) {
      amountInPaise = 100;
    }

    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    };

    // Add notes only if bookingData exists
    if (bookingData) {
      options.notes = {
        booking_data: JSON.stringify(bookingData)
      };
    }

    console.log('📦 Order creation options:', {
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt
    });

    // Create order with detailed error handling
    let order;
    try {
      order = await razorpay.orders.create(options);
      console.log('✅ Order created successfully:', order.id);
    } catch (razorpayError) {
      console.error('❌ Razorpay API error:', {
        statusCode: razorpayError.statusCode,
        error: razorpayError.error,
        description: razorpayError.error?.description,
        code: razorpayError.error?.code
      });

      // Handle specific Razorpay errors
      if (razorpayError.error?.code === 'BAD_REQUEST_ERROR') {
        return res.status(400).json({
          success: false,
          message: `Payment error: ${razorpayError.error.description}`,
          code: razorpayError.error.code
        });
      }

      if (razorpayError.error?.code === 'UNAUTHORIZED_ERROR') {
        return res.status(401).json({
          success: false,
          message: 'Invalid Razorpay credentials',
          code: razorpayError.error.code
        });
      }

      // Generic Razorpay error
      return res.status(400).json({
        success: false,
        message: razorpayError.error?.description || 'Razorpay API error',
        code: razorpayError.error?.code
      });
    }

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });

  } catch (error) {
    console.error('❌ Order creation error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Validate payment - SIMPLIFIED AND FIXED VERSION
export const validatePayment = async (req, res) => {
  let session;
  
  try {
    session = await mongoose.startSession();
    await session.startTransaction();
    
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      bookingData 
    } = req.body;

    console.log('🔍 Starting payment validation...', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      has_booking_data: !!bookingData,
      user_id: req.user?.id
    });

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data'
      });
    }

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    console.log('🔐 Signature verification:', {
      expected_length: expectedSignature.length,
      received_length: razorpay_signature.length,
      match: expectedSignature === razorpay_signature
    });

    if (expectedSignature !== razorpay_signature) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - invalid signature'
      });
    }

    console.log('✅ Payment signature verified');

    // Get payment details from Razorpay
    let payment;
    try {
      payment = await razorpay.payments.fetch(razorpay_payment_id);
      console.log('✅ Payment details:', {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency
      });
    } catch (razorpayError) {
      console.error('❌ Razorpay payment fetch error:', razorpayError);
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch payment details from Razorpay'
      });
    }

    if (payment.status !== 'captured') {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Payment not captured successfully'
      });
    }

    const amount = payment.amount / 100; // Convert from paise to rupees

    // Validate user authentication
    if (!req.user || !req.user.id) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // CREATE OR UPDATE BOOKING
    console.log('📝 Processing booking creation/update...');
    
    let booking;
    
    // If we have booking data, try to find existing pending booking
    if (bookingData && bookingData.propertyId) {
      booking = await Booking.findOne({
        userId: req.user.id,
        propertyId: bookingData.propertyId,
        bookingStatus: 'pending_payment'
      }).session(session);
    }

    // If no existing booking found, create a new one
    if (!booking && bookingData) {
      console.log('🆕 Creating new booking after payment...');
      
      // Get property details
      const property = await Property.findById(bookingData.propertyId).session(session);
      if (!property) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Process room details
      const roomDetails = (bookingData.selectedRooms || []).map(roomIdentifier => {
        try {
          const parts = roomIdentifier.split('-');
          if (parts.length >= 3) {
            const sharingType = parts[0];
            const roomNumber = parts[1];
            const bed = parts.slice(2).join('-');
            
            return {
              roomIdentifier: roomIdentifier,
              sharingType: sharingType,
              floor: parseInt(roomNumber.charAt(0)) || 1,
              roomNumber: roomNumber,
              bed: bed
            };
          }
          return {
            roomIdentifier: roomIdentifier,
            sharingType: bookingData.roomType || 'unknown',
            floor: 1,
            roomNumber: 'unknown',
            bed: 'unknown'
          };
        } catch (error) {
          return {
            roomIdentifier: roomIdentifier,
            sharingType: bookingData.roomType || 'unknown',
            floor: 1,
            roomNumber: 'unknown',
            bed: 'unknown'
          };
        }
      });

      // Create booking data
      const bookingDataToSave = {
        userId: req.user.id,
        clientId: property.clientId,
        propertyId: bookingData.propertyId,
        roomType: {
          type: bookingData.roomType || 'single',
          name: bookingData.roomType || 'Single Room',
          capacity: parseInt(bookingData.personCount) || 1
        },
        roomDetails: roomDetails,
        moveInDate: new Date(bookingData.moveInDate),
        moveOutDate: new Date(bookingData.endDate || bookingData.moveOutDate),
        durationType: bookingData.durationType || 'monthly',
        durationDays: bookingData.durationDays || null,
        durationMonths: bookingData.durationMonths || null,
        personCount: parseInt(bookingData.personCount) || 1,
        customerDetails: bookingData.customerDetails || {},
        pricing: bookingData.pricing || {
          monthlyRent: 1,
          totalRent: 1,
          securityDeposit: 0,
          advanceAmount: 1,
          totalAmount: amount,
          maintenanceFee: 0
        },
        paymentInfo: {
          paymentStatus: 'paid',
          paymentMethod: 'razorpay',
          transactionId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paidAmount: amount,
          paymentDate: new Date(),
          outstandingAmount: 0
        },
        bookingStatus: 'confirmed',
        transferStatus: 'manual_pending',
        payments: [{
          date: new Date(),
          amount: amount,
          method: 'razorpay',
          transactionId: razorpay_payment_id,
          status: 'completed',
          description: 'Booking payment',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature
        }]
      };

      // Calculate transfer breakdown
      const transferBreakdown = calculateTransferBreakdown(amount);
      bookingDataToSave.transferDetails = {
        totalAmount: amount,
        platformCommission: transferBreakdown.platformCommission,
        gstOnCommission: transferBreakdown.gstOnCommission,
        totalPlatformEarnings: transferBreakdown.totalPlatformEarnings,
        clientAmount: transferBreakdown.clientAmount,
        clientTransferStatus: 'pending',
        breakdown: transferBreakdown.breakdown,
        transferNotes: 'Awaiting manual transfer to property owner'
      };

      booking = new Booking(bookingDataToSave);
      await booking.save({ session });
      console.log('✅ New booking created after payment:', booking._id);
      
    } else if (booking) {
      // Update existing booking
      console.log('🔄 Updating existing booking:', booking._id);
      
      booking.paymentInfo = {
        ...booking.paymentInfo,
        paymentStatus: 'paid',
        transactionId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAmount: amount,
        paymentDate: new Date(),
        outstandingAmount: 0
      };

      booking.bookingStatus = 'confirmed';
      
      booking.payments.push({
        date: new Date(),
        amount: amount,
        method: 'razorpay',
        transactionId: razorpay_payment_id,
        status: 'completed',
        description: 'Booking payment',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      });

      // Calculate transfer breakdown
      const transferBreakdown = calculateTransferBreakdown(amount);
      booking.transferStatus = 'manual_pending';
      booking.transferDetails = {
        totalAmount: amount,
        platformCommission: transferBreakdown.platformCommission,
        gstOnCommission: transferBreakdown.gstOnCommission,
        totalPlatformEarnings: transferBreakdown.totalPlatformEarnings,
        clientAmount: transferBreakdown.clientAmount,
        clientTransferStatus: 'pending',
        breakdown: transferBreakdown.breakdown,
        transferNotes: 'Awaiting manual transfer to property owner'
      };

      await booking.save({ session });
      console.log('✅ Existing booking updated after payment');
    } else {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({
        success: false,
        message: 'No booking data provided and no existing booking found'
      });
    }

    await session.commitTransaction();
    await session.endSession();

    // Populate the booking for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('propertyId', 'name locality city images')
      .populate('userId', 'name email');

    // Create notifications
    try {
      await NotificationService.createBookingNotification(
        populatedBooking,
        'booking_paid',
        {
          amount: amount,
          razorpayPaymentId: razorpay_payment_id
        }
      );
      console.log('✅ Payment notification created');
    } catch (notificationError) {
      console.error('❌ Failed to create notification:', notificationError);
    }

    // Prepare response
    const response = {
      success: true,
      message: 'Payment verified and booking confirmed successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: amount,
      booking: {
        id: populatedBooking._id,
        propertyId: populatedBooking.propertyId?._id,
        propertyName: populatedBooking.propertyId?.name,
        propertyLocality: populatedBooking.propertyId?.locality,
        propertyCity: populatedBooking.propertyId?.city,
        roomType: populatedBooking.roomType?.name,
        rooms: populatedBooking.roomDetails,
        moveInDate: populatedBooking.moveInDate,
        moveOutDate: populatedBooking.moveOutDate,
        status: populatedBooking.bookingStatus,
        paymentStatus: populatedBooking.paymentInfo.paymentStatus,
        totalAmount: populatedBooking.pricing.totalAmount,
        customerDetails: populatedBooking.customerDetails
      }
    };

    console.log('🎉 Payment validation completed successfully');

    return res.status(200).json(response);

  } catch (error) {
    // Enhanced error handling
    try {
      if (session && session.inTransaction()) {
        await session.abortTransaction();
      }
      if (session) {
        await session.endSession();
      }
    } catch (sessionError) {
      console.error('❌ Session cleanup error:', sessionError);
    }

    console.error('❌ Payment validation error:', error.message);

    let errorMessage = 'Payment validation failed';
    let statusCode = 500;

    if (error.name === 'ValidationError') {
      errorMessage = 'Data validation error';
      statusCode = 400;
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid data format';
      statusCode = 400;
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};






export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const payment = await razorpay.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details'
    });
  }
};

// Refund payment
// Refund payment with notifications
export const refundPayment = async (req, res) => {
  try {
    const { paymentId, amount, bookingId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? parseInt(amount) : undefined
    });

    // Update booking status if refund is successful and bookingId is provided
    if (bookingId) {
      try {
        const updatedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          {
            'paymentInfo.paymentStatus': 'refunded',
            'bookingStatus': 'cancelled'
          },
          { new: true }
        ).populate('userId', 'name email');

        // Create refund notification
        if (updatedBooking && updatedBooking.userId) {
          try {
            await NotificationService.createPaymentNotification(
              updatedBooking.userId._id,
              'payment_refunded',
              amount || updatedBooking.pricing.totalAmount,
              bookingId,
              {
                refundId: refund.id,
                bookingId: bookingId
              }
            );
            console.log('💰 Refund notification created for user');
          } catch (notificationError) {
            console.error('❌ Failed to create refund notification:', notificationError);
          }
        }
      } catch (updateError) {
        console.error('Error updating booking status during refund:', updateError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      refund
    });

  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
};

// Get payment history for a booking
export const getPaymentHistory = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const booking = await Booking.findById(bookingId)
      .select('payments pricing outstandingAmount userId propertyId customerDetails transferDetails')
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      payments: booking.payments || [],
      outstandingAmount: booking.outstandingAmount,
      totalAmount: (booking.pricing.totalAmount || 0) + 
                   (booking.pricing.securityDeposit || 0) +
                   (booking.pricing.maintenanceFee || 0),
      transferDetails: booking.transferDetails || {},
      userId: booking.userId,
      propertyId: booking.propertyId,
      customerDetails: booking.customerDetails
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
};



/// Helper function to determine payment type
const getPaymentType = (amount, pricing, bookingStatus, description = '') => {
  const desc = description.toLowerCase();
  
  if (desc.includes('security') || desc.includes('deposit')) {
    return 'security_deposit';
  } else if (desc.includes('advance')) {
    return 'advance_payment';
  } else if (desc.includes('maintenance')) {
    return 'maintenance_fee';
  } else if (desc.includes('rent')) {
    return 'rent_payment';
  } else if (amount === pricing?.securityDeposit) {
    return 'security_deposit';
  } else if (amount === pricing?.advanceAmount) {
    return 'advance_payment';
  } else if (amount === pricing?.maintenanceFee) {
    return 'maintenance_fee';
  } else if (bookingStatus === 'confirmed' || bookingStatus === 'approved') {
    return 'booking_payment';
  } else {
    return 'general_payment';
  }
};

export const getUserPayments = async (req, res) => {
  try {
    // Extract user ID from token or param
    const userId = req.user?._id || req.user?.id || req.params.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }

    console.log("🧾 Fetching payments for user:", userId);

    // Fetch all bookings by userId
    const bookings = await Booking.find({ userId })
      .populate("propertyId", "propertyName propertyCity propertyState location")
      .sort({ createdAt: -1 });

    if (!bookings.length) {
      return res.status(200).json({ success: true, payments: [] });
    }

    // Format the payments nicely
    const payments = bookings.flatMap((booking) =>
      (booking.payments || []).map((payment) => ({
        bookingId: booking._id,
        propertyId: booking.propertyId?._id || null,
        propertyName: booking.propertyId?.propertyName || "N/A",
        propertyCity: booking.propertyId?.propertyCity || "N/A",
        propertyState: booking.propertyId?.propertyState || "N/A",
        location: booking.propertyId?.location || "N/A",
        amount: payment.amount || 0,
        method: payment.method || "unknown",
        status: payment.status || booking.paymentInfo?.paymentStatus || "pending",
        transactionId:
          payment.transactionId || booking.paymentInfo?.transactionId || "N/A",
        date: payment.date || booking.createdAt,
        bookingStatus: booking.bookingStatus || "N/A",
      }))
    );

    console.log(`✅ Found ${payments.length} payments for user.`);

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("❌ Error fetching user payments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
      error: error.message,
    });
  }
};
// Get payments by clientId
export const getPaymentsByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'Client ID is required'
      });
    }

    console.log('Fetching payments for client:', clientId);

    // Find all bookings for the client and populate necessary fields
    const bookings = await Booking.find({ clientId })
      .populate('propertyId', 'name address city state')
      .populate('userId', 'name email phone')
      .select('payments pricing paymentInfo transferDetails bookingStatus customerDetails roomType roomDetails moveInDate moveOutDate createdAt')
      .sort({ createdAt: -1 })
      .lean();

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No payments found for this client',
        payments: [],
        stats: {
          totalPayments: 0,
          totalAmount: 0,
          successfulPayments: 0,
          failedPayments: 0,
          pendingPayments: 0,
          monthlyRevenue: 0,
          activeBookings: 0
        }
      });
    }

    // Extract and format payment data
    const payments = [];
    const stats = {
      totalPayments: 0,
      totalAmount: 0,
      successfulPayments: 0,
      failedPayments: 0,
      pendingPayments: 0,
      monthlyRevenue: 0,
      activeBookings: 0
    };

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    bookings.forEach(booking => {
      // Count active bookings
      if (['confirmed', 'approved', 'checked_in'].includes(booking.bookingStatus)) {
        stats.activeBookings++;
      }

      if (booking.payments && booking.payments.length > 0) {
        booking.payments.forEach(payment => {
          stats.totalPayments++;
          stats.totalAmount += payment.amount || 0;

          if (payment.status === 'completed') {
            stats.successfulPayments++;
            
            // Calculate monthly revenue
            const paymentDate = new Date(payment.date);
            if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
              stats.monthlyRevenue += payment.amount || 0;
            }
          } else if (payment.status === 'failed') {
            stats.failedPayments++;
          } else if (payment.status === 'pending') {
            stats.pendingPayments++;
          }

          const paymentData = {
            _id: payment._id,
            bookingId: booking._id,
            clientId: clientId,
            propertyId: booking.propertyId?._id,
            propertyName: booking.propertyId?.name || 'Unknown Property',
            propertyAddress: booking.propertyId?.address || 'Address not available',
            customerName: booking.customerDetails?.primary?.name || 'Unknown Customer',
            customerEmail: booking.customerDetails?.primary?.email || 'No email',
            customerPhone: booking.customerDetails?.primary?.mobile || 'No phone',
            roomType: booking.roomType?.name || 'Unknown Room',
            roomDetails: booking.roomDetails || [],
            moveInDate: booking.moveInDate,
            moveOutDate: booking.moveOutDate,
            date: payment.date,
            amount: payment.amount || 0,
            method: payment.method || 'razorpay',
            transactionId: payment.transactionId || 'N/A',
            status: payment.status || 'pending',
            description: payment.description || 'Booking payment',
            bookingStatus: booking.bookingStatus,
            paymentStatus: booking.paymentInfo?.paymentStatus || 'pending',
            razorpayPaymentId: payment.razorpayPaymentId,
            razorpayOrderId: payment.razorpayOrderId,
            createdAt: booking.createdAt,
            // Transfer details
            transferStatus: booking.transferStatus,
            clientAmount: booking.transferDetails?.clientAmount,
            platformCommission: booking.transferDetails?.platformCommission
          };
          
          payments.push(paymentData);
        });
      }
    });

    // Sort payments by date (newest first)
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(`Found ${payments.length} payments for client ${clientId}`);

    res.status(200).json({
      success: true,
      payments: payments,
      stats: stats,
      totalPayments: payments.length,
      totalAmount: stats.totalAmount,
      message: `Found ${payments.length} payment${payments.length !== 1 ? 's' : ''} for client ${clientId}`
    });

  } catch (error) {
    console.error('Get payments by clientId error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get client payments for a booking
export const getClientPaymentsForBooking = async (req, res) => {
  try {
    const { propertyId, bookingId } = req.params;
    
    if (!propertyId || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Property ID and Booking ID are required'
      });
    }
    
    const booking = await Booking.findOne({ _id: bookingId, propertyId })
      .select('payments transferDetails pricing')
      .lean();
      
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found for the given property'
      });
    }
    
    res.status(200).json({
      success: true,
      payments: booking.payments || [],
      transferDetails: booking.transferDetails || {},
      pricing: booking.pricing || {}
    });
    
  } catch (error) {
    console.error('Get client payments for booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client payments for booking'
    });
  }
};

// Manual transfer to client
// export const initiateManualTransfer = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const { transferNotes } = req.body;

//     const booking = await Booking.findById(bookingId).populate('propertyId');
//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: 'Booking not found'
//       });
//     }

//     if (booking.transferStatus === 'completed') {
//       return res.status(400).json({
//         success: false,
//         message: 'Transfer already completed'
//       });
//     }

//     if (booking.paymentInfo.paymentStatus !== 'paid') {
//       return res.status(400).json({
//         success: false,
//         message: 'Payment not completed yet'
//       });
//     }

//     // Here you would implement the actual bank transfer logic
//     console.log('💸 Initiating manual transfer for booking:', bookingId);
//     console.log('Transfer amount:', booking.transferDetails.clientAmount);

//     // Update booking status
//     booking.transferStatus = 'completed';
//     booking.transferDetails.clientTransferStatus = 'completed';
//     booking.transferDetails.transferNotes = transferNotes || 'Manual transfer completed by admin';
//     booking.transferDetails.processedBy = req.user.id;
//     booking.transferDetails.processedAt = new Date();
//     await booking.save();

//     res.status(200).json({
//       success: true,
//       message: 'Manual transfer recorded successfully',
//       transferDetails: {
//         amount: booking.transferDetails.clientAmount,
//         status: 'completed',
//         processedAt: booking.transferDetails.processedAt,
//         processedBy: req.user.id,
//         notes: booking.transferDetails.transferNotes
//       }
//     });

//   } catch (error) {
//     console.error('Manual transfer error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to initiate manual transfer'
//     });
//   }
// };


// razorpayController.js - Add these manual transfer functions

// Manual transfer to client bank account
export const initiateManualTransfer = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { bankAccountId, notes } = req.body;
    
    console.log('🔄 Initiating manual transfer for booking:', bookingId);
    console.log('💰 Bank account ID:', bankAccountId);
    console.log('👤 Admin ID:', req.user?.id);

    // Validate input
    if (!bookingId || !bankAccountId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and Bank Account ID are required'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bankAccountId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bank account ID format'
      });
    }

    // Find the booking with proper population
    const booking = await Booking.findById(bookingId)
      .populate('propertyId', 'name locality address OwnerID')
      .populate('userId', 'name email phone')
      .populate('approvedBy', 'name')
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    console.log('📋 Booking found:', {
      id: booking._id,
      property: booking.propertyId?.name,
      status: booking.bookingStatus,
      transferStatus: booking.transferStatus
    });

    // Check if booking is eligible for transfer
    if (booking.paymentInfo?.paymentStatus !== 'paid' && booking.paymentInfo?.paymentStatus !== 'partial') {
      return res.status(400).json({
        success: false,
        message: 'Booking payment is not completed. Cannot initiate transfer.'
      });
    }

    // Find the bank account
    const bankAccount = await BankAccount.findById(bankAccountId).lean();
    
    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    console.log('🏦 Bank account found:', {
      holder: bankAccount.accountHolderName,
      account: bankAccount.accountNumber,
      bank: bankAccount.bankName,
      ifsc: bankAccount.ifscCode || bankAccount.ifsc
    });

    // Calculate transfer amounts
    const transferAmounts = calculateTransferAmounts(booking);
    const transferAmount = transferAmounts.clientAmount;

    if (transferAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transfer amount'
      });
    }

    console.log('💰 Transfer amount calculation:', {
      totalAmount: booking.pricing?.totalAmount,
      clientAmount: transferAmount,
      platformCommission: transferAmounts.platformCommission,
      gstOnCommission: transferAmounts.gstOnCommission
    });

    // Create transfer record
    const transferRecord = new Transfer({
      bookingId: booking._id,
      clientId: booking.clientId,
      propertyId: booking.propertyId?._id || booking.propertyId,
      bankAccountId: bankAccount._id,
      amount: transferAmount,
      currency: 'INR',
      status: 'initiated',
      initiatedBy: req.user.id,
      notes: notes || `Manual transfer for booking ${booking._id}`,
      transferDetails: {
        accountHolderName: bankAccount.accountHolderName,
        accountNumber: bankAccount.accountNumber,
        bankName: bankAccount.bankName,
        ifscCode: bankAccount.ifscCode || bankAccount.ifsc,
        branchName: bankAccount.branchName
      },
      manualTransfer: true
    });

    await transferRecord.save();

    console.log('✅ Transfer record created:', transferRecord._id);

    // Update booking transfer status and details
    await Booking.findByIdAndUpdate(bookingId, {
      $set: {
        transferStatus: 'processing',
        'transferDetails.clientAmount': transferAmount,
        'transferDetails.platformCommission': transferAmounts.platformCommission,
        'transferDetails.gstOnCommission': transferAmounts.gstOnCommission,
        'transferDetails.totalPlatformEarnings': transferAmounts.totalPlatformEarnings,
        'transferDetails.clientTransferStatus': 'processing',
        'transferDetails.bankAccount': {
          accountNumber: bankAccount.accountNumber,
          bankName: bankAccount.bankName,
          ifscCode: bankAccount.ifscCode || bankAccount.ifsc,
          accountHolderName: bankAccount.accountHolderName
        },
        'transferDetails.transferNotes': notes || `Manual transfer initiated by admin`,
        'transferDetails.processedBy': req.user.id,
        'transferDetails.processedAt': new Date(),
        'transferDetails.breakdown': transferAmounts.breakdown
      }
    });

    // Prepare response
    const response = {
      success: true,
      message: 'Manual transfer initiated successfully',
      transferDetails: {
        id: transferRecord._id,
        bookingId: transferRecord.bookingId,
        amount: transferRecord.amount,
        status: transferRecord.status,
        bankAccount: {
          holder: bankAccount.accountHolderName,
          account: bankAccount.accountNumber,
          bank: bankAccount.bankName,
          ifsc: bankAccount.ifscCode || bankAccount.ifsc
        },
        initiatedAt: transferRecord.createdAt,
        notes: transferRecord.notes,
        calculatedAmounts: transferAmounts.breakdown
      }
    };

    console.log('✅ Manual transfer initiated successfully');
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Manual transfer error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // More detailed error logging
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID or bank account ID format'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Data validation failed',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to initiate manual transfer',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Helper function to calculate transfer amounts
const calculateTransferAmounts = (booking) => {
  const totalAmount = booking.pricing?.totalAmount || 0;
  
  // Platform commission (5%)
  const platformCommission = totalAmount * 0.05;
  
  // GST on platform commission (18%)
  const gstOnCommission = platformCommission * 0.18;
  
  // Total platform earnings (commission + GST)
  const totalPlatformEarnings = platformCommission + gstOnCommission;
  
  // Client amount (total payment - platform earnings)
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
// Helper function to calculate transfer amounts

// Get transfer details for a booking
export const getTransferDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('propertyId', 'name ownerId')
      .populate('userId', 'name email')
      .populate('transferDetails.processedBy', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const transferDetails = {
      bookingId: booking._id,
      propertyId: booking.propertyId?._id,
      propertyName: booking.propertyId?.name,
      clientId: booking.propertyId?.ownerId || booking.clientId,
      customerName: booking.customerDetails?.primary?.name,
      amount: booking.transferDetails?.clientAmount || 0,
      platformCommission: booking.transferDetails?.platformCommission || 0,
      totalPlatformEarnings: booking.transferDetails?.totalPlatformEarnings || 0,
      transferStatus: booking.transferStatus,
      paymentStatus: booking.paymentInfo?.paymentStatus,
      bankAccountUsed: booking.transferDetails?.bankAccountUsed,
      transferNotes: booking.transferDetails?.transferNotes,
      processedBy: booking.transferDetails?.processedBy,
      processedAt: booking.transferDetails?.processedAt,
      transferCompletedAt: booking.transferDetails?.transferCompletedAt,
      createdAt: booking.createdAt
    };

    res.status(200).json({
      success: true,
      transferDetails
    });

  } catch (error) {
    console.error('Get transfer details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transfer details'
    });
  }
};
// Check transfer status
export const checkTransferStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      transferStatus: booking.transferStatus,
      transferDetails: booking.transferDetails
    });

  } catch (error) {
    console.error('Check transfer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check transfer status'
    });
  }
};

// Send payment request to user
export const sendPaymentRequest = async (req, res) => {
  try {
    const { userId, amount, description, dueDate, bookingId } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'User ID and amount are required'
      });
    }

    console.log('Payment request sent to user:', { userId, amount, description, dueDate, bookingId });

    res.status(200).json({
      success: true,
      message: 'Payment request sent successfully',
      data: {
        userId,
        amount,
        description,
        dueDate,
        bookingId
      }
    });

  } catch (error) {
    console.error('Send payment request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send payment request'
    });
  }
};

// Test Razorpay connection
export const testRazorpay = async (req, res) => {
  try {
    // Test by fetching account details
    const account = await razorpay.accounts.fetch();
    
    res.status(200).json({
      success: true,
      message: 'Razorpay connection successful',
      account: {
        id: account.id,
        name: account.customer_facing_business_name,
        status: account.status
      }
    });

  } catch (error) {
    console.error('Razorpay test error:', error);
    res.status(500).json({
      success: false,
      message: 'Razorpay connection failed',
      error: error.message
    });
  }
};

// Check Razorpay configuration
export const checkRazorpayConfig = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay credentials not configured'
      });
    }

    // Test the connection
    await razorpay.orders.create({
      amount: 100, // 1 rupee for testing
      currency: 'INR',
      receipt: 'test_receipt',
      payment_capture: 1
    });

    res.status(200).json({
      success: true,
      message: 'Razorpay configuration is correct',
      keyId: process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Missing'
    });

  } catch (error) {
    console.error('Razorpay config check error:', error);
    res.status(500).json({
      success: false,
      message: 'Razorpay configuration error',
      error: error.message
    });
  }
};


// 📩 Send message and save to DB
export const sendMessage = async (req, res) => {
  try {
    const { bookingId, userId, senderId, recipientId, propertyId, message } = req.body;
    const sender = senderId || userId || req.user?._id || null;
    if (!sender || !message)
      return res.status(400).json({ success: false, message: 'Missing required fields' });
 
    const newMessage = await Message.create({
      sender,
      recipient: recipientId || null,
      property: propertyId || bookingId || null,
      content: message,
      timestamp: new Date(),
    });
 
    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Server error while sending message' });
  }
};
 
 
// ✅ Fetch client messages (for showing messages in user side)
export const getClientMessages = async (req, res) => {
  try {
    const { clientId } = req.params;
 
    if (!clientId) {
      return res.status(400).json({ success: false, message: "Client ID is required" });
    }
 
    const messages = await Message.find({
      $or: [{ sender: clientId }, { recipient: clientId }],
    }).sort({ createdAt: -1 });
 
    if (!messages || messages.length === 0) {
      return res.status(404).json({ success: false, message: "No messages found for this client" });
    }
 
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching client messages:", error);
    res.status(500).json({ success: false, message: "Failed to fetch client messages" });
  }
};