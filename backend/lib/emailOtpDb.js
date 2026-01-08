// lib/emailOtpDb.js - Email OTP Service với Database (Prisma)
// Version sử dụng Database thay vì In-Memory Store
// Phù hợp cho production với multiple server instances
const crypto = require('crypto');
const prisma = require('./prisma');
const { sendEmail } = require('./email');

// ============================================================================
// CONFIGURATION
// ============================================================================
const OTP_CONFIG = {
  length: 6,                    // Độ dài mã OTP
  expiryMinutes: 10,            // Thời gian hết hạn (phút)
  maxAttempts: 5,               // Số lần thử tối đa
  cooldownMinutes: 1,           // Thời gian chờ giữa các lần gửi
};

// ============================================================================
// OTP GENERATION
// ============================================================================

/**
 * Tạo mã OTP ngẫu nhiên 6 chữ số
 */
function generateOTPCode(length = OTP_CONFIG.length) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

/**
 * Tạo mã OTP bảo mật hơn với crypto
 */
function generateSecureOTPCode(length = OTP_CONFIG.length) {
  const bytes = crypto.randomBytes(Math.ceil(length / 2));
  const number = parseInt(bytes.toString('hex'), 16);
  return (number % Math.pow(10, length)).toString().padStart(length, '0');
}

// ============================================================================
// EMAIL TEMPLATE
// ============================================================================

function createOTPEmailTemplate(code, expiryMinutes, options = {}) {
  const { brandName = 'TravelGo', purpose = 'xác thực email' } = options;
  
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mã xác thực OTP</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 40px 20px;
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          padding: 50px 40px;
          text-align: center;
        }
        .header-icon { font-size: 72px; margin-bottom: 16px; display: block; }
        .header-title { font-size: 28px; font-weight: 800; color: #ffffff; }
        .body { padding: 50px 40px; text-align: center; }
        .otp-box {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 3px dashed #3b82f6;
          border-radius: 20px;
          padding: 32px;
          margin: 32px 0;
        }
        .otp-label { font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; }
        .otp-code {
          font-size: 48px;
          font-weight: 900;
          letter-spacing: 12px;
          color: #1e40af;
          font-family: 'Courier New', monospace;
        }
        .expiry-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
          padding: 12px 24px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 14px;
          margin-top: 24px;
          border: 2px solid #f59e0b;
        }
        .warning-box {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border-left: 4px solid #ef4444;
          border-radius: 12px;
          padding: 20px;
          margin: 32px 0;
          text-align: left;
        }
        .warning-title { font-weight: 700; color: #991b1b; margin-bottom: 8px; }
        .warning-text { color: #7f1d1d; font-size: 14px; line-height: 1.6; }
        .footer {
          background: #f9fafb;
          padding: 32px 40px;
          text-align: center;
          border-top: 2px solid #e5e7eb;
        }
        .footer-brand { font-size: 18px; font-weight: 800; color: #374151; margin-bottom: 8px; }
        .footer-text { font-size: 12px; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="header-icon">🔐</span>
          <h1 class="header-title">Mã xác thực OTP</h1>
        </div>
        <div class="body">
          <p>Bạn đang yêu cầu ${purpose} tại <strong>${brandName}</strong></p>
          <div class="otp-box">
            <div class="otp-label">Mã xác thực của bạn</div>
            <div class="otp-code">${code}</div>
          </div>
          <div class="expiry-badge">
            <span>⏰</span>
            <span>Mã có hiệu lực trong ${expiryMinutes} phút</span>
          </div>
          <div class="warning-box">
            <div class="warning-title">🛡️ Lưu ý bảo mật</div>
            <p class="warning-text">
              • Không chia sẻ mã này với bất kỳ ai<br>
              • ${brandName} không bao giờ yêu cầu mã OTP qua điện thoại<br>
              • Nếu bạn không yêu cầu mã này, hãy bỏ qua email
            </p>
          </div>
        </div>
        <div class="footer">
          <div class="footer-brand">🌍 ${brandName}</div>
          <p class="footer-text">
            Email tự động - Vui lòng không trả lời<br>
            © ${new Date().getFullYear()} ${brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================================================
// DATABASE FUNCTIONS
// ============================================================================

/**
 * Lấy OTP từ database
 */
async function getStoredOTP(email) {
  const normalizedEmail = email.toLowerCase().trim();
  
  return await prisma.emailOTP.findFirst({
    where: { 
      email: normalizedEmail,
      verified: false,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Lưu OTP vào database
 */
async function storeOTP(email, code, expiresAt, purpose) {
  const normalizedEmail = email.toLowerCase().trim();
  
  // Delete old OTPs for this email
  await prisma.emailOTP.deleteMany({
    where: { email: normalizedEmail },
  });
  
  // Create new OTP
  return await prisma.emailOTP.create({
    data: {
      email: normalizedEmail,
      code,
      expiresAt,
      purpose,
      attempts: 0,
      verified: false,
    },
  });
}

/**
 * Cập nhật số lần thử
 */
async function incrementAttempts(id) {
  return await prisma.emailOTP.update({
    where: { id },
    data: { attempts: { increment: 1 } },
  });
}

/**
 * Đánh dấu đã xác thực
 */
async function markVerified(id) {
  return await prisma.emailOTP.update({
    where: { id },
    data: { verified: true },
  });
}

/**
 * Xóa OTP
 */
async function deleteOTP(email) {
  const normalizedEmail = email.toLowerCase().trim();
  return await prisma.emailOTP.deleteMany({
    where: { email: normalizedEmail },
  });
}

/**
 * Dọn dẹp OTP hết hạn
 */
async function cleanupExpiredOTPs() {
  const result = await prisma.emailOTP.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { verified: true },
      ],
    },
  });
  
  if (result.count > 0) {
    console.log(`🧹 Cleaned up ${result.count} expired/verified OTPs`);
  }
  
  return result.count;
}

// Auto cleanup every 15 minutes
setInterval(cleanupExpiredOTPs, 15 * 60 * 1000);

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Gửi OTP qua Email (Database version)
 */
async function sendEmailOTP(email, options = {}) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return {
        success: false,
        error: 'Email không hợp lệ',
        code: 'INVALID_EMAIL',
      };
    }

    // Check cooldown
    const existing = await getStoredOTP(normalizedEmail);
    if (existing) {
      const timeSinceCreated = (new Date() - new Date(existing.createdAt)) / 1000;
      if (timeSinceCreated < OTP_CONFIG.cooldownMinutes * 60) {
        const remainingSeconds = Math.ceil(OTP_CONFIG.cooldownMinutes * 60 - timeSinceCreated);
        return {
          success: false,
          error: `Vui lòng chờ ${remainingSeconds} giây trước khi yêu cầu mã mới`,
          code: 'COOLDOWN',
          remainingSeconds,
        };
      }
    }

    // Generate OTP
    const code = options.secure ? generateSecureOTPCode() : generateOTPCode();
    const expiryMinutes = options.expiryMinutes || OTP_CONFIG.expiryMinutes;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);
    
    // Store OTP
    await storeOTP(normalizedEmail, code, expiresAt, options.purpose);

    // Create email content
    const html = createOTPEmailTemplate(code, expiryMinutes, {
      brandName: options.brandName || 'TravelGo',
      purpose: options.purpose || 'xác thực email',
    });

    // Send email
    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: `🔐 Mã xác thực OTP - ${options.brandName || 'TravelGo'}`,
      html,
    });

    if (!emailResult.success) {
      await deleteOTP(normalizedEmail);
      return {
        success: false,
        error: 'Không thể gửi email. Vui lòng thử lại sau.',
        code: 'EMAIL_FAILED',
      };
    }

    console.log(`✅ OTP sent to ${normalizedEmail} (DB mode)`);

    return {
      success: true,
      message: `Mã OTP đã được gửi đến ${normalizedEmail}`,
      expiresAt,
      expiryMinutes,
      ...(process.env.NODE_ENV !== 'production' && { code }),
    };

  } catch (error) {
    console.error('❌ Send OTP error:', error);
    return {
      success: false,
      error: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
      code: 'INTERNAL_ERROR',
    };
  }
}

