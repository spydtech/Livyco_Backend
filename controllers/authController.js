// authController.js
import User from "../models/User.js";
import { v4 as uuidv4 } from "uuid";
import { generateToken } from "../utils/jwtUtils.js";
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { cloudinary } from "../config/cloudinaryConfig.js";
import crypto from 'crypto';
import admin from './../config/firebase.js';
import Admin from "../models/Admin.js";
// Helper function to delete uploaded files on error

const cleanupCloudinaryUpload = async (publicId) => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (err) {
    console.error('Error cleaning up Cloudinary file:', err);
  }
};




// Check user exists for both client and user
export const checkUserExists = async (req, res) => {
  const { phone, role } = req.body;

  if (!phone) {
    return res.status(400).json({ 
      success: false, 
      message: "Phone number is required" 
    });
  }

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Phone number not registered. Please register first."
      });
    }

    // If role is specified, check if user has that role
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${role} login only.`
      });
    }

    return res.status(200).json({
      success: true,
      message: "User found. You can proceed with OTP verification.",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        clientId: user.clientId,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Check user error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to check user",
      error: error.message
    });
  }
};

// Universal OTP verification for both client and user
export const verifyFirebaseOTP = async (req, res) => {
  const { idToken, role } = req.body;

  console.log("=== FIREBASE OTP VERIFICATION START ===");
  console.log("Role requested:", role);

  try {
    if (!idToken) {
      console.log("ERROR: No ID token provided");
      return res.status(400).json({
        success: false,
        message: "ID token is required"
      });
    }

    console.log("ID token received, verifying...");

    // Verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log("✅ Token verified successfully");
    } catch (verifyError) {
      console.error("❌ Token verification failed:", verifyError);
      
      return res.status(401).json({
        success: false,
        message: "Token verification failed",
        error: verifyError.message,
        code: verifyError.code
      });
    }

    console.log("Decoded token phone:", decodedToken.phone_number);

    const phoneNumber = decodedToken.phone_number;
    const phoneDigits = phoneNumber.replace(/\D/g, '').slice(-10);
    console.log("Extracted phone digits:", phoneDigits);

    // Find user in database - use lean() to avoid Mongoose document
    const user = await User.findOne({ phone: phoneDigits }).lean();
    console.log("User found:", user ? `${user.phone} (${user.role})` : "NOT FOUND");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first."
      });
    }

    // If role is specified, verify user has the correct role
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${role} login only. Your account is ${user.role}.`
      });
    }

    // Update last login WITHOUT using save() to avoid validation
    await User.updateOne(
      { _id: user._id }, 
      { 
        $set: { 
          lastLogin: new Date()
        } 
      }
    );

    // Generate JWT token
    const token = generateToken(user);

    console.log("=== FIREBASE OTP VERIFICATION SUCCESS ===");

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        clientId: user.clientId,
        role: user.role
      }
    });

  } catch (error) {
    console.error("=== FIREBASE OTP VERIFICATION ERROR ===");
    console.error("Unexpected error:", error);

    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "User profile incomplete. Please complete your profile.",
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message
    });
  }
};

// Separate endpoints for specific roles
export const verifyClientOTP = async (req, res) => {
  req.body.role = 'client';
  return verifyFirebaseOTP(req, res);
};

export const verifyUserOTP = async (req, res) => {
  req.body.role = 'user';
  return verifyFirebaseOTP(req, res);
};

// Health check endpoint



export const healthCheck = async (req, res) => {
  try {
    const health = {
      success: true,
      message: "Service is healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        firebase: "connected"
      }
    };

    // Test database connection
    await User.findOne().limit(1);
    
    // Test Firebase connection
    await admin.auth().listUsers(1);

    res.status(200).json(health);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Service health check failed",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};


export const sendOTP = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ 
      success: false, 
      message: "Phone number is required" 
    });
  }

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Phone number not registered. Please register first."
      });
    }

    // In a real app, you would send OTP here
    // For now, we'll just return success
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      phone: user.phone
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to process OTP request",
      error: error.message
    });
  }
};


export const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    // In a real app, verify OTP with Firebase
    // For now, we'll assume OTP is valid
    
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

     const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        location: user.location,
        clientId: user.clientId,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// export const verifyOTP = async (req, res) => {
//   const { phone, otp } = req.body;

//   try {
//     // Validate input
//     if (!phone || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Phone and OTP are required"
//       });
//     }

//     // Check if OTP exists and is valid
//     const storedData = otpStore.get(phone);
    
//     if (!storedData) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP expired or not found. Please request a new OTP."
//       });
//     }

