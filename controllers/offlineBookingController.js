 
import OfflineBooking from "../models/OfflineBooking.js";
import User from "../models/User.js";
import Property from "../models/Property.js";
 
// Create or update offline booking
export const createOfflineBooking = async (req, res) => {
  try {
    const { tenant, propertyId } = req.body;
 
    if (!tenant || !propertyId) {
      return res.status(400).json({ message: "Tenant and Property ID are required" });
    }
 
   
    let existingBooking = await OfflineBooking.findOne({ tenant, propertyId });
 
    if (existingBooking) {
     
      Object.assign(existingBooking, req.body);
      existingBooking.bookingStatus = "confirmed";
      await existingBooking.save();
      return res.status(200).json({ message: "Booking updated successfully", booking: existingBooking });
    }
 
    // Create new booking
    const booking = new OfflineBooking(req.body);
    await booking.save();
    res.status(201).json({ message: "Offline booking created successfully", booking });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};
 
// Get all offline bookings
export const getAllOfflineBookings = async (req, res) => {
  try {
    const bookings = await OfflineBooking.find()
      .populate({
        path: "tenant",
        model: User,
        select: "name phone clientId email"
      })
      .populate({
        path: "propertyId",
        model: Property,
        select: "name locality city"
      });
   
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching offline bookings:", error);
    res.status(500).json({ message: error.message });
  }
};
 
export const getOfflineBookingById = async (req, res) => {
  try {
    const booking = await OfflineBooking.findById(req.params.id)
      .populate({
        path: "tenant",
        model: User,
        select: "name phone clientId email"
      })
      .populate({
        path: "propertyId",
        model: Property,
        select: "name locality city"
      });
   
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 
export const updateOfflineBooking = async (req, res) => {
  try {
    const booking = await OfflineBooking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ message: "Booking updated successfully", booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
 
export const deleteOfflineBooking = async (req, res) => {
  try {
    const booking = await OfflineBooking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 