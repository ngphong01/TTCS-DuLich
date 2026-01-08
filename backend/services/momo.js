// services/momo.js - MoMo payment gateway integration
const crypto = require('crypto');

const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE;
const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY;
const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY;
const MOMO_ENDPOINT = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
const MOMO_RETURN_URL = process.env.MOMO_RETURN_URL || `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/momo/callback`;
const MOMO_NOTIFY_URL = process.env.MOMO_NOTIFY_URL || `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payment/momo/callback`;

/**
 * Check if MoMo is configured
 */
function isMoMoConfigured() {
  return !!(MOMO_PARTNER_CODE && MOMO_ACCESS_KEY && MOMO_SECRET_KEY);
}

/**
 * Create MoMo payment request
 */
async function createPaymentRequest(params) {
  if (!isMoMoConfigured()) {
    throw new Error('MoMo is not configured. Set MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, and MOMO_SECRET_KEY in .env');
  }

  const {
    amount,
    orderId,
    orderInfo = 'Thanh toan don hang',
    requestId = `${Date.now()}`,
    extraData = '',
  } = params;

  const requestType = 'captureWallet';
  const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${MOMO_NOTIFY_URL}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_PARTNER_CODE}&redirectUrl=${MOMO_RETURN_URL}&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto
    .createHmac('sha256', MOMO_SECRET_KEY)
    .update(rawSignature)
    .digest('hex');

  const requestBody = {
    partnerCode: MOMO_PARTNER_CODE,
    partnerName: 'TravelGo',
    storeId: 'TravelGo',
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl: MOMO_RETURN_URL,
    ipnUrl: MOMO_NOTIFY_URL,
    lang: 'vi',
    extraData,
    requestType,
    signature,
  };

  try {
    const fetch = require('node-fetch');
    const response = await fetch(MOMO_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.resultCode === 0) {
      return {
        paymentUrl: data.payUrl,
        orderId,
        requestId,
      };
    } else {
      throw new Error(data.message || 'MoMo payment creation failed');
    }
  } catch (error) {
    console.error('MoMo payment error:', error);
    throw error;
  }
}

/**
 * Verify MoMo callback
 */
function verifyCallback(params) {
  if (!isMoMoConfigured()) {
    return { valid: false, error: 'MoMo not configured' };
  }

  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature,
  } = params;

  // Create signature to verify
  const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

  const expectedSignature = crypto
    .createHmac('sha256', MOMO_SECRET_KEY)
    .update(rawSignature)
    .digest('hex');

  if (expectedSignature !== signature) {
    return { valid: false, error: 'Invalid signature' };
  }

  return {
    valid: true,
    success: resultCode === 0,
    orderId,
    amount,
    transactionId: transId,
    resultCode,
    message,
  };
}

module.exports = {
  isMoMoConfigured,
  createPaymentRequest,
  verifyCallback,
};

