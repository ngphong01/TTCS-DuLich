// services/aiAgent.js - AI Agent tự động hóa hoàn toàn
const { chatWithGemini } = require('./geminiChatbot');
const prisma = require('../lib/prisma');
const { sendEmail } = require('../lib/email');
const slugify = require('slugify');

/**
 * AI CONTENT MANAGER
 * Tự động tạo và quản lý content cho website
 */
class AIContentManager {
  /**
   * Tự động tạo tour descriptions cho tất cả tours không có mô tả
   */
  async autoGenerateTourDescriptions() {
    try {
      console.log('🤖 AI Agent: Bắt đầu tự động tạo mô tả tour...');
      
      // Tìm các tours không có hoặc có mô tả ngắn
      const tours = await prisma.tour.findMany({
        where: {
          OR: [
            { description: null },
            { description: '' },
            { description: { contains: 'N/A' } },
          ],
        },
        include: {
          destination: true,
        },
        take: 10, // Limit để không overload
      });

      console.log(`📝 Tìm thấy ${tours.length} tours cần tạo mô tả`);

      const results = [];
      for (const tour of tours) {
        try {
          const prompt = `Bạn là TravelGo AI Content Writer. Tạo mô tả chi tiết, hấp dẫn cho tour sau:

Tên tour: ${tour.name}
Điểm đến: ${tour.destination?.name || 'N/A'}
Quốc gia: ${tour.destination?.country || 'Việt Nam'}
Số ngày: ${tour.duration} ngày
Giá: ${tour.price?.toLocaleString('vi-VN')} VNĐ

Yêu cầu:
- Độ dài: 300-500 từ
- Viết bằng tiếng Việt
- Hấp dẫn, chuyên nghiệp
- Chính xác với điểm đến
- Sử dụng emoji phù hợp (1-2 emoji mỗi đoạn)

Chỉ trả về nội dung mô tả, không có tiêu đề.`;

          const description = await chatWithGemini(prompt, []);

          // Update tour với mô tả mới
          await prisma.tour.update({
            where: { id: tour.id },
            data: { description },
          });

          results.push({
            tourId: tour.id,
            tourName: tour.name,
            success: true,
          });

          console.log(`✅ Đã tạo mô tả cho: ${tour.name}`);

          // Delay để tránh rate limit
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`❌ Lỗi khi tạo mô tả cho tour ${tour.id}:`, error.message);
          results.push({
            tourId: tour.id,
            tourName: tour.name,
            success: false,
            error: error.message,
          });
        }
      }

      console.log(`🎉 Hoàn thành: ${results.filter(r => r.success).length}/${results.length} tours`);
      return results;
    } catch (error) {
      console.error('❌ AI Content Manager error:', error);
      throw error;
    }
  }

  /**
   * Tự động tạo blog posts về các điểm đến phổ biến
   */
  async autoGenerateBlogPosts(limit = 5) {
    try {
      console.log('🤖 AI Agent: Bắt đầu tự động tạo blog posts...');

      // Lấy các destination phổ biến (có nhiều bookings)
      const popularDestinations = await prisma.destination.findMany({
        include: {
          _count: {
            select: { bookings: true },
          },
        },
        orderBy: {
          bookings: {
            _count: 'desc',
          },
        },
        take: limit,
      });

      console.log(`📝 Tìm thấy ${popularDestinations.length} điểm đến phổ biến`);

      const results = [];
      for (const dest of popularDestinations) {
        try {
          // Kiểm tra xem đã có blog về destination này chưa
          const existingBlog = await prisma.blog.findFirst({
            where: {
              title: {
                contains: dest.name,
              },
            },
          });

          if (existingBlog) {
            console.log(`⏭️  Đã có blog về ${dest.name}, bỏ qua...`);
            continue;
          }

          const prompt = `Bạn là TravelGo AI Blog Writer chuyên nghiệp.

Viết một bài blog SEO về điểm đến: ${dest.name}
Quốc gia: ${dest.country || 'Việt Nam'}

Yêu cầu:
1. Tiêu đề hấp dẫn (H1)
2. Mở đầu thu hút (150-200 từ)
3. Nội dung chi tiết:
   - Giới thiệu về ${dest.name}
   - Các địa điểm tham quan nổi bật
   - Ẩm thực đặc trưng
   - Kinh nghiệm du lịch
   - Thời điểm du lịch đẹp nhất
4. Kết luận + CTA (call to action)
5. Độ dài: 1000-1500 từ
6. Viết bằng tiếng Việt
7. Format: Markdown với H2, H3, bullet points

Chỉ trả về nội dung blog (Markdown).`;

          const content = await chatWithGemini(prompt, []);

          // Extract title (first H1)
          const titleMatch = content.match(/^#\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1] : `Du lịch ${dest.name} - Trải nghiệm tuyệt vời`;

          // Create slug
          const slug = slugify(title, { lower: true, strict: true });

          // Extract excerpt (first paragraph)
          const excerptMatch = content.match(/\n\n(.+?)\n\n/);
          const excerpt = excerptMatch ? excerptMatch[1].substring(0, 200) : content.substring(0, 200);

          // Create blog
          const blog = await prisma.blog.create({
            data: {
              title,
              slug: `${slug}-${Date.now()}`,
              excerpt,
              content,
              author: 'TravelGo AI Writer',
              category: 'Destinations',
              seoTitle: title,
              seoDescription: excerpt,
              seoKeywords: `${dest.name}, du lịch ${dest.name}, tour ${dest.name}`,
              published: false, // Admin cần review trước khi publish
            },
          });

          results.push({
            blogId: blog.id,
            destination: dest.name,
            title: blog.title,
            success: true,
          });

          console.log(`✅ Đã tạo blog: ${blog.title}`);

          // Delay để tránh rate limit
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          console.error(`❌ Lỗi khi tạo blog cho ${dest.name}:`, error.message);
          results.push({
            destination: dest.name,
            success: false,
            error: error.message,
          });
        }
      }

      console.log(`🎉 Hoàn thành: ${results.filter(r => r.success).length}/${results.length} blog posts`);
      return results;
    } catch (error) {
      console.error('❌ AI Blog Generator error:', error);
      throw error;
    }
  }
}

