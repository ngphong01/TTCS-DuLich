// routes/ai.js - AI endpoints for admin features
const express = require('express');
const router = express.Router();
const { authRequired, isAdmin } = require('../middleware/auth');
const { chatWithGemini } = require('../services/geminiChatbot');
const prisma = require('../lib/prisma');
const { aiLimiter } = require('../middleware/rateLimit');

// POST /api/ai/generate-tour-description - Generate tour description using AI
// Tự động nhận biết điểm đến trong/ngoài nước và mô tả chính xác
router.post('/generate-tour-description', authRequired, isAdmin, aiLimiter, async (req, res) => {
  try {
    const { tourName, days, locations, price, destination, country } = req.body;

    // Xác định điểm đến chính
    const mainDestination = destination || tourName || '';
    
    if (!mainDestination) {
      return res.status(400).json({ message: 'Tour name or destination is required' });
    }

    // Prompt thông minh để AI tự nhận biết trong/ngoài nước
    const prompt = `Bạn là TravelGo AI Writer - chuyên gia viết mô tả tour du lịch chuyên nghiệp.

THÔNG TIN TOUR:
- Tên tour/Điểm đến: ${mainDestination}
${country ? `- Quốc gia: ${country}` : ''}
${days ? `- Số ngày: ${days} ngày` : ''}
${locations ? `- Địa điểm: ${Array.isArray(locations) ? locations.join(', ') : locations}` : ''}
${price ? `- Giá tham khảo: ${price.toLocaleString('vi-VN')} VNĐ` : ''}

YÊU CẦU QUAN TRỌNG:

1. PHÂN BIỆT TRONG/NGOÀI NƯỚC:
   - Dựa vào tên "${mainDestination}" → Tự động xác định đây là điểm đến VIỆT NAM hay QUỐC TẾ
   - Nếu là Việt Nam: viết theo văn phong du lịch trong nước, nhấn mạnh văn hóa, ẩm thực, cảnh quan Việt Nam
   - Nếu là quốc tế: mô tả theo văn hóa, cảnh quan và trải nghiệm đặc trưng của QUỐC GIA đó
   - Tự động suy ra quốc gia từ tên điểm đến (ví dụ: Tokyo → Nhật Bản, Paris → Pháp, Bangkok → Thái Lan)

2. ĐỘ CHÍNH XÁC 100%:
   - Nghiên cứu thông tin THẬT về "${mainDestination}"
   - KHÔNG được bịa đặt địa danh, hoạt động hoặc thông tin không tồn tại
   - Nêu đúng đất nước, khu vực địa lý
   - Chỉ đề cập đến địa điểm, hoạt động, ẩm thực THỰC SỰ TỒN TẠI
   - Nếu không chắc chắn → viết tổng quan, tránh chi tiết cụ thể

3. NỘI DUNG MÔ TẢ:
   - Mô tả tổng quan về điểm đến (vị trí địa lý, quốc gia)
   - Các điểm nổi bật, địa danh nổi tiếng (chỉ nêu địa danh thật, có thật)
   - Ẩm thực đặc trưng của vùng/quốc gia (món ăn thực tế)
   - Trải nghiệm du lịch phổ biến và thực tế
   - Thời điểm du lịch đẹp nhất (theo mùa, khí hậu thực tế)
   - Đối tượng phù hợp (gia đình, cặp đôi, phượt thủ, người cao tuổi...)
   ${days ? `- Lịch trình gợi ý cho ${days} ngày (nếu có)` : ''}

4. PHONG CÁCH VIẾT THEO VÙNG:
   - Châu Á (Thái Lan, Nhật, Hàn, Singapore...): nhấn mạnh văn hóa, ẩm thực đặc sắc, giá trị tốt
   - Châu Âu (Pháp, Ý, Anh...): nhấn mạnh lịch sử, kiến trúc, nghệ thuật
   - Châu Mỹ (Mỹ, Canada...): nhấn mạnh đa dạng, hiện đại, tự nhiên
   - Việt Nam: nhấn mạnh vẻ đẹp tự nhiên, văn hóa truyền thống, ẩm thực phong phú

5. PHONG CÁCH VIẾT:
   - Giọng văn thân thiện, chuyên nghiệp theo phong cách TravelGo
   - Viết bằng tiếng Việt
   - Độ dài: 400-600 từ
   - Sử dụng emoji phù hợp (1-2 emoji mỗi đoạn)
   - Khuyến khích người dùng đặt tour

VÍ DỤ CHÍNH XÁC:
- "Tokyo" → Mô tả Nhật Bản: Shibuya, Asakusa, Tokyo Skytree, sushi, ramen, mùa hoa anh đào (tháng 3-4), mùa lá vàng (tháng 11)
- "Đà Lạt" → Mô tả Việt Nam: hồ Xuân Hương, thác Datanla, rau củ Đà Lạt, mùa hoa dã quỳ (tháng 10-11)
- "Paris" → Mô tả Pháp: tháp Eiffel, bảo tàng Louvre, ẩm thực Pháp, mùa xuân (tháng 4-6)
- "Bangkok" → Mô tả Thái Lan: Wat Pho, Chatuchak Market, pad thai, mùa khô (tháng 11-3)
- "Thanh Hóa" → Mô tả Việt Nam: bãi biển Sầm Sơn, thành Nhà Hồ, suối cá thần Cẩm Lương, mùa hè (tháng 5-8)

Hãy viết mô tả chi tiết, chính xác và hấp dẫn cho tour này. Chỉ trả về nội dung mô tả, không cần tiêu đề hay giải thích thêm.`;

    const aiResponse = await chatWithGemini(prompt, []);

    res.json({
      success: true,
      content: aiResponse,
    });
  } catch (error) {
    console.error('Error generating tour description:', error);
    
    // Check if it's a user-friendly error
    const message = error.userFriendly 
      ? error.message 
      : (error.message || 'Failed to generate tour description');
    
    res.status(500).json({
      success: false,
      message: message,
      retry: error.status === 503, // Suggest retry for 503 errors
    });
  }
});

