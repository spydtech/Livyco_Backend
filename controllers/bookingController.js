// import mongoose from 'mongoose';
// import Booking from '../models/Booking.js';
// import Property from '../models/Property.js';
// import Room from '../models/Room.js';
// import User from '../models/User.js';

// // Helper function to normalize bed names (remove spaces)
// const normalizeBedName = (bedName) => {
//   return bedName.replace(/\s+/g, '');
// };

// // Helper function to calculate days between two dates
// const calculateDaysBetween = (startDate, endDate) => {
//   const start = new Date(startDate);
//   const end = new Date(endDate);
//   const timeDiff = end.getTime() - start.getTime();
//   return Math.ceil(timeDiff / (1000 * 3600 * 24));
// };

// export const checkRoomAvailability = async (req, res) => {
//   try {
//     const { propertyId, startDate, endDate } = req.body;
    
//     if (!propertyId || !startDate) {
//       return res.status(400).json({
//         success: false,
//         message: 'propertyId and startDate are required parameters'
//       });
//     }
    
//     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid propertyId format'
//       });
//     }
    
//     const parsedStartDate = new Date(startDate);
//     parsedStartDate.setUTCHours(0, 0, 0, 0);
    
//     let parsedEndDate;
//     if (endDate) {
//       parsedEndDate = new Date(endDate);
//       parsedEndDate.setUTCHours(0, 0, 0, 0);
//     } else {
//       // Default to 1 day if no end date provided
//       parsedEndDate = new Date(parsedStartDate);
//       parsedEndDate.setDate(parsedStartDate.getDate() + 1);
//     }
    
//     if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid date format. Use YYYY-MM-DD.'
//       });
//     }
    
//     if (parsedEndDate <= parsedStartDate) {
//       return res.status(400).json({
//         success: false,
//         message: 'End date must be after start date.'
//       });
//     }
    
//     const property = await Property.findById(propertyId);
//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: 'Property not found'
//       });
//     }
    
//     const roomConfig = await Room.findOne({ propertyId });
//     if (!roomConfig) {
//       return res.status(404).json({
//         success: false,
//         message: 'Room configuration not found for this property'
//       });
//     }
    
//     // Find all bookings that conflict with the selected date range
//     const conflictingBookings = await Booking.find({
//       propertyId,
//       bookingStatus: { $nin: ['cancelled', 'checked_out', 'rejected'] },
//       $or: [
//         {
//           // Existing booking overlaps with our start date
//           moveInDate: { $lte: parsedStartDate },
//           moveOutDate: { $gte: parsedStartDate }
//         },
//         {
//           // Existing booking starts during our stay
//           moveInDate: { $gte: parsedStartDate, $lte: parsedEndDate }
//         },
//         {
//           // Our booking encompasses an existing booking
//           moveInDate: { $lte: parsedStartDate },
//           moveOutDate: { $gte: parsedEndDate }
//         }
//       ]
//     });
    
//     // Extract unavailable room identifiers
//     const unavailableRooms = conflictingBookings.flatMap(booking => 
//       booking.roomDetails.map(room => room.roomIdentifier)
//     );
    
//     return res.status(200).json({
//       success: true,
//       unavailableRooms,
//       startDate: parsedStartDate.toISOString().split('T')[0],
//       endDate: parsedEndDate.toISOString().split('T')[0],
//       property: property.name
//     });
    
//   } catch (error) {
//     console.error('Availability check error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// export const createBooking = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
  
//   try {
//     console.log('--- Booking Request Received ---');
//     console.log('Request Body:', req.body);

//     if (!req.user || !req.user.id) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(401).json({
//         success: false,
//         message: 'Authentication required. Please log in.'
//       });
//     }

//     const {
//       propertyId,
//       roomType,
//       selectedRooms,
//       moveInDate,
//       endDate,
//       durationType,
//       durationDays,
//       durationMonths,
//       personCount,
//       customerDetails,
//       paymentInfo,
//       pricing
//     } = req.body;

//     // Validation checks
//     const missingFields = [];
//     if (!propertyId) missingFields.push('propertyId');
//     if (!roomType) missingFields.push('roomType');
//     if (!selectedRooms || selectedRooms.length === 0) missingFields.push('selectedRooms');
//     if (!moveInDate) missingFields.push('moveInDate');
//     if (!personCount) missingFields.push('personCount');

//     if (missingFields.length > 0) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         success: false,
//         message: `Missing required fields: ${missingFields.join(', ')}.`,
//         missingFields
//       });
//     }

//     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ success: false, message: 'Invalid propertyId format.' });
//     }

//     const parsedMoveInDate = new Date(moveInDate);
//     parsedMoveInDate.setUTCHours(0, 0, 0, 0);

//     if (isNaN(parsedMoveInDate.getTime())) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ success: false, message: 'Invalid moveInDate format. Use YYYY-MM-DD.' });
//     }

//     // Validate end date based on duration type
//     let parsedEndDate;
//     if (endDate) {
//       parsedEndDate = new Date(endDate);
//       parsedEndDate.setUTCHours(0, 0, 0, 0);
      
//       if (isNaN(parsedEndDate.getTime())) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(400).json({ success: false, message: 'Invalid endDate format. Use YYYY-MM-DD.' });
//       }
      
//       if (parsedEndDate <= parsedMoveInDate) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(400).json({ success: false, message: 'End date must be after start date.' });
//       }
//     } else {
//       // Calculate end date based on duration type if not provided
//       parsedEndDate = new Date(parsedMoveInDate);
//       if (durationType === 'monthly' && durationMonths) {
//         parsedEndDate.setMonth(parsedMoveInDate.getMonth() + durationMonths);
//       } else if (durationType === 'daily' && durationDays) {
//         parsedEndDate.setDate(parsedMoveInDate.getDate() + durationDays);
//       } else {
//         // Default to 1 month if no duration specified
//         parsedEndDate.setMonth(parsedMoveInDate.getMonth() + 1);
//       }
//     }

//     const [property, user] = await Promise.all([
//       Property.findById(propertyId),
//       User.findById(req.user.id)
//     ]);

//     if (!property || property.status !== 'approved') {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ success: false, message: 'Property not available for booking.' });
//     }

//     if (!user || !user.clientId) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ success: false, message: 'User or clientId not found.' });
//     }

//     const roomConfig = await Room.findOne({ propertyId });
//     if (!roomConfig) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ success: false, message: 'Room configuration not found for this property.' });
//     }

//     const roomTypeConfig = roomConfig.roomTypes.find(rt => rt.type === roomType);
//     if (!roomTypeConfig) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ success: false, message: 'Selected room type not found.' });
//     }

//     console.log('\n=== ROOM CONFIGURATION ANALYSIS ===');
//     console.log('Room Config:', JSON.stringify(roomConfig.floorConfig.floors, null, 2));

//     console.log('\n=== ROOM AVAILABILITY CHECK ===');
//     console.log('Selected Rooms:', selectedRooms);
//     console.log('Move In Date:', parsedMoveInDate);
//     console.log('Move Out Date:', parsedEndDate);
    
//     let unavailableRooms = [];

//     for (const roomInfo of selectedRooms) {
//       console.log(`\n🔍 Analyzing room: ${roomInfo}`);
      
//       const parts = roomInfo.split('-');
//       if (parts.length < 3) {
//         console.log('❌ Invalid room format - not enough parts');
//         unavailableRooms.push(roomInfo);
//         continue;
//       }
      
//       const sharingType = parts[0];
//       const roomNumber = parts.slice(1, parts.length - 1).join('-');
//       const bedFromRequest = parts[parts.length - 1];
      
//       console.log(`Parsed: sharingType=${sharingType}, roomNumber=${roomNumber}, bed=${bedFromRequest}`);
      
//       // Check if room exists in configuration (with space handling)
//       let roomExists = false;
//       let actualBedName = null;
//       let floorNumber = 1;
      
//       for (const floorConfig of roomConfig.floorConfig.floors) {
//         if (floorConfig.rooms && floorConfig.rooms.has(roomNumber)) {
//           const beds = floorConfig.rooms.get(roomNumber);
//           console.log(`Floor ${floorConfig.floor} - Room ${roomNumber}:`, beds);
          
//           // Check if bed exists (handling spaces)
//           const foundBed = beds.find(bed => {
//             // Normalize both bed names for comparison
//             const normalizedConfigBed = normalizeBedName(bed);
//             const normalizedRequestBed = normalizeBedName(bedFromRequest);
//             return normalizedConfigBed === normalizedRequestBed;
//           });
          
//           if (foundBed) {
//             roomExists = true;
//             actualBedName = foundBed;
//             floorNumber = floorConfig.floor;
//             console.log(`✅ Bed found: ${foundBed} (normalized: ${normalizeBedName(foundBed)})`);
//             break;
//           } else {
//             console.log(`❌ Bed ${bedFromRequest} NOT found in room ${roomNumber}`);
//             console.log(`   Available beds (normalized):`, beds.map(bed => normalizeBedName(bed)));
//           }
//         }
//       }
      
//       if (!roomExists) {
//         console.log(`❌ Room configuration issue: ${roomInfo}`);
//         unavailableRooms.push(roomInfo);
//         continue;
//       }
      
//       // Check for existing bookings using the actual bed name with spaces
//       const roomIdentifierWithSpaces = `${sharingType}-${roomNumber}-${actualBedName}`;
//       console.log(`📋 Checking conflicts for: ${roomIdentifierWithSpaces}`);
      
//       const conflict = await Booking.findOne({
//         propertyId,
//         'roomDetails.roomIdentifier': roomIdentifierWithSpaces,
//         bookingStatus: { $nin: ['cancelled', 'checked_out', 'rejected'] },
//         $or: [
//           {
//             // Existing booking overlaps with our start date
//             moveInDate: { $lte: parsedMoveInDate },
//             moveOutDate: { $gte: parsedMoveInDate }
//           },
//           {
//             // Existing booking starts during our stay
//             moveInDate: { $gte: parsedMoveInDate, $lte: parsedEndDate }
//           },
//           {
//             // Our booking encompasses an existing booking
//             moveInDate: { $lte: parsedMoveInDate },
//             moveOutDate: { $gte: parsedEndDate }
//           }
//         ]
//       }).session(session);
      
//       if (conflict) {
//         console.log(`❌ CONFLICT FOUND: Booking ${conflict._id}`);
//         console.log('Conflict details:', {
//           moveIn: conflict.moveInDate,
//           moveOut: conflict.moveOutDate,
//           status: conflict.bookingStatus
//         });
//         unavailableRooms.push(roomInfo);
//       } else {
//         console.log(`✅ Room available: ${roomInfo}`);
//       }
//     }
    
//     if (unavailableRooms.length > 0) {
//       console.log('❌ UNAVAILABLE ROOMS:', unavailableRooms);
//       await session.abortTransaction();
//       session.endSession();
      
//       return res.status(409).json({
//         success: false,
//         message: 'Some selected rooms are not available.',
//         unavailableRooms,
//         suggestion: 'Please select different rooms or choose a different date.'
//       });
//     }

//     // Calculate pricing based on duration
//     let monthlyRent = roomTypeConfig.price * selectedRooms.length;
//     let totalRent = monthlyRent;
    
//     if (durationType === 'daily') {
//       // Calculate daily rate (monthly rate / 30)
//       const dailyRate = monthlyRent / 30;
//       totalRent = dailyRate * durationDays;
//     } else if (durationType === 'monthly') {
//       totalRent = monthlyRent * durationMonths;
//     } else {
//       // For custom range, calculate based on actual days
//       const daysDiff = calculateDaysBetween(parsedMoveInDate, parsedEndDate);
//       const dailyRate = monthlyRent / 30;
//       totalRent = dailyRate * daysDiff;
//     }

//     // Create booking with duration info
//     const bookingData = {
//       userId: req.user.id,
//       clientId: user.clientId,
//       propertyId,
//       roomType: {
//         type: roomTypeConfig.type,
//         name: roomTypeConfig.label || roomTypeConfig.type,
//         capacity: roomTypeConfig.capacity
//       },
//       roomDetails: selectedRooms.map(roomInfo => {
//         const parts = roomInfo.split('-');
        
//         if (parts.length < 3) {
//           return {
//             roomIdentifier: roomInfo,
//             sharingType: 'unknown',
//             floor: 1,
//             roomNumber: 'unknown',
//             bed: 'unknown'
//           };
//         }
        
//         const sharingType = parts[0];
//         const roomNumber = parts.slice(1, parts.length - 1).join('-');
//         const bedFromRequest = parts[parts.length - 1];
        
//         // Find the actual bed name from configuration (with spaces)
//         let actualBedName = bedFromRequest;
//         let floorNumber = 1;
        
//         for (const floorConfig of roomConfig.floorConfig.floors) {
//           if (floorConfig.rooms && floorConfig.rooms.has(roomNumber)) {
//             const beds = floorConfig.rooms.get(roomNumber);
//             const foundBed = beds.find(bed => {
//               const normalizedConfigBed = normalizeBedName(bed);
//               const normalizedRequestBed = normalizeBedName(bedFromRequest);
//               return normalizedConfigBed === normalizedRequestBed;
//             });
            
//             if (foundBed) {
//               actualBedName = foundBed;
//               floorNumber = floorConfig.floor;
//               break;
//             }
//           }
//         }
        
//         const roomIdentifier = `${sharingType}-${roomNumber}-${actualBedName}`;
        
//         return {
//           roomIdentifier: roomIdentifier,
//           sharingType,
//           floor: floorNumber,
//           roomNumber,
//           bed: actualBedName
//         };
//       }),
//       moveInDate: parsedMoveInDate,
//       moveOutDate: parsedEndDate,
//       durationType,
//       durationDays: durationType === 'daily' ? durationDays : null,
//       durationMonths: durationType === 'monthly' ? durationMonths : null,
//       personCount: parseInt(personCount),
//       customerDetails,
//       pricing: {
//         monthlyRent: monthlyRent,
//         totalRent: totalRent,
//         securityDeposit: roomTypeConfig.deposit * selectedRooms.length,
//         advanceAmount: roomTypeConfig.price
//       },
//       paymentInfo: {
//         amountPaid: paymentInfo?.amountPaid || 0,
//         paymentMethod: paymentInfo?.paymentMethod || 'razorpay',
//         paymentStatus: paymentInfo?.paymentStatus || 'pending',
//         transactionId: paymentInfo?.transactionId || null
//       },
//       bookingStatus: paymentInfo?.paymentStatus === 'completed' ? 'confirmed' : 'pending'
//     };

//     if (pricing) {
//       bookingData.pricing.advanceAmount = pricing.advanceAmount || bookingData.pricing.advanceAmount;
//       bookingData.pricing.securityDeposit = pricing.securityDeposit || bookingData.pricing.securityDeposit;
//     }

//     console.log('\n=== FINAL BOOKING DATA ===');
//     console.log('Room Details:', bookingData.roomDetails);
//     console.log('Duration:', {
//       type: durationType,
//       days: durationDays,
//       months: durationMonths,
//       start: parsedMoveInDate.toISOString().split('T')[0],
//       end: parsedEndDate.toISOString().split('T')[0]
//     });
//     console.log('Pricing:', bookingData.pricing);

//     const newBooking = new Booking(bookingData);
//     await newBooking.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     return res.status(201).json({
//       success: true,
//       message: 'Booking created successfully!',
//       booking: {
//         id: newBooking._id,
//         property: property.name,
//         roomType: newBooking.roomType.name,
//         rooms: newBooking.roomDetails,
//         moveInDate: newBooking.moveInDate.toISOString().split('T')[0],
//         moveOutDate: newBooking.moveOutDate.toISOString().split('T')[0],
//         durationType: newBooking.durationType,
//         durationDays: newBooking.durationDays,
//         durationMonths: newBooking.durationMonths,
//         monthlyRent: newBooking.pricing.monthlyRent,
//         totalRent: newBooking.pricing.totalRent,
//         securityDeposit: newBooking.pricing.securityDeposit,
//         advanceAmount: newBooking.pricing.advanceAmount,
//         total: newBooking.pricing.totalRent + newBooking.pricing.securityDeposit + newBooking.pricing.advanceAmount,
//         status: newBooking.bookingStatus
//       }
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
    
//     console.error('Booking error:', error);

//     if (error.name === 'ValidationError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: Object.values(error.errors).map(err => err.message)
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// // Update getAllAvailableBeds to accept date range
// export const getAllAvailableBeds = async (req, res) => {
//   try {
//     const { propertyId } = req.params;
//     const { startDate, endDate } = req.query;
    
//     if (!propertyId) {
//       return res.status(400).json({
//         success: false,
//         message: 'propertyId is required parameter'
//       });
//     }
    
//     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid propertyId format'
//       });
//     }
    
//     const checkStartDate = startDate ? new Date(startDate) : new Date();
//     checkStartDate.setUTCHours(0, 0, 0, 0);
    
//     let checkEndDate;
//     if (endDate) {
//       checkEndDate = new Date(endDate);
//       checkEndDate.setUTCHours(0, 0, 0, 0);
//     } else {
//       // Default to 1 day if no end date provided
//       checkEndDate = new Date(checkStartDate);
//       checkEndDate.setDate(checkStartDate.getDate() + 1);
//     }
    
//     if (isNaN(checkStartDate.getTime()) || isNaN(checkEndDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid date format. Use YYYY-MM-DD.'
//       });
//     }
    
//     // Get room configuration
//     const roomConfig = await Room.findOne({ propertyId });
//     if (!roomConfig) {
//       return res.status(404).json({
//         success: false,
//         message: 'Room configuration not found for this property'
//       });
//     }
    
//     // Find all bookings (including approved ones) that conflict with the date range
//     const bookings = await Booking.find({
//       propertyId,
//       bookingStatus: { $nin: ['cancelled', 'rejected'] },
//       $or: [
//         {
//           // Existing booking overlaps with our start date
//           moveInDate: { $lte: checkStartDate },
//           moveOutDate: { $gte: checkStartDate }
//         },
//         {
//           // Existing booking starts during our stay
//           moveInDate: { $gte: checkStartDate, $lte: checkEndDate }
//         },
//         {
//           // Our booking encompasses an existing booking
//           moveInDate: { $lte: checkStartDate },
//           moveOutDate: { $gte: checkEndDate }
//         }
//       ]
//     });
    
//     // Extract all booked room identifiers with their status
//     const bookedBeds = [];
//     bookings.forEach(booking => {
//       booking.roomDetails.forEach(room => {
//         bookedBeds.push({
//           roomIdentifier: room.roomIdentifier,
//           status: booking.bookingStatus,
//           bookingId: booking._id
//         });
//       });
//     });
    
//     // Get all available beds with status
//     const bedsByFloor = {};
//     let totalBeds = 0;
//     let availableBeds = 0;
//     let bookedBedsCount = 0;
//     let approvedBedsCount = 0;
    
//     for (const floorConfig of roomConfig.floorConfig.floors) {
//       const floorBeds = [];
      
//       // Check if rooms is a Map or regular object
//       let rooms;
//       if (floorConfig.rooms instanceof Map) {
//         // Convert Map to object
//         rooms = Object.fromEntries(floorConfig.rooms);
//       } else {
//         rooms = floorConfig.rooms;
//       }
      
//       for (const [roomNumber, beds] of Object.entries(rooms)) {
//         // Get the actual room type from room configuration instead of inferring from bed count
//         let roomType = 'double'; // default fallback
        
//         // Try to find room type from room configuration
//         const roomTypeConfig = roomConfig.roomTypes.find(rt => {
//           // Check if this room matches the room type based on bed count
//           return rt.capacity === beds.length;
//         });
        
//         if (roomTypeConfig) {
//           roomType = roomTypeConfig.type;
//         } else {
//           // Fallback: determine room type based on bed count
//           if (beds.length === 1) roomType = 'single';
//           else if (beds.length === 3) roomType = 'triple';
//           else if (beds.length === 4) roomType = 'four';
//           else if (beds.length === 5) roomType = 'five';
//           else if (beds.length === 6) roomType = 'six';
//         }
        
//         for (const bed of beds) {
//           totalBeds++;
          
//           // Use the actual bed name (with spaces) for the identifier
//           const roomIdentifier = `${roomType}-${roomNumber}-${bed}`;
          
//           // Check if this bed is booked
//           const bookingInfo = bookedBeds.find(b => b.roomIdentifier === roomIdentifier);
          
//           let status = 'available';
//           if (bookingInfo) {
//             if (bookingInfo.status === 'approved' || bookingInfo.status === 'confirmed') {
//               status = 'approved';
//               approvedBedsCount++;
//             } else {
//               status = 'booked';
//               bookedBedsCount++;
//             }
//           } else {
//             availableBeds++;
//           }
          
//           floorBeds.push({
//             _id: new mongoose.Types.ObjectId(),
//             roomNumber,
//             bedName: bed, // Keep the actual bed name with spaces
//             bedLetter: normalizeBedName(bed), // Normalized version for reference
//             floor: floorConfig.floor,
//             roomIdentifier,
//             roomType: roomType,
//             status: status,
//             available: status === 'available',
//             bookingId: bookingInfo?.bookingId || null
//           });
//         }
//       }
      
//       if (floorBeds.length > 0) {
//         bedsByFloor[floorConfig.floor] = floorBeds;
//       }
//     }
    
//     // Verify counts
//     console.log('Bed Statistics:', {
//       totalBeds,
//       availableBeds,
//       bookedBeds: bookedBedsCount,
//       approvedBeds: approvedBedsCount,
//       calculatedTotal: availableBeds + bookedBedsCount + approvedBedsCount
//     });
    
//     return res.status(200).json({
//       success: true,
//       bedsByFloor,
//       checkStartDate: checkStartDate.toISOString().split('T')[0],
//       checkEndDate: checkEndDate.toISOString().split('T')[0],
//       statistics: {
//         totalBeds,
//         availableBeds,
//         bookedBeds: bookedBedsCount,
//         approvedBeds: approvedBedsCount
//       }
//     });
    
//   } catch (error) {
//     console.error('Get all available beds error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// // ... (other controller functions remain the same)

// // Helper function to normalize bed names (remove spaces)
// // const normalizeBedName = (bedName) => {
// //   return bedName.replace(/\s+/g, '');
// // };

// // Helper function to find bed in configuration (handles spaces)
// const findBedInConfiguration = (beds, targetBed) => {
//   const normalizedTargetBed = normalizeBedName(targetBed);
//   return beds.some(bed => normalizeBedName(bed) === normalizedTargetBed);
// };

// // export const checkRoomAvailability = async (req, res) => {
// //   try {
// //     const { propertyId, date } = req.body;
    
// //     if (!propertyId || !date) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'propertyId and date are required parameters'
// //       });
// //     }
    
// //     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Invalid propertyId format'
// //       });
// //     }
    
// //     const parsedDate = new Date(date);
// //     parsedDate.setUTCHours(0, 0, 0, 0);
    
// //     if (isNaN(parsedDate.getTime())) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Invalid date format. Use YYYY-MM-DD.'
// //       });
// //     }
    
// //     const property = await Property.findById(propertyId);
// //     if (!property) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Property not found'
// //       });
// //     }
    
// //     const roomConfig = await Room.findOne({ propertyId });
// //     if (!roomConfig) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Room configuration not found for this property'
// //       });
// //     }
    
