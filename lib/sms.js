// lib/sms.js - SMS notification service (Twilio integration)
const twilio = require('twilio');

const SMS_PROVIDER = process.env.SMS_PROVIDER || 'twilio';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

let twilioClient = null;

/**
 * Initialize SMS service
 */
function initSMSService() {
  if (SMS_PROVIDER === 'twilio' && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    console.log('✅ SMS service (Twilio) initialized');
  } else {
    console.warn('⚠️  SMS service not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
  }
}

/**
 * Send SMS message
 */
async function sendSMS(to, message) {
  if (!twilioClient) {
    console.warn('SMS service not initialized. Message:', message);
    return { success: false, error: 'SMS service not configured' };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: to,
    });

    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send booking confirmation SMS
 */
async function sendBookingConfirmationSMS(phone, bookingCode, destinationName) {
  const message = `Xin chào! Đặt tour của bạn đã được xác nhận. Mã đặt chỗ: ${bookingCode}. Điểm đến: ${destinationName}. Cảm ơn bạn đã chọn TravelGo!`;
  return await sendSMS(phone, message);
}

/**
 * Send payment reminder SMS
 */
async function sendPaymentReminderSMS(phone, bookingCode, amount) {
  const message = `Nhắc nhở: Bạn còn ${amount.toLocaleString('vi-VN')} VNĐ chưa thanh toán cho đặt chỗ ${bookingCode}. Vui lòng thanh toán sớm để giữ chỗ.`;
  return await sendSMS(phone, message);
}

/**
 * Send booking reminder SMS
 */
async function sendBookingReminderSMS(phone, bookingCode, departureDate) {
  const message = `Nhắc nhở: Chuyến đi của bạn (${bookingCode}) sẽ khởi hành vào ${departureDate}. Vui lòng chuẩn bị sẵn sàng!`;
  return await sendSMS(phone, message);
}

module.exports = {
  initSMSService,
  sendSMS,
  sendBookingConfirmationSMS,
  sendPaymentReminderSMS,
  sendBookingReminderSMS,
};