// POST /api/ai/analyze-revenue - Analyze revenue data using AI
router.post('/analyze-revenue', authRequired, isAdmin, aiLimiter, async (req, res) => {
  try {
    const { revenue, growth, bookings, popularTours, period } = req.body;

    if (revenue === undefined) {
      return res.status(400).json({ message: 'Revenue data is required' });
    }

    const prompt = `Bạn là chuyên gia phân tích dữ liệu doanh thu cho công ty du lịch TravelGo.

Hãy phân tích và đưa ra insights về doanh thu với các thông tin sau:
- Doanh thu: ${revenue.toLocaleString('vi-VN')} VNĐ
${growth !== undefined ? `- Tăng trưởng: ${growth > 0 ? '+' : ''}${growth}%` : ''}
${bookings !== undefined ? `- Số đơn đặt chỗ: ${bookings}` : ''}
${popularTours !== undefined ? `- Tour phổ biến nhất: ID ${popularTours}` : ''}
${period ? `- Kỳ phân tích: ${period}` : ''}

Yêu cầu:
1. Phân tích xu hướng doanh thu (tăng/giảm, nguyên nhân có thể)
2. Đánh giá hiệu suất (tốt/khá/cần cải thiện)
3. Đưa ra 3-5 khuyến nghị cụ thể để cải thiện doanh thu
4. So sánh với kỳ trước (nếu có dữ liệu tăng trưởng)
5. Viết bằng tiếng Việt, chuyên nghiệp như một data analyst

Format: Markdown với các heading và bullet points.`;

    const aiResponse = await chatWithGemini(prompt, []);

    res.json({
      success: true,
      analysis: aiResponse,
    });
  } catch (error) {
    console.error('Error analyzing revenue:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze revenue',
    });
  }
});