// //     // Find all bookings that conflict with the selected date
// //     const conflictingBookings = await Booking.find({
// //       propertyId,
// //       bookingStatus: { $nin: ['cancelled', 'checked_out', 'rejected'] },
// //       $or: [
// //         {
// //           moveInDate: { $lte: parsedDate },
// //           moveOutDate: { $gte: parsedDate }
// //         },
// //         {
// //           moveInDate: parsedDate
// //         }
// //       ]
// //     });
    
// //     // Extract unavailable room identifiers
// //     const unavailableRooms = conflictingBookings.flatMap(booking => 
// //       booking.roomDetails.map(room => room.roomIdentifier)
// //     );
    
// //     return res.status(200).json({
// //       success: true,
// //       unavailableRooms,
// //       date: parsedDate.toISOString().split('T')[0],
// //       property: property.name
// //     });
    
// //   } catch (error) {
// //     console.error('Availability check error:', error);
// //     return res.status(500).json({
// //       success: false,
// //       message: 'Internal server error'
// //     });
// //   }
// // };

// // export const createBooking = async (req, res) => {

// //   const session = await mongoose.startSession();
// //   session.startTransaction();
  
// //   try {
// //     console.log('--- Booking Request Received ---');
// //     console.log('Request Body:', req.body);

// //     if (!req.user || !req.user.id) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(401).json({
// //         success: false,
// //         message: 'Authentication required. Please log in.'
// //       });
// //     }

// //     const {
// //       propertyId,
// //       roomType,
// //       selectedRooms,
// //       moveInDate,
// //       personCount,
// //       customerDetails,
// //       paymentInfo,
// //       pricing
// //     } = req.body;

// //     // Validation checks
// //     const missingFields = [];
// //     if (!propertyId) missingFields.push('propertyId');
// //     if (!roomType) missingFields.push('roomType');
// //     if (!selectedRooms || selectedRooms.length === 0) missingFields.push('selectedRooms');
// //     if (!moveInDate) missingFields.push('moveInDate');
// //     if (!personCount) missingFields.push('personCount');

// //     if (missingFields.length > 0) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(400).json({
// //         success: false,
// //         message: `Missing required fields: ${missingFields.join(', ')}.`,
// //         missingFields
// //       });
// //     }

// //     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(400).json({ success: false, message: 'Invalid propertyId format.' });
// //     }

// //     const parsedMoveInDate = new Date(moveInDate);
// //     parsedMoveInDate.setUTCHours(0, 0, 0, 0);

// //     if (isNaN(parsedMoveInDate.getTime())) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(400).json({ success: false, message: 'Invalid moveInDate format. Use YYYY-MM-DD.' });
// //     }

// //     const [property, user] = await Promise.all([
// //       Property.findById(propertyId),
// //       User.findById(req.user.id)
// //     ]);

// //     if (!property || property.status !== 'approved') {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(404).json({ success: false, message: 'Property not available for booking.' });
// //     }

// //     if (!user || !user.clientId) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(400).json({ success: false, message: 'User or clientId not found.' });
// //     }

// //     const roomConfig = await Room.findOne({ propertyId });
// //     if (!roomConfig) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(404).json({ success: false, message: 'Room configuration not found for this property.' });
// //     }

// //     const roomTypeConfig = roomConfig.roomTypes.find(rt => rt.type === roomType);
// //     if (!roomTypeConfig) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(400).json({ success: false, message: 'Selected room type not found.' });
// //     }

// //     console.log('\n=== ROOM CONFIGURATION ANALYSIS ===');
// //     console.log('Room Config:', JSON.stringify(roomConfig.floorConfig.floors, null, 2));

// //     console.log('\n=== ROOM AVAILABILITY CHECK ===');
// //     console.log('Selected Rooms:', selectedRooms);
// //     console.log('Move In Date:', parsedMoveInDate);
    
// //     let unavailableRooms = [];

// //     for (const roomInfo of selectedRooms) {
// //       console.log(`\n🔍 Analyzing room: ${roomInfo}`);
      
// //       const parts = roomInfo.split('-');
// //       if (parts.length < 3) {
// //         console.log('❌ Invalid room format - not enough parts');
// //         unavailableRooms.push(roomInfo);
// //         continue;
// //       }
      
// //       const sharingType = parts[0];
// //       const roomNumber = parts.slice(1, parts.length - 1).join('-');
// //       const bedFromRequest = parts[parts.length - 1];
      
// //       console.log(`Parsed: sharingType=${sharingType}, roomNumber=${roomNumber}, bed=${bedFromRequest}`);
      
// //       // Check if room exists in configuration (with space handling)
// //       let roomExists = false;
// //       let actualBedName = null;
      
// //       for (const floorConfig of roomConfig.floorConfig.floors) {
// //         if (floorConfig.rooms && floorConfig.rooms.has(roomNumber)) {
// //           const beds = floorConfig.rooms.get(roomNumber);
// //           console.log(`Floor ${floorConfig.floor} - Room ${roomNumber}:`, beds);
          
// //           // Check if bed exists (handling spaces)
// //           const foundBed = beds.find(bed => normalizeBedName(bed) === bedFromRequest);
// //           if (foundBed) {
// //             roomExists = true;
// //             actualBedName = foundBed;
// //             console.log(`✅ Bed found: ${foundBed} (normalized: ${normalizeBedName(foundBed)})`);
// //             break;
// //           } else {
// //             console.log(`❌ Bed ${bedFromRequest} NOT found in room ${roomNumber}`);
// //             console.log(`   Available beds (normalized):`, beds.map(bed => normalizeBedName(bed)));
// //           }
// //         }
// //       }
      
// //       if (!roomExists) {
// //         console.log(`❌ Room configuration issue: ${roomInfo}`);
// //         unavailableRooms.push(roomInfo);
// //         continue;
// //       }
      
// //       // Check for existing bookings using the actual bed name with spaces
// //       const roomIdentifierWithSpaces = `${sharingType}-${roomNumber}-${actualBedName}`;
// //       console.log(`📋 Checking conflicts for: ${roomIdentifierWithSpaces}`);
      
// //       const conflict = await Booking.findOne({
// //         propertyId,
// //         'roomDetails.roomIdentifier': roomIdentifierWithSpaces,
// //         bookingStatus: { $nin: ['cancelled', 'checked_out', 'rejected'] },
// //         $or: [
// //           {
// //             moveInDate: { $lte: parsedMoveInDate },
// //             moveOutDate: { $gte: parsedMoveInDate }
// //           },
// //           {
// //             moveInDate: parsedMoveInDate
// //           }
// //         ]
// //       }).session(session);
      
// //       if (conflict) {
// //         console.log(`❌ CONFLICT FOUND: Booking ${conflict._id}`);
// //         console.log('Conflict details:', {
// //           moveIn: conflict.moveInDate,
// //           moveOut: conflict.moveOutDate,
// //           status: conflict.bookingStatus
// //         });
// //         unavailableRooms.push(roomInfo);
// //       } else {
// //         console.log(`✅ Room available: ${roomInfo}`);
// //       }
// //     }
    
// //     if (unavailableRooms.length > 0) {
// //       console.log('❌ UNAVAILABLE ROOMS:', unavailableRooms);
// //       await session.abortTransaction();
// //       session.endSession();
      
// //       return res.status(409).json({
// //         success: false,
// //         message: 'Some selected rooms are not available.',
// //         unavailableRooms,
// //         suggestion: 'Please select different rooms or choose a different date.'
// //       });
// //     }

// //     // Create booking with proper room identifiers
// //     const bookingData = {
// //       userId: req.user.id,
// //       clientId: user.clientId,
// //       propertyId,
// //       roomType: {
// //         type: roomTypeConfig.type,
// //         name: roomTypeConfig.label || roomTypeConfig.type,
// //         capacity: roomTypeConfig.capacity
// //       },
// //       roomDetails: selectedRooms.map(roomInfo => {
// //         const parts = roomInfo.split('-');
        
// //         if (parts.length < 3) {
// //           return {
// //             roomIdentifier: roomInfo,
// //             sharingType: 'unknown',
// //             floor: 1,
// //             roomNumber: 'unknown',
// //             bed: 'unknown'
// //           };
// //         }
        
// //         const sharingType = parts[0];
// //         const roomNumber = parts.slice(1, parts.length - 1).join('-');
// //         const bedFromRequest = parts[parts.length - 1];
        
// //         // Find the actual bed name from configuration (with spaces)
// //         let actualBedName = bedFromRequest;
// //         let floorNumber = 1;
        
// //         for (const floorConfig of roomConfig.floorConfig.floors) {
// //           if (floorConfig.rooms && floorConfig.rooms.has(roomNumber)) {
// //             const beds = floorConfig.rooms.get(roomNumber);
// //             const foundBed = beds.find(bed => normalizeBedName(bed) === bedFromRequest);
// //             if (foundBed) {
// //               actualBedName = foundBed;
// //               floorNumber = floorConfig.floor;
// //               break;
// //             }
// //           }
// //         }
        
// //         const roomIdentifier = `${sharingType}-${roomNumber}-${actualBedName}`;
        
// //         return {
// //           roomIdentifier: roomIdentifier,
// //           sharingType,
// //           floor: floorNumber,
// //           roomNumber,
// //           bed: actualBedName
// //         };
// //       }),
// //       moveInDate: parsedMoveInDate,
// //       personCount: parseInt(personCount),
// //       customerDetails,
// //       pricing: {
// //         monthlyRent: roomTypeConfig.price * selectedRooms.length,
// //         securityDeposit: roomTypeConfig.deposit * selectedRooms.length,
// //         advanceAmount: roomTypeConfig.price
// //       },
// //       paymentInfo: {
// //         amountPaid: paymentInfo?.amountPaid || 0,
// //         paymentMethod: paymentInfo?.paymentMethod || 'razorpay',
// //         paymentStatus: paymentInfo?.paymentStatus || 'pending',
// //         transactionId: paymentInfo?.transactionId || null
// //       },
// //       bookingStatus: paymentInfo?.paymentStatus === 'completed' ? 'confirmed' : 'pending'
// //     };

// //     if (pricing) {
// //       bookingData.pricing.advanceAmount = pricing.advanceAmount || bookingData.pricing.advanceAmount;
// //       bookingData.pricing.securityDeposit = pricing.securityDeposit || bookingData.pricing.securityDeposit;
// //     }

// //     console.log('\n=== FINAL BOOKING DATA ===');
// //     console.log('Room Details:', bookingData.roomDetails);

// //     const newBooking = new Booking(bookingData);
// //     await newBooking.save({ session });

// //     await session.commitTransaction();
// //     session.endSession();

// //     return res.status(201).json({
// //       success: true,
// //       message: 'Booking created successfully!',
// //       booking: {
// //         id: newBooking._id,
// //         property: property.name,
// //         roomType: newBooking.roomType.name,
// //         rooms: newBooking.roomDetails,
// //         moveInDate: newBooking.moveInDate.toISOString().split('T')[0],
// //         monthlyRent: newBooking.pricing.monthlyRent,
// //         securityDeposit: newBooking.pricing.securityDeposit,
// //         advanceAmount: newBooking.pricing.advanceAmount,
// //         total: newBooking.pricing.monthlyRent + newBooking.pricing.securityDeposit + newBooking.pricing.advanceAmount,
// //         status: newBooking.bookingStatus
// //       }
// //     });

// //   } catch (error) {
// //     await session.abortTransaction();
// //     session.endSession();
    
// //     console.error('Booking error:', error);

// //     if (error.name === 'ValidationError') {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Validation failed',
// //         errors: Object.values(error.errors).map(err => err.message)
// //       });
// //     }

// //     return res.status(500).json({
// //       success: false,
// //       message: 'Internal server error'
// //     });
// //   }
// // };


// // Cancel booking

// // export const createBooking = async (req, res) => {
// //   const session = await mongoose.startSession();
// //   session.startTransaction();
  
// //   try {
// //     console.log('--- Booking Request Received ---');
// //     console.log('Request Body:', req.body);

// //     if (!req.user || !req.user.id) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(401).json({
// //         success: false,
// //         message: 'Authentication required. Please log in.'
// //       });
// //     }

// //     const {
// //       propertyId,
// //       roomType,
// //       selectedRooms,
// //       moveInDate,
// //       personCount,
// //       customerDetails,
// //       paymentInfo,
// //       pricing
// //     } = req.body;

// //     // Validation checks
// //     const missingFields = [];
// //     if (!propertyId) missingFields.push('propertyId');
// //     if (!roomType) missingFields.push('roomType');
// //     if (!selectedRooms || selectedRooms.length === 0) missingFields.push('selectedRooms');
// //     if (!moveInDate) missingFields.push('moveInDate');
// //     if (!personCount) missingFields.push('personCount');

// //     if (missingFields.length > 0) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(400).json({
// //         success: false,
// //         message: `Missing required fields: ${missingFields.join(', ')}.`,
// //         missingFields
// //       });
// //     }

// //     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(400).json({ success: false, message: 'Invalid propertyId format.' });
// //     }

// //     const parsedMoveInDate = new Date(moveInDate);
// //     parsedMoveInDate.setUTCHours(0, 0, 0, 0);

// //     if (isNaN(parsedMoveInDate.getTime())) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(400).json({ success: false, message: 'Invalid moveInDate format. Use YYYY-MM-DD.' });
// //     }

// //     const [property, user] = await Promise.all([
// //       Property.findById(propertyId),
// //       User.findById(req.user.id)
// //     ]);

// //     if (!property || property.status !== 'approved') {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(404).json({ success: false, message: 'Property not available for booking.' });
// //     }

// //     if (!user || !user.clientId) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(400).json({ success: false, message: 'User or clientId not found.' });
// //     }

// //     const roomConfig = await Room.findOne({ propertyId });
// //     if (!roomConfig) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(404).json({ success: false, message: 'Room configuration not found for this property.' });
// //     }

// //     const roomTypeConfig = roomConfig.roomTypes.find(rt => rt.type === roomType);
// //     if (!roomTypeConfig) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(400).json({ success: false, message: 'Selected room type not found.' });
// //     }

// //     console.log('\n=== ROOM CONFIGURATION ANALYSIS ===');
// //     console.log('Room Config:', JSON.stringify(roomConfig.floorConfig.floors, null, 2));

// //     console.log('\n=== ROOM AVAILABILITY CHECK ===');
// //     console.log('Selected Rooms:', selectedRooms);
// //     console.log('Move In Date:', parsedMoveInDate);
    
// //     let unavailableRooms = [];

// //     for (const roomInfo of selectedRooms) {
// //       console.log(`\n🔍 Analyzing room: ${roomInfo}`);
      
// //       const parts = roomInfo.split('-');
// //       if (parts.length < 3) {
// //         console.log('❌ Invalid room format - not enough parts');
// //         unavailableRooms.push(roomInfo);
// //         continue;
// //       }
      
// //       const sharingType = parts[0];
// //       const roomNumber = parts.slice(1, parts.length - 1).join('-');
// //       const bedFromRequest = parts[parts.length - 1];
      
// //       console.log(`Parsed: sharingType=${sharingType}, roomNumber=${roomNumber}, bed=${bedFromRequest}`);
      
// //       // Check if room exists in configuration (with space handling)
// //       let roomExists = false;
// //       let actualBedName = null;
// //       let floorNumber = 1;
      
// //       for (const floorConfig of roomConfig.floorConfig.floors) {
// //         if (floorConfig.rooms && floorConfig.rooms.has(roomNumber)) {
// //           const beds = floorConfig.rooms.get(roomNumber);
// //           console.log(`Floor ${floorConfig.floor} - Room ${roomNumber}:`, beds);
          
// //           // Check if bed exists (handling spaces)
// //           const foundBed = beds.find(bed => {
// //             // Normalize both bed names for comparison
// //             const normalizedConfigBed = normalizeBedName(bed);
// //             const normalizedRequestBed = normalizeBedName(bedFromRequest);
// //             return normalizedConfigBed === normalizedRequestBed;
// //           });
          
// //           if (foundBed) {
// //             roomExists = true;
// //             actualBedName = foundBed;
// //             floorNumber = floorConfig.floor;
// //             console.log(`✅ Bed found: ${foundBed} (normalized: ${normalizeBedName(foundBed)})`);
// //             break;
// //           } else {
// //             console.log(`❌ Bed ${bedFromRequest} NOT found in room ${roomNumber}`);
// //             console.log(`   Available beds (normalized):`, beds.map(bed => normalizeBedName(bed)));
// //           }
// //         }
// //       }
      
// //       if (!roomExists) {
// //         console.log(`❌ Room configuration issue: ${roomInfo}`);
// //         unavailableRooms.push(roomInfo);
// //         continue;
// //       }
      
// //       // Check for existing bookings using the actual bed name with spaces
// //       const roomIdentifierWithSpaces = `${sharingType}-${roomNumber}-${actualBedName}`;
// //       console.log(`📋 Checking conflicts for: ${roomIdentifierWithSpaces}`);
      
// //       const conflict = await Booking.findOne({
// //         propertyId,
// //         'roomDetails.roomIdentifier': roomIdentifierWithSpaces,
// //         bookingStatus: { $nin: ['cancelled', 'checked_out', 'rejected'] },
// //         $or: [
// //           {
// //             moveInDate: { $lte: parsedMoveInDate },
// //             moveOutDate: { $gte: parsedMoveInDate }
// //           },
// //           {
// //             moveInDate: parsedMoveInDate
// //           }
// //         ]
// //       }).session(session);
      
// //       if (conflict) {
// //         console.log(`❌ CONFLICT FOUND: Booking ${conflict._id}`);
// //         console.log('Conflict details:', {
// //           moveIn: conflict.moveInDate,
// //           moveOut: conflict.moveOutDate,
// //           status: conflict.bookingStatus
// //         });
// //         unavailableRooms.push(roomInfo);
// //       } else {
// //         console.log(`✅ Room available: ${roomInfo}`);
// //       }
// //     }
    
// //     if (unavailableRooms.length > 0) {
// //       console.log('❌ UNAVAILABLE ROOMS:', unavailableRooms);
// //       await session.abortTransaction();
// //       session.endSession();
      
// //       return res.status(409).json({
// //         success: false,
// //         message: 'Some selected rooms are not available.',
// //         unavailableRooms,
// //         suggestion: 'Please select different rooms or choose a different date.'
// //       });
// //     }

// //     // Create booking with proper room identifiers
// //     const bookingData = {
// //       userId: req.user.id,
// //       clientId: user.clientId,
// //       propertyId,
// //       roomType: {
// //         type: roomTypeConfig.type,
// //         name: roomTypeConfig.label || roomTypeConfig.type,
// //         capacity: roomTypeConfig.capacity
// //       },
// //       roomDetails: selectedRooms.map(roomInfo => {
// //         const parts = roomInfo.split('-');
        
// //         if (parts.length < 3) {
// //           return {
// //             roomIdentifier: roomInfo,
// //             sharingType: 'unknown',
// //             floor: 1,
// //             roomNumber: 'unknown',
// //             bed: 'unknown'
// //           };
// //         }
        
// //         const sharingType = parts[0];
// //         const roomNumber = parts.slice(1, parts.length - 1).join('-');
// //         const bedFromRequest = parts[parts.length - 1];
        
// //         // Find the actual bed name from configuration (with spaces)
// //         let actualBedName = bedFromRequest;
// //         let floorNumber = 1;
        
// //         for (const floorConfig of roomConfig.floorConfig.floors) {
// //           if (floorConfig.rooms && floorConfig.rooms.has(roomNumber)) {
// //             const beds = floorConfig.rooms.get(roomNumber);
// //             const foundBed = beds.find(bed => {
// //               const normalizedConfigBed = normalizeBedName(bed);
// //               const normalizedRequestBed = normalizeBedName(bedFromRequest);
// //               return normalizedConfigBed === normalizedRequestBed;
// //             });
            
// //             if (foundBed) {
// //               actualBedName = foundBed;
// //               floorNumber = floorConfig.floor;
// //               break;
// //             }
// //           }
// //         }
        
// //         const roomIdentifier = `${sharingType}-${roomNumber}-${actualBedName}`;
        
// //         return {
// //           roomIdentifier: roomIdentifier,
// //           sharingType,
// //           floor: floorNumber,
// //           roomNumber,
// //           bed: actualBedName
// //         };
// //       }),
// //       moveInDate: parsedMoveInDate,
// //       personCount: parseInt(personCount),
// //       customerDetails,
// //       pricing: {
// //         monthlyRent: roomTypeConfig.price * selectedRooms.length,
// //         securityDeposit: roomTypeConfig.deposit * selectedRooms.length,
// //         advanceAmount: roomTypeConfig.price
// //       },
// //       paymentInfo: {
// //         amountPaid: paymentInfo?.amountPaid || 0,
// //         paymentMethod: paymentInfo?.paymentMethod || 'razorpay',
// //         paymentStatus: paymentInfo?.paymentStatus || 'pending',
// //         transactionId: paymentInfo?.transactionId || null
// //       },
// //       bookingStatus: paymentInfo?.paymentStatus === 'completed' ? 'confirmed' : 'pending'
// //     };

// //     if (pricing) {
// //       bookingData.pricing.advanceAmount = pricing.advanceAmount || bookingData.pricing.advanceAmount;
// //       bookingData.pricing.securityDeposit = pricing.securityDeposit || bookingData.pricing.securityDeposit;
// //     }

// //     console.log('\n=== FINAL BOOKING DATA ===');
// //     console.log('Room Details:', bookingData.roomDetails);

// //     const newBooking = new Booking(bookingData);
// //     await newBooking.save({ session });

// //     await session.commitTransaction();
// //     session.endSession();

// //     return res.status(201).json({
// //       success: true,
// //       message: 'Booking created successfully!',
// //       booking: {
// //         id: newBooking._id,
// //         property: property.name,
// //         roomType: newBooking.roomType.name,
// //         rooms: newBooking.roomDetails,
// //         moveInDate: newBooking.moveInDate.toISOString().split('T')[0],
// //         monthlyRent: newBooking.pricing.monthlyRent,
// //         securityDeposit: newBooking.pricing.securityDeposit,
// //         advanceAmount: newBooking.pricing.advanceAmount,
// //         total: newBooking.pricing.monthlyRent + newBooking.pricing.securityDeposit + newBooking.pricing.advanceAmount,
// //         status: newBooking.bookingStatus
// //       }
// //     });

// //   } catch (error) {
// //     await session.abortTransaction();
// //     session.endSession();
    
// //     console.error('Booking error:', error);

// //     if (error.name === 'ValidationError') {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Validation failed',
// //         errors: Object.values(error.errors).map(err => err.message)
// //       });
// //     }

// //     return res.status(500).json({
// //       success: false,
// //       message: 'Internal server error'
// //     });
// //   }
// // };



// export const cancelBooking = async (req, res) => {
//   try {
//     const { bookingId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(bookingId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid booking ID format'
//       });
//     }

//     const booking = await Booking.findById(bookingId);

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: 'Booking not found'
//       });
//     }

//     // Check if booking can be cancelled (e.g., not already cancelled or checked-in)
//     if (booking.bookingStatus === 'cancelled') {
//       return res.status(400).json({
//         success: false,
//         message: 'Booking is already cancelled'
//       });
//     }

