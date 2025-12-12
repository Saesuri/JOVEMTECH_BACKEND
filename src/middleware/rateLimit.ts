import rateLimit from "express-rate-limit";

/**
 * General API rate limiter.
 * Limits each IP to 100 requests per 15 minute window.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "Too many requests, please try again later.",
  },
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === "/";
  },
});

/**
 * Stricter rate limiter for sensitive operations.
 * Limits each IP to 20 requests per 15 minute window.
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests for this operation, please try again later.",
  },
});

/**
 * Very strict rate limiter for authentication attempts.
 * Limits each IP to 5 requests per 15 minute window.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
});
