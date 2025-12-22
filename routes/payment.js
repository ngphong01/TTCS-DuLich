// routes/payment.js
const express = require('express');
const prisma = require('../lib/prisma');
const { createOrder: createPaypalOrder, captureOrder: capturePaypalOrder, isPaypalConfigured, testCredentials } = require('../services/paypal');
const { createCheckoutSession: createStripeSession, isStripeConfigured } = require('../services/stripe');
const { createPaymentUrl: createVNPayUrl, isVNPayConfigured, verifyCallback: verifyVNPayCallback } = require('../services/vnpay');
const { createPaymentRequest: createMoMoRequest, isMoMoConfigured, verifyCallback: verifyMoMoCallback } = require('../services/momo');
const { createPaymentRequest: createZaloPayRequest, isZaloPayConfigured, verifyCallback: verifyZaloPayCallback } = require('../services/zalopay');
const router = express.Router();

// POST /api/payment/create (stub for now)
router.post('/create', async (req, res) => {
  try {
    const { bookingId, provider = 'stripe' } = req.body;
    const numericBookingId = Number(bookingId);

    if (!numericBookingId) {
      return res.status(400).json({ error: 'Invalid bookingId' });
    }

    // Normalize provider: credit_card -> stripe
    let normalizedProvider = String(provider).toLowerCase();
    if (normalizedProvider === 'credit_card') {
      normalizedProvider = 'stripe';
    }

    // Retrieve booking & ensure it exists
    const booking = await prisma.booking.findUnique({
      where: { id: numericBookingId },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if payment already exists for this booking
    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId: numericBookingId },
    });

    let payment;
    if (existingPayment) {
      // Update existing payment
      payment = await prisma.payment.update({
        where: { bookingId: numericBookingId },
        data: {
          provider: normalizedProvider.toUpperCase(),
          status: 'PENDING',
          amount: booking.totalAmount,
        },
      });
    } else {
      // Create new payment record in database
      payment = await prisma.payment.create({
        data: {
          bookingId: numericBookingId,
          amount: booking.totalAmount,
          status: 'PENDING',
          provider: normalizedProvider.toUpperCase(),
        },
      });
    }

    let paymentUrl = '#';
    let gatewayOrderId = null;

    switch (normalizedProvider) {
      case 'stripe':
      case 'credit_card': {
        if (!isStripeConfigured()) {
          return res.status(400).json({ error: 'Stripe not configured' });
        }

        const returnUrlBase = process.env.STRIPE_RETURN_URL || `${process.env.FRONTEND_URL || 'http://localhost:3001'}/checkout/stripe/success`;
        const cancelUrlBase = process.env.STRIPE_CANCEL_URL || `${process.env.FRONTEND_URL || 'http://localhost:3001'}/checkout/stripe/cancel`;
        const successUrl = new URL(returnUrlBase);
        successUrl.searchParams.set('paymentId', payment.id);
        successUrl.searchParams.set('bookingId', booking.id);
        const cancelUrl = new URL(cancelUrlBase);
        cancelUrl.searchParams.set('paymentId', payment.id);
        cancelUrl.searchParams.set('bookingId', booking.id);

        // Determine currency - default to VND, but can be configured
        const stripeCurrency = (process.env.STRIPE_CURRENCY || 'vnd').toLowerCase();
        const sourceCurrency = (process.env.STRIPE_SOURCE_CURRENCY || 'VND').toUpperCase();
        let amountForStripe = booking.totalAmount;

        // Convert currency if needed (e.g., VND to USD)
        if (stripeCurrency !== sourceCurrency.toLowerCase()) {
          const fallbackRate = stripeCurrency === 'usd' ? 24000 : 1;
          const exchangeRate = parseFloat(process.env.STRIPE_EXCHANGE_RATE || `${fallbackRate}`);
          if (!exchangeRate || exchangeRate <= 0) {
            throw new Error('Invalid Stripe exchange rate configuration');
          }
          amountForStripe = booking.totalAmount / exchangeRate;
        }

        const stripeSession = await createStripeSession({
          amount: amountForStripe,
          currency: stripeCurrency,
          successUrl: successUrl.toString(),
          cancelUrl: cancelUrl.toString(),
          referenceId: `BOOKING-${booking.id}`,
          description: `Thanh toán booking #${booking.id} - ${booking.destination?.name || 'TravelGo'}`,
          metadata: {
            booking_id: booking.id.toString(),
            payment_id: payment.id.toString(),
          },
        });

        paymentUrl = stripeSession.url;
        gatewayOrderId = stripeSession.sessionId;
        break;
      }
      case 'vnpay': {
        if (!isVNPayConfigured()) {
          return res.status(400).json({ error: 'VNPay not configured' });
        }

        try {
          const vnpayResult = createVNPayUrl({
            amount: booking.totalAmount,
            orderId: `BOOKING-${booking.id}-${Date.now()}`,
            orderInfo: `Thanh toan booking #${booking.id}`,
            ipAddr: req.ip || req.connection.remoteAddress || '127.0.0.1',
          });

          paymentUrl = vnpayResult.paymentUrl;
          gatewayOrderId = vnpayResult.orderId;
        } catch (error) {
          console.error('VNPay error:', error);
          return res.status(500).json({ error: 'Failed to create VNPay payment' });
        }
        break;
      }
      case 'momo': {
        if (!isMoMoConfigured()) {
          return res.status(400).json({ error: 'MoMo not configured' });
        }

        try {
          const momoResult = await createMoMoRequest({
            amount: booking.totalAmount,
            orderId: `BOOKING-${booking.id}-${Date.now()}`,
            orderInfo: `Thanh toan booking #${booking.id}`,
          });

          paymentUrl = momoResult.paymentUrl;
          gatewayOrderId = momoResult.requestId;
        } catch (error) {
          console.error('MoMo error:', error);
          return res.status(500).json({ error: 'Failed to create MoMo payment' });
        }
        break;
      }
      case 'zalopay': {
        if (!isZaloPayConfigured()) {
          return res.status(400).json({ error: 'ZaloPay not configured' });
        }

        try {
          const zalopayResult = await createZaloPayRequest({
            amount: booking.totalAmount,
            orderId: `BOOKING-${booking.id}-${Date.now()}`,
            description: `Thanh toan booking #${booking.id}`,
          });

          paymentUrl = zalopayResult.paymentUrl;
          gatewayOrderId = zalopayResult.orderId;
        } catch (error) {
          console.error('ZaloPay error:', error);
          return res.status(500).json({ error: 'Failed to create ZaloPay payment' });
        }
        break;
      }
      case 'paypal': {
        if (!isPaypalConfigured()) {
          return res.status(400).json({ error: 'PayPal not configured' });
        }

        const returnUrlBase = process.env.PAYPAL_RETURN_URL || `${process.env.FRONTEND_URL || 'http://localhost:3001'}/checkout/paypal/success`;
        const cancelUrlBase = process.env.PAYPAL_CANCEL_URL || `${process.env.FRONTEND_URL || 'http://localhost:3001'}/checkout/paypal/cancel`;
        const successUrl = new URL(returnUrlBase);
        successUrl.searchParams.set('paymentId', payment.id);
        successUrl.searchParams.set('bookingId', booking.id);
        const cancelUrl = new URL(cancelUrlBase);
        cancelUrl.searchParams.set('paymentId', payment.id);
        cancelUrl.searchParams.set('bookingId', booking.id);

        const paypalCurrency = (process.env.PAYPAL_CURRENCY || 'USD').toUpperCase();
        const sourceCurrency = (process.env.PAYPAL_SOURCE_CURRENCY || 'VND').toUpperCase();
        let amountForPaypal = booking.totalAmount;

        if (paypalCurrency !== sourceCurrency) {
          const fallbackRate = paypalCurrency === 'USD' ? 24000 : 1;
          const exchangeRate = parseFloat(process.env.PAYPAL_EXCHANGE_RATE || `${fallbackRate}`);
          if (!exchangeRate || exchangeRate <= 0) {
            throw new Error('Invalid PayPal exchange rate configuration');
          }
          amountForPaypal = booking.totalAmount / exchangeRate;
        }

        const normalizedAmount = Math.max(amountForPaypal, 0.01);

        const paypalOrder = await createPaypalOrder({
          amount: normalizedAmount,
          currency: paypalCurrency,
          referenceId: `BOOKING-${booking.id}`,
          description: `Thanh toán booking #${booking.id}`,
          returnUrl: successUrl.toString(),
          cancelUrl: cancelUrl.toString(),
        });

        paymentUrl = paypalOrder.approveLink;
        gatewayOrderId = paypalOrder.orderId;
        break;
      }
      default:
        paymentUrl = '#';
    }

    console.log('✅ Payment created successfully:', {
      id: payment.id,
      bookingId: payment.bookingId,
      amount: payment.amount,
      provider: payment.provider,
      gatewayOrderId,
    });

    res.status(201).json({
      paymentId: payment.id,
      status: 'pending',
      provider: normalizedProvider,
      url: paymentUrl,
      gatewayOrderId,
    });
  } catch (error) {
    console.error('❌ Error creating payment:', error);
    
    // Provide more detailed error message
    const errorMessage = error?.message || 'Error creating payment';
    const statusCode = error?.status || 500;
    
    // If it's a PayPal authentication error, provide helpful message
    if (errorMessage.includes('Client Authentication failed') || errorMessage.includes('invalid_client')) {
      res.status(401).json({ 
        error: 'PayPal authentication failed. Please check PayPal credentials in server configuration.',
        details: 'The PayPal Client ID or Secret is invalid or expired. Contact administrator.'
      });
      return;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: error?.response?.error_description || error?.response?.error || undefined
    });
  }
});

