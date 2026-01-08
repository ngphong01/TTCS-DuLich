// services/geminiChatbot.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Load API keys from environment variables only (security best practice)
// Support multiple keys via comma-separated values: GEMINI_API_KEY=key1,key2,key3
function loadApiKeys() {
  const envKey = process.env.GEMINI_API_KEY;
  if (!envKey) {
    return [];
  }
  
  // Split by comma and trim whitespace
  const keys = envKey.split(',').map(key => key.trim()).filter(Boolean);
  return keys;
}

const API_KEYS = loadApiKeys();
let currentKeyIndex = 0;

// Get current API client
function getGeminiClient() {
  if (API_KEYS.length === 0) {
    throw new Error('No Gemini API keys configured. Please set GEMINI_API_KEY in your .env file.');
  }
  const apiKey = API_KEYS[currentKeyIndex];
  if (!apiKey) {
    throw new Error('No Gemini API keys available');
  }
  return new GoogleGenerativeAI(apiKey);
}

// Rotate to next API key
function rotateApiKey() {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  console.log(`🔄 Switched to API key ${currentKeyIndex + 1}/${API_KEYS.length}`);
}

// Initialize with first key (if available)
let genAI = null;
if (API_KEYS.length > 0) {
  try {
    genAI = getGeminiClient();
  } catch (error) {
    console.warn('⚠️  Could not initialize Gemini client:', error.message);
  }
}

const systemPrompt = `Bạn là Bredan, AI Assistant thân thiện và chuyên nghiệp của TravelGo - một công ty du lịch hàng đầu Việt Nam.

Nhiệm vụ của bạn:
- Tư vấn về các điểm đến du lịch trong và ngoài nước
- Giúp người dùng tìm tour phù hợp với ngân sách và sở thích
- Trả lời câu hỏi về đặt chỗ, thanh toán, chính sách
- Đưa ra gợi ý về khách sạn, nhà hàng, địa điểm tham quan
- Hỗ trợ lập lịch trình du lịch

Quy tắc:
- Luôn trả lời bằng tiếng Việt
- Thân thiện, nhiệt tình nhưng chuyên nghiệp
- Nếu không biết, hãy đề xuất liên hệ hotline: 0868156027 hoặc email: phong@triennguyen.com
- Không đưa ra thông tin sai lệch về giá cả hoặc chính sách
- Khuyến khích người dùng đặt tour qua website

Thông tin công ty:
- Tên: TravelGo
- Địa chỉ: 6/160 Tân Triều, Thanh Trì, Hà Nội
- Hotline: 0868156027
- Email: phong@triennguyen.com`;

