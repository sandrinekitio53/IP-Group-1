const rateLimit = require("express-rate-limit");   // loads the library

// General limiter: applies to every API request
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,        // the time window: 15 minutes (in milliseconds)
  limit: 100,                      // max requests per IP inside that window
  standardHeaders: "draft-7",      // sends RateLimit headers so clients can see their quota
  legacyHeaders: false,            // turns off the old X-RateLimit-* headers
  message: { message: "Too many requests. Please try again later." },
});

// Strict limiter: only for the signup endpoint
exports.registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many signup attempts. Please wait 15 minutes and try again." },
});