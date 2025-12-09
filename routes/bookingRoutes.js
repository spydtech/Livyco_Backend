// routes/bookingRoutes.js
import express from "express";
import { verifyToken } from "../utils/jwtUtils.js";
import {
  createBooking, 
  cancelBooking, 
  getBookingsByProperty, 
  getUserBookings, 
  getBookingById, 
  approveBooking, 
  rejectBooking, 
  getallBookings, 
  checkRoomAvailability, 
  getAvailableRoomsAndBeds, 
  getAvailableBedsByRoomType, 
  getAllAvailableBeds, 
  getBookingWithPaymentDetails,
  updateBookingStatus
//   confirmBookingAfterPayment
} from "../controllers/bookingController.js";

const router = express.Router();

// Booking routes
router.post("/bookings", verifyToken, createBooking);
router.get("/bookings/property", verifyToken, getBookingsByProperty);
router.get("/bookings/user", verifyToken, getUserBookings);
router.get('/bookings/:bookingId', verifyToken, getBookingById);
router.patch("/bookings/:bookingId/approve", verifyToken, approveBooking);
router.patch("/bookings/:bookingId/reject", verifyToken, rejectBooking);
router.get("/bookings", verifyToken, getallBookings);
router.get("/user/bookings", verifyToken, getBookingWithPaymentDetails);
router.post("/bookings/check-availability", checkRoomAvailability);
router.post("/bookings/:bookingId/cancel", verifyToken, cancelBooking);
router.put("/bookings/:bookingId/status", verifyToken, updateBookingStatus);
// router.post("/bookings/:bookingId/confirm-payment", verifyToken, confirmBookingAfterPayment);
router.get('/bookings/availability/property/:propertyId/all-beds', verifyToken, getAllAvailableBeds);
router.get('/bookings/availability/property/:propertyId', verifyToken, getAvailableRoomsAndBeds);
router.get('/bookings/availability/property/:propertyId/beds', verifyToken, getAvailableBedsByRoomType);

export default router;