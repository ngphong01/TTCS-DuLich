"use client";

import { useState } from "react";
import { CouponService, type CouponValidationResult } from "@/lib/coupon-system";

interface CouponInputProps {
  onCouponApplied: (result: CouponValidationResult) => void;
  appliedCoupon?: CouponValidationResult;
  orderAmount: number;
  destinationSlug?: string;
  country?: string;
  userId?: string;
}

export default function CouponInput({
  onCouponApplied,
  appliedCoupon,
  orderAmount,
  destinationSlug,
  country = 'VN',
  userId = 'anonymous'
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Vui lòng nhập mã giảm giá");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = CouponService.validateCoupon(
        couponCode.trim(),
        userId,
        orderAmount,
        destinationSlug,
        country
      );

      onCouponApplied(result);
      
      if (result.isValid) {
        setCouponCode("");
      } else {
        setError(result.error || "Mã giảm giá không hợp lệ");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi kiểm tra mã giảm giá");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponApplied({
      isValid: false,
      discountAmount: 0
    });
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Mã giảm giá</h3>
        {appliedCoupon?.isValid && (
          <button
            type="button"
            onClick={handleRemoveCoupon}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Xóa mã
          </button>
        )}
      </div>

      {!appliedCoupon?.isValid ? (
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã giảm giá"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={isValidating}
            />
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={isValidating || !couponCode.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang kiểm tra...
              </>
            ) : (
              <>
                <span>🎫</span>
                Áp dụng
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-green-800">
                  {appliedCoupon.coupon?.name}
                </h4>
                <p className="text-sm text-green-600">
                  Mã: <span className="font-mono font-semibold">{appliedCoupon.coupon?.code}</span>
                </p>
                <p className="text-sm text-green-600">
                  {appliedCoupon.coupon?.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-800">
                -{appliedCoupon.discountAmount.toLocaleString('vi-VN')} VNĐ
              </p>
              <p className="text-sm text-green-600">Đã áp dụng</p>
            </div>
          </div>
        </div>
      )}

      {/* Popular Coupons */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Mã giảm giá phổ biến:</h4>
        <div className="flex flex-wrap gap-2">
          {['WELCOME10', 'SUMMER2024', 'VIP50'].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setCouponCode(code)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
