// import express from "express";
// import {
//   createOfflineBooking,
//   getAllOfflineBookings,
//   getOfflineBookingById,
//   updateOfflineBooking,
//   deleteOfflineBooking,
//   updateOfflineBookingStatus
// } from "../controllers/offlineBookingController.js";
// import { verifyToken } from "../utils/jwtUtils.js";
 
// const router = express.Router();
 
// // CRUD routes
// router.post("/", createOfflineBooking);
// router.get("/", getAllOfflineBookings);
// router.get("/:id", getOfflineBookingById);
// router.put("/:id", updateOfflineBooking);
// router.delete("/:id", deleteOfflineBooking);
// router.patch("/:id/status", verifyToken, updateOfflineBookingStatus);
 
// export default router;





import express from "express";
import {
  createOfflineBooking,
  getAllOfflineBookings,
  getOfflineBookingById,
  updateOfflineBooking,
  deleteOfflineBooking,
  updateOfflineBookingStatus
} from "../controllers/offlineBookingController.js";
import { verifyToken } from "../utils/jwtUtils.js";

const router = express.Router();

// Apply token verification to all routes
router.use(verifyToken);

// CRUD routes
router.post("/", createOfflineBooking);
router.get("/", getAllOfflineBookings);
router.get("/:id", getOfflineBookingById);
router.put("/:id", updateOfflineBooking);
router.delete("/:id", deleteOfflineBooking);
router.patch("/:id/status", updateOfflineBookingStatus);

export default router;
 