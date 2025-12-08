import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting configurations
export const createRateLimit = (windowMs, max, message) => 
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
  });

// General API rate limit
export const apiLimiter = createRateLimit(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  'Too many requests from this IP, please try again later.'
);

// Auth rate limit (stricter)
export const authLimiter = createRateLimit(
  15 * 60 * 1000,
  5,
  'Too many authentication attempts, please try again later.'
);

// Payment rate limit
export const paymentLimiter = createRateLimit(
  15 * 60 * 1000,
  10,
  'Too many payment requests, please try again later.'
);

// Helmet security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https:"]
    },
  },
  crossOriginEmbedderPolicy: false
});

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        // Remove potentially dangerous characters and trim
        obj[key] = obj[key]
          .replace(/[<>]/g, '')
          .replace(/\${\w*}/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
          .trim();
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    });
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};

// API Key validation middleware
export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY;
  
  if (!validApiKey) {
    return next(); // Skip if no API key configured
  }
  
  if (apiKey === validApiKey) {
    return next();
  }
  
  return res.status(401).json({
    success: false,
    message: 'Invalid API key',
    requestId: req.requestId
  });
};

export { securityHeaders, apiLimiter, authLimiter, paymentLimiter, sanitizeInput, validateApiKey };