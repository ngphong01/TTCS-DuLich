// routes/referral.js - Referral system
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');
const crypto = require('crypto');

// GET /api/referral/code - Get user's referral code
router.get('/code', authRequired, async (req, res) => {
  try {
    let user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, referralCode: true, name: true },
    });

    // Generate referral code if doesn't exist
    if (!user.referralCode) {
      const code = `REF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      user = await prisma.user.update({
        where: { id: req.user.id },
        data: { referralCode: code },
        select: { id: true, referralCode: true, name: true },
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const referralUrl = `${frontendUrl}/signup?ref=${user.referralCode}`;

    res.json({
      code: user.referralCode,
      url: referralUrl,
      referrals: await prisma.user.count({
        where: { referredById: req.user.id },
      }),
    });
  } catch (error) {
    console.error('Error getting referral code:', error);
    res.status(500).json({ message: 'Error getting referral code' });
  }
});

// GET /api/referral/stats - Get referral statistics
router.get('/stats', authRequired, async (req, res) => {
  try {
    const referrals = await prisma.user.findMany({
      where: { referredById: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        bookings: {
          select: { id: true, totalAmount: true, status: true },
        },
        tourBookings: {
          select: { id: true, totalAmount: true, status: true },
        },
      },
    });

    const totalReferrals = referrals.length;
    const totalRevenue = referrals.reduce((sum, ref) => {
      const bookingRevenue = ref.bookings
        .filter(b => b.status === 'COMPLETED')
        .reduce((s, b) => s + b.totalAmount, 0);
      const tourRevenue = ref.tourBookings
        .filter(b => b.status === 'COMPLETED')
        .reduce((s, b) => s + b.totalAmount, 0);
      return sum + bookingRevenue + tourRevenue;
    }, 0);

    res.json({
      totalReferrals,
      totalRevenue,
      referrals: referrals.map(ref => ({
        id: ref.id,
        name: ref.name,
        email: ref.email,
        joinedAt: ref.createdAt,
        totalBookings: ref.bookings.length + ref.tourBookings.length,
      })),
    });
  } catch (error) {
    console.error('Error getting referral stats:', error);
    res.status(500).json({ message: 'Error getting referral stats' });
  }
});

// POST /api/referral/apply - Apply referral code during registration
router.post('/apply', async (req, res) => {
  try {
    const { code, email } = req.body;

    if (!code || !email) {
      return res.status(400).json({ message: 'Referral code and email are required' });
    }

    const referrer = await prisma.user.findUnique({
      where: { referralCode: code.toUpperCase() },
      select: { id: true, email: true },
    });

    if (!referrer) {
      return res.status(404).json({ message: 'Invalid referral code' });
    }

    if (referrer.email === email) {
      return res.status(400).json({ message: 'Cannot use your own referral code' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { referredById: true },
    });

    if (existingUser && existingUser.referredById) {
      return res.status(400).json({ message: 'User already has a referrer' });
    }

    res.json({
      valid: true,
      referrerId: referrer.id,
      message: 'Referral code is valid',
    });
  } catch (error) {
    console.error('Error applying referral code:', error);
    res.status(500).json({ message: 'Error applying referral code' });
  }
});

module.exports = router;

