import { EncryptionUtils } from '../utils/encryptionUtils.js';

// Copy the generated encrypted routes here after running the generator
const apiMapping = {
  "auth": {
    "base": "U2FsdGVkX1/4m5z6X8A2rD9gH1jK3lM7nO0pQ2sT4uV6wX8yZ==",
    "endpoints": {
      "checkUserExists": "U2FsdGVkX19Q7uJ4J8wJ6K8n7M2V1X6Y9zA8bR2tH4fC6vD3gE==",
      "verifyFirebaseOTP": "U2FsdGVkX1+3k5m7n9p1q3s5u7w9y2b4d6f8h0j2k4l6==",
      "register": "U2FsdGVkX1+2j4l6k8m0n2p4r6t8v1x3z5b7d9f1h3==",
      "getUser": "U2FsdGVkX1+1i3k5m7o9q1s3u5w7y9z2b4d6f8h0j2l4==",
      "sendOTP": "U2FsdGVkX1+0h2j4l6n8p0r2t4v6x8z1b3d5f7h9j1l3==",
      "verifyOTP": "U2FsdGVkX1+9g1i3k5m7o9q1s3u5w7y9z2b4d6f8h0j2==",
      "updateUserProfile": "U2FsdGVkX1+8f0h2j4l6n8p0r2t4v6x8z1b3d5f7h9j==",
      "getAllUsers": "U2FsdGVkX1+7e9g1i3k5m7o9q1s3u5w7y9z2b4d6f8==",
      "addTenantByClient": "U2FsdGVkX1+6d8f0h2j4l6n8p0r2t4v6x8z1b3d5f7h9==",
      "healthCheck": "U2FsdGVkX1+5c7e9g1i3k5m7o9q1s3u5w7y9z2b4d6=="
    }
  },
  "properties": {
    "base": "U2FsdGVkX1+4b6d8f0h2j4l6n8p0r2t4v6x8z1b3d5f7==",
    "endpoints": {
      "registerProperty": "U2FsdGVkX1+3a5c7e9g1i3k5m7o9q1s3u5w7y9z2b4d6f8h0==",
      "getProperty": "U2FsdGVkX1+2z4b6d8f0h2j4l6n8p0r2t4v6x8z1b3d5==",
      "updateProperty": "U2FsdGVkX1+1y3a5c7e9g1i3k5m7o9q1s3u5w7y9z2b4==",
      "getCompletePropertyData": "U2FsdGVkX1+0x2z4b6d8f0h2j4l6n8p0r2t4v6x8z1b3==",
      "getAllClientProperties": "U2FsdGVkX1+9w1y3a5c7e9g1i3k5m7o9q1s3u5w7y9z2==",
      "deleteProperty": "U2FsdGVkX1+8v0x2z4b6d8f0h2j4l6n8p0r2t4v6x8z1=="
    }
  },
  "media": {
    "base": "U2FsdGVkX1+7u9w1y3a5c7e9g1i3k5m7o9q1s3u5w7y9==",
    "endpoints": {
      "upload": "U2FsdGVkX1+6t8v0x2z4b6d8f0h2j4l6n8p0r2t4v6x8==",
      "getMedia": "U2FsdGVkX1+5s7u9w1y3a5c7e9g1i3k5m7o9q1s3u5w7==",
      "deleteMediaItem": "U2FsdGVkX1+4r6t8v0x2z4b6d8f0h2j4l6n8p0r2t4v6==",
      "editMediaItem": "U2FsdGVkX1+3q5s7u9w1y3a5c7e9g1i3k5m7o9q1s3u5==",
      "getMediaByPropertyId": "U2FsdGVkX1+2p4r6t8v0x2z4b6d8f0h2j4l6n8p0r2t4=="
    }
  },
  "rooms": {
    "base": "U2FsdGVkX1+1o3q5s7u9w1y3a5c7e9g1i3k5m7o9q1s3==",
    "endpoints": {
      "createRoomTypes": "U2FsdGVkX1+0n2p4r6t8v0x2z4b6d8f0h2j4l6n8p0r2==",
      "getRoomTypes": "U2FsdGVkX1+9m1o3q5s7u9w1y3a5c7e9g1i3k5m7o9q1==",
      "saveFloorData": "U2FsdGVkX1+8l0n2p4r6t8v0x2z4b6d8f0h2j4l6n8p0==",
      "getFloorData": "U2FsdGVkX1+7k9m1o3q5s7u9w1y3a5c7e9g1i3k5m7o9==",
      "saveRoomRentData": "U2FsdGVkX1+6j8l0n2p4r6t8v0x2z4b6d8f0h2j4l6n8==",
      "getRoomRentData": "U2FsdGVkX1+5i7k9m1o3q5s7u9w1y3a5c7e9g1i3k5m7==",
      "deleteRoomType": "U2FsdGVkX1+4h6j8l0n2p4r6t8v0x2z4b6d8f0h2j4l6==",
      "updateRoomType": "U2FsdGVkX1+3g5i7k9m1o3q5s7u9w1y3a5c7e9g1i3k5=="
    }
  },
  "bookings": {
    "base": "U2FsdGVkX1+2f4h6j8l0n2p4r6t8v0x2z4b6d8f0h2j4==",
    "endpoints": {
      "createBooking": "U2FsdGVkX1+1e3g5i7k9m1o3q5s7u9w1y3a5c7e9g1i3==",
      "cancelBooking": "U2FsdGVkX1+0d2f4h6j8l0n2p4r6t8v0x2z4b6d8f0h2==",
      "getBookingsByProperty": "U2FsdGVkX1+9c1e3g5i7k9m1o3q5s7u9w1y3a5c7e9g1==",
      "getUserBookings": "U2FsdGVkX1+8b0d2f4h6j8l0n2p4r6t8v0x2z4b6d8f0==",
      "getBookingById": "U2FsdGVkX1+7a9c1e3g5i7k9m1o3q5s7u9w1y3a5c7e9==",
      "approveBooking": "U2FsdGVkX1+6z8b0d2f4h6j8l0n2p4r6t8v0x2z4b6d8==",
      "rejectBooking": "U2FsdGVkX1+5y7a9c1e3g5i7k9m1o3q5s7u9w1y3a5c7==",
      "getallBookings": "U2FsdGVkX1+4x6z8b0d2f4h6j8l0n2p4r6t8v0x2z4b6==",
      "checkRoomAvailability": "U2FsdGVkX1+3w5y7a9c1e3g5i7k9m1o3q5s7u9w1y3a5==",
      "getAvailableRoomsAndBeds": "U2FsdGVkX1+2v4x6z8b0d2f4h6j8l0n2p4r6t8v0x2z4==",
      "getAvailableBedsByRoomType": "U2FsdGVkX1+1u3w5y7a9c1e3g5i7k9m1o3q5s7u9w1y3==",
      "getAllAvailableBeds": "U2FsdGVkX1+0t2v4x6z8b0d2f4h6j8l0n2p4r6t8v0x2=="
    }
  },
  "vacate": {
    "base": "U2FsdGVkX1+9s1u3w5y7a9c1e3g5i7k9m1o3q5s7u9w1==",
    "endpoints": {
      "requestVacate": "U2FsdGVkX1+8r0t2v4x6z8b0d2f4h6j8l0n2p4r6t8v0==",
      "getVacateRequests": "U2FsdGVkX1+7q9s1u3w5y7a9c1e3g5i7k9m1o3q5s7u9==",
      "getVacateRequestById": "U2FsdGVkX1+6p8r0t2v4x6z8b0d2f4h6j8l0n2p4r6t8==",
      "processDuePayment": "U2FsdGVkX1+5o7q9s1u3w5y7a9c1e3g5i7k9m1o3q5s7==",
      "approveVacateRequest": "U2FsdGVkX1+4n6p8r0t2v4x6z8b0d2f4h6j8l0n2p4r6==",
      "initiateRefund": "U2FsdGVkX1+3m5o7q9s1u3w5y7a9c1e3g5i7k9m1o3q5==",
      "completeRefund": "U2FsdGVkX1+2l4n6p8r0t2v4x6z8b0d2f4h6j8l0n2p4==",
      "getVacateStatus": "U2FsdGVkX1+1k3m5o7q9s1u3w5y7a9c1e3g5i7k9m1o3==",
      "getUserVacateRequests": "U2FsdGVkX1+0j2l4n6p8r0t2v4x6z8b0d2f4h6j8l0n2==",
      "addDeduction": "U2FsdGVkX1+9i1k3m5o7q9s1u3w5y7a9c1e3g5i7k9m1=="
    }
  },
  "pg": {
    "base": "U2FsdGVkX1+8h0j2l4n6p8r0t2v4x6z8b0d2f4h6j8l0==",
    "endpoints": {
      "savePGProperty": "U2FsdGVkX1+7g9i1k3m5o7q9s1u3w5y7a9c1e3g5i7k9==",
      "getPGProperty": "U2FsdGVkX1+6f8h0j2l4n6p8r0t2v4x6z8b0d2f4h6j8==",
      "deletePGProperty": "U2FsdGVkX1+5e7g9i1k3m5o7q9s1u3w5y7a9c1e3g5i7=="
    }
  },
  "admin": {
    "base": "U2FsdGVkX1+4d6f8h0j2l4n6p8r0t2v4x6z8b0d2f4h6==",
    "endpoints": {
      "login": "U2FsdGVkX1+3c5e7g9i1k3m5o7q9s1u3w5y7a9c1e3g5==",
      "getProfile": "U2FsdGVkX1+2b4d6f8h0j2l4n6p8r0t2v4x6z8b0d2f4==",
      "approveProperty": "U2FsdGVkX1+1a3c5e7g9i1k3m5o7q9s1u3w5y7a9c1e3==",
      "rejectProperty": "U2FsdGVkX1+0z2b4d6f8h0j2l4n6p8r0t2v4x6z8b0d2=="
    }
  }
};