//     // Check if OTP expired
//     if (Date.now() > storedData.expiresAt) {
//       otpStore.delete(phone);
//       return res.status(400).json({
//         success: false,
//         message: "OTP expired. Please request a new OTP."
//       });
//     }

//     // Verify OTP
//     if (storedData.otp !== otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP. Please try again."
//       });
//     }

//     // OTP verified successfully - remove from store
//     otpStore.delete(phone);

//     // Find user
//     const user = await User.findOne({ phone });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     // Generate JWT token
//     const token = generateToken(user);

//     return res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         phone: user.phone,
//         location: user.location,
//         clientId: user.clientId,
//         role: user.role
//       }
//     });

//   } catch (error) {
//     console.error('Login error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Login failed',
//       error: error.message
//     });
//   }
// };

//   if (user.role === 'client') {
//     baseResponse.businessName = user.businessName;
//   } else if (user.role === 'user') {
//     baseResponse.preferences = user.preferences;
//   }

//   return baseResponse;

// Registration with auto-generated clientId
// export const register = async (req, res) => {
//   const { name, phone, location, role } = req.body;

//   if (!name || !phone || !location) {
//     return res.status(400).json({ 
//       success: false, 
//       message: 'Name, phone, and location are required' 
//     });
//   }

//   try {
//     // Check if phone exists
//     const existingUser = await User.findOne({ phone });
//     if (existingUser) {
//       return res.status(409).json({ 
//         success: false, 
//         message: 'User with this phone already exists' 
//       });
//     }

//     // Create new user (clientId will be auto-generated)
//     const newUser = new User({ 
//       name, 
//       phone, 
//       location, 

//       role 
//     });

//     // Manually validate if needed
//     await newUser.validate();
    
//     const savedUser = await newUser.save();
//     const token = generateToken(savedUser);

//     return res.status(201).json({
//       success: true,
//       message: 'Registration successful',
//       token,
//       user: {
//         id: savedUser._id,
//         name: savedUser.name,
//         phone: savedUser.phone,
//         location: savedUser.location,
//         clientId: savedUser.clientId,
//         role: savedUser.role
//       }
//     });

//   } catch (error) {
//     console.error('Registration error:', error);
//     return res.status(500).json({ 
//       success: false, 
//       message: 'Registration failed', 
//       error: error.message 
//     });
//   }
// };



// Universal registration for both client and user
// Universal registration for both client and user
export const register = async (req, res) => {
  const { name, phone, email, role = 'user' } = req.body;

  console.log("=== REGISTRATION START ===");
  console.log("Registration data:", { name, phone, email, role });

  // Validate required fields
  if (!name || !phone || !email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Name, phone, and email are required' 
    });
  }

  // Validate phone format
  const phoneRegex = /^[0-9]{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid phone number (10-15 digits)'
    });
  }

  // Validate email format
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address'
    });
  }

  // Validate role
  if (role && !['client', 'user'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role. Must be either "client" or "user"'
    });
  }

  try {
    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this phone number already exists. Please login instead.' 
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this email already exists. Please use a different email.' 
      });
    }

    // Create new user
    const newUser = new User({ 
      name, 
      phone, 
      email,
      role 
    });

    console.log("New user object:", newUser);

    // Validate the user data
    try {
      await newUser.validate();
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return res.status(400).json({
        success: false,
        message: 'Invalid user data',
        error: validationError.message
      });
    }

    // Save the user (clientId will be auto-generated by the pre-save hook)
    const savedUser = await newUser.save();
    console.log("User saved successfully:", savedUser);

    // Generate JWT token
    const token = generateToken(savedUser);

    console.log("=== REGISTRATION SUCCESS ===");

    return res.status(201).json({
      success: true,
      message: `Registration successful! Welcome ${savedUser.role}.`,
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        phone: savedUser.phone,
        email: savedUser.email,
        clientId: savedUser.clientId,
        role: savedUser.role
      }
    });

  } catch (error) {
    console.error("=== REGISTRATION ERROR ===");
    console.error("Registration error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const fieldName = field === 'phone' ? 'phone number' : 'email';
      return res.status(409).json({
        success: false,
        message: `User with this ${fieldName} already exists`,
        error: 'Duplicate entry'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.', 
      error: error.message 
    });
  }
};

// Role-specific registration endpoints
export const registerClient = async (req, res) => {
  req.body.role = 'client';
  return register(req, res);
};

export const registerUser = async (req, res) => {
  req.body.role = 'user';
  return register(req, res);
};

