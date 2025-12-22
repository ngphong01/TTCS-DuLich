// lib/validation.js - Input validation utilities
const validator = require('validator');

/**
 * Sanitize string input to prevent XSS
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  // Remove potentially dangerous characters
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Validate email
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return validator.isEmail(email.trim().toLowerCase());
}

/**
 * Validate phone number (Vietnamese format)
 */
function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  // Vietnamese phone: 10-11 digits, may start with 0 or +84
  const cleaned = phone.replace(/\s+/g, '');
  return /^(\+84|0)[1-9][0-9]{8,9}$/.test(cleaned);
}

/**
 * Validate URL
 */
function validateURL(url) {
  if (!url || typeof url !== 'string') return false;
  return validator.isURL(url, { require_protocol: false });
}

/**
 * Validate price (must be positive integer)
 */
function validatePrice(price) {
  const num = typeof price === 'string' ? parseInt(price, 10) : price;
  return Number.isInteger(num) && num >= 0;
}

/**
 * Validate rating (1-5)
 */
function validateRating(rating) {
  const num = typeof rating === 'string' ? parseInt(rating, 10) : rating;
  return Number.isInteger(num) && num >= 1 && num <= 5;
}

/**
 * Validate date string
 */
function validateDate(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate slug format
 */
function validateSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  return obj;
}

/**
 * Validate required fields
 */
function validateRequired(data, fields) {
  const missing = [];
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Validate string length
 */
function validateLength(str, min, max) {
  if (typeof str !== 'string') return false;
  const len = str.trim().length;
  return len >= min && len <= max;
}

module.exports = {
  sanitizeString,
  sanitizeObject,
  validateEmail,
  validatePhone,
  validateURL,
  validatePrice,
  validateRating,
  validateDate,
  validateSlug,
  validateRequired,
  validateLength,
};

