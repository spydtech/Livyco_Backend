import express from 'express';
import {
  createManualTransfer,
  getAllManualTransfers,
  getManualTransferById,
  updateManualTransfer,
  deleteManualTransfer,
  completeManualTransfer,
  cancelManualTransfer,
  getManualTransfersByClientId,     // Add this
  getManualTransfersByBookingId    // Add this
} from '../controllers/manualTransferController.js';

import { protectAdmin, authorizeAdmin } from '../middlewares/authMiddleware.js';
import { verifyToken } from "../utils/jwtUtils.js";

const router = express.Router();

// Apply middleware


// Basic CRUD routes
router.post('/',protectAdmin, createManualTransfer);
router.get('/', getAllManualTransfers);
router.get('/:id', getManualTransferById);
router.put('/:id', updateManualTransfer);
router.delete('/:id', deleteManualTransfer);

// Status update routes
router.put('/:id/complete', completeManualTransfer);
router.put('/:id/cancel', cancelManualTransfer);

// NEW: Get transfers by client ID
router.get('/client/:clientId', verifyToken,  getManualTransfersByClientId);

// NEW: Get transfers by booking ID
router.get('/booking/:bookingId', getManualTransfersByBookingId);

export default router;