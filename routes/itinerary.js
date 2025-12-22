// routes/itinerary.js - Itinerary PDF generation
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// GET /api/itinerary/:bookingId/pdf - Generate and download itinerary PDF
router.get('/:bookingId/pdf', authRequired, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const bookingType = req.query.type || 'booking'; // 'booking' or 'tour'

    let booking, user, destination, itinerary;

    if (bookingType === 'tour') {
      booking = await prisma.bookingTour.findUnique({
        where: { id: bookingId },
        include: {
          user: { select: { name: true, email: true } },
          tour: {
            select: {
              name: true,
              itinerary: true,
              duration: true,
              description: true,
            },
          },
        },
      });

      if (!booking) {
        return res.status(404).json({ message: 'Tour booking not found' });
      }

      // Ensure user can only access their own booking unless admin
      if (req.user.role !== 'ADMIN' && booking.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      user = booking.user;
      destination = { name: booking.tour.name };
      itinerary = booking.tour.itinerary;
    } else {
      booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: { select: { name: true, email: true } },
          destination: {
            select: {
              name: true,
              description: true,
            },
          },
        },
      });

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Ensure user can only access their own booking unless admin
      if (req.user.role !== 'ADMIN' && booking.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      user = booking.user;
      destination = booking.destination;
      itinerary = null; // Regular bookings don't have itinerary
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `itinerary-${booking.code || bookingId}.pdf`;
    const filepath = path.join(__dirname, '../uploads/itineraries', filename);

    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Pipe PDF to file
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // PDF Content
    doc.fontSize(24).text('Lịch trình du lịch', { align: 'center' });
    doc.moveDown();

    doc.fontSize(16).text(`Mã đặt tour: ${booking.code || `#${bookingId}`}`);
    doc.text(`Khách hàng: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Điểm đến: ${destination.name}`);
    if (booking.from) {
      doc.text(`Ngày khởi hành: ${new Date(booking.from).toLocaleDateString('vi-VN')}`);
    }
    if (booking.date) {
      doc.text(`Ngày khởi hành: ${new Date(booking.date).toLocaleDateString('vi-VN')}`);
    }
    doc.moveDown();

    if (itinerary && Array.isArray(itinerary)) {
      doc.fontSize(18).text('Chi tiết lịch trình:', { underline: true });
      doc.moveDown();

      itinerary.forEach((day, index) => {
        doc.fontSize(16).text(`Ngày ${day.day || index + 1}: ${day.title || ''}`, { underline: true });
        doc.moveDown(0.5);

        if (day.activities && Array.isArray(day.activities)) {
          day.activities.forEach((activity) => {
            doc.fontSize(12);
            if (activity.time) {
              doc.text(`  ${activity.time}: ${activity.title || ''}`, { continued: false });
            } else {
              doc.text(`  - ${activity.title || ''}`, { continued: false });
            }
            if (activity.description) {
              doc.fontSize(10).text(`    ${activity.description}`, { indent: 20 });
            }
            doc.moveDown(0.3);
          });
        }

        doc.moveDown();
      });
    } else {
      doc.fontSize(14).text('Lịch trình chi tiết sẽ được cập nhật sớm nhất.', { align: 'center' });
    }

    doc.end();

    // Wait for PDF to be written
    stream.on('finish', () => {
      // Send email with PDF attachment
      const { sendItineraryPDFEmail } = require('../lib/email');
      const pdfUrl = `/uploads/itineraries/${filename}`;
      
      sendItineraryPDFEmail(booking, user, destination, filepath).catch(err => {
        console.error('❌ Failed to send itinerary PDF email:', err);
      });

      // Send PDF as response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      fs.createReadStream(filepath).pipe(res);
    });

    stream.on('error', (err) => {
      console.error('Error generating PDF:', err);
      res.status(500).json({ message: 'Error generating PDF' });
    });
  } catch (error) {
    console.error('Error generating itinerary PDF:', error);
    res.status(500).json({ message: 'Error generating itinerary PDF', error: error.message });
  }
});

module.exports = router;