/**
 * Xác thực OTP (Database version)
 */
async function verifyEmailOTP(email, code) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.toString().trim();

    // Get stored OTP
    const stored = await getStoredOTP(normalizedEmail);

    if (!stored) {
      return {
        success: false,
        error: 'Không tìm thấy mã OTP. Vui lòng yêu cầu mã mới.',
        code: 'OTP_NOT_FOUND',
      };
    }

    // Check expiry
    if (new Date() > new Date(stored.expiresAt)) {
      await deleteOTP(normalizedEmail);
      return {
        success: false,
        error: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.',
        code: 'OTP_EXPIRED',
      };
    }

    // Check attempts
    if (stored.attempts >= OTP_CONFIG.maxAttempts) {
      await deleteOTP(normalizedEmail);
      return {
        success: false,
        error: 'Đã vượt quá số lần thử. Vui lòng yêu cầu mã mới.',
        code: 'MAX_ATTEMPTS',
      };
    }

    // Verify code
    if (stored.code !== normalizedCode) {
      await incrementAttempts(stored.id);
      const remainingAttempts = OTP_CONFIG.maxAttempts - stored.attempts - 1;
      return {
        success: false,
        error: `Mã OTP không đúng. Còn ${remainingAttempts} lần thử.`,
        code: 'INVALID_OTP',
        remainingAttempts,
      };
    }

    // Success - mark as verified
    await markVerified(stored.id);
    
    // Delete after short delay (keep for audit)
    setTimeout(() => deleteOTP(normalizedEmail), 60000);

    console.log(`✅ OTP verified for ${normalizedEmail} (DB mode)`);

    return {
      success: true,
      message: 'Xác thực thành công!',
      email: normalizedEmail,
      verifiedAt: new Date(),
    };

  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    return {
      success: false,
      error: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
      code: 'INTERNAL_ERROR',
    };
  }
}

/**
 * Hủy OTP
 */
async function cancelEmailOTP(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const result = await deleteOTP(normalizedEmail);
  return {
    success: result.count > 0,
    message: result.count > 0 ? 'Đã hủy mã OTP' : 'Không tìm thấy mã OTP',
  };
}

/**
 * Kiểm tra trạng thái OTP
 */
async function checkOTPStatus(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const stored = await getStoredOTP(normalizedEmail);

  if (!stored) {
    return { exists: false };
  }

  const now = new Date();
  const isExpired = now > new Date(stored.expiresAt);
  const remainingSeconds = isExpired ? 0 : Math.ceil((new Date(stored.expiresAt) - now) / 1000);

  return {
    exists: true,
    isExpired,
    remainingSeconds,
    attempts: stored.attempts,
    maxAttempts: OTP_CONFIG.maxAttempts,
    remainingAttempts: OTP_CONFIG.maxAttempts - stored.attempts,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
  // Main functions
  sendEmailOTP,
  verifyEmailOTP,
  cancelEmailOTP,
  checkOTPStatus,
  
  // Utilities
  generateOTPCode,
  generateSecureOTPCode,
  cleanupExpiredOTPs,
  
  // Config
  OTP_CONFIG,
};

