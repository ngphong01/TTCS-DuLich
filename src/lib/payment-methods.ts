export interface PaymentMethod {
  id: string;
  name: string;
  type: 'online' | 'bank_transfer' | 'cod' | 'wallet';
  category: 'domestic' | 'international';
  status: 'active' | 'inactive' | 'maintenance';
  logo: string;
  description: string;
  countries: string[];
  fees: string;
  setup: 'completed' | 'pending' | 'failed';
  config?: {
    merchantId?: string;
    secretKey?: string;
    publicKey?: string;
    endpoint?: string;
  };
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  // Online Payment Gateways - Domestic
  {
    id: 'vnpay',
    name: 'VNPAY',
    type: 'online',
    category: 'domestic',
    status: 'active',
    logo: '🇻🇳',
    description: 'Cổng thanh toán Việt Nam - Hỗ trợ thẻ ATM, Internet Banking',
    countries: ['VN'],
    fees: '1.2%',
    setup: 'completed',
    config: {
      merchantId: process.env.VNPAY_MERCHANT_ID,
      secretKey: process.env.VNPAY_SECRET_KEY,
      endpoint: process.env.VNPAY_ENDPOINT || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
    }
  },
  {
    id: 'momo',
    name: 'MoMo',
    type: 'wallet',
    category: 'domestic',
    status: 'active',
    logo: '💜',
    description: 'Ví điện tử MoMo - Thanh toán nhanh chóng',
    countries: ['VN'],
    fees: '0.8%',
    setup: 'completed',
    config: {
      merchantId: process.env.MOMO_PARTNER_CODE,
      secretKey: process.env.MOMO_SECRET_KEY,
      endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create'
    }
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    type: 'wallet',
    category: 'domestic',
    status: 'active',
    logo: '💙',
    description: 'Ví điện tử ZaloPay - Tích hợp Zalo',
    countries: ['VN'],
    fees: '0.9%',
    setup: 'completed',
    config: {
      merchantId: process.env.ZALOPAY_APP_ID,
      secretKey: process.env.ZALOPAY_SECRET_KEY,
      endpoint: process.env.ZALOPAY_ENDPOINT || 'https://sb-openapi.zalopay.vn/v2/create'
    }
  },
  
  // Online Payment Gateways - International
  {
    id: 'stripe',
    name: 'Stripe',
    type: 'online',
    category: 'international',
    status: 'active',
    logo: '💳',
    description: 'Thanh toán quốc tế - Visa, MasterCard, American Express',
    countries: ['US', 'EU', 'Global'],
    fees: '2.9% + $0.30',
    setup: 'completed',
    config: {
      publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY
    }
  },
  {
    id: 'paypal',
    name: 'PayPal',
    type: 'online',
    category: 'international',
    status: 'active',
    logo: '🅿️',
    description: 'PayPal - Thanh toán quốc tế an toàn',
    countries: ['US', 'EU', 'Global'],
    fees: '3.4% + $0.35',
    setup: 'completed',
    config: {
      merchantId: process.env.PAYPAL_CLIENT_ID,
      secretKey: process.env.PAYPAL_CLIENT_SECRET,
      endpoint: process.env.PAYPAL_ENDPOINT || 'https://api.sandbox.paypal.com'
    }
  },
  
  // Bank Transfer
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản ngân hàng',
    type: 'bank_transfer',
    category: 'domestic',
    status: 'active',
    logo: '🏦',
    description: 'Chuyển khoản trực tiếp vào tài khoản ngân hàng',
    countries: ['VN'],
    fees: '0%',
    setup: 'completed'
  },
  
  // Cash on Delivery
  {
    id: 'cod',
    name: 'Thanh toán khi nhận tour',
    type: 'cod',
    category: 'domestic',
    status: 'active',
    logo: '💰',
    description: 'Thanh toán trực tiếp khi gặp hướng dẫn viên',
    countries: ['VN'],
    fees: '0%',
    setup: 'completed'
  }
];

export const getActivePaymentMethods = (country: string = 'VN'): PaymentMethod[] => {
  return PAYMENT_METHODS.filter(method => 
    method.status === 'active' && 
    (method.countries.includes(country) || method.countries.includes('Global'))
  );
};

export const getPaymentMethodById = (id: string): PaymentMethod | undefined => {
  return PAYMENT_METHODS.find(method => method.id === id);
};
