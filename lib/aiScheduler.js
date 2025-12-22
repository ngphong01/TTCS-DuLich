// lib/aiScheduler.js - Lên lịch chạy AI automation tự động
const cron = require('node-cron');
const {
  AIContentManager,
  AIReviewModerator,
  AIDynamicPricing,
  AICustomerSupport,
} = require('../services/aiAgent');
const {
  AIPaymentVerifier,
  AISystemMonitor,
  AIBookingManager,
  AIFraudDetector,
} = require('../services/aiSystemManager');
const {
  AITourGenerator,
  AIBlogStoryGenerator,
  AIPromoGenerator,
  aiCodeMonitor,
} = require('../services/aiAdvancedAutomation');

// Initialize AI agents
const contentManager = new AIContentManager();
const reviewModerator = new AIReviewModerator();
const dynamicPricing = new AIDynamicPricing();
const customerSupport = new AICustomerSupport();
const paymentVerifier = new AIPaymentVerifier();
const systemMonitor = new AISystemMonitor();
const bookingManager = new AIBookingManager();
const fraudDetector = new AIFraudDetector();
const tourGenerator = new AITourGenerator();
const blogStoryGenerator = new AIBlogStoryGenerator();
const promoGenerator = new AIPromoGenerator();

/**
 * Initialize AI automation scheduler
 */
