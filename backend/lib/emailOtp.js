// lib/emailOtp.js - Email OTP Service "Ngon - Bổ - Rẻ"
// Hệ thống xác thực OTP qua Email với Nodemailer
const crypto = require('crypto');
const { sendEmail } = require('./email');

// ============================================================================
// CONFIGURATION
// ============================================================================
const OTP_CONFIG = {
  length: 6,                    // Độ dài mã OTP
  expiryMinutes: 10,            // Thời gian hết hạn (phút)
  maxAttempts: 5,               // Số lần thử tối đa
  cooldownMinutes: 1,           // Thời gian chờ giữa các lần gửi
  cleanupIntervalMinutes: 15,   // Dọn dẹp OTP hết hạn
};

// In-Memory Store (có thể thay bằng Redis cho production)
// Format: { email: { code, expiresAt, attempts, lastSentAt } }
const otpStore = new Map();

// ============================================================================
// OTP GENERATION & MANAGEMENT
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

/**
 * Lưu OTP vào store
 */
function storeOTP(email, code, expiryMinutes = OTP_CONFIG.expiryMinutes) {
  const normalizedEmail = email.toLowerCase().trim();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

  otpStore.set(normalizedEmail, {
    code,
    expiresAt,
    attempts: 0,
    lastSentAt: new Date(),
    createdAt: new Date(),
  });

  console.log(`📧 OTP stored for ${normalizedEmail}: ${code} (expires: ${expiresAt.toLocaleString()})`);
  return { code, expiresAt };
}

/**
 * Lấy OTP từ store
 */
function getStoredOTP(email) {
  const normalizedEmail = email.toLowerCase().trim();
  return otpStore.get(normalizedEmail);
}

/**
 * Xóa OTP khỏi store
 */
function deleteOTP(email) {
  const normalizedEmail = email.toLowerCase().trim();
  return otpStore.delete(normalizedEmail);
}

/**
 * Kiểm tra cooldown (tránh spam)
 */
function checkCooldown(email) {
  const stored = getStoredOTP(email);
  if (!stored || !stored.lastSentAt) return { allowed: true };

  const now = new Date();
  const cooldownEnd = new Date(stored.lastSentAt);
  cooldownEnd.setMinutes(cooldownEnd.getMinutes() + OTP_CONFIG.cooldownMinutes);

  if (now < cooldownEnd) {
    const remainingSeconds = Math.ceil((cooldownEnd - now) / 1000);
    return {
      allowed: false,
      remainingSeconds,
      message: `Vui lòng chờ ${remainingSeconds} giây trước khi yêu cầu mã mới`,
    };
  }

  return { allowed: true };
}

/**
 * Dọn dẹp OTP hết hạn
 */