//     if (booking.bookingStatus === 'checked_in') {
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot cancel booking after check-in'
//       });
//     }

//     // Update booking status to cancelled
//     const updatedBooking = await Booking.findByIdAndUpdate(
//       bookingId,
//       {
//         bookingStatus: 'cancelled',
//         'paymentInfo.paymentStatus': 'refund_pending' // Or handle refund logic
//       },
//       { new: true }
//     ).populate('propertyId', 'name');

//     // TODO: Add refund logic here if needed

//     res.status(200).json({
//       success: true,
//       message: 'Booking cancelled successfully',
//       booking: updatedBooking
//     });

//   } catch (error) {
//     console.error('Cancel booking error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to cancel booking',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Other controller functions (getBookingsByProperty, approveBooking, rejectBooking, getallBookings)
// // ... keep the existing implementations for these functions

// // Other controller functions (getBookingsByProperty, approveBooking, rejectBooking, getallBookings)
// // ... keep the existing implementations for these functions
// // export const getBookingsByProperty = async (req, res) => {
// //   try {
// //     console.log('User from request:', req.user);
    
// //     if (!req.user || !req.user.id) {
// //       return res.status(401).json({
// //         success: false,
// //         message: 'Authentication required'
// //       });
// //     }

// //     // Get clientId based on user role
// //     let clientId;
// //     if (req.user.role === 'client') {
// //       // If user is a client, use their clientId
// //       clientId = req.user.clientId;
// //     } else if (req.user.role === 'user') {
// //       // If user is a regular user, find their client ID from properties
// //       // This assumes users can have properties too
// //       clientId = req.user.clientId;
// //     } else {
// //       return res.status(403).json({
// //         success: false,
// //         message: 'Access denied. Client role required.'
// //       });
// //     }

// //     if (!clientId) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Client ID not found for this user'
// //       });
// //     }

// //     console.log('Fetching properties for clientId:', clientId);

// //     // Find all property IDs owned by this client
// //     const properties = await Property.find({ 
// //       $or: [
// //         { clientId: clientId },
// //         { userId: req.user.id } // Also include properties where user is owner
// //       ]
// //     }).select('_id').lean();

// //     const propertyIds = properties.map((p) => p._id);

// //     if (propertyIds.length === 0) {
// //       return res.status(200).json({
// //         success: true,
// //         bookings: [],
// //         message: 'No properties found for this client/user'
// //       });
// //     }

// //     console.log('Found property IDs:', propertyIds);

// //     // Fetch bookings for the client's properties
// //     const bookings = await Booking.find({ propertyId: { $in: propertyIds } })
// //       .populate('userId', 'name email phone clientId profileImage') // Who booked
// //       .populate('propertyId', 'name locality city')    // Property info
// //       .populate('approvedBy', 'name')                  // Client who approved
// //       .sort({ createdAt: -1 });

// //     console.log('Found bookings:', bookings.length);

// //     const formattedBookings = bookings.map((booking) => ({
// //       id: booking._id,
// //       _id: booking._id,
// //       user: booking.userId ? {
// //         _id: booking.userId._id,
// //         name: booking.userId.name,
// //         email: booking.userId.email,
// //         phone: booking.userId.phone,
// //         clientId: booking.userId.clientId,
// //         profileImage: booking.userId.profileImage
// //       } : null,
// //       property: booking.propertyId ? {
// //         _id: booking.propertyId._id,
// //         name: booking.propertyId.name,
// //         locality: booking.propertyId.locality,
// //         city: booking.propertyId.city
// //       } : null,
// //       roomType: booking.roomType?.name || 'N/A',
// //       roomNumber: booking.roomDetails?.[0]?.roomNumber || 'N/A',
// //       floor: booking.roomDetails?.[0]?.floor || 'N/A',
// //       moveInDate: booking.moveInDate,
// //       bookingStatus: booking.bookingStatus,
// //       paymentStatus: booking.paymentInfo?.paymentStatus || 'pending',
// //       pricing: booking.pricing,
// //       approvedBy: booking.approvedBy?.name || null,
// //       approvedAt: booking.approvedAt || null,
// //       roomDetails: booking.roomDetails,
// //       createdAt: booking.createdAt
// //     }));

// //     return res.status(200).json({
// //       success: true,
// //       count: formattedBookings.length,
// //       bookings: formattedBookings,
// //     });
// //   } catch (error) {
// //     console.error('Get bookings by property error:', error);
// //     return res.status(500).json({
// //       success: false,
// //       message: 'Internal server error',
// //       error: process.env.NODE_ENV === 'development' ? error.message : undefined
// //     });
// //   }
// // };

// export const getBookingsByProperty = async (req, res) => {
//   try {
//     console.log('User from request:', req.user);
    
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         success: false,
//         message: 'Authentication required'
//       });
//     }

//     // Only clients should be able to access this endpoint
//     if (req.user.role !== 'client') {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied. Client role required.'
//       });
//     }

//     // Get clientId from the client user
//     const clientId = req.user.clientId || req.user.id;

//     if (!clientId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Client ID not found'
//       });
//     }

//     console.log('Fetching properties for clientId:', clientId);

//     // Find all property IDs owned by this client
//     const properties = await Property.find({ 
//       clientId: clientId // Only get properties that belong to this client
//     }).select('_id').lean();

//     const propertyIds = properties.map((p) => p._id);

//     if (propertyIds.length === 0) {
//       return res.status(200).json({
//         success: true,
//         bookings: [],
//         message: 'No properties found for this client'
//       });
//     }

//     console.log('Found property IDs:', propertyIds);

//     // Fetch bookings for the client's properties (bookings made by users)
//     const bookings = await Booking.find({ propertyId: { $in: propertyIds } })
//       .populate('userId', 'name email phone profileImage clientId') // User who made the booking
//       .populate('propertyId', 'name locality city')       // Property info
//       .sort({ createdAt: -1 });

//     console.log('Found bookings:', bookings.length);

//     // Manually populate approvedBy to avoid schema errors
//     const bookingsWithApprovedBy = await Promise.all(
//       bookings.map(async (booking) => {
//         let approvedByDetails = null;
//         if (booking.approvedBy) {
//           try {
//             const approvedUser = await User.findById(booking.approvedBy).select('name email phone');
//             approvedByDetails = approvedUser ? {
//               _id: approvedUser._id,
//               name: approvedUser.name,
//               email: approvedUser.email,
//               phone: approvedUser.phone
//             } : null;
//           } catch (error) {
//             console.error('Error fetching approvedBy user:', error);
//           }
//         }
//         return {
//           ...booking.toObject(),
//           approvedByDetails
//         };
//       })
//     );

//     const formattedBookings = bookingsWithApprovedBy.map((booking) => ({
//       id: booking._id,
//       _id: booking._id,
//       user: booking.userId ? {
//         _id: booking.userId._id,
//         name: booking.userId.name,
//         email: booking.userId.email,
//         phone: booking.userId.phone,
//         clientId: booking.userId.clientId,
//         profileImage: booking.userId.profileImage
//       } : null,
//       property: booking.propertyId ? {
//         _id: booking.propertyId._id,
//         name: booking.propertyId.name,
//         locality: booking.propertyId.locality,
//         city: booking.propertyId.city
//       } : null,
//       roomType: booking.roomType?.name || 'N/A',
//       roomNumber: booking.roomDetails?.[0]?.roomNumber || 'N/A',
//       floor: booking.roomDetails?.[0]?.floor || 'N/A',
//       moveInDate: booking.moveInDate,
//       bookingStatus: booking.bookingStatus,
//       paymentStatus: booking.paymentInfo?.paymentStatus || 'pending',
//       pricing: booking.pricing,
//       approvedBy: booking.approvedByDetails, // Use manually populated data
//       approvedAt: booking.approvedAt || null,
//       roomDetails: booking.roomDetails,
//       createdAt: booking.createdAt
//     }));

//     return res.status(200).json({
//       success: true,
//       count: formattedBookings.length,
//       bookings: formattedBookings,
//     });
//   } catch (error) {
//     console.error('Get bookings by property error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };
// //get bookings of user
// // Get bookings of user (for regular users to see their own bookings)
// export const getUserBookings = async (req, res) => {  
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ 
//         success: false, 
//         message: 'Authentication required' 
//       });
//     }

//     console.log('Fetching bookings for user:', req.user.id);

//     // Fetch bookings without populating approvedBy to avoid schema errors
//     const bookings = await Booking.find({ userId: req.user.id })
//       .populate('propertyId', 'name locality city images')
//       .sort({ createdAt: -1 });

//     // Manually populate approvedBy if needed
//     const bookingsWithApprovedBy = await Promise.all(
//       bookings.map(async (booking) => {
//         let approvedByName = null;
//         if (booking.approvedBy) {
//           try {
//             // Try to find as User first, then as Client if needed
//             const approvedUser = await User.findById(booking.approvedBy).select('name');
//             if (approvedUser) {
//               approvedByName = approvedUser.name;
//             } else {
//               // If not found in User model, try Client model (if you have one)
//               // const approvedClient = await Client.findById(booking.approvedBy).select('name');
//               // approvedByName = approvedClient?.name || null;
//             }
//           } catch (error) {
//             console.error('Error fetching approvedBy:', error);
//           }
//         }
//         return {
//           ...booking.toObject(),
//           approvedByName
//         };
//       })
//     );

//     const formattedBookings = bookingsWithApprovedBy.map(booking => ({
//       id: booking._id,
//       _id: booking._id,
//       property: booking.propertyId ? {
//         _id: booking.propertyId._id,
//         name: booking.propertyId.name,
//         locality: booking.propertyId.locality,
//         city: booking.propertyId.city,
//         images: booking.propertyId.images || []
//       } : null,
//       roomType: booking.roomType?.name || 'N/A',
//       roomNumber: booking.roomDetails?.[0]?.roomNumber || 'N/A',
//       floor: booking.roomDetails?.[0]?.floor || 'N/A',
//       moveInDate: booking.moveInDate,
//       bookingStatus: booking.bookingStatus,
//       paymentStatus: booking.paymentInfo?.paymentStatus || 'pending',
//       pricing: booking.pricing,
//       approvedBy: booking.approvedByName || null, // Use manually populated name
//       approvedAt: booking.approvedAt || null,
//       roomDetails: booking.roomDetails,
//       createdAt: booking.createdAt
//     }));

//     return res.status(200).json({
//       success: true,
//       count: formattedBookings.length,
//       bookings: formattedBookings
//     });
//   } catch (error) {
//     console.error('Get user bookings error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get single booking by ID
// export const getBookingById = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
    
//     if (!mongoose.Types.ObjectId.isValid(bookingId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid booking ID format'
//       });
//     }
    
//     const booking = await Booking.findById(bookingId)
//       .populate('userId', 'name email phone clientId profileImage')
//       .populate('propertyId', 'name locality city images')
//       .populate('approvedBy', 'name');
    
//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: 'Booking not found'
//       });
//     }
    
//     // Check if user has permission to view this booking
//     if (req.user.role === 'user' && booking.userId._id.toString() !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to view this booking'
//       });
//     }
    
//     // For clients, check if they own the property
//     if (req.user.role === 'client') {
//       const property = await Property.findById(booking.propertyId);
//       if (!property || property.clientId.toString() !== req.user.clientId) {
//         return res.status(403).json({
//           success: false,
//           message: 'Not authorized to view this booking'
//         });
//       }
//     }
    
//     const formattedBooking = {
//       id: booking._id,
//       user: booking.userId ? {
//         _id: booking.userId._id,
//         name: booking.userId.name,
//         email: booking.userId.email,
//         phone: booking.userId.phone,
//         clientId: booking.userId.clientId,
//         profileImage: booking.userId.profileImage
//       } : null,
//       property: booking.propertyId ? {
//         _id: booking.propertyId._id,
//         name: booking.propertyId.name,
//         locality: booking.propertyId.locality,
//         city: booking.propertyId.city,
//         images: booking.propertyId.images || []
//       } : null,
//       roomType: booking.roomType?.name || 'N/A',
//       roomDetails: booking.roomDetails,
//       moveInDate: booking.moveInDate,
//       moveOutDate: booking.moveOutDate,
//       bookingStatus: booking.bookingStatus,
//       paymentStatus: booking.paymentInfo?.paymentStatus || 'pending',
//       pricing: booking.pricing,
//       vacateRequest: booking.vacateRequest,
//       outstandingAmount: booking.outstandingAmount,
//       approvedBy: booking.approvedBy?.name || null,
//       approvedAt: booking.approvedAt || null,
//       createdAt: booking.createdAt
//     };
    
//     return res.status(200).json({
//       success: true,
//       booking: formattedBooking
//     });
    
//   } catch (error) {
//     console.error('Get booking by ID error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// export const approveBooking = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ success: false, message: 'Authentication required' });
//     }

//     // Only clients can approve bookings
//     if (req.user.role !== 'client') {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'Only clients can approve bookings' 
//       });
//     }

//     const { bookingId } = req.params;
    
//     // First, check if the booking belongs to one of the client's properties
//     const booking = await Booking.findById(bookingId).populate('propertyId');
    
//     if (!booking) {
//       return res.status(404).json({ success: false, message: 'Booking not found' });
//     }

//     // Verify that the client owns this property
//     const clientProperties = await Property.find({ 
//       clientId: req.user.clientId || req.user.id 
//     }).select('_id');

//     const clientPropertyIds = clientProperties.map(p => p._id.toString());
    
//     if (!clientPropertyIds.includes(booking.propertyId._id.toString())) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'You can only approve bookings for your own properties' 
//       });
//     }

//     // Update the booking status
//     const updatedBooking = await Booking.findByIdAndUpdate(
//       bookingId,
//       { 
//         bookingStatus: 'approved',
//         approvedBy: req.user.id, // This should be a Client ID if you have Client model
//         approvedAt: new Date() 
//       },
//       { new: true }
//     )
//     .populate('userId', 'name email phone')
//     .populate('propertyId', 'name locality city');

//     return res.status(200).json({
//       success: true,
//       message: 'Booking approved successfully',
//       booking: {
//         id: updatedBooking._id,
//         user: updatedBooking.userId ? {
//           name: updatedBooking.userId.name,
//           email: updatedBooking.userId.email,
//           phone: updatedBooking.userId.phone
//         } : null,
//         property: updatedBooking.propertyId ? {
//           name: updatedBooking.propertyId.name,
//           locality: updatedBooking.propertyId.locality,
//           city: updatedBooking.propertyId.city
//         } : null,
//         roomType: updatedBooking.roomType?.name,
//         moveInDate: updatedBooking.moveInDate,
//         bookingStatus: updatedBooking.bookingStatus,
//         paymentStatus: updatedBooking.paymentInfo?.paymentStatus,
//         approvedAt: updatedBooking.approvedAt
//       }
//     });

//   } catch (error) {
//     console.error('Approval error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// export const rejectBooking = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ success: false, message: 'Authentication required' });
//     }

//     const { bookingId } = req.params;
//     const { reason } = req.body;

//     if (!reason || reason.trim() === '') {
//       return res.status(400).json({ success: false, message: 'Rejection reason is required' });
//     }

//     const booking = await Booking.findByIdAndUpdate(
//       bookingId,
//       { 
//         bookingStatus: 'rejected',
//         rejectedBy: req.user.id,
//         rejectionReason: reason,
//         approvedAt: new Date() 
//       },
//       { new: true }
//     ).populate('userId', 'name email phone');

//     if (!booking) {
//       return res.status(404).json({ success: false, message: 'Booking not found' });
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Booking rejected successfully',
//       booking
//     });

//   } catch (error) {
//     console.error('Rejection error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // export const getallBookings = async (req, res) => {
// //   try {
// //     const bookings = await Booking.find({})
// //       .populate('userId', 'name email phone clientId')
// //       .populate('propertyId', 'name locality city')
// //       .sort({ createdAt: -1 });

// //     const formattedBookings = bookings.map(booking => ({
// //       id: booking._id,
// //       user: booking.userId ? {
// //         name: booking.userId.name,
// //         email: booking.userId.email,
// //         phone: booking.userId.phone,
// //         clientId: booking.userId.clientId,
// //       } : null,
// //       property: booking.propertyId ? {
// //         name: booking.propertyId.name,
// //         locality: booking.propertyId.locality,
// //         city: booking.propertyId.city
// //       } : null,
// //       roomType: booking.roomType?.name || 'N/A',
// //       roomNumber: booking.room?.number || 'N/A',
// //       floor: booking.room?.floor || 'N/A',
// //       moveInDate: booking.moveInDate,
// //       moveOutDate: booking.moveOutDate,
// //       status: booking.bookingStatus,
// //       paymentStatus: booking.paymentStatus,
// //       pricing: booking.pricing,
// //       approvedBy: booking.approvedBy?.name || null,
// //       approvedAt: booking.approvedAt || null
// //     }));

// //     return res.status(200).json({
// //       success: true,
// //       count: formattedBookings.length,
// //       bookings: formattedBookings
// //     });

// //   } catch (error) {
// //     console.error('Controller Error:', error);
// //     return res.status(500).json({
// //       success: false,
// //       message: 'Internal server error',
// //       error: error.message
// //     });
// //   }
// // };

// export const getallBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find({})
//       .populate('userId', 'name email phone clientId')
//       .populate('propertyId', 'name locality city')
//       .sort({ createdAt: -1 });

//     const formattedBookings = bookings.map(booking => {
//       // Get all room numbers, floors, and beds
//       const roomNumbers = booking.roomDetails?.map(room => room.roomNumber).filter(Boolean) || [];
//       const floors = booking.roomDetails?.map(room => room.floor).filter(Boolean) || [];
//       const beds = booking.roomDetails?.map(room => room.bed).filter(Boolean) || [];
      
//       // Create unique arrays
//       const uniqueRoomNumbers = [...new Set(roomNumbers)];
//       const uniqueFloors = [...new Set(floors)];
//       const uniqueBeds = [...new Set(beds)];

//       return {
//         id: booking._id,
//         user: booking.userId ? {
//           name: booking.userId.name,
//           email: booking.userId.email,
//           phone: booking.userId.phone,
//           clientId: booking.userId.clientId,
//         } : null,
//         property: booking.propertyId ? {
//           name: booking.propertyId.name,
//           locality: booking.propertyId.locality,
//           city: booking.propertyId.city
//         } : null,
//         roomType: booking.roomType?.name || 'N/A',
//         // Display first room or summary for multiple rooms
//         roomNumber: uniqueRoomNumbers.length > 0 ? 
//                    (uniqueRoomNumbers.length === 1 ? uniqueRoomNumbers[0] : `${uniqueRoomNumbers.length} rooms`) : 'N/A',
//         floor: uniqueFloors.length > 0 ? 
//               (uniqueFloors.length === 1 ? uniqueFloors[0] : `${uniqueFloors.length} floors`) : 'N/A',
//         bed: uniqueBeds.length > 0 ? 
//             (uniqueBeds.length === 1 ? uniqueBeds[0] : `${uniqueBeds.length} beds`) : 'N/A',
//         // Include all room details
//         roomDetails: booking.roomDetails || [],
//         totalRooms: booking.roomDetails?.length || 0,
//         moveInDate: booking.moveInDate,
//         moveOutDate: booking.moveOutDate,
//         status: booking.bookingStatus,
//         paymentStatus: booking.paymentInfo?.paymentStatus || 'pending',
//         pricing: booking.pricing,
//         approvedBy: booking.approvedBy?.name || null,
//         approvedAt: booking.approvedAt || null
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       count: formattedBookings.length,
//       bookings: formattedBookings
//     });

//   } catch (error) {
//     console.error('Controller Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };


// // Get all available beds for a property (regardless of room type)
// // export const getAllAvailableBeds = async (req, res) => {
// //   try {
// //     const { propertyId } = req.params;
// //     const { date } = req.query;
    
// //     if (!propertyId) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'propertyId is required parameter'
// //       });
// //     }
    
// //     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Invalid propertyId format'
// //       });
// //     }
    
// //     const checkDate = date ? new Date(date) : new Date();
// //     checkDate.setUTCHours(0, 0, 0, 0);
    
// //     if (isNaN(checkDate.getTime())) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Invalid date format. Use YYYY-MM-DD.'
// //       });
// //     }
    
// //     // Get room configuration
// //     const roomConfig = await Room.findOne({ propertyId });
// //     if (!roomConfig) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Room configuration not found for this property'
// //       });
// //     }
    
// //     // Find all bookings (including approved ones)
// //     const bookings = await Booking.find({
// //       propertyId,
// //       bookingStatus: { $nin: ['cancelled', 'rejected'] },
// //       $or: [
// //         {
// //           moveInDate: { $lte: checkDate },
// //           moveOutDate: { $gte: checkDate }
// //         },
// //         {
// //           moveInDate: checkDate
// //         }
// //       ]
// //     });
    
// //     // Extract all booked room identifiers with their status
// //     const bookedBeds = [];
// //     bookings.forEach(booking => {
// //       booking.roomDetails.forEach(room => {
// //         bookedBeds.push({
// //           roomIdentifier: room.roomIdentifier,
// //           status: booking.bookingStatus,
// //           bookingId: booking._id
// //         });
// //       });
// //     });
    
// //     // Get all available beds with status
// //     const bedsByFloor = {};
// //     let totalBeds = 0;
// //     let availableBeds = 0;
// //     let bookedBedsCount = 0;
// //     let approvedBedsCount = 0;
    
// //     for (const floorConfig of roomConfig.floorConfig.floors) {
// //       const floorBeds = [];
      
// //       // Check if rooms is a Map or regular object
// //       let rooms;
// //       if (floorConfig.rooms instanceof Map) {
// //         // Convert Map to object
// //         rooms = Object.fromEntries(floorConfig.rooms);
// //       } else {
// //         rooms = floorConfig.rooms;
// //       }
      
// //       for (const [roomNumber, beds] of Object.entries(rooms)) {
// //         // Get the actual room type from room configuration instead of inferring from bed count
// //         let roomType = 'double'; // default fallback
        
// //         // Try to find room type from room configuration
// //         const roomTypeConfig = roomConfig.roomTypes.find(rt => {
// //           // Check if this room matches the room type based on bed count
// //           return rt.capacity === beds.length;
// //         });
        
// //         if (roomTypeConfig) {
// //           roomType = roomTypeConfig.type;
// //         } else {
// //           // Fallback: determine room type based on bed count
// //           if (beds.length === 1) roomType = 'single';
// //           else if (beds.length === 3) roomType = 'triple';
// //           else if (beds.length === 4) roomType = 'four';
// //           else if (beds.length === 5) roomType = 'five';
// //           else if (beds.length === 6) roomType = 'six';
// //         }
        
// //         for (const bed of beds) {
// //           totalBeds++;
          
// //           // Use the actual bed name (with spaces) for the identifier
// //           const roomIdentifier = `${roomType}-${roomNumber}-${bed}`;
          
// //           // Check if this bed is booked
// //           const bookingInfo = bookedBeds.find(b => b.roomIdentifier === roomIdentifier);
          
// //           let status = 'available';
// //           if (bookingInfo) {
// //             if (bookingInfo.status === 'approved' || bookingInfo.status === 'confirmed') {
// //               status = 'approved';
// //               approvedBedsCount++;
// //             } else {
// //               status = 'booked';
// //               bookedBedsCount++;
// //             }
// //           } else {
// //             availableBeds++;
// //           }
          
