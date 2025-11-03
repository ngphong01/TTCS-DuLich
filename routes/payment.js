// routes/payment.js
const express = require('express');
const prisma = require('../lib/prisma');
const router = express.Router();

// POST /api/payment/create (stub for now)
router.post('/create', async (req, res) => {
  try {
    const { bookingId, provider = 'stripe' } = req.body;
    
    // In real flow, create payment intent with provider and return redirect URL
    // For now, return mock payment URL
    const paymentUrl = provider === 'stripe' 
      ? `https://checkout.stripe.com/mock/${bookingId}`
      : provider === 'vnpay'
      ? `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?txnRef=${bookingId}`
      : provider === 'momo'
      ? `https://payment.momo.vn/gateway/${bookingId}`
      : `#`;
    
    // Check if payment already exists for this booking
    let payment;
    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId: Number(bookingId) }
    });

    if (existingPayment) {
      // Update existing payment
      payment = await prisma.payment.update({
        where: { bookingId: Number(bookingId) },
        data: {
          provider: provider.toUpperCase(),
          status: 'PENDING',
        }
      });
    } else {
      // Get booking to get totalAmount
      const booking = await prisma.booking.findUnique({
        where: { id: Number(bookingId) }
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Create new payment record in database
      payment = await prisma.payment.create({
        data: {
          bookingId: Number(bookingId),
          amount: booking.totalAmount,
          status: 'PENDING',
          provider: provider.toUpperCase(),
        }
      });
    }
    
    console.log('✅ Payment created successfully:', { 
      id: payment.id, 
      bookingId: payment.bookingId, 
      amount: payment.amount,
      provider: payment.provider 
    });
    
    res.status(201).json({ 
      paymentId: payment.id, 
      status: 'pending', 
      provider,
      url: paymentUrl // For now, return mock URL. In production, this would be the actual gateway URL
    });
  } catch (error) {
    console.error('❌ Error creating payment:', error);
    res.status(500).json({ error: 'Error creating payment' });
  }
});

// GET /api/payment/user/:id - list payments by user via Booking relation
router.get('/user/:id', async (req, res) => {
  const userId = Number(req.params.id);
  const payments = await prisma.payment.findMany({
    where: { booking: { userId } },
    include: { booking: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(payments);
});

// GET /api/payment/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const payment = await prisma.payment.findUnique({ where: { id }, include: { booking: true } });
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.json(payment);
});

module.exports = router;