function cleanupExpiredOTPs() {
  const now = new Date();
  let cleaned = 0;

  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(email);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired OTPs`);
  }
}

// Auto cleanup every 15 minutes
setInterval(cleanupExpiredOTPs, OTP_CONFIG.cleanupIntervalMinutes * 60 * 1000);

// ============================================================================
// EMAIL TEMPLATE
// ============================================================================

/**
 * Tạo HTML template cho email OTP
 */
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
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 30px;
          background: #ffffff;
          border-radius: 50% 50% 0 0 / 100% 100% 0 0;
        }
        .header-icon {
          font-size: 72px;
          margin-bottom: 16px;
          display: block;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .header-title {
          font-size: 28px;
          font-weight: 800;
          color: #ffffff;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        .body {
          padding: 50px 40px;
          text-align: center;
        }
        .greeting {
          font-size: 20px;
          color: #374151;
          margin-bottom: 24px;
        }
        .otp-box {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 3px dashed #3b82f6;
          border-radius: 20px;
          padding: 32px;
          margin: 32px 0;
        }
        .otp-label {
          font-size: 14px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 16px;
        }
        .otp-code {
          font-size: 48px;
          font-weight: 900;
          letter-spacing: 12px;
          color: #1e40af;
          font-family: 'Courier New', monospace;
          text-shadow: 2px 2px 4px rgba(30, 64, 175, 0.2);
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
        .warning-title {
          font-weight: 700;
          color: #991b1b;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .warning-text {
          color: #7f1d1d;
          font-size: 14px;
          line-height: 1.6;
        }
        .footer {
          background: #f9fafb;
          padding: 32px 40px;
          text-align: center;
          border-top: 2px solid #e5e7eb;
        }
        .footer-brand {
          font-size: 18px;
          font-weight: 800;
          color: #374151;
          margin-bottom: 8px;
        }
        .footer-text {
          font-size: 12px;
          color: #9ca3af;
        }
        @media (max-width: 500px) {
          body { padding: 20px 10px; }
          .header, .body, .footer { padding-left: 24px; padding-right: 24px; }
          .otp-code { font-size: 36px; letter-spacing: 8px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="header-icon">🔐</span>
          <h1 class="header-title">Mã xác thực OTP</h1>
        </div>
        
        <div class="body">
          <p class="greeting">
            Bạn đang yêu cầu ${purpose} tại <strong>${brandName}</strong>
          </p>
          
          <div class="otp-box">
            <div class="otp-label">Mã xác thực của bạn</div>
            <div class="otp-code">${code}</div>
          </div>
          
          <div class="expiry-badge">
            <span>⏰</span>
            <span>Mã có hiệu lực trong ${expiryMinutes} phút</span>
          </div>
          
          <div class="warning-box">
            <div class="warning-title">
              <span>🛡️</span>
              <span>Lưu ý bảo mật</span>
            </div>
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
// MAIN FUNCTIONS
// ============================================================================

/**
 * Gửi OTP qua Email
 * @param {string} email - Email nhận OTP
 * @param {object} options - Tùy chọn
 * @returns {Promise<object>} Kết quả gửi
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
    const cooldown = checkCooldown(normalizedEmail);
    if (!cooldown.allowed) {
      return {
        success: false,
        error: cooldown.message,
        code: 'COOLDOWN',
        remainingSeconds: cooldown.remainingSeconds,
      };
    }

    // Generate OTP
    const code = options.secure ? generateSecureOTPCode() : generateOTPCode();
    const expiryMinutes = options.expiryMinutes || OTP_CONFIG.expiryMinutes;
    
    // Store OTP
    const { expiresAt } = storeOTP(normalizedEmail, code, expiryMinutes);

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
      deleteOTP(normalizedEmail);
      return {
        success: false,
        error: 'Không thể gửi email. Vui lòng thử lại sau.',
        code: 'EMAIL_FAILED',
      };
    }

    console.log(`✅ OTP sent to ${normalizedEmail}`);

    return {
      success: true,
      message: `Mã OTP đã được gửi đến ${normalizedEmail}`,
      expiresAt,
      expiryMinutes,
      // Không trả về code trong production!
      ...(process.env.NODE_ENV !== 'production' && { code }), // Dev only
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
 * Xác thực OTP
 * @param {string} email - Email đã nhận OTP
 * @param {string} code - Mã OTP người dùng nhập
 * @returns {object} Kết quả xác thực
 */
function verifyEmailOTP(email, code) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.toString().trim();

    // Get stored OTP
    const stored = getStoredOTP(normalizedEmail);

    if (!stored) {
      return {
        success: false,
        error: 'Không tìm thấy mã OTP. Vui lòng yêu cầu mã mới.',
        code: 'OTP_NOT_FOUND',
      };
    }

    // Check expiry
    const now = new Date();
    if (now > stored.expiresAt) {
      deleteOTP(normalizedEmail);
      return {
        success: false,
        error: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.',
        code: 'OTP_EXPIRED',
      };
    }

    // Check attempts
    if (stored.attempts >= OTP_CONFIG.maxAttempts) {
      deleteOTP(normalizedEmail);
      return {
        success: false,
        error: 'Đã vượt quá số lần thử. Vui lòng yêu cầu mã mới.',
        code: 'MAX_ATTEMPTS',
      };
    }

    // Verify code
    if (stored.code !== normalizedCode) {
      // Increment attempts
      stored.attempts++;
      otpStore.set(normalizedEmail, stored);

      const remainingAttempts = OTP_CONFIG.maxAttempts - stored.attempts;
      return {
        success: false,
        error: `Mã OTP không đúng. Còn ${remainingAttempts} lần thử.`,
        code: 'INVALID_OTP',
        remainingAttempts,
      };
    }

    // Success - delete OTP
    deleteOTP(normalizedEmail);

    console.log(`✅ OTP verified for ${normalizedEmail}`);

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
 * Hủy OTP (khi user cancel)
 */
function cancelEmailOTP(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const deleted = deleteOTP(normalizedEmail);
  return {
    success: deleted,
    message: deleted ? 'Đã hủy mã OTP' : 'Không tìm thấy mã OTP',
  };
}

/**
 * Kiểm tra trạng thái OTP
 */
function checkOTPStatus(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const stored = getStoredOTP(normalizedEmail);

  if (!stored) {
    return { exists: false };
  }

  const now = new Date();
  const isExpired = now > stored.expiresAt;
  const remainingSeconds = isExpired ? 0 : Math.ceil((stored.expiresAt - now) / 1000);

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
  
  // Config (for customization)
  OTP_CONFIG,
  
  // For testing/admin
  getStoredOTP,
  deleteOTP,
  cleanupExpiredOTPs,
};

