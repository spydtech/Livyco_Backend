import CryptoJS from 'crypto-js';

// Use a consistent encryption key (make sure this matches in both frontend and backend)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'livyco-secure-encryption-key-32char-long!';

export class EncryptionUtils {
  // Enhanced encrypt method with better error handling
  static encrypt(text) {
    try {
      if (!text) {
        console.error('Encryption: No text provided');
        throw new Error('No text to encrypt');
      }
      
      // Ensure text is a string
      const textToEncrypt = typeof text === 'string' ? text : JSON.stringify(text);
      
      const encrypted = CryptoJS.AES.encrypt(textToEncrypt, ENCRYPTION_KEY).toString();
      
      if (!encrypted) {
        throw new Error('Encryption produced empty result');
      }
      
      console.log('🔐 Encryption successful');
      return encrypted;
    } catch (error) {
      console.error('🔐 Encryption error:', error.message, 'Input:', text);
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  // Enhanced decrypt method with better validation
  static decrypt(encryptedText) {
    try {
      if (!encryptedText) {
        console.error('Decryption: No encrypted text provided');
        throw new Error('No text to decrypt');
      }

      // Validate encrypted text format
      if (typeof encryptedText !== 'string' || encryptedText.trim() === '') {
        throw new Error('Invalid encrypted text format');
      }

      const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        console.error('Decryption: Result is empty, likely wrong key or corrupted data');
        throw new Error('Decryption resulted in empty string - check encryption key');
      }

      // Try to parse as JSON, if it fails return as string
      try {
        const parsed = JSON.parse(decrypted);
        console.log('🔓 Decryption successful (JSON)');
        return parsed;
      } catch (e) {
        console.log('🔓 Decryption successful (string)');
        return decrypted;
      }
    } catch (error) {
      console.error('🔓 Decryption error:', error.message, 'Input:', encryptedText?.substring(0, 50) + '...');
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  // Encrypt payload for API requests
  static encryptPayload(payload) {
    try {
      if (!payload) {
        throw new Error('No payload to encrypt');
      }
      
      const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
      return this.encrypt(payloadString);
    } catch (error) {
      console.error('Payload encryption error:', error);
      throw error;
    }
  }

  // Decrypt response from API
  static decryptResponse(encryptedData) {
    try {
      if (!encryptedData) {
        throw new Error('No data to decrypt');
      }
      
      const decrypted = this.decrypt(encryptedData);
      
      // Try to parse as JSON if it's a string
      if (typeof decrypted === 'string') {
        try {
          return JSON.parse(decrypted);
        } catch (e) {
          return decrypted;
        }
      }
      
      return decrypted;
    } catch (error) {
      console.error('Response decryption error:', error);
      throw error;
    }
  }

  // Generate encrypted API names with validation
  static generateEncryptedApiName(originalName) {
    try {
      if (!originalName || typeof originalName !== 'string') {
        throw new Error('Invalid API name provided');
      }
      
      const timestamp = Date.now().toString();
      const data = JSON.stringify({
        name: originalName,
        timestamp: timestamp,
        version: '1.0'
      });
      
      return this.encrypt(data);
    } catch (error) {
      console.error('Error generating encrypted API name:', error);
      throw error;
    }
  }

  // Validate and decrypt API name with better error handling
  static validateApiName(encryptedName, expectedOriginal) {
    try {
      if (!encryptedName || !expectedOriginal) {
        console.error('Validation: Missing parameters');
        return false;
      }

      const decrypted = this.decrypt(encryptedName);
      
      // Handle both string and object formats
      let originalName;
      if (typeof decrypted === 'string') {
        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(decrypted);
          originalName = parsed.name;
        } catch (e) {
          // If not JSON, use as is (backward compatibility)
          originalName = decrypted.split('|')[0];
        }
      } else if (typeof decrypted === 'object' && decrypted.name) {
        originalName = decrypted.name;
      } else {
        console.error('Validation: Invalid decrypted format');
        return false;
      }

      const isValid = originalName === expectedOriginal;
      console.log(`🔑 API Validation: ${expectedOriginal} -> ${isValid ? 'VALID' : 'INVALID'}`);
      
      return isValid;
    } catch (error) {
      console.error('🔑 API Validation error:', error.message);
      return false;
    }
  }

  // Test encryption/decryption cycle
  static testEncryption() {
    try {
      const testData = 'test-api-name';
      const encrypted = this.encrypt(testData);
      const decrypted = this.decrypt(encrypted);
      
      console.log('🧪 Encryption Test:', {
        original: testData,
        encrypted: encrypted.substring(0, 20) + '...',
        decrypted: decrypted,
        success: testData === decrypted
      });
      
      return testData === decrypted;
    } catch (error) {
      console.error('🧪 Encryption Test Failed:', error);
      return false;
    }
  }

  // Generate all encrypted routes with validation
  static generateAllEncryptedRoutes() {
    console.log('🔄 Generating encrypted routes...');
    
    // Test encryption first
    if (!this.testEncryption()) {
      console.error('❌ Encryption test failed. Routes may not work properly.');
      return {};
    }

    const routes = {
      auth: {
        base: this.generateEncryptedApiName('auth'),
        endpoints: {
          checkUserExists: this.generateEncryptedApiName('checkUserExists'),
          verifyFirebaseOTP: this.generateEncryptedApiName('verifyFirebaseOTP'),
          register: this.generateEncryptedApiName('register'),
          getUser: this.generateEncryptedApiName('getUser'),
          sendOTP: this.generateEncryptedApiName('sendOTP'),
          verifyOTP: this.generateEncryptedApiName('verifyOTP'),
          updateUserProfile: this.generateEncryptedApiName('updateUserProfile'),
          getAllUsers: this.generateEncryptedApiName('getAllUsers'),
          addTenantByClient: this.generateEncryptedApiName('addTenantByClient'),
          healthCheck: this.generateEncryptedApiName('healthCheck')
        }
      },
      properties: {
        base: this.generateEncryptedApiName('properties'),
        endpoints: {
          registerProperty: this.generateEncryptedApiName('registerProperty'),
          getProperty: this.generateEncryptedApiName('getProperty'),
          updateProperty: this.generateEncryptedApiName('updateProperty'),
          getCompletePropertyData: this.generateEncryptedApiName('getCompletePropertyData'),
          getAllClientProperties: this.generateEncryptedApiName('getAllClientProperties'),
          deleteProperty: this.generateEncryptedApiName('deleteProperty')
        }
      },
      media: {
        base: this.generateEncryptedApiName('media'),
        endpoints: {
          upload: this.generateEncryptedApiName('upload'),
          getMedia: this.generateEncryptedApiName('getMedia'),
          deleteMediaItem: this.generateEncryptedApiName('deleteMediaItem'),
          editMediaItem: this.generateEncryptedApiName('editMediaItem'),
          getMediaByPropertyId: this.generateEncryptedApiName('getMediaByPropertyId')
        }
      },
      rooms: {
        base: this.generateEncryptedApiName('rooms'),
        endpoints: {
          createRoomTypes: this.generateEncryptedApiName('createRoomTypes'),
          getRoomTypes: this.generateEncryptedApiName('getRoomTypes'),
          saveFloorData: this.generateEncryptedApiName('saveFloorData'),
          getFloorData: this.generateEncryptedApiName('getFloorData'),
          saveRoomRentData: this.generateEncryptedApiName('saveRoomRentData'),
          getRoomRentData: this.generateEncryptedApiName('getRoomRentData'),
          deleteRoomType: this.generateEncryptedApiName('deleteRoomType'),
          updateRoomType: this.generateEncryptedApiName('updateRoomType')
        }
      },
      bookings: {
        base: this.generateEncryptedApiName('bookings'),
        endpoints: {
          createBooking: this.generateEncryptedApiName('createBooking'),
          cancelBooking: this.generateEncryptedApiName('cancelBooking'),
          getBookingsByProperty: this.generateEncryptedApiName('getBookingsByProperty'),
          getUserBookings: this.generateEncryptedApiName('getUserBookings'),
          getBookingById: this.generateEncryptedApiName('getBookingById'),
          approveBooking: this.generateEncryptedApiName('approveBooking'),
          rejectBooking: this.generateEncryptedApiName('rejectBooking'),
          getallBookings: this.generateEncryptedApiName('getallBookings'),
          checkRoomAvailability: this.generateEncryptedApiName('checkRoomAvailability'),
          getAvailableRoomsAndBeds: this.generateEncryptedApiName('getAvailableRoomsAndBeds'),
          getAvailableBedsByRoomType: this.generateEncryptedApiName('getAvailableBedsByRoomType'),
          getAllAvailableBeds: this.generateEncryptedApiName('getAllAvailableBeds')
        }
      },
      vacate: {
        base: this.generateEncryptedApiName('vacate'),
        endpoints: {
          requestVacate: this.generateEncryptedApiName('requestVacate'),
          getVacateRequests: this.generateEncryptedApiName('getVacateRequests'),
          getVacateRequestById: this.generateEncryptedApiName('getVacateRequestById'),
          processDuePayment: this.generateEncryptedApiName('processDuePayment'),
          approveVacateRequest: this.generateEncryptedApiName('approveVacateRequest'),
          initiateRefund: this.generateEncryptedApiName('initiateRefund'),
          completeRefund: this.generateEncryptedApiName('completeRefund'),
          getVacateStatus: this.generateEncryptedApiName('getVacateStatus'),
          getUserVacateRequests: this.generateEncryptedApiName('getUserVacateRequests'),
          addDeduction: this.generateEncryptedApiName('addDeduction')
        }
      },
      pg: {
        base: this.generateEncryptedApiName('pg'),
        endpoints: {
          savePGProperty: this.generateEncryptedApiName('savePGProperty'),
          getPGProperty: this.generateEncryptedApiName('getPGProperty'),
          deletePGProperty: this.generateEncryptedApiName('deletePGProperty')
        }
      },
      admin: {
        base: this.generateEncryptedApiName('admin'),
        endpoints: {
          login: this.generateEncryptedApiName('login'),
          getProfile: this.generateEncryptedApiName('getProfile'),
          approveProperty: this.generateEncryptedApiName('approveProperty'),
          rejectProperty: this.generateEncryptedApiName('rejectProperty')
        }
      },
      notifications: {
        base: this.generateEncryptedApiName('notifications'),
        endpoints: {
          getNotifications: this.generateEncryptedApiName('getNotifications'),
          getUnreadCount: this.generateEncryptedApiName('getUnreadCount'),
          markAsRead: this.generateEncryptedApiName('markAsRead'),
          markAllAsRead: this.generateEncryptedApiName('markAllAsRead'),
          deleteNotification: this.generateEncryptedApiName('deleteNotification')
        }
      },
      payments: {
        base: this.generateEncryptedApiName('payments'),
        endpoints: {
          createOrder: this.generateEncryptedApiName('createOrder'),
          validatePayment: this.generateEncryptedApiName('validatePayment'),
          getPaymentDetails: this.generateEncryptedApiName('getPaymentDetails'),
          refundPayment: this.generateEncryptedApiName('refundPayment'),
          getUserPayments: this.generateEncryptedApiName('getUserPayments')
        }
      },
      concerns: {
        base: this.generateEncryptedApiName('concerns'),
        endpoints: {
          submitConcern: this.generateEncryptedApiName('submitConcern'),
          getUserConcerns: this.generateEncryptedApiName('getUserConcerns'),
          getPropertyConcerns: this.generateEncryptedApiName('getPropertyConcerns'),
          getConcernById: this.generateEncryptedApiName('getConcernById'),
          cancelConcern: this.generateEncryptedApiName('cancelConcern'),
          approveConcern: this.generateEncryptedApiName('approveConcern'),
          rejectConcern: this.generateEncryptedApiName('rejectConcern'),
          completeConcern: this.generateEncryptedApiName('completeConcern'),
          addInternalNote: this.generateEncryptedApiName('addInternalNote')
        }
      },
      menu: {
        base: this.generateEncryptedApiName('menu'),
        endpoints: {
          getFoodItems: this.generateEncryptedApiName('getFoodItems'),
          getWeeklyMenu: this.generateEncryptedApiName('getWeeklyMenu'),
          addFoodItem: this.generateEncryptedApiName('addFoodItem'),
          deleteFoodItem: this.generateEncryptedApiName('deleteFoodItem'),
          clearDayMenu: this.generateEncryptedApiName('clearDayMenu'),
          getFoodItemsByBooking: this.generateEncryptedApiName('getFoodItemsByBooking'),
          getFoodItemsByBookingAndDay: this.generateEncryptedApiName('getFoodItemsByBookingAndDay')
        }
      },
      map: {
        base: this.generateEncryptedApiName('map'),
        endpoints: {
          addOrUpdateMap: this.generateEncryptedApiName('addOrUpdateMap'),
          getAllMaps: this.generateEncryptedApiName('getAllMaps'),
          getMapByProperty: this.generateEncryptedApiName('getMapByProperty')
        }
      },
      tickets: {
        base: this.generateEncryptedApiName('tickets'),
        endpoints: {
          createTicket: this.generateEncryptedApiName('createTicket'),
          getTicketsByClient: this.generateEncryptedApiName('getTicketsByClient'),
          getAllTickets: this.generateEncryptedApiName('getAllTickets'),
          updateTicket: this.generateEncryptedApiName('updateTicket'),
          getTicketById: this.generateEncryptedApiName('getTicketById'),
          closeTicket: this.generateEncryptedApiName('closeTicket'),
          addComment: this.generateEncryptedApiName('addComment')
        }
      },
      chat: {
        base: this.generateEncryptedApiName('chat'),
        endpoints: {
          getConversations: this.generateEncryptedApiName('getConversations'),
          getMessages: this.generateEncryptedApiName('getMessages'),
          sendMessage: this.generateEncryptedApiName('sendMessage'),
          getUnreadCount: this.generateEncryptedApiName('getUnreadCount'),
          markAsRead: this.generateEncryptedApiName('markAsRead')
        }
      },
      bankAccounts: {
        base: this.generateEncryptedApiName('bankAccounts'),
        endpoints: {
          addBankAccount: this.generateEncryptedApiName('addBankAccount'),
          getMyBankAccounts: this.generateEncryptedApiName('getMyBankAccounts'),
          getPropertyBankAccount: this.generateEncryptedApiName('getPropertyBankAccount'),
          updateBankAccount: this.generateEncryptedApiName('updateBankAccount'),
          deleteBankAccount: this.generateEncryptedApiName('deleteBankAccount'),
          getAllBankAccounts: this.generateEncryptedApiName('getAllBankAccounts'),
          getBankAccountStats: this.generateEncryptedApiName('getBankAccountStats'),
          verifyBankAccount: this.generateEncryptedApiName('verifyBankAccount')
        }
      },
      user: {
        base: this.generateEncryptedApiName('user'),
        endpoints: {
          updateUser: this.generateEncryptedApiName('updateUser'),
          getUser: this.generateEncryptedApiName('getUser'),
          addTenantByClient: this.generateEncryptedApiName('addTenantByClient')
        }
      }
    };

    console.log('✅ Encrypted routes generated successfully');
    console.log('=== ENCRYPTED API ROUTES ===');
    console.log(JSON.stringify(routes, null, 2));
    console.log('=== END ENCRYPTED API ROUTES ===');
    
    return routes;
  }
}

// Auto-test on module load
console.log('🔐 Initializing EncryptionUtils...');
EncryptionUtils.testEncryption();