// lib/otp.js - OTP (One-Time Password) utilities for phone verification
const crypto = require('crypto');

/**
 * Generate 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate OTP with expiry (default 10 minutes)
 */
function createOTP(expiryMinutes = 10) {
  const code = generateOTP();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

  return {
    code,
    expiresAt,
  };
}

/**
 * Verify OTP code
 */
function verifyOTP(storedCode, storedExpiry, providedCode) {
  if (!storedCode || !storedExpiry || !providedCode) {
    return false;
  }

  const now = new Date();
  if (now > new Date(storedExpiry)) {
    return false; // Expired
  }

  return storedCode === providedCode;
}

/**
 * Format phone number (Vietnamese format)
 */
function formatPhoneNumber(phone) {
  if (!phone) return null;
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Convert to Vietnamese format (0xxxxxxxxx)
  if (cleaned.startsWith('84')) {
    return '0' + cleaned.substring(2);
  }
  
  if (cleaned.startsWith('0')) {
    return cleaned;
  }
  
  return '0' + cleaned;
}

/**
 * Validate phone number format
 */
function validatePhoneNumber(phone) {
  if (!phone) return false;
  
  const formatted = formatPhoneNumber(phone);
  if (!formatted) return false;
  
  // Vietnamese phone: 10-11 digits starting with 0
  return /^0[1-9][0-9]{8,9}$/.test(formatted);
}

module.exports = {
  generateOTP,
  createOTP,
  verifyOTP,
  formatPhoneNumber,
  validatePhoneNumber,
};