// Add tenant by client
// This function allows a client to add a new tenant (user) under their management
// Updated addTenantByClient function with Cloudinary
export const addTenantByClient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      gender,
      dob,
      aadhaarNumber,
      whatsappUpdates,
      userType,
      instituteName,
      guardianName,
      guardianContact
    } = req.body;

    // Validation
    if (!name || !phone || !location || !aadhaarNumber) {
      if (req.file?.filename) {
        await cleanupCloudinaryUpload(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        message: 'Name, phone, location, and Aadhaar are required'
      });
    }

    // Check for existing users
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      if (req.file?.filename) {
        await cleanupCloudinaryUpload(req.file.filename);
      }
      return res.status(409).json({
        success: false,
        message: 'User with this phone already exists'
      });
    }

    const existingAadhaar = await User.findOne({ aadhaarNumber });
    if (existingAadhaar) {
      if (req.file?.filename) {
        await cleanupCloudinaryUpload(req.file.filename);
      }
      return res.status(409).json({
        success: false,
        message: 'User with this Aadhaar number already exists'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aadhar photo is required'
      });
    }

    // Create new tenant
    const newTenant = new User({
      name,
      email: email || undefined,
      phone,
      location,
      gender,
      dob: dob ? new Date(dob) : null,
      aadhaarNumber,
      aadharPhoto: req.file?.path || undefined, // Make it optional
      aadharPhotoPublicId: req.file?.filename || undefined, // Make it optional
      role: 'user',
      whatsappUpdates: whatsappUpdates === 'true' || whatsappUpdates === true,
      userType,
      instituteName: instituteName || undefined,
      guardianName: guardianName || undefined,
      guardianContact: guardianContact || undefined,
      allocationStatus: 'not allocated'
    });

    // Generate clientId for tenant
    const savedUser = await newTenant.save();
    const token = generateToken(savedUser);
   

    return res.status(201).json({
      success: true,
      message: 'Tenant added successfully',
     token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        phone: savedUser.phone,
        location: savedUser.location,
        clientId: savedUser.clientId,
        role: savedUser.role
      }
    });

  } catch (error) {
    if (req.file?.filename) {
      await cleanupCloudinaryUpload(req.file.filename);
    }
    
    console.error('Add tenant error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate key error - please try again',
        error: 'The system generated a duplicate ID'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to add tenant',
      error: error.message
    });
  }
};
 
 


// Add this to your existing authController.js
export const getUser = async (req, res) => {
  try {
    // User is attached to req by verifyToken middleware
    const user = req.user;
 
    // Fetch the complete user document from database
    const fullUser = await User.findById(user.id);
 
    if (!fullUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
 
    // Basic user response
    const userResponse = {
      id: fullUser._id,
      name: fullUser.name,
      gender:fullUser.gender,
      dob:fullUser.dob,
      phone: fullUser.phone,
      email: fullUser.email,
      location: fullUser.location,
      userType:fullUser.userType,
      clientId: fullUser.clientId,
 
      // Institute / education fields
      institute:fullUser.instituteName,
      instituteName: fullUser.instituteName,
      guardianName: fullUser.guardianName,
      guardianContact: fullUser.guardianContact,
 
      // Professional fields
      organizationName: fullUser.organizationName,
      emergencyContactName: fullUser.emergencyContactName,
      emergencyContactNumber: fullUser.emergencyContactNumber,
 
      // KYC fields
      aadhar: fullUser.aadhaarNumber,
      aadhaarNumber: fullUser.aadhaarNumber,
      aadharPhoto: fullUser.aadharPhoto,
 
      // Profile image & preferences
      profileImage: fullUser.profileImage,
      whatsappUpdates: fullUser.whatsappUpdates,
 
      role: fullUser.role,
    };
 
    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message
    });
  }
};
 
 


export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile',
    });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/profile_images/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
}).single('profileImage');

// ... rest of your controller functions (sendOTP, verifyOTP, register, etc.)

