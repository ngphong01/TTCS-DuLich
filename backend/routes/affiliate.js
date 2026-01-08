// routes/affiliate.js - Affiliate system (extended referral system)
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired, isAdmin } = require('../middleware/auth');

// GET /api/affiliate/stats - Get affiliate statistics
router.get('/stats', authRequired, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        referralCode: true,
        referrals: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            bookings: {
              select: {
                id: true,
                totalAmount: true,
                status: true,
                createdAt: true,
              },
            },
            tourBookings: {
              select: {
                id: true,
                totalAmount: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!user.referralCode) {
      return res.json({
        referralCode: null,
        totalReferrals: 0,
        totalRevenue: 0,
        totalCommission: 0,
        referrals: [],
      });
    }

    // Calculate revenue from referrals
    let totalRevenue = 0;
    let totalCommission = 0;
    const commissionRate = 0.05; // 5% commission

    for (const referral of user.referrals) {
      const bookingRevenue = referral.bookings
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + b.totalAmount, 0);
      
      const tourRevenue = referral.tourBookings
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + b.totalAmount, 0);
      
      const referralRevenue = bookingRevenue + tourRevenue;
      totalRevenue += referralRevenue;
      totalCommission += referralRevenue * commissionRate;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const affiliateUrl = `${frontendUrl}/signup?ref=${user.referralCode}`;

    res.json({
      referralCode: user.referralCode,
      affiliateUrl,
      totalReferrals: user.referrals.length,
      totalRevenue,
      totalCommission: Math.round(totalCommission),
      commissionRate: commissionRate * 100, // 5%
      referrals: user.referrals.map(ref => ({
        id: ref.id,
        name: ref.name,
        email: ref.email,
        joinedAt: ref.createdAt,
        totalBookings: ref.bookings.length + ref.tourBookings.length,
        totalRevenue: ref.bookings
          .filter(b => b.status === 'COMPLETED')
          .reduce((sum, b) => sum + b.totalAmount, 0) +
          ref.tourBookings
            .filter(b => b.status === 'COMPLETED')
            .reduce((sum, b) => sum + b.totalAmount, 0),
      })),
    });
  } catch (error) {
    console.error('Error getting affiliate stats:', error);
    res.status(500).json({ message: 'Error getting affiliate stats' });
  }
});

// GET /api/affiliate/commissions - Get commission history
router.get('/commissions', authRequired, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        referrals: {
          select: {
            id: true,
            name: true,
            bookings: {
              where: { status: 'COMPLETED' },
              select: {
                id: true,
                totalAmount: true,
                createdAt: true,
              },
            },
            tourBookings: {
              where: { status: 'COMPLETED' },
              select: {
                id: true,
                totalAmount: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    const commissionRate = 0.05; // 5%
    const commissions = [];

    for (const referral of user.referrals) {
      for (const booking of referral.bookings) {
        commissions.push({
          type: 'booking',
          referralId: referral.id,
          referralName: referral.name,
          bookingId: booking.id,
          amount: booking.totalAmount,
          commission: Math.round(booking.totalAmount * commissionRate),
          date: booking.createdAt,
        });
      }

      for (const booking of referral.tourBookings) {
        commissions.push({
          type: 'tour',
          referralId: referral.id,
          referralName: referral.name,
          bookingId: booking.id,
          amount: booking.totalAmount,
          commission: Math.round(booking.totalAmount * commissionRate),
          date: booking.createdAt,
        });
      }
    }

    // Sort by date (newest first)
    commissions.sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalCommission = commissions.reduce((sum, c) => sum + c.commission, 0);

    res.json({
      commissions,
      totalCommission,
      totalCount: commissions.length,
    });
  } catch (error) {
    console.error('Error getting commissions:', error);
    res.status(500).json({ message: 'Error getting commissions' });
  }
});

// POST /api/affiliate/admin/payout - Create payout request (Admin)
router.post('/admin/payout', authRequired, isAdmin, async (req, res) => {
  try {
    const { userId, amount, method, accountInfo } = req.body;

    if (!userId || !amount || !method) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // In a real system, you would create a payout record
    // For now, just return success
    res.json({
      success: true,
      message: 'Payout request created',
      payout: {
        userId,
        amount,
        method,
        accountInfo,
        status: 'PENDING',
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error creating payout:', error);
    res.status(500).json({ message: 'Error creating payout' });
  }
});

module.exports = router;

