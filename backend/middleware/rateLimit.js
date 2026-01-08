// middleware/rateLimit.js - Rate limiting middleware
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Quá nhiều lần đăng nhập, vui lòng thử lại sau 15 phút.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Strict rate limiter for booking
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 bookings per hour
  message: 'Quá nhiều đơn đặt chỗ, vui lòng thử lại sau 1 giờ.',
});

// Strict rate limiter for promo code validation
const promoLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 validations per 5 minutes
  message: 'Quá nhiều lần kiểm tra mã giảm giá, vui lòng thử lại sau 5 phút.',
});

// Strict rate limiter for review submission
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 reviews per hour
  message: 'Quá nhiều đánh giá, vui lòng thử lại sau 1 giờ.',
});

// Strict rate limiter for contact/support
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 messages per hour
  message: 'Quá nhiều tin nhắn, vui lòng thử lại sau 1 giờ.',
});

// Strict rate limiter for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 AI requests per minute
  message: 'Quá nhiều yêu cầu AI, vui lòng thử lại sau 1 phút.',
});

module.exports = {
  apiLimiter,
  authLimiter,
  bookingLimiter,
  promoLimiter,
  reviewLimiter,
  contactLimiter,
  aiLimiter,
};

