// routes/phone.js - Phone verification routes
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');
const { createOTP, verifyOTP, formatPhoneNumber, validatePhoneNumber } = require('../lib/otp');

// POST /api/phone/send-otp - Send OTP to phone number
router.post('/send-otp', authRequired, async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    if (!validatePhoneNumber(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    const formattedPhone = formatPhoneNumber(phone);
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { phone: true, phoneVerified: true },
    });

    // Generate OTP
    const { code, expiresAt } = createOTP(10); // 10 minutes expiry

    // Store OTP in database
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        phone: formattedPhone,
        phoneVerificationCode: code,
        phoneVerificationExpiry: expiresAt,
        phoneVerified: false, // Reset verification status
      },
    });

    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    // For now, return OTP in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📱 OTP for ${formattedPhone}: ${code}`);
      res.json({
        success: true,
        message: 'OTP sent successfully',
        // Only return OTP in development
        otp: code,
        expiresAt,
      });
    } else {
      // In production, send via SMS service
      // await sendSMS(formattedPhone, `Your TravelGo verification code is: ${code}`);
      res.json({
        success: true,
        message: 'OTP sent successfully',
        expiresAt,
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
});

// POST /api/phone/verify-otp - Verify OTP code
router.post('/verify-otp', authRequired, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'OTP code is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        phone: true,
        phoneVerified: true,
        phoneVerificationCode: true,
        phoneVerificationExpiry: true,
      },
    });

    if (!user.phone) {
      return res.status(400).json({ message: 'Phone number not set' });
    }

    if (user.phoneVerified) {
      return res.json({
        success: true,
        message: 'Phone already verified',
        verified: true,
      });
    }

    // Verify OTP
    const isValid = verifyOTP(
      user.phoneVerificationCode,
      user.phoneVerificationExpiry,
      code
    );

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark phone as verified
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        phoneVerified: true,
        phoneVerificationCode: null,
        phoneVerificationExpiry: null,
      },
    });

    res.json({
      success: true,
      message: 'Phone verified successfully',
      verified: true,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

// GET /api/phone/status - Get phone verification status
router.get('/status', authRequired, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        phone: true,
        phoneVerified: true,
      },
    });

    res.json({
      phone: user.phone,
      verified: user.phoneVerified || false,
    });
  } catch (error) {
    console.error('Error getting phone status:', error);
    res.status(500).json({ message: 'Error getting phone status' });
  }
});

module.exports = router;

