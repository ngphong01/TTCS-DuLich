// routes/aiAdvanced.js - Advanced AI Automation Routes
const express = require('express');
const router = express.Router();
const { authRequired, isAdmin } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimit');
const {
  AITourGenerator,
  AIBlogStoryGenerator,
  AIPromoGenerator,
  aiCodeMonitor,
} = require('../services/aiAdvancedAutomation');

// Initialize AI agents
const tourGenerator = new AITourGenerator();
const blogStoryGenerator = new AIBlogStoryGenerator();
const promoGenerator = new AIPromoGenerator();

/**
 * POST /api/ai-advanced/generate-tour
 * Tự động tạo tour hoàn chỉnh với ảnh
 */
router.post('/generate-tour', authRequired, isAdmin, aiLimiter, async (req, res) => {
  try {
    const { destinationId } = req.body;
    
    if (!destinationId) {
      return res.status(400).json({ 
        success: false,
        message: 'Destination ID required' 
      });
    }
    
    console.log(`🎨 Generating complete tour for destination ${destinationId}...`);
    
    const result = await tourGenerator.autoGenerateTour(destinationId);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Tour generated successfully',
        tour: result.tour,
        images: result.images
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Failed to generate tour'
      });
    }
  } catch (error) {
    console.error('Error generating tour:', error);
    aiCodeMonitor.logError(error, { route: 'generate-tour' });
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to generate tour' 
    });
  }
});

/**
 * POST /api/ai-advanced/generate-stories
 * Tự động tạo featured stories với ảnh
 */
router.post('/generate-stories', authRequired, isAdmin, aiLimiter, async (req, res) => {
  try {
    const { count = 1 } = req.body;
    
    console.log(`🎨 Generating ${count} featured stories...`);
    
    const result = await blogStoryGenerator.autoGenerateFeaturedStories(count);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Generated ${result.count} stories`,
        stories: result.stories
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Failed to generate stories'
      });
    }
  } catch (error) {
    console.error('Error generating stories:', error);
    aiCodeMonitor.logError(error, { route: 'generate-stories' });
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to generate stories' 
    });
  }
});

/**
 * POST /api/ai-advanced/generate-blog
 * Tự động tạo blog post với ảnh
 */
router.post('/generate-blog', authRequired, isAdmin, aiLimiter, async (req, res) => {
  try {
    const { topic } = req.body;
    
    console.log(`📝 Generating blog post${topic ? ` about: ${topic}` : ''}...`);
    
    const result = await blogStoryGenerator.autoGenerateBlogPost(topic);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Blog generated successfully',
        blog: result.blog
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Failed to generate blog'
      });
    }
  } catch (error) {
    console.error('Error generating blog:', error);
    aiCodeMonitor.logError(error, { route: 'generate-blog' });
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to generate blog' 
    });
  }
});

/**
 * POST /api/ai-advanced/generate-promos
 * Tự động tạo nhiều promotions/ưu đãi
 */
router.post('/generate-promos', authRequired, isAdmin, aiLimiter, async (req, res) => {
  try {
    const { count = 3 } = req.body;
    
    console.log(`🎁 Generating ${count} promotions...`);
    
    const result = await promoGenerator.autoGeneratePromos(count);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Generated ${result.count} promotions`,
        promos: result.promos
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Failed to generate promos'
      });
    }
  } catch (error) {
    console.error('Error generating promos:', error);
    aiCodeMonitor.logError(error, { route: 'generate-promos' });
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to generate promos' 
    });
  }
});

/**
 * GET /api/ai-advanced/error-report
 * Lấy báo cáo lỗi từ AI Code Monitor
 */
router.get('/error-report', authRequired, isAdmin, async (req, res) => {
  try {
    console.log('📊 Generating error report...');
    
    const report = await aiCodeMonitor.generateErrorReport();
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to generate report' 
    });
  }
});

/**
 * POST /api/ai-advanced/run-all
 * Chạy tất cả AI advanced tasks một lần
 */
router.post('/run-all', authRequired, isAdmin, async (req, res) => {
  try {
    console.log('🚀 Running ALL Advanced AI tasks...');
    
    const results = {
      stories: null,
      blog: null,
      promos: null,
      errorReport: null
    };
    
    // Run all tasks in parallel
    const [storiesResult, blogResult, promosResult, errorReport] = await Promise.allSettled([
      blogStoryGenerator.autoGenerateFeaturedStories(1),
      blogStoryGenerator.autoGenerateBlogPost(),
      promoGenerator.autoGeneratePromos(3),
      aiCodeMonitor.generateErrorReport()
    ]);
    
    results.stories = storiesResult.status === 'fulfilled' ? storiesResult.value : { error: storiesResult.reason?.message };
    results.blog = blogResult.status === 'fulfilled' ? blogResult.value : { error: blogResult.reason?.message };
    results.promos = promosResult.status === 'fulfilled' ? promosResult.value : { error: promosResult.reason?.message };
    results.errorReport = errorReport.status === 'fulfilled' ? errorReport.value : { error: errorReport.reason?.message };
    
    console.log('✅ All Advanced AI tasks completed');
    
    res.json({
      success: true,
      message: 'All tasks completed',
      results
    });
  } catch (error) {
    console.error('Error running all tasks:', error);
    aiCodeMonitor.logError(error, { route: 'run-all' });
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to run all tasks' 
    });
  }
});

module.exports = router;

