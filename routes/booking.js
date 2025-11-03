// routes/booking.js
const express = require('express');
const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');
const { authRequired } = require('../middleware/auth');
const router = express.Router();

// POST /api/booking - Create booking
router.post('/', async (req, res) => {
  try {
    const { 
      destination, 
      destinationName, 
      guests, 
      from, 
      to, 
      name, 
      email, 
      phone, 
      note, 
      price, 
      totalAmount,
      paymentMethod,
      couponCode,
      discountAmount,
      serviceFee,
      tax
    } = req.body;

    // Validate required fields
    if (!destination || !name || !email || !guests || !totalAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get destination by slug
    const dest = await prisma.destination.findUnique({
      where: { slug: destination }
    });

    if (!dest) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    // Get or determine userId
    // Try to get from auth token first
    let userId = null;
    
    // Check if user is authenticated via token
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        userId = payload.id;
      } catch (error) {
        // Token invalid, continue with email lookup
      }
    }
    
    // If no userId from token and email is provided, try to find user by email
    if (!userId && email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      if (existingUser) {
        userId = existingUser.id;
      }
    }

    // If still no userId, we need userId for booking (required in schema)
    // We'll require either authentication or email must belong to existing user
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required. Please login or use a registered email address.' 
      });
    }

    // Generate unique booking code
    const bookingCode = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        code: bookingCode,
        userId: userId,
        destinationId: dest.id,
        status: 'PENDING',
        totalAmount: Math.round(totalAmount || price || 0),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        destination: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    // Create payment record if payment method is provided
    if (paymentMethod && booking.id) {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          status: paymentMethod === 'cod' || paymentMethod === 'bank_transfer' ? 'PENDING' : 'PENDING',
          provider: paymentMethod.toUpperCase(),
        }
      });
    }

    console.log('✅ Booking created successfully:', { 
      id: booking.id, 
      code: booking.code, 
      userId: booking.userId, 
      destinationId: booking.destinationId,
      totalAmount: booking.totalAmount 
    });
    
    res.status(201).json({
      id: booking.id,
      code: booking.code,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});

// GET /api/booking/user/:id - Get bookings by user ID
router.get('/user/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        destination: {
          select: { id: true, name: true, slug: true, price: true }
        },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// GET /api/booking/:id - Get single booking by ID
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        destination: {
          select: { id: true, name: true, slug: true, price: true }
        },
        payment: true
      }
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking' });
  }
});

module.exports = router;