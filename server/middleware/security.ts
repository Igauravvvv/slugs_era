import rateLimit from 'express-rate-limit';

// Global limit: 100 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limit for payment and auth routes: 5 requests per 15 minutes
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20,
  message: {
    success: false,
    error: 'Too many attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
