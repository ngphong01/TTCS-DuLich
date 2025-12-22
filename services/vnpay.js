// services/vnpay.js - VNPay payment gateway integration
const crypto = require('crypto');
const querystring = require('querystring');

const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE;
const VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET;
const VNPAY_URL = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL || `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/vnpay/callback`;

/**
 * Check if VNPay is configured
 */
function isVNPayConfigured() {
  return !!(VNPAY_TMN_CODE && VNPAY_HASH_SECRET);
}

/**
 * Create VNPay payment URL
 */
function createPaymentUrl(params) {
  if (!isVNPayConfigured()) {
    throw new Error('VNPay is not configured. Set VNPAY_TMN_CODE and VNPAY_HASH_SECRET in .env');
  }

  const {
    amount,
    orderId,
    orderInfo = 'Thanh toan don hang',
    orderType = 'other',
    bankCode = '',
    language = 'vn',
    ipAddr = '127.0.0.1',
  } = params;

  const date = new Date();
  const createDate = date.toISOString().replace(/[-:]/g, '').split('.')[0] + '00';
  const expireDate = new Date(date.getTime() + 15 * 60 * 1000) // 15 minutes
    .toISOString()
    .replace(/[-:]/g, '')
    .split('.')[0] + '00';

  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNPAY_TMN_CODE,
    vnp_Amount: amount * 100, // VNPay expects amount in cents
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: orderType,
    vnp_Locale: language,
    vnp_ReturnUrl: VNPAY_RETURN_URL,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  if (bankCode) {
    vnp_Params.vnp_BankCode = bankCode;
  }

  // Sort params and create query string
  const sortedParams = Object.keys(vnp_Params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = vnp_Params[key];
      return acc;
    }, {});

  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', VNPAY_HASH_SECRET);
  const signed = hmac.update(signData, 'utf-8').digest('hex');

  const paymentUrl = `${VNPAY_URL}?${signData}&vnp_SecureHash=${signed}`;

  return {
    paymentUrl,
    orderId,
  };
}

/**
 * Verify VNPay callback
 */
function verifyCallback(params) {
  if (!isVNPayConfigured()) {
    return { valid: false, error: 'VNPay not configured' };
  }

  const vnp_SecureHash = params.vnp_SecureHash;
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  // Sort params
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', VNPAY_HASH_SECRET);
  const signed = hmac.update(signData, 'utf-8').digest('hex');

  if (signed !== vnp_SecureHash) {
    return { valid: false, error: 'Invalid signature' };
  }

  const responseCode = params.vnp_ResponseCode;
  const transactionStatus = params.vnp_TransactionStatus;

  return {
    valid: true,
    success: responseCode === '00' && transactionStatus === '00',
    orderId: params.vnp_TxnRef,
    amount: params.vnp_Amount / 100, // Convert back from cents
    transactionId: params.vnp_TransactionNo,
    responseCode,
    message: params.vnp_ResponseMessage || '',
  };
}

module.exports = {
  isVNPayConfigured,
  createPaymentUrl,
  verifyCallback,
};

