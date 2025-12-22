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
  const methods: PaymentMethod[] = [
    {
      id: "vnpay",
      name: "VNPay",
      active: true,
      fees: "0%",
      category: "domestic",
      description: "Thanh toán qua ví điện tử VNPay",
      countries: ["VN"],
    },
    {
      id: "momo",
      name: "MoMo QR",
      active: true,
      fees: "0%",
      category: "domestic",
      description: "Quét mã QR MoMo để thanh toán ngay",
      countries: ["VN"],
    },
    {
      id: "zalopay",
      name: "ZaloPay",
      active: true,
      fees: "0%",
      category: "domestic",
      description: "Thanh toán bằng ví điện tử ZaloPay",
      countries: ["VN"],
    },
    {
      id: "bank_transfer",
      name: "Chuyển khoản ngân hàng",
      active: true,
      fees: "0%",
      category: "domestic",
      description: "Chuyển khoản trực tiếp vào tài khoản ngân hàng",
      countries: ["VN"],
    },
    {
      id: "cod",
      name: "Thanh toán trực tiếp",
      active: true,
      fees: "0%",
      category: "domestic",
      description: "Thanh toán khi gặp hướng dẫn viên (tour nội địa)",
      countries: ["VN"],
    },
    {
      id: "paypal",
      name: "PayPal",
      active: true,
      fees: "2.9%",
      category: "international",
      description: "Thanh toán quốc tế qua PayPal",
      countries: ["Global"],
    },
    {
      id: "stripe",
      name: "Stripe",
      active: true,
      fees: "2.9%",
      category: "international",
      description: "Thanh toán quốc tế qua Stripe",
      countries: ["Global"],
    },
  ];

  if (!country) {
    return methods.filter((method) => method.active);
  }

  const normalizedCountry = country.toUpperCase();

  return methods.filter((method) => {
    if (!method.active) return false;
    if (!method.countries || method.countries.length === 0) return true;
    if (method.countries.includes("Global")) return true;
    return method.countries.some(
      (item) => item.toUpperCase() === normalizedCountry
    );
  });
}

export function getPaymentMethodById(id: string): PaymentMethod | undefined {
  return getActivePaymentMethods().find(m => m.id === id);
}

