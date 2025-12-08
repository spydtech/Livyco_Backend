// models/Menu.js
import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      required: true,
      enum: ["Breakfast", "Lunch", "Snacks", "Dinner"],
    },
    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: false, 
    },
    menuType: {
      type: String,
      enum: ["property", "booking"],
      default: "property" // ✅ ADDED
    }
  },
  { timestamps: true }
);

const FoodItem = mongoose.model("FoodItem", foodItemSchema);
export default FoodItem;