// POST /api/ai/smart-search - Smart search using natural language
router.post('/smart-search', authRequired, isAdmin, aiLimiter, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Get all tours and destinations for context
    const tours = await prisma.tour.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        duration: true,
        destination: {
          select: {
            id: true,
            name: true,
            country: true,
          },
        },
      },
    });

    const destinations = await prisma.destination.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
        price: true,
      },
    });

    const prompt = `Bạn là hệ thống tìm kiếm thông minh cho admin TravelGo.

Người dùng nhập câu hỏi: "${query}"

Dữ liệu có sẵn:
Tours:
${tours.map(t => `- ID ${t.id}: ${t.name} (${t.duration} ngày, ${t.price?.toLocaleString('vi-VN')} VNĐ, ${t.destination?.name || 'N/A'})`).join('\n')}

Destinations:
${destinations.map(d => `- ID ${d.id}: ${d.name} (${d.country}, ${d.price?.toLocaleString('vi-VN')} VNĐ)`).join('\n')}

Hãy phân tích câu hỏi và trả về JSON với format sau:
{
  "type": "tour" | "destination" | "both",
  "filters": {
    "name": "từ khóa tìm kiếm trong tên",
    "location": "địa điểm",
    "maxPrice": số tiền tối đa (nếu có),
    "minPrice": số tiền tối thiểu (nếu có),
    "duration": số ngày (nếu có),
    "status": "PENDING" | "CONFIRMED" | "CANCELLED" (nếu tìm booking)
  },
  "explanation": "Giải thích ngắn gọn về cách bạn hiểu câu hỏi"
}

Chỉ trả về JSON, không có text thêm.`;

    const aiResponse = await chatWithGemini(prompt, []);
    
    // Try to parse JSON from response
    let filterData;
    try {
      // Extract JSON from response (might have markdown code blocks)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        filterData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback: create basic filter from query
      filterData = {
        type: 'both',
        filters: {
          name: query,
        },
        explanation: 'Không thể phân tích câu hỏi phức tạp, sử dụng tìm kiếm cơ bản',
      };
    }

    res.json({
      success: true,
      filter: filterData,
    });
  } catch (error) {
    console.error('Error in smart search:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process smart search',
    });
  }
});

// POST /api/ai/analyze-bookings - Analyze booking patterns and provide insights
router.post('/analyze-bookings', authRequired, isAdmin, aiLimiter, async (req, res) => {
  try {
    const { total, pending, confirmed, revenue, popularDestinations } = req.body;

    if (total === undefined) {
      return res.status(400).json({ message: 'Booking data is required' });
    }

    const prompt = `Bạn là chuyên gia phân tích booking cho công ty du lịch TravelGo.

Hãy phân tích và đưa ra insights về booking với các thông tin sau:
- Tổng số booking: ${total}
- Đang chờ xác nhận: ${pending}
- Đã xác nhận: ${confirmed}
- Tổng doanh thu: ${revenue ? revenue.toLocaleString('vi-VN') + ' VNĐ' : 'N/A'}
- Điểm đến phổ biến: ${JSON.stringify(popularDestinations)}

Yêu cầu:
1. Phân tích xu hướng booking (tăng/giảm, nguyên nhân có thể)
2. Đánh giá tỷ lệ xác nhận (pending vs confirmed)
3. Đưa ra 3-5 khuyến nghị cụ thể để cải thiện booking rate
4. Phân tích điểm đến phổ biến và gợi ý marketing
5. Đưa ra chiến lược để giảm booking pending
6. Viết bằng tiếng Việt, chuyên nghiệp như một data analyst

Format: Markdown với các heading và bullet points.`;

    const aiResponse = await chatWithGemini(prompt, []);

    res.json({
      success: true,
      analysis: aiResponse,
    });
  } catch (error) {
    console.error('Error analyzing bookings:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze bookings',
    });
  }
});

// POST /api/ai/analyze-reviews - Analyze review sentiment and provide insights
router.post('/analyze-reviews', authRequired, isAdmin, aiLimiter, async (req, res) => {
  try {
    const { total, averageRating, reviews } = req.body;

    if (total === undefined) {
      return res.status(400).json({ message: 'Review data is required' });
    }

    // Tóm tắt reviews để gửi cho AI
    const reviewSummary = reviews.slice(0, 20).map((r) => ({
      rating: r.rating,
      comment: r.comment?.substring(0, 200) || '', // Giới hạn độ dài
      destination: r.destination,
    }));

    const prompt = `Bạn là chuyên gia phân tích đánh giá (review) cho công ty du lịch TravelGo.

Hãy phân tích và đưa ra insights về đánh giá với các thông tin sau:
- Tổng số đánh giá: ${total}
- Điểm trung bình: ${averageRating.toFixed(1)}/5.0
- Mẫu đánh giá: ${JSON.stringify(reviewSummary)}

Yêu cầu:
1. Phân tích sentiment (tích cực/tiêu cực/trung tính) từ các comment
2. Xác định các điểm mạnh và điểm yếu được đề cập nhiều nhất
3. Đưa ra 3-5 khuyến nghị cụ thể để cải thiện chất lượng dịch vụ
4. Phân tích từ khóa phổ biến trong reviews
5. Gợi ý cách phản hồi các review tiêu cực
6. Viết bằng tiếng Việt, chuyên nghiệp

Format: Markdown với các heading và bullet points.`;

    const aiResponse = await chatWithGemini(prompt, []);

    res.json({
      success: true,
      analysis: aiResponse,
    });
  } catch (error) {
    console.error('Error analyzing reviews:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze reviews',
    });
  }
});