// POST /api/payment/paypal/capture
router.post('/paypal/capture', async (req, res) => {
  try {
    const { orderId, paymentId, bookingId } = req.body || {};

    if (!orderId) {
      return res.status(400).json({ error: 'Missing PayPal orderId' });
    }

    if (!isPaypalConfigured()) {
      return res.status(400).json({ error: 'PayPal not configured' });
    }

    const capture = await capturePaypalOrder(orderId);
    const captureStatus = capture?.status || capture?.purchase_units?.[0]?.payments?.captures?.[0]?.status;
    const success = captureStatus === 'COMPLETED';

    let paymentRecord = null;
    const paymentWhere = paymentId
      ? { id: Number(paymentId) }
      : bookingId
      ? { bookingId: Number(bookingId) }
      : null;

    if (paymentWhere) {
      paymentRecord = await prisma.payment.update({
        where: paymentWhere,
        data: {
          status: success ? 'SUCCESS' : 'FAILED',
          provider: 'PAYPAL',
          updatedAt: new Date(),
        },
      });
    }

    const resolvedBookingId = paymentRecord?.bookingId || (bookingId ? Number(bookingId) : null);
    if (success && resolvedBookingId) {
      await prisma.booking.update({
        where: { id: resolvedBookingId },
        data: { status: 'CONFIRMED' },
      });
    }

    res.json({
      success,
      capture,
      paymentId: paymentRecord?.id || null,
      bookingId: resolvedBookingId,
    });
  } catch (error) {
    console.error('❌ Error capturing PayPal payment:', error);
    const status = error?.status === 422 ? 400 : error?.status || 500;
    res.status(status).json({
      error: 'Error capturing PayPal payment',
      details: error?.response || error?.message,
    });
  }
});

