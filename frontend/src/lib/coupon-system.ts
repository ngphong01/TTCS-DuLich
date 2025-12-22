// Coupon system - Real API integration
export interface CouponValidationResult {
  valid: boolean;
  isValid?: boolean; // Alias for valid
  discount?: number;
  discountAmount?: number; // Alias for discount
  error?: string;
  message?: string;
  coupon?: {
    code: string;
    name?: string;
    description?: string;
  };
}

export class CouponService {
  static async validate(code: string, orderAmount?: number): Promise<CouponValidationResult> {
    try {
      const params = new URLSearchParams();
      if (orderAmount) params.set('amount', orderAmount.toString());
      
      const response = await fetch(`/api/promo/validate/${code}?${params}`);
      const data = await response.json();

      if (data.valid) {
        return {
          valid: true,
          isValid: true,
          discountAmount: data.discountAmount,
          discount: data.discountAmount,
          coupon: {
            code: data.code,
            description: data.description,
          },
        };
      } else {
        return {
          valid: false,
          isValid: false,
          discountAmount: 0,
          discount: 0,
          error: data.message || 'Mã giảm giá không hợp lệ',
          message: data.message,
        };
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        valid: false,
        isValid: false,
        discountAmount: 0,
        discount: 0,
        error: 'Lỗi xác thực mã giảm giá',
      };
    }
  }

  static async validateCoupon(
    code: string,
    userId?: string | number,
    orderAmount?: number
  ): Promise<CouponValidationResult> {
    return this.validate(code, orderAmount);
  }
}

