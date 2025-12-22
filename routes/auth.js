// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

function signToken(user) {
  const payload = { id: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function createRefreshToken(userId) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  try {
    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  } catch (error) {
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      console.log('⚠️  RefreshToken table does not exist. Skipping refresh token storage.');
      // Still return token even if we can't store it
    } else {
      throw error;
    }
  }

  return token;
}

// Helper function to sanitize avatarUrl (truncate if too long)
function sanitizeAvatarUrl(url) {
  if (!url) return null;
  // Truncate to 500 characters max (TEXT can hold 65KB, but 500 is safe for URLs)
  if (url.length > 500) {
    console.warn(`⚠️  Avatar URL truncated from ${url.length} to 500 characters`);
    return url.substring(0, 500);
  }
  return url;
}

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  const { email, password, name, referralCode } = req.body || {};
  if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });

  const normalizedEmail = email.trim().toLowerCase();

  let exists = null;
  try {
    exists = await prisma.user.findUnique({ 
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });
  } catch (dbError) {
    if (dbError.code === 'P2022' || dbError.message?.includes('does not exist')) {
      console.log('⚠️  User schema mismatch. Field "emailVerified" may not exist in database.');
      exists = await prisma.user.findUnique({ 
        where: { email: normalizedEmail },
        select: { id: true, email: true },
      });
    } else {
      throw dbError;
    }
  }
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  // Handle referral code
  let referredById = null;
  if (referralCode) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: referralCode.toUpperCase() },
      select: { id: true, email: true },
    });
    if (referrer && referrer.email !== normalizedEmail) {
      referredById = referrer.id;
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  // Generate email verification token
  const verificationToken = jwt.sign({ email: normalizedEmail }, process.env.JWT_SECRET, { expiresIn: '24h' });
  const verificationTokenExpiry = new Date();
  verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);

  // Generate referral code for new user
  const crypto = require('crypto');
  const userReferralCode = `REF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  // 🎨 Tạo avatar ngẫu nhiên cho người dùng mới
  // Lưu ý: Avatar sẽ được tạo lại sau khi user được tạo với ID thật
  const { createUserAvatar } = require('../lib/avatarGenerator');
  // Tạm thời dùng hash của email làm seed vì chưa có userId
  const tempSeed = normalizedEmail.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  const randomAvatar = createUserAvatar(name, normalizedEmail, tempSeed);

  const user = await prisma.user.create({
    data: { 
      email: normalizedEmail, 
      passwordHash, 
      name, 
      role: 'USER',
      avatarUrl: randomAvatar, // 🎨 Tạm thời dùng avatar với temp seed
      verificationToken,
      verificationTokenExpiry,
      referralCode: userReferralCode,
      referredById,
    },
    select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true },
  });

  // 🎨 Cập nhật avatar với userId thật để đảm bảo avatar cố định
  const finalAvatar = createUserAvatar(user.name, user.email, user.id);
  if (finalAvatar !== randomAvatar) {
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: finalAvatar },
    });
    user.avatarUrl = finalAvatar;
  }

  // Award loyalty points to referrer if applicable
  if (referredById) {
    try {
      const referralPoints = 1000; // Points for successful referral
      const referrerLoyalty = await prisma.loyalty.findUnique({
        where: { userId: referredById },
      });

      if (referrerLoyalty) {
        await prisma.loyalty.update({
          where: { userId: referredById },
          data: { points: { increment: referralPoints } },
        });
      } else {
        await prisma.loyalty.create({
          data: {
            userId: referredById,
            points: referralPoints,
          },
        });
      }

      // Award welcome bonus to new user
      await prisma.loyalty.create({
        data: {
          userId: user.id,
          points: 500, // Welcome bonus
        },
      });
    } catch (loyaltyError) {
      console.error('Error awarding referral points:', loyaltyError);
      // Don't fail registration if loyalty points fail
    }
  }

  console.log('✅ User registered successfully:', { id: user.id, email: user.email, name: user.name });
  
  // Gửi email xác thực
  const { sendVerificationEmail } = require('../lib/email');
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  sendVerificationEmail(user, `${frontendUrl}/verify?token=${verificationToken}&email=${encodeURIComponent(normalizedEmail)}`).catch(err => {
    console.error('❌ Failed to send verification email:', err);
  });
  
  // Gửi email chào mừng (không block response nếu email fail)
  const { sendWelcomeEmail } = require('../lib/email');
  sendWelcomeEmail(user).catch(err => {
    console.error('❌ Failed to send welcome email:', err);
  });

  const token = signToken(user);
  const refreshToken = await createRefreshToken(user.id);
  return res.status(201).json({ user, token, refreshToken, requiresVerification: true });
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {

    let { email, password } = req.body || {};
    
    // Normalize input: trim và lowercase email
    email = email ? email.trim().toLowerCase() : '';
    password = password ? password.trim() : '';
    
    console.log('🔍 Login attempt:', { 
      email, 
      passwordLength: password.length,
      emailOriginal: req.body?.email,
      passwordOriginalLength: req.body?.password?.length || 0
    });
    
    if (!email || !password) {
      console.log('❌ Missing fields:', { hasEmail: !!email, hasPassword: !!password });
      return res.status(400).json({ message: 'Missing fields' });
    }


    // Use select to avoid fields that might not exist in DB
    let user = null;
    try {
      user = await prisma.user.findUnique({ 
        where: { email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          name: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          twoFactorEnabled: true,
          twoFactorSecret: true,
          settings: true,
        }
      });
    } catch (dbError) {
      if (dbError.code === 'P2022' || dbError.message?.includes('does not exist')) {
        console.log('⚠️  User schema mismatch. Some fields may not exist in database.');
        // Try with minimal fields first
        try {
        user = await prisma.user.findUnique({ 
          where: { email },
          select: {
            id: true,
            email: true,
            passwordHash: true,
            name: true,
            role: true,
            avatarUrl: true,
            createdAt: true,
          }
        });
          // Set defaults for missing fields
          if (user) {
            user.twoFactorEnabled = false;
            user.twoFactorSecret = null;
            user.settings = null;
          }
        } catch (retryError) {
          throw dbError; // Throw original error
        }
      } else {
        throw dbError;
      }
    }
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User found:', { id: user.id, email: user.email, role: user.role });
    console.log('🔐 Comparing password...', { 
      passwordLength: password.length,
      hashLength: user.passwordHash.length 
    });
    
    const ok = await bcrypt.compare(password, user.passwordHash);
    console.log('🔐 Password comparison result:', ok);
    
    if (!ok) {
      console.log('❌ Password mismatch for:', email);
      console.log('   Tried password length:', password.length);
      console.log('   Password first 3 chars:', password.substring(0, 3));
      console.log('   Password last 3 chars:', password.substring(password.length - 3));
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if 2FA is enabled (safely handle missing fields)
    const twoFactorEnabled = user.twoFactorEnabled === true;
    if (twoFactorEnabled && user.twoFactorSecret) {
      const { twoFactorToken } = req.body;
      
      if (!twoFactorToken) {
        // Return temporary token for 2FA verification
        const tempToken = jwt.sign(
          { id: user.id, email: user.email, twoFactorPending: true },
          process.env.JWT_SECRET,
          { expiresIn: '5m' } // Short-lived token for 2FA verification
        );
        
        return res.json({
          requires2FA: true,
          tempToken,
          message: '2FA verification required',
        });
      }

      // Verify 2FA token
      try {
      const { verifyToken } = require('../lib/2fa');
      const isValid = verifyToken(user.twoFactorSecret, twoFactorToken);
      
      if (!isValid) {
        // Check backup codes
          const settings = typeof user.settings === 'string' ? JSON.parse(user.settings) : (user.settings || {});
          const backupCodes = settings.backupCodes || [];
        const tokenHash = require('crypto').createHash('sha256').update(twoFactorToken).digest('hex');
        const codeIndex = backupCodes.indexOf(tokenHash);
        
        if (codeIndex === -1) {
          return res.status(401).json({ message: 'Invalid 2FA token' });
        }
        
        // Remove used backup code
        backupCodes.splice(codeIndex, 1);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            settings: {
                ...settings,
              backupCodes,
            },
          },
        });
        }
      } catch (twoFactorError) {
        console.error('❌ 2FA verification error:', twoFactorError);
        return res.status(401).json({ message: '2FA verification failed' });
      }
    }

    const { passwordHash, ...safe } = user;
    console.log('✅ User logged in successfully:', { id: safe.id, email: safe.email, name: safe.name });
    const token = signToken(user);
    const refreshToken = await createRefreshToken(user.id);
    
    // Send login notification email
    try {
      const { sendLoginNotificationEmail } = require('../lib/email');
      sendLoginNotificationEmail(safe).catch(err => {
        console.error('❌ Failed to send login notification email:', err);
      });
    } catch (emailError) {
      console.error('❌ Error sending login notification email:', emailError);
    }
    
    res.json({ user: safe, token, refreshToken });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Check if token exists in database
    let tokenRecord = null;
    try {
      tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });
    } catch (error) {
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        console.log('⚠️  RefreshToken table does not exist. Verifying token via JWT only.');
        // If table doesn't exist, verify token via JWT and get user from payload
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, email: true, role: true, name: true, avatarUrl: true },
        });
        if (!user) {
          return res.status(401).json({ message: 'Invalid refresh token' });
        }
        const newToken = signToken(user);
        return res.json({ token: newToken });
      } else {
        throw error;
      }
    }

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    // Generate new access token
    const newToken = signToken(tokenRecord.user);

    res.json({ token: newToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// POST /api/auth/logout - Logout (invalidate refresh token)
router.post('/logout', authRequired, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      try {
        await prisma.refreshToken.deleteMany({
          where: { token: refreshToken },
        });
      } catch (error) {
        if (error.code === 'P2021' || error.message?.includes('does not exist')) {
          console.log('⚠️  RefreshToken table does not exist. Skipping token deletion.');
          // Table doesn't exist, so nothing to delete - continue normally
        } else {
          throw error;
        }
      }
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ message: 'Error logging out' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('📧 Forgot password request for:', email);
    
    if (!email) {
      console.log('❌ No email provided');
      return res.status(400).json({ message: 'Email required' });
    }

    // Find user - use explicit select to avoid emailVerified field
    let user = null;
    try {
      user = await prisma.user.findUnique({ 
        where: { email },
        select: { id: true, email: true, name: true, role: true, avatarUrl: true, passwordHash: true }
      });
    } catch (dbError) {
      if (dbError.code === 'P2022' || dbError.message?.includes('emailVerified')) {
        console.log('⚠️  User schema mismatch. Field "emailVerified" may not exist in database.');
        user = await prisma.user.findUnique({ 
          where: { email },
          select: { id: true, email: true, name: true, role: true, avatarUrl: true, passwordHash: true }
        });
      } else {
        throw dbError;
      }
    }
    if (!user) {
      console.log('⚠️  User not found, but sending success message (security)');
      // Don't reveal if user exists
      return res.json({ message: 'If email exists, password reset link has been sent' });
    }

    console.log('✅ User found:', user.name, '(ID:', user.id + ')');

    // Generate JWT token với expiry 5 phút (match với email template)
    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '5m' });
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setMinutes(resetTokenExpiry.getMinutes() + 5); // 5 phút thay vì 1 giờ

    console.log('🔑 Generated reset token (length:', resetToken.length + ')');
    console.log('⏰ Token expires at:', resetTokenExpiry.toLocaleString('vi-VN'));
    console.log('📋 Token preview:', resetToken.substring(0, 30) + '...');

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });
      console.log('💾 Token saved to database');
    } catch (updateError) {
      // Handle schema mismatch error
      if (updateError.code === 'P2022' && updateError.meta?.column?.includes('referredById')) {
        console.warn('⚠️ Schema mismatch detected. Attempting to update without referral fields...');
        // Try update without referral fields - this shouldn't be needed but as fallback
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            resetToken, 
            resetTokenExpiry,
            // Explicitly exclude referral fields if they don't exist
          },
        });
        console.log('💾 Token saved to database (fallback method)');
      } else {
        throw updateError;
      }
    }

    const { sendPasswordResetEmail } = require('../lib/email');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    console.log('📬 Sending reset email...');
    console.log('🔗 Reset URL:', resetUrl.substring(0, 80) + '...');
    
    // Truyền token trực tiếp, không phải URL
    await sendPasswordResetEmail(user, resetToken);

    console.log('✅ Password reset email sent successfully');

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('💥 Error sending password reset:', error);
    res.status(500).json({ message: 'Error sending password reset email' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    let { token, password } = req.body;
    
    // Clean token (remove whitespace, newlines, etc.)
    if (token) {
      token = token.trim();
    }
    
    console.log('🔍 Reset password attempt');
    console.log('Token received:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('Token length:', token ? token.length : 0);
    console.log('Password provided:', !!password);
    
    // Validate input
    if (!token || !password) {
      console.log('❌ Missing token or password');
      return res.status(400).json({ 
        success: false, 
        message: 'Token and password required' 
      });
    }

    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Verify JWT token first
    let payload;
    try {
      console.log('🔐 Verifying JWT token...');
      payload = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ JWT verified successfully. User ID:', payload.userId);
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError.name, '-', jwtError.message);
      
      // Try to decode to see if it's just expired
      try {
        const decoded = jwt.decode(token);
        if (decoded) {
          console.log('   Token was valid but expired. User ID:', decoded.userId);
          console.log('   Issued at:', new Date(decoded.iat * 1000));
          console.log('   Expired at:', new Date(decoded.exp * 1000));
        }
      } catch (e) {
        console.log('   Token is malformed, cannot decode');
      }
      
      return res.status(400).json({ 
        success: false, 
        message: jwtError.name === 'TokenExpiredError' 
          ? 'Reset link has expired (5 minutes). Please request a new one.'
          : 'Invalid reset link. Please request a new one.' 
      });
    }

    // Find user and verify resetToken in database
    console.log('🔍 Looking up user in database...');
    const user = await prisma.user.findUnique({ 
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        resetToken: true,
        resetTokenExpiry: true,
      }
    });

    if (!user) {
      console.log('❌ User not found with ID:', payload.userId);
      return res.status(400).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('✅ User found:', user.email);

    // Check if token matches and is not expired
    if (!user.resetToken) {
      console.log('❌ No reset token in database (already used?)');
      return res.status(400).json({ 
        success: false, 
        message: 'Reset link has already been used. Please request a new one.' 
      });
    }

    if (user.resetToken !== token) {
      console.log('❌ Token mismatch');
      console.log('   Expected:', user.resetToken.substring(0, 20) + '...');
      console.log('   Received:', token.substring(0, 20) + '...');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reset token. Please request a new one.' 
      });
    }

    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      console.log('❌ Token expired in database');
      console.log('   Expiry:', user.resetTokenExpiry);
      console.log('   Now:', new Date());
      return res.status(400).json({ 
        success: false, 
        message: 'Reset link has expired. Please request a new one.' 
      });
    }

    console.log('✅ All validations passed. Updating password...');

    // Hash new password and update user
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        passwordHash, 
        resetToken: null, 
        resetTokenExpiry: null 
      },
    });

    console.log(`✅ Password reset successful for user: ${user.email}`);

    res.json({ 
      success: true, 
      message: 'Password has been reset successfully' 
    });

  } catch (error) {
    console.error('💥 Error resetting password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error resetting password. Please try again.' 
    });
  }
});

// GET /api/auth/user - Get current authenticated user
router.get('/user', async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  
  if (!token) {
    return res.json({ authenticated: false, user: null });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        settings: true,
      },
    });

    if (!user) {
      return res.json({ authenticated: false, user: null });
    }

    return res.json({ authenticated: true, user });
  } catch (error) {
    return res.json({ authenticated: false, user: null });
  }
});

// DELETE /api/auth/user - Logout
router.delete('/user', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/callback/:provider - OAuth callback handler
router.get('/callback/:provider', async (req, res) => {
  const { provider } = req.params;
  const { code, error, state } = req.query;

  if (error) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return res.redirect(`${frontendUrl}/signin?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return res.redirect(`${frontendUrl}/signin?error=no_code`);
  }

  try {
    if (provider === 'google') {
      const tokenResponse = await fetch(process.env.OAUTH_GOOGLE_TOKEN_URL || 'https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.OAUTH_GOOGLE_REDIRECT_URI || `http://localhost:3000/api/auth/callback/google`,
          grant_type: 'authorization_code',
        }),
      });
      const tokenResponseText = await tokenResponse.text();
      if (!tokenResponse.ok) {
        console.error('Google token exchange failed:', tokenResponse.status, tokenResponseText);
        throw new Error(`Failed to exchange code for token (${tokenResponse.status})`);
      }

      let tokenData = {};
      try {
        tokenData = JSON.parse(tokenResponseText);
      } catch (parseError) {
        console.error('Unable to parse Google token response:', parseError, tokenResponseText);
        throw new Error('Invalid response from Google token endpoint');
      }
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        console.error('❌ No access token received from Google');
        throw new Error('No access token received from Google');
      }

      const userInfoUrl = process.env.OAUTH_GOOGLE_USERINFO_URL || 'https://www.googleapis.com/oauth2/v3/userinfo';
      const userInfoResponse = await fetch(userInfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text();
        console.error('❌ Google userinfo request failed:', userInfoResponse.status, errorText);
        throw new Error(`Failed to get user info from Google (${userInfoResponse.status})`);
      }

      let googleUser = {};
      try {
        googleUser = await userInfoResponse.json();
      } catch (parseError) {
        console.error('❌ Unable to parse Google userinfo response:', parseError);
        throw new Error('Invalid response from Google userinfo endpoint');
      }

      const { email, name, picture } = googleUser;

      if (!email) {
        throw new Error('No email from Google');
      }

      // Find user - handle emailVerified field mismatch
      let user = null;
      try {
        user = await prisma.user.findUnique({ 
          where: { email },
          select: { id: true, email: true, name: true, role: true, avatarUrl: true }
        });
      } catch (dbError) {
        if (dbError.code === 'P2022' || dbError.message?.includes('emailVerified')) {
          console.log('⚠️  User schema mismatch. Field "emailVerified" may not exist in database.');
          // Try with explicit select to avoid emailVerified
          user = await prisma.user.findUnique({ 
            where: { email },
            select: { id: true, email: true, name: true, role: true, avatarUrl: true }
          });
        } else {
          throw dbError;
        }
      }

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            role: 'USER',
            avatarUrl: sanitizeAvatarUrl(picture),
            passwordHash: await bcrypt.hash(Math.random().toString(36), 10),
          },
          select: { id: true, email: true, name: true, role: true, avatarUrl: true },
        });
      } else {
        // 🔥 CRITICAL: Luôn cập nhật avatarUrl từ Google nếu có và user chưa có avatar
        const updates = {};
        if ((!user.name || user.name.length < 2) && name) updates.name = name;
        // Cập nhật avatarUrl nếu user chưa có hoặc avatarUrl cũ không hợp lệ
        if (picture && (!user.avatarUrl || user.avatarUrl.length < 5)) {
          updates.avatarUrl = sanitizeAvatarUrl(picture);
        }
        if (Object.keys(updates).length) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updates,
            select: { id: true, email: true, name: true, role: true, avatarUrl: true },
          });
          console.log('✅ Updated user avatar from Google:', user.avatarUrl);
        }
      }

      const token = signToken(user);
      const refreshToken = await createRefreshToken(user.id);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = user.role === 'ADMIN' 
        ? `${frontendUrl}/admin/dashboard?token=${token}`
        : `${frontendUrl}/account?token=${token}`;
      
      res.cookie('tg_token', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect(redirectUrl);
    }

    if (provider === 'facebook') {
      const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          redirect_uri: process.env.OAUTH_FACEBOOK_REDIRECT_URI || `http://localhost:3000/api/auth/callback/facebook`,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Failed to exchange code for token (${tokenResponse.status})`);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      const userInfoResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${accessToken}`);

      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const facebookUser = await userInfoResponse.json();
      const { email, name, picture } = facebookUser;

      if (!email) {
        throw new Error('No email from Facebook');
      }

      // Find user - handle emailVerified field mismatch
      let user = null;
      try {
        user = await prisma.user.findUnique({ 
          where: { email },
          select: { id: true, email: true, name: true, role: true, avatarUrl: true }
        });
      } catch (dbError) {
        if (dbError.code === 'P2022' || dbError.message?.includes('emailVerified')) {
          console.log('⚠️  User schema mismatch. Field "emailVerified" may not exist in database.');
          user = await prisma.user.findUnique({ 
            where: { email },
            select: { id: true, email: true, name: true, role: true, avatarUrl: true }
          });
        } else {
          throw dbError;
        }
      }

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            role: 'USER',
            avatarUrl: sanitizeAvatarUrl(picture?.data?.url),
            passwordHash: await bcrypt.hash(Math.random().toString(36), 10),
          },
          select: { id: true, email: true, name: true, role: true, avatarUrl: true },
        });
      } else {
        const updates = {};
        if ((!user.name || user.name.length < 2) && name) updates.name = name;
        if (!user.avatarUrl && picture?.data?.url) updates.avatarUrl = sanitizeAvatarUrl(picture.data.url);
        if (Object.keys(updates).length) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updates,
            select: { id: true, email: true, name: true, role: true, avatarUrl: true },
          });
        }
      }

      const token = signToken(user);
      const refreshToken = await createRefreshToken(user.id);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = user.role === 'ADMIN' 
        ? `${frontendUrl}/admin/dashboard?token=${token}`
        : `${frontendUrl}/account?token=${token}`;
      
      res.cookie('tg_token', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect(redirectUrl);
    }

    return res.status(400).json({ message: 'Unsupported OAuth provider' });
  } catch (error) {
    console.error('OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return res.redirect(`${frontendUrl}/signin?error=${encodeURIComponent(error.message || 'oauth_failed')}`);
  }
});

