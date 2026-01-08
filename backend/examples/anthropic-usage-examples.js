// examples/anthropic-usage-examples.js
// Các ví dụ thực tế về cách sử dụng Anthropic Client trong code

const { chatWithAnthropic, simpleChat } = require('../services/anthropicClient');
require('dotenv').config();

// ============================================
// VÍ DỤ 1: Sử dụng đơn giản nhất
// ============================================
async function example1_SimpleUsage() {
  console.log('\n📝 Ví dụ 1: Chat đơn giản');
  
  try {
    const response = await simpleChat('Xin chào, bạn là ai?');
    console.log('Response:', response);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================
// VÍ DỤ 2: Sử dụng trong route handler (Express)
// ============================================
async function example2_InRouteHandler() {
  console.log('\n📝 Ví dụ 2: Sử dụng trong Express route');
  
  // Đây là cách bạn sẽ dùng trong routes/tour.js hoặc routes khác
  const mockRequest = {
    body: { message: 'Hãy giới thiệu về tour du lịch Hà Nội' }
  };
  
  try {
    const { message } = mockRequest.body;
    const response = await chatWithAnthropic(message, [], {
      max_tokens: 500,
      system: 'Bạn là AI assistant của TravelGo, chuyên tư vấn về du lịch.'
    });
    
    console.log('Response:', response);
    // Trong route thật, bạn sẽ return: res.json({ reply: response });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================
// VÍ DỤ 3: Sử dụng với lịch sử hội thoại
// ============================================
async function example3_WithHistory() {
  console.log('\n📝 Ví dụ 3: Chat với lịch sử hội thoại');
  
  const conversationHistory = [
    { 
      user: 'Tôi muốn đi du lịch', 
      assistant: 'Tuyệt vời! Bạn muốn đi đâu? Trong nước hay nước ngoài?' 
    },
    { 
      user: 'Trong nước, khoảng 3-4 ngày', 
      assistant: 'Bạn có thể tham khảo các tour Hà Nội, Đà Nẵng, hoặc Hạ Long. Bạn thích biển hay núi?' 
    }
  ];
  
  try {
    const response = await chatWithAnthropic(
      'Tôi thích biển, giá khoảng 5 triệu',
      conversationHistory,
      {
        max_tokens: 300,
        system: 'Bạn là tư vấn viên du lịch chuyên nghiệp của TravelGo.'
      }
    );
    
    console.log('Response:', response);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================
// VÍ DỤ 4: Tạo mô tả tour tự động
// ============================================
async function example4_GenerateTourDescription() {
  console.log('\n📝 Ví dụ 4: Tạo mô tả tour tự động');
  
  const tourInfo = {
    name: 'Tour Hà Nội - Sapa 4 ngày 3 đêm',
    price: 3500000,
    duration: 4,
    destination: 'Sapa, Lào Cai'
  };
  
  const prompt = `Hãy viết mô tả hấp dẫn cho tour du lịch sau:
- Tên tour: ${tourInfo.name}
- Giá: ${tourInfo.price.toLocaleString('vi-VN')} VNĐ
- Thời gian: ${tourInfo.duration} ngày ${tourInfo.duration - 1} đêm
- Điểm đến: ${tourInfo.destination}

Yêu cầu:
- Mô tả ngắn gọn, hấp dẫn (khoảng 200-300 từ)
- Nêu bật các điểm nổi bật của tour
- Sử dụng ngôn ngữ marketing chuyên nghiệp
- Viết bằng tiếng Việt`;
  
  try {
    const description = await chatWithAnthropic(prompt, [], {
      max_tokens: 500,
      system: 'Bạn là copywriter chuyên nghiệp cho công ty du lịch TravelGo.'
    });
    
    console.log('Tour Description:', description);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================
// VÍ DỤ 5: Phân tích review tự động
// ============================================
async function example5_AnalyzeReview() {
  console.log('\n📝 Ví dụ 5: Phân tích review tự động');
  
  const review = {
    rating: 4,
    comment: 'Tour khá tốt, hướng dẫn viên nhiệt tình nhưng thức ăn hơi đơn giản. Cảnh đẹp, giá hợp lý.'
  };
  
  const prompt = `Phân tích review sau và đưa ra nhận xét:
- Rating: ${review.rating}/5
- Comment: "${review.comment}"

Hãy trả về JSON với format:
{
  "sentiment": "positive" | "negative" | "neutral",
  "highlights": ["điểm tốt 1", "điểm tốt 2"],
  "issues": ["vấn đề 1", "vấn đề 2"],
  "recommendation": "gợi ý cải thiện"
}`;
  
  try {
    const analysis = await chatWithAnthropic(prompt, [], {
      max_tokens: 300,
      system: 'Bạn là chuyên gia phân tích review du lịch.'
    });
    
    console.log('Review Analysis:', analysis);
    // Có thể parse JSON nếu response là JSON hợp lệ
    try {
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Parsed JSON:', parsed);
      }
    } catch (e) {
      console.log('(Response không phải JSON hợp lệ)');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================
// VÍ DỤ 6: Sử dụng trong async function
// ============================================
async function example6_InAsyncFunction() {
  console.log('\n📝 Ví dụ 6: Sử dụng trong async function');
  
  // Đây là cách bạn sẽ dùng trong một function xử lý business logic
  async function processTourInquiry(inquiry) {
    try {
      const response = await chatWithAnthropic(
        `Khách hàng hỏi: "${inquiry}". Hãy trả lời một cách chuyên nghiệp.`,
        [],
        {
          max_tokens: 200,
          system: 'Bạn là nhân viên tư vấn du lịch chuyên nghiệp của TravelGo.'
        }
      );
      
      return {
        success: true,
        reply: response
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Sử dụng
  const result = await processTourInquiry('Tour Hạ Long giá bao nhiêu?');
  console.log('Result:', result);
}

// ============================================
// VÍ DỤ 7: Sử dụng với try-catch để xử lý lỗi
// ============================================
async function example7_ErrorHandling() {
  console.log('\n📝 Ví dụ 7: Xử lý lỗi đúng cách');
  
  try {
    const response = await chatWithAnthropic('Hello', [], {
      max_tokens: 100
    });
    
    console.log('Success:', response);
  } catch (error) {
    // Kiểm tra loại lỗi
    if (error.userFriendly) {
      // Lỗi đã được xử lý và có thông báo thân thiện
      console.error('User-friendly error:', error.message);
    } else if (error.status === 429) {
      console.error('Rate limit exceeded');
    } else if (error.status === 401 || error.status === 403) {
      console.error('Authentication failed');
    } else {
      console.error('Unknown error:', error.message);
    }
  }
}

// ============================================
// CHẠY TẤT CẢ VÍ DỤ
// ============================================
async function runAllExamples() {
  console.log('🚀 Bắt đầu chạy các ví dụ sử dụng Anthropic Client...\n');
  
  await example1_SimpleUsage();
  await example2_InRouteHandler();
  await example3_WithHistory();
  await example4_GenerateTourDescription();
  await example5_AnalyzeReview();
  await example6_InAsyncFunction();
  await example7_ErrorHandling();
  
  console.log('\n✅ Hoàn thành tất cả ví dụ!');
}

// Chạy nếu file được gọi trực tiếp
if (require.main === module) {
  runAllExamples().catch(console.error);
}

module.exports = {
  example1_SimpleUsage,
  example2_InRouteHandler,
  example3_WithHistory,
  example4_GenerateTourDescription,
  example5_AnalyzeReview,
  example6_InAsyncFunction,
  example7_ErrorHandling,
  runAllExamples
};