// //           floorBeds.push({
// //             _id: new mongoose.Types.ObjectId(),
// //             roomNumber,
// //             bedName: bed, // Keep the actual bed name with spaces
// //             bedLetter: normalizeBedName(bed), // Normalized version for reference
// //             floor: floorConfig.floor,
// //             roomIdentifier,
// //             roomType: roomType,
// //             status: status,
// //             available: status === 'available',
// //             bookingId: bookingInfo?.bookingId || null
// //           });
// //         }
// //       }
      
// //       if (floorBeds.length > 0) {
// //         bedsByFloor[floorConfig.floor] = floorBeds;
// //       }
// //     }
    
// //     // Verify counts
// //     console.log('Bed Statistics:', {
// //       totalBeds,
// //       availableBeds,
// //       bookedBeds: bookedBedsCount,
// //       approvedBeds: approvedBedsCount,
// //       calculatedTotal: availableBeds + bookedBedsCount + approvedBedsCount
// //     });
    
// //     return res.status(200).json({
// //       success: true,
// //       bedsByFloor,
// //       checkDate: checkDate.toISOString().split('T')[0],
// //       statistics: {
// //         totalBeds,
// //         availableBeds,
// //         bookedBeds: bookedBedsCount,
// //         approvedBeds: approvedBedsCount
// //       }
// //     });
    
// //   } catch (error) {
// //     console.error('Get all available beds error:', error);
// //     return res.status(500).json({
// //       success: false,
// //       message: 'Internal server error'
// //     });
// //   }
// // };


// // Get available rooms and beds by floor for a property
// export const getAvailableRoomsAndBeds = async (req, res) => {
//   try {
//     const { propertyId } = req.params; // Get from URL parameter
//     const { date } = req.query; // Get from query parameter
    
//     if (!propertyId) {
//       return res.status(400).json({
//         success: false,
//         message: 'propertyId is required parameter'
//       });
//     }
    
//     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid propertyId format'
//       });
//     }
    
//     const checkDate = date ? new Date(date) : new Date();
//     checkDate.setUTCHours(0, 0, 0, 0);
    
//     if (isNaN(checkDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid date format. Use YYYY-MM-DD.'
//       });
//     }
    
//     // Get property details
//     const property = await Property.findById(propertyId);
//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: 'Property not found'
//       });
//     }
    
//     // Get room configuration
//     const roomConfig = await Room.findOne({ propertyId });
//     if (!roomConfig) {
//       return res.status(404).json({
//         success: false,
//         message: 'Room configuration not found for this property'
//       });
//     }
    
//     // Find all bookings that conflict with the selected date
//     const conflictingBookings = await Booking.find({
//       propertyId,
//       bookingStatus: { $nin: ['cancelled', 'checked_out', 'rejected'] },
//       $or: [
//         {
//           moveInDate: { $lte: checkDate },
//           moveOutDate: { $gte: checkDate }
//         },
//         {
//           moveInDate: checkDate
//         }
//       ]
//     });
    
//     // Extract unavailable room identifiers
//     const unavailableBeds = conflictingBookings.flatMap(booking => 
//       booking.roomDetails.map(room => room.roomIdentifier)
//     );
    
//     // Structure response by floor and room type
//     const availabilityByFloor = {};
    
//     for (const floorConfig of roomConfig.floorConfig.floors) {
//       const floorNumber = floorConfig.floor;
//       availabilityByFloor[floorNumber] = {};
      
//       // Initialize room types for this floor
//       roomConfig.roomTypes.forEach(roomType => {
//         availabilityByFloor[floorNumber][roomType.type] = {
//           label: roomType.label,
//           capacity: roomType.capacity,
//           price: roomType.price,
//           deposit: roomType.deposit,
//           availableBeds: 0,
//           totalBeds: 0,
//           rooms: []
//         };
//       });
      
//       // Process each room on this floor
//       for (const [roomNumber, beds] of Object.entries(floorConfig.rooms)) {
//         const roomData = {
//           roomNumber,
//           beds: [],
//           availableBeds: 0,
//           totalBeds: beds.length
//         };
        
//         // Process each bed in the room
//         for (const bed of beds) {
//           // Determine room type from bed configuration
//           let roomType = 'double'; // default
//           if (beds.length === 1) roomType = 'single';
//           else if (beds.length === 3) roomType = 'triple';
//           else if (beds.length === 4) roomType = 'quad';
//           else if (beds.length === 5) roomType = 'quint';
//           else if (beds.length === 6) roomType = 'hex';
          
//           const roomIdentifier = `${roomType}-${roomNumber}-${normalizeBedName(bed)}`;
//           const isAvailable = !unavailableBeds.includes(roomIdentifier);
          
//           const bedData = {
//             bedName: bed,
//             bedLetter: normalizeBedName(bed),
//             roomIdentifier,
//             available: isAvailable,
//             roomType
//           };
          
//           roomData.beds.push(bedData);
//           if (isAvailable) {
//             roomData.availableBeds++;
            
//             // Update floor-level statistics
//             if (availabilityByFloor[floorNumber][roomType]) {
//               availabilityByFloor[floorNumber][roomType].availableBeds++;
//               availabilityByFloor[floorNumber][roomType].totalBeds++;
//             }
//           } else if (availabilityByFloor[floorNumber][roomType]) {
//             availabilityByFloor[floorNumber][roomType].totalBeds++;
//           }
//         }
        
//         // Add room to appropriate room type category
//         if (roomData.beds.length > 0) {
//           const primaryRoomType = roomData.beds[0].roomType;
//           if (availabilityByFloor[floorNumber][primaryRoomType]) {
//             availabilityByFloor[floorNumber][primaryRoomType].rooms.push(roomData);
//           }
//         }
//       }
//     }
    
//     return res.status(200).json({
//       success: true,
//       property: {
//         id: property._id,
//         name: property.name,
//         locality: property.locality,
//         city: property.city
//       },
//       checkDate: checkDate.toISOString().split('T')[0],
//       availabilityByFloor,
//       summary: {
//         totalAvailableBeds: Object.values(availabilityByFloor).reduce((total, floor) => {
//           return total + Object.values(floor).reduce((floorTotal, roomType) => {
//             return floorTotal + roomType.availableBeds;
//           }, 0);
//         }, 0),
//         totalBeds: Object.values(availabilityByFloor).reduce((total, floor) => {
//           return total + Object.values(floor).reduce((floorTotal, roomType) => {
//             return floorTotal + roomType.totalBeds;
//           }, 0);
//         }, 0)
//       }
//     });
    
//   } catch (error) {
//     console.error('Get available rooms and beds error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// // Get available beds by specific room type
// // Get available beds by specific room type with booking status
// export const getAvailableBedsByRoomType = async (req, res) => {
//   try {
//     const { propertyId } = req.params;
//     const { roomType, date } = req.query;
    
//     if (!propertyId || !roomType) {
//       return res.status(400).json({
//         success: false,
//         message: 'propertyId and roomType are required parameters'
//       });
//     }
    
//     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid propertyId format'
//       });
//     }
    
//     const checkDate = date ? new Date(date) : new Date();
//     checkDate.setUTCHours(0, 0, 0, 0);
    
//     if (isNaN(checkDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid date format. Use YYYY-MM-DD.'
//       });
//     }
    
//     // Get room configuration
//     const roomConfig = await Room.findOne({ propertyId });
//     if (!roomConfig) {
//       return res.status(404).json({
//         success: false,
//         message: 'Room configuration not found for this property'
//       });
//     }
    
//     // Find all bookings (including approved ones)
//     const bookings = await Booking.find({
//       propertyId,
//       bookingStatus: { $nin: ['cancelled', 'rejected'] },
//       $or: [
//         {
//           moveInDate: { $lte: checkDate },
//           moveOutDate: { $gte: checkDate }
//         },
//         {
//           moveInDate: checkDate
//         }
//       ]
//     });
    
//     // Extract all booked room identifiers with their status
//     const bookedBeds = [];
//     bookings.forEach(booking => {
//       booking.roomDetails.forEach(room => {
//         bookedBeds.push({
//           roomIdentifier: room.roomIdentifier,
//           status: booking.bookingStatus,
//           bookingId: booking._id
//         });
//       });
//     });
    
//     // Get available beds for the specified room type with status
//     const bedsByFloor = {};
//     let totalBeds = 0;
//     let availableBeds = 0;
//     let bookedBedsCount = 0;
//     let approvedBedsCount = 0;
    
//     for (const floorConfig of roomConfig.floorConfig.floors) {
//       const floorBeds = [];
      
//       for (const [roomNumber, beds] of Object.entries(floorConfig.rooms)) {
//         // Check if this room matches the requested room type based on bed count
//         let matchesRoomType = false;
        
//         if (roomType === 'single' && beds.length === 1) matchesRoomType = true;
//         else if (roomType === 'double' && beds.length === 2) matchesRoomType = true;
//         else if (roomType === 'triple' && beds.length === 3) matchesRoomType = true;
//         else if (roomType === 'quad' && beds.length === 4) matchesRoomType = true;
//         else if (roomType === 'quint' && beds.length === 5) matchesRoomType = true;
//         else if (roomType === 'hex' && beds.length === 6) matchesRoomType = true;
        
//         if (matchesRoomType) {
//           for (const bed of beds) {
//             totalBeds++;
//             const roomIdentifier = `${roomType}-${roomNumber}-${normalizeBedName(bed)}`;
            
//             // Check if this bed is booked
//             const bookingInfo = bookedBeds.find(b => b.roomIdentifier === roomIdentifier);
            
//             let status = 'available';
//             if (bookingInfo) {
//               if (bookingInfo.status === 'approved' || bookingInfo.status === 'confirmed') {
//                 status = 'approved';
//                 approvedBedsCount++;
//               } else {
//                 status = 'booked';
//                 bookedBedsCount++;
//               }
//             } else {
//               availableBeds++;
//             }
            
//             floorBeds.push({
//               _id: new mongoose.Types.ObjectId(),
//               roomNumber,
//               bedLetter: normalizeBedName(bed),
//               actualBedName: bed,
//               floor: floorConfig.floor,
//               roomIdentifier,
//               status: status,
//               available: status === 'available',
//               bookingId: bookingInfo?.bookingId || null
//             });
//           }
//         }
//       }
      
//       if (floorBeds.length > 0) {
//         bedsByFloor[floorConfig.floor] = floorBeds;
//       }
//     }
    
//     return res.status(200).json({
//       success: true,
//       roomType,
//       bedsByFloor,
//       checkDate: checkDate.toISOString().split('T')[0],
//       statistics: {
//         totalBeds,
//         availableBeds,
//         bookedBeds: bookedBedsCount,
//         approvedBeds: approvedBedsCount
//       }
//     });
    
//   } catch (error) {
//     console.error('Get available beds by room type error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };




// import mongoose from 'mongoose';
// import Booking from '../models/Booking.js';
// import Property from '../models/Property.js';
// import Room from '../models/Room.js';
// import User from '../models/User.js';
// import Admin from '../models/Admin.js';
// import { NotificationService } from '../controllers/notificationController.js'; // Add this import



// // Helper function to normalize bed names (remove spaces)
// const normalizeBedName = (bedName) => {
//   return bedName.replace(/\s+/g, '');
// };

// // Helper function to create consistent room identifier
// const createRoomIdentifier = (sharingType, roomNumber, bed) => {
//   return `${sharingType}-${roomNumber}-${normalizeBedName(bed)}`;
// };

// // Helper function to calculate days between two dates
// const calculateDaysBetween = (startDate, endDate) => {
//   const start = new Date(startDate);
//   const end = new Date(endDate);
//   const timeDiff = end.getTime() - start.getTime();
//   return Math.ceil(timeDiff / (1000 * 3600 * 24));
// };

// // Room availability check function
// const checkRoomAvailabilityBeforeBooking = async (propertyId, selectedRooms, moveInDate, endDate, session) => {
//   const unavailableRooms = [];

//   for (const roomIdentifier of selectedRooms) {
//     const conflict = await Booking.findOne({
//       propertyId,
//       'roomDetails.roomIdentifier': roomIdentifier,
//       bookingStatus: { $nin: ['cancelled', 'checked_out', 'rejected'] },
//       $or: [
//         { 
//           moveInDate: { $lt: endDate }, 
//           moveOutDate: { $gt: moveInDate } 
//         }
//       ]
//     }).session(session);

//     if (conflict) {
//       unavailableRooms.push(roomIdentifier);
//     }
//   }

//   return {
//     available: unavailableRooms.length === 0,
//     unavailableRooms
//   };
// };

// // Check room availability for date range
// export const checkRoomAvailability = async (req, res) => {
//   try {
//     const { propertyId, startDate, endDate } = req.body;
    
//     if (!propertyId || !startDate) {
//       return res.status(400).json({
//         success: false,
//         message: 'propertyId and startDate are required parameters'
//       });
//     }
    
//     const parsedStartDate = new Date(startDate);
//     parsedStartDate.setUTCHours(0, 0, 0, 0);
    
//     let parsedEndDate;
//     if (endDate) {
//       parsedEndDate = new Date(endDate);
//       parsedEndDate.setUTCHours(0, 0, 0, 0);
//     } else {
//       parsedEndDate = new Date(parsedStartDate);
//       parsedEndDate.setDate(parsedStartDate.getDate() + 1);
//     }
    
//     // Find conflicting bookings
//     const conflictingBookings = await Booking.find({
//       propertyId,
//       bookingStatus: { $nin: ['cancelled', 'checked_out', 'rejected'] },
//       $or: [
//         { moveInDate: { $lte: parsedStartDate }, moveOutDate: { $gte: parsedStartDate } },
//         { moveInDate: { $gte: parsedStartDate, $lte: parsedEndDate } }
//       ]
//     });
    
//     const unavailableRooms = conflictingBookings.flatMap(booking => 
//       booking.roomDetails.map(room => room.roomIdentifier)
//     );
    
//     return res.status(200).json({
//       success: true,
//       unavailableRooms,
//       startDate: parsedStartDate.toISOString().split('T')[0],
//       endDate: parsedEndDate.toISOString().split('T')[0]
//     });
    
//   } catch (error) {
//     console.error('Availability check error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// // Create booking with transfer-ready structure
// export const createBooking = async (req, res) => {
//   const session = await mongoose.startSession();
//   let transactionCommitted = false;
  
//   try {
//     await session.startTransaction();
    
//     console.log('📦 Creating booking...', req.body);

//     if (!req.user || !req.user.id) {
//       await session.abortTransaction();
//       await session.endSession();
//       return res.status(401).json({
//         success: false,
//         message: 'Authentication required'
//       });
//     }

//     const {
//       propertyId,
//       roomType,
//       selectedRooms,
//       moveInDate,
//       endDate,
//       durationType,
//       durationDays,
//       durationMonths,
//       personCount,
//       customerDetails,
//       pricing
//     } = req.body;

//     console.log('📋 Received booking data:', {
//       propertyId,
//       roomType,
//       selectedRooms,
//       moveInDate,
//       endDate,
//       durationType,
//       user: req.user.id
//     });

//     // Validation
//     if (!propertyId || !roomType || !selectedRooms || !moveInDate) {
//       await session.abortTransaction();
//       await session.endSession();
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: propertyId, roomType, selectedRooms, moveInDate'
//       });
//     }

//     // Parse dates
//     const parsedMoveInDate = new Date(moveInDate);
//     parsedMoveInDate.setUTCHours(0, 0, 0, 0);

//     let parsedEndDate;
//     if (endDate) {
//       parsedEndDate = new Date(endDate);
//       parsedEndDate.setUTCHours(0, 0, 0, 0);
//     } else if (durationType === 'monthly' && durationMonths) {
//       parsedEndDate = new Date(parsedMoveInDate);
//       parsedEndDate.setMonth(parsedMoveInDate.getMonth() + parseInt(durationMonths));
//     } else if (durationType === 'daily' && durationDays) {
//       parsedEndDate = new Date(parsedMoveInDate);
//       parsedEndDate.setDate(parsedMoveInDate.getDate() + parseInt(durationDays));
//     } else {
//       parsedEndDate = new Date(parsedMoveInDate);
//       parsedEndDate.setMonth(parsedMoveInDate.getMonth() + 1);
//     }

//     console.log('📅 Date range:', {
//       moveIn: parsedMoveInDate,
//       moveOut: parsedEndDate
//     });

//     // Check room availability
//     const roomAvailability = await checkRoomAvailabilityBeforeBooking(
//       propertyId, 
//       selectedRooms, 
//       parsedMoveInDate,
//       parsedEndDate,
//       session
//     );

//     if (!roomAvailability.available) {
//       await session.abortTransaction();
//       await session.endSession();
//       return res.status(409).json({
//         success: false,
//         message: 'Some selected rooms are not available',
//         unavailableRooms: roomAvailability.unavailableRooms
//       });
//     }

//     // Get property and user details
//     const [property, user, roomConfig] = await Promise.all([
//       Property.findById(propertyId).session(session),
//       User.findById(req.user.id).session(session),
//       Room.findOne({ propertyId }).session(session)
//     ]);

//     if (!property) {
//       await session.abortTransaction();
//       await session.endSession();
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Property not found' 
//       });
//     }

//     if (!user) {
//       await session.abortTransaction();
//       await session.endSession();
//       return res.status(404).json({ 
//         success: false, 
//         message: 'User not found' 
//       });
//     }

//     if (!roomConfig) {
//       await session.abortTransaction();
//       await session.endSession();
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Room configuration not found for this property' 
//       });
//     }

//     const roomTypeConfig = roomConfig.roomTypes.find(rt => rt.type === roomType);
//     if (!roomTypeConfig) {
//       await session.abortTransaction();
//       await session.endSession();
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Selected room type not found in configuration' 
//       });
//     }

//     // Create room details with consistent identifiers
//     const roomDetails = selectedRooms.map(roomIdentifier => {
//       const parts = roomIdentifier.split('-');
//       if (parts.length < 3) {
//         return {
//           roomIdentifier,
//           sharingType: 'unknown',
//           floor: 1,
//           roomNumber: 'unknown',
//           bed: 'unknown'
//         };
//       }
      
//       const sharingType = parts[0];
//       const roomNumber = parts.slice(1, parts.length - 1).join('-');
//       const bed = parts[parts.length - 1];
      
//       const consistentIdentifier = createRoomIdentifier(sharingType, roomNumber, bed);
      
//       return {
//         roomIdentifier: consistentIdentifier,
//         sharingType,
//         floor: 1,
//         roomNumber,
//         bed
//       };
//     });

//     // Calculate pricing based on duration
//     let monthlyRent = roomTypeConfig.price || 0;
//     let totalRent = monthlyRent;
//     let advanceAmount = pricing?.advanceAmount || 0;
//     let securityDeposit = (roomTypeConfig.deposit || 0) * selectedRooms.length;
//     let totalAmount = pricing?.totalAmount || 0;

//     // If pricing not provided, calculate it
//     if (!pricing) {
//       switch(durationType) {
//         case 'daily':
//           const dailyRate = monthlyRent / 30;
//           totalRent = dailyRate * parseInt(durationDays || 1);
//           advanceAmount = totalRent;
//           break;
//         case 'monthly':
//           totalRent = monthlyRent * parseInt(durationMonths || 1);
//           advanceAmount = totalRent;
//           break;
//         case 'custom':
//           const daysDiff = calculateDaysBetween(parsedMoveInDate, parsedEndDate);
//           const customDailyRate = monthlyRent / 30;
//           totalRent = customDailyRate * daysDiff;
//           advanceAmount = totalRent;
//           break;
//         default:
//           advanceAmount = monthlyRent;
//       }
//       totalAmount = advanceAmount + securityDeposit;
//     }

//     console.log('💰 Pricing calculated:', {
//       monthlyRent,
//       totalRent,
//       securityDeposit,
//       advanceAmount,
//       totalAmount
//     });

//     // Create booking data
//     const bookingData = {
//       userId: req.user.id,
//       clientId: property.clientId,
//       propertyId,
//       roomType: {
//         type: roomType,
//         name: roomTypeConfig.label || roomType,
//         capacity: roomTypeConfig.capacity || 1
//       },
//       roomDetails,
//       moveInDate: parsedMoveInDate,
//       moveOutDate: parsedEndDate,
//       durationType: durationType || 'monthly',
//       durationDays: durationType === 'daily' ? parseInt(durationDays) : null,
//       durationMonths: durationType === 'monthly' ? parseInt(durationMonths) : null,
//       personCount: parseInt(personCount) || 1,
//       customerDetails: customerDetails || {},
//       pricing: {
//         monthlyRent: monthlyRent,
//         totalRent: totalRent,
//         securityDeposit: securityDeposit,
//         advanceAmount: advanceAmount,
//         totalAmount: totalAmount,
//         maintenanceFee: 0
//       },
//       paymentInfo: {
//         paymentStatus: 'pending',
//         paymentMethod: 'razorpay',
//         paidAmount: 0
//       },
//       bookingStatus: 'pending_payment',
//       transferStatus: 'manual_pending'
//     };

//     console.log('📝 Saving booking data...', bookingData);

//     const newBooking = new Booking(bookingData);
//     await newBooking.save({ session });

//      // ✅ ADD NOTIFICATION HERE - After successful booking creation
//     try {
//       await NotificationService.createBookingNotification(newBooking, 'booking_created');
//       console.log('✅ Booking creation notification created successfully');
//     } catch (notificationError) {
//       console.error('❌ Failed to create booking notification:', notificationError);
//       // Don't fail the booking if notification fails
//     }

//     await session.commitTransaction();
//     await session.endSession();

//     console.log('✅ Booking created successfully:', newBooking._id);

//     return res.status(201).json({
//       success: true,
//       message: 'Booking created successfully! Payment pending.',
//       booking: {
//         id: newBooking._id,
//         propertyId: property._id,
//         propertyName: property.name,
//         roomType: newBooking.roomType.name,
//         rooms: newBooking.roomDetails,
//         moveInDate: newBooking.moveInDate,
//         moveOutDate: newBooking.moveOutDate,
//         durationType: newBooking.durationType,
//         durationDays: newBooking.durationDays,
//         durationMonths: newBooking.durationMonths,
//         totalAmount: newBooking.pricing.totalAmount,
//         status: newBooking.bookingStatus
//       }
//     });

//   } catch (error) {
//     // Safe transaction cleanup
//     try {
//       if (session.inTransaction()) {
//         await session.abortTransaction();
//       }
//       await session.endSession();
//     } catch (sessionError) {
//       console.error('Session cleanup error:', sessionError);
//     }
    
//     console.error('❌ Booking creation error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get all available beds with status
// export const getAllAvailableBeds = async (req, res) => {
//   try {
//     const { propertyId } = req.params;
//     const { startDate, endDate } = req.query;
    
//     if (!propertyId) {
//       return res.status(400).json({
//         success: false,
//         message: 'propertyId is required parameter'
//       });
//     }
    
//     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid propertyId format'
//       });
//     }
    
//     const checkStartDate = startDate ? new Date(startDate) : new Date();
//     checkStartDate.setUTCHours(0, 0, 0, 0);
    
