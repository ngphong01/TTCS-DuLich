
import { useState } from "react";
import { getActivePaymentMethods, getPaymentMethodById, type PaymentMethod } from "@/lib/payment-methods";

interface PaymentMethodsProps {
  selectedMethod: string;
  onMethodChange: (methodId: string) => void;
  country?: string;
  orderAmount: number;
}

export default function PaymentMethods({ 
  selectedMethod, 
  onMethodChange, 
  country = 'VN',
  orderAmount 
}: PaymentMethodsProps) {
  const [showAllMethods, setShowAllMethods] = useState(false);
  
  const activeMethods = getActivePaymentMethods(country);
  const displayedMethods = showAllMethods ? activeMethods : activeMethods.slice(0, 4);

  // Bank transfer info
  const BANK_ACCOUNT_NAME = "DAO VAN PHONG";
  const BANK_ACCOUNT_NUMBER = "02786666666";
  const BANK_QR_URL = process.env.NEXT_PUBLIC_BANK_QR_URL || "/bank-qr.png"; // place image in /public/bank-qr.png

  // Official brand logos (can be overridden by env)
  const LOGO_VNPAY = process.env.NEXT_PUBLIC_LOGO_VNPAY || "/logos/vnpay.svg";
  const LOGO_MOMO = process.env.NEXT_PUBLIC_LOGO_MOMO || "/logos/momo.svg";
  const LOGO_ZALOPAY = process.env.NEXT_PUBLIC_LOGO_ZALOPAY || "/logos/zalopay.svg";
  const LOGO_STRIPE = process.env.NEXT_PUBLIC_LOGO_STRIPE || "/logos/stripe.svg";
  const LOGO_PAYPAL = process.env.NEXT_PUBLIC_LOGO_PAYPAL || "/logos/paypal.svg";

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method.id) {
      case 'vnpay':
        return (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border">
            <img alt="VNPAY" src={LOGO_VNPAY} className="w-12 h-6 object-contain" />
          </div>
        );
      case 'momo':
        return (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white">
            <img alt="MoMo" src={LOGO_MOMO} className="w-7 h-7 object-contain" />
          </div>
        );
      case 'zalopay':
        return (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border">
            <img alt="ZaloPay" src={LOGO_ZALOPAY} className="w-12 h-6 object-contain" />
          </div>
        );
      case 'stripe':
        return (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white">
            <img alt="Stripe" src={LOGO_STRIPE} className="w-12 h-6 object-contain" />
          </div>
        );
      case 'paypal':
        return (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border">
            <img alt="PayPal" src={LOGO_PAYPAL} className="w-12 h-6 object-contain" />
          </div>
        );
      case 'bank_transfer':
        return (
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🏦</span>
          </div>
        );
      case 'cod':
        return (
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">💰</span>
          </div>
        );
      default:
        return <span className="text-2xl">{method.logo}</span>;
    }
  };

  const getMethodBadge = (method: PaymentMethod) => {
    if (method.category === 'domestic') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Nội địa</span>;
    }
    return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Quốc tế</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Phương thức thanh toán</h3>
        <span className="text-sm text-gray-500">{activeMethods.length} phương thức</span>
      </div>

      <div className="grid gap-3">
        {displayedMethods.map((method) => (
          <label
            key={method.id}
            className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={(e) => onMethodChange(e.target.value)}
              className="sr-only"
            />
            
            <div className="flex items-center gap-4 flex-1">
              {getMethodIcon(method)}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-800">{method.name}</h4>
                  {getMethodBadge(method)}
                </div>
                <p className="text-sm text-gray-600">{method.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-gray-500">Phí: {method.fees}</span>
                  {method.countries.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {method.countries.includes('Global') ? 'Toàn cầu' : method.countries.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {selectedMethod === method.id && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </label>
        ))}
      </div>

      {activeMethods.length > 4 && (
        <button
          type="button"
          onClick={() => setShowAllMethods(!showAllMethods)}
          className="w-full py-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
        >
          {showAllMethods ? 'Thu gọn' : `Xem thêm ${activeMethods.length - 4} phương thức khác`}
        </button>
      )}

      {/* Payment Method Details */}
      {selectedMethod && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          {(() => {
            const method = getPaymentMethodById(selectedMethod);
            if (!method) return null;

            return (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Thông tin thanh toán</h4>
                
                {method.id === 'bank_transfer' && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Chuyển khoản vào tài khoản ngân hàng của chúng tôi:
                    </p>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Ngân hàng:</span>
                          <p className="font-medium">Vietcombank</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Số tài khoản:</span>
                          <p className="font-medium">{BANK_ACCOUNT_NUMBER}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Chủ tài khoản:</span>
                          <p className="font-medium">{BANK_ACCOUNT_NAME}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Nội dung:</span>
                          <p className="font-medium">TT {orderAmount.toLocaleString('vi-VN')} VNĐ</p>
                        </div>
                      </div>
                    </div>
                    {/* Bank VietQR image (prefer custom provided) */}
                    <div className="bg-white p-4 rounded-lg border text-center">
                      <div className="w-52 h-72 rounded-lg mx-auto mb-2 overflow-hidden flex items-center justify-center bg-gray-50">
                        <img
                          alt="VietQR"
                          src={BANK_QR_URL}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Quét VietQR để thanh toán nhanh, đúng STK và tên chủ</p>
                    </div>
                  </div>
                )}

                {method.id === 'cod' && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Thanh toán trực tiếp khi gặp hướng dẫn viên:
                    </p>
                    <div className="bg-white p-3 rounded-lg border">
                      <ul className="text-sm space-y-1">
                        <li>• Chỉ áp dụng cho tour nội địa</li>
                        <li>• Thanh toán bằng tiền mặt</li>
                        <li>• Nhận hóa đơn từ hướng dẫn viên</li>
                        <li>• Không cần thanh toán trước</li>
                      </ul>
                    </div>
                  </div>
                )}

                {(method.id === 'momo' || method.id === 'zalopay') && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Quét mã QR để thanh toán:
                    </p>
                    <div className="bg-white p-4 rounded-lg border text-center">
                      <div className="w-40 h-40 rounded-lg mx-auto mb-2 flex items-center justify-center overflow-hidden">
                        <img
                          alt={`${method.name} QR`}
                          className="w-full h-full object-contain"
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                            `${method.id.toUpperCase()}|AMOUNT:${orderAmount}|DESC:Thanh toan tour`
                          )}`}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Số tiền: <span className="font-semibold">{orderAmount.toLocaleString('vi-VN')} VNĐ</span>
                      </p>
                    </div>
                  </div>
                )}

                {method.id === 'vnpay' && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Hỗ trợ thanh toán qua:
                    </p>
                    <div className="bg-white p-3 rounded-lg border">
                      <ul className="text-sm space-y-1">
                        <li>• Thẻ ATM nội địa</li>
                        <li>• Internet Banking</li>
                        <li>• Thẻ tín dụng/ghi nợ quốc tế</li>
                        <li>• Ví điện tử</li>
                      </ul>
                    </div>
                  </div>
                )}

                {(method.id === 'stripe' || method.id === 'paypal') && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Thanh toán quốc tế an toàn:
                    </p>
                    <div className="bg-white p-3 rounded-lg border">
                      <ul className="text-sm space-y-1">
                        <li>• Bảo mật SSL 256-bit</li>
                        <li>• Hỗ trợ 3D Secure</li>
                        <li>• Xác thực OTP</li>
                        <li>• Bảo vệ chống gian lận</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
