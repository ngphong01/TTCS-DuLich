// routes/invoice.js - Invoice PDF generation
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');
const { generateInvoicePDF } = require('../lib/pdfGenerator');
const path = require('path');
const fs = require('fs');

// GET /api/invoice/:bookingId - Generate and download invoice PDF
router.get('/:bookingId', authRequired, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Get booking with related data
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: {
        user: true,
        destination: true,
        payment: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking or is admin
    if (booking.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Generate PDF
    const pdfPath = await generateInvoicePDF(
      booking,
      booking.user,
      booking.destination,
      booking.payment
    );

    // Send file
    const fullPath = path.join(__dirname, '..', pdfPath);
    if (!fs.existsSync(fullPath)) {
      return res.status(500).json({ message: 'PDF generation failed' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${booking.code}.pdf"`);
    res.sendFile(fullPath);
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Error generating invoice' });
  }
});

module.exports = router;

