const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { authRequired, isAdmin } = require('./middleware/auth');
const prisma = require('./lib/prisma');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
// Increase limit for JSON payload and URL encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// Chat routes
const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

// Upload routes
const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes);

// Account avatar route (alias for convenience)
app.post('/api/account/avatar', authRequired, uploadRoutes.uploadAvatar.single('file'), uploadRoutes.uploadAvatarHandler);

// Account profile update (alias) - update current authenticated user
app.put('/api/account/profile', authRequired, async (req, res) => {
  try {
    const { name, email, avatarUrl, settings } = req.body || {};
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        ...(settings !== undefined ? { settings } : {}),
      },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, settings: true },
    });
    return res.json({ success: true, user: updated });
  } catch (e) {
    console.error('Profile update error:', e);
    return res.status(500).json({ success: false, error: 'Update failed' });
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