// POST /api/ai/analyze-users - Analyze user behavior and provide insights
router.post('/analyze-users', authRequired, isAdmin, aiLimiter, async (req, res) => {
  try {
    const { total, newThisMonth, users } = req.body;

    if (total === undefined) {
      return res.status(400).json({ message: 'User data is required' });
    }

    const prompt = `Bạn là chuyên gia phân tích người dùng cho công ty du lịch TravelGo.

Hãy phân tích và đưa ra insights về người dùng với các thông tin sau:
- Tổng số người dùng: ${total}
- Người dùng mới tháng này: ${newThisMonth}
- Mẫu dữ liệu: ${JSON.stringify(users.slice(0, 20))}

Yêu cầu:
1. Phân tích xu hướng tăng trưởng người dùng
2. Đánh giá tỷ lệ người dùng mới
3. Đưa ra 3-5 khuyến nghị cụ thể để tăng trưởng user base
4. Gợi ý chiến lược retention (giữ chân người dùng)
5. Phân tích phân khúc người dùng (nếu có dữ liệu)
6. Viết bằng tiếng Việt, chuyên nghiệp

Format: Markdown với các heading và bullet points.`;

    const aiResponse = await chatWithGemini(prompt, []);

    res.json({
      success: true,
      analysis: aiResponse,
    });
  } catch (error) {
    console.error('Error analyzing users:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze users',
    });
  }
});

// POST /api/ai/analyze-payments - Analyze payment trends and provide insights
router.post('/analyze-payments', authRequired, isAdmin, aiLimiter, async (req, res) => {
  try {
    const { total, revenue, successful, failed, successRate, payments } = req.body;

    if (total === undefined) {
      return res.status(400).json({ message: 'Payment data is required' });
    }

    const prompt = `Bạn là chuyên gia phân tích thanh toán cho công ty du lịch TravelGo.

Hãy phân tích và đưa ra insights về thanh toán với các thông tin sau:
- Tổng số giao dịch: ${total}
- Tổng doanh thu: ${revenue ? revenue.toLocaleString('vi-VN') + ' VNĐ' : 'N/A'}
- Thành công: ${successful}
- Thất bại: ${failed}
- Tỷ lệ thành công: ${successRate.toFixed(1)}%
- Mẫu giao dịch: ${JSON.stringify(payments.slice(0, 20))}

Yêu cầu:
1. Phân tích xu hướng thanh toán (tăng/giảm, nguyên nhân)
2. Đánh giá tỷ lệ thành công/thất bại
3. Đưa ra 3-5 khuyến nghị cụ thể để cải thiện tỷ lệ thành công
4. Phân tích phương thức thanh toán phổ biến
5. Gợi ý cách giảm tỷ lệ thất bại
6. Viết bằng tiếng Việt, chuyên nghiệp

Format: Markdown với các heading và bullet points.`;

    const aiResponse = await chatWithGemini(prompt, []);

    res.json({
      success: true,
      analysis: aiResponse,
    });
  } catch (error) {
    console.error('Error analyzing payments:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze payments',
    });
  }
});

