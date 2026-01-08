// routes/emailOtp.js - Email OTP API Routes
const express = require('express');
const router = express.Router();
const { 
  sendEmailOTP, 
  verifyEmailOTP, 
  cancelEmailOTP,
  checkOTPStatus 
} = require('../lib/emailOtp');
const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Rate Limiting cho OTP requests
 */
const otpRateLimiter = new Map();
const RATE_LIMIT = {
  maxRequests: 5,      // Max requests
  windowMs: 15 * 60 * 1000, // 15 minutes
};

function rateLimitMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const key = `${ip}`;
  const now = Date.now();

  if (!otpRateLimiter.has(key)) {
    otpRateLimiter.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return next();
  }

  const record = otpRateLimiter.get(key);

  if (now > record.resetAt) {
    otpRateLimiter.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return next();
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    const remainingMs = record.resetAt - now;
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return res.status(429).json({
      success: false,
      error: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${remainingMinutes} phút.`,
      code: 'RATE_LIMITED',
      retryAfter: remainingMs,
    });
  }

  record.count++;
  next();
}

// Clean up rate limiter periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of otpRateLimiter.entries()) {
    if (now > record.resetAt) {
      otpRateLimiter.delete(key);
    }
  }
}, 60000); // Every minute

// ============================================================================
// ROUTES
// ============================================================================

/**
 * @route POST /api/otp/send
 * @desc Gửi mã OTP đến email
 * @body { email: string, purpose?: string }
 */
router.post('/send', rateLimitMiddleware, async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email là bắt buộc',
        code: 'MISSING_EMAIL',
      });
    }

    const result = await sendEmailOTP(email, {
      purpose: purpose || 'xác thực email',
      brandName: 'TravelGo',
      secure: true,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Don't expose OTP code in production response
    const response = {
      success: true,
      message: result.message,
      expiresAt: result.expiresAt,
      expiryMinutes: result.expiryMinutes,
    };

    // Only include code in development for testing
    if (process.env.NODE_ENV !== 'production' && result.code) {
      response.code = result.code;
    }

    res.json(response);

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * @route POST /api/otp/verify
 * @desc Xác thực mã OTP
 * @body { email: string, code: string }
 */
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email và mã OTP là bắt buộc',
        code: 'MISSING_FIELDS',
      });
    }

    const result = verifyEmailOTP(email, code);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Optionally: Update user's emailVerified status if user exists
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (user && !user.emailVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        });
        result.userUpdated = true;
      }
    } catch (dbError) {
      console.error('DB update error:', dbError);
      // Don't fail the verification if DB update fails
    }

    res.json(result);

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * @route POST /api/otp/verify-and-login
 * @desc Xác thực OTP và đăng nhập (passwordless login)
 * @body { email: string, code: string }
 */
router.post('/verify-and-login', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email và mã OTP là bắt buộc',
        code: 'MISSING_FIELDS',
      });
    }

    // Verify OTP
    const otpResult = verifyEmailOTP(email, code);
    if (!otpResult.success) {
      return res.status(400).json(otpResult);
    }

    // Find or create user
    const normalizedEmail = email.toLowerCase().trim();
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Create new user with OTP login
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
          passwordHash: '', // No password for OTP-only users
          emailVerified: true,
        },
      });
    } else {
      // Update emailVerified
      if (!user.emailVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-refresh-secret',
      { expiresIn: '30d' }
    );

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
      },
    });

  } catch (error) {
    console.error('Verify and login error:', error);
    res.status(500).json({
      success: false,
      error: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * @route POST /api/otp/cancel
 * @desc Hủy mã OTP đang chờ
 * @body { email: string }
 */
router.post('/cancel', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email là bắt buộc',
        code: 'MISSING_EMAIL',
      });
    }

    const result = cancelEmailOTP(email);
    res.json(result);

  } catch (error) {
    console.error('Cancel OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Đã xảy ra lỗi.',
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * @route GET /api/otp/status
 * @desc Kiểm tra trạng thái OTP
 * @query { email: string }
 */
router.get('/status', (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email là bắt buộc',
        code: 'MISSING_EMAIL',
      });
    }

    const status = checkOTPStatus(email);
    res.json({
      success: true,
      ...status,
    });

  } catch (error) {
    console.error('Check OTP status error:', error);
    res.status(500).json({
      success: false,
      error: 'Đã xảy ra lỗi.',
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * @route POST /api/otp/resend
 * @desc Gửi lại mã OTP
 * @body { email: string, purpose?: string }
 */
router.post('/resend', rateLimitMiddleware, async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email là bắt buộc',
        code: 'MISSING_EMAIL',
      });
    }

    // Cancel existing OTP first
    cancelEmailOTP(email);

    // Send new OTP
    const result = await sendEmailOTP(email, {
      purpose: purpose || 'xác thực email',
      brandName: 'TravelGo',
      secure: true,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    const response = {
      success: true,
      message: 'Mã OTP mới đã được gửi',
      expiresAt: result.expiresAt,
      expiryMinutes: result.expiryMinutes,
    };

    if (process.env.NODE_ENV !== 'production' && result.code) {
      response.code = result.code;
    }

    res.json(response);

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
      code: 'INTERNAL_ERROR',
    });
  }
});

module.exports = router;

