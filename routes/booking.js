// routes/booking.js
const express = require('express');
const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');
const { authRequired } = require('../middleware/auth');
const { bookingLimiter } = require('../middleware/rateLimit');
const router = express.Router();

// POST /api/booking - Create booking
router.post('/', bookingLimiter, async (req, res) => {
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
      promoCodeId,
      serviceFee,
      tax,
      type,
      comboTitle,
      comboIncludes
    } = req.body;

    // Check if this is a combo booking
    const isCombo = type === 'combo';

    // Validate required fields
    if (isCombo) {
      // For combo, we don't need destination
      if (!comboTitle || !name || !email || !guests || !totalAmount) {
        return res.status(400).json({ message: 'Missing required fields for combo booking' });
      }
    } else {
      // For regular booking, destination is required
      if (!destination || !name || !email || !guests || !totalAmount) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
    }

    let dest = null;
    if (!isCombo) {
      // Get destination by slug for regular booking
      dest = await prisma.destination.findUnique({
        where: { slug: destination }
      });

      if (!dest) {
        return res.status(404).json({ message: 'Destination not found' });
      }
    } else {
      // For combo, create or find a special "Combo" destination
      dest = await prisma.destination.findFirst({
        where: { slug: 'combo' }
      });
      
      if (!dest) {
        // Create a special destination for combo bookings
        dest = await prisma.destination.create({
          data: {
            name: 'Combo Du Lịch',
            slug: 'combo',
            description: 'Gói combo du lịch',
            country: 'Việt Nam',
            price: 0,
          }
        });
      }
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
        where: { email },
        select: { id: true, email: true, name: true, role: true }
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

    // Apply promo code if provided
    let finalDiscountAmount = discountAmount || 0;
    let appliedPromoCode = null;
    
    if (couponCode && !promoCodeId) {
      try {
        const promoCode = await prisma.promoCode.findUnique({
          where: { code: couponCode.toUpperCase() },
        });
        
        if (promoCode && promoCode.active) {
          const now = new Date();
          const orderAmount = totalAmount || price || 0;
          
          // Validate promo code
          if (now >= promoCode.validFrom && now <= promoCode.validUntil &&
              (!promoCode.usageLimit || promoCode.usedCount < promoCode.usageLimit) &&
              orderAmount >= promoCode.minAmount) {
            
            // Calculate discount
            if (promoCode.discountType === 'PERCENTAGE') {
              finalDiscountAmount = Math.floor((orderAmount * promoCode.discountValue) / 100);
              if (promoCode.maxDiscount) {
                finalDiscountAmount = Math.min(finalDiscountAmount, promoCode.maxDiscount);
              }
            } else {
              finalDiscountAmount = promoCode.discountValue;
            }
            
            appliedPromoCode = promoCode;
          }
        }
      } catch (promoError) {
        console.error('Error validating promo code:', promoError);
        // Continue without promo code if validation fails
      }
    }

    // Calculate final amount
    const finalAmount = Math.max(0, (totalAmount || price || 0) - finalDiscountAmount);

    // Generate unique booking code
    const bookingCode = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        code: bookingCode,
        userId: userId,
        destinationId: dest.id,
        status: 'PENDING',
        totalAmount: Math.round(finalAmount),
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

    // Record promo code usage if applied
    if (appliedPromoCode && booking.id && userId) {
      try {
        await prisma.promoCodeUsage.create({
          data: {
            promoCodeId: appliedPromoCode.id,
            userId: userId,
            bookingId: booking.id,
            amount: finalDiscountAmount,
          },
        });
        
        // Update used count
        await prisma.promoCode.update({
          where: { id: appliedPromoCode.id },
          data: { usedCount: { increment: 1 } },
        });
      } catch (promoError) {
        console.error('Error recording promo code usage:', promoError);
        // Don't fail booking if promo recording fails
      }
    }

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

    // Gửi email xác nhận đặt tour (không block response nếu email fail)
    const { sendBookingConfirmationEmail } = require('../lib/email');
    if (booking.user && booking.destination) {
      sendBookingConfirmationEmail(booking, booking.user, booking.destination).catch(err => {
        console.error('❌ Failed to send booking confirmation email:', err);
      });
    }
    
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
          select: { id: true, name: true, slug: true, price: true, image: true }
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
          select: { id: true, name: true, slug: true, price: true, image: true }
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