//     let checkEndDate;
//     if (endDate) {
//       checkEndDate = new Date(endDate);
//       checkEndDate.setUTCHours(0, 0, 0, 0);
//     } else {
//       // Default to 1 day if no end date provided
//       checkEndDate = new Date(checkStartDate);
//       checkEndDate.setDate(checkStartDate.getDate() + 1);
//     }
    
//     if (isNaN(checkStartDate.getTime()) || isNaN(checkEndDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid date format. Use YYYY-MM-DD.'
//       });
//     }
    
//     // Get room configuration
//     const roomConfig = await Room.findOne({ propertyId });
//     if (!roomConfig) {
//       return res.status(404).json({
//         success: false,
//         message: 'Room configuration not found for this property'
//       });
//     }
    
//     // Find all bookings (including approved ones) that conflict with the date range
//     const bookings = await Booking.find({
//       propertyId,
//       bookingStatus: { $nin: ['cancelled', 'rejected'] },
//       $or: [
//         {
//           // Existing booking overlaps with our start date
//           moveInDate: { $lte: checkStartDate },
//           moveOutDate: { $gte: checkStartDate }
//         },
//         {
//           // Existing booking starts during our stay
//           moveInDate: { $gte: checkStartDate, $lte: checkEndDate }
//         },
//         {
//           // Our booking encompasses an existing booking
//           moveInDate: { $lte: checkStartDate },
//           moveOutDate: { $gte: checkEndDate }
//         }
//       ]
//     });
    
//     // Extract all booked room identifiers with their status
//     const bookedBeds = [];
//     bookings.forEach(booking => {
//       booking.roomDetails.forEach(room => {
//         bookedBeds.push({
//           roomIdentifier: room.roomIdentifier,
//           status: booking.bookingStatus,
//           bookingId: booking._id
//         });
//       });
//     });
    
//     // Get all available beds with status
//     const bedsByFloor = {};
//     let totalBeds = 0;
//     let availableBeds = 0;
//     let bookedBedsCount = 0;
//     let approvedBedsCount = 0;
    
//     for (const floorConfig of roomConfig.floorConfig.floors) {
//       const floorBeds = [];
      
//       // Check if rooms is a Map or regular object
//       let rooms;
//       if (floorConfig.rooms instanceof Map) {
//         // Convert Map to object
//         rooms = Object.fromEntries(floorConfig.rooms);
//       } else {
//         rooms = floorConfig.rooms;
//       }
      
//       for (const [roomNumber, beds] of Object.entries(rooms)) {
//         // Get the actual room type from room configuration instead of inferring from bed count
//         let roomType = 'double'; // default fallback
        
//         // Try to find room type from room configuration
//         const roomTypeConfig = roomConfig.roomTypes.find(rt => {
//           // Check if this room matches the room type based on bed count
//           return rt.capacity === beds.length;
//         });
        
//         if (roomTypeConfig) {
//           roomType = roomTypeConfig.type;
//         } else {
//           // Fallback: determine room type based on bed count
//           if (beds.length === 1) roomType = 'single';
//           else if (beds.length === 3) roomType = 'triple';
//           else if (beds.length === 4) roomType = 'four';
//           else if (beds.length === 5) roomType = 'five';
//           else if (beds.length === 6) roomType = 'six';
//         }
        
//         for (const bed of beds) {
//           totalBeds++;
          
//           // Use the actual bed name (with spaces) for the identifier
//           const roomIdentifier = `${roomType}-${roomNumber}-${bed}`;
          
//           // Check if this bed is booked
//           const bookingInfo = bookedBeds.find(b => b.roomIdentifier === roomIdentifier);
          
//           let status = 'available';
//           if (bookingInfo) {
//             if (bookingInfo.status === 'approved' || bookingInfo.status === 'confirmed') {
//               status = 'approved';
//               approvedBedsCount++;
//             } else {
//               status = 'booked';
//               bookedBedsCount++;
//             }
//           } else {
//             availableBeds++;
//           }
          
//           floorBeds.push({
//             _id: new mongoose.Types.ObjectId(),
//             roomNumber,
//             bedName: bed, // Keep the actual bed name with spaces
//             bedLetter: normalizeBedName(bed), // Normalized version for reference
//             floor: floorConfig.floor,
//             roomIdentifier,
//             roomType: roomType,
//             status: status,
//             available: status === 'available',
//             bookingId: bookingInfo?.bookingId || null
//           });
//         }
//       }
      
//       if (floorBeds.length > 0) {
//         bedsByFloor[floorConfig.floor] = floorBeds;
//       }
//     }
    
//     // Verify counts
//     console.log('Bed Statistics:', {
//       totalBeds,
//       availableBeds,
//       bookedBeds: bookedBedsCount,
//       approvedBeds: approvedBedsCount,
//       calculatedTotal: availableBeds + bookedBedsCount + approvedBedsCount
//     });
    
//     return res.status(200).json({
//       success: true,
//       bedsByFloor,
//       checkStartDate: checkStartDate.toISOString().split('T')[0],
//       checkEndDate: checkEndDate.toISOString().split('T')[0],
//       statistics: {
//         totalBeds,
//         availableBeds,
//         bookedBeds: bookedBedsCount,
//         approvedBeds: approvedBedsCount
//       }
//     });
    
//   } catch (error) {
//     console.error('Get all available beds error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// // Cancel booking
// export const cancelBooking = async (req, res) => {
//   try {
//     const { bookingId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(bookingId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid booking ID format'
//       });
//     }

//     const booking = await Booking.findById(bookingId);

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: 'Booking not found'
//       });
//     }

//     // Check if booking can be cancelled (e.g., not already cancelled or checked-in)
//     if (booking.bookingStatus === 'cancelled') {
//       return res.status(400).json({
//         success: false,
//         message: 'Booking is already cancelled'
//       });
//     }

//     if (booking.bookingStatus === 'checked_in') {
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot cancel booking after check-in'
//       });
//     }

//     // Update booking status to cancelled
//     const updatedBooking = await Booking.findByIdAndUpdate(
//       bookingId,
//       {
//         bookingStatus: 'cancelled',
//         'paymentInfo.paymentStatus': 'refund_pending'
//       },
//       { new: true }
//     ).populate('propertyId', 'name');


//     // ✅ ADD NOTIFICATION HERE - After successful cancellation
//     try {
//       await NotificationService.createBookingNotification(updatedBooking, 'booking_cancelled');
//       console.log('✅ Booking cancellation notification created successfully');
//     } catch (notificationError) {
//       console.error('❌ Failed to create cancellation notification:', notificationError);
//       // Don't fail the cancellation if notification fails
//     }

//     // TODO: Add refund logic here if needed

//     res.status(200).json({
//       success: true,
//       message: 'Booking cancelled successfully',
//       booking: updatedBooking
//     });

//   } catch (error) {
//     console.error('Cancel booking error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to cancel booking',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get bookings by property (for clients)
// export const getBookingsByProperty = async (req, res) => {
//   try {
//     console.log('User from request:', req.user);
    
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         success: false,
//         message: 'Authentication required'
//       });
//     }

//     // Only clients should be able to access this endpoint
//     if (req.user.role !== 'client') {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied. Client role required.'
//       });
//     }

//     // Get clientId from the client user
//     const clientId = req.user.clientId || req.user.id;

//     if (!clientId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Client ID not found'
//       });
//     }

//     console.log('Fetching properties for clientId:', clientId);

//     // Find all property IDs owned by this client
//     const properties = await Property.find({ 
//       clientId: clientId
//     }).select('_id').lean();

//     const propertyIds = properties.map((p) => p._id);

//     if (propertyIds.length === 0) {
//       return res.status(200).json({
//         success: true,
//         bookings: [],
//         message: 'No properties found for this client'
//       });
//     }

//     console.log('Found property IDs:', propertyIds);

//     // Fetch bookings for the client's properties (bookings made by users)
//     const bookings = await Booking.find({ propertyId: { $in: propertyIds } })
//       .populate('userId', 'name email phone profileImage clientId')
//       .populate('propertyId', 'name locality city')
//       .sort({ createdAt: -1 });

//     console.log('Found bookings:', bookings.length);

//     // Manually populate approvedBy to avoid schema errors
//     const bookingsWithApprovedBy = await Promise.all(
//       bookings.map(async (booking) => {
//         let approvedByDetails = null;
//         if (booking.approvedBy) {
//           try {
//             const approvedUser = await User.findById(booking.approvedBy).select('name email phone');
//             approvedByDetails = approvedUser ? {
//               _id: approvedUser._id,
//               name: approvedUser.name,
//               email: approvedUser.email,
//               phone: approvedUser.phone
//             } : null;
//           } catch (error) {
//             console.error('Error fetching approvedBy user:', error);
//           }
//         }
//         return {
//           ...booking.toObject(),
//           approvedByDetails
//         };
//       })
//     );

//     const formattedBookings = bookingsWithApprovedBy.map((booking) => ({
//       id: booking._id,
//       _id: booking._id,
//       user: booking.userId ? {
//         _id: booking.userId._id,
//         name: booking.userId.name,
//         email: booking.userId.email,
//         phone: booking.userId.phone,
//         clientId: booking.userId.clientId,
//         profileImage: booking.userId.profileImage
//       } : null,
//       property: booking.propertyId ? {
//         _id: booking.propertyId._id,
//         name: booking.propertyId.name,
//         locality: booking.propertyId.locality,
//         city: booking.propertyId.city
//       } : null,
//       customerDetails: booking.customerDetails || {},
//       roomType: booking.roomType?.name || 'N/A',
//       roomNumber: booking.roomDetails?.[0]?.roomNumber || 'N/A',
//       floor: booking.roomDetails?.[0]?.floor || 'N/A',
//       moveInDate: booking.moveInDate,
//       moveOutDate: booking.moveOutDate,
//       bookingStatus: booking.bookingStatus,
//       paymentInfo: booking.paymentInfo || {},
//       paymentStatus: booking.paymentInfo?.paymentStatus || 'pending',
//       transferStatus: booking.transferStatus || 'pending',
//       pricing: booking.pricing,
//       transferStatus: booking.transferStatus || 'manual_pending',
//       transferDetails: booking.transferDetails || {},
//       outstandingAmount: booking.outstandingAmount || 0,
//       approvedBy: booking.approvedByDetails,
//       approvedAt: booking.approvedAt || null,
//       roomDetails: booking.roomDetails,
//       createdAt: booking.createdAt
//     }));

//     return res.status(200).json({
//       success: true,
//       count: formattedBookings.length,
//       bookings: formattedBookings,
//     });
//   } catch (error) {
//     console.error('Get bookings by property error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get bookings of user (for regular users to see their own bookings)
// // Get bookings of user (for regular users to see their own bookings)
// export const getUserBookings = async (req, res) => {  
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ 
//         success: false, 
//         message: 'Authentication required' 
//       });
//     }

//     console.log('🔍 Fetching bookings for user ID:', req.user.id);
//     console.log('🔍 User role:', req.user.role);

//     // Convert user ID to ObjectId for proper querying
//     let userId;
//     try {
//       userId = new mongoose.Types.ObjectId(req.user.id);
//       console.log('🔍 Converted user ID to ObjectId:', userId);
//     } catch (error) {
//       console.error('❌ Invalid user ID format:', req.user.id);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid user ID format'
//       });
//     }

//     // First, check if user exists
//     const userExists = await User.findById(userId);
//     if (!userExists) {
//       console.log('❌ User not found in database with ID:', userId);
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     console.log('✅ User found:', userExists.name, userExists.email);

//     // Try multiple query approaches to find bookings
//     let bookings = [];

//     // Approach 1: Direct query with ObjectId
//     bookings = await Booking.find({ userId: userId })
//       .populate('propertyId', 'name locality city images')
//       .sort({ createdAt: -1 })
//       .lean();

//     console.log('📊 Bookings found with ObjectId query:', bookings.length);

//     // If no bookings found, try with string ID
//     if (bookings.length === 0) {
//       console.log('🔄 Trying with string ID query...');
//       bookings = await Booking.find({ userId: req.user.id })
//         .populate('propertyId', 'name locality city images')
//         .sort({ createdAt: -1 })
//         .lean();
      
//       console.log('📊 Bookings found with string ID query:', bookings.length);
//     }

//     // Debug: Check all bookings in database to see user IDs
//     if (bookings.length === 0) {
//       const allBookingsSample = await Booking.find().limit(5).select('userId propertyId bookingStatus').lean();
//       console.log('📋 Sample of all bookings in database:', allBookingsSample);
//     }

//     // Process bookings with payment data
//     const processedBookings = await Promise.all(
//       bookings.map(async (booking) => {
//         try {
//           // Get approved by name if exists
//           let approvedByName = null;
//           if (booking.approvedBy) {
//             const approvedUser = await User.findById(booking.approvedBy).select('name').lean();
//             approvedByName = approvedUser?.name || null;
//           }

//           // Calculate payment summary
//           const paymentSummary = calculatePaymentSummary(booking);

//           // Format room details
//           const roomDetails = booking.roomDetails || [];
//           const primaryRoom = roomDetails[0] || {};

//           return {
//             id: booking._id,
//             _id: booking._id,
//             property: booking.propertyId ? {
//               _id: booking.propertyId._id,
//               name: booking.propertyId.name,
//               locality: booking.propertyId.locality,
//               city: booking.propertyId.city,
//               images: booking.propertyId.images || []
//             } : null,
//             roomType: booking.roomType?.name || 'N/A',
//             roomNumber: primaryRoom.roomNumber || 'N/A',
//             floor: primaryRoom.floor || 'N/A',
//             bed: primaryRoom.bed || 'N/A',
//             moveInDate: booking.moveInDate,
//             moveOutDate: booking.moveOutDate,
//             durationType: booking.durationType,
//             durationDays: booking.durationDays,
//             durationMonths: booking.durationMonths,
//             personCount: booking.personCount,
//             bookingStatus: booking.bookingStatus,
            
//             // Enhanced Payment Data
//             paymentInfo: {
//               paymentStatus: booking.paymentInfo?.paymentStatus || 'pending',
//               paymentMethod: booking.paymentInfo?.paymentMethod || 'razorpay',
//               paidAmount: booking.paymentInfo?.paidAmount || 0,
//               transactionId: booking.paymentInfo?.transactionId || null,
//               paymentDate: booking.paymentInfo?.paymentDate || null,
//               razorpayOrderId: booking.paymentInfo?.razorpayOrderId || null,
//               razorpayPaymentId: booking.paymentInfo?.razorpayPaymentId || null
//             },
            
//             // All Payments History
//             payments: (booking.payments || []).map(payment => ({
//               date: payment.date,
//               amount: payment.amount,
//               method: payment.method,
//               status: payment.status,
//               transactionId: payment.transactionId,
//               description: payment.description,
//               razorpayOrderId: payment.razorpayOrderId,
//               razorpayPaymentId: payment.razorpayPaymentId
//             })),
            
//             // Pricing Details
//             pricing: booking.pricing || {
//               monthlyRent: 0,
//               totalRent: 0,
//               securityDeposit: 0,
//               advanceAmount: 0,
//               totalAmount: 0,
//               maintenanceFee: 0
//             },
            
//             // Payment Summary
//             paymentSummary: paymentSummary,
            
//             transferStatus: booking.transferStatus || 'pending',
//             transferDetails: booking.transferDetails || {},
//             approvedBy: approvedByName,
//             approvedAt: booking.approvedAt || null,
//             roomDetails: roomDetails,
//             customerDetails: booking.customerDetails || {},
//             createdAt: booking.createdAt,
//             updatedAt: booking.updatedAt
//           };
//         } catch (error) {
//           console.error('❌ Error processing booking:', booking._id, error);
//           return null;
//         }
//       })
//     );

//     // Filter out any null results from errors
//     const validBookings = processedBookings.filter(booking => booking !== null);

//     console.log('✅ Successfully processed bookings:', validBookings.length);

//     return res.status(200).json({
//       success: true,
//       count: validBookings.length,
//       bookings: validBookings,
//       message: validBookings.length === 0 ? 'No bookings found for this user' : 'Bookings retrieved successfully'
//     });

//   } catch (error) {
//     console.error('❌ Get user bookings error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Enhanced payment summary calculator
// const calculatePaymentSummary = (booking) => {
//   try {
//     const pricing = booking.pricing || {};
//     const payments = booking.payments || [];
//     const paymentInfo = booking.paymentInfo || {};

//     const totalAmount = pricing.totalAmount || 0;
//     const securityDeposit = pricing.securityDeposit || 0;
//     const maintenanceFee = pricing.maintenanceFee || 0;
//     const monthlyRent = pricing.monthlyRent || 0;
//     const totalRent = pricing.totalRent || 0;
//     const advanceAmount = pricing.advanceAmount || 0;
    
//     const totalDue = totalAmount + securityDeposit + maintenanceFee;
    
//     // Calculate total paid from payments array
//     const totalPaidFromPayments = payments
//       .filter(payment => payment.status === 'completed')
//       .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
//     // Use paymentInfo.paidAmount as fallback
//     const paidFromPaymentInfo = paymentInfo.paidAmount || 0;
    
//     // Use the higher value between payments array and paymentInfo
//     const finalPaidAmount = Math.max(totalPaidFromPayments, paidFromPaymentInfo);
    
//     const outstandingAmount = Math.max(0, totalDue - finalPaidAmount);
//     const paymentProgress = totalDue > 0 ? (finalPaidAmount / totalDue) * 100 : 0;

//     return {
//       totalDue,
//       totalPaid: finalPaidAmount,
//       outstandingAmount,
//       securityDeposit,
//       maintenanceFee,
//       monthlyRent,
//       totalRent,
//       advanceAmount,
//       isFullyPaid: outstandingAmount === 0,
//       paymentProgress: Math.round(paymentProgress),
//       currency: 'INR'
//     };
//   } catch (error) {
//     console.error('Error calculating payment summary:', error);
//     return {
//       totalDue: 0,
//       totalPaid: 0,
//       outstandingAmount: 0,
//       securityDeposit: 0,
//       maintenanceFee: 0,
//       monthlyRent: 0,
//       totalRent: 0,
//       advanceAmount: 0,
//       isFullyPaid: false,
//       paymentProgress: 0,
//       currency: 'INR'
//     };
//   }
// };

// // Debug endpoint to check user's booking data
// export const debugUserBookings = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ 
//         success: false, 
//         message: 'Authentication required' 
//       });
//     }

//     console.log('🔧 Debug endpoint called for user:', req.user.id);

//     const userId = new mongoose.Types.ObjectId(req.user.id);

//     // Check user existence
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found in database'
//       });
//     }

//     // Check all bookings for this user (raw query)
//     const bookings = await Booking.find({ userId: userId })
//       .select('_id userId propertyId bookingStatus paymentInfo.paymentStatus createdAt moveInDate')
//       .populate('propertyId', 'name')
//       .lean();

//     // Check if there are any bookings in the entire database
//     const totalBookings = await Booking.countDocuments();
//     const allBookingsSample = await Booking.find().limit(5)
//       .select('userId propertyId bookingStatus')
//       .populate('propertyId', 'name')
//       .lean();

//     return res.status(200).json({
//       success: true,
//       debugInfo: {
//         user: {
//           id: user._id,
//           name: user.name,
//           email: user.email,
//           role: user.role,
//           clientId: user.clientId
//         },
//         userBookings: {
//           count: bookings.length,
//           bookings: bookings.map(b => ({
//             _id: b._id,
//             userId: b.userId,
//             property: b.propertyId?.name,
//             bookingStatus: b.bookingStatus,
//             paymentStatus: b.paymentInfo?.paymentStatus,
//             moveInDate: b.moveInDate,
//             createdAt: b.createdAt
//           }))
//         },
//         databaseInfo: {
//           totalBookings: totalBookings,
//           sampleBookings: allBookingsSample.map(b => ({
//             _id: b._id,
//             userId: b.userId,
//             property: b.propertyId?.name,
//             bookingStatus: b.bookingStatus
//           }))
//         },
//         queryUsed: {
//           userId: userId,
//           userIdString: req.user.id
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Debug error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Debug endpoint error',
//       error: error.message
//     });
//   }
// };

// // Get single booking with complete payment details
// export const getBookingWithPaymentDetails = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
    
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ 
//         success: false, 
//         message: 'Authentication required' 
//       });
//     }

//     if (!mongoose.Types.ObjectId.isValid(bookingId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid booking ID format'
//       });
//     }

//     const booking = await Booking.findById(bookingId)
//       .populate('propertyId', 'name locality city images amenities address')
//       .populate('approvedBy', 'name email');

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: 'Booking not found'
//       });
//     }

//     // Check if user owns this booking
//     if (booking.userId.toString() !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied. You can only view your own bookings.'
//       });
//     }

//     // Calculate payment summary
//     const paymentSummary = calculatePaymentSummary(booking);

//     const response = {
//       success: true,
//       booking: {
//         id: booking._id,
//         _id: booking._id,
        
//         // Property Details
//         property: booking.propertyId ? {
//           _id: booking.propertyId._id,
//           name: booking.propertyId.name,
//           locality: booking.propertyId.locality,
//           city: booking.propertyId.city,
//           images: booking.propertyId.images || [],
//           amenities: booking.propertyId.amenities || [],
//           address: booking.propertyId.address || {}
//         } : null,
        
//         // Room Details
//         roomType: booking.roomType?.name || 'N/A',
//         roomDetails: booking.roomDetails || [],
        
//         // Dates
//         moveInDate: booking.moveInDate,
//         moveOutDate: booking.moveOutDate,
//         durationType: booking.durationType,
//         durationDays: booking.durationDays,
//         durationMonths: booking.durationMonths,
        
//         // Status
//         bookingStatus: booking.bookingStatus,
//         transferStatus: booking.transferStatus || 'pending',
        
//         // Customer Details
//         customerDetails: booking.customerDetails || {},
//         personCount: booking.personCount,
        
//         // Complete Payment Information
//         paymentInfo: {
//           paymentStatus: booking.paymentInfo?.paymentStatus || 'pending',
//           paymentMethod: booking.paymentInfo?.paymentMethod || 'razorpay',
//           paidAmount: booking.paymentInfo?.paidAmount || 0,
//           transactionId: booking.paymentInfo?.transactionId,
//           razorpayOrderId: booking.paymentInfo?.razorpayOrderId,
//           razorpayPaymentId: booking.paymentInfo?.razorpayPaymentId,
//           razorpaySignature: booking.paymentInfo?.razorpaySignature,
//           paymentDate: booking.paymentInfo?.paymentDate
//         },
        
//         // All Payments History
//         payments: booking.payments?.map(payment => ({
//           _id: payment._id,
//           date: payment.date,
//           amount: payment.amount,
//           method: payment.method,
//           status: payment.status,
//           transactionId: payment.transactionId,
//           description: payment.description,
//           razorpayOrderId: payment.razorpayOrderId,
//           razorpayPaymentId: payment.razorpayPaymentId,
//           razorpaySignature: payment.razorpaySignature
//         })) || [],
        
//         // Pricing Breakdown
//         pricing: {
//           monthlyRent: booking.pricing?.monthlyRent || 0,
//           totalRent: booking.pricing?.totalRent || 0,
//           securityDeposit: booking.pricing?.securityDeposit || 0,
//           advanceAmount: booking.pricing?.advanceAmount || 0,
//           totalAmount: booking.pricing?.totalAmount || 0,
//           maintenanceFee: booking.pricing?.maintenanceFee || 0
//         },
        
