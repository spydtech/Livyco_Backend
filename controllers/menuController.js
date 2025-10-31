// controllers/menuController.js
import FoodItem from "../models/Menu.js"; // ✅ Fixed import

// Get all food items with property and booking filtering
export const getFoodItems = async (req, res) => {
  try {
    const { day, category, propertyId, bookingId } = req.query;
    const filter = {};

    if (day) filter.day = day;
    if (category) filter.category = category;
    if (propertyId) filter.propertyId = propertyId;
    if (bookingId) filter.bookingId = bookingId;

    const foodItems = await FoodItem.find(filter)
      .populate("bookingId", "checkIn checkOut guestName")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: foodItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get weekly menu structure
export const getWeeklyMenu = async (req, res) => {
  try {
    const { propertyId, bookingId } = req.query;
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const categories = ["Breakfast", "Lunch", "Snacks", "Dinner"];
    const filter = {};
    if (propertyId) filter.propertyId = propertyId;
    if (bookingId) filter.bookingId = bookingId;

    const weeklyMenu = {};
    for (const day of days) {
      weeklyMenu[day] = {};
      for (const category of categories) {
        const items = await FoodItem.find({ ...filter, day, category })
          .populate("bookingId", "checkIn checkOut guestName")
          .sort({ createdAt: -1 });
        weeklyMenu[day][category] = items;
      }
    }

    res.json({ success: true, data: weeklyMenu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get food items by booking
export const getFoodItemsByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const foodItems = await FoodItem.find({ bookingId })
      .populate("bookingId", "checkIn checkOut guestName")
      .populate("propertyId", "name address")
      .sort({ day: 1, category: 1 });

    res.status(200).json({ success: true, data: foodItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get food items by booking and day
export const getFoodItemsByBookingAndDay = async (req, res) => {
  try {
    const { bookingId, day } = req.params;
    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    if (!validDays.includes(day)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid day of the week" });
    }

    const foodItems = await FoodItem.find({ bookingId, day })
      .populate("bookingId", "checkIn checkOut guestName")
      .populate("propertyId", "name address")
      .sort({ category: 1 });

    res.status(200).json({ success: true, data: foodItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add a new food item
export const addFoodItem = async (req, res) => {
  try {
    const { name, description, category, day, propertyId, bookingId } =
      req.body;

    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const validCategories = ["Breakfast", "Lunch", "Snacks", "Dinner"];

    if (!validDays.includes(day))
      return res
        .status(400)
        .json({ success: false, message: "Invalid day provided" });
    if (!validCategories.includes(category))
      return res
        .status(400)
        .json({ success: false, message: "Invalid category provided" });

    const foodItem = new FoodItem({
      name,
      description: description || "",
      category,
      day,
      propertyId,
      bookingId,
    });

    const savedItem = await foodItem.save();
    await savedItem.populate("bookingId", "checkIn checkOut guestName");

    res.status(201).json({ success: true, data: savedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a food item
export const deleteFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await FoodItem.findByIdAndDelete(id);
    if (!deletedItem)
      return res
        .status(404)
        .json({ success: false, message: "Food item not found" });

    res.json({ success: true, message: "Food item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear menu items for a specific day
export const clearDayMenu = async (req, res) => {
  try {
    const { day, propertyId, bookingId } = req.query;
    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    if (!validDays.includes(day))
      return res
        .status(400)
        .json({ success: false, message: "Invalid day of the week" });

    const filter = { day };
    if (propertyId) filter.propertyId = propertyId;
    if (bookingId) filter.bookingId = bookingId;

    const result = await FoodItem.deleteMany(filter);
    res.json({
      success: true,
      message: `Menu items for ${day} cleared successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
