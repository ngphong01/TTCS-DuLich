// examples/anthropic-example.js
// Ví dụ sử dụng Anthropic Client với Antigravity proxy

const { chatWithAnthropic, simpleChat } = require('../services/anthropicClient');
require('dotenv').config();

async function example1() {
  console.log('\n=== Ví dụ 1: Chat đơn giản ===');
  try {
    const response = await simpleChat('Hello');
    console.log('Response:', response);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function example2() {
  console.log('\n=== Ví dụ 2: Chat với lịch sử hội thoại ===');
  try {
    const conversationHistory = [
      { user: 'Xin chào', assistant: 'Chào bạn! Tôi có thể giúp gì cho bạn?' },
      { user: 'Bạn là ai?', assistant: 'Tôi là AI assistant của TravelGo.' }
    ];
    
    const response = await chatWithAnthropic(
      'Bạn có thể giới thiệu về TravelGo không?',
      conversationHistory
    );
    console.log('Response:', response);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function example3() {
  console.log('\n=== Ví dụ 3: Chat với tùy chọn tùy chỉnh ===');
  try {
    const response = await chatWithAnthropic(
      'Hãy viết một bài thơ ngắn về du lịch',
      [],
      {
        max_tokens: 500,
        system: 'Bạn là một nhà thơ chuyên viết về du lịch và khám phá.'
      }
    );
    console.log('Response:', response);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function example4() {
  console.log('\n=== Ví dụ 4: Sử dụng client trực tiếp (advanced) ===');
  try {
    const { client } = require('../services/anthropicClient');
    
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: 'Hello' }
      ]
    });
    
    console.log('Response:', response.content[0].text);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Chạy tất cả ví dụ
async function runAllExamples() {
  console.log('🚀 Bắt đầu chạy các ví dụ Anthropic Client...\n');
  
  await example1();
  await example2();
  await example3();
  await example4();
  
  console.log('\n✅ Hoàn thành tất cả ví dụ!');
}

// Chạy nếu file được gọi trực tiếp
if (require.main === module) {
  runAllExamples().catch(console.error);
}

module.exports = {
  example1,
  example2,
  example3,
  example4,
  runAllExamples
};