// POST /api/payment/paypal/cancel
router.post('/paypal/cancel', async (req, res) => {
  try {
    const { paymentId, bookingId } = req.body || {};

    const paymentWhere = paymentId
      ? { id: Number(paymentId) }
      : bookingId
      ? { bookingId: Number(bookingId) }
      : null;

    if (!paymentWhere) {
      return res.status(400).json({ error: 'Missing payment identifier' });
    }

    const paymentRecord = await prisma.payment.update({
      where: paymentWhere,
      data: {
        status: 'FAILED',
        updatedAt: new Date(),
      },
    });

    if (paymentRecord?.bookingId) {
      await prisma.booking.update({
        where: { id: paymentRecord.bookingId },
        data: { status: 'CANCELLED' },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error cancelling PayPal payment:', error);
    res.status(500).json({ error: 'Error cancelling PayPal payment' });
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

// GET /api/payment/test/paypal
// Test PayPal credentials (for debugging)
router.get('/test/paypal', async (req, res) => {
  try {
    if (!isPaypalConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'PayPal not configured',
        message: 'PAYPAL_CLIENT_ID and PAYPAL_SECRET are required in .env',
      });
    }

    const result = await testCredentials();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        configured: true,
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message,
        error: result.error,
        status: result.status,
        hint: 'Check your PayPal credentials in .env file. They may be invalid, expired, or for the wrong environment (sandbox vs production).',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/payment/vnpay/callback - VNPay return URL handler
router.get('/vnpay/callback', async (req, res) => {
  try {
    const verification = verifyVNPayCallback(req.query);

    if (!verification.valid) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/failed?error=${encodeURIComponent(verification.error)}`);
    }

    // Extract booking ID from orderId (format: BOOKING-{id}-{timestamp})
    const orderIdParts = verification.orderId.split('-');
    const bookingId = orderIdParts.length >= 2 ? parseInt(orderIdParts[1]) : null;

    if (!bookingId) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/failed?error=Invalid order ID`);
    }

    // Find payment by booking
    const payment = await prisma.payment.findFirst({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: verification.success ? 'SUCCESS' : 'FAILED',
          gatewayOrderId: verification.transactionId,
          updatedAt: new Date(),
        },
      });

      if (verification.success) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMED' },
        });
      }
    }

    const redirectUrl = verification.success
      ? `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/success?paymentId=${payment?.id}&bookingId=${bookingId}`
      : `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/failed?error=${encodeURIComponent(verification.message)}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('VNPay callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/failed?error=Payment verification failed`);
  }
});

