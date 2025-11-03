// Payment methods stub
export interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
  logo?: string;
  active: boolean;
  fees?: string;
  category?: 'domestic' | 'international';
  description?: string;
  countries?: string[];
}

export function getActivePaymentMethods(country?: string): PaymentMethod[] {
  return [
    { 
      id: "vnpay", 
      name: "VNPay", 
      active: true, 
      fees: "0%",
      category: "domestic",
      description: "Thanh toán qua ví điện tử VNPay",
      countries: ["VN"]
    },
    { 
      id: "paypal", 
      name: "PayPal", 
      active: true,
      fees: "2.9%",
      category: "international",
      description: "Thanh toán quốc tế qua PayPal",
      countries: ["Global"]
    },
    { 
      id: "stripe", 
      name: "Stripe", 
      active: true,
      fees: "2.9%",
      category: "international",
      description: "Thanh toán quốc tế qua Stripe",
      countries: ["Global"]
    },
    {
      id: "bank_transfer",
      name: "Chuyển khoản ngân hàng",
      active: true,
      fees: "0%",
      category: "domestic",
      description: "Chuyển khoản trực tiếp vào tài khoản ngân hàng",
      countries: ["VN"]
    },
  ];
}

export function getPaymentMethodById(id: string): PaymentMethod | undefined {
  return getActivePaymentMethods().find(m => m.id === id);
}

