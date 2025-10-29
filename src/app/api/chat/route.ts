import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { db } from "@/lib/mysql";

// Use Google Gemini API for intelligent responses
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDummyKeyForTesting";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    const session = await getSession();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create intelligent prompt for AI
    const prompt = `Bạn là AI Assistant của TravelGo - nền tảng du lịch hàng đầu Việt Nam. 
    
Nhiệm vụ của bạn:
- Hỗ trợ khách hàng về du lịch, đặt chỗ, điểm đến
- Đưa ra lời khuyên du lịch phù hợp và thông minh
- Trả lời câu hỏi về các dịch vụ của TravelGo
- Luôn thân thiện, nhiệt tình và hữu ích

Thông tin về TravelGo:
- Có hơn 500+ điểm đến
- Đánh giá 4.8/5 sao
- Hỗ trợ 24/7
- Các dịch vụ: đặt chỗ, tour, khách sạn, vé máy bay
- Có các danh mục: du lịch biển, thành phố, thiên nhiên, lịch sử, ẩm thực

Câu hỏi của khách hàng: "${message}"

Hãy trả lời một cách thông minh, hữu ích và liên quan đến du lịch. Nếu câu hỏi không liên quan đến du lịch, hãy nhẹ nhàng chuyển hướng về chủ đề du lịch. Trả lời bằng tiếng Việt, ngắn gọn nhưng đầy đủ thông tin.`;

    // Call Gemini API for intelligent response
    let response;
    try {
      response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
    } catch (fetchError) {
      console.error("Gemini API fetch error:", fetchError);
      response = null;
    }

    let aiResponse = "";

    if (response && response.ok) {
      try {
        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          aiResponse = data.candidates[0].content.parts[0].text;
        } else {
          aiResponse = "Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử lại sau.";
        }
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError);
        aiResponse = "Xin lỗi, có lỗi xảy ra khi xử lý phản hồi. Vui lòng thử lại sau.";
      }
    } else {
      // Fallback to simple responses if API fails
      if (response) {
        console.error("Gemini API error:", response.status, response.statusText);
      } else {
        console.error("Gemini API request failed");
      }
      
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("xin chào")) {
        aiResponse = "Xin chào! Tôi là TravelGo AI Assistant. Tôi có thể giúp bạn tìm hiểu về các điểm đến, đặt chỗ, hoặc trả lời bất kỳ câu hỏi nào về du lịch. Bạn cần hỗ trợ gì?";
      } else if (lowerMessage.includes("hà nội")) {
        aiResponse = "Hà Nội là một điểm đến tuyệt vời! Thủ đô Việt Nam có nhiều địa điểm hấp dẫn như Hồ Gươm, Văn Miếu, ẩm thực phong phú. Bạn muốn tôi tư vấn thêm về tour Hà Nội nào?";
      } else {
        aiResponse = `Cảm ơn bạn đã liên hệ TravelGo! Về "${message}", tôi khuyên bạn nên:

1. Xem danh sách điểm đến tại trang destinations
2. Liên hệ hotline 24/7 để được tư vấn chi tiết  
3. Đọc reviews từ khách hàng đã sử dụng dịch vụ

TravelGo - Nền tảng du lịch hàng đầu Việt Nam với hơn 500+ điểm đến và đánh giá 4.8/5 sao!`;
      }
    }

    // Save chat message to database using MySQL
    try {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      await db.executeSingleQuery(
        `INSERT INTO chatMessage (id, userId, message, response, createdAt) 
         VALUES (?, ?, ?, ?, NOW())`,
        [messageId, session.user.id, message, aiResponse]
      );
    } catch (dbError) {
      console.error("Failed to save chat message:", dbError);
      // Continue even if database save fails
    }

    // Log the conversation for debugging
    console.log("Chat conversation:", {
      userMessage: message,
      aiResponse: aiResponse,
      userId: session.user.id,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}