/**
 * AI REVIEW MODERATOR
 * Tự động kiểm duyệt và phân tích reviews
 */
class AIReviewModerator {
  /**
   * Tự động phê duyệt/từ chối reviews dựa trên AI
   */
  async autoModerateReviews() {
    try {
      console.log('🤖 AI Agent: Bắt đầu kiểm duyệt reviews tự động...');

      // Lấy các reviews chưa được phê duyệt
      const pendingReviews = await prisma.review.findMany({
        where: {
          approved: false,
        },
        include: {
          user: true,
          destination: true,
        },
        take: 20,
      });

      console.log(`📝 Tìm thấy ${pendingReviews.length} reviews cần kiểm duyệt`);

      const results = [];
      for (const review of pendingReviews) {
        try {
          const prompt = `Bạn là TravelGo AI Review Moderator. Phân tích review sau và quyết định có nên phê duyệt không.

User: ${review.user.name}
Destination: ${review.destination.name}
Rating: ${review.rating}/5
Comment: ${review.comment || 'No comment'}

Kiểm tra:
1. Có spam/quảng cáo không?
2. Có từ ngữ tục tĩu/không phù hợp không?
3. Có thông tin sai lệch nghiêm trọng không?
4. Có dấu hiệu fake review không?
5. Nội dung có ý nghĩa và chân thực không?

Trả về JSON:
{
  "shouldApprove": true/false,
  "confidence": 0-100,
  "reason": "Lý do",
  "category": "spam" | "inappropriate" | "fake" | "misleading" | "legitimate",
  "sentiment": "positive" | "neutral" | "negative"
}

Chỉ trả về JSON, không có text thêm.`;

          const aiResponse = await chatWithGemini(prompt, []);

          // Parse JSON
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          let decision;
          if (jsonMatch) {
            decision = JSON.parse(jsonMatch[0]);
          } else {
            // Fallback: auto-approve if AI response is unclear
            decision = {
              shouldApprove: true,
              confidence: 50,
              reason: 'AI không thể phân tích rõ ràng, tự động phê duyệt',
              category: 'legitimate',
              sentiment: 'neutral',
            };
          }

          // Auto-approve nếu confidence cao
          if (decision.shouldApprove && decision.confidence >= 80) {
            await prisma.review.update({
              where: { id: review.id },
              data: { approved: true },
            });

            console.log(`✅ Đã phê duyệt review #${review.id}: ${decision.reason}`);
          } else if (!decision.shouldApprove && decision.confidence >= 90) {
            // Auto-reject nếu rất chắc chắn
            await prisma.review.delete({
              where: { id: review.id },
            });

            console.log(`❌ Đã từ chối review #${review.id}: ${decision.reason}`);
          } else {
            // Để admin review thủ công
            console.log(`⏸️  Review #${review.id} cần admin xem xét: ${decision.reason}`);
          }

          results.push({
            reviewId: review.id,
            decision,
            action: decision.shouldApprove && decision.confidence >= 80 ? 'approved' : 
                    !decision.shouldApprove && decision.confidence >= 90 ? 'rejected' : 
                    'pending_manual_review',
          });

          // Delay
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`❌ Lỗi khi kiểm duyệt review ${review.id}:`, error.message);
          results.push({
            reviewId: review.id,
            success: false,
            error: error.message,
          });
        }
      }

      console.log(`🎉 Hoàn thành kiểm duyệt: ${results.length} reviews`);
      return results;
    } catch (error) {
      console.error('❌ AI Review Moderator error:', error);
      throw error;
    }
  }

  /**
   * Tự động phản hồi reviews (response from business)
   */
  async autoRespondToReviews() {
    try {
      console.log('🤖 AI Agent: Bắt đầu tự động phản hồi reviews...');

      // Lấy các reviews đã approved nhưng chưa có phản hồi
      const reviews = await prisma.review.findMany({
        where: {
          approved: true,
          // Thêm field responseText nếu cần
        },
        include: {
          user: true,
          destination: true,
        },
        take: 10,
      });

      console.log(`📝 Tìm thấy ${reviews.length} reviews cần phản hồi`);

      const results = [];
      for (const review of reviews) {
        try {
          const prompt = `Bạn là TravelGo Customer Service AI. Viết phản hồi chuyên nghiệp cho review sau:

User: ${review.user.name}
Destination: ${review.destination.name}
Rating: ${review.rating}/5
Comment: ${review.comment || 'No comment'}

Yêu cầu:
1. Nếu rating 4-5 sao: Cảm ơn, khuyến khích tiếp tục sử dụng dịch vụ
2. Nếu rating 3 sao: Cảm ơn, hứa cải thiện điểm yếu
3. Nếu rating 1-2 sao: Xin lỗi chân thành, hứa khắc phục, mời liên hệ để hỗ trợ
4. Độ dài: 50-150 từ
5. Viết bằng tiếng Việt
6. Chuyên nghiệp, thân thiện, chân thành

Chỉ trả về nội dung phản hồi, không có giải thích thêm.`;

          const response = await chatWithGemini(prompt, []);

          // TODO: Lưu phản hồi vào database (cần thêm field responseText vào model Review)
          // await prisma.review.update({
          //   where: { id: review.id },
          //   data: { responseText: response, respondedAt: new Date() },
          // });

          console.log(`✅ Đã tạo phản hồi cho review #${review.id}`);

          results.push({
            reviewId: review.id,
            response,
            success: true,
          });

          // Delay
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`❌ Lỗi khi phản hồi review ${review.id}:`, error.message);
          results.push({
            reviewId: review.id,
            success: false,
            error: error.message,
          });
        }
      }

      console.log(`🎉 Hoàn thành phản hồi: ${results.filter(r => r.success).length}/${results.length} reviews`);
      return results;
    } catch (error) {
      console.error('❌ AI Review Responder error:', error);
      throw error;
    }
  }
}

