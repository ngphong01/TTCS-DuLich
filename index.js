const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { authRequired, isAdmin } = require('./middleware/auth');
const prisma = require('./lib/prisma');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Middlewares
// CORS configuration - allow localhost and Dev Tunnels URLs
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  // Allow Dev Tunnels URLs (VS Code Port Forwarding)
  ...(process.env.ALLOWED_ORIGIN ? [process.env.ALLOWED_ORIGIN] : []),
  // Allow any *.devtunnels.ms domain for Dev Tunnels
  /^https:\/\/.*\.devtunnels\.ms$/,
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed origins
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('⚠️  CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
// Increase limit for JSON payload and URL encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Apply sanitization middleware globally
const { sanitizeBody } = require('./middleware/validation');
app.use(sanitizeBody);

// Serve static files from uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic health route
app.get('/', (req, res) => {
  res.send('TravelGo API is running');
});

// API routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const destinationRoutes = require('./routes/destination');
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');
const reviewRoutes = require('./routes/review');
const notificationRoutes = require('./routes/notification');
const adminRoutes = require('./routes/admin');
const supportRoutes = require('./routes/support');
const categoryRoutes = require('./routes/category');
const wishlistRoutes = require('./routes/wishlist');
const loyaltyRoutes = require('./routes/loyalty');
const emailRoutes = require('./routes/email');
const hotelRoutes = require('./routes/hotel');
const restaurantRoutes = require('./routes/restaurant');
const tourRoutes = require('./routes/tour');
const newsletterRoutes = require('./routes/newsletter');
const aiRoutes = require('./routes/ai');
const aiAdvancedRoutes = require('./routes/aiAdvanced');
const promoRoutes = require('./routes/promo');
const blogRoutes = require('./routes/blog');
const invoiceRoutes = require('./routes/invoice');
const sitemapRoutes = require('./routes/sitemap');
const bannerRoutes = require('./routes/banner');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/destination', destinationRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/notification', notificationRoutes);
// Protect all admin endpoints
app.use('/api/admin', authRequired, isAdmin, adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/hotel', hotelRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/tour', tourRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Chat routes
const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

// AI routes (admin only)
app.use('/api/ai', aiRoutes);

// AI Advanced Automation routes (admin only)
app.use('/api/ai-advanced', aiAdvancedRoutes);

// Promo code routes
app.use('/api/promo', promoRoutes);

// Blog routes
app.use('/api/blog', blogRoutes);

// Story routes
const storyRoutes = require('./routes/story');
app.use('/api/stories', storyRoutes);

// Invoice routes
app.use('/api/invoice', invoiceRoutes);

// Tour booking routes
const bookingTourRoutes = require('./routes/bookingTour');
app.use('/api/booking-tour', bookingTourRoutes);

// Sitemap & Robots
app.use('/', sitemapRoutes);

// Banner routes
app.use('/api/banner', bannerRoutes);

// Activity Log routes (admin only)
const activityLogRoutes = require('./routes/activityLog');
app.use('/api/activity-log', activityLogRoutes);

// Email Template routes (admin only)
const emailTemplateRoutes = require('./routes/emailTemplate');
app.use('/api/email-template', emailTemplateRoutes);

// Export routes (admin only)
const exportRoutes = require('./routes/export');
app.use('/api/export', exportRoutes);

// Review helpful routes
const reviewHelpfulRoutes = require('./routes/reviewHelpful');
app.use('/api/review-helpful', reviewHelpfulRoutes);

const tourReviewHelpfulRoutes = require('./routes/tourReviewHelpful');
app.use('/api/tour-review-helpful', tourReviewHelpfulRoutes);

// Referral routes
const referralRoutes = require('./routes/referral');
app.use('/api/referral', referralRoutes);

// Itinerary routes
const itineraryRoutes = require('./routes/itinerary');
app.use('/api/itinerary', itineraryRoutes);

// Birthday routes
const birthdayRoutes = require('./routes/birthday');
app.use('/api/birthday', birthdayRoutes);

// Flash sale routes
const flashSaleRoutes = require('./routes/flashSale');
app.use('/api/flash-sale', flashSaleRoutes);

// 2FA routes
const twoFactorRoutes = require('./routes/2fa');
app.use('/api/2fa', twoFactorRoutes);

// Phone verification routes
const phoneRoutes = require('./routes/phone');
app.use('/api/phone', phoneRoutes);

// Landing page routes
const landingRoutes = require('./routes/landing');
app.use('/api/landing', landingRoutes);

// Affiliate routes
const affiliateRoutes = require('./routes/affiliate');
app.use('/api/affiliate', affiliateRoutes);

// Push notification routes
const pushNotificationRoutes = require('./routes/pushNotification');
app.use('/api/push', pushNotificationRoutes);

// Email campaign routes
const emailCampaignRoutes = require('./routes/emailCampaign');
app.use('/api/email-campaign', emailCampaignRoutes);

// Upload routes
const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes);

