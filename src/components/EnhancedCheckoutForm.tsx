"use client";

import { useState } from "react";
import { useSimpleAuth } from "@/lib/use-simple-auth";
import PaymentMethods from "./PaymentMethods";
import CouponInput from "./CouponInput";
import OrderSummary from "./OrderSummary";
import { type CouponValidationResult } from "@/lib/coupon-system";
import { getPaymentMethodById } from "@/lib/payment-methods";

interface EnhancedCheckoutFormProps {
  destinationSlug?: string;
  destinationName?: string;
  basePrice: number;
  guests: number;
  from?: string;
  to?: string;
}

export default function EnhancedCheckoutForm({
  destinationSlug,
  destinationName,
  basePrice,
  guests,
  from,
  to,
}: EnhancedCheckoutFormProps) {
  const { data: session } = useSimpleAuth();
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  // Payment states
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("vnpay");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | undefined>();
  const [bankReceipt, setBankReceipt] = useState<File | null>(null);
  
  // UI states
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Constants
  const serviceFee = 50000; // 50K VND
  const taxRate = 10; // 10% VAT
  const paymentMethod = getPaymentMethodById(selectedPaymentMethod);
  const paymentMethodFee = paymentMethod?.fees.includes('0%') ? 0 : Math.round((basePrice * guests) * 0.01); // 1% fee for paid methods

  const handleCouponApplied = (result: CouponValidationResult) => {
    setAppliedCoupon(result);
    setError(null);
  };

  const handleBankReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File biên lai không được vượt quá 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError("Chỉ chấp nhận file hình ảnh");
        return;
      }
      setBankReceipt(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Client-side phone validation: digits only 8-15
    if (!/^[0-9]{13}$/.test(phone)) {
      setPhoneError("Số điện thoại phải gồm đúng 13 số");
      setError("Số điện thoại không hợp lệ");
      return;
    }
    setPhoneError(null);

    // Email validation: must be user@domain.tld
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(email)) {
      setEmailError("Email không hợp lệ (cần dạng user@domain.tld)");
      setError("Email không hợp lệ");
      return;
    }
    setEmailError(null);

    if (selectedPaymentMethod === 'bank_transfer' && !bankReceipt) {
      setError("Vui lòng upload biên lai chuyển khoản");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create booking
      const bookingData = {
        destination: destinationSlug,
        destinationName,
        guests,
        from,
        to,
        name,
        email,
        phone,
        note: notes,
        price: basePrice * guests,
        paymentMethod: selectedPaymentMethod,
        couponCode: appliedCoupon?.coupon?.code,
        discountAmount: appliedCoupon?.discountAmount || 0,
        serviceFee,
        tax: (basePrice * guests) * (taxRate / 100),
        totalAmount: basePrice * guests + serviceFee + ((basePrice * guests) * (taxRate / 100)) - (appliedCoupon?.discountAmount || 0) + paymentMethodFee
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Đặt chỗ thất bại");
      }

      const booking = await res.json();
      setBookingId(booking.id);
      setSuccess(true);

      // Handle payment based on method
      if (selectedPaymentMethod === 'bank_transfer') {
        // For bank transfer, just show success
        setCurrentStep(3);
      } else if (selectedPaymentMethod === 'cod') {
        // For COD, just show success
        setCurrentStep(3);
      } else {
        // For online payments, redirect to payment gateway
        await handlePayment(booking.id);
      }

    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async (bookingId: string) => {
    setIsProcessing(true);
    
    try {
      if (selectedPaymentMethod === 'stripe') {
        const res = await fetch("/api/checkout/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });
        
        const data = await res.json();
        if (data?.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || "Không thể tạo phiên thanh toán");
        }
      } else if (selectedPaymentMethod === 'vnpay') {
        // Redirect to VNPAY
        const res = await fetch("/api/payments/vnpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });
        
        const data = await res.json();
        if (data?.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || "Không thể tạo phiên thanh toán VNPAY");
        }
      } else if (selectedPaymentMethod === 'momo') {
        // Redirect to MoMo
        const res = await fetch("/api/payments/momo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });
        
        const data = await res.json();
        if (data?.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || "Không thể tạo phiên thanh toán MoMo");
        }
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Có lỗi xảy ra");
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl">✓</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Đặt chỗ thành công!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Cảm ơn bạn đã đặt tour với TravelGo. Chúng tôi sẽ gửi email xác nhận đến <strong>{email}</strong>
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Thông tin đặt chỗ:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Mã đặt chỗ:</strong> {bookingId}</p>
              <p><strong>Tour:</strong> {destinationName}</p>
              <p><strong>Số khách:</strong> {guests} người</p>
              <p><strong>Phương thức thanh toán:</strong> {paymentMethod?.name}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              🏠 Về trang chủ
            </button>
            <button
              onClick={() => window.print()}
              className="w-full bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
            >
              🖨️ In hóa đơn
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          {[
            { step: 1, title: "Thông tin", icon: "👤" },
            { step: 2, title: "Thanh toán", icon: "💳" },
            { step: 3, title: "Xác nhận", icon: "✅" }
          ].map((item) => (
            <div key={item.step} className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
                currentStep >= item.step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > item.step ? '✓' : item.icon}
              </div>
              <span className={`ml-2 font-medium ${
                currentStep >= item.step ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">👤</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Thông tin liên hệ</h2>
                      <p className="text-gray-600">Điền thông tin để chúng tôi liên hệ với bạn</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Nhập họ và tên"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          const r = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
                          setEmailError(r.test(e.target.value) ? null : "Email không hợp lệ");
                        }}
                        pattern="[^\s@]+@[^\s@]+\.[^\s@]{2,}"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                          emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                        }`}
                        placeholder="your@example.com"
                        required
                      />
                      {emailError && (
                        <p className="text-xs text-red-600 mt-1">{emailError}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\s+/g, '');
                        setPhone(val);
                        const ok = /^[0-9]{13}$/.test(val);
                        setPhoneError(ok ? null : 'Số điện thoại phải gồm đúng 13 số');
                      }}
                      inputMode="numeric"
                      pattern="[0-9]{13}"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                        phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                      }`}
                      placeholder="0123456789"
                      required
                    />
                    {phoneError && (
                      <p className="text-xs text-red-600 mt-1">{phoneError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ghi chú thêm
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Yêu cầu đặc biệt, dịch vụ thêm..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                      disabled={Boolean(emailError || phoneError || !name || !email || !phone)}
                    >
                      Tiếp tục →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">💳</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Thanh toán</h2>
                      <p className="text-gray-600">Chọn phương thức thanh toán phù hợp</p>
                    </div>
                  </div>

                  {/* Coupon Input */}
                  <CouponInput
                    onCouponApplied={handleCouponApplied}
                    appliedCoupon={appliedCoupon}
                    orderAmount={basePrice * guests}
                    destinationSlug={destinationSlug}
                    country="VN"
                    userId={session?.user?.email}
                  />

                  {/* Payment Methods */}
                  <PaymentMethods
                    selectedMethod={selectedPaymentMethod}
                    onMethodChange={setSelectedPaymentMethod}
                    country="VN"
                    orderAmount={basePrice * guests}
                  />

                  {/* Bank Transfer Receipt Upload */}
                  {selectedPaymentMethod === 'bank_transfer' && (
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        Biên lai chuyển khoản *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBankReceiptChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                      {bankReceipt && (
                        <p className="text-sm text-green-600">
                          ✓ Đã chọn: {bankReceipt.name}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                    >
                      ← Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isProcessing}
                      className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting || isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {isSubmitting ? 'Đang xử lý...' : 'Đang chuyển hướng...'}
                        </>
                      ) : (
                        <>
                          <span>💳</span>
                          Thanh toán
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center">
                    <span className="text-red-500 mr-2">⚠️</span>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <OrderSummary
            basePrice={basePrice}
            guests={guests}
            serviceFee={serviceFee}
            taxRate={taxRate}
            appliedCoupon={appliedCoupon}
            paymentMethodFee={paymentMethodFee}
          />
        </div>
      </div>
    </div>
  );
}