function initAIScheduler() {
  console.log('🤖 Initializing AI Automation Scheduler...');

  // 1. Auto-generate tour descriptions - Mỗi ngày lúc 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('🤖 [CRON] Running auto tour description generation...');
      const results = await contentManager.autoGenerateTourDescriptions();
      console.log(`✅ [CRON] Generated descriptions for ${results.filter(r => r.success).length} tours`);
    } catch (error) {
      console.error('❌ [CRON] Tour description generation failed:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  // 2. Auto-generate blog posts - Mỗi tuần Chủ nhật lúc 3:00 AM
  cron.schedule('0 3 * * 0', async () => {
    try {
      console.log('🤖 [CRON] Running auto blog post generation...');
      const results = await contentManager.autoGenerateBlogPosts(5);
      console.log(`✅ [CRON] Generated ${results.filter(r => r.success).length} blog posts`);
    } catch (error) {
      console.error('❌ [CRON] Blog generation failed:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  // 3. Auto-moderate reviews - Mỗi 4 giờ
  cron.schedule('0 */4 * * *', async () => {
    try {
      console.log('🤖 [CRON] Running auto review moderation...');
      const results = await reviewModerator.autoModerateReviews();
      console.log(`✅ [CRON] Moderated ${results.length} reviews`);
    } catch (error) {
      console.error('❌ [CRON] Review moderation failed:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  // 4. Auto-respond to reviews - Mỗi 6 giờ
  cron.schedule('0 */6 * * *', async () => {
    try {
      console.log('🤖 [CRON] Running auto review responses...');
      const results = await reviewModerator.autoRespondToReviews();
      console.log(`✅ [CRON] Responded to ${results.filter(r => r.success).length} reviews`);
    } catch (error) {
      console.error('❌ [CRON] Review response failed:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  // 5. Dynamic pricing adjustment - Mỗi ngày lúc 1:00 AM
  cron.schedule('0 1 * * *', async () => {
    try {
      console.log('🤖 [CRON] Running dynamic pricing adjustment...');
      const results = await dynamicPricing.autoAdjustTourPricing();
      console.log(`✅ [CRON] Adjusted pricing for ${results.filter(r => r.applied).length} tours`);
    } catch (error) {
      console.error('❌ [CRON] Pricing adjustment failed:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  // 6. Auto-handle support tickets - Mỗi 2 giờ
  cron.schedule('0 */2 * * *', async () => {
    try {
      console.log('🤖 [CRON] Running auto support ticket handling...');
      const results = await customerSupport.autoRespondToTickets();
      console.log(`✅ [CRON] Handled ${results.filter(r => r.handled).length} tickets`);
    } catch (error) {
      console.error('❌ [CRON] Support ticket handling failed:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  // 7. AI Payment Verification - Mỗi 30 phút (Real-time verification)
  cron.schedule('*/30 * * * *', async () => {
    try {
      console.log('🤖 [CRON] Running AI payment verification...');
      const results = await paymentVerifier.autoVerifyPayments();
      console.log(`✅ [CRON] Verified ${results.verified} payments, flagged ${results.flagged} for review`);
    } catch (error) {
      console.error('❌ [CRON] Payment verification failed:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  // 8. AI Fraud Detection - Mỗi giờ
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🤖 [CRON] Running AI fraud detection...');
      const results = await fraudDetector.detectSuspiciousActivity();
      if (results.alerts.length > 0) {
        console.log(`⚠️  [CRON] Detected ${results.alerts.length} suspicious activities`);
      } else {
        console.log('✅ [CRON] No suspicious activity detected');
      }
    } catch (error) {
      console.error('❌ [CRON] Fraud detection failed:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  // 9. AI Booking Auto-Confirmation - Mỗi 15 phút
  cron.schedule('*/15 * * * *', async () => {
    try {
      console.log('🤖 [CRON] Running AI booking auto-confirmation...');
      const results = await bookingManager.autoConfirmBookings();
      console.log(`✅ [CRON] Auto-confirmed ${results.confirmed} bookings`);
    } catch (error) {
      console.error('❌ [CRON] Booking confirmation failed:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  // 10. AI System Health Monitor - Mỗi 5 phút
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('🤖 [CRON] Running AI system health check...');
      const health = await systemMonitor.checkSystemHealth();
      if (health.status !== 'healthy') {
        console.log(`⚠️  [CRON] System health: ${health.status} - ${health.issues.join(', ')}`);
      }
    } catch (error) {
      console.error('❌ [CRON] System health check failed:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  // 11. AI Database Optimization - Mỗi ngày lúc 4:00 AM
  cron.schedule('0 4 * * *', async () => {
    try {
      console.log('🤖 [CRON] Running AI database optimization...');
      const results = await systemMonitor.optimizeDatabase();
      console.log(`✅ [CRON] Optimized ${results.tablesOptimized} tables, freed ${results.spaceSaved}`);
    } catch (error) {
      console.error('❌ [CRON] Database optimization failed:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  // 12. AI Performance Analytics - Mỗi ngày lúc 5:00 AM
  cron.schedule('0 5 * * *', async () => {
    try {
      console.log('🤖 [CRON] Running AI performance analytics...');
      const report = await systemMonitor.generatePerformanceReport();
      console.log(`✅ [CRON] Generated performance report: ${report.summary}`);
    } catch (error) {
      console.error('❌ [CRON] Performance analytics failed:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  // 13. AI Auto-Generate Featured Stories - TẮT (Đã vượt quota - chỉ 20 requests/day free tier)
  // Đã tắt để tránh vượt quota Gemini API (free tier chỉ có 20 requests/day)
  // Uncomment và thay đổi schedule nếu muốn bật lại (ví dụ: '0 2 * * *' = mỗi ngày 2:00 AM)
  /*
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('🤖 [CRON] Running AI story generation...');
      const results = await blogStoryGenerator.autoGenerateFeaturedStories(1);
      if (results.success) {
        console.log(`✅ [CRON] Generated ${results.count} featured story`);
      }
    } catch (error) {
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
        console.warn('⚠️  [CRON] Story generation skipped: Quota exceeded. Will retry tomorrow.');
        return; // Skip để tránh spam log
      }
      if (error.message?.includes('fetch failed')) {
        console.warn('⚠️  [CRON] Story generation skipped: Network error.');
      } else {
        console.error('❌ [CRON] Story generation failed:', error.message);
        aiCodeMonitor.logError(error, { task: 'story-generation' });
      }
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });
  */

  // 14. AI Auto-Generate Blog Posts - TẮT (Đã vượt quota - chỉ 20 requests/day free tier)
  // Đã tắt để tránh vượt quota Gemini API (free tier chỉ có 20 requests/day)
  // Uncomment và thay đổi schedule nếu muốn bật lại (ví dụ: '0 3 * * 0' = mỗi Chủ nhật 3:00 AM)
  /*
  cron.schedule('0 3 * * 0', async () => {
    try {
      console.log('🤖 [CRON] Running AI blog generation...');
      const results = await blogStoryGenerator.autoGenerateBlogPost();
      if (results.success) {
        console.log(`✅ [CRON] Generated blog: ${results.blog.title}`);
      }
    } catch (error) {
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
        console.warn('⚠️  [CRON] Blog generation skipped: Quota exceeded. Will retry next week.');
        return; // Skip để tránh spam log
      }
      if (error.message?.includes('fetch failed')) {
        console.warn('⚠️  [CRON] Blog generation skipped: Network error.');
      } else {
        console.error('❌ [CRON] Blog generation failed:', error.message);
        aiCodeMonitor.logError(error, { task: 'blog-generation' });
      }
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });
  */

  // 15. AI Auto-Generate Promos - TẮT (Đã vượt quota - chỉ 20 requests/day free tier)
  // Đã tắt để tránh vượt quota Gemini API (free tier chỉ có 20 requests/day)
  // Uncomment và thay đổi schedule nếu muốn bật lại (ví dụ: '0 4 * * *' = mỗi ngày 4:00 AM)
  /*
  cron.schedule('0 4 * * *', async () => {
    try {
      console.log('🤖 [CRON] Running AI promo generation...');
      const results = await promoGenerator.autoGeneratePromos(1); // Giảm từ 3 xuống 1
      if (results.success) {
        console.log(`✅ [CRON] Generated ${results.count} promotions`);
      }
    } catch (error) {
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
        console.warn('⚠️  [CRON] Promo generation skipped: Quota exceeded. Will retry tomorrow.');
        return; // Skip để tránh spam log
      }
      if (error.message?.includes('fetch failed')) {
        console.warn('⚠️  [CRON] Promo generation skipped: Network error.');
      } else {
        console.error('❌ [CRON] Promo generation failed:', error.message);
        aiCodeMonitor.logError(error, { task: 'promo-generation' });
      }
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });
  */

  // 16. AI Code Monitor & Report - Giảm xuống mỗi giờ (không dùng AI, chỉ log errors)
  // Không dùng Gemini API, chỉ đọc log files nên an toàn
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🤖 [CRON] Running AI code monitoring...');
      const report = await aiCodeMonitor.generateErrorReport();
      if (report.errorCount > 0) {
        console.log(`⚠️  [CRON] ${report.errorCount} errors detected`);
        if (report.analysis) {
          console.log(`📊 Priority: ${report.analysis.priority}`);
        }
      } else {
        console.log('✅ [CRON] No errors detected');
      }
    } catch (error) {
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
        console.warn('⚠️  [CRON] Code monitoring skipped: Quota exceeded.');
        return;
      }
      console.error('❌ [CRON] Code monitoring failed:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  console.log('✅ AI Automation Scheduler initialized successfully');
  console.log('');
  console.log('📅 Scheduled tasks:');
  console.log('');
  console.log('⚠️  QUOTA-AWARE MODE:');
  console.log('   - Story generation: DISABLED (to save quota)');
  console.log('   - Blog generation: DISABLED (to save quota)');
  console.log('   - Promo generation: DISABLED (to save quota)');
  console.log('   - Code monitoring: Every hour (reduced frequency)');
  console.log('');
  console.log('📝 CONTENT GENERATION:');
  console.log('   - Tour descriptions: Daily at 2:00 AM');
  console.log('   - Blog posts (scheduled): Weekly on Sunday at 3:00 AM');
  console.log('');
  console.log('⭐ REVIEW MANAGEMENT:');
  console.log('   - Review moderation: Every 4 hours');
  console.log('   - Review responses: Every 6 hours');
  console.log('');
  console.log('💰 PRICING & PAYMENTS:');
  console.log('   - Dynamic pricing: Daily at 1:00 AM');
  console.log('   - Payment verification: Every 30 minutes ⚡');
  console.log('   - Fraud detection: Every hour 🔒');
  console.log('');
  console.log('🎫 BOOKING MANAGEMENT:');
  console.log('   - Auto-confirmation: Every 15 minutes ⚡');
  console.log('   - Support tickets: Every 2 hours');
  console.log('');
  console.log('🔧 SYSTEM MONITORING:');
  console.log('   - Health check: Every 5 minutes ⚡');
  console.log('   - Database optimization: Daily at 4:00 AM');
  console.log('   - Performance analytics: Daily at 5:00 AM');
  console.log('');
  console.log('💡 NOTE: Free tier Gemini API chỉ có 20 requests/day');
  console.log('   Đã tắt các task chạy mỗi 5 phút để tránh vượt quota');
  console.log('   Để bật lại, uncomment code và thay đổi schedule trong lib/aiScheduler.js');
}

module.exports = {
  initAIScheduler,
};