// GET /api/auth/authorize/:provider - Start OAuth flow
router.get('/authorize/:provider', (req, res) => {
  const { provider } = req.params;
  try {
    if (provider === 'google') {
      const authUrl = process.env.OAUTH_GOOGLE_AUTH_URL || 'https://accounts.google.com/o/oauth2/v2/auth';
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const scope = process.env.OAUTH_GOOGLE_SCOPE || 'openid email profile';
      const redirectUri = process.env.OAUTH_GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google';
      if (!clientId) {
        return res.status(500).json({ message: 'Google client id not configured' });
      }
      const state = Math.random().toString(36).slice(2);
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        scope,
        state,
        access_type: 'offline',
        prompt: 'consent'
      });
      const url = `${authUrl}?${params.toString()}`;
      return res.redirect(url);
    }

    if (provider === 'facebook') {
      const authUrl = 'https://www.facebook.com/v18.0/dialog/oauth';
      const appId = process.env.FACEBOOK_APP_ID;
      const redirectUri = process.env.OAUTH_FACEBOOK_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/facebook';
      if (!appId) {
        return res.status(500).json({ message: 'Facebook app id not configured' });
      }
      const state = Math.random().toString(36).slice(2);
      const params = new URLSearchParams({
        client_id: appId,
        redirect_uri: redirectUri,
        scope: 'email,public_profile',
        state,
        response_type: 'code',
      });
      const url = `${authUrl}?${params.toString()}`;
      return res.redirect(url);
    }

    return res.status(400).json({ message: 'Unsupported OAuth provider' });
  } catch (e) {
    console.error('Authorize error:', e);
    return res.status(500).json({ message: 'Authorize failed' });
  }
});

