import express from 'express';
import {
  addBankAccount,
  getMyBankAccounts,
  getPropertyBankAccount,
  getAllBankAccounts,
  verifyBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getBankAccountStats
} from '../controllers/bankAccountController.js';
import { verifyToken } from '../utils/jwtUtils.js';
import { protectAdmin, authorizeAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Client routes (hostel owners)
router.post('/add', verifyToken, addBankAccount);
router.get('/my-accounts', verifyToken, getMyBankAccounts);
router.get('/property/:propertyId', verifyToken, getPropertyBankAccount);
router.put('/:accountId', verifyToken, updateBankAccount);
router.delete('/:accountId', verifyToken, deleteBankAccount);

// Admin routes
router.get('/admin/get/all', protectAdmin, authorizeAdmin(['admin']), getAllBankAccounts);
router.get('/admin/stats', protectAdmin, authorizeAdmin(['admin']), getBankAccountStats);
router.patch('/admin/verify/:accountId', protectAdmin, authorizeAdmin(['admin']), verifyBankAccount);

export default router;