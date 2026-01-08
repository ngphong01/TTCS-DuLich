// lib/pdfGenerator.js - PDF Invoice Generator
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate PDF invoice for booking
 * @param {Object} booking - Booking object
 * @param {Object} user - User object
 * @param {Object} destination - Destination object
 * @param {Object} payment - Payment object (optional)
 * @returns {Promise<string>} - Path to generated PDF file
 */
async function generateInvoicePDF(booking, user, destination, payment = null) {
  return new Promise((resolve, reject) => {
    try {
      // Create uploads/invoices directory if it doesn't exist
      const invoicesDir = path.join(__dirname, '..', 'uploads', 'invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `invoice-${booking.code}-${Date.now()}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      // Pipe to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#4F46E5')
        .text('TravelGo', 50, 50)
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#666666')
        .text('Hóa đơn đặt tour', 50, 80);

      // Invoice Info
      doc
        .fontSize(12)
        .fillColor('#000000')
        .text(`Mã đơn: ${booking.code}`, 400, 50, { align: 'right' })
        .text(`Ngày đặt: ${new Date(booking.createdAt).toLocaleDateString('vi-VN')}`, 400, 70, {
          align: 'right',
        })
        .text(`Trạng thái: ${getStatusText(booking.status)}`, 400, 90, { align: 'right' });

      // Customer Info
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('Thông tin khách hàng', 50, 130)
        .fontSize(11)
        .font('Helvetica')
        .text(`Tên: ${user.name}`, 50, 155)
        .text(`Email: ${user.email}`, 50, 175);

      // Booking Details
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Chi tiết đơn hàng', 50, 220)
        .fontSize(11)
        .font('Helvetica')
        .text(`Điểm đến: ${destination.name}`, 50, 245)
        .text(`Số lượng: ${booking.guests || 1} người`, 50, 265);

      // Table Header
      const tableTop = 300;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#FFFFFF')
        .rect(50, tableTop, 500, 25)
        .fill('#4F46E5')
        .text('Mô tả', 60, tableTop + 8)
        .text('Số lượng', 350, tableTop + 8)
        .text('Thành tiền', 420, tableTop + 8, { align: 'right' });

      // Table Row
      doc
        .font('Helvetica')
        .fillColor('#000000')
        .rect(50, tableTop + 25, 500, 30)
        .fill('#F9FAFB')
        .text(destination.name, 60, tableTop + 35)
        .text(`${booking.guests || 1} người`, 350, tableTop + 35)
        .text(formatCurrency(booking.totalAmount), 470, tableTop + 35, { align: 'right' });

      // Total
      const totalY = tableTop + 70;
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Tổng cộng:', 350, totalY)
        .text(formatCurrency(booking.totalAmount), 470, totalY, { align: 'right' });

      // Payment Info
      if (payment) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('Thông tin thanh toán', 50, totalY + 50)
          .fontSize(11)
          .font('Helvetica')
          .text(`Phương thức: ${getPaymentProviderText(payment.provider)}`, 50, totalY + 75)
          .text(`Trạng thái: ${getPaymentStatusText(payment.status)}`, 50, totalY + 95)
          .text(`Ngày thanh toán: ${new Date(payment.createdAt).toLocaleDateString('vi-VN')}`, 50, totalY + 115);
      }

      // Footer
      const footerY = 700;
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#999999')
        .text('Cảm ơn bạn đã sử dụng dịch vụ của TravelGo!', 50, footerY, { align: 'center' })
        .text('Hotline: 1900-xxxx | Email: support@travelgo.com', 50, footerY + 15, { align: 'center' });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve(`/uploads/invoices/${fileName}`);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function getStatusText(status) {
  const statusMap = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };
  return statusMap[status] || status;
}

function getPaymentStatusText(status) {
  const statusMap = {
    PENDING: 'Chờ thanh toán',
    SUCCESS: 'Đã thanh toán',
    FAILED: 'Thanh toán thất bại',
  };
  return statusMap[status] || status;
}

function getPaymentProviderText(provider) {
  const providerMap = {
    VNPAY: 'VNPay',
    MOMO: 'MoMo',
    ZALOPAY: 'ZaloPay',
    STRIPE: 'Stripe',
    PAYPAL: 'PayPal',
    COD: 'Thanh toán khi nhận hàng',
    BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  };
  return providerMap[provider] || provider;
}

module.exports = {
  generateInvoicePDF,
};

