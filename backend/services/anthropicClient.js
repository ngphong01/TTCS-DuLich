// services/anthropicClient.js
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

// Load configuration from environment variables
const ANTHROPIC_BASE_URL = process.env.ANTHROPIC_BASE_URL || 'http://localhost:8045';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'sk-469b6cf7e10c45028f60753f84fc81bb';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

// Initialize Anthropic client
const client = new Anthropic({
  baseURL: ANTHROPIC_BASE_URL,
  apiKey: ANTHROPIC_API_KEY,
});

/**
 * Send a message to Anthropic API
 * @param {string} message - The user message
 * @param {Array} conversationHistory - Optional conversation history
 * @param {Object} options - Optional parameters (max_tokens, model, etc.)
 * @returns {Promise<string>} - The AI response text
 */
async function chatWithAnthropic(message, conversationHistory = [], options = {}) {
  let messages = [];
  let requestParams = null;
  
  try {
    // Check if API key is configured
    if (!ANTHROPIC_API_KEY) {
      const error = new Error('ANTHROPIC_API_KEY chưa được cấu hình. Vui lòng thêm ANTHROPIC_API_KEY vào file .env');
      error.userFriendly = true;
      throw error;
    }

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new Error('Message is required and must be a non-empty string');
    }

    console.log(`Calling Anthropic API (${ANTHROPIC_MODEL}) with message:`, message.substring(0, 50) + '...');

    // Build messages array - đảm bảo format đúng
    messages = [];

    // Add conversation history
    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      conversationHistory.slice(-10).forEach(msg => {
        // Đảm bảo format đúng: { role: 'user'|'assistant', content: string }
        if (msg && typeof msg === 'object') {
          if (msg.user && typeof msg.user === 'string' && msg.user.trim()) {
            messages.push({ role: 'user', content: msg.user.trim() });
          }
          if (msg.assistant && typeof msg.assistant === 'string' && msg.assistant.trim()) {
            messages.push({ role: 'assistant', content: msg.assistant.trim() });
          }
        }
      });
    }

    // Add current user message - đảm bảo luôn có ít nhất 1 message
    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new Error('Message must be a non-empty string');
    }
    messages.push({ role: 'user', content: message.trim() });

    // Validate messages array
    if (messages.length === 0) {
      throw new Error('Messages array cannot be empty');
    }

    // Validate max_tokens
    const maxTokens = options.max_tokens || 1024;
    if (typeof maxTokens !== 'number' || maxTokens < 1 || maxTokens > 4096) {
      throw new Error('max_tokens must be a number between 1 and 4096');
    }

    // Prepare request parameters - đảm bảo tất cả required fields
    requestParams = {
      model: options.model || ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      messages: messages,
    };

    // Add system prompt if provided (optional field)
    if (options.system && typeof options.system === 'string' && options.system.trim()) {
      requestParams.system = options.system.trim();
    }

    // Log request params for debugging (không log full message để tránh spam)
    console.log('Anthropic request params:', {
      model: requestParams.model,
      max_tokens: requestParams.max_tokens,
      messages_count: requestParams.messages.length,
      has_system: !!requestParams.system
    });

    // Make API call
    const response = await client.messages.create(requestParams);

    // Extract text from response
    if (response.content && response.content.length > 0) {
      const text = response.content[0].text;
      console.log('✅ Anthropic API response received');
      return text.trim();
    } else {
      throw new Error('Empty response from Anthropic API');
    }
  } catch (error) {
    console.error('❌ Error calling Anthropic API:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      name: error.name,
      type: error.type
    });

    // Xử lý lỗi "Missing required fields"
    if (error.message && (
      error.message.includes('Missing required') ||
      error.message.includes('required field') ||
      error.message.includes('validation_error') ||
      error.status === 400
    )) {
      const friendlyError = new Error('Lỗi định dạng request. Vui lòng kiểm tra lại cấu hình API. 🔧');
      friendlyError.userFriendly = true;
      friendlyError.status = 400;
      friendlyError.originalError = error;
      console.error('⚠️ Validation error - check request format:', {
        hasMessages: messages && messages.length > 0,
        messagesCount: messages ? messages.length : 0,
        hasModel: !!requestParams.model,
        hasMaxTokens: !!requestParams.max_tokens
      });
      throw friendlyError;
    }

    // Provide user-friendly error messages
    if (error.status === 429) {
      const friendlyError = new Error('Đã vượt quá giới hạn yêu cầu. Vui lòng đợi một chút. ⏱️');
      friendlyError.userFriendly = true;
      friendlyError.status = 429;
      friendlyError.originalError = error;
      throw friendlyError;
    } else if (error.status === 401 || error.status === 403) {
      const friendlyError = new Error('Lỗi xác thực API. Vui lòng kiểm tra ANTHROPIC_API_KEY trong file .env. 🔐');
      friendlyError.userFriendly = true;
      friendlyError.status = error.status;
      friendlyError.originalError = error;
      throw friendlyError;
    } else if (error.status === 503) {
      const friendlyError = new Error('AI đang quá tải. Vui lòng thử lại sau vài phút. 🤖');
      friendlyError.userFriendly = true;
      friendlyError.status = 503;
      friendlyError.originalError = error;
      throw friendlyError;
    }

    // Giữ nguyên error để có thể debug
    throw error;
  }
}

/**
 * Simple chat function (backward compatibility with example code)
 * @param {string} message - The user message
 * @returns {Promise<string>} - The AI response text
 */
async function simpleChat(message) {
  return chatWithAnthropic(message, [], { max_tokens: 1024 });
}

module.exports = {
  chatWithAnthropic,
  simpleChat,
  client, // Export client for advanced usage
};

