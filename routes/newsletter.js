const express = require('express');
const router = express.Router();
const { sendEmail } = require('../lib/email');

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Send notification email to admin
    const adminEmail = 'phong@triennguyen.com';
    const subject = `[TravelGo] Đăng ký nhận bản tin mới - ${email}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .email { font-size: 18px; font-weight: bold; color: #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Đăng ký nhận bản tin mới</h1>
          </div>
          <div class="content">
            <p>Xin chào,</p>
            <p>Bạn có một đăng ký nhận bản tin mới từ website TravelGo:</p>
            
            <div class="info-box">
              <p><strong>Email người đăng ký:</strong></p>
              <p class="email">${email}</p>
              <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
            </div>

            <p>Người dùng này sẽ nhận được các thông tin quan trọng về:</p>
            <ul>
              <li>Ưu đãi độc quyền</li>
              <li>Điểm đến mới</li>
              <li>Tin tức du lịch</li>
              <li>Khuyến mãi đặc biệt</li>
            </ul>

            <div class="footer">
              <p>TravelGo - Nền tảng du lịch hàng đầu</p>
              <p>6/160 Tân Triều, Thanh Trì, Hà Nội</p>
              <p>Hotline: 0868156027 | Email: phong@triennguyen.com</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: adminEmail,
      subject: subject,
      html: htmlContent,
    });

    console.log(`✅ Newsletter subscription: ${email} -> Notification sent to ${adminEmail}`);

    res.json({ 
      success: true, 
      message: 'Đăng ký thành công! Cảm ơn bạn đã quan tâm.' 
    });
  } catch (error) {
    console.error('❌ Error processing newsletter subscription:', error);
    res.status(500).json({ 
      message: 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.' 
    });
  }
});

module.exports = router;

