import mongoose from "mongoose";
import PaymentMessage from "../models/PaymentMessage.js";
import Booking from "../models/Booking.js";

// ✅ Create or update monthly payment message entry
export const createPaymentMessage = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();

    const { bookingId, month, year } = req.body;

    console.log('🔍 Creating/updating payment message:', {
      bookingId,
      month,
      year
    });

    if (!bookingId || !month || !year) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({
        success: false,
        message: "bookingId, month, and year are required.",
      });
    }

    // Check if payment message already exists for this booking, month, and year
    const existingPaymentMessage = await PaymentMessage.findOne({
      bookingId,
      month,
      year
    }).session(session);

    if (existingPaymentMessage) {
      console.log('🔄 Payment message already exists, updating...', {
        bookingId,
        month,
        year,
        existingId: existingPaymentMessage._id
      });

      // Fetch latest booking details to update payment and pricing data
      const booking = await Booking.findById(bookingId).session(session);
      if (!booking) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      // Update existing payment message with latest data
      existingPaymentMessage.paymentInfo = booking.paymentInfo || existingPaymentMessage.paymentInfo;
      existingPaymentMessage.pricing = booking.pricing || existingPaymentMessage.pricing;
      existingPaymentMessage.transferDetails = booking.transferDetails || existingPaymentMessage.transferDetails;
      existingPaymentMessage.note = `Payment record for ${month} ${year} (updated)`;

      await existingPaymentMessage.save({ session });

      await session.commitTransaction();
      await session.endSession();

      console.log('✅ Payment message updated successfully');

      return res.status(200).json({
        success: true,
        message: "Payment message updated successfully",
        data: existingPaymentMessage,
        existed: true
      });
    }

    // Fetch booking details to create new payment message
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const paymentMsg = new PaymentMessage({
      bookingId,
      month,
      year,
      paymentInfo: booking.paymentInfo || {},
      pricing: booking.pricing || {},
      transferDetails: booking.transferDetails || {},
      payments: booking.payments || [],
      note: `Payment record for ${month} ${year}`,
    });

    await paymentMsg.save({ session });

    await session.commitTransaction();
    await session.endSession();

    console.log('✅ Payment message created successfully');

    res.status(201).json({
      success: true,
      message: "Payment message created successfully",
      data: paymentMsg,
      existed: false
    });
  } catch (error) {
    // Safe transaction cleanup
    try {
      if (session.inTransaction()) {
        console.error('🔄 Aborting transaction due to error');
        await session.abortTransaction();
      }
      await session.endSession();
    } catch (sessionError) {
      console.error('❌ Session cleanup error:', sessionError);
    }
    
    console.error("❌ Error creating/updating payment message:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ Get all payment messages for a booking
export const getPaymentMessagesByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const messages = await PaymentMessage.find({ bookingId })
      .populate("bookingId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("❌ Error fetching payment messages:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// ✅ Update monthly payment status
export const updatePaymentStatus = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();

    const { id } = req.params;
    const { paymentStatus, paidAmount } = req.body;

    const updatedMsg = await PaymentMessage.findByIdAndUpdate(
      id,
      {
        "paymentInfo.paymentStatus": paymentStatus,
        "paymentInfo.paidAmount": paidAmount,
        "paymentInfo.paymentDate": new Date(),
      },
      { new: true, session }
    );

    if (!updatedMsg) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({ 
        success: false,
        message: "Payment message not found" 
      });
    }

    await session.commitTransaction();
    await session.endSession();

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: updatedMsg,
    });
  } catch (error) {
    // Safe transaction cleanup
    try {
      if (session.inTransaction()) {
        console.error('🔄 Aborting transaction due to error');
        await session.abortTransaction();
      }
      await session.endSession();
    } catch (sessionError) {
      console.error('❌ Session cleanup error:', sessionError);
    }
    
    console.error("❌ Error updating payment status:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ ADDED: Add payment to payment message WITH REVIEW (FIXED - ensures review is saved)
export const addPaymentToMessage = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();

    const { id } = req.params;
    const { 
      amount, 
      method = "razorpay", 
      transactionId, 
      status = "completed", 
      description,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      // Review data - same structure as validateRentPayment
      reviewData
    } = req.body;

    console.log('🔍 Adding payment to message with review data:', {
      messageId: id,
      amount: amount,
      transactionId: transactionId,
      hasReviewData: !!reviewData,
      reviewData: reviewData // Log the entire reviewData object
    });

    const paymentMessage = await PaymentMessage.findById(id).session(session);
    if (!paymentMessage) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({ 
        success: false, 
        message: "Payment message not found" 
      });
    }

    // Check if payment with same transactionId already exists
    const existingPayment = paymentMessage.payments.find(
      payment => payment.transactionId === transactionId
    );

    if (existingPayment) {
      console.log('🔄 Payment already exists, updating...', {
        transactionId,
        existingPaymentId: existingPayment._id
      });

      // Update existing payment
      existingPayment.amount = amount || existingPayment.amount;
      existingPayment.method = method || existingPayment.method;
      existingPayment.status = status || existingPayment.status;
      existingPayment.description = description || existingPayment.description;
      existingPayment.razorpayOrderId = razorpayOrderId || existingPayment.razorpayOrderId;
      existingPayment.razorpayPaymentId = razorpayPaymentId || existingPayment.razorpayPaymentId;
      existingPayment.razorpaySignature = razorpaySignature || existingPayment.razorpaySignature;
      existingPayment.paidDate = new Date();

      // FIXED: Update review if rating and comment are provided (don't rely on shouldSaveReview)
      if (reviewData && reviewData.rating && reviewData.comment) {
        console.log('💫 Updating review for existing payment:', {
          rating: reviewData.rating,
          hasComment: !!reviewData.comment
        });
        
        existingPayment.review = {
          rating: reviewData.rating,
          comment: reviewData.comment,
          reviewDate: new Date(),
          status: 'pending'
        };
      }

      // Update payment info if payment is completed
      if (status === "completed") {
        paymentMessage.paymentInfo.paymentStatus = "paid";
        paymentMessage.paymentInfo.paidAmount = amount;
        paymentMessage.paymentInfo.paymentDate = new Date();
        paymentMessage.paymentInfo.transactionId = transactionId;
        paymentMessage.paymentInfo.razorpayOrderId = razorpayOrderId;
        paymentMessage.paymentInfo.razorpayPaymentId = razorpayPaymentId;
        paymentMessage.paymentInfo.razorpaySignature = razorpaySignature;
      }

      await paymentMessage.save({ session });
      await session.commitTransaction();
      await session.endSession();

      console.log('✅ Payment updated successfully with review');

      return res.status(200).json({
        success: true,
        message: "Payment updated successfully",
        data: paymentMessage,
        reviewSaved: !!(reviewData && reviewData.rating && reviewData.comment),
        existed: true
      });
    }

    // Get current month and year if not provided
    const currentDate = new Date();
    const currentMonth = paymentMessage.month || currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = paymentMessage.year || currentDate.getFullYear();

    // Create new payment record with REVIEW DATA - FIXED: Check for rating and comment directly
    const newPayment = {
      date: new Date(),
      amount: amount,
      method: method,
      transactionId: transactionId,
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      razorpaySignature: razorpaySignature,
      status: status,
      type: "rent",
      description: description || `Rent payment for ${currentMonth} ${currentYear}`,
      month: currentMonth,
      year: currentYear,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paidDate: new Date(),
      // FIXED: Include review data if rating and comment are provided
      review: (reviewData && reviewData.rating && reviewData.comment) ? {
        rating: reviewData.rating,
        comment: reviewData.comment,
        reviewDate: new Date(),
        status: 'pending'
      } : null
    };

    console.log('💳 Creating payment record with review:', {
      amount: newPayment.amount,
      description: newPayment.description,
      hasReview: !!newPayment.review,
      reviewRating: newPayment.review?.rating,
      reviewComment: newPayment.review?.comment ? 'Yes' : 'No'
    });

    // Add payment to payment message
    if (!paymentMessage.payments) {
      console.log('📝 Initializing payments array in payment message');
      paymentMessage.payments = [];
    }
    
    // Validate the new payment object before pushing
    if (!newPayment.method) {
      newPayment.method = 'razorpay';
    }
    if (!newPayment.status) {
      newPayment.status = 'completed';
    }
    
    paymentMessage.payments.push(newPayment);
    console.log(`📊 Total payments in message after push: ${paymentMessage.payments.length}`);

    // Update payment info if payment is completed
    if (status === "completed") {
      paymentMessage.paymentInfo.paymentStatus = "paid";
      paymentMessage.paymentInfo.paidAmount = amount;
      paymentMessage.paymentInfo.paymentDate = new Date();
      paymentMessage.paymentInfo.transactionId = transactionId;
      paymentMessage.paymentInfo.razorpayOrderId = razorpayOrderId;
      paymentMessage.paymentInfo.razorpayPaymentId = razorpayPaymentId;
      paymentMessage.paymentInfo.razorpaySignature = razorpaySignature;
    }

    console.log('💾 Saving payment message with payment review...');
    
    await paymentMessage.save({ session });
    
    console.log('✅ Payment message saved successfully with payment review');

    await session.commitTransaction();
    await session.endSession();

    console.log('✅ Payment added to message successfully with review');

    // Prepare response - same structure as validateRentPayment
    const response = {
      success: true,
      message: 'Payment added successfully',
      paymentId: transactionId,
      orderId: razorpayOrderId,
      paymentMessage: {
        id: paymentMessage._id,
        paymentStatus: paymentMessage.paymentInfo.paymentStatus,
        paidAmount: paymentMessage.paymentInfo.paidAmount
      },
      payment: newPayment,
      reviewSaved: !!(reviewData && reviewData.rating && reviewData.comment),
      existed: false
    };

    return res.status(200).json(response);

  } catch (error) {
    // Safe transaction cleanup
    try {
      if (session.inTransaction()) {
        console.error('🔄 Aborting transaction due to error');
        await session.abortTransaction();
      }
      await session.endSession();
    } catch (sessionError) {
      console.error('❌ Session cleanup error:', sessionError);
    }
    
    console.error("❌ Error adding/updating payment:", error);
    console.error("❌ Error stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "Failed to add payment to message",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ ADDED: Get or create payment message for booking, month, year
export const getOrCreatePaymentMessage = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();

    const { bookingId, month, year } = req.params;

    console.log('🔍 Getting or creating payment message:', {
      bookingId,
      month,
      year
    });

    if (!bookingId || !month || !year) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({
        success: false,
        message: "bookingId, month, and year are required.",
      });
    }

    // Check if payment message already exists
    let paymentMessage = await PaymentMessage.findOne({
      bookingId,
      month,
      year
    }).populate("bookingId").session(session);

    if (paymentMessage) {
      console.log('✅ Found existing payment message:', paymentMessage._id);
      
      await session.commitTransaction();
      await session.endSession();

      return res.status(200).json({
        success: true,
        message: "Payment message found",
        data: paymentMessage,
        existed: true
      });
    }

    // Create new payment message
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    paymentMessage = new PaymentMessage({
      bookingId,
      month,
      year,
      paymentInfo: booking.paymentInfo || {},
      pricing: booking.pricing || {},
      transferDetails: booking.transferDetails || {},
      payments: booking.payments || [],
      note: `Payment record for ${month} ${year}`,
    });

    await paymentMessage.save({ session });

    await session.commitTransaction();
    await session.endSession();

    console.log('✅ Payment message created successfully');

    res.status(201).json({
      success: true,
      message: "Payment message created successfully",
      data: paymentMessage,
      existed: false
    });
  } catch (error) {
    // Safe transaction cleanup
    try {
      if (session.inTransaction()) {
        console.error('🔄 Aborting transaction due to error');
        await session.abortTransaction();
      }
      await session.endSession();
    } catch (sessionError) {
      console.error('❌ Session cleanup error:', sessionError);
    }
    
    console.error("❌ Error in getOrCreatePaymentMessage:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ ADDED: Get payments for a specific payment message
export const getPaymentsByMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const paymentMessage = await PaymentMessage.findById(id);
    if (!paymentMessage) {
      return res.status(404).json({ 
        success: false, 
        message: "Payment message not found" 
      });
    }

    res.status(200).json({
      success: true,
      count: paymentMessage.payments.length,
      data: paymentMessage.payments.sort((a, b) => new Date(b.date) - new Date(a.date)),
    });
  } catch (error) {
    console.error("❌ Error fetching payments:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// ✅ ADDED: Update payment status in payments array
export const updatePaymentInMessage = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();

    const { id, paymentId } = req.params;
    const { status, transactionId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const paymentMessage = await PaymentMessage.findById(id).session(session);
    if (!paymentMessage) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({ 
        success: false, 
        message: "Payment message not found" 
      });
    }

    const payment = paymentMessage.payments.id(paymentId);
    if (!payment) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({ 
        success: false, 
        message: "Payment not found" 
      });
    }

    payment.status = status || payment.status;
    payment.transactionId = transactionId || payment.transactionId;
    payment.razorpayOrderId = razorpayOrderId || payment.razorpayOrderId;
    payment.razorpayPaymentId = razorpayPaymentId || payment.razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature || payment.razorpaySignature;

    // Update main payment info if this payment is completed
    if (status === "completed") {
      paymentMessage.paymentInfo.paymentStatus = "paid";
      paymentMessage.paymentInfo.paidAmount = payment.amount;
      paymentMessage.paymentInfo.paymentDate = new Date();
      paymentMessage.paymentInfo.transactionId = payment.transactionId;
      paymentMessage.paymentInfo.razorpayOrderId = payment.razorpayOrderId;
      paymentMessage.paymentInfo.razorpayPaymentId = payment.razorpayPaymentId;
      paymentMessage.paymentInfo.razorpaySignature = payment.razorpaySignature;
    }

    await paymentMessage.save({ session });
    await session.commitTransaction();
    await session.endSession();

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: paymentMessage,
    });
  } catch (error) {
    // Safe transaction cleanup
    try {
      if (session.inTransaction()) {
        console.error('🔄 Aborting transaction due to error');
        await session.abortTransaction();
      }
      await session.endSession();
    } catch (sessionError) {
      console.error('❌ Session cleanup error:', sessionError);
    }
    
    console.error("❌ Error updating payment:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ ADDED: Add or update review for a specific payment
export const addReviewToPayment = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();

    const { id, paymentId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required"
      });
    }

    const paymentMessage = await PaymentMessage.findById(id).session(session);
    if (!paymentMessage) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({ 
        success: false, 
        message: "Payment message not found" 
      });
    }

    const payment = paymentMessage.payments.id(paymentId);
    if (!payment) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({ 
        success: false, 
        message: "Payment not found" 
      });
    }

    console.log('💫 Adding review to payment:', {
      paymentId: paymentId,
      rating: rating,
      hasComment: !!comment
    });

    // Update or add review - same structure as validateRentPayment
    payment.review = {
      rating: rating,
      comment: comment,
      reviewDate: new Date(),
      status: 'pending'
    };

    await paymentMessage.save({ session });
    await session.commitTransaction();
    await session.endSession();

    console.log('✅ Review added to payment successfully');

    res.status(200).json({
      success: true,
      message: "Review added successfully",
      data: {
        payment: payment,
        review: payment.review
      },
    });
  } catch (error) {
    // Safe transaction cleanup
    try {
      if (session.inTransaction()) {
        console.error('🔄 Aborting transaction due to error');
        await session.abortTransaction();
      }
      await session.endSession();
    } catch (sessionError) {
      console.error('❌ Session cleanup error:', sessionError);
    }
    
    console.error("❌ Error adding review:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to add review",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ ADDED: Get payments with reviews
export const getPaymentsWithReviews = async (req, res) => {
  try {
    const { id } = req.params;
    
    const paymentMessage = await PaymentMessage.findById(id);
    if (!paymentMessage) {
      return res.status(404).json({ 
        success: false, 
        message: "Payment message not found" 
      });
    }

    const paymentsWithReviews = paymentMessage.payments.filter(payment => 
      payment.review && payment.review.rating
    );

    console.log('📊 Found payments with reviews:', {
      totalPayments: paymentMessage.payments.length,
      withReviews: paymentsWithReviews.length
    });

    res.status(200).json({
      success: true,
      count: paymentsWithReviews.length,
      data: paymentsWithReviews.sort((a, b) => new Date(b.date) - new Date(a.date)),
    });
  } catch (error) {
    console.error("❌ Error fetching payments with reviews:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// ✅ ADDED: Delete payment message
export const deletePaymentMessage = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();

    const { id } = req.params;
    
    const paymentMessage = await PaymentMessage.findByIdAndDelete(id).session(session);
    if (!paymentMessage) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({ 
        success: false, 
        message: "Payment message not found" 
      });
    }

    await session.commitTransaction();
    await session.endSession();

    res.status(200).json({
      success: true,
      message: "Payment message deleted successfully",
      data: paymentMessage,
    });
  } catch (error) {
    // Safe transaction cleanup
    try {
      if (session.inTransaction()) {
        console.error('🔄 Aborting transaction due to error');
        await session.abortTransaction();
      }
      await session.endSession();
    } catch (sessionError) {
      console.error('❌ Session cleanup error:', sessionError);
    }
    
    console.error("❌ Error deleting payment message:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};