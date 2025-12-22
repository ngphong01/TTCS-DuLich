// routes/2fa.js - Two-Factor Authentication routes
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');
const { generateSecret, generateQRCode, verifyToken, generateBackupCodes } = require('../lib/2fa');

// POST /api/2fa/setup - Setup 2FA for user
router.post('/setup', authRequired, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { email: true, twoFactorEnabled: true, twoFactorSecret: true },
    });

    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled' });
    }

    // Generate new secret
    const secret = generateSecret(user.email);
    const qrCodeUrl = await generateQRCode(secret);

    // Store secret temporarily (user needs to verify before enabling)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFactorSecret: secret.base32 },
    });

    res.json({
      success: true,
      secret: secret.base32,
      qrCodeUrl,
      manualEntryKey: secret.base32,
    });
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    res.status(500).json({ message: 'Error setting up 2FA' });
  }
});

// POST /api/2fa/verify-setup - Verify and enable 2FA
router.post('/verify-setup', authRequired, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA setup not initiated' });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled' });
    }

    // Verify token
    const isValid = verifyToken(user.twoFactorSecret, token);

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes();
    const backupCodesHash = backupCodes.map(code => 
      require('crypto').createHash('sha256').update(code).digest('hex')
    );

    // Enable 2FA
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        twoFactorEnabled: true,
        settings: {
          ...(user.settings || {}),
          backupCodes: backupCodesHash,
        },
      },
    });

    res.json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes, // Show only once
    });
  } catch (error) {
    console.error('Error verifying 2FA setup:', error);
    res.status(500).json({ message: 'Error verifying 2FA setup' });
  }
});

// POST /api/2fa/verify - Verify 2FA token during login
router.post('/verify', authRequired, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { twoFactorEnabled: true, twoFactorSecret: true, settings: true },
    });

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    // Check if it's a backup code
    const backupCodes = user.settings?.backupCodes || [];
    let isValid = false;
    let usedBackupCode = null;

    if (backupCodes.length > 0) {
      const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
      const codeIndex = backupCodes.indexOf(tokenHash);
      
      if (codeIndex !== -1) {
        // Backup code used, remove it
        backupCodes.splice(codeIndex, 1);
        await prisma.user.update({
          where: { id: req.user.id },
          data: {
            settings: {
              ...user.settings,
              backupCodes,
            },
          },
        });
        isValid = true;
        usedBackupCode = true;
      }
    }

    // If not backup code, verify TOTP
    if (!isValid) {
      isValid = verifyToken(user.twoFactorSecret, token);
    }

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    res.json({
      success: true,
      message: '2FA verified successfully',
      usedBackupCode,
    });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    res.status(500).json({ message: 'Error verifying 2FA' });
  }
});

// POST /api/2fa/disable - Disable 2FA
router.post('/disable', authRequired, async (req, res) => {
  try {
    const { password, token } = req.body;

    if (!password || !token) {
      return res.status(400).json({ message: 'Password and token are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { passwordHash: true, twoFactorEnabled: true, twoFactorSecret: true },
    });

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Verify 2FA token
    const tokenValid = verifyToken(user.twoFactorSecret, token);
    if (!tokenValid) {
      return res.status(400).json({ message: 'Invalid 2FA token' });
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        settings: {
          ...(user.settings || {}),
          backupCodes: [],
        },
      },
    });

    res.json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({ message: 'Error disabling 2FA' });
  }
});

// GET /api/2fa/status - Get 2FA status
router.get('/status', authRequired, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { twoFactorEnabled: true },
    });

    res.json({
      enabled: user.twoFactorEnabled || false,
    });
  } catch (error) {
    console.error('Error getting 2FA status:', error);
    res.status(500).json({ message: 'Error getting 2FA status' });
  }
});

module.exports = router;

