
import { type CouponValidationResult } from "../lib/coupon-system";

interface OrderSummaryProps {
  basePrice: number;
  guests: number;
  serviceFee: number;
  taxRate: number;
  appliedCoupon?: CouponValidationResult;
  paymentMethodFee?: number;
}

export default function OrderSummary({
  basePrice,
  guests,
  serviceFee,
  taxRate,
  appliedCoupon,
  paymentMethodFee = 0
}: OrderSummaryProps) {
  const subtotal = basePrice * guests;
  const discountAmount = (appliedCoupon?.isValid || appliedCoupon?.valid) ? (appliedCoupon.discountAmount || appliedCoupon.discount || 0) : 0;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const tax = afterDiscount * (taxRate / 100);
  const total = afterDiscount + serviceFee + tax + paymentMethodFee;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VNĐ';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Tóm tắt đơn hàng</h3>
      
      <div className="space-y-4">
        {/* Base Price */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-700">Giá tour cơ bản</p>
            <p className="text-sm text-gray-500">{guests} người × {formatCurrency(basePrice)}</p>
          </div>
          <span className="font-semibold text-gray-800">{formatCurrency(subtotal)}</span>
        </div>

        {/* Discount */}
        {(appliedCoupon?.isValid || appliedCoupon?.valid) && (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-600">Giảm giá</p>
              <p className="text-sm text-green-500">
                {appliedCoupon.coupon?.code} - {appliedCoupon.coupon?.name}
              </p>
            </div>
            <span className="font-semibold text-green-600">
              -{formatCurrency(discountAmount)}
            </span>
          </div>
        )}

        {/* Service Fee */}
        {serviceFee > 0 && (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-700">Phí dịch vụ</p>
              <p className="text-sm text-gray-500">Hỗ trợ khách hàng 24/7</p>
            </div>
            <span className="font-semibold text-gray-800">{formatCurrency(serviceFee)}</span>
          </div>
        )}

        {/* Tax */}
        {tax > 0 && (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-700">Thuế VAT</p>
              <p className="text-sm text-gray-500">{taxRate}%</p>
            </div>
            <span className="font-semibold text-gray-800">{formatCurrency(tax)}</span>
          </div>
        )}

        {/* Payment Method Fee */}
        {paymentMethodFee > 0 && (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-700">Phí thanh toán</p>
              <p className="text-sm text-gray-500">Phí xử lý giao dịch</p>
            </div>
            <span className="font-semibold text-gray-800">{formatCurrency(paymentMethodFee)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-bold text-gray-800">Tổng cộng</h4>
            <span className="text-2xl font-bold text-blue-600">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Savings Info */}
        {discountAmount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-green-600">🎉</span>
              <p className="text-sm text-green-700">
                Bạn đã tiết kiệm <span className="font-semibold">{formatCurrency(discountAmount)}</span>
              </p>
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">💳</span>
            <p className="text-sm text-blue-700">
              Thanh toán an toàn với mã hóa SSL 256-bit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