//         // Payment Summary
//         paymentSummary: paymentSummary,
        
//         // Approval Information
//         approvedBy: booking.approvedBy ? {
//           name: booking.approvedBy.name,
//           email: booking.approvedBy.email
//         } : null,
//         approvedAt: booking.approvedAt,
        
//         // Timestamps
//         createdAt: booking.createdAt,
//         updatedAt: booking.updatedAt
//       }
//     };

//     return res.status(200).json(response);
    
//   } catch (error) {
//     console.error('Get booking with payment details error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get single booking by ID
// export const getBookingById = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
    
//     if (!mongoose.Types.ObjectId.isValid(bookingId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid booking ID format'
//       });
//     }
    
//     const booking = await Booking.findById(bookingId)
//       .populate('userId', 'name email phone clientId profileImage')
//       .populate('propertyId', 'name locality city images')
//       .populate('approvedBy', 'name');
    
//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: 'Booking not found'
//       });
//     }
    
//     // Check if user has permission to view this booking
//     if (req.user.role === 'user' && booking.userId._id.toString() !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to view this booking'
//       });
//     }
    
//     // For clients, check if they own the property
//     if (req.user.role === 'client') {
//       const property = await Property.findById(booking.propertyId);
//       if (!property || property.clientId.toString() !== req.user.clientId) {
//         return res.status(403).json({
//           success: false,
//           message: 'Not authorized to view this booking'
//         });
//       }
//     }
    
//     const formattedBooking = {
//       id: booking._id,
//       user: booking.userId ? {
//         _id: booking.userId._id,
//         name: booking.userId.name,
//         email: booking.userId.email,
//         phone: booking.userId.phone,
//         clientId: booking.userId.clientId,
//         profileImage: booking.userId.profileImage
//       } : null,
//       property: booking.propertyId ? {
//         _id: booking.propertyId._id,
//         name: booking.propertyId.name,
//         locality: booking.propertyId.locality,
//         city: booking.propertyId.city,
//         images: booking.propertyId.images || []
//       } : null,
//       roomType: booking.roomType?.name || 'N/A',
//       roomDetails: booking.roomDetails,
//       moveInDate: booking.moveInDate,
//       moveOutDate: booking.moveOutDate,
//       bookingStatus: booking.bookingStatus,
//       paymentStatus: booking.paymentInfo?.paymentStatus || 'pending',
//       transferStatus: booking.transferStatus || 'pending',
//       pricing: booking.pricing,
//       transferDetails: booking.transferDetails || {},
//       payments: booking.payments || [],
//       outstandingAmount: booking.outstandingAmount,
//       approvedBy: booking.approvedBy?.name || null,
//       approvedAt: booking.approvedAt || null,
//       createdAt: booking.createdAt
//     };
    
//     return res.status(200).json({
//       success: true,
//       booking: formattedBooking
//     });
    
//   } catch (error) {
//     console.error('Get booking by ID error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// // Approve booking
// export const approveBooking = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ success: false, message: 'Authentication required' });
//     }

//     // Only clients can approve bookings
//     if (req.user.role !== 'client') {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'Only clients can approve bookings' 
//       });
//     }

//     const { bookingId } = req.params;
    
//     // First, check if the booking belongs to one of the client's properties
//     const booking = await Booking.findById(bookingId).populate('propertyId');
    
//     if (!booking) {
//       return res.status(404).json({ success: false, message: 'Booking not found' });
//     }

//     // Verify that the client owns this property
//     const clientProperties = await Property.find({ 
//       clientId: req.user.clientId || req.user.id 
//     }).select('_id');

//     const clientPropertyIds = clientProperties.map(p => p._id.toString());
    
//     if (!clientPropertyIds.includes(booking.propertyId._id.toString())) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'You can only approve bookings for your own properties' 
//       });
//     }

//     // Update the booking status
//     const updatedBooking = await Booking.findByIdAndUpdate(
//       bookingId,
//       { 
//         bookingStatus: 'approved',
//         approvedBy: req.user.id,
//         approvedAt: new Date() 
//       },
//       { new: true }
//     )
//     .populate('userId', 'name email phone')
//     .populate('propertyId', 'name locality city');

//     // ✅ ADD NOTIFICATION HERE - After successful approval
//     try {
//       await NotificationService.createBookingNotification(updatedBooking, 'booking_approved');
//       console.log('✅ Booking approval notification created successfully');
//     } catch (notificationError) {
//       console.error('❌ Failed to create approval notification:', notificationError);
//       // Don't fail the approval if notification fails
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Booking approved successfully',
//       booking: {
//         id: updatedBooking._id,
//         user: updatedBooking.userId ? {
//           name: updatedBooking.userId.name,
//           email: updatedBooking.userId.email,
//           phone: updatedBooking.userId.phone
//         } : null,
//         property: updatedBooking.propertyId ? {
//           name: updatedBooking.propertyId.name,
//           locality: updatedBooking.propertyId.locality,
//           city: updatedBooking.propertyId.city
//         } : null,
//         roomType: updatedBooking.roomType?.name,
//         moveInDate: updatedBooking.moveInDate,
//         bookingStatus: updatedBooking.bookingStatus,
//         paymentStatus: updatedBooking.paymentInfo?.paymentStatus,
//         transferStatus: updatedBooking.transferStatus,
//         approvedAt: updatedBooking.approvedAt
//       }
//     });

//   } catch (error) {
//     console.error('Approval error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Reject booking
// export const rejectBooking = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ success: false, message: 'Authentication required' });
//     }

//     const { bookingId } = req.params;
//     const { reason } = req.body;

//     if (!reason || reason.trim() === '') {
//       return res.status(400).json({ success: false, message: 'Rejection reason is required' });
//     }

//     const booking = await Booking.findByIdAndUpdate(
//       bookingId,
//       { 
//         bookingStatus: 'rejected',
//         rejectedBy: req.user.id,
//         rejectionReason: reason,
//         approvedAt: new Date() 
//       },
//       { new: true }
//     ).populate('userId', 'name email phone');

//     if (!booking) {
//       return res.status(404).json({ success: false, message: 'Booking not found' });
//     }

//      // ✅ ADD NOTIFICATION HERE - After successful rejection
//     try {
//       await NotificationService.createBookingNotification(booking, 'booking_rejected', {
//         rejectionReason: reason
//       });
//       console.log('✅ Booking rejection notification created successfully');
//     } catch (notificationError) {
//       console.error('❌ Failed to create rejection notification:', notificationError);
//       // Don't fail the rejection if notification fails
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Booking rejected successfully',
//       booking
//     });

//   } catch (error) {
//     console.error('Rejection error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get all bookings (admin)
// export const getallBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find({})
//       .populate('userId', 'name email phone clientId')
//       .populate('propertyId', 'name locality city')
//       .sort({ createdAt: -1 });

//     const formattedBookings = bookings.map(booking => {
//       // Get all room numbers, floors, and beds
//       const roomNumbers = booking.roomDetails?.map(room => room.roomNumber).filter(Boolean) || [];
//       const floors = booking.roomDetails?.map(room => room.floor).filter(Boolean) || [];
//       const beds = booking.roomDetails?.map(room => room.bed).filter(Boolean) || [];
      
//       // Create unique arrays
//       const uniqueRoomNumbers = [...new Set(roomNumbers)];
//       const uniqueFloors = [...new Set(floors)];
//       const uniqueBeds = [...new Set(beds)];

//       return {
//         id: booking._id,
        
//         user: booking.userId ? {
//           name: booking.userId.name,
//           email: booking.userId.email,
//           phone: booking.userId.phone,
//           clientId: booking.userId.clientId,
//         } : null,
//         clientId: booking.clientId,
//         property: booking.propertyId ? {
//           name: booking.propertyId.name,
//           locality: booking.propertyId.locality,
//           city: booking.propertyId.city,
//           _id: booking.propertyId._id // Add property ID for transfer
//         } : null,
//         roomType: booking.roomType?.name || 'N/A',
//         // Display first room or summary for multiple rooms
//         roomNumber: uniqueRoomNumbers.length > 0 ? 
//                    (uniqueRoomNumbers.length === 1 ? uniqueRoomNumbers[0] : `${uniqueRoomNumbers.length} rooms`) : 'N/A',
//         floor: uniqueFloors.length > 0 ? 
//               (uniqueFloors.length === 1 ? uniqueFloors[0] : `${uniqueFloors.length} floors`) : 'N/A',
//         bed: uniqueBeds.length > 0 ? 
//             (uniqueBeds.length === 1 ? uniqueBeds[0] : `${uniqueBeds.length} beds`) : 'N/A',
//         // Include all room details
//         roomDetails: booking.roomDetails || [],
//         totalRooms: booking.roomDetails?.length || 0,
//         moveInDate: booking.moveInDate,
//         moveOutDate: booking.moveOutDate,
//         status: booking.bookingStatus,
//         paymentInfo: booking.paymentInfo || {},
//         paymentStatus: booking.paymentInfo?.paymentStatus || 'pending',
//         transferStatus: booking.transferStatus || 'pending',
//         transferDetails: booking.transferDetails || {},
//         payments: booking.payments || [],
//         pricing: booking.pricing,
//         approvedBy: booking.approvedBy || null,
//         approvedAt: booking.approvedAt || null
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       count: formattedBookings.length,
//       bookings: formattedBookings
//     });

//   } catch (error) {
//     console.error('Controller Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

// // Get available rooms and beds by floor for a property
// export const getAvailableRoomsAndBeds = async (req, res) => {
//   try {
//     const { propertyId } = req.params;
//     const { date } = req.query;
    
//     if (!propertyId) {
//       return res.status(400).json({
//         success: false,
//         message: 'propertyId is required parameter'
//       });
//     }
    
//     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid propertyId format'
//       });
//     }
    
//     const checkDate = date ? new Date(date) : new Date();
//     checkDate.setUTCHours(0, 0, 0, 0);
    
//     if (isNaN(checkDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid date format. Use YYYY-MM-DD.'
//       });
//     }
    
//     // Get property details
//     const property = await Property.findById(propertyId);
//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: 'Property not found'
//       });
//     }
    
//     // Get room configuration
//     const roomConfig = await Room.findOne({ propertyId });
//     if (!roomConfig) {
//       return res.status(404).json({
//         success: false,
//         message: 'Room configuration not found for this property'
//       });
//     }
    
//     // Find all bookings that conflict with the selected date
//     const conflictingBookings = await Booking.find({
//       propertyId,
//       bookingStatus: { $nin: ['cancelled', 'checked_out', 'rejected'] },
//       $or: [
//         {
//           moveInDate: { $lte: checkDate },
//           moveOutDate: { $gte: checkDate }
//         },
//         {
//           moveInDate: checkDate
//         }
//       ]
//     });
    
//     // Extract unavailable room identifiers
//     const unavailableBeds = conflictingBookings.flatMap(booking => 
//       booking.roomDetails.map(room => room.roomIdentifier)
//     );
    
//     // Structure response by floor and room type
//     const availabilityByFloor = {};
    
//     for (const floorConfig of roomConfig.floorConfig.floors) {
//       const floorNumber = floorConfig.floor;
//       availabilityByFloor[floorNumber] = {};
      
//       // Initialize room types for this floor
//       roomConfig.roomTypes.forEach(roomType => {
//         availabilityByFloor[floorNumber][roomType.type] = {
//           label: roomType.label,
//           capacity: roomType.capacity,
//           price: roomType.price,
//           deposit: roomType.deposit,
//           availableBeds: 0,
//           totalBeds: 0,
//           rooms: []
//         };
//       });
      
//       // Process each room on this floor
//       for (const [roomNumber, beds] of Object.entries(floorConfig.rooms)) {
//         const roomData = {
//           roomNumber,
//           beds: [],
//           availableBeds: 0,
//           totalBeds: beds.length
//         };
        
//         // Process each bed in the room
//         for (const bed of beds) {
//           // Determine room type from bed configuration
//           let roomType = 'double'; // default
//           if (beds.length === 1) roomType = 'single';
//           else if (beds.length === 3) roomType = 'triple';
//           else if (beds.length === 4) roomType = 'quad';
//           else if (beds.length === 5) roomType = 'quint';
//           else if (beds.length === 6) roomType = 'hex';
          
//           const roomIdentifier = `${roomType}-${roomNumber}-${normalizeBedName(bed)}`;
//           const isAvailable = !unavailableBeds.includes(roomIdentifier);
          
//           const bedData = {
//             bedName: bed,
//             bedLetter: normalizeBedName(bed),
//             roomIdentifier,
//             available: isAvailable,
//             roomType
//           };
          
//           roomData.beds.push(bedData);
//           if (isAvailable) {
//             roomData.availableBeds++;
            
//             // Update floor-level statistics
//             if (availabilityByFloor[floorNumber][roomType]) {
//               availabilityByFloor[floorNumber][roomType].availableBeds++;
//               availabilityByFloor[floorNumber][roomType].totalBeds++;
//             }
//           } else if (availabilityByFloor[floorNumber][roomType]) {
//             availabilityByFloor[floorNumber][roomType].totalBeds++;
//           }
//         }
        
//         // Add room to appropriate room type category
//         if (roomData.beds.length > 0) {
//           const primaryRoomType = roomData.beds[0].roomType;
//           if (availabilityByFloor[floorNumber][primaryRoomType]) {
//             availabilityByFloor[floorNumber][primaryRoomType].rooms.push(roomData);
//           }
//         }
//       }
//     }
    
//     return res.status(200).json({
//       success: true,
//       property: {
//         id: property._id,
//         name: property.name,
//         locality: property.locality,
//         city: property.city
//       },
//       checkDate: checkDate.toISOString().split('T')[0],
//       availabilityByFloor,
//       summary: {
//         totalAvailableBeds: Object.values(availabilityByFloor).reduce((total, floor) => {
//           return total + Object.values(floor).reduce((floorTotal, roomType) => {
//             return floorTotal + roomType.availableBeds;
//           }, 0);
//         }, 0),
//         totalBeds: Object.values(availabilityByFloor).reduce((total, floor) => {
//           return total + Object.values(floor).reduce((floorTotal, roomType) => {
//             return floorTotal + roomType.totalBeds;
//           }, 0);
//         }, 0)
//       }
//     });
    
//   } catch (error) {
//     console.error('Get available rooms and beds error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// // Get available beds by specific room type with booking status
// export const getAvailableBedsByRoomType = async (req, res) => {
//   try {
//     const { propertyId } = req.params;
//     const { roomType, date } = req.query;
    
//     if (!propertyId || !roomType) {
//       return res.status(400).json({
//         success: false,
//         message: 'propertyId and roomType are required parameters'
//       });
//     }
    
//     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid propertyId format'
//       });
//     }
    
//     const checkDate = date ? new Date(date) : new Date();
//     checkDate.setUTCHours(0, 0, 0, 0);
    
//     if (isNaN(checkDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid date format. Use YYYY-MM-DD.'
//       });
//     }
    
//     // Get room configuration
//     const roomConfig = await Room.findOne({ propertyId });
//     if (!roomConfig) {
//       return res.status(404).json({
//         success: false,
//         message: 'Room configuration not found for this property'
//       });
//     }
    
//     // Find all bookings (including approved ones)
//     const bookings = await Booking.find({
//       propertyId,
//       bookingStatus: { $nin: ['cancelled', 'rejected'] },
//       $or: [
//         {
//           moveInDate: { $lte: checkDate },
//           moveOutDate: { $gte: checkDate }
//         },
//         {
//           moveInDate: checkDate
//         }
//       ]
//     });
    
//     // Extract all booked room identifiers with their status
//     const bookedBeds = [];
//     bookings.forEach(booking => {
//       booking.roomDetails.forEach(room => {
//         bookedBeds.push({
//           roomIdentifier: room.roomIdentifier,
//           status: booking.bookingStatus,
//           bookingId: booking._id
//         });
//       });
//     });
    
//     // Get available beds for the specified room type with status
//     const bedsByFloor = {};
//     let totalBeds = 0;
//     let availableBeds = 0;
//     let bookedBedsCount = 0;
//     let approvedBedsCount = 0;
    
//     for (const floorConfig of roomConfig.floorConfig.floors) {
//       const floorBeds = [];
      
//       for (const [roomNumber, beds] of Object.entries(floorConfig.rooms)) {
//         // Check if this room matches the requested room type based on bed count
//         let matchesRoomType = false;
        
//         if (roomType === 'single' && beds.length === 1) matchesRoomType = true;
//         else if (roomType === 'double' && beds.length === 2) matchesRoomType = true;
//         else if (roomType === 'triple' && beds.length === 3) matchesRoomType = true;
//         else if (roomType === 'quad' && beds.length === 4) matchesRoomType = true;
//         else if (roomType === 'quint' && beds.length === 5) matchesRoomType = true;
//         else if (roomType === 'hex' && beds.length === 6) matchesRoomType = true;
        
//         if (matchesRoomType) {
//           for (const bed of beds) {
//             totalBeds++;
//             const roomIdentifier = `${roomType}-${roomNumber}-${normalizeBedName(bed)}`;
            
//             // Check if this bed is booked
//             const bookingInfo = bookedBeds.find(b => b.roomIdentifier === roomIdentifier);
            
//             let status = 'available';
//             if (bookingInfo) {
//               if (bookingInfo.status === 'approved' || bookingInfo.status === 'confirmed') {
//                 status = 'approved';
//                 approvedBedsCount++;
//               } else {
//                 status = 'booked';
//                 bookedBedsCount++;
//               }
//             } else {
//               availableBeds++;
//             }
            
//             floorBeds.push({
//               _id: new mongoose.Types.ObjectId(),
//               roomNumber,
//               bedLetter: normalizeBedName(bed),
//               actualBedName: bed,
//               floor: floorConfig.floor,
//               roomIdentifier,
//               status: status,
//               available: status === 'available',
//               bookingId: bookingInfo?.bookingId || null
//             });
//           }
//         }
//       }
      
//       if (floorBeds.length > 0) {
//         bedsByFloor[floorConfig.floor] = floorBeds;
//       }
//     }
    
//     return res.status(200).json({
//       success: true,
//       roomType,
//       bedsByFloor,
//       checkDate: checkDate.toISOString().split('T')[0],
//       statistics: {
//         totalBeds,
//         availableBeds,
//         bookedBeds: bookedBedsCount,
//         approvedBeds: approvedBedsCount
//       }
//     });
    
//   } catch (error) {
//     console.error('Get available beds by room type error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };






//handling errors


import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { NotificationService } from './notificationController.js';

// Helper function to normalize bed names
const normalizeBedName = (bedName) => {
  return bedName.replace(/\s+/g, '');
};

// Helper function to create consistent room identifier
const createRoomIdentifier = (sharingType, roomNumber, bed) => {
  return `${sharingType}-${roomNumber}-${normalizeBedName(bed)}`;
};

// Helper function to calculate days between two dates
const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

// Room availability check function
const checkRoomAvailabilityBeforeBooking = async (propertyId, selectedRooms, moveInDate, endDate, session) => {
  const unavailableRooms = [];

  for (const roomIdentifier of selectedRooms) {
    const conflict = await Booking.findOne({
      propertyId,
      'roomDetails.roomIdentifier': roomIdentifier,
      bookingStatus: { $nin: ['cancelled', 'checked_out', 'rejected'] },
      $or: [
        { 
          moveInDate: { $lt: endDate }, 
          moveOutDate: { $gt: moveInDate } 
        }
      ]
    }).session(session);

    if (conflict) {
      unavailableRooms.push(roomIdentifier);
    }
  }

  return {
    available: unavailableRooms.length === 0,
    unavailableRooms
  };
};

