// lib/2fa.js - Two-Factor Authentication utilities
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

/**
 * Generate 2FA secret for user
 */
function generateSecret(userEmail) {
  return speakeasy.generateSecret({
    name: `TravelGo (${userEmail})`,
    issuer: 'TravelGo',
    length: 32,
  });
}

/**
 * Generate QR code URL for 2FA setup
 */
async function generateQRCode(secret) {
  try {
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    return qrCodeUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

/**
 * Verify 2FA token
 */
function verifyToken(secret, token) {
  return speakeasy.totp.verify({
    secret: secret,
    token: token,
    encoding: 'base32',
    window: 2, // Allow 2 time steps (60 seconds) before/after
  });
}

/**
 * Generate backup codes (8 codes)
 */
function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
  }
  return codes;
}

module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken,
  generateBackupCodes,
};

