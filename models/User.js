import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  phone: {
    type: String,
    required: function() {
      return this.authMethod !== 'google';
    },
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^[0-9]{10,15}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    unique: true,
    sparse: true
  },
  location: { 
    type: String
  },
  profileImage: {
    type: String
  },
  clientId: {
    type: String,
    unique: true,
    required: false
  },
  role: {
    type: String,
    enum: ['client', 'user'],
    default: 'user',
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  dob: {
    type: Date
  },
  aadhaarNumber: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^\d{12}$/, 'Enter a valid Aadhaar number']
  },
  aadharPhoto: {
    type: String,
    required: false
  },
  aadharPhotoPublicId: {
    type: String
  },
  whatsappUpdates: {
    type: Boolean,
    default: false
  },
  userType: {
    type: String,
    enum: ['student', 'professional'],
    default: 'student'
  },
  institute: String,
  instituteName: String,
  organizationName: String,
  emergencyContactNumber: String,
  emergencyContactName: String,
  guardianName: String,
  guardianContact: String,
  allocationStatus: {
    type: String,
    enum: ['not allocated', 'allocated', 'terminated'],
    default: 'not allocated'
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },
  authMethod: {
    type: String,
    enum: ['phone', 'google', 'email'],
    default: 'phone'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  lastMessage: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: { 
    type: Date 
  },
  socketId: { 
    type: String 
  },
  online: { 
    type: Boolean, 
    default: false 
  },
  userId: {  // Added numeric userId field for socket authentication
    type: Number,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
    }
  }
});

// Generate clientId AND userId before saving
userSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Generate clientId
      if (!this.clientId) {
        const prefix = this.role === 'client' ? 'LYVC' : 'LYVU';
        const lastUser = await this.constructor.findOne({ role: this.role })
          .sort({ clientId: -1 })
          .select('clientId')
          .lean();

        let sequenceNumber = 1;
        if (lastUser?.clientId) {
          const lastSeq = parseInt(lastUser.clientId.replace(prefix, ''), 10);
          if (!isNaN(lastSeq)) {
            sequenceNumber = lastSeq + 1;
          }
        }

        this.clientId = `${prefix}${sequenceNumber.toString().padStart(5, '0')}`;
      }

      // Generate numeric userId
      if (!this.userId) {
        const lastUserWithId = await this.constructor.findOne()
          .sort({ userId: -1 })
          .select('userId')
          .lean();
        
        this.userId = lastUserWithId?.userId ? lastUserWithId.userId + 1 : 1;
      }
    } catch (err) {
      return next(err);
    }
  }

  // Update the updatedAt field
  if (this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});

// Update lastLogin on successful login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save();
};

const User = mongoose.model('User', userSchema);
export default User;


// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   name: { 
//     type: String, 
//     required: true 
//   },
//   email: {
//     type: String,
//     unique: true,
//     sparse: true,
//     match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
//   },
//   // phone: {
//   //   type: String,
//   //   required: true,
//   //   unique: true,
//   //   match: [/^[0-9]{10,15}$/, 'Enter a valid phone number']
//   // },
//    phone: {
//   type: String,
//   // Make it optional for Google auth users
//   required: function() {
//     return this.authMethod !== 'google';
//   },
//   validate: {
//     validator: function(v) {
//       // Only validate if phone exists
//       if (!v) return true; // Allow empty for Google users
//       return /^[0-9]{10,15}$/.test(v);
//     },
//     message: props => `${props.value} is not a valid phone number!`
//   },
//   unique: true,
//   sparse: true // ✅ This allows multiple null values while keeping uniqueness for non-null values
// },
//   location: { 
//     type: String, 
//     // required: true 
//   },
//   profileImage: {
//     type: String
//   },
//   clientId: {
//     type: String,
//     unique: true,
//     required: false
//   },
//   role: {
//     type: String,
//     enum: ['client', 'user'],
//     default: 'user',
//     required: true
//   },
//   gender: {
//     type: String,
//     enum: ['male', 'female', 'other']
//   },
//   dob: {
//     type: Date
//   },
//  aadhaarNumber: {
//     type: String,
//     unique: true,
//     sparse: true, // Make it sparse to allow null/undefined
//     match: [/^\d{12}$/, 'Enter a valid Aadhaar number']
//   },
//   // aadharPhoto: {
//   //   type: String,
//   //   required: [true, 'Aadhar photo is required']
//   // },
//   aadharPhoto: {
//   type: String,
//   required: false // Make it optional
//   },
//    aadharPhotoPublicId: {
//     type: String
//   },
//   whatsappUpdates: {
//     type: Boolean,
//     default: false
//   },
//   userType: {
//     type: String,
//     enum: ['student', 'professional'],
//     default: 'student'
//   },
//   institute: String,
//   instituteName: String,
//   organizationName: String,
//   emergencyContactNumber: String,
//   emergencyContactName: String,
//   guardianName: String,
//   guardianContact: String,
//   allocationStatus: {
//     type: String,
//     enum: ['not allocated', 'allocated', 'terminated'],
//     default: 'not allocated'
//   },

//   // Google Sign-In Fields
//   googleId: {
//     type: String,
//     unique: true,
//     sparse: true
//   },
//   firebaseUid: {
//   type: String,
//   unique: true,
//   sparse: true // ✅ This is important to allow multiple null values
// },
  
//   authMethod: {
//     type: String,
//     enum: ['phone', 'google', 'email'],
//     default: 'phone'
//   },
  
//   emailVerified: {
//     type: Boolean,
//     default: false
//   },
  
//   lastLogin: {
//     type: Date
//   },
// // In your User model
// lastMessage: { 
//   type: mongoose.Schema.Types.ObjectId,
//   ref: 'Message'
// },
// lastMessageAt: { 
//   type: Date 
// },
// socketId: { 
//   type: String 
// },
// online: { 
//   type: Boolean, 
//   default: false 
// }
// },{
//   timestamps: true,
//   toJSON: {
//     transform: function(doc, ret) {
//       delete ret.__v;
//       delete ret.createdAt;
//       delete ret.updatedAt;
//     }
//   }
// });

// // Generate clientId before saving
// userSchema.pre('save', async function(next) {
//   if (this.isNew && !this.clientId) {
//     try {
//       const prefix = this.role === 'client' ? 'LYVC' : 'LYVU';
//       const lastUser = await this.constructor.findOne({ role: this.role })
//         .sort({ clientId: -1 })
//         .select('clientId')
//         .lean();

//       let sequenceNumber = 1;
//       if (lastUser?.clientId) {
//         const lastSeq = parseInt(lastUser.clientId.replace(prefix, ''), 10);
//         if (!isNaN(lastSeq)) {
//           sequenceNumber = lastSeq + 1;
//         }
//       }

//       this.clientId = `${prefix}${sequenceNumber.toString().padStart(5, '0')}`;
//       this.$isValid('clientId'); // Manually mark the field as valid
//     } catch (err) {
//       return next(err);
//     }
//   }

//    // Update the updatedAt field
//   if (this.isModified()) {
//     this.updatedAt = new Date();
//   }
//   next();
// });
// // Update lastLogin on successful login
// userSchema.methods.updateLastLogin = async function() {
//   this.lastLogin = new Date();
//   await this.save();
// };

// const User = mongoose.model('User', userSchema);
// export default User;