// Create booking - SIMPLIFIED AND FIXED VERSION
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  let transactionCommitted = false;
  
  try {
    await session.startTransaction();
    
    console.log('📦 Creating booking...', req.body);

    if (!req.user || !req.user.id) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      propertyId,
      roomType,
      selectedRooms,
      moveInDate,
      endDate,
      durationType,
      durationDays,
      durationMonths,
      personCount,
      customerDetails,
      pricing
    } = req.body;

    console.log('📋 Received booking data:', {
      propertyId,
      roomType,
      selectedRooms,
      moveInDate,
      endDate,
      durationType,
      user: req.user.id
    });

    // Enhanced validation
    if (!propertyId) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Property ID is required'
      });
    }

    if (!roomType || !selectedRooms || !moveInDate) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: roomType, selectedRooms, moveInDate'
      });
    }

    // Parse dates
    const parsedMoveInDate = new Date(moveInDate);
    parsedMoveInDate.setUTCHours(0, 0, 0, 0);

    let parsedEndDate;
    if (endDate) {
      parsedEndDate = new Date(endDate);
      parsedEndDate.setUTCHours(0, 0, 0, 0);
    } else if (durationType === 'monthly' && durationMonths) {
      parsedEndDate = new Date(parsedMoveInDate);
      parsedEndDate.setMonth(parsedMoveInDate.getMonth() + parseInt(durationMonths));
    } else if (durationType === 'daily' && durationDays) {
      parsedEndDate = new Date(parsedMoveInDate);
      parsedEndDate.setDate(parsedMoveInDate.getDate() + parseInt(durationDays));
    } else {
      parsedEndDate = new Date(parsedMoveInDate);
      parsedEndDate.setMonth(parsedMoveInDate.getMonth() + 1);
    }

    // Check room availability
    const roomAvailability = await checkRoomAvailabilityBeforeBooking(
      propertyId, 
      selectedRooms, 
      parsedMoveInDate,
      parsedEndDate,
      session
    );

    if (!roomAvailability.available) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(409).json({
        success: false,
        message: 'Some selected rooms are not available',
        unavailableRooms: roomAvailability.unavailableRooms
      });
    }

    // Get property and user details
    const [property, user] = await Promise.all([
      Property.findById(propertyId).session(session),
      User.findById(req.user.id).session(session)
    ]);

    if (!property) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    if (!user) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Process room details
    const roomDetails = (selectedRooms || []).map(roomIdentifier => {
      try {
        const parts = roomIdentifier.split('-');
        
        if (parts.length >= 3) {
          const sharingType = parts[0];
          const roomNumber = parts[1];
          const bed = parts.slice(2).join('-');
          
          return {
            roomIdentifier: roomIdentifier,
            sharingType: sharingType,
            floor: parseInt(roomNumber.charAt(0)) || 1,
            roomNumber: roomNumber,
            bed: bed
          };
        } else {
          return {
            roomIdentifier: roomIdentifier,
            sharingType: roomType || 'unknown',
            floor: 1,
            roomNumber: 'unknown',
            bed: 'unknown'
          };
        }
      } catch (error) {
        console.error('❌ Error processing room identifier:', roomIdentifier, error);
        return {
          roomIdentifier: roomIdentifier,
          sharingType: roomType || 'unknown',
          floor: 1,
          roomNumber: 'unknown',
          bed: 'unknown'
        };
      }
    });

    console.log('🛏️ Processed room details:', roomDetails);

    // Calculate pricing - FIXED: Use provided pricing or calculate defaults
    let monthlyRent = pricing?.monthlyRent || 1; // Default to 1 if not provided
    let totalRent = pricing?.totalRent || monthlyRent;
    let advanceAmount = pricing?.advanceAmount || 0;
    let securityDeposit = pricing?.securityDeposit || 0;
    let totalAmount = pricing?.totalAmount || 0;

    // If pricing not provided, calculate defaults
    if (!pricing || Object.keys(pricing).length === 0) {
      const RoomModel = await import('../models/Room.js').then(mod => mod.default);
      const roomConfig = await RoomModel.findOne({ propertyId }).session(session);
      if (roomConfig) {
        const roomTypeConfig = roomConfig.roomTypes.find(rt => rt.type === roomType);
        if (roomTypeConfig) {
          monthlyRent = roomTypeConfig.price || 1;
          securityDeposit = (roomTypeConfig.deposit || 0) * selectedRooms.length;
        }
      }
      
      // Calculate based on duration type
      switch(durationType) {
        case 'daily':
          const dailyRate = monthlyRent / 30;
          totalRent = dailyRate * parseInt(durationDays || 1);
          advanceAmount = totalRent;
          break;
        case 'monthly':
          totalRent = monthlyRent * parseInt(durationMonths || 1);
          advanceAmount = totalRent;
          break;
        case 'custom':
          const daysDiff = calculateDaysBetween(parsedMoveInDate, parsedEndDate);
          const customDailyRate = monthlyRent / 30;
          totalRent = customDailyRate * daysDiff;
          advanceAmount = totalRent;
          break;
        default:
          advanceAmount = monthlyRent;
      }
      totalAmount = advanceAmount + securityDeposit;
    } else {
      // Use provided pricing
      monthlyRent = pricing.monthlyRent || monthlyRent;
      totalRent = pricing.totalRent || totalRent;
      advanceAmount = pricing.advanceAmount || advanceAmount;
      securityDeposit = pricing.securityDeposit || securityDeposit;
      totalAmount = pricing.totalAmount || totalAmount;
    }

    // Ensure minimum amount of 1 INR for testing
    if (totalAmount < 1) {
      totalAmount = 1;
      advanceAmount = 1;
    }

    console.log('💰 Final pricing:', {
      monthlyRent,
      totalRent,
      securityDeposit,
      advanceAmount,
      totalAmount
    });

    // Create booking data
    const bookingDataToSave = {
      userId: req.user.id,
      clientId: property.clientId,
      propertyId,
      roomType: {
        type: roomType,
        name: roomType,
        capacity: parseInt(personCount) || 1
      },
      roomDetails: roomDetails,
      moveInDate: parsedMoveInDate,
      moveOutDate: parsedEndDate,
      durationType: durationType || 'monthly',
      durationDays: durationType === 'daily' ? parseInt(durationDays) : null,
      durationMonths: durationType === 'monthly' ? parseInt(durationMonths) : null,
      personCount: parseInt(personCount) || 1,
      customerDetails: customerDetails || {},
      pricing: {
        monthlyRent: monthlyRent,
        totalRent: totalRent,
        securityDeposit: securityDeposit,
        advanceAmount: advanceAmount,
        totalAmount: totalAmount,
        maintenanceFee: pricing?.maintenanceFee || 0
      },
      paymentInfo: {
        paymentStatus: 'pending',
        paymentMethod: 'razorpay',
        paidAmount: 0,
        outstandingAmount: totalAmount
      },
      bookingStatus: 'pending_payment',
      transferStatus: 'manual_pending',
      payments: []
    };

    console.log('📝 Saving booking data...');

    const newBooking = new Booking(bookingDataToSave);
    await newBooking.save({ session });

    await session.commitTransaction();
    transactionCommitted = true;
    await session.endSession();

    console.log('✅ Booking created successfully:', newBooking._id);

    // Populate the booking for response
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('propertyId', 'name locality city');

    // Create notification AFTER transaction is committed
    try {
      await NotificationService.createBookingNotification(newBooking, 'booking_created');
      console.log('✅ Booking creation notification created successfully');
    } catch (notificationError) {
      console.error('❌ Failed to create booking notification:', notificationError);
    }

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully! Payment pending.',
      booking: {
        id: populatedBooking._id,
        propertyId: populatedBooking.propertyId._id,
        propertyName: populatedBooking.propertyId.name,
        propertyLocality: populatedBooking.propertyId.locality,
        propertyCity: populatedBooking.propertyId.city,
        roomType: populatedBooking.roomType.name,
        rooms: populatedBooking.roomDetails,
        moveInDate: populatedBooking.moveInDate,
        moveOutDate: populatedBooking.moveOutDate,
        durationType: populatedBooking.durationType,
        durationDays: populatedBooking.durationDays,
        durationMonths: populatedBooking.durationMonths,
        totalAmount: populatedBooking.pricing.totalAmount,
        status: populatedBooking.bookingStatus,
        paymentStatus: populatedBooking.paymentInfo.paymentStatus,
        customerDetails: populatedBooking.customerDetails,
        personCount: populatedBooking.personCount
      }
    });

  } catch (error) {
    // Safe transaction cleanup
    try {
      if (session.inTransaction() && !transactionCommitted) {
        await session.abortTransaction();
      }
      await session.endSession();
    } catch (sessionError) {
      console.error('❌ Session cleanup error:', sessionError);
    }
    
    console.error('❌ Booking creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update booking after payment - FIXED VERSION
export const updateBookingAfterPayment = async (bookingId, paymentData, bookingData = null) => {
  const session = await mongoose.startSession();
  let transactionCommitted = false;
  
  try {
    await session.startTransaction();

    console.log('💰 Updating booking after payment:', { 
      bookingId, 
      paymentData
    });

    // Find the booking
    let booking;
    
    if (bookingId) {
      booking = await Booking.findById(bookingId).session(session);
    }
    
    // If booking not found by ID but we have bookingData, try to find by criteria
    if (!booking && bookingData) {
      console.log('🔍 Booking not found by ID, searching by criteria...');
      booking = await Booking.findOne({
        userId: bookingData.userId,
        propertyId: bookingData.propertyId,
        bookingStatus: 'pending_payment'
      }).session(session);
    }

    if (!booking) {
      throw new Error('Booking not found. Please create a booking first.');
    }

    console.log('✅ Booking found:', booking._id);

    // Update booking with payment information
    booking.paymentInfo = {
      ...booking.paymentInfo,
      paymentStatus: 'paid',
      transactionId: paymentData.razorpay_payment_id,
      razorpayOrderId: paymentData.razorpay_order_id,
      razorpayPaymentId: paymentData.razorpay_payment_id,
      razorpaySignature: paymentData.razorpay_signature,
      paidAmount: paymentData.amount || booking.pricing.totalAmount,
      paymentDate: new Date(),
      outstandingAmount: 0
    };

    // Update booking status
    booking.bookingStatus = 'confirmed';
    
    // Add payment record
    booking.payments.push({
      date: new Date(),
      amount: paymentData.amount || booking.pricing.totalAmount,
      method: 'razorpay',
      transactionId: paymentData.razorpay_payment_id,
      status: 'completed',
      description: 'Booking payment',
      razorpayOrderId: paymentData.razorpay_order_id,
      razorpayPaymentId: paymentData.razorpay_payment_id,
      razorpaySignature: paymentData.razorpay_signature
    });

    // Update transfer status and calculate breakdown
    const transferBreakdown = calculateTransferBreakdown(booking.pricing.totalAmount);
    booking.transferStatus = 'manual_pending';
    booking.transferDetails = {
      totalAmount: booking.pricing.totalAmount,
      platformCommission: transferBreakdown.platformCommission,
      gstOnCommission: transferBreakdown.gstOnCommission,
      totalPlatformEarnings: transferBreakdown.totalPlatformEarnings,
      clientAmount: transferBreakdown.clientAmount,
      clientTransferStatus: 'pending',
      breakdown: transferBreakdown.breakdown,
      transferNotes: 'Awaiting manual transfer to property owner'
    };

    console.log('📝 Saving updated booking after payment...');

    await booking.save({ session });
    await session.commitTransaction();
    transactionCommitted = true;
    await session.endSession();

    console.log('✅ Booking updated successfully after payment:', booking._id);

    // Populate the booking with property details before returning
    const populatedBooking = await Booking.findById(booking._id)
      .populate('propertyId', 'name locality city images')
      .populate('userId', 'name email');

    // Create payment success notification
    try {
      await NotificationService.createBookingNotification(populatedBooking, 'booking_paid', {
        amount: paymentData.amount || booking.pricing.totalAmount,
        razorpayPaymentId: paymentData.razorpay_payment_id
      });
      console.log('✅ Payment success notification created');
    } catch (notificationError) {
      console.error('❌ Failed to create payment notification:', notificationError);
    }

    return populatedBooking;

  } catch (error) {
    // Safe transaction cleanup
    try {
      if (session.inTransaction() && !transactionCommitted) {
        await session.abortTransaction();
      }
      await session.endSession();
    } catch (sessionError) {
      console.error('Session cleanup error:', sessionError);
    }
    
    console.error('❌ Update booking after payment error:', error);
    throw error;
  }
};

// Calculate transfer breakdown
const calculateTransferBreakdown = (totalAmount) => {
  const platformCommission = totalAmount * 0.05;
  const gstOnCommission = platformCommission * 0.18;
  const totalPlatformEarnings = platformCommission + gstOnCommission;
  const clientAmount = totalAmount - totalPlatformEarnings;

  return {
    platformCommission,
    gstOnCommission,
    totalPlatformEarnings,
    clientAmount,
    breakdown: {
      totalPayment: totalAmount,
      platformCommissionRate: '5%',
      gstRate: '18%',
      platformCommission,
      gstOnCommission,
      clientAmount
    }
  };
};

// Check room availability for date range
export const checkRoomAvailability = async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.body;
    
    if (!propertyId || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'propertyId and startDate are required parameters'
      });
    }
    
    const parsedStartDate = new Date(startDate);
    parsedStartDate.setUTCHours(0, 0, 0, 0);
    
    let parsedEndDate;
    if (endDate) {
      parsedEndDate = new Date(endDate);
      parsedEndDate.setUTCHours(0, 0, 0, 0);
    } else {
      parsedEndDate = new Date(parsedStartDate);
      parsedEndDate.setDate(parsedStartDate.getDate() + 1);
    }
    
    // Find conflicting bookings
    const conflictingBookings = await Booking.find({
      propertyId,
      bookingStatus: { $nin: ['cancelled', 'checked_out', 'rejected'] },
      $or: [
        { moveInDate: { $lte: parsedStartDate }, moveOutDate: { $gte: parsedStartDate } },
        { moveInDate: { $gte: parsedStartDate, $lte: parsedEndDate } }
      ]
    });
    
    const unavailableRooms = conflictingBookings.flatMap(booking => 
      booking.roomDetails.map(room => room.roomIdentifier)
    );
    
    return res.status(200).json({
      success: true,
      unavailableRooms,
      startDate: parsedStartDate.toISOString().split('T')[0],
      endDate: parsedEndDate.toISOString().split('T')[0]
    });
    
  } catch (error) {
    console.error('Availability check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};



// Get all available beds with status
export const getAllAvailableBeds = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'propertyId is required parameter'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid propertyId format'
      });
    }
    
    const checkStartDate = startDate ? new Date(startDate) : new Date();
    checkStartDate.setUTCHours(0, 0, 0, 0);
    
    let checkEndDate;
    if (endDate) {
      checkEndDate = new Date(endDate);
      checkEndDate.setUTCHours(0, 0, 0, 0);
    } else {
      // Default to 1 day if no end date provided
      checkEndDate = new Date(checkStartDate);
      checkEndDate.setDate(checkStartDate.getDate() + 1);
    }
    
    if (isNaN(checkStartDate.getTime()) || isNaN(checkEndDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD.'
      });
    }
    
    // Get room configuration
    const roomConfig = await Room.findOne({ propertyId });
    if (!roomConfig) {
      return res.status(404).json({
        success: false,
        message: 'Room configuration not found for this property'
      });
    }
    
    // Find all bookings (including approved ones) that conflict with the date range
    const bookings = await Booking.find({
      propertyId,
      bookingStatus: { $nin: ['cancelled', 'rejected'] },
      $or: [
        {
          // Existing booking overlaps with our start date
          moveInDate: { $lte: checkStartDate },
          moveOutDate: { $gte: checkStartDate }
        },
        {
          // Existing booking starts during our stay
          moveInDate: { $gte: checkStartDate, $lte: checkEndDate }
        },
        {
          // Our booking encompasses an existing booking
          moveInDate: { $lte: checkStartDate },
          moveOutDate: { $gte: checkEndDate }
        }
      ]
    });
    
    // Extract all booked room identifiers with their status
    const bookedBeds = [];
    bookings.forEach(booking => {
      booking.roomDetails.forEach(room => {
        bookedBeds.push({
          roomIdentifier: room.roomIdentifier,
          status: booking.bookingStatus,
          bookingId: booking._id
        });
      });
    });
    
    // Get all available beds with status
    const bedsByFloor = {};
    let totalBeds = 0;
    let availableBeds = 0;
    let bookedBedsCount = 0;
    let approvedBedsCount = 0;
    
    for (const floorConfig of roomConfig.floorConfig.floors) {
      const floorBeds = [];
      
      // Check if rooms is a Map or regular object
      let rooms;
      if (floorConfig.rooms instanceof Map) {
        // Convert Map to object
        rooms = Object.fromEntries(floorConfig.rooms);
      } else {
        rooms = floorConfig.rooms;
      }
      
      for (const [roomNumber, beds] of Object.entries(rooms)) {
        // Get the actual room type from room configuration instead of inferring from bed count
        let roomType = 'double'; // default fallback
        
        // Try to find room type from room configuration
        const roomTypeConfig = roomConfig.roomTypes.find(rt => {
          // Check if this room matches the room type based on bed count
          return rt.capacity === beds.length;
        });
        
        if (roomTypeConfig) {
          roomType = roomTypeConfig.type;
        } else {
          // Fallback: determine room type based on bed count
          if (beds.length === 1) roomType = 'single';
          else if (beds.length === 3) roomType = 'triple';
          else if (beds.length === 4) roomType = 'four';
          else if (beds.length === 5) roomType = 'five';
          else if (beds.length === 6) roomType = 'six';
        }
        
        for (const bed of beds) {
          totalBeds++;
          
          // Use the actual bed name (with spaces) for the identifier
          const roomIdentifier = `${roomType}-${roomNumber}-${bed}`;
          
          // Check if this bed is booked
          const bookingInfo = bookedBeds.find(b => b.roomIdentifier === roomIdentifier);
          
          let status = 'available';
          if (bookingInfo) {
            if (bookingInfo.status === 'approved' || bookingInfo.status === 'confirmed') {
              status = 'approved';
              approvedBedsCount++;
            } else {
              status = 'booked';
              bookedBedsCount++;
            }
          } else {
            availableBeds++;
          }
          
          floorBeds.push({
            _id: new mongoose.Types.ObjectId(),
            roomNumber,
            bedName: bed, // Keep the actual bed name with spaces
            bedLetter: normalizeBedName(bed), // Normalized version for reference
            floor: floorConfig.floor,
            roomIdentifier,
            roomType: roomType,
            status: status,
            available: status === 'available',
            bookingId: bookingInfo?.bookingId || null
          });
        }
      }
      
      if (floorBeds.length > 0) {
        bedsByFloor[floorConfig.floor] = floorBeds;
      }
    }
    
    // Verify counts
    console.log('Bed Statistics:', {
      totalBeds,
      availableBeds,
      bookedBeds: bookedBedsCount,
      approvedBeds: approvedBedsCount,
      calculatedTotal: availableBeds + bookedBedsCount + approvedBedsCount
    });
    
    return res.status(200).json({
      success: true,
      bedsByFloor,
      checkStartDate: checkStartDate.toISOString().split('T')[0],
      checkEndDate: checkEndDate.toISOString().split('T')[0],
      statistics: {
        totalBeds,
        availableBeds,
        bookedBeds: bookedBedsCount,
        approvedBeds: approvedBedsCount
      }
    });
    
  } catch (error) {
    console.error('Get all available beds error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be cancelled (e.g., not already cancelled or checked-in)
    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.bookingStatus === 'checked_in') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking after check-in'
      });
    }

    // Update booking status to cancelled
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        bookingStatus: 'cancelled',
        'paymentInfo.paymentStatus': 'refund_pending'
      },
      { new: true }
    ).populate('propertyId', 'name');

    // ✅ FIXED: Create notification after successful cancellation
    try {
      await NotificationService.createBookingNotification(updatedBooking, 'booking_cancelled');
      console.log('✅ Booking cancellation notification created successfully');
    } catch (notificationError) {
      console.error('❌ Failed to create cancellation notification:', notificationError);
      // Don't fail the cancellation if notification fails
    }

    // TODO: Add refund logic here if needed

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get bookings by property (for clients)
export const getBookingsByProperty = async (req, res) => {
  try {
    console.log('User from request:', req.user);
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Only clients should be able to access this endpoint
    if (req.user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Client role required.'
      });
    }

    // Get clientId from the client user
    const clientId = req.user.clientId || req.user.id;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'Client ID not found'
      });
    }

    console.log('Fetching properties for clientId:', clientId);

    // Find all property IDs owned by this client
    const properties = await Property.find({ 
      clientId: clientId
    }).select('_id').lean();

    const propertyIds = properties.map((p) => p._id);

    if (propertyIds.length === 0) {
      return res.status(200).json({
        success: true,
        bookings: [],
        message: 'No properties found for this client'
      });
    }

    console.log('Found property IDs:', propertyIds);

    // Fetch bookings for the client's properties (bookings made by users)
    const bookings = await Booking.find({ propertyId: { $in: propertyIds } })
      .populate('userId', 'name email phone profileImage clientId')
      .populate('propertyId', 'name locality city')
      .sort({ createdAt: -1 });

    console.log('Found bookings:', bookings.length);

    // Manually populate approvedBy to avoid schema errors
    const bookingsWithApprovedBy = await Promise.all(
      bookings.map(async (booking) => {
        let approvedByDetails = null;
        if (booking.approvedBy) {
          try {
            const approvedUser = await User.findById(booking.approvedBy).select('name email phone');
            approvedByDetails = approvedUser ? {
              _id: approvedUser._id,
              name: approvedUser.name,
              email: approvedUser.email,
              phone: approvedUser.phone
            } : null;
          } catch (error) {
            console.error('Error fetching approvedBy user:', error);
          }
        }
        return {
          ...booking.toObject(),
          approvedByDetails
        };
      })
    );

    const formattedBookings = bookingsWithApprovedBy.map((booking) => ({
      id: booking._id,
      _id: booking._id,
      user: booking.userId ? {
        _id: booking.userId._id,
        name: booking.userId.name,
        email: booking.userId.email,
        phone: booking.userId.phone,
        clientId: booking.userId.clientId,
        profileImage: booking.userId.profileImage
      } : null,
      property: booking.propertyId ? {
        _id: booking.propertyId._id,
        name: booking.propertyId.name,
        locality: booking.propertyId.locality,
        city: booking.propertyId.city
      } : null,
      customerDetails: booking.customerDetails || {},
      roomType: booking.roomType?.name || 'N/A',
      roomNumber: booking.roomDetails?.[0]?.roomNumber || 'N/A',
      floor: booking.roomDetails?.[0]?.floor || 'N/A',
      moveInDate: booking.moveInDate,
      moveOutDate: booking.moveOutDate,
      bookingStatus: booking.bookingStatus,
      paymentInfo: booking.paymentInfo || {},
      paymentStatus: booking.paymentInfo?.paymentStatus || 'pending',
      transferStatus: booking.transferStatus || 'pending',
      pricing: booking.pricing,
      transferStatus: booking.transferStatus || 'manual_pending',
      transferDetails: booking.transferDetails || {},
      outstandingAmount: booking.outstandingAmount || 0,
      approvedBy: booking.approvedByDetails,
      approvedAt: booking.approvedAt || null,
      roomDetails: booking.roomDetails,
      createdAt: booking.createdAt
    }));

    return res.status(200).json({
      success: true,
      count: formattedBookings.length,
      bookings: formattedBookings,
    });
  } catch (error) {
    console.error('Get bookings by property error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get bookings of user (for regular users to see their own bookings)
export const getUserBookings = async (req, res) => {  
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    console.log('🔍 Fetching bookings for user ID:', req.user.id);
    console.log('🔍 User role:', req.user.role);

    // Convert user ID to ObjectId for proper querying
    let userId;
    try {
      userId = new mongoose.Types.ObjectId(req.user.id);
      console.log('🔍 Converted user ID to ObjectId:', userId);
    } catch (error) {
      console.error('❌ Invalid user ID format:', req.user.id);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // First, check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      console.log('❌ User not found in database with ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User found:', userExists.name, userExists.email);

    // Try multiple query approaches to find bookings
    let bookings = [];

    // Approach 1: Direct query with ObjectId
    bookings = await Booking.find({ userId: userId })
      .populate('propertyId', 'name locality city images')
      .sort({ createdAt: -1 })
      .lean();

    console.log('📊 Bookings found with ObjectId query:', bookings.length);

    // If no bookings found, try with string ID
    if (bookings.length === 0) {
      console.log('🔄 Trying with string ID query...');
      bookings = await Booking.find({ userId: req.user.id })
        .populate('propertyId', 'name locality city images')
        .sort({ createdAt: -1 })
        .lean();
      
      console.log('📊 Bookings found with string ID query:', bookings.length);
    }

    // Debug: Check all bookings in database to see user IDs
    if (bookings.length === 0) {
      const allBookingsSample = await Booking.find().limit(5).select('userId propertyId bookingStatus').lean();
      console.log('📋 Sample of all bookings in database:', allBookingsSample);
    }

    // Process bookings with payment data
    const processedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          // Get approved by name if exists
          let approvedByName = null;
          if (booking.approvedBy) {
            const approvedUser = await User.findById(booking.approvedBy).select('name').lean();
            approvedByName = approvedUser?.name || null;
          }

          // Calculate payment summary
          const paymentSummary = calculatePaymentSummary(booking);

          // Format room details
          const roomDetails = booking.roomDetails || [];
          const primaryRoom = roomDetails[0] || {};

          return {
            id: booking._id,
            _id: booking._id,
            property: booking.propertyId ? {
              _id: booking.propertyId._id,
              name: booking.propertyId.name,
              locality: booking.propertyId.locality,
              city: booking.propertyId.city,
              images: booking.propertyId.images || []
            } : null,
            roomType: booking.roomType?.name || 'N/A',
            roomNumber: primaryRoom.roomNumber || 'N/A',
            floor: primaryRoom.floor || 'N/A',
            bed: primaryRoom.bed || 'N/A',
            moveInDate: booking.moveInDate,
            moveOutDate: booking.moveOutDate,
            durationType: booking.durationType,
            durationDays: booking.durationDays,
            durationMonths: booking.durationMonths,
            personCount: booking.personCount,
            bookingStatus: booking.bookingStatus,
            
            // Enhanced Payment Data
            paymentInfo: {
              paymentStatus: booking.paymentInfo?.paymentStatus || 'pending',
              paymentMethod: booking.paymentInfo?.paymentMethod || 'razorpay',
              paidAmount: booking.paymentInfo?.paidAmount || 0,
              transactionId: booking.paymentInfo?.transactionId || null,
              paymentDate: booking.paymentInfo?.paymentDate || null,
              razorpayOrderId: booking.paymentInfo?.razorpayOrderId || null,
              razorpayPaymentId: booking.paymentInfo?.razorpayPaymentId || null
            },
            
            // All Payments History
            payments: (booking.payments || []).map(payment => ({
              date: payment.date,
              amount: payment.amount,
              method: payment.method,
              status: payment.status,
              transactionId: payment.transactionId,
              description: payment.description,
              razorpayOrderId: payment.razorpayOrderId,
              razorpayPaymentId: payment.razorpayPaymentId
            })),
            
            // Pricing Details
            pricing: booking.pricing || {
              monthlyRent: 0,
              totalRent: 0,
              securityDeposit: 0,
              advanceAmount: 0,
              totalAmount: 0,
              maintenanceFee: 0
            },
            
            // Payment Summary
            paymentSummary: paymentSummary,
            
            transferStatus: booking.transferStatus || 'pending',
            transferDetails: booking.transferDetails || {},
            approvedBy: approvedByName,
            approvedAt: booking.approvedAt || null,
            roomDetails: roomDetails,
            customerDetails: booking.customerDetails || {},
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
          };
        } catch (error) {
          console.error('❌ Error processing booking:', booking._id, error);
          return null;
        }
      })
    );

    // Filter out any null results from errors
    const validBookings = processedBookings.filter(booking => booking !== null);

    console.log('✅ Successfully processed bookings:', validBookings.length);

    return res.status(200).json({
      success: true,
      count: validBookings.length,
      bookings: validBookings,
      message: validBookings.length === 0 ? 'No bookings found for this user' : 'Bookings retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Get user bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Enhanced payment summary calculator
const calculatePaymentSummary = (booking) => {
  try {
    const pricing = booking.pricing || {};
    const payments = booking.payments || [];
    const paymentInfo = booking.paymentInfo || {};

    const totalAmount = pricing.totalAmount || 0;
    const securityDeposit = pricing.securityDeposit || 0;
    const maintenanceFee = pricing.maintenanceFee || 0;
    const monthlyRent = pricing.monthlyRent || 0;
    const totalRent = pricing.totalRent || 0;
    const advanceAmount = pricing.advanceAmount || 0;
    
    const totalDue = totalAmount + securityDeposit + maintenanceFee;
    
    // Calculate total paid from payments array
    const totalPaidFromPayments = payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    // Use paymentInfo.paidAmount as fallback
    const paidFromPaymentInfo = paymentInfo.paidAmount || 0;
    
    // Use the higher value between payments array and paymentInfo
    const finalPaidAmount = Math.max(totalPaidFromPayments, paidFromPaymentInfo);
    
    const outstandingAmount = Math.max(0, totalDue - finalPaidAmount);
    const paymentProgress = totalDue > 0 ? (finalPaidAmount / totalDue) * 100 : 0;

    return {
      totalDue,
      totalPaid: finalPaidAmount,
      outstandingAmount,
      securityDeposit,
      maintenanceFee,
      monthlyRent,
      totalRent,
      advanceAmount,
      isFullyPaid: outstandingAmount === 0,
      paymentProgress: Math.round(paymentProgress),
      currency: 'INR'
    };
  } catch (error) {
    console.error('Error calculating payment summary:', error);
    return {
      totalDue: 0,
      totalPaid: 0,
      outstandingAmount: 0,
      securityDeposit: 0,
      maintenanceFee: 0,
      monthlyRent: 0,
      totalRent: 0,
      advanceAmount: 0,
      isFullyPaid: false,
      paymentProgress: 0,
      currency: 'INR'
    };
  }
};

// Debug endpoint to check user's booking data
export const debugUserBookings = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    console.log('🔧 Debug endpoint called for user:', req.user.id);

    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Check user existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database'
      });
    }

    // Check all bookings for this user (raw query)
    const bookings = await Booking.find({ userId: userId })
      .select('_id userId propertyId bookingStatus paymentInfo.paymentStatus createdAt moveInDate')
      .populate('propertyId', 'name')
      .lean();

    // Check if there are any bookings in the entire database
    const totalBookings = await Booking.countDocuments();
    const allBookingsSample = await Booking.find().limit(5)
      .select('userId propertyId bookingStatus')
      .populate('propertyId', 'name')
      .lean();

    return res.status(200).json({
      success: true,
      debugInfo: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          clientId: user.clientId
        },
        userBookings: {
          count: bookings.length,
          bookings: bookings.map(b => ({
            _id: b._id,
            userId: b.userId,
            property: b.propertyId?.name,
            bookingStatus: b.bookingStatus,
            paymentStatus: b.paymentInfo?.paymentStatus,
            moveInDate: b.moveInDate,
            createdAt: b.createdAt
          }))
        },
        databaseInfo: {
          totalBookings: totalBookings,
          sampleBookings: allBookingsSample.map(b => ({
            _id: b._id,
            userId: b.userId,
            property: b.propertyId?.name,
            bookingStatus: b.bookingStatus
          }))
        },
        queryUsed: {
          userId: userId,
          userIdString: req.user.id
        }
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Debug endpoint error',
      error: error.message
    });
  }
};