// Updated updateUserProfile function with Cloudinary
export const updateUserProfile = async (req, res) => {
  try {
    const { name, location, email, gender, dob, phone, aadhaarNumber, aadharPhoto, userType, institute, guardianName, guardianContact, whatsappUpdates } = req.body;
    const user = await User.findById(req.user.id);
   
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
 
    // Update fields
    user.name = name || user.name;
    user.location = location || user.location;
    user.email = email || user.email;
    user.gender = gender || user.gender;
    user.dob = dob || user.dob;
    user.phone = phone || user.phone;
    user.aadhaarNumber = aadhaarNumber || user.aadhaarNumber;
    user.aadharPhoto = aadharPhoto || user.aadharPhoto;
    user.userType = userType || user.userType;
    user.institute = institute || user.institute;
    user.instituteName = institute || user.instituteName;
    user.organizationName = institute || user.organizationName;
    user.emergencyContactNumber = guardianContact || user.emergencyContactNumber;
    user.emergencyContactName = guardianName || user.emergencyContactName;
    user.guardianName = guardianName || user.guardianName;
    user.guardianContact = guardianContact || user.guardianContact;
    user.whatsappUpdates = whatsappUpdates !== undefined ? whatsappUpdates : user.whatsappUpdates;
 
    // Handle profile image upload only if file exists
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (user.profileImagePublicId) {
        await cloudinary.uploader.destroy(user.profileImagePublicId);
      }
      user.profileImage = req.file.path;

      user.profileImagePublicId = req.file.filename;
    }
    //handle aadhar photo upload only if file exists
    if (req.file) {
      // Delete old aadhar photo from Cloudinary if exists
      if (user.aadharPhotoPublicId) {
        await cloudinary.uploader.destroy(user.aadharPhotoPublicId);
      }
      user.aadharPhoto = req.file.path;
      user.aadharPhotoPublicId = req.file.filename;
    }
 
    const updatedUser = await user.save();
 
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        location: updatedUser.location,
        profileImage: updatedUser.profileImage,
        clientId: updatedUser.clientId,
        role: updatedUser.role,
        gender: updatedUser.gender,
        dob: updatedUser.dob,
        aadhaarNumber: updatedUser.aadhaarNumber,
        aadharPhoto: updatedUser.aadharPhoto,
        userType: updatedUser.userType,
        institute: updatedUser.institute,
        guardianName: updatedUser.guardianName,
        guardianContact: updatedUser.guardianContact,
        whatsappUpdates: updatedUser.whatsappUpdates
      }
    });
  } catch (error) {
    // Clean up file if error occurs
    if (req.file?.path) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
   
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: error.message
    });
  }
};  

// Updated deleteUserProfile function with Cloudinary
export const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete profile image from Cloudinary if exists
    if (user.profileImagePublicId) {
      await cloudinary.uploader.destroy(user.profileImagePublicId);
    }

    // Delete Aadhar photo from Cloudinary if exists
    if (user.aadharPhotoPublicId) {
      await cloudinary.uploader.destroy(user.aadharPhotoPublicId);
    }

    await user.remove();

    res.status(200).json({
      success: true,
      message: 'User profile deleted successfully',
    });
  } catch (error) {
    console.error('Delete user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user profile',
    });
  }
};


// export const deleteUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found',
//       });
//     }

//     await user.remove();

//     res.status(200).json({
//       success: true,
//       message: 'User profile deleted successfully',
//     });
//   } catch (error) {
//     console.error('Delete user profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while deleting user profile',
//     });
//   }
// };
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
    });
  }
};


export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
   
    console.log("=== PROFILE IMAGE UPLOAD START ===");
    console.log("User ID:", userId);
    console.log("File received:", req.file);
 
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file"
      });
    }
 
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
 
    // Upload to Cloudinary
    console.log("Uploading to Cloudinary...");
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile-images",
      transformation: [
        { width: 200, height: 200, crop: "fill" },
        { quality: "auto:good" }
      ]
    });
 
    console.log("Cloudinary upload successful:", result.secure_url);
 
    // Delete old profile image from Cloudinary if exists
    if (user.profileImagePublicId) {
      console.log("Deleting old image from Cloudinary:", user.profileImagePublicId);
      try {
        await cloudinary.uploader.destroy(user.profileImagePublicId);
      } catch (cleanupError) {
        console.error("Error deleting old image:", cleanupError);
        // Continue even if cleanup fails
      }
    }
 
    // Update user with new image
    user.profileImage = result.secure_url;
    user.profileImagePublicId = result.public_id;
    await user.save();
 
    // Delete local file after upload
    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
 
    console.log("=== PROFILE IMAGE UPLOAD SUCCESS ===");
 
    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      profileImage: result.secure_url,
      user: {
        id: user._id,
        name: user.name,
        profileImage: user.profileImage,
        clientId: user.clientId,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    });
 
  } catch (error) {
    console.error('=== PROFILE IMAGE UPLOAD ERROR ===');
    console.error('Error:', error);
   
    // Cleanup on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
   
    res.status(500).json({
      success: false,
      message: "Failed to upload profile image",
      error: error.message
    });
  }
};