// POST /api/ai/generate-itinerary - Generate itinerary (3N2Đ, 4N3Đ, etc.)
router.post('/generate-itinerary', authRequired, isAdmin, aiLimiter, async (req, res) => {
  try {
    const { destination, days, nights, tourType, budget, interests } = req.body;

    if (!destination || !days) {
      return res.status(400).json({ message: 'Destination and days are required' });
    }

    const prompt = `Bạn là TravelGo AI Itinerary Planner - chuyên gia tạo lịch trình du lịch chi tiết.

THÔNG TIN YÊU CẦU:
- Điểm đến: ${destination}
- Số ngày: ${days} ngày
${nights ? `- Số đêm: ${nights} đêm` : ''}
${tourType ? `- Loại tour: ${tourType}` : ''}
${budget ? `- Ngân sách: ${budget}` : ''}
${interests ? `- Sở thích: ${Array.isArray(interests) ? interests.join(', ') : interests}` : ''}

YÊU CẦU:
1. Tạo lịch trình chi tiết theo từng ngày (Day 1, Day 2, ...)
2. Mỗi ngày bao gồm:
   - Buổi sáng: Địa điểm, hoạt động cụ thể
   - Buổi trưa: Nhà hàng/ăn uống gợi ý
   - Buổi chiều: Địa điểm, hoạt động cụ thể
   - Buổi tối: Địa điểm, hoạt động cụ thể
3. Chỉ đề cập địa điểm THỰC SỰ TỒN TẠI tại ${destination}
4. Gợi ý thời gian di chuyển hợp lý giữa các địa điểm
5. Phù hợp với ngân sách và sở thích (nếu có)
6. Viết bằng tiếng Việt, chuyên nghiệp

Format JSON:
{
  "itinerary": [
    {
      "day": 1,
      "title": "Tiêu đề ngày 1",
      "activities": [
        {
          "time": "Sáng",
          "title": "Tên hoạt động",
          "location": "Địa điểm",
          "description": "Mô tả chi tiết",
          "duration": "Thời gian",
          "cost": "Chi phí (nếu có)"
        }
      ]
    }
  ],
  "summary": "Tóm tắt lịch trình",
  "tips": ["Mẹo 1", "Mẹo 2"]
}

Chỉ trả về JSON, không có text thêm.`;

    const aiResponse = await chatWithGemini(prompt, []);
    
    // Try to parse JSON from response
    let itineraryData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        itineraryData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to parse itinerary from AI response',
        raw: aiResponse,
      });
    }

    res.json({
      success: true,
      itinerary: itineraryData,
    });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate itinerary',
    });
  }
});

// POST /api/ai/generate-review - AI Review Assistant - Tạo review mẫu
router.post('/generate-review', authRequired, aiLimiter, async (req, res) => {
  try {
    const { tourName, destination, rating, experience, highlights, improvements } = req.body;

    if (!tourName || !rating) {
      return res.status(400).json({ message: 'Tour name and rating are required' });
    }

    const prompt = `Bạn là TravelGo AI Review Assistant - chuyên gia tạo đánh giá tour du lịch chuyên nghiệp.

THÔNG TIN TOUR:
- Tên tour: ${tourName}
${destination ? `- Điểm đến: ${destination}` : ''}
- Đánh giá: ${rating}/5 sao
${experience ? `- Trải nghiệm: ${experience}` : ''}
${highlights ? `- Điểm nổi bật: ${Array.isArray(highlights) ? highlights.join(', ') : highlights}` : ''}
${improvements ? `- Cần cải thiện: ${Array.isArray(improvements) ? improvements.join(', ') : improvements}` : ''}

YÊU CẦU:
1. Tạo một review mẫu chuyên nghiệp, tự nhiên như người dùng thật viết
2. Độ dài: 150-300 từ
3. Phù hợp với rating (${rating}/5 sao)
4. Nếu rating cao (4-5): nhấn mạnh điểm tốt, khuyến khích người khác thử
5. Nếu rating trung bình (3): cân bằng ưu/nhược điểm
6. Nếu rating thấp (1-2): nêu rõ vấn đề, gợi ý cải thiện
7. Viết bằng tiếng Việt, giọng văn thân thiện, chân thật
8. Không quá marketing, giữ tính tự nhiên

Chỉ trả về nội dung review, không có tiêu đề hay giải thích thêm.`;

    const aiResponse = await chatWithGemini(prompt, []);

    res.json({
      success: true,
      review: aiResponse,
    });
  } catch (error) {
    console.error('Error generating review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate review',
    });
  }
});