// AI Agent routes (full automation)
const aiAgentRoutes = require('./routes/aiAgent');
app.use('/api/ai-agent', aiAgentRoutes);

// Account avatar route (alias for convenience)
app.post('/api/account/avatar', authRequired, uploadRoutes.uploadAvatar.single('file'), uploadRoutes.uploadAvatarHandler);

// Account profile update (alias) - update current authenticated user
app.put('/api/account/profile', authRequired, async (req, res) => {
  try {
    const { name, email, avatarUrl, settings, password } = req.body || {};

    // 🔥 CRITICAL: Handle password update separately if provided
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (settings !== undefined) {
      // Ensure settings is stored as JSON string
      updateData.settings = typeof settings === 'string' ? settings : JSON.stringify(settings);
    }
    
    // Handle password update
    if (password) {
      const bcrypt = require('bcrypt');
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }
    
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, settings: true },
    });
    
    console.log('✅ Profile updated for user:', req.user.id);
    return res.json({ success: true, user: updated });
  } catch (e) {
    console.error('❌ Profile update error:', e);
    return res.status(500).json({ success: false, error: e.message || 'Update failed' });
  }
});

// GET /api/account/loyalty - Get current user's loyalty info
app.get('/api/account/loyalty', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user with settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true },
    });
    
    // Get loyalty points
    const loyalty = await prisma.loyalty.findUnique({
      where: { userId },
    });
    
    const points = loyalty?.points || 0;
    const settings = user?.settings || {};
    const loyaltyRank = settings.loyaltyRank;
    
    // Determine tier: use admin-set rank if available, otherwise calculate from points
    let tier;
    if (loyaltyRank && ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].includes(loyaltyRank)) {
      // Admin has set a rank, use it
      tier = loyaltyRank;
    } else {
      // Calculate tier from points
      if (points >= 10000) tier = 'Diamond';
      else if (points >= 5000) tier = 'Platinum';
      else if (points >= 2500) tier = 'Gold';
      else if (points >= 1000) tier = 'Silver';
      else tier = 'Bronze';
    }
    
    // Calculate progress to next tier
    let nextTier = null;
    let pointsToNext = null;
    if (tier === 'Bronze') {
      nextTier = 'Silver';
      pointsToNext = 1000;
    } else if (tier === 'Silver') {
      nextTier = 'Gold';
      pointsToNext = 2500;
    } else if (tier === 'Gold') {
      nextTier = 'Platinum';
      pointsToNext = 5000;
    } else if (tier === 'Platinum') {
      nextTier = 'Diamond';
      pointsToNext = 10000;
    }
    
    // Get tier benefits based on tier
    const benefits = {
      'Bronze': [
        'Tích điểm 10 điểm/100.000đ',
        'Ưu đãi 5% cho tour nội địa',
      ],
      'Silver': [
        'Tích điểm 10 điểm/100.000đ',
        'Ưu đãi 7% cho tour nội địa',
        'Ưu đãi 5% cho tour quốc tế',
        'Đổi điểm lấy voucher',
      ],
      'Gold': [
        'Tích điểm 15 điểm/100.000đ',
        'Ưu đãi 10% cho tour nội địa',
        'Ưu đãi 7% cho tour quốc tế',
        'Đổi điểm lấy voucher',
        'Ưu tiên đặt chỗ',
      ],
      'Platinum': [
        'Tích điểm 20 điểm/100.000đ',
        'Ưu đãi 15% cho tour nội địa',
        'Ưu đãi 10% cho tour quốc tế',
        'Đổi điểm lấy voucher',
        'Ưu tiên đặt chỗ',
        'Miễn phí hủy tour',
      ],
      'Diamond': [
        'Tích điểm 25 điểm/100.000đ',
        'Ưu đãi 20% cho tất cả tour',
        'Đổi điểm lấy voucher',
        'Ưu tiên đặt chỗ',
        'Miễn phí hủy tour',
        'Hỗ trợ 24/7',
      ],
    };
    
    return res.json({
      tier,
      points,
      nextTier,
      pointsToNext,
      benefits: benefits[tier] || [],
      history: [], // TODO: Add loyalty history if needed
    });
  } catch (error) {
    console.error('Error fetching loyalty:', error);
    return res.status(500).json({ error: 'Failed to fetch loyalty info' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Test database connection before starting server
async function startServer() {
  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Initialize scheduler for email reminders
    const { initScheduler } = require('./lib/scheduler');
    initScheduler();

    // Initialize AI automation scheduler
    if (process.env.ENABLE_AI_AUTOMATION === 'true' && process.env.GEMINI_API_KEY) {
      const { initAIScheduler } = require('./lib/aiScheduler');
      initAIScheduler();
      console.log('🤖 AI Automation enabled - AI will handle tasks automatically');
    } else {
      console.log('⏸️  AI Automation disabled - Set ENABLE_AI_AUTOMATION=true and GEMINI_API_KEY in .env to enable');
    }

    // Initialize backup scheduler
    if (process.env.ENABLE_AUTO_BACKUP === 'true') {
      const { initBackupScheduler } = require('./lib/backup');
      initBackupScheduler();
    }

    // Initialize push notifications
    const { initPushNotifications } = require('./lib/pushNotification');
    initPushNotifications();

    // Initialize SMS service
    const { initSMSService } = require('./lib/sms');
    initSMSService();

    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ====================================');
      console.log(`✅ TravelGo API server is running on port ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log('🚀 ====================================');
      console.log('');
    });
  } catch (error) {
    console.error('');
    console.error('❌ ====================================');
    console.error('❌ ERROR: Failed to start server');
    console.error('❌ ====================================');
    console.error('');
    console.error('Error details:', error.message);
    console.error('');
    
    if (error.code === 'P1001') {
      console.error('💡 Solution:');
      console.error('   1. Check if MySQL is running');
      console.error('   2. Verify DATABASE_URL in .env file');
      console.error('   3. Run: npm run prisma:generate');
      console.error('   4. Run: npm run prisma:migrate');
    } else if (error.message.includes('JWT_SECRET')) {
      console.error('💡 Solution:');
      console.error('   1. Add JWT_SECRET to .env file');
      console.error('   2. Example: JWT_SECRET=your-secret-key-here');
    }
    console.error('');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
startServer();

// Periodically clean up expired password reset tokens (every 1 minute)
setInterval(async () => {
  try {
    const now = new Date();
    const result = await prisma.user.updateMany({
      where: {
        resetTokenExpiry: { lt: now },
      },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    if (result.count > 0) {
      console.log(`🧹 Cleared ${result.count} expired reset tokens`);
    }
  } catch (e) {
    // ignore cleanup errors
  }
}, 60 * 1000);
