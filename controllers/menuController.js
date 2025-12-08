import FoodItem from "../models/Menu.js";
import { NotificationService } from '../controllers/notificationController.js';
import User from "../models/User.js";

// Get all food items with property and booking filtering
export const getFoodItems = async (req, res) => {
  try {
    const { day, category, propertyId, bookingId, menuType } = req.query;
    const filter = {};

    if (day) filter.day = day;
    if (category) filter.category = category;
    if (propertyId) filter.propertyId = propertyId;
    if (bookingId) filter.bookingId = bookingId;
    if (menuType) filter.menuType = menuType;

    // ✅ For property menus, also include items without bookingId
    if (menuType === 'property') {
      filter.$or = [
        { menuType: 'property' },
        { bookingId: { $exists: false } }
      ];
      delete filter.menuType;
    }

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
    const { propertyId, bookingId, menuType } = req.query;
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
    if (menuType) filter.menuType = menuType;

    // ✅ For property menus, include items without bookingId
    if (menuType === 'property' || (!bookingId && !menuType)) {
      filter.$or = [
        { menuType: 'property' },
        { bookingId: { $exists: false } },
        { bookingId: null }
      ];
      delete filter.menuType;
    }

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

// ✅ UPDATED: Add a new food item (handles both property and booking menus) WITH NOTIFICATION
export const addFoodItem = async (req, res) => {
  try {
    const { name, description, category, day, propertyId, bookingId, price } = req.body;
    const userId = req.user.id; // User who is adding the item

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
      return res.status(400).json({ success: false, message: "Invalid day provided" });
    if (!validCategories.includes(category))
      return res.status(400).json({ success: false, message: "Invalid category provided" });

    // ✅ Determine menu type based on whether bookingId is provided
    const menuType = bookingId ? "booking" : "property";

    const foodItemData = {
      name,
      description: description || "",
      category,
      day,
      propertyId,
      menuType,
      price: price || 0
    };

    // ✅ Only include bookingId if provided
    if (bookingId) {
      foodItemData.bookingId = bookingId;
    }

    const foodItem = new FoodItem(foodItemData);
    const savedItem = await foodItem.save();
    
    // ✅ Only populate bookingId if it exists
    if (bookingId) {
      await savedItem.populate("bookingId", "checkIn checkOut guestName");
    }

    // ✅ CREATE NOTIFICATION FOR FOOD ITEM ADDED
    try {
      const foodItemDataForNotification = {
        ...savedItem.toObject(),
        propertyId,
        bookingId
      };
      
      await NotificationService.createFoodMenuNotification(
        foodItemDataForNotification,
        'item_added',
        userId,
        { menuType }
      );
      
      console.log(`🍽️ Food item added notification created for ${name}`);
    } catch (notificationError) {
      console.error('⚠️ Failed to create notification, but food item was saved:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({ 
      success: true, 
      data: savedItem,
      message: `Food item added to ${menuType} menu successfully` 
    });
  } catch (error) {
    console.error("Error adding food item:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ UPDATED: Update a food item WITH NOTIFICATION
export const updateFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id; // User who is updating the item

    // Get the old item data before updating
    const oldItem = await FoodItem.findById(id);
    if (!oldItem) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }

    // Update the food item
    const updatedItem = await FoodItem.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate("bookingId", "checkIn checkOut guestName");

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }

    // ✅ CREATE NOTIFICATION FOR FOOD ITEM UPDATED
    try {
      const oldData = {
        name: oldItem.name,
        description: oldItem.description,
        price: oldItem.price,
        category: oldItem.category,
        day: oldItem.day
      };

      const newData = {
        name: updatedItem.name,
        description: updatedItem.description,
        price: updatedItem.price,
        category: updatedItem.category,
        day: updatedItem.day
      };

      const foodItemDataForNotification = {
        ...updatedItem.toObject(),
        oldData,
        newData
      };

      // Check if price changed
      const action = oldItem.price !== updatedItem.price ? 'price_changed' : 'item_updated';
      
      await NotificationService.createFoodMenuNotification(
        foodItemDataForNotification,
        action,
        userId,
        { changes: updates }
      );
      
      console.log(`🍽️ Food item ${action} notification created for ${updatedItem.name}`);
    } catch (notificationError) {
      console.error('⚠️ Failed to create notification, but food item was updated:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(200).json({ 
      success: true, 
      data: updatedItem,
      message: "Food item updated successfully" 
    });
  } catch (error) {
    console.error("Error updating food item:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ UPDATED: Delete a food item WITH NOTIFICATION
export const deleteFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // User who is deleting the item

    // Get the item data before deleting
    const foodItemToDelete = await FoodItem.findById(id)
      .populate("bookingId", "checkIn checkOut guestName");
    
    if (!foodItemToDelete) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }

    // ✅ CREATE NOTIFICATION BEFORE DELETING
    try {
      const foodItemDataForNotification = {
        ...foodItemToDelete.toObject(),
        propertyId: foodItemToDelete.propertyId,
        bookingId: foodItemToDelete.bookingId?._id
      };
      
      await NotificationService.createFoodMenuNotification(
        foodItemDataForNotification,
        'item_deleted',
        userId,
        { 
          menuType: foodItemToDelete.menuType,
          deletedAt: new Date().toISOString()
        }
      );
      
      console.log(`🍽️ Food item deleted notification created for ${foodItemToDelete.name}`);
    } catch (notificationError) {
      console.error('⚠️ Failed to create notification:', notificationError);
      // Continue with deletion even if notification fails
    }

    // Now delete the item
    await FoodItem.findByIdAndDelete(id);

    res.status(200).json({ 
      success: true, 
      message: "Food item deleted successfully",
      deletedItem: {
        name: foodItemToDelete.name,
        day: foodItemToDelete.day,
        category: foodItemToDelete.category
      }
    });
  } catch (error) {
    console.error("Error deleting food item:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ UPDATED: Clear menu items for a specific day WITH NOTIFICATION
export const clearDayMenu = async (req, res) => {
  try {
    const { day, propertyId, bookingId, menuType } = req.query;
    const userId = req.user.id; // User who is clearing the menu

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
      return res.status(400).json({ success: false, message: "Invalid day of the week" });
    }

    const filter = { day };
    if (propertyId) filter.propertyId = propertyId;
    if (bookingId) filter.bookingId = bookingId;
    if (menuType) filter.menuType = menuType;

    // Get all items that will be deleted
    const itemsToDelete = await FoodItem.find(filter);
    
    if (itemsToDelete.length === 0) {
      return res.json({
        success: true,
        message: `No menu items found for ${day} to clear`,
        deletedCount: 0,
      });
    }

    // ✅ CREATE BULK NOTIFICATION FOR MENU CLEARED
    try {
      const changesSummary = `Cleared ${itemsToDelete.length} items from ${day} menu`;
      
      await NotificationService.createBulkFoodMenuNotification(
        propertyId,
        'menu_cleared',
        userId,
        changesSummary,
        {
          day,
          menuType: menuType || 'property',
          itemsCount: itemsToDelete.length,
          itemsDeleted: itemsToDelete.map(item => ({
            name: item.name,
            category: item.category
          }))
        }
      );
      
      console.log(`🍽️ Menu cleared notification created for ${day} (${itemsToDelete.length} items)`);
    } catch (notificationError) {
      console.error('⚠️ Failed to create notification:', notificationError);
      // Continue with deletion even if notification fails
    }

    // Delete the items
    const result = await FoodItem.deleteMany(filter);

    res.status(200).json({
      success: true,
      message: `Menu items for ${day} cleared successfully`,
      deletedCount: result.deletedCount,
      details: {
        day,
        itemsDeleted: itemsToDelete.length,
        categories: [...new Set(itemsToDelete.map(item => item.category))]
      }
    });
  } catch (error) {
    console.error("Error clearing day menu:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ NEW: Update multiple food items (bulk update) WITH NOTIFICATION
export const updateMultipleFoodItems = async (req, res) => {
  try {
    const { updates } = req.body; // Array of {id, updates}
    const userId = req.user.id;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Updates array is required and must not be empty" 
      });
    }

    const updatedItems = [];
    const oldItemsData = [];

    // Get old data first
    for (const update of updates) {
      const oldItem = await FoodItem.findById(update.id);
      if (oldItem) {
        oldItemsData.push({
          id: oldItem._id,
          oldData: {
            name: oldItem.name,
            price: oldItem.price,
            description: oldItem.description
          }
        });
      }
    }

    // Perform updates
    for (const update of updates) {
      const updatedItem = await FoodItem.findByIdAndUpdate(
        update.id,
        update.updates,
        { new: true, runValidators: true }
      );
      
      if (updatedItem) {
        updatedItems.push(updatedItem);
      }
    }

    if (updatedItems.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No items were updated" 
      });
    }

    // ✅ CREATE BULK NOTIFICATION FOR MULTIPLE UPDATES
    try {
      const propertyId = updatedItems[0]?.propertyId;
      const changesSummary = `Updated ${updatedItems.length} food items`;
      
      if (propertyId) {
        await NotificationService.createBulkFoodMenuNotification(
          propertyId,
          'bulk_updated',
          userId,
          changesSummary,
          {
            itemsUpdated: updatedItems.length,
            changes: updates.map(update => ({
              itemId: update.id,
              updates: Object.keys(update.updates)
            }))
          }
        );
        
        console.log(`🍽️ Bulk update notification created for ${updatedItems.length} items`);
      }
    } catch (notificationError) {
      console.error('⚠️ Failed to create bulk notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(200).json({ 
      success: true, 
      data: updatedItems,
      message: `${updatedItems.length} food items updated successfully`,
      summary: {
        totalUpdated: updatedItems.length,
        categories: [...new Set(updatedItems.map(item => item.category))]
      }
    });
  } catch (error) {
    console.error("Error updating multiple food items:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ NEW: Get food menu changes history (optional)
export const getFoodMenuChanges = async (req, res) => {
  try {
    const { propertyId, bookingId, startDate, endDate } = req.query;
    
    const query = {};
    if (propertyId) query["metadata.propertyId"] = propertyId;
    if (bookingId) query["metadata.bookingId"] = bookingId;
    
    // Filter by notification type
    query.type = { $regex: /^food_/, $options: 'i' };
    
    // Date filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const changes = await Notification.find(query)
      .sort({ createdAt: -1 })
      .populate('propertyId', 'name')
      .populate('bookingId', 'checkIn checkOut')
      .limit(50);

    res.status(200).json({
      success: true,
      data: changes,
      count: changes.length
    });
  } catch (error) {
    console.error("Error fetching food menu changes:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};