// POST /api/ai/suggest-tours-by-budget - AI Gợi ý tour theo ngân sách
router.post('/suggest-tours-by-budget', aiLimiter, async (req, res) => {
  try {
    const { budget, duration, destination, interests } = req.body;

    if (!budget) {
      return res.status(400).json({ message: 'Budget is required' });
    }

    // Get available tours
    const tours = await prisma.tour.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        adultPrice: true,
        childPrice: true,
        duration: true,
        rating: true,
        destination: {
          select: {
            name: true,
            country: true,
          },
        },
      },
    });

    const prompt = `Bạn là TravelGo AI Tour Recommender - chuyên gia gợi ý tour theo ngân sách.

YÊU CẦU KHÁCH HÀNG:
- Ngân sách: ${budget.toLocaleString('vi-VN')} VNĐ
${duration ? `- Số ngày mong muốn: ${duration} ngày` : ''}
${destination ? `- Điểm đến mong muốn: ${destination}` : ''}
${interests ? `- Sở thích: ${Array.isArray(interests) ? interests.join(', ') : interests}` : ''}

TOURS CÓ SẴN:
${tours.map(t => {
  const price = t.adultPrice || t.price || 0;
  return `- ID ${t.id}: ${t.name} (${t.duration} ngày, ${price.toLocaleString('vi-VN')} VNĐ, ${t.destination?.name || 'N/A'}, ${t.rating}/5 sao)`;
}).join('\n')}

YÊU CẦU:
1. Phân tích ngân sách và gợi ý 3-5 tours phù hợp nhất
2. Ưu tiên tours có giá trong ngân sách hoặc gần ngân sách
3. Xem xét duration và destination nếu có
4. Xem xét interests nếu có
5. Sắp xếp theo độ phù hợp (từ phù hợp nhất đến ít phù hợp hơn)
6. Mỗi gợi ý kèm lý do tại sao phù hợp

Format JSON:
{
  "suggestions": [
    {
      "tourId": 1,
      "tourName": "Tên tour",
      "price": 1000000,
      "matchScore": 95,
      "reasons": ["Lý do 1", "Lý do 2"],
      "budgetStatus": "within" | "slightly_over" | "under"
    }
  ],
  "summary": "Tóm tắt gợi ý",
  "tips": ["Mẹo tiết kiệm", "Mẹo 2"]
}

Chỉ trả về JSON, không có text thêm.`;

    const aiResponse = await chatWithGemini(prompt, []);
    
    let suggestions;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback: filter tours by budget manually
      const filteredTours = tours
        .filter(t => {
          const price = t.adultPrice || t.price || 0;
          return price <= budget * 1.2; // Allow 20% over budget
        })
        .sort((a, b) => {
          const priceA = a.adultPrice || a.price || 0;
          const priceB = b.adultPrice || b.price || 0;
          return Math.abs(priceA - budget) - Math.abs(priceB - budget);
        })
        .slice(0, 5)
        .map(t => ({
          tourId: t.id,
          tourName: t.name,
          price: t.adultPrice || t.price || 0,
          matchScore: 80,
          reasons: [`Phù hợp ngân sách`, `Tour ${t.duration} ngày`],
          budgetStatus: (t.adultPrice || t.price || 0) <= budget ? 'within' : 'slightly_over',
        }));

      suggestions = {
        suggestions: filteredTours,
        summary: `Tìm thấy ${filteredTours.length} tour phù hợp với ngân sách của bạn`,
        tips: ['Có thể đặt sớm để nhận ưu đãi', 'Xem xét tour combo để tiết kiệm'],
      };
    }

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error('Error suggesting tours by budget:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to suggest tours',
    });
  }
});