/**
 * AI DYNAMIC PRICING ENGINE
 * Tự động điều chỉnh giá dựa trên AI
 */
class AIDynamicPricing {
  /**
   * Tự động điều chỉnh giá tour theo mùa và demand
   */
  async autoAdjustTourPricing() {
    try {
      console.log('🤖 AI Agent: Bắt đầu điều chỉnh giá tự động...');

      const tours = await prisma.tour.findMany({
        include: {
          destination: true,
          bookings: {
            where: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            },
          },
        },
      });

      console.log(`📝 Phân tích ${tours.length} tours...`);

      const results = [];
      for (const tour of tours) {
        try {
          const currentMonth = new Date().getMonth() + 1;
          const bookingCount = tour.bookings.length;
          const currentPrice = tour.price || 0;

          const prompt = `Bạn là TravelGo AI Pricing Strategist. Phân tích và đề xuất giá cho tour:

Tour: ${tour.name}
Destination: ${tour.destination?.name || 'N/A'}
Giá hiện tại: ${currentPrice.toLocaleString('vi-VN')} VNĐ
Số booking 30 ngày qua: ${bookingCount}
Tháng hiện tại: Tháng ${currentMonth}
Duration: ${tour.duration} ngày

Phân tích:
1. Đây có phải mùa cao điểm cho ${tour.destination?.name} không?
2. Booking count có cao không?
3. Nên tăng/giảm/giữ nguyên giá?
4. Tỷ lệ điều chỉnh phù hợp?

Trả về JSON:
{
  "action": "increase" | "decrease" | "maintain",
  "percentage": 0-30,
  "suggestedPrice": số tiền mới,
  "reason": "Lý do chi tiết",
  "confidence": 0-100
}

Chỉ trả về JSON.`;

          const aiResponse = await chatWithGemini(prompt, []);

          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          let pricing;
          if (jsonMatch) {
            pricing = JSON.parse(jsonMatch[0]);
          } else {
            pricing = {
              action: 'maintain',
              percentage: 0,
              suggestedPrice: currentPrice,
              reason: 'Không thể phân tích',
              confidence: 0,
            };
          }

          // Auto-apply nếu confidence cao và thay đổi không quá 20%
          if (pricing.confidence >= 85 && pricing.percentage <= 20) {
            await prisma.tour.update({
              where: { id: tour.id },
              data: {
                price: pricing.suggestedPrice,
                originalPrice: currentPrice, // Lưu giá gốc
              },
            });

            console.log(`✅ Đã điều chỉnh giá tour ${tour.name}: ${currentPrice.toLocaleString()} → ${pricing.suggestedPrice.toLocaleString()} VNĐ (${pricing.action} ${pricing.percentage}%)`);
          } else {
            console.log(`⏸️  Tour ${tour.name} cần admin xem xét: ${pricing.reason}`);
          }

          results.push({
            tourId: tour.id,
            tourName: tour.name,
            pricing,
            applied: pricing.confidence >= 85 && pricing.percentage <= 20,
          });

          // Delay
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`❌ Lỗi khi điều chỉnh giá tour ${tour.id}:`, error.message);
          results.push({
            tourId: tour.id,
            success: false,
            error: error.message,
          });
        }
      }

