// import express from "express";
// import { verifyToken } from "../utils/jwtUtils.js";
// import { 
//   createOrder, 
//   testRazorpay,
//   validatePayment, 
//   getPaymentDetails, 
//   refundPayment,
//   sendPaymentRequest,
//   getPaymentHistory,
//   getClientPaymentsForBooking,
//   checkRazorpayConfig 
// } from "../controllers/paymentController.js";

// const router = express.Router();

// // Payment routes
// router.get('/payments/test', testRazorpay);
// router.get('/payments/config-check',verifyToken,  checkRazorpayConfig);
// router.post("/payments/create-order", verifyToken, createOrder);
// router.post("/payments/validate-payment", verifyToken, validatePayment);
// router.get("/payments/:paymentId", verifyToken, getPaymentDetails);
// router.post("/payments/refund", verifyToken, refundPayment);
// router.post("/request", verifyToken, sendPaymentRequest);
// router.get("/history/:bookingId", verifyToken, getPaymentHistory);
// //client payments for a booking
// router.get("/client-payments/:bookingId", verifyToken, getClientPaymentsForBooking);


// // Transfer routes
// router.post("/transfer/initiate/:bookingId", verifyToken, initiateManualTransfer);
// router.get("/transfer/status/:bookingId", verifyToken, checkTransferStatus);

// export default router;






import express from "express";
import { verifyToken } from "../utils/jwtUtils.js";
import { 
  createOrder, 
  // testRazorpay,
  validatePayment, 
  getPaymentDetails, 
  refundPayment,
  sendPaymentRequest,
  getPaymentHistory,
  getUserPayments,
  getClientPaymentsForBooking,
  getPaymentsByClientId,
  // checkRazorpayConfig,
  // initiateManualTransfer,  // Add this import
  checkTransferStatus      // Add this import
} from "../controllers/paymentController.js";

const router = express.Router();

// Payment routes
// router.get('/payments/test', testRazorpay);
// router.get('/payments/config-check', verifyToken, checkRazorpayConfig);
router.post("/payments/create-order", verifyToken, createOrder);
router.post("/payments/validate-payment", verifyToken, validatePayment);
router.get("/payments/:paymentId", verifyToken, getPaymentDetails);
router.post("/payments/refund", verifyToken, refundPayment);
router.post("/payments/request", verifyToken, sendPaymentRequest);
router.get("/payments/user", verifyToken, getUserPayments);
router.get("/payments/by-client/:clientId", verifyToken, getPaymentsByClientId);
router.get("/payments/history/:bookingId", verifyToken, getPaymentHistory);
// Client payments for a booking
router.get("/payments/client-payments/:propertyId/:bookingId", verifyToken, getClientPaymentsForBooking);

// Transfer routes
// router.post("/transfer/initiate/:bookingId", verifyToken, initiateManualTransfer);
router.get("/transfer/status/:bookingId", verifyToken, checkTransferStatus);

export default router;