// POST /api/ai/generate-blog - AI Tạo blog SEO tự động
router.post('/generate-blog', authRequired, isAdmin, aiLimiter, async (req, res) => {
  try {
    const { topic, destination, keywords, targetAudience, length } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const prompt = `Bạn là TravelGo AI Blog Writer - chuyên gia viết blog du lịch SEO chuyên nghiệp.

YÊU CẦU:
- Chủ đề: ${topic}
${destination ? `- Điểm đến: ${destination}` : ''}
${keywords ? `- Từ khóa SEO: ${Array.isArray(keywords) ? keywords.join(', ') : keywords}` : ''}
${targetAudience ? `- Đối tượng: ${targetAudience}` : ''}
${length ? `- Độ dài: ${length} từ` : 'Độ dài: 800-1200 từ'}

YÊU CẦU NỘI DUNG:
1. Viết blog du lịch chuyên nghiệp, hấp dẫn
2. Tối ưu SEO: tích hợp từ khóa tự nhiên
3. Cấu trúc rõ ràng: H1, H2, H3, bullet points
4. Nội dung giá trị: thông tin thực tế, mẹo hữu ích
5. Call-to-action: khuyến khích đặt tour
6. Viết bằng tiếng Việt, giọng văn thân thiện

Format Markdown với:
- Tiêu đề H1
- Mở đầu hấp dẫn
- Các phần H2, H3
- Bullet points, numbered lists
- Kết luận + CTA

Chỉ trả về nội dung blog (Markdown), không có giải thích thêm.`;

    const aiResponse = await chatWithGemini(prompt, []);

    // Extract SEO metadata
    const seoTitle = topic;
    const seoDescription = aiResponse.substring(0, 160).replace(/\n/g, ' ').trim();
    const seoKeywords = keywords || topic;

    res.json({
      success: true,
      content: aiResponse,
      seo: {
        title: seoTitle,
        description: seoDescription,
        keywords: seoKeywords,
      },
    });
  } catch (error) {
    console.error('Error generating blog:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate blog',
    });
  }
});

// POST /api/ai/predict-peak-season - AI Dự đoán mùa cao điểm
router.post('/predict-peak-season', authRequired, isAdmin, aiLimiter, async (req, res) => {
  try {
    const { destination, country, historicalBookings } = req.body;

    if (!destination) {
      return res.status(400).json({ message: 'Destination is required' });
    }

    // Get booking data if not provided
    let bookings = historicalBookings;
    if (!bookings) {
      const destinationData = await prisma.destination.findFirst({
        where: {
          OR: [
            { name: { contains: destination, mode: 'insensitive' } },
            { slug: destination },
          ],
        },
        include: {
          bookings: {
            select: {
              createdAt: true,
              status: true,
            },
          },
        },
      });

      if (destinationData) {
        bookings = destinationData.bookings;
      }
    }

    const prompt = `Bạn là TravelGo AI Peak Season Predictor - chuyên gia dự đoán mùa cao điểm du lịch.

THÔNG TIN:
- Điểm đến: ${destination}
${country ? `- Quốc gia: ${country}` : ''}
${bookings ? `- Dữ liệu booking lịch sử: ${JSON.stringify(bookings.slice(0, 50))}` : ''}

YÊU CẦU:
1. Phân tích mùa cao điểm dựa trên:
   - Khí hậu, thời tiết của ${destination}
   - Lễ hội, sự kiện đặc biệt
   - Dữ liệu booking lịch sử (nếu có)
   - Xu hướng du lịch theo mùa
2. Xác định các tháng cao điểm (peak season)
3. Xác định các tháng thấp điểm (low season)
4. Đưa ra lý do tại sao
5. Gợi ý chiến lược giá và marketing cho từng mùa

Format JSON:
{
  "destination": "${destination}",
  "peakSeason": {
    "months": [1, 2, 3],
    "reason": "Lý do",
    "recommendations": ["Gợi ý 1", "Gợi ý 2"]
  },
  "lowSeason": {
    "months": [6, 7, 8],
    "reason": "Lý do",
    "recommendations": ["Gợi ý 1", "Gợi ý 2"]
  },
  "shoulderSeason": {
    "months": [4, 5],
    "reason": "Lý do"
  },
  "summary": "Tóm tắt",
  "pricingStrategy": {
    "peak": "Tăng giá 20-30%",
    "low": "Giảm giá 15-25%",
    "shoulder": "Giá bình thường"
  }
}

Chỉ trả về JSON, không có text thêm.`;

    const aiResponse = await chatWithGemini(prompt, []);
    
    let prediction;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prediction = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to parse prediction from AI response',
        raw: aiResponse,
      });
    }

    res.json({
      success: true,
      prediction,
    });
  } catch (error) {
    console.error('Error predicting peak season:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to predict peak season',
    });
  }
});

module.exports = router;

