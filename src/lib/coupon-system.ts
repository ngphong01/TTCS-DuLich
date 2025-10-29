export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number; // percentage (0-100) or fixed amount
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  userLimit?: number; // per user
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  applicableDestinations?: string[]; // destination slugs
  applicableCountries?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  userId: string;
  bookingId: string;
  discountAmount: number;
  usedAt: Date;
}

export interface CouponValidationResult {
  isValid: boolean;
  discountAmount: number;
  error?: string;
  coupon?: Coupon;
}

export class CouponService {
  static validateCoupon(
    code: string, 
    userId: string, 
    orderAmount: number, 
    destinationSlug?: string,
    country?: string
  ): CouponValidationResult {
    // Mock implementation - in real app, this would query database
    const mockCoupons: Coupon[] = [
      {
        id: '1',
        code: 'WELCOME10',
        name: 'Chào mừng khách hàng mới',
        description: 'Giảm 10% cho đơn hàng đầu tiên',
        type: 'percentage',
        value: 10,
        minOrderAmount: 1000000, // 1M VND
        maxDiscountAmount: 500000, // 500K VND
        usageLimit: 1000,
        usedCount: 150,
        userLimit: 1,
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31'),
        isActive: true,
        applicableCountries: ['VN'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '2',
        code: 'SUMMER2024',
        name: 'Khuyến mãi mùa hè',
        description: 'Giảm 200,000 VND cho tour mùa hè',
        type: 'fixed',
        value: 200000,
        minOrderAmount: 2000000, // 2M VND
        usageLimit: 500,
        usedCount: 89,
        validFrom: new Date('2024-06-01'),
        validTo: new Date('2024-08-31'),
        isActive: true,
        applicableDestinations: ['halong-bay', 'phu-quoc', 'da-nang'],
        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-06-01')
      },
      {
        id: '3',
        code: 'VIP50',
        name: 'Khách hàng VIP',
        description: 'Giảm 50% cho khách hàng VIP',
        type: 'percentage',
        value: 50,
        minOrderAmount: 5000000, // 5M VND
        maxDiscountAmount: 2000000, // 2M VND
        usageLimit: 100,
        usedCount: 23,
        userLimit: 3,
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31'),
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    const coupon = mockCoupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    
    if (!coupon) {
      return {
        isValid: false,
        discountAmount: 0,
        error: 'Mã giảm giá không tồn tại'
      };
    }

    if (!coupon.isActive) {
      return {
        isValid: false,
        discountAmount: 0,
        error: 'Mã giảm giá đã bị vô hiệu hóa'
      };
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) {
      return {
        isValid: false,
        discountAmount: 0,
        error: 'Mã giảm giá đã hết hạn'
      };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return {
        isValid: false,
        discountAmount: 0,
        error: 'Mã giảm giá đã hết lượt sử dụng'
      };
    }

    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return {
        isValid: false,
        discountAmount: 0,
        error: `Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString('vi-VN')} VNĐ`
      };
    }

    if (coupon.applicableDestinations && destinationSlug && 
        !coupon.applicableDestinations.includes(destinationSlug)) {
      return {
        isValid: false,
        discountAmount: 0,
        error: 'Mã giảm giá không áp dụng cho tour này'
      };
    }

    if (coupon.applicableCountries && country && 
        !coupon.applicableCountries.includes(country)) {
      return {
        isValid: false,
        discountAmount: 0,
        error: 'Mã giảm giá không áp dụng cho quốc gia này'
      };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (orderAmount * coupon.value) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else if (coupon.type === 'fixed') {
      discountAmount = coupon.value;
    }

    return {
      isValid: true,
      discountAmount: Math.min(discountAmount, orderAmount),
      coupon
    };
  }

  static generateCouponCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
