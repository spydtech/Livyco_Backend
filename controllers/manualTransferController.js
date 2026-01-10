import ManualTransfer from '../models/ManualTransfer.js';
import BankAccount from '../models/BankAccount.js';
import Booking from '../models/Booking.js'; // Import Booking model
import mongoose from 'mongoose';

export const createManualTransfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    console.log("📥 Received manual transfer request:", req.body);
    
    const {
      bookingId,
      bankAccountId,
      originalAmount,
      transactionReference,
      notes,
      utrNumber,
      paymentMode,
      screenshotUrl,
      clientId,
      clientName
    } = req.body;

    // Validate required fields
    if (!bookingId || !bankAccountId || !originalAmount || !transactionReference) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: bookingId, bankAccountId, originalAmount, transactionReference'
      });
    }

    // Validate amounts
    if (originalAmount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Original amount must be greater than 0'
      });
    }

    // Check if booking exists
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check for duplicate transaction reference
    const existingTransfer = await ManualTransfer.findOne({ transactionReference }).session(session);
    if (existingTransfer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Transaction reference already exists'
      });
    }

    // Get bank account details
    const bankAccount = await BankAccount.findById(bankAccountId).session(session);
    if (!bankAccount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    // Generate UTR if not provided
    const generatedUtr = utrNumber || `UTR${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Check for duplicate UTR
    const existingUtr = await ManualTransfer.findOne({ utrNumber: generatedUtr }).session(session);
    if (existingUtr) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'UTR number already exists'
      });
    }

    // Calculate transfer amounts
    const platformCommission = originalAmount * 0.05;
    const gstOnCommission = platformCommission * 0.18;
    const transferAmount = originalAmount - (platformCommission + gstOnCommission);

    // Create transfer document
    const manualTransfer = new ManualTransfer({
      bookingId,
      clientId: clientId || bankAccount.clientId,
      clientName: clientName || bankAccount.accountHolderName,
      originalAmount,
      platformCommission,
      gstOnCommission,
      transferAmount,
      bankAccountId,
      bankDetails: {
        accountHolderName: bankAccount.accountHolderName,
        bankName: bankAccount.bankName,
        accountNumber: bankAccount.accountNumber,
        ifscCode: bankAccount.ifscCode || bankAccount.ifsc
      },
      transactionReference,
      utrNumber: generatedUtr,
      paymentMode: paymentMode || 'Bank Transfer',
      screenshotUrl: screenshotUrl || '',
      notes: notes || '',
      status: 'completed', // Mark as completed since it's a manual transfer
      createdBy: req.admin._id
    });

    // Save manual transfer
    await manualTransfer.save({ session });

    // Update booking transfer status and add payment
    booking.transferStatus = 'completed';
    booking.transferDetails = {
      ...booking.transferDetails,
      totalAmount: originalAmount,
      platformCommission,
      gstOnCommission,
      totalPlatformEarnings: platformCommission + gstOnCommission,
      clientAmount: transferAmount,
      clientTransferStatus: 'completed',
      bankAccount: {
        accountNumber: bankAccount.accountNumber,
        bankName: bankAccount.bankName,
        ifscCode: bankAccount.ifscCode || bankAccount.ifsc,
        accountHolderName: bankAccount.accountHolderName
      },
      payoutId: transactionReference,
      clientTransferProcessedAt: new Date(),
      completedAt: new Date(),
      transferNotes: notes || 'Manual transfer completed',
      processedBy: req.admin._id,
      processedAt: new Date(),
      breakdown: {
        totalPayment: originalAmount,
        platformCommissionRate: '5%',
        gstRate: '18%',
        platformCommission: platformCommission,
        gstOnCommission: gstOnCommission,
        clientAmount: transferAmount
      }
    };

    // Also add payment record to booking
    const paymentRecord = {
      date: new Date(),
      amount: originalAmount,
      method: 'bank_transfer',
      transactionId: transactionReference,
      UTRNumber: generatedUtr,
      status: 'completed',
      description: 'Manual transfer to client',
      type: 'rent',
      paidDate: new Date()
    };

    booking.payments.push(paymentRecord);

    // Recalculate outstanding amount
    const totalPaid = booking.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const totalDue = (booking.pricing.totalAmount || 0) + 
                    (booking.pricing.securityDeposit || 0) + 
                    (booking.pricing.maintenanceFee || 0);
    
    booking.outstandingAmount = Math.max(0, totalDue - totalPaid);

    if (totalPaid >= totalDue) {
      booking.paymentInfo.paymentStatus = 'paid';
      booking.paymentInfo.paidAmount = totalPaid;
    } else if (totalPaid > 0) {
      booking.paymentInfo.paymentStatus = 'partial';
      booking.paymentInfo.paidAmount = totalPaid;
    }

    // Save booking updates
    await booking.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    console.log("✅ Manual transfer created and booking updated:", {
      transferId: manualTransfer._id,
      bookingId: booking._id,
      bookingTransferStatus: booking.transferStatus,
      originalAmount,
      transferAmount
    });

    res.status(201).json({
      success: true,
      message: 'Manual transfer created successfully and booking transfer status updated',
      data: {
        manualTransfer,
        bookingUpdate: {
          id: booking._id,
          transferStatus: booking.transferStatus,
          outstandingAmount: booking.outstandingAmount,
          paymentStatus: booking.paymentInfo.paymentStatus
        }
      }
    });

  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.error('❌ Create manual transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating manual transfer',
      error: error.message
    });
  }
};


// READ - Get all manual transfers
export const getAllManualTransfers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { transactionReference: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { 'bankDetails.accountHolderName': { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query
    const transfers = await ManualTransfer.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ManualTransfer.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transfers.length,
      total,
      currentPage: parseInt(page),
      data: transfers
    });

  } catch (error) {
    console.error('Get manual transfers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching manual transfers',
      error: error.message
    });
  }
};

// READ - Get single manual transfer
export const getManualTransferById = async (req, res) => {
  try {
    const transfer = await ManualTransfer.findById(req.params._id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Manual transfer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transfer
    });

  } catch (error) {
    console.error('Get manual transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching manual transfer',
      error: error.message
    });
  }
};

// UPDATE - Update manual transfer
export const updateManualTransfer = async (req, res) => {
  try {
    const { status, notes, utrNumber } = req.body;

    const transfer = await ManualTransfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Manual transfer not found'
      });
    }

    // Update fields
    if (status) transfer.status = status;
    if (notes !== undefined) transfer.notes = notes;
    if (utrNumber !== undefined) transfer.utrNumber = utrNumber;

    await transfer.save();

    res.status(200).json({
      success: true,
      message: 'Manual transfer updated',
      data: transfer
    });

  } catch (error) {
    console.error('Update manual transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating manual transfer',
      error: error.message
    });
  }
};

// DELETE - Delete manual transfer
export const deleteManualTransfer = async (req, res) => {
  try {
    const transfer = await ManualTransfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Manual transfer not found'
      });
    }

    // Only allow deletion of pending transfers
    if (transfer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending transfers can be deleted'
      });
    }

    await transfer.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Manual transfer deleted'
    });

  } catch (error) {
    console.error('Delete manual transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting manual transfer',
      error: error.message
    });
  }
};

// MARK AS COMPLETED
export const completeManualTransfer = async (req, res) => {
  try {
    const transfer = await ManualTransfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Manual transfer not found'
      });
    }

    transfer.status = 'completed';
    await transfer.save();

    res.status(200).json({
      success: true,
      message: 'Manual transfer marked as completed',
      data: transfer
    });

  } catch (error) {
    console.error('Complete manual transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing manual transfer',
      error: error.message
    });
  }
};

// CANCEL TRANSFER
export const cancelManualTransfer = async (req, res) => {
  try {
    const transfer = await ManualTransfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Manual transfer not found'
      });
    }

    transfer.status = 'cancelled';
    await transfer.save();

    res.status(200).json({
      success: true,
      message: 'Manual transfer cancelled',
      data: transfer
    });

  } catch (error) {
    console.error('Cancel manual transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling manual transfer',
      error: error.message
    });
  }
  
}; 

// READ - Get all manual transfers by client ID
export const getManualTransfersByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    // Validate clientId
    if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid client ID is required'
      });
    }

    // Build query
    const query = { clientId };
    
    if (status) query.status = status;
    
    // Date range filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end of day for endDate
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Execute query
    const transfers = await ManualTransfer.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-__v'); // Exclude version key

    const total = await ManualTransfer.countDocuments(query);

    // Calculate summary statistics
    const summary = {
      totalTransfers: total,
      totalOriginalAmount: 0,
      totalTransferAmount: 0,
      totalCommission: 0,
      totalGST: 0
    };

    transfers.forEach(transfer => {
      summary.totalOriginalAmount += transfer.originalAmount;
      summary.totalTransferAmount += transfer.transferAmount;
      summary.totalCommission += transfer.platformCommission;
      summary.totalGST += transfer.gstOnCommission;
    });

    res.status(200).json({
      success: true,
      message: 'Manual transfers retrieved successfully',
      data: {
        transfers,
        summary,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get manual transfers by client ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching manual transfers by client ID',
      error: error.message
    });
  }
};

// READ - Get manual transfers by booking ID
export const getManualTransfersByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Validate bookingId
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid booking ID is required'
      });
    }

    const transfers = await ManualTransfer.find({ bookingId })
      .sort({ createdAt: -1 })
      .select('-__v');

    if (transfers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No manual transfers found for this booking',
        data: []
      });
    }

    res.status(200).json({
      success: true,
      message: 'Manual transfers retrieved successfully',
      data: transfers
    });

  } catch (error) {
    console.error('❌ Get manual transfers by booking ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching manual transfers by booking ID',
      error: error.message
    });
  }
};

