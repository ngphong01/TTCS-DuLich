// routes/aiAgent.js - AI Agent automation endpoints
const express = require('express');
const router = express.Router();
const { authRequired, isAdmin } = require('../middleware/auth');
const {
  AIContentManager,
  AIReviewModerator,
  AIDynamicPricing,
  AICustomerSupport,
} = require('../services/aiAgent');

// Initialize AI agents
const contentManager = new AIContentManager();
const reviewModerator = new AIReviewModerator();
const dynamicPricing = new AIDynamicPricing();
const customerSupport = new AICustomerSupport();

/**
 * POST /api/ai-agent/generate-tour-descriptions
 * Tự động tạo mô tả cho tất cả tours không có mô tả
 */
router.post('/generate-tour-descriptions', authRequired, isAdmin, async (req, res) => {
  try {
    console.log('🚀 Starting AI auto-generation of tour descriptions...');
    const results = await contentManager.autoGenerateTourDescriptions();
    
    res.json({
      success: true,
      message: `Đã xử lý ${results.length} tours`,
      stats: {
        total: results.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
      results,
    });
  } catch (error) {
    console.error('Error in AI tour description generation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate tour descriptions',
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-agent/generate-blog-posts
 * Tự động tạo blog posts về các điểm đến phổ biến
 */
router.post('/generate-blog-posts', authRequired, isAdmin, async (req, res) => {
  try {
    const { limit = 5 } = req.body;
    
    console.log(`🚀 Starting AI auto-generation of ${limit} blog posts...`);
    const results = await contentManager.autoGenerateBlogPosts(limit);
    
    res.json({
      success: true,
      message: `Đã tạo ${results.filter(r => r.success).length} blog posts`,
      stats: {
        total: results.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
      results,
    });
  } catch (error) {
    console.error('Error in AI blog generation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate blog posts',
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-agent/moderate-reviews
 * Tự động kiểm duyệt reviews
 */
router.post('/moderate-reviews', authRequired, isAdmin, async (req, res) => {
  try {
    console.log('🚀 Starting AI auto-moderation of reviews...');
    const results = await reviewModerator.autoModerateReviews();
    
    const stats = {
      total: results.length,
      approved: results.filter(r => r.action === 'approved').length,
      rejected: results.filter(r => r.action === 'rejected').length,
      pendingManualReview: results.filter(r => r.action === 'pending_manual_review').length,
    };
    
    res.json({
      success: true,
      message: `Đã xử lý ${results.length} reviews`,
      stats,
      results,
    });
  } catch (error) {
    console.error('Error in AI review moderation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate reviews',
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-agent/respond-to-reviews
 * Tự động phản hồi reviews
 */
router.post('/respond-to-reviews', authRequired, isAdmin, async (req, res) => {
  try {
    console.log('🚀 Starting AI auto-response to reviews...');
    const results = await reviewModerator.autoRespondToReviews();
    
    res.json({
      success: true,
      message: `Đã phản hồi ${results.filter(r => r.success).length}/${results.length} reviews`,
      stats: {
        total: results.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
      results,
    });
  } catch (error) {
    console.error('Error in AI review response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to reviews',
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-agent/adjust-pricing
 * Tự động điều chỉnh giá tours
 */
router.post('/adjust-pricing', authRequired, isAdmin, async (req, res) => {
  try {
    console.log('🚀 Starting AI dynamic pricing adjustment...');
    const results = await dynamicPricing.autoAdjustTourPricing();
    
    const stats = {
      total: results.length,
      applied: results.filter(r => r.applied).length,
      pendingReview: results.filter(r => !r.applied).length,
    };
    
    res.json({
      success: true,
      message: `Đã điều chỉnh giá cho ${stats.applied} tours`,
      stats,
      results,
    });
  } catch (error) {
    console.error('Error in AI pricing adjustment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to adjust pricing',
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-agent/handle-support-tickets
 * Tự động xử lý support tickets
 */
router.post('/handle-support-tickets', authRequired, isAdmin, async (req, res) => {
  try {
    console.log('🚀 Starting AI auto-handling of support tickets...');
    const results = await customerSupport.autoRespondToTickets();
    
    const stats = {
      total: results.length,
      handled: results.filter(r => r.handled).length,
      needsManualReview: results.filter(r => !r.handled).length,
    };
    
    res.json({
      success: true,
      message: `Đã xử lý ${stats.handled} tickets`,
      stats,
      results,
    });
  } catch (error) {
    console.error('Error in AI support ticket handling:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle support tickets',
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-agent/run-all
 * Chạy tất cả AI automation tasks
 */
router.post('/run-all', authRequired, isAdmin, async (req, res) => {
  try {
    console.log('🤖 Starting FULL AI AUTOMATION...');
    
    const results = {
      tourDescriptions: null,
      blogPosts: null,
      reviewModeration: null,
      reviewResponses: null,
      pricingAdjustment: null,
      supportTickets: null,
    };
    
    // 1. Generate tour descriptions
    try {
      results.tourDescriptions = await contentManager.autoGenerateTourDescriptions();
    } catch (error) {
      console.error('Tour description generation failed:', error);
      results.tourDescriptions = { error: error.message };
    }
    
    // 2. Generate blog posts
    try {
      results.blogPosts = await contentManager.autoGenerateBlogPosts(3);
    } catch (error) {
      console.error('Blog generation failed:', error);
      results.blogPosts = { error: error.message };
    }
    
    // 3. Moderate reviews
    try {
      results.reviewModeration = await reviewModerator.autoModerateReviews();
    } catch (error) {
      console.error('Review moderation failed:', error);
      results.reviewModeration = { error: error.message };
    }
    
    // 4. Respond to reviews
    try {
      results.reviewResponses = await reviewModerator.autoRespondToReviews();
    } catch (error) {
      console.error('Review responses failed:', error);
      results.reviewResponses = { error: error.message };
    }
    
    // 5. Adjust pricing
    try {
      results.pricingAdjustment = await dynamicPricing.autoAdjustTourPricing();
    } catch (error) {
      console.error('Pricing adjustment failed:', error);
      results.pricingAdjustment = { error: error.message };
    }
    
    // 6. Handle support tickets
    try {
      results.supportTickets = await customerSupport.autoRespondToTickets();
    } catch (error) {
      console.error('Support ticket handling failed:', error);
      results.supportTickets = { error: error.message };
    }
    
    console.log('🎉 FULL AI AUTOMATION COMPLETED');
    
    res.json({
      success: true,
      message: 'Đã hoàn thành tất cả automation tasks',
      results,
      summary: {
        tourDescriptions: Array.isArray(results.tourDescriptions) ? `${results.tourDescriptions.filter(r => r.success).length}/${results.tourDescriptions.length}` : 'Failed',
        blogPosts: Array.isArray(results.blogPosts) ? `${results.blogPosts.filter(r => r.success).length}/${results.blogPosts.length}` : 'Failed',
        reviewModeration: Array.isArray(results.reviewModeration) ? `${results.reviewModeration.length}` : 'Failed',
        reviewResponses: Array.isArray(results.reviewResponses) ? `${results.reviewResponses.filter(r => r.success).length}/${results.reviewResponses.length}` : 'Failed',
        pricingAdjustment: Array.isArray(results.pricingAdjustment) ? `${results.pricingAdjustment.filter(r => r.applied).length}/${results.pricingAdjustment.length}` : 'Failed',
        supportTickets: Array.isArray(results.supportTickets) ? `${results.supportTickets.filter(r => r.handled).length}/${results.supportTickets.length}` : 'Failed',
      },
    });
  } catch (error) {
    console.error('Error in full AI automation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run full automation',
      error: error.message,
    });
  }
});

/**
 * GET /api/ai-agent/status
 * Kiểm tra status của AI Agent
 */
router.get('/status', authRequired, isAdmin, async (req, res) => {
  try {
    const prisma = require('../lib/prisma');
    
    // Count pending tasks
    const pendingTours = await prisma.tour.count({
      where: {
        OR: [
          { description: null },
          { description: '' },
        ],
      },
    });
    
    const pendingReviews = await prisma.review.count({
      where: { approved: false },
    });
    
    const pendingTickets = await prisma.supportTicket.count({
      where: { status: 'open' },
    });
    
    res.json({
      success: true,
      aiAgentEnabled: true,
      geminiApiConfigured: !!process.env.GEMINI_API_KEY,
      pendingTasks: {
        toursNeedingDescriptions: pendingTours,
        reviewsNeedingModeration: pendingReviews,
        openSupportTickets: pendingTickets,
      },
      capabilities: [
        'Auto-generate tour descriptions',
        'Auto-generate blog posts',
        'Auto-moderate reviews',
        'Auto-respond to reviews',
        'Dynamic pricing adjustment',
        'Auto-handle support tickets',
      ],
    });
  } catch (error) {
    console.error('Error getting AI agent status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get status',
      error: error.message,
    });
  }
});

module.exports = router;