      console.log(`🎉 Hoàn thành điều chỉnh giá: ${results.length} tours`);
      return results;
    } catch (error) {
      console.error('❌ AI Dynamic Pricing error:', error);
      throw error;
    }
  }
}

/**
 * AI CUSTOMER SUPPORT AUTOMATION
 * Tự động hỗ trợ khách hàng
 */
class AICustomerSupport {
  /**
   * Tự động trả lời support tickets
   */
  async autoRespondToTickets() {
    try {
      console.log('🤖 AI Agent: Bắt đầu xử lý support tickets...');

      const tickets = await prisma.supportTicket.findMany({
        where: {
          status: 'open',
        },
        take: 10,
      });

      console.log(`📝 Tìm thấy ${tickets.length} tickets cần xử lý`);

      const results = [];
      for (const ticket of tickets) {
        try {
          const prompt = `Bạn là TravelGo AI Customer Support Agent. Trả lời support ticket sau:

Subject: ${ticket.subject}
Message: ${ticket.message}
From: ${ticket.userEmail}

Yêu cầu:
1. Phân tích vấn đề của khách hàng
2. Đưa ra giải pháp cụ thể
3. Nếu không giải quyết được → gợi ý liên hệ hotline
4. Viết bằng tiếng Việt
5. Chuyên nghiệp, thân thiện
6. Độ dài: 150-300 từ

Trả về JSON:
{
  "response": "Nội dung trả lời",
  "category": "booking" | "payment" | "refund" | "general" | "complaint",
  "canAutoClose": true/false,
  "priority": "low" | "medium" | "high",
  "confidence": 0-100
}

Chỉ trả về JSON.`;

          const aiResponse = await chatWithGemini(prompt, []);

          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          let ticketData;
          if (jsonMatch) {
            ticketData = JSON.parse(jsonMatch[0]);
          } else {
            ticketData = {
              response: 'Xin lỗi, tôi không thể xử lý ticket này. Vui lòng liên hệ hotline 0868156027.',
              category: 'general',
              canAutoClose: false,
              priority: 'medium',
              confidence: 0,
            };
          }

          // Auto-send email response nếu confidence cao
          if (ticketData.confidence >= 80) {
            try {
              await sendEmail(
                ticket.userEmail,
                `Re: ${ticket.subject}`,
                ticketData.response
              );

              // Update ticket status
              if (ticketData.canAutoClose) {
                await prisma.supportTicket.update({
                  where: { id: ticket.id },
                  data: { status: 'closed' },
                });
              }

              console.log(`✅ Đã trả lời ticket #${ticket.id} tự động`);
            } catch (emailError) {
              console.error(`❌ Lỗi gửi email cho ticket ${ticket.id}:`, emailError.message);
            }
          } else {
            console.log(`⏸️  Ticket #${ticket.id} cần staff xử lý: Priority ${ticketData.priority}`);
          }

          results.push({
            ticketId: ticket.id,
            ticketData,
            handled: ticketData.confidence >= 80,
          });

          // Delay
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`❌ Lỗi khi xử lý ticket ${ticket.id}:`, error.message);
          results.push({
            ticketId: ticket.id,
            success: false,
            error: error.message,
          });
        }
      }

      console.log(`🎉 Hoàn thành xử lý tickets: ${results.filter(r => r.handled).length}/${results.length} tickets`);
      return results;
    } catch (error) {
      console.error('❌ AI Customer Support error:', error);
      throw error;
    }
  }
}

// Export các classes
module.exports = {
  AIContentManager,
  AIReviewModerator,
  AIDynamicPricing,
  AICustomerSupport,
};

