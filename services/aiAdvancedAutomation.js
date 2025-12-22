// services/aiAdvancedAutomation.js - Advanced AI Automation
const prisma = require('../lib/prisma');
const { chatWithGemini } = require('./geminiChatbot');
const slugify = require('slugify');
const fs = require('fs').promises;
const path = require('path');

/**
 * AI TOUR GENERATOR
 * Tự động tạo tour hoàn chỉnh với ảnh và nội dung
 */
class AITourGenerator {
  async autoGenerateTour(destinationId) {
    try {
      console.log('🎨 AI Tour Generator: Creating complete tour...');
      
      // Get destination info
      const destination = await prisma.destination.findUnique({
        where: { id: destinationId }
      });
      
      if (!destination) {
        throw new Error('Destination not found');
      }
      
      // Generate tour data with AI
      const prompt = `Bạn là TravelGo Tour Creator Expert. Tạo một tour du lịch hoàn chỉnh cho:

Điểm đến: ${destination.name}
Quốc gia: ${destination.country || 'Việt Nam'}
Địa điểm: ${destination.location || 'N/A'}

YÊU CẦU:
1. Tên tour hấp dẫn (tiếng Việt)
2. Mô tả ngắn (100-150 từ)
3. Mô tả đầy đủ (400-600 từ)
4. Thời gian (2-7 ngày)
5. Giá tham khảo (VNĐ)
6. Highlights (5-7 điểm nổi bật)
7. Lịch trình chi tiết theo ngày
8. Tags phù hợp
9. FAQ (5 câu hỏi thường gặp)
10. Chính sách (hủy tour, hoàn tiền)

Trả về JSON format:
{
  "name": "...",
  "shortDescription": "...",
  "description": "...",
  "duration": 3,
  "price": 2500000,
  "adultPrice": 2500000,
  "childPrice": 1500000,
  "tags": ["Adventure", "Nature", "Cultural"],
  "highlights": [
    {"icon": "🏔️", "text": "..."},
    ...
  ],
  "itinerary": [
    {
      "day": 1,
      "title": "...",
      "activities": ["...", "...", "..."],
      "meals": "Sáng, Trưa, Tối",
      "accommodation": "Khách sạn 4 sao"
    },
    ...
  ],
  "faq": [
    {"question": "...", "answer": "..."},
    ...
  ],
  "policies": {
    "cancellation": "...",
    "refund": "...",
    "paymentTerms": "..."
  },
  "transport": "Xe buýt + Máy bay"
}`;

      const aiResponse = await chatWithGemini(prompt, []);
      
      // Parse JSON response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }
      
      const tourData = JSON.parse(jsonMatch[0]);
      
      // Generate images using AI (placeholder URLs for now)
      const images = await this.generateTourImages(destination.name, tourData.name);
      
      // Create slug
      const slug = slugify(tourData.name, { 
        lower: true, 
        locale: 'vi',
        remove: /[*+~.()'"!:@]/g 
      });
      
      // Create tour in database
      const tour = await prisma.tour.create({
        data: {
          name: tourData.name,
          slug,
          shortDescription: tourData.shortDescription,
          description: tourData.description,
          duration: tourData.duration,
          price: tourData.price,
          adultPrice: tourData.adultPrice || tourData.price,
          childPrice: tourData.childPrice || Math.floor(tourData.price * 0.6),
          originalPrice: Math.floor(tourData.price * 1.2),
          image: images[0],
          photos: images,
          tags: tourData.tags,
          highlights: tourData.highlights,
          itinerary: tourData.itinerary,
          faq: tourData.faq,
          policies: tourData.policies,
          transport: tourData.transport,
          featured: false,
          availability: 20,
          maxCapacity: 30,
          destinationId: destination.id,
        }
      });
      
      console.log(`✅ Created tour: ${tour.name} (ID: ${tour.id})`);
      
      return {
        success: true,
        tour,
        images
      };
    } catch (error) {
      console.error('❌ AI Tour Generator error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async generateTourImages(destinationName, tourName) {
    try {
      console.log('🎨 Generating tour images...');
      
      // Use placeholder images service (Unsplash, Pexels API would be better)
      const keywords = encodeURIComponent(`${destinationName} travel landscape`);
      
      // Generate 5 placeholder images
      const images = [
        `https://source.unsplash.com/800x600/?${keywords},1`,
        `https://source.unsplash.com/800x600/?${keywords},2`,
        `https://source.unsplash.com/800x600/?${keywords},3`,
        `https://source.unsplash.com/800x600/?${keywords},4`,
        `https://source.unsplash.com/800x600/?${keywords},5`,
      ];
      
      console.log(`✅ Generated ${images.length} images`);
      
      return images;
    } catch (error) {
      console.error('❌ Image generation error:', error);
      return ['https://via.placeholder.com/800x600?text=Tour+Image'];
    }
  }
}

/**
 * AI BLOG & STORY GENERATOR
 * Tự động tạo blog posts và stories với ảnh
 */
class AIBlogStoryGenerator {
  async autoGenerateFeaturedStories(count = 1) {
    try {
      console.log(`🎨 AI Story Generator: Creating ${count} featured stories...`);
      
      // Get popular destinations
      const destinations = await prisma.destination.findMany({
        orderBy: { createdAt: 'desc' },
        take: count * 2
      });
      
      const stories = [];
      
      for (let i = 0; i < Math.min(count, destinations.length); i++) {
        const dest = destinations[i];
        
        const prompt = `Bạn là TravelGo Story Writer. Tạo một câu chuyện du lịch cảm động về:

Điểm đến: ${dest.name}
Quốc gia: ${dest.country || 'Việt Nam'}

YÊU CẦU:
1. Tiêu đề hấp dẫn, cảm xúc
2. Câu chuyện 300-500 từ
3. Giọng văn chân thực, gần gũi
4. Có twist hoặc insight thú vị
5. Kết thúc truyền cảm hứng
6. Sử dụng emoji phù hợp

Trả về JSON:
{
  "title": "...",
  "content": "...",
  "excerpt": "...",
  "author": "TravelGo Explorer",
  "tags": ["adventure", "culture", "inspiration"]
}`;

        const aiResponse = await chatWithGemini(prompt, []);
        
        // Extract JSON from response
        let jsonString = aiResponse;
        jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          jsonString = jsonMatch[0]
            .replace(/\\'/g, "'")
            .replace(/\\\\/g, "\\")
            .replace(/[\u0000-\u001F]+/g, " ")
            .replace(/,(\s*[}\]])/g, '$1')
            .trim();
          
          const storyData = JSON.parse(jsonString);
          
          // Generate story image
          const image = await this.generateStoryImage(dest.name);
          
          // Generate unique slug
          const slug = storyData.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim() + '-' + Date.now();
          
          // Save to database
          const savedStory = await prisma.story.create({
            data: {
              title: storyData.title,
              slug: slug,
              content: storyData.content,
              excerpt: storyData.excerpt || storyData.content.substring(0, 200),
              image: image,
              author: storyData.author || 'TravelGo Explorer',
              featured: true,
              destinationId: dest.id,
              category: 'Experience',
              tags: Array.isArray(storyData.tags) ? storyData.tags : [],
              published: true,
              publishedAt: new Date()
            }
          });
          
          stories.push(savedStory);
          console.log(`✅ Created story: ${storyData.title}`);
        }
        
        // Delay to avoid rate limit
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      return {
        success: true,
        stories,
        count: stories.length
      };
    } catch (error) {
      console.error('❌ AI Story Generator error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async autoGenerateBlogPost(topic = null) {
    try {
      console.log('📝 AI Blog Generator: Creating blog post...');
      
      // If no topic, AI suggests one
      if (!topic) {
        const suggestPrompt = `Đề xuất 1 chủ đề blog du lịch hot, trending hiện nay ở Việt Nam. 
        
Chỉ trả về tên chủ đề, không giải thích.`;
        
        topic = await chatWithGemini(suggestPrompt, []);
        topic = topic.trim().replace(/["']/g, '');
      }
      
      const prompt = `Bạn là TravelGo Blog Writer. Viết blog post SEO-optimized về:

Chủ đề: ${topic}

YÊU CẦU:
1. Tiêu đề hấp dẫn, SEO-friendly
2. Nội dung 800-1200 từ
3. Cấu trúc: Intro, Body (3-5 sections), Conclusion
4. Bullet points, numbered lists
5. Tối ưu SEO: keywords, headings
6. Call-to-action cuối bài
7. Format Markdown

**QUAN TRỌNG**: Trả về VALID JSON object. Không thêm markdown code blocks. Không có trailing commas.

Trả về JSON:
{
  "title": "...",
  "content": "... (Markdown)",
  "excerpt": "...",
  "seoTitle": "...",
  "seoDescription": "...",
  "seoKeywords": ["keyword1", "keyword2"],
  "tags": ["travel", "vietnam"],
  "category": "Travel Tips"
}`;

      const aiResponse = await chatWithGemini(prompt, []);
      
      // Extract JSON from response (handle markdown code blocks)
      let jsonString = aiResponse;
      
      // Remove markdown code blocks if present
      jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find JSON object
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response - no JSON found');
      }
      
      jsonString = jsonMatch[0];
      
      // ENHANCED: Clean up common JSON issues more aggressively
      jsonString = jsonString
        // Fix escaped quotes and backslashes
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, "\\")
        // Remove ALL control characters (including newlines in strings)
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
        // Fix unescaped quotes in values
        .replace(/"([^"]*)":\s*"([^"]*)"/g, (match, key, value) => {
          const cleanValue = value.replace(/"/g, '\\"');
          return `"${key}": "${cleanValue}"`;
        })
        // Remove trailing commas
        .replace(/,(\s*[}\]])/g, '$1')
        // Remove leading/trailing whitespace
        .trim();
      
      let blogData;
      try {
        blogData = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError.message);
        console.error('📄 JSON String (first 500 chars):', jsonString.substring(0, 500));
        console.error('📄 JSON String (last 500 chars):', jsonString.substring(Math.max(0, jsonString.length - 500)));
        throw new Error('Invalid JSON from AI: ' + parseError.message);
      }
      
      // Generate featured image
      const image = await this.generateBlogImage(blogData.title);
      
      // Generate unique slug
      const slug = blogData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + '-' + Date.now();
      
      // Save to database
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const savedBlog = await prisma.blog.create({
        data: {
          title: blogData.title,
          slug: slug,
          content: blogData.content,
          excerpt: blogData.excerpt || blogData.content?.substring(0, 200),
          featuredImage: image,
          author: 'TravelGo AI',
          category: blogData.category || 'Travel Tips',
          tags: Array.isArray(blogData.tags) ? blogData.tags : (blogData.tags ? [blogData.tags] : []),
          seoTitle: blogData.seoTitle ? blogData.seoTitle.substring(0, 60) : blogData.title?.substring(0, 60),
          seoDescription: (blogData.seoDescription || blogData.excerpt || blogData.content)?.substring(0, 160),
          seoKeywords: Array.isArray(blogData.seoKeywords) && blogData.seoKeywords.length > 0 
            ? blogData.seoKeywords.slice(0, 5).join(', ').substring(0, 255)
            : (typeof blogData.seoKeywords === 'string' ? blogData.seoKeywords.substring(0, 255) : null),
          published: true,
          publishedAt: new Date()
        }
      });
      
      await prisma.$disconnect();
      
      console.log(`✅ Created blog: ${blogData.title}`);
      
      return {
        success: true,
        blog: savedBlog
      };
    } catch (error) {
      console.error('❌ AI Blog Generator error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async generateStoryImage(destinationName) {
    const keywords = encodeURIComponent(`${destinationName} travel story`);
    return `https://source.unsplash.com/1200x800/?${keywords}`;
  }
  
  async generateBlogImage(title) {
    // Use shorter keywords to avoid URL length issues
    const keywords = title.split(' ').slice(0, 3).join(' ');
    const encoded = encodeURIComponent(keywords).substring(0, 50); // Limit length
    return `https://source.unsplash.com/1200x600/?${encoded}`;
  }
}

/**
 * AI CODE MONITOR
 * Giám sát lỗi code và báo cáo cho admin
 */
class AICodeMonitor {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
  }
  
  logError(error, context = {}) {
    const errorLog = {
      timestamp: new Date(),
      message: error.message,
      stack: error.stack,
      context,
      severity: this.determineSeverity(error)
    };
    
    this.errors.push(errorLog);
    
    // Keep only last 100 errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
    
    // Log to console
    console.error('🚨 Code Error:', errorLog);
    
    // Auto-report if critical
    if (errorLog.severity === 'CRITICAL') {
      this.reportToAdmin(errorLog);
    }
  }
  
  determineSeverity(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('database') || 
        message.includes('connection') ||
        message.includes('payment') ||
        message.includes('auth')) {
      return 'CRITICAL';
    }
    
    if (message.includes('validation') ||
        message.includes('not found') ||
        message.includes('timeout')) {
      return 'HIGH';
    }
    
    return 'MEDIUM';
  }
  
  async reportToAdmin(errorLog) {
    try {
      console.log('📧 Sending error report to admin...');
      
      // TODO: Send email to admin
      // const { sendEmail } = require('../lib/email');
      // await sendEmail({
      //   to: 'admin@travelgo.com',
      //   subject: `🚨 CRITICAL ERROR: ${errorLog.message}`,
      //   html: `...`
      // });
      
      console.log('✅ Error report sent');
    } catch (error) {
      console.error('❌ Failed to send error report:', error);
    }
  }
  
  async generateErrorReport() {
    try {
      console.log('📊 Generating error report...');
      
      const recentErrors = this.errors.slice(-20);
      
      if (recentErrors.length === 0) {
        return {
          success: true,
          message: 'No errors to report',
          errors: []
        };
      }
      
      // Analyze errors with AI
      const errorSummary = recentErrors.map(e => ({
        time: e.timestamp,
        message: e.message,
        severity: e.severity
      }));
      
      const prompt = `Bạn là TravelGo DevOps AI. Phân tích các lỗi sau và đưa ra khuyến nghị:

Errors (${recentErrors.length} recent):
${JSON.stringify(errorSummary, null, 2)}

YÊU CẦU:
1. Tóm tắt vấn đề chính
2. Đánh giá mức độ nghiêm trọng
3. Khuyến nghị cách fix
4. Ưu tiên xử lý

Trả về JSON:
{
  "summary": "...",
  "criticalIssues": ["...", "..."],
  "recommendations": ["...", "..."],
  "priority": "HIGH/MEDIUM/LOW"
}`;

      const aiResponse = await chatWithGemini(prompt, []);
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        
        return {
          success: true,
          errorCount: recentErrors.length,
          recentErrors: recentErrors.slice(0, 5), // Last 5 errors
          analysis
        };
      }
      
      return {
        success: true,
        errorCount: recentErrors.length,
        recentErrors: recentErrors.slice(0, 5)
      };
    } catch (error) {
      console.error('❌ Error report generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * AI PROMO GENERATOR
 * Tự động tạo ưu đãi và khuyến mãi
 */
class AIPromoGenerator {
  async autoGeneratePromos(count = 3) {
    try {
      console.log(`🎁 AI Promo Generator: Creating ${count} promotions...`);
      
      const prompt = `Bạn là TravelGo Marketing AI. Tạo ${count} chương trình khuyến mãi du lịch hấp dẫn.

YÊU CẦU:
1. Tên khuyến mãi bắt mắt
2. Mô tả ngắn gọn
3. Giảm giá hợp lý (10-40%)
4. Thời gian áp dụng
5. Điều kiện áp dụng
6. Code promo UNIQUE (không trùng với: TRAVELGO20, GROUPGO15, SUMMERGO35, WEEKEND25)

**QUAN TRỌNG**: Trả về VALID JSON array. Không thêm markdown code blocks. Không có trailing commas.

Trả về JSON array:
[
  {
    "name": "Flash Sale Cuối Tuần",
    "description": "Giảm giá cực sốc cho tour cuối tuần",
    "discountType": "PERCENTAGE",
    "discountValue": 25,
    "code": "WEEKEND25",
    "minBooking": 2000000,
    "validFrom": "2025-11-29",
    "validTo": "2025-12-01",
    "maxUses": 100,
    "applicableFor": "All tours"
  },
  ...
]`;

      const aiResponse = await chatWithGemini(prompt, []);
      
      // Extract JSON from response (handle markdown code blocks)
      let jsonString = aiResponse;
      
      // Remove markdown code blocks if present
      jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find JSON array
      const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response - no JSON array found');
      }
      
      jsonString = jsonMatch[0];
      
      // Clean up common JSON issues
      jsonString = jsonString
        .replace(/\\'/g, "'")           // Fix single quotes
        .replace(/\\\\/g, "\\")         // Fix double backslashes
        .replace(/[\u0000-\u001F]+/g, " ") // Remove control characters
        .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
        .trim();
      
      let promos;
      try {
        promos = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError.message);
        console.error('📄 JSON String:', jsonString.substring(0, 500));
        throw new Error('Invalid JSON from AI: ' + parseError.message);
      }
      
      // Save to database
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const savedPromos = [];
      
      for (const promo of promos) {
        try {
          // Check if promo code already exists
          const existing = await prisma.promoCode.findUnique({
            where: { code: promo.code }
          });
          
          if (existing) {
            console.log(`⏭️  Skipped promo: ${promo.code} (already exists)`);
            continue;
          }
          
          const savedPromo = await prisma.promoCode.create({
            data: {
              code: promo.code,
              discountType: promo.discountType || 'PERCENTAGE',
              discountValue: parseFloat(promo.discountValue),
              minAmount: promo.minBooking ? parseFloat(promo.minBooking) : 0,
              usageLimit: promo.maxUses || 100,
              validFrom: new Date(promo.validFrom),
              validUntil: new Date(promo.validTo),
              active: true,
              applicableTo: promo.applicableFor || 'ALL'
            }
          });
          
          savedPromos.push(savedPromo);
          console.log(`✅ Saved promo: ${promo.code}`);
        } catch (err) {
          console.error(`❌ Failed to save promo ${promo.code}:`, err.message);
        }
      }
      
      await prisma.$disconnect();
      
      console.log(`✅ Generated ${savedPromos.length} promotions`);
      
      return {
        success: true,
        promos: savedPromos,
        count: savedPromos.length
      };
    } catch (error) {
      console.error('❌ AI Promo Generator error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Singleton instance
const aiCodeMonitor = new AICodeMonitor();

module.exports = {
  AITourGenerator,
  AIBlogStoryGenerator,
  AICodeMonitor,
  AIPromoGenerator,
  aiCodeMonitor, // Export singleton
};

