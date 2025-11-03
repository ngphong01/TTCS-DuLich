// Coupon system stub
export interface CouponValidationResult {
  valid: boolean;
  isValid?: boolean; // Alias for valid
  discount?: number;
  discountAmount?: number; // Alias for discount
  error?: string;
  coupon?: {
    code: string;
    name: string;
    description?: string;
  };
}

export class CouponService {
  static async validate(code: string): Promise<CouponValidationResult> {
    return { valid: false, isValid: false, error: "Coupon system not implemented" };
  }

  static async validateCoupon(
    code: string,
    userId?: string | number,
    orderAmount?: number
  ): Promise<CouponValidationResult> {
    // Stub implementation
    return { 
      valid: false, 
      isValid: false, 
      discountAmount: 0,
      error: "Coupon system not implemented" 
    };
  }
}

