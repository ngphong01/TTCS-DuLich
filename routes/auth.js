// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const router = express.Router();

function signToken(user) {
  const payload = { id: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, role: 'USER' },
    select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true },
  });

  console.log('✅ User registered successfully:', { id: user.id, email: user.email, name: user.name });
  const token = signToken(user);
  return res.status(201).json({ user, token });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
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

    const user = await prisma.user.findUnique({ where: { email } });
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

      const { passwordHash, ...safe } = user;
      console.log('✅ User logged in successfully:', { id: safe.id, email: safe.email, name: safe.name });
      const token = signToken(user);
      return res.json({ user: safe, token });
    } catch (error) {
      console.error('❌ Login error:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });

// Stubs
router.post('/forgot-password', (req, res) => {
  res.json({ message: 'Password reset email sent' });
});

router.post('/reset-password', (req, res) => {
  res.json({ message: 'Password has been reset' });
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
    
    // Get full user info from database
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
    // Invalid or expired token
    return res.json({ authenticated: false, user: null });
  }
});

// DELETE /api/auth/user - Logout (clear session on server side if needed)
router.delete('/user', (req, res) => {
  // For JWT tokens stored in localStorage, we don't need to do anything server-side
  // Just return success - client should clear localStorage
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/callback/:provider - OAuth callback handler
router.get('/callback/:provider', async (req, res) => {
  const { provider } = req.params;
  const { code, error, state } = req.query;

  // Handle OAuth error
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
      // Exchange code for access token
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

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text().catch(()=>'');
        console.error('Google token exchange failed:', tokenResponse.status, errText);
        throw new Error(`Failed to exchange code for token (${tokenResponse.status})`);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Get user info from Google
      const userInfoResponse = await fetch(process.env.OAUTH_GOOGLE_USERINFO_URL || 'https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const googleUser = await userInfoResponse.json();
      const { email, name, picture } = googleUser;

      if (!email) {
        throw new Error('No email from Google');
      }

      // Find or create user
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Create new user from Google
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            role: 'USER',
            avatarUrl: picture || null,
            // For OAuth users, we can set a random password hash (they'll use OAuth to login)
            passwordHash: await bcrypt.hash(Math.random().toString(36), 10),
          },
          select: { id: true, email: true, name: true, role: true, avatarUrl: true },
        });
      } else {
        // Update missing profile fields from Google
        const updates = {};
        if ((!user.name || user.name.length < 2) && name) updates.name = name;
        if (!user.avatarUrl && picture) updates.avatarUrl = picture;
        if (Object.keys(updates).length) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updates,
            select: { id: true, email: true, name: true, role: true, avatarUrl: true },
          });
        }
      }

      // Generate JWT token
      const token = signToken(user);

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = user.role === 'ADMIN' 
        ? `${frontendUrl}/admin/dashboard?token=${token}`
        : `${frontendUrl}/account?token=${token}`;
      
      // Set token in response cookie as well
      res.cookie('tg_token', token, {
        httpOnly: false, // Allow JS to read it
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.redirect(redirectUrl);
    }

    // GitHub OAuth (stub for future implementation)
    if (provider === 'github') {
      return res.status(501).json({ message: 'GitHub OAuth not implemented yet' });
    }

    return res.status(400).json({ message: 'Unsupported OAuth provider' });
  } catch (error) {
    console.error('OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return res.redirect(`${frontendUrl}/signin?error=${encodeURIComponent(error.message || 'oauth_failed')}`);
  }
});

// GET /api/auth/authorize/:provider - Start OAuth flow (builds URL on server)
router.get('/authorize/:provider', (req, res) => {
  const { provider } = req.params;
  try {
    if (provider === 'google') {
      const authUrl = process.env.OAUTH_GOOGLE_AUTH_URL || 'https://accounts.google.com/o/oauth2/v2/auth';
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const scope = process.env.OAUTH_GOOGLE_SCOPE || 'openid email profile';
      // Force correct redirect URI in dev to avoid mismatch
      const redirectUri = 'http://localhost:3000/api/auth/callback/google';
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
    return res.status(400).json({ message: 'Unsupported OAuth provider' });
  } catch (e) {
    console.error('Authorize error:', e);
    return res.status(500).json({ message: 'Authorize failed' });
  }
});

module.exports = router;