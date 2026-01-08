// routes/bookingTour.js - Tour booking management
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');
const { bookingLimiter } = require('../middleware/rateLimit');

// POST /api/booking-tour - Create tour booking
router.post('/', bookingLimiter, authRequired, async (req, res) => {
  try {
    const { tourId, participants, date, totalAmount, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!tourId || !participants || !date || !totalAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check tour availability
    const tour = await prisma.tour.findUnique({
      where: { id: parseInt(tourId) },
      select: { id: true, name: true, availability: true, maxCapacity: true },
    });

    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    if (tour.availability < participants) {
      return res.status(400).json({ 
        message: `Chỉ còn ${tour.availability} chỗ. Không đủ chỗ cho ${participants} người.` 
      });
    }

    // Generate unique booking code
    const bookingCode = `BT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create booking and update availability in transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create booking
      const newBooking = await tx.bookingTour.create({
        data: {
          code: bookingCode,
          tourId: parseInt(tourId),
          userId,
          participants: parseInt(participants),
          date: new Date(date),
          totalAmount: Math.round(totalAmount),
          status: 'PENDING',
        },
        include: {
          tour: { select: { name: true } },
          user: { select: { name: true, email: true } },
        },
      });

      // Decrease availability
      await tx.tour.update({
        where: { id: parseInt(tourId) },
        data: {
          availability: { decrement: parseInt(participants) },
        },
      });

      return newBooking;
    });

    // Create payment record if payment method is provided
    if (paymentMethod && booking.id) {
      await prisma.paymentTour.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          status: 'PENDING',
          provider: paymentMethod.toUpperCase(),
        },
      });
    }

    res.status(201).json({
      id: booking.id,
      code: booking.code,
      message: 'Tour booking created successfully',
      booking,
    });
  } catch (error) {
    console.error('Error creating tour booking:', error);
    res.status(500).json({ message: 'Error creating tour booking', error: error.message });
  }
});

// PUT /api/booking-tour/:id/cancel - Cancel tour booking (restore availability)
router.put('/:id/cancel', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await prisma.bookingTour.findUnique({
      where: { id: parseInt(id) },
      include: { tour: { select: { id: true } } },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking or is admin
    if (booking.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Cancel booking and restore availability
    await prisma.$transaction(async (tx) => {
      await tx.bookingTour.update({
        where: { id: parseInt(id) },
        data: { status: 'CANCELLED' },
      });

      // Restore availability
      await tx.tour.update({
        where: { id: booking.tourId },
        data: {
          availability: { increment: booking.participants },
        },
      });
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling tour booking:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

module.exports = router;

