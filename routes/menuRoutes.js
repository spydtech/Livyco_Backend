// routes/menuRoutes.js
import express from "express";
import  { verifyToken }  from "../utils/jwtUtils.js";

import {
  getFoodItems,
  getWeeklyMenu,
  addFoodItem,
  deleteFoodItem,
  clearDayMenu,
  getFoodItemsByBooking,
  getFoodItemsByBookingAndDay
} from "../controllers/menuController.js";

const router = express.Router();

// GET routes - for fetching menu data
router.get("/", verifyToken, getFoodItems); // Get food items with query params: ?day=Monday&propertyId=123&bookingId=456
router.get("/weekly", verifyToken, getWeeklyMenu); // Get weekly menu: ?propertyId=123&bookingId=456
router.get("/booking/:bookingId", verifyToken, getFoodItemsByBooking); // Get all food items for specific booking
router.get("/booking/:bookingId/day/:day", verifyToken, getFoodItemsByBookingAndDay); // Get food items for booking and specific day

// POST routes - for creating menu items
router.post("/", verifyToken, addFoodItem); // Add new food item (now requires bookingId)

// DELETE routes - for removing menu items
router.delete("/:id", verifyToken, deleteFoodItem); // Delete specific food item by ID
router.delete("/clear/day", verifyToken, clearDayMenu); // Clear menu for specific day: ?day=Monday&propertyId=123&bookingId=456

export default router;