// POST /api/payment/momo/callback - MoMo IPN handler
router.post('/momo/callback', async (req, res) => {
  try {
    const verification = verifyMoMoCallback(req.body);

    if (!verification.valid) {
      return res.status(400).json({ error: verification.error });
    }

    // Extract booking ID from orderId
    const orderIdParts = verification.orderId.split('-');
    const bookingId = orderIdParts.length >= 2 ? parseInt(orderIdParts[1]) : null;

    if (!bookingId) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    // Find payment by booking
    const payment = await prisma.payment.findFirst({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: verification.success ? 'SUCCESS' : 'FAILED',
          gatewayOrderId: verification.transactionId,
          updatedAt: new Date(),
        },
      });

      if (verification.success) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMED' },
        });
      }
    }

    // MoMo expects specific response format
    res.json({
      resultCode: verification.success ? 0 : verification.resultCode || 1000,
      message: verification.message || 'Success',
    });
  } catch (error) {
    console.error('MoMo callback error:', error);
    res.status(500).json({ resultCode: 1000, message: 'Internal error' });
  }
});

// GET /api/payment/momo/callback - MoMo return URL handler
router.get('/momo/callback', async (req, res) => {
  try {
    const verification = verifyMoMoCallback(req.query);

    if (!verification.valid) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/failed?error=${encodeURIComponent(verification.error)}`);
    }

    // Extract booking ID from orderId
    const orderIdParts = verification.orderId.split('-');
    const bookingId = orderIdParts.length >= 2 ? parseInt(orderIdParts[1]) : null;

    if (!bookingId) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/failed?error=Invalid order ID`);
    }

    // Find payment by booking
    const payment = await prisma.payment.findFirst({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: verification.success ? 'SUCCESS' : 'FAILED',
          gatewayOrderId: verification.transactionId,
          updatedAt: new Date(),
        },
      });

      if (verification.success) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMED' },
        });
      }
    }

    const redirectUrl = verification.success
      ? `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/success?paymentId=${payment?.id}&bookingId=${bookingId}`
      : `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/failed?error=${encodeURIComponent(verification.message)}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('MoMo callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/failed?error=Payment verification failed`);
  }
});

// POST /api/payment/zalopay/callback - ZaloPay IPN handler
router.post('/zalopay/callback', async (req, res) => {
  try {
    const verification = verifyZaloPayCallback(req.body);

    if (!verification.valid) {
      return res.status(400).json({ error: verification.error });
    }

    // Extract booking ID from orderId
    const orderIdParts = verification.orderId.split('-');
    const bookingId = orderIdParts.length >= 2 ? parseInt(orderIdParts[1]) : null;

    if (!bookingId) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    // Find payment by booking
    const payment = await prisma.payment.findFirst({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: verification.success ? 'SUCCESS' : 'FAILED',
          gatewayOrderId: verification.transactionId,
          updatedAt: new Date(),
        },
      });

      if (verification.success) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMED' },
        });
      }
    }

    // ZaloPay expects specific response format
    res.json({
      return_code: verification.success ? 1 : 0,
      return_message: verification.message || 'Success',
    });
  } catch (error) {
    console.error('ZaloPay callback error:', error);
    res.status(500).json({ return_code: 0, return_message: 'Internal error' });
  }
});

// GET /api/payment/zalopay/callback - ZaloPay return URL handler
router.get('/zalopay/callback', async (req, res) => {
  try {
    const { status, app_trans_id } = req.query;

    if (!app_trans_id) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/failed?error=Invalid transaction`);
    }

    // Extract booking ID from app_trans_id
    const bookingIdMatch = app_trans_id.toString().match(/BOOKING-(\d+)-/);
    const bookingId = bookingIdMatch ? parseInt(bookingIdMatch[1]) : null;

    if (!bookingId) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/failed?error=Invalid order ID`);
    }

    // Find payment by booking
    const payment = await prisma.payment.findFirst({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });

    const success = status === '1' || status === 'success';

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: success ? 'SUCCESS' : 'FAILED',
          updatedAt: new Date(),
        },
      });

      if (success) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMED' },
        });
      }
    }

    const redirectUrl = success
      ? `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/success?paymentId=${payment?.id}&bookingId=${bookingId}`
      : `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/failed?error=Payment failed`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('ZaloPay callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/failed?error=Payment verification failed`);
  }
});

// GET /api/payment/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const payment = await prisma.payment.findUnique({ where: { id }, include: { booking: true } });
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.json(payment);
});

module.exports = router;