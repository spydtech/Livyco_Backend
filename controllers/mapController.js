import MapLocation from "../models/MapLocation.js";

// controllers/mapController.js

import mongoose from "mongoose";

export const addOrUpdateMultiplePins = async (req, res) => {
  try {
    console.log('=== BACKEND: Received request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { propertyId, name, pins } = req.body;

    // Validate required fields
    if (!propertyId) {
      console.log('BACKEND: Missing propertyId');
      return res.status(400).json({ success: false, message: "Missing propertyId" });
    }
    
    if (!name) {
      console.log('BACKEND: Missing name');
      return res.status(400).json({ success: false, message: "Missing property name" });
    }
    
    if (!Array.isArray(pins)) {
      console.log('BACKEND: pins is not an array');
      return res.status(400).json({ success: false, message: "Pins must be an array" });
    }

    // Validate propertyId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      console.log('BACKEND: Invalid ObjectId:', propertyId);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid propertyId format" 
      });
    }

    // Validate each pin structure
    if (pins.length > 0) {
      for (const [index, pin] of pins.entries()) {
        if (typeof pin.lat !== 'number' || typeof pin.lng !== 'number' || !pin.address) {
          console.log(`BACKEND: Invalid pin at index ${index}:`, pin);
          return res.status(400).json({ 
            success: false, 
            message: `Invalid pin data at position ${index + 1}` 
          });
        }
      }
    }

    console.log('BACKEND: Data validation passed, saving to database...');

    const updated = await MapLocation.findOneAndUpdate(
      { propertyId: new mongoose.Types.ObjectId(propertyId) },
      { name, pins },
      { new: true, upsert: true }
    );

    console.log('BACKEND: Successfully saved:', updated);
    res.status(200).json({ success: true, location: updated });
    
  } catch (e) {
    console.error('BACKEND: Server error:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

//get client added locations
// export const getClientLocations = async (req, res) => {
//   try {
//     const { clientId } = req.params;
//     const locations = await MapLocation.find({ clientId });
//     res.json({ success: true, locations });
//   } catch (e) {
//     res.status(500).json({ success: false, message: e.message });
//   }
// };



export const getAllLocations = async (req, res) => {
  try {
    const locations = await MapLocation.find();
    res.json({ success: true, locations });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const getLocationByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const location = await MapLocation.findOne({ propertyId });
    if (!location)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, location });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
