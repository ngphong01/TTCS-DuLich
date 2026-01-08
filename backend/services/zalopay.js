// services/zalopay.js - ZaloPay payment gateway integration
const crypto = require('crypto');

const ZALOPAY_APP_ID = process.env.ZALOPAY_APP_ID;
const ZALOPAY_KEY1 = process.env.ZALOPAY_KEY1;
const ZALOPAY_KEY2 = process.env.ZALOPAY_KEY2;
const ZALOPAY_ENDPOINT = process.env.ZALOPAY_ENDPOINT || 'https://sb-openapi.zalopay.vn/v2/create';
const ZALOPAY_RETURN_URL = process.env.ZALOPAY_RETURN_URL || `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/zalopay/callback`;
const ZALOPAY_CALLBACK_URL = process.env.ZALOPAY_CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payment/zalopay/callback`;

/**
 * Check if ZaloPay is configured
 */
function isZaloPayConfigured() {
  return !!(ZALOPAY_APP_ID && ZALOPAY_KEY1 && ZALOPAY_KEY2);
}

/**
 * Create ZaloPay payment request
 */
async function createPaymentRequest(params) {
  if (!isZaloPayConfigured()) {
    throw new Error('ZaloPay is not configured. Set ZALOPAY_APP_ID, ZALOPAY_KEY1, and ZALOPAY_KEY2 in .env');
  }

  const {
    amount,
    orderId,
    description = 'Thanh toan don hang',
  } = params;

  const embed_data = {};
  const items = [];
  const transID = Math.floor(Math.random() * 1000000);
  const app_time = Date.now();

  const order = {
    app_id: parseInt(ZALOPAY_APP_ID),
    app_trans_id: `${new Date().getTime()}_${transID}`, // Format: yyMMdd_xxxxx
    app_user: 'user123',
    app_time,
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount,
    description,
    bank_code: 'zalopayapp',
    callback_url: ZALOPAY_CALLBACK_URL,
    return_url: ZALOPAY_RETURN_URL,
  };

  // Create MAC (Message Authentication Code)
  const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
  order.mac = crypto.createHmac('sha256', ZALOPAY_KEY1).update(data).digest('hex');

  try {
    const fetch = require('node-fetch');
    const response = await fetch(ZALOPAY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(order).toString(),
    });

    const data = await response.json();

    if (data.return_code === 1) {
      return {
        paymentUrl: data.order_url,
        orderId: order.app_trans_id,
        transId: transID,
      };
    } else {
      throw new Error(data.return_message || 'ZaloPay payment creation failed');
    }
  } catch (error) {
    console.error('ZaloPay payment error:', error);
    throw error;
  }
}

/**
 * Verify ZaloPay callback
 */
function verifyCallback(params) {
  if (!isZaloPayConfigured()) {
    return { valid: false, error: 'ZaloPay not configured' };
  }

  const {
    app_id,
    app_trans_id,
    app_time,
    amount,
    app_user,
    zp_trans_id,
    server_time,
    merchant_id,
    return_code,
    return_message,
    mac,
  } = params;

  // Create MAC to verify
  const data = `${app_id}|${zp_trans_id}|${server_time}|${amount}`;
  const expectedMac = crypto.createHmac('sha256', ZALOPAY_KEY2).update(data).digest('hex');

  if (expectedMac !== mac) {
    return { valid: false, error: 'Invalid signature' };
  }

  return {
    valid: true,
    success: return_code === 1,
    orderId: app_trans_id,
    amount,
    transactionId: zp_trans_id,
    returnCode: return_code,
    message: return_message,
  };
}

module.exports = {
  isZaloPayConfigured,
  createPaymentRequest,
  verifyCallback,
};