// Get single booking with complete payment details
export const getBookingWithPaymentDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate('propertyId', 'name locality city images amenities address')
      .populate('approvedBy', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own bookings.'
      });
    }

    // Calculate payment summary
    const paymentSummary = calculatePaymentSummary(booking);

    const response = {
      success: true,
      booking: {
        id: booking._id,
        _id: booking._id,
        
        // Property Details
        property: booking.propertyId ? {
          _id: booking.propertyId._id,
          name: booking.propertyId.name,
          locality: booking.propertyId.locality,
          city: booking.propertyId.city,
          images: booking.propertyId.images || [],
          amenities: booking.propertyId.amenities || [],
          address: booking.propertyId.address || {}
        } : null,
        
        // Room Details
        roomType: booking.roomType?.name || 'N/A',
        roomDetails: booking.roomDetails || [],
        
        // Dates
        moveInDate: booking.moveInDate,
        moveOutDate: booking.moveOutDate,
        durationType: booking.durationType,
        durationDays: booking.durationDays,
        durationMonths: booking.durationMonths,
        
        // Status
        bookingStatus: booking.bookingStatus,
        transferStatus: booking.transferStatus || 'pending',
        
        // Customer Details
        customerDetails: booking.customerDetails || {},
        personCount: booking.personCount,
        
        // Complete Payment Information
        paymentInfo: {
          paymentStatus: booking.paymentInfo?.paymentStatus || 'pending',
          paymentMethod: booking.paymentInfo?.paymentMethod || 'razorpay',
          paidAmount: booking.paymentInfo?.paidAmount || 0,
          transactionId: booking.paymentInfo?.transactionId,
          razorpayOrderId: booking.paymentInfo?.razorpayOrderId,
          razorpayPaymentId: booking.paymentInfo?.razorpayPaymentId,
          razorpaySignature: booking.paymentInfo?.razorpaySignature,
          paymentDate: booking.paymentInfo?.paymentDate
        },
        
        // All Payments History
        payments: booking.payments?.map(payment => ({
          _id: payment._id,
          date: payment.date,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          transactionId: payment.transactionId,
          description: payment.description,
          razorpayOrderId: payment.razorpayOrderId,
          razorpayPaymentId: payment.razorpayPaymentId,
          razorpaySignature: payment.razorpaySignature
        })) || [],
        
        // Pricing Breakdown
        pricing: {
          monthlyRent: booking.pricing?.monthlyRent || 0,
          totalRent: booking.pricing?.totalRent || 0,
          securityDeposit: booking.pricing?.securityDeposit || 0,
          advanceAmount: booking.pricing?.advanceAmount || 0,
          totalAmount: booking.pricing?.totalAmount || 0,
          maintenanceFee: booking.pricing?.maintenanceFee || 0
        },
        
        // Payment Summary
        paymentSummary: paymentSummary,
        
        // Approval Information
        approvedBy: booking.approvedBy ? {
          name: booking.approvedBy.name,
          email: booking.approvedBy.email
        } : null,
        approvedAt: booking.approvedAt,
        
        // Timestamps
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }
    };

    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Get booking with payment details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }
    
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email phone clientId profileImage')
      .populate('propertyId', 'name locality city images')
      .populate('approvedBy', 'name');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user has permission to view this booking
    if (req.user.role === 'user' && booking.userId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }
    
    // For clients, check if they own the property
    if (req.user.role === 'client') {
      const property = await Property.findById(booking.propertyId);
      if (!property || property.clientId.toString() !== req.user.clientId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this booking'
        });
      }
    }
    
    const formattedBooking = {
      id: booking._id,
      user: booking.userId ? {
        _id: booking.userId._id,
        name: booking.userId.name,
        email: booking.userId.email,
        phone: booking.userId.phone,
        clientId: booking.userId.clientId,
        profileImage: booking.userId.profileImage
      } : null,
      property: booking.propertyId ? {
        _id: booking.propertyId._id,
        name: booking.propertyId.name,
        locality: booking.propertyId.locality,
        city: booking.propertyId.city,
        images: booking.propertyId.images || []
      } : null,
      roomType: booking.roomType?.name || 'N/A',
      roomDetails: booking.roomDetails,
      moveInDate: booking.moveInDate,
      moveOutDate: booking.moveOutDate,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentInfo?.paymentStatus || 'pending',
      transferStatus: booking.transferStatus || 'pending',
      pricing: booking.pricing,
      transferDetails: booking.transferDetails || {},
      payments: booking.payments || [],
      outstandingAmount: booking.outstandingAmount,
      approvedBy: booking.approvedBy?.name || null,
      approvedAt: booking.approvedAt || null,
      createdAt: booking.createdAt
    };
    
    return res.status(200).json({
      success: true,
      booking: formattedBooking
    });
    
  } catch (error) {
    console.error('Get booking by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Approve booking
export const approveBooking = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Only clients can approve bookings
    if (req.user.role !== 'client') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only clients can approve bookings' 
      });
    }

    const { bookingId } = req.params;
    
    // First, check if the booking belongs to one of the client's properties
    const booking = await Booking.findById(bookingId).populate('propertyId');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify that the client owns this property
    const clientProperties = await Property.find({ 
      clientId: req.user.clientId || req.user.id 
    }).select('_id');

    const clientPropertyIds = clientProperties.map(p => p._id.toString());
    
    if (!clientPropertyIds.includes(booking.propertyId._id.toString())) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only approve bookings for your own properties' 
      });
    }

    // Update the booking status
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        bookingStatus: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date() 
      },
      { new: true }
    )
    .populate('userId', 'name email phone')
    .populate('propertyId', 'name locality city');

    // ✅ FIXED: Create notification after successful approval
    try {
      await NotificationService.createBookingNotification(updatedBooking, 'booking_approved');
      console.log('✅ Booking approval notification created successfully');
    } catch (notificationError) {
      console.error('❌ Failed to create approval notification:', notificationError);
      // Don't fail the approval if notification fails
    }

    return res.status(200).json({
      success: true,
      message: 'Booking approved successfully',
      booking: {
        id: updatedBooking._id,
        user: updatedBooking.userId ? {
          name: updatedBooking.userId.name,
          email: updatedBooking.userId.email,
          phone: updatedBooking.userId.phone
        } : null,
        property: updatedBooking.propertyId ? {
          name: updatedBooking.propertyId.name,
          locality: updatedBooking.propertyId.locality,
          city: updatedBooking.propertyId.city
        } : null,
        roomType: updatedBooking.roomType?.name,
        moveInDate: updatedBooking.moveInDate,
        bookingStatus: updatedBooking.bookingStatus,
        paymentStatus: updatedBooking.paymentInfo?.paymentStatus,
        transferStatus: updatedBooking.transferStatus,
        approvedAt: updatedBooking.approvedAt
      }
    });

  } catch (error) {
    console.error('Approval error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Reject booking
export const rejectBooking = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { bookingId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        bookingStatus: 'rejected',
        rejectedBy: req.user.id,
        rejectionReason: reason,
        approvedAt: new Date() 
      },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

     // ✅ FIXED: Create notification after successful rejection
    try {
      await NotificationService.createBookingNotification(booking, 'booking_rejected', {
        rejectionReason: reason
      });
      console.log('✅ Booking rejection notification created successfully');
    } catch (notificationError) {
      console.error('❌ Failed to create rejection notification:', notificationError);
      // Don't fail the rejection if notification fails
    }

    return res.status(200).json({
      success: true,
      message: 'Booking rejected successfully',
      booking
    });

  } catch (error) {
    console.error('Rejection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all bookings (admin)
export const getallBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('userId', 'name email phone clientId')
      .populate('propertyId', 'name locality city')
      .sort({ createdAt: -1 });

    const formattedBookings = bookings.map(booking => {
      // Get all room numbers, floors, and beds
      const roomNumbers = booking.roomDetails?.map(room => room.roomNumber).filter(Boolean) || [];
      const floors = booking.roomDetails?.map(room => room.floor).filter(Boolean) || [];
      const beds = booking.roomDetails?.map(room => room.bed).filter(Boolean) || [];
      
      // Create unique arrays
      const uniqueRoomNumbers = [...new Set(roomNumbers)];
      const uniqueFloors = [...new Set(floors)];
      const uniqueBeds = [...new Set(beds)];

      return {
        id: booking._id,
        
        user: booking.userId ? {
          name: booking.userId.name,
          email: booking.userId.email,
          phone: booking.userId.phone,
          clientId: booking.userId.clientId,
        } : null,
        clientId: booking.clientId,
        property: booking.propertyId ? {
          name: booking.propertyId.name,
          locality: booking.propertyId.locality,
          city: booking.propertyId.city,
          _id: booking.propertyId._id // Add property ID for transfer
        } : null,
        roomType: booking.roomType?.name || 'N/A',
        // Display first room or summary for multiple rooms
        roomNumber: uniqueRoomNumbers.length > 0 ? 
                   (uniqueRoomNumbers.length === 1 ? uniqueRoomNumbers[0] : `${uniqueRoomNumbers.length} rooms`) : 'N/A',
        floor: uniqueFloors.length > 0 ? 
              (uniqueFloors.length === 1 ? uniqueFloors[0] : `${uniqueFloors.length} floors`) : 'N/A',
        bed: uniqueBeds.length > 0 ? 
            (uniqueBeds.length === 1 ? uniqueBeds[0] : `${uniqueBeds.length} beds`) : 'N/A',
        // Include all room details
        roomDetails: booking.roomDetails || [],
        totalRooms: booking.roomDetails?.length || 0,
        moveInDate: booking.moveInDate,
        moveOutDate: booking.moveOutDate,
        status: booking.bookingStatus,
        paymentInfo: booking.paymentInfo || {},
        paymentStatus: booking.paymentInfo?.paymentStatus || 'pending',
        transferStatus: booking.transferStatus || 'pending',
        transferDetails: booking.transferDetails || {},
        payments: booking.payments || [],
        pricing: booking.pricing,
        approvedBy: booking.approvedBy || null,
        approvedAt: booking.approvedAt || null
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedBookings.length,
      bookings: formattedBookings
    });

  } catch (error) {
    console.error('Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get available rooms and beds by floor for a property
export const getAvailableRoomsAndBeds = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { date } = req.query;
    
    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'propertyId is required parameter'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid propertyId format'
      });
    }
    
    const checkDate = date ? new Date(date) : new Date();
    checkDate.setUTCHours(0, 0, 0, 0);
    
    if (isNaN(checkDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD.'
      });
    }
    
    // Get property details
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Get room configuration
    const roomConfig = await Room.findOne({ propertyId });
    if (!roomConfig) {
      return res.status(404).json({
        success: false,
        message: 'Room configuration not found for this property'
      });
    }
    
    // Find all bookings that conflict with the selected date
    const conflictingBookings = await Booking.find({
      propertyId,
      bookingStatus: { $nin: ['cancelled', 'checked_out', 'rejected'] },
      $or: [
        {
          moveInDate: { $lte: checkDate },
          moveOutDate: { $gte: checkDate }
        },
        {
          moveInDate: checkDate
        }
      ]
    });
    
    // Extract unavailable room identifiers
    const unavailableBeds = conflictingBookings.flatMap(booking => 
      booking.roomDetails.map(room => room.roomIdentifier)
    );
    
    // Structure response by floor and room type
    const availabilityByFloor = {};
    
    for (const floorConfig of roomConfig.floorConfig.floors) {
      const floorNumber = floorConfig.floor;
      availabilityByFloor[floorNumber] = {};
      
      // Initialize room types for this floor
      roomConfig.roomTypes.forEach(roomType => {
        availabilityByFloor[floorNumber][roomType.type] = {
          label: roomType.label,
          capacity: roomType.capacity,
          price: roomType.price,
          deposit: roomType.deposit,
          availableBeds: 0,
          totalBeds: 0,
          rooms: []
        };
      });
      
      // Process each room on this floor
      for (const [roomNumber, beds] of Object.entries(floorConfig.rooms)) {
        const roomData = {
          roomNumber,
          beds: [],
          availableBeds: 0,
          totalBeds: beds.length
        };
        
        // Process each bed in the room
        for (const bed of beds) {
          // Determine room type from bed configuration
          let roomType = 'double'; // default
          if (beds.length === 1) roomType = 'single';
          else if (beds.length === 3) roomType = 'triple';
          else if (beds.length === 4) roomType = 'quad';
          else if (beds.length === 5) roomType = 'quint';
          else if (beds.length === 6) roomType = 'hex';
          
          const roomIdentifier = `${roomType}-${roomNumber}-${normalizeBedName(bed)}`;
          const isAvailable = !unavailableBeds.includes(roomIdentifier);
          
          const bedData = {
            bedName: bed,
            bedLetter: normalizeBedName(bed),
            roomIdentifier,
            available: isAvailable,
            roomType
          };
          
          roomData.beds.push(bedData);
          if (isAvailable) {
            roomData.availableBeds++;
            
            // Update floor-level statistics
            if (availabilityByFloor[floorNumber][roomType]) {
              availabilityByFloor[floorNumber][roomType].availableBeds++;
              availabilityByFloor[floorNumber][roomType].totalBeds++;
            }
          } else if (availabilityByFloor[floorNumber][roomType]) {
            availabilityByFloor[floorNumber][roomType].totalBeds++;
          }
        }
        
        // Add room to appropriate room type category
        if (roomData.beds.length > 0) {
          const primaryRoomType = roomData.beds[0].roomType;
          if (availabilityByFloor[floorNumber][primaryRoomType]) {
            availabilityByFloor[floorNumber][primaryRoomType].rooms.push(roomData);
          }
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      property: {
        id: property._id,
        name: property.name,
        locality: property.locality,
        city: property.city
      },
      checkDate: checkDate.toISOString().split('T')[0],
      availabilityByFloor,
      summary: {
        totalAvailableBeds: Object.values(availabilityByFloor).reduce((total, floor) => {
          return total + Object.values(floor).reduce((floorTotal, roomType) => {
            return floorTotal + roomType.availableBeds;
          }, 0);
        }, 0),
        totalBeds: Object.values(availabilityByFloor).reduce((total, floor) => {
          return total + Object.values(floor).reduce((floorTotal, roomType) => {
            return floorTotal + roomType.totalBeds;
          }, 0);
        }, 0)
      }
    });
    
  } catch (error) {
    console.error('Get available rooms and beds error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get available beds by specific room type with booking status
export const getAvailableBedsByRoomType = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { roomType, date } = req.query;
    
    if (!propertyId || !roomType) {
      return res.status(400).json({
        success: false,
        message: 'propertyId and roomType are required parameters'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid propertyId format'
      });
    }
    
    const checkDate = date ? new Date(date) : new Date();
    checkDate.setUTCHours(0, 0, 0, 0);
    
    if (isNaN(checkDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD.'
      });
    }
    
    // Get room configuration
    const roomConfig = await Room.findOne({ propertyId });
    if (!roomConfig) {
      return res.status(404).json({
        success: false,
        message: 'Room configuration not found for this property'
      });
    }
    
    // Find all bookings (including approved ones)
    const bookings = await Booking.find({
      propertyId,
      bookingStatus: { $nin: ['cancelled', 'rejected'] },
      $or: [
        {
          moveInDate: { $lte: checkDate },
          moveOutDate: { $gte: checkDate }
        },
        {
          moveInDate: checkDate
        }
      ]
    });
    
    // Extract all booked room identifiers with their status
    const bookedBeds = [];
    bookings.forEach(booking => {
      booking.roomDetails.forEach(room => {
        bookedBeds.push({
          roomIdentifier: room.roomIdentifier,
          status: booking.bookingStatus,
          bookingId: booking._id
        });
      });
    });
    
    // Get available beds for the specified room type with status
    const bedsByFloor = {};
    let totalBeds = 0;
    let availableBeds = 0;
    let bookedBedsCount = 0;
    let approvedBedsCount = 0;
    
    for (const floorConfig of roomConfig.floorConfig.floors) {
      const floorBeds = [];
      
      for (const [roomNumber, beds] of Object.entries(floorConfig.rooms)) {
        // Check if this room matches the requested room type based on bed count
        let matchesRoomType = false;
        
        if (roomType === 'single' && beds.length === 1) matchesRoomType = true;
        else if (roomType === 'double' && beds.length === 2) matchesRoomType = true;
        else if (roomType === 'triple' && beds.length === 3) matchesRoomType = true;
        else if (roomType === 'quad' && beds.length === 4) matchesRoomType = true;
        else if (roomType === 'quint' && beds.length === 5) matchesRoomType = true;
        else if (roomType === 'hex' && beds.length === 6) matchesRoomType = true;
        
        if (matchesRoomType) {
          for (const bed of beds) {
            totalBeds++;
            const roomIdentifier = `${roomType}-${roomNumber}-${normalizeBedName(bed)}`;
            
            // Check if this bed is booked
            const bookingInfo = bookedBeds.find(b => b.roomIdentifier === roomIdentifier);
            
            let status = 'available';
            if (bookingInfo) {
              if (bookingInfo.status === 'approved' || bookingInfo.status === 'confirmed') {
                status = 'approved';
                approvedBedsCount++;
              } else {
                status = 'booked';
                bookedBedsCount++;
              }
            } else {
              availableBeds++;
            }
            
            floorBeds.push({
              _id: new mongoose.Types.ObjectId(),
              roomNumber,
              bedLetter: normalizeBedName(bed),
              actualBedName: bed,
              floor: floorConfig.floor,
              roomIdentifier,
              status: status,
              available: status === 'available',
              bookingId: bookingInfo?.bookingId || null
            });
          }
        }
      }
      
      if (floorBeds.length > 0) {
        bedsByFloor[floorConfig.floor] = floorBeds;
      }
    }
    
    return res.status(200).json({
      success: true,
      roomType,
      bedsByFloor,
      checkDate: checkDate.toISOString().split('T')[0],
      statistics: {
        totalBeds,
        availableBeds,
        bookedBeds: bookedBedsCount,
        approvedBeds: approvedBedsCount
      }
    });
    
  } catch (error) {
    console.error('Get available beds by room type error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};