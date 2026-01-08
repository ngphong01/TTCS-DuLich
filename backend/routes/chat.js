// routes/chat.js
const express = require('express');
const prisma = require('../lib/prisma');
const router = express.Router();
const { chatWithGemini } = require('../services/geminiChatbot');
const { chatWithAnthropic } = require('../services/anthropicClient');

// GET /api/chat/history?limit=20 - get chat history
router.get('/history', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 20);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.json({ messages: [] });
    }

    // Get or create chat session for user
    let session = await prisma.chatSession.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    if (!session) {
      return res.json({ messages: [] });
    }

    // Get messages for this session
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      take: limit
    });

    // Format messages
    const formattedMessages = messages.map(msg => ({
      id: msg.id.toString(),
      message: msg.role === 'user' ? msg.content : '',
      response: msg.role === 'assistant' ? msg.content : '',
      createdAt: msg.createdAt.toISOString()
    }));

    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
});

// DELETE /api/chat/history - clear chat history
router.delete('/history', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(204).send();
    }

    // Find user's session
    const session = await prisma.chatSession.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    if (session) {
      // Delete all messages in session
      await prisma.chatMessage.deleteMany({
        where: { sessionId: session.id }
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ message: 'Error clearing chat history' });
  }
});

// POST /api/chat - send chat message
// Hỗ trợ cả Gemini và Anthropic (có thể chọn qua query param ?provider=anthropic hoặc body.provider)
router.post('/', async (req, res) => {
  try {
    const { message, provider } = req.body; // provider: 'gemini' | 'anthropic' | undefined (mặc định: gemini)
    const queryProvider = req.query.provider; // Cũng có thể truyền qua query string
    const selectedProvider = provider || queryProvider || 'gemini'; // Mặc định dùng Gemini
    
    const userId = req.user?.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Get or create chat session
    let session = await prisma.chatSession.findFirst({
      where: { userId: userId || null },
      orderBy: { updatedAt: 'desc' }
    });

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId: userId || null,
          sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content: message.trim()
      }
    });

    // Get conversation history for context
    const historyMessages = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      take: 10
    });

    // Build conversation history
    const conversationHistory = [];
    for (let i = 0; i < historyMessages.length - 1; i += 2) {
      if (historyMessages[i].role === 'user' && historyMessages[i + 1]?.role === 'assistant') {
        conversationHistory.push({
          user: historyMessages[i].content,
          assistant: historyMessages[i + 1].content
        });
      }
    }

    // Get AI response - chọn provider với fallback tự động
    let aiResponse;
    let usedProvider = selectedProvider;
    let shouldFallback = false;
    
    try {
      if (selectedProvider === 'anthropic') {
        // Sử dụng Anthropic
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error('ANTHROPIC_API_KEY chưa được cấu hình. Vui lòng thêm ANTHROPIC_API_KEY vào file .env');
        }
        console.log('🤖 Using Anthropic API');
        aiResponse = await chatWithAnthropic(message.trim(), conversationHistory, {
          max_tokens: 1024,
          system: 'Bạn là Bredan, AI Assistant thân thiện và chuyên nghiệp của TravelGo - một công ty du lịch hàng đầu Việt Nam.'
        });
      } else {
        // Mặc định dùng Gemini
        if (!process.env.GEMINI_API_KEY) {
          throw new Error('GEMINI_API_KEY chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào file .env');
        }
        console.log('🤖 Using Gemini API');
        aiResponse = await chatWithGemini(message.trim(), conversationHistory);
      }
    } catch (error) {
      console.error(`${selectedProvider} API error:`, error.message);
      
      // Kiểm tra nếu là lỗi quota/rate limit (429) hoặc lỗi khác cần fallback
      const isQuotaError = error.status === 429 || 
                          error.originalError?.status === 429 ||
                          error.message?.includes('quota') ||
                          error.message?.includes('429') ||
                          error.message?.includes('rate limit') ||
                          error.message?.includes('Rate limit');
      
      const isRetryableError = isQuotaError || 
                               error.status === 503 ||
                               error.status === 500 ||
                               (error.originalError?.status >= 500 && error.originalError?.status < 600);
      
      // Quyết định có nên fallback không
      if (isRetryableError && process.env.ANTHROPIC_API_KEY && selectedProvider === 'gemini') {
        shouldFallback = true;
        console.log('⚠️ Gemini failed (quota/error), automatically falling back to Anthropic...');
      } else if (isRetryableError && process.env.GEMINI_API_KEY && selectedProvider === 'anthropic') {
        shouldFallback = true;
        console.log('⚠️ Anthropic failed, falling back to Gemini...');
      }
      
      // Thực hiện fallback nếu cần
      if (shouldFallback) {
        try {
          if (selectedProvider === 'gemini') {
            // Fallback sang Anthropic
            console.log('🔄 Switching to Anthropic API...');
            aiResponse = await chatWithAnthropic(message.trim(), conversationHistory, {
              max_tokens: 1024,
              system: 'Bạn là Bredan, AI Assistant thân thiện và chuyên nghiệp của TravelGo - một công ty du lịch hàng đầu Việt Nam.'
            });
            usedProvider = 'anthropic';
            console.log('✅ Successfully switched to Anthropic');
          } else {
            // Fallback sang Gemini
            console.log('🔄 Switching to Gemini API...');
            aiResponse = await chatWithGemini(message.trim(), conversationHistory);
            usedProvider = 'gemini';
            console.log('✅ Successfully switched to Gemini');
          }
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError.message);
          // Nếu fallback cũng fail, tiếp tục xử lý lỗi
        }
      }
      
      // Nếu vẫn chưa có response (fallback fail hoặc không có fallback)
      if (!aiResponse) {
        if (isQuotaError && selectedProvider === 'gemini') {
          // Nếu Gemini quota exceeded và không có Anthropic, thông báo rõ ràng
          if (!process.env.ANTHROPIC_API_KEY) {
            aiResponse = "Xin lỗi, Gemini API đã hết quota hôm nay. Vui lòng thử lại sau hoặc liên hệ hotline 0868156027 để được hỗ trợ.";
          } else {
            // Nên không xảy ra vì đã fallback, nhưng để an toàn
            aiResponse = "Xin lỗi, cả hai AI service đều đang gặp sự cố. Vui lòng thử lại sau.";
          }
        } else if (error.message.includes('API_KEY') || error.message.includes('API key')) {
          aiResponse = "Xin lỗi, hệ thống chatbot chưa được cấu hình đầy đủ. Vui lòng liên hệ hotline 0868156027 hoặc email phong@triennguyen.com để được hỗ trợ.";
        } else if (error.userFriendly) {
          aiResponse = error.message;
        } else {
          aiResponse = "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng liên hệ hotline 0868156027 hoặc email phong@triennguyen.com để được hỗ trợ.";
        }
      }
    }

    // Save AI response (with error handling for database issues)
    try {
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: 'assistant',
          content: aiResponse
        }
      });

      // Update session timestamp
      await prisma.chatSession.update({
        where: { id: session.id },
        data: { updatedAt: new Date() }
      });
    } catch (dbError) {
      // Log database error but still return response to user
      console.error('Error saving chat message to database:', dbError);
      // If it's a content length error, log it specifically
      if (dbError.code === 'P2000' || dbError.message?.includes('too long')) {
        console.error('⚠️  Chat message content is too long. Consider truncating or using LONGTEXT type.');
        // Truncate and retry (safety measure)
        const maxLength = 65535; // TEXT type max length
        if (aiResponse.length > maxLength) {
          aiResponse = aiResponse.substring(0, maxLength - 100) + '\n\n[Phản hồi đã được rút gọn do độ dài]';
          try {
            await prisma.chatMessage.create({
              data: {
                sessionId: session.id,
                role: 'assistant',
                content: aiResponse
              }
            });
          } catch (retryError) {
            console.error('Error saving truncated message:', retryError);
          }
        }
      }
    }

    res.json({
      id: Date.now().toString(),
      message: message.trim(),
      reply: aiResponse, // Đổi từ 'response' sang 'reply' để nhất quán với frontend
      response: aiResponse, // Giữ lại để tương thích ngược
      provider: usedProvider, // Thông tin provider đã sử dụng
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    // Return a helpful error message
    const errorMessage = error.code === 'P2000' 
      ? 'Phản hồi từ AI quá dài. Vui lòng thử lại với câu hỏi ngắn hơn.'
      : 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.';
    res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/chat/anthropic - send chat message using Anthropic
router.post('/anthropic', async (req, res) => {
  try {
    const { message, conversationHistory = [], options = {} } = req.body;
    const userId = req.user?.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Get AI response from Anthropic
    let aiResponse;
    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY chưa được cấu hình. Vui lòng thêm ANTHROPIC_API_KEY vào file .env');
      }
      aiResponse = await chatWithAnthropic(message.trim(), conversationHistory, options);
    } catch (error) {
      console.error('Anthropic API error:', error.message);
      console.error('Full error:', error);
      
      // More specific error messages
      if (error.message.includes('ANTHROPIC_API_KEY')) {
        aiResponse = "Xin lỗi, hệ thống chatbot chưa được cấu hình đầy đủ. Vui lòng liên hệ hotline 0868156027 hoặc email phong@triennguyen.com để được hỗ trợ.";
      } else if (error.userFriendly) {
        aiResponse = error.message;
      } else {
        aiResponse = "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng liên hệ hotline 0868156027 hoặc email phong@triennguyen.com để được hỗ trợ.";
      }
    }

    res.json({
      id: Date.now().toString(),
      message: message.trim(),
      reply: aiResponse,
      response: aiResponse,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending chat message to Anthropic:', error);
    res.status(500).json({ 
      message: 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