// POST /api/auth/verify - Verify email
router.post('/verify', async (req, res) => {
  try {
    const { token, email } = req.body;
    if (!token || !email) {
      return res.status(400).json({ message: 'Token and email required' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.email !== email.toLowerCase()) {
      return res.status(400).json({ message: 'Invalid token for this email' });
    }

    // Use select to avoid fields that might not exist in DB
    let user = null;
    try {
      user = await prisma.user.findUnique({ 
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          verificationToken: true,
          verificationTokenExpiry: true,
        }
      });
    } catch (dbError) {
      if (dbError.code === 'P2022' || dbError.message?.includes('does not exist')) {
        console.log('⚠️  User schema mismatch. Field "emailVerified" may not exist in database.');
        user = await prisma.user.findUnique({ 
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            verificationToken: true,
            verificationTokenExpiry: true,
          }
        });
      } else {
        throw dbError;
      }
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verificationToken !== token || !user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user - skip emailVerified if field doesn't exist
    const updateData = {
      verificationToken: null,
      verificationTokenExpiry: null,
    };

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

// POST /api/auth/resend-verification - Resend verification email
router.post('/resend-verification', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    // Use select to avoid fields that might not exist in DB
    let user = null;
    try {
      user = await prisma.user.findUnique({ 
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          verificationToken: true,
          verificationTokenExpiry: true,
        }
      });
    } catch (dbError) {
      if (dbError.code === 'P2022' || dbError.message?.includes('does not exist')) {
        console.log('⚠️  User schema mismatch. Field "emailVerified" may not exist in database.');
        user = await prisma.user.findUnique({ 
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            verificationToken: true,
            verificationTokenExpiry: true,
          }
        });
      } else {
        throw dbError;
      }
    }
    
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If email exists, verification email has been sent' });
    }

    // Skip emailVerified check if field doesn't exist in DB
    // Note: emailVerified field may not exist in database
    // if (user.emailVerified) {
    //   return res.json({ message: 'Email already verified' });
    // }

    const verificationToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken, verificationTokenExpiry },
    });

    const { sendVerificationEmail } = require('../lib/email');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    await sendVerificationEmail(user, `${frontendUrl}/verify?token=${verificationToken}&email=${encodeURIComponent(user.email)}`);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ message: 'Error sending verification email' });
  }
});

module.exports = router;