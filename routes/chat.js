// routes/chat.js
const express = require('express');
const prisma = require('../lib/prisma');
const router = express.Router();
const { chatWithGemini } = require('../services/geminiChatbot');

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
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
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

    // Get AI response from Gemini
    let aiResponse;
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào file .env');
      }
      aiResponse = await chatWithGemini(message.trim(), conversationHistory);
    } catch (error) {
      console.error('Gemini API error:', error.message);
      console.error('Full error:', error);
      
      // More specific error messages
      if (error.message.includes('GEMINI_API_KEY')) {
        aiResponse = "Xin lỗi, hệ thống chatbot chưa được cấu hình đầy đủ. Vui lòng liên hệ hotline 0868156027 hoặc email phong@triennguyen.com để được hỗ trợ.";
      } else if (error.message.includes('API key')) {
        aiResponse = "Xin lỗi, API key không hợp lệ. Vui lòng liên hệ hotline 0868156027 hoặc email phong@triennguyen.com để được hỗ trợ.";
      } else {
        aiResponse = "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng liên hệ hotline 0868156027 hoặc email phong@triennguyen.com để được hỗ trợ.";
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

module.exports = router;