// Track if encryption is working
let encryptionWorking = true;

export const apiSecurityMiddleware = (req, res, next) => {
  const originalUrl = req.originalUrl;
  
  // Skip health check and debug endpoints
  if (originalUrl === '/health' || originalUrl === '/api/debug-razorpay') {
    return next();
  }

  try {
    // Decrypt API path for /api/ routes
    if (originalUrl.startsWith('/api/')) {
      const pathParts = originalUrl.split('/').filter(part => part);
      
      if (pathParts.length >= 3) {
        const encryptedRoute = pathParts[2]; // api/encryptedRoute
        const encryptedEndpoint = pathParts[3] || ''; // api/encryptedRoute/encryptedEndpoint
        
        // Find actual route
        let actualRoute = null;
        let actualEndpoint = null;
        
        for (const [route, data] of Object.entries(apiMapping)) {
          if (EncryptionUtils.validateApiName(encryptedRoute, route)) {
            actualRoute = route;
            
            // Find actual endpoint if provided
            if (encryptedEndpoint) {
              for (const [endpoint, encrypted] of Object.entries(data.endpoints)) {
                if (EncryptionUtils.validateApiName(encryptedEndpoint, endpoint)) {
                  actualEndpoint = endpoint;
                  break;
                }
              }
            }
            break;
          }
        }
        
        if (actualRoute) {
          // Store original encrypted info
          req.encryptedApi = {
            originalUrl,
            actualRoute,
            actualEndpoint
          };
          
          // Reconstruct the URL with actual route names
          let newUrl = `/api/${actualRoute}`;
          if (actualEndpoint) {
            newUrl += `/${actualEndpoint}`;
          }
          
          // Add remaining path parts if any
          if (pathParts.length > 3) {
            const remainingParts = pathParts.slice(4);
            if (remainingParts.length > 0) {
              newUrl += `/${remainingParts.join('/')}`;
            }
          }
          
          // Add query string if present
          if (req.url.includes('?')) {
            newUrl += req.url.substring(req.url.indexOf('?'));
          }
          
          req.url = newUrl;
          console.log(`🔐 API Security: ${originalUrl} -> ${req.url}`);
        } else {
          return res.status(404).json({
            success: false,
            message: 'API endpoint not found'
          });
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('API security middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'API security validation failed'
    });
  }
};