async function chatWithGemini(userMessage, conversationHistory = []) {
  // Check if API keys are configured
  if (API_KEYS.length === 0) {
    const error = new Error('GEMINI_API_KEY chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào file .env');
    error.userFriendly = true;
    throw error;
  }
  
  // Try all API keys if needed
  let lastError = null;
  const maxKeyAttempts = API_KEYS.length;
  
  for (let keyAttempt = 0; keyAttempt < maxKeyAttempts; keyAttempt++) {
    try {

      console.log(`Calling Gemini API (Key ${currentKeyIndex + 1}/${API_KEYS.length}) with message:`, userMessage.substring(0, 50) + '...');
      
      // Get current client
      genAI = getGeminiClient();
      
      // Use gemini-2.5-flash (confirmed working)
      const modelNames = [
        'gemini-2.5-flash',      // Primary choice
        'gemini-2.5-pro',        // Alternative
        'gemini-2.0-flash-exp'   // Fallback
      ];
      
      let model;
      let modelName = null;
      let modelError = null;
      
      // Try each model until one works
      for (const name of modelNames) {
        try {
          model = genAI.getGenerativeModel({ model: name });
          modelName = name;
          console.log(`✅ Using model: ${modelName}`);
          break;
        } catch (err) {
          console.warn(`⚠️  Model ${name} not available, trying next...`);
          modelError = err;
          continue;
        }
      }
      
      if (!model || !modelName) {
        throw new Error(`No available Gemini model found. Tried: ${modelNames.join(', ')}`);
      }

    // Build full prompt with system prompt and conversation history
    let fullPrompt = systemPrompt + '\n\n';
    
    // Add conversation history
    if (conversationHistory.length > 0) {
      fullPrompt += 'Lịch sử trò chuyện:\n';
      conversationHistory.slice(-10).forEach(msg => {
        fullPrompt += `Người dùng: ${msg.user}\n`;
        fullPrompt += `Bredan: ${msg.assistant}\n\n`;
      });
    }
    
    // Add current user message
    fullPrompt += `Người dùng: ${userMessage}\nBredan:`;

    // Retry logic for 503 errors
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [1000, 3000, 5000]; // 1s, 3s, 5s
    
    while (retryCount <= MAX_RETRIES) {
      try {
        if (retryCount > 0) {
          console.log(`⏳ Retry attempt ${retryCount}/${MAX_RETRIES}...`);
        }
        
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        if (retryCount > 0) {
          console.log(`✅ Success after ${retryCount} retries`);
        }
        
        return text.trim();
      } catch (apiError) {
        // Check if it's a quota exceeded error (429) - don't retry, just throw
        const isQuotaExceeded = apiError.status === 429 || 
                                apiError.message?.includes('429') ||
                                apiError.message?.includes('quota') ||
                                apiError.message?.includes('Quota exceeded');
        
        if (isQuotaExceeded) {
          console.warn('⚠️  [QUOTA] Gemini API quota exceeded. Skipping request.');
          const friendlyError = new Error('Đã vượt quá giới hạn yêu cầu. Vui lòng đợi một chút. ⏱️');
          friendlyError.userFriendly = true;
          friendlyError.status = 429;
          friendlyError.originalError = apiError;
          throw friendlyError;
        }
        
        // Check if it's a network error or 503 (overloaded)
        const isNetworkError = apiError.message?.includes('fetch failed') || 
                               apiError.message?.includes('ECONNREFUSED') ||
                               apiError.message?.includes('ETIMEDOUT') ||
                               apiError.cause?.code === 'ECONNREFUSED' ||
                               apiError.cause?.code === 'ETIMEDOUT' ||
                               apiError.status === 503;
        
        if (isNetworkError && retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAYS[retryCount];
          const errorMsg = apiError.message || apiError.cause?.code || 'Unknown error';
          console.log(`⚠️  Network/API error: ${errorMsg}. Waiting ${delay}ms before retry ${retryCount + 1}/${MAX_RETRIES}...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retryCount++;
          continue;
        }
        
        // If not a retryable error or max retries reached
        // Try rotating to next API key if this was a key-specific error
        if (keyAttempt < maxKeyAttempts - 1) {
          console.log(`⚠️  Key ${currentKeyIndex + 1} failed, rotating to next key...`);
          rotateApiKey();
          lastError = apiError;
          break; // Break retry loop to try next key
        }
        
        throw apiError;
      }
    }
    
    // If we broke out of retry loop, continue to next key attempt
    continue;
    
    } catch (error) {
      lastError = error;
      
      // If this wasn't the last key attempt, try next key
      if (keyAttempt < maxKeyAttempts - 1) {
        console.log(`⚠️  Key ${currentKeyIndex + 1} failed completely, trying next key...`);
        rotateApiKey();
        continue;
      }
      
      // All keys failed
      break;
    }
  }

  // All API keys exhausted
  if (lastError) {
    console.error('❌ All API keys failed. Last error:', lastError?.message);
    console.error('Error details:', {
      message: lastError?.message,
      status: lastError?.status,
      statusText: lastError?.statusText
    });

    // Provide user-friendly error messages
    if (lastError?.status === 503) {
      const friendlyError = new Error('AI đang quá tải. Vui lòng thử lại sau vài phút. 🤖');
      friendlyError.userFriendly = true;
      friendlyError.originalError = lastError;
      throw friendlyError;
    } else if (lastError?.status === 429) {
      const friendlyError = new Error('Đã vượt quá giới hạn yêu cầu. Vui lòng đợi một chút. ⏱️');
      friendlyError.userFriendly = true;
      friendlyError.status = 429; // Giữ lại status code để fallback có thể detect
      friendlyError.originalError = lastError;
      throw friendlyError;
    } else if (lastError?.status === 401 || lastError?.status === 403) {
      console.error('💡 All API keys failed authentication');
      const friendlyError = new Error('Lỗi xác thực API. Vui lòng kiểm tra GEMINI_API_KEY trong file .env và đảm bảo API key hợp lệ. 🔐');
      friendlyError.userFriendly = true;
      friendlyError.originalError = lastError;
      throw friendlyError;
    }

    throw lastError;
  }

  throw new Error('All API keys exhausted');
}

module.exports = {
  chatWithGemini
};

