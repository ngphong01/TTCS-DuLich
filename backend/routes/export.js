// routes/export.js - Export data to Excel/CSV
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired, isAdmin } = require('../middleware/auth');

// Helper function to convert data to CSV
function toCSV(data, headers) {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header] || '';
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  return [csvHeaders, ...csvRows].join('\n');
}

// GET /api/export/bookings - Export bookings to CSV
router.get('/bookings', authRequired, isAdmin, async (req, res) => {
  try {
    const bookings = await prisma.bookingTour.findMany({
      include: {
        tour: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } },
        payment: { select: { status: true, provider: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = bookings.map(booking => ({
      'Mã đặt tour': booking.code,
      'Tên tour': booking.tour.name,
      'Khách hàng': booking.user.name,
      'Email': booking.user.email,
      'Số người': booking.participants,
      'Ngày khởi hành': booking.date.toISOString().split('T')[0],
      'Tổng tiền': booking.totalAmount,
      'Trạng thái': booking.status,
      'Thanh toán': booking.payment?.status || 'N/A',
      'Phương thức': booking.payment?.provider || 'N/A',
      'Ngày đặt': booking.createdAt.toISOString().split('T')[0],
    }));

    const csv = toCSV(data, Object.keys(data[0] || {}));
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
    res.send('\ufeff' + csv); // BOM for Excel UTF-8
  } catch (error) {
    console.error('Error exporting bookings:', error);
    res.status(500).json({ message: 'Lỗi xuất dữ liệu' });
  }
});

// GET /api/export/users - Export users to CSV
router.get('/users', authRequired, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        loyalty: { select: { points: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = users.map(user => ({
      'ID': user.id,
      'Tên': user.name,
      'Email': user.email,
      'Vai trò': user.role,
      'Điểm thưởng': user.loyalty?.points || 0,
      'Số đặt tour': user._count.bookings,
      'Số đánh giá': user._count.reviews,
      'Ngày tạo': user.createdAt.toISOString().split('T')[0],
    }));

    const csv = toCSV(data, Object.keys(data[0] || {}));
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send('\ufeff' + csv);
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({ message: 'Lỗi xuất dữ liệu' });
  }
});

// GET /api/export/tours - Export tours to CSV
router.get('/tours', authRequired, isAdmin, async (req, res) => {
  try {
    const tours = await prisma.tour.findMany({
      include: {
        destination: { select: { name: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = tours.map(tour => ({
      'ID': tour.id,
      'Tên tour': tour.name,
      'Điểm đến': tour.destination?.name || 'N/A',
      'Giá': tour.price,
      'Giá gốc': tour.originalPrice || 'N/A',
      'Đánh giá': tour.rating,
      'Số đánh giá': tour.reviewCount,
      'Số chỗ còn lại': tour.availability,
      'Số đặt tour': tour._count.bookings,
      'Nổi bật': tour.featured ? 'Có' : 'Không',
      'Ngày tạo': tour.createdAt.toISOString().split('T')[0],
    }));

    const csv = toCSV(data, Object.keys(data[0] || {}));
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=tours.csv');
    res.send('\ufeff' + csv);
  } catch (error) {
    console.error('Error exporting tours:', error);
    res.status(500).json({ message: 'Lỗi xuất dữ liệu' });
  }
});

// GET /api/export/reviews - Export reviews to CSV
router.get('/reviews', authRequired, isAdmin, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true, email: true } },
        destination: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = reviews.map(review => ({
      'ID': review.id,
      'Điểm đến': review.destination.name,
      'Khách hàng': review.user.name,
      'Email': review.user.email,
      'Đánh giá': review.rating,
      'Bình luận': review.comment || '',
      'Đã duyệt': review.approved ? 'Có' : 'Không',
      'Vote hữu ích': review.helpfulCount,
      'Ngày tạo': review.createdAt.toISOString().split('T')[0],
    }));

    const csv = toCSV(data, Object.keys(data[0] || {}));
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=reviews.csv');
    res.send('\ufeff' + csv);
  } catch (error) {
    console.error('Error exporting reviews:', error);
    res.status(500).json({ message: 'Lỗi xuất dữ liệu' });
  }
});

module.exports = router;

