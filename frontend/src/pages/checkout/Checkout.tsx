import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PaymentAPI, UserAPI, BookingAPI } from '../../utils/api';
import { getDestinationBySlug } from '../../services/destination';
import {
  CreditCardIcon,
  BanknotesIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('credit_card');
  const [guests, setGuests] = useState<number>(1);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [destinationId, setDestinationId] = useState<number | null>(null);
  const [description, setDescription] = useState('Thanh toán tour TravelGo');
  const [transferNote, setTransferNote] = useState(() => {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    const ts = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 12);
    return `TRAVELGO-${ts}-${rand}`;
  });
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardError, setCardError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [destinationSlug, setDestinationSlug] = useState<string | null>(null);
  const [destinationName, setDestinationName] = useState<string | null>(null);
  const [isCombo, setIsCombo] = useState(false);
  const [comboTitle, setComboTitle] = useState<string | null>(null);
  const [comboIncludes, setComboIncludes] = useState<string[]>([]);
  // Coupons / discounts
  const COUPONS: Record<string, number> = {
    MEMBER10: 10,
    EARLY10: 10,
    GROUP5: 5,
  };
  const [coupon, setCoupon] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  const paymentOptions = [
    {
      id: 'credit_card',
      name: 'Thẻ tín dụng/ghi nợ',
      description: 'Visa, Mastercard, JCB, Amex',
      logo: 'https://s3.gifyu.com/images/kisspng-logo-american-express-credit-card-mastercard-visa-payments-5b65dd0060ddb4.6335528715334023683968.png',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Thanh toán quốc tế an toàn',
      logo: 'https://play-lh.googleusercontent.com/xOKbvDt362x1uzW-nnggP-PgO9HM4L1vwBl5HgHFHy_n1X3mqeBtOSoIyNJzTS3rrj70',
    },
    {
      id: 'bank_qr',
      name: 'Chuyển khoản VietQR',
      description: 'Ngân hàng nội địa, ví điện tử',
      logo: '/logos/vnpay.svg',
    },
  ] as const;

  const formatCardNumber = (value: string) =>
    value
      .replace(/\D/g, '')
      .slice(0, 19)
      .replace(/(.{4})/g, '$1 ')
      .trim();

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length <= 2) return cleaned;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  };

  const detectCardBrand = (digits: string) => {
    if (/^4/.test(digits)) return 'Visa';
    if (/^5[1-5]/.test(digits)) return 'Mastercard';
    if (/^3[47]/.test(digits)) return 'American Express';
    if (/^35/.test(digits)) return 'JCB';
    if (/^6(?:011|5)/.test(digits)) return 'Discover';
    return 'Thẻ';
  };

  const validateCreditCard = () => {
    const sanitized = cardNumber.replace(/\s+/g, '');
    if (!cardHolder.trim()) return 'Vui lòng nhập tên chủ thẻ như trên thẻ.';
    if (!/^\d{13,19}$/.test(sanitized)) return 'Số thẻ không hợp lệ.';
    const expiryMatch = cardExpiry.match(/^(\d{2})\/(\d{2})$/);
    if (!expiryMatch) return 'Ngày hết hạn phải có định dạng MM/YY.';
    const month = Number(expiryMatch[1]);
    const year = Number(expiryMatch[2]) + 2000;
    if (month < 1 || month > 12) return 'Tháng hết hạn không hợp lệ.';
    const expiryDate = new Date(year, month);
    if (expiryDate <= new Date()) return 'Thẻ đã hết hạn.';
    if (!/^\d{3,4}$/.test(cardCvv)) return 'CVV phải gồm 3-4 chữ số.';
    return null;
  };

  const handleMethodChange = (value: string) => {
    setMethod(value);
    if (value !== 'credit_card') {
      setCardError(null);
    }
  };

  const renderCardDetails = () => (
    <div className="border-2 border-blue-100 rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-purple-50 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700">Chi tiết thẻ</p>
          <p className="text-xs text-gray-500">
            Chúng tôi chỉ lưu 4 số cuối để xác nhận giao dịch.
          </p>
        </div>
        <span className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full">
          {detectCardBrand(cardNumber.replace(/\s+/g, ''))}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tên chủ thẻ
          </label>
          <input
            value={cardHolder}
            onChange={(e) => {
              setCardHolder(e.target.value.toUpperCase());
              setCardError(null);
            }}
            placeholder="NGUYEN VAN A"
            autoComplete="cc-name"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Số thẻ
          </label>
          <input
            value={cardNumber}
            onChange={(e) => {
              setCardNumber(formatCardNumber(e.target.value));
              setCardError(null);
            }}
            placeholder="1234 5678 9012 3456"
            inputMode="numeric"
            autoComplete="cc-number"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Ngày hết hạn (MM/YY)
            </label>
            <input
              value={cardExpiry}
              onChange={(e) => {
                setCardExpiry(formatExpiry(e.target.value));
                setCardError(null);
              }}
              placeholder="08/27"
              inputMode="numeric"
              autoComplete="cc-exp"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              CVV
            </label>
            <input
              value={cardCvv}
              onChange={(e) => {
                setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
                setCardError(null);
              }}
              placeholder="123"
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>
        {cardError && (
          <p className="text-sm text-red-600 font-semibold">{cardError}</p>
        )}
      </div>
    </div>
  );

  function applyCoupon(code: string) {
    const normalized = (code || '').trim().toUpperCase();
    if (!normalized) {
      setDiscountPercent(0);
      setCouponMsg(null);
      return;
    }
    const pct = COUPONS[normalized];
    if (pct) {
      setDiscountPercent(pct);
      setCouponMsg(`Áp dụng mã ${normalized}: giảm ${pct}%`);
    } else {
      setDiscountPercent(0);
      setCouponMsg('Mã không hợp lệ hoặc đã hết hạn');
    }
  }

  // Prefill from query: ?amount=... or ?slug=...&guests=... or ?type=combo&...
  useEffect(() => {
    const qAmount = searchParams.get('amount');
    const slug = searchParams.get('slug') || searchParams.get('destination');
    const qGuests = Number(searchParams.get('guests') || '1');
    const qMethod = searchParams.get('method');
    const type = searchParams.get('type');
    const title = searchParams.get('title');
    const includes = searchParams.get('includes');
    
    if (qMethod) setMethod(qMethod);
    setGuests(Math.max(1, qGuests));
    
    // Check if this is a combo booking
    if (type === 'combo') {
      setIsCombo(true);
      if (title) {
        setComboTitle(decodeURIComponent(title));
        setDescription(`Thanh toán combo: ${decodeURIComponent(title)}`);
      }
      if (includes) {
        try {
          const parsed = JSON.parse(decodeURIComponent(includes));
          setComboIncludes(Array.isArray(parsed) ? parsed : []);
        } catch {
          setComboIncludes([]);
        }
      }
      if (qAmount) {
        setAmount(qAmount);
        setBasePrice(Number(qAmount));
      }
      return;
    }
    
    // Regular tour booking
    if (qAmount) {
      setAmount(qAmount);
      return;
    }
    if (slug) {
      setDestinationSlug(slug);
      getDestinationBySlug(slug)
        .then((dest) => {
          const price = Number(dest?.price || 0);
          setDestinationId((dest as any)?.id ?? null);
          setDestinationName((dest as any)?.name ?? null);
          setBasePrice(price);
          if (price > 0) {
            setAmount(String(price * Math.max(1, qGuests)));
            setDescription(`Thanh toán tour: ${dest.name}`);
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  // Totals
  const subtotal = useMemo(() => Number(amount || 0), [amount]);
  const discountAmount = useMemo(
    () => Math.max(0, Math.round(subtotal * (discountPercent / 100))),
    [subtotal, discountPercent]
  );
  const finalAmount = useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount]);
  const formattedVnd = useMemo(() => subtotal.toLocaleString('vi-VN'), [subtotal]);
  const formattedDiscount = useMemo(() => (discountAmount || 0).toLocaleString('vi-VN'), [discountAmount]);
  const formattedFinal = useMemo(() => finalAmount.toLocaleString('vi-VN'), [finalAmount]);
  const qr = useMemo(() => {
    const amountNumber = Number(finalAmount || 0);
    const bank = (process.env.REACT_APP_VIETQR_BANK as string | undefined) || 'tpbank';
    const account = (process.env.REACT_APP_VIETQR_ACCOUNT as string | undefined) || '77601112004';
    const accountName = (process.env.REACT_APP_VIETQR_NAME as string | undefined) || 'DAO VAN PHONG';
    const addInfo = transferNote;

    const vietqrUrl = bank && account
      ? `https://img.vietqr.io/image/${bank}-${account}-compact2.jpg?amount=${amountNumber}&addInfo=${encodeURIComponent(addInfo)}${accountName ? `&accountName=${encodeURIComponent(accountName)}` : ''}`
      : null;

    const text = `Thanh toan TravelGo\nSo tien: ${finalAmount.toLocaleString('vi-VN')} VND\nNoi dung: ${transferNote}`;
    const generic = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
    const fallback = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(text)}`;

    return {
      primary: vietqrUrl || generic,
      fallback,
    };
  }, [finalAmount, transferNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Optional: create a booking first (demo values)
    try {
      setErrorMsg(null);
      setSubmitting(true);
      if (method === 'credit_card') {
        const cardValidationError = validateCreditCard();
        if (cardValidationError) {
          setCardError(cardValidationError);
          setSubmitting(false);
          return;
        }
        setCardError(null);
      }
      const sanitizedCardNumber =
        method === 'credit_card' ? cardNumber.replace(/\s+/g, '') : '';
      const cardMeta =
        method === 'credit_card'
          ? {
              holder: cardHolder.trim(),
              brand: detectCardBrand(sanitizedCardNumber),
              last4: sanitizedCardNumber.slice(-4),
              expiry: cardExpiry,
            }
          : null;

      if (!finalAmount || Number(finalAmount) <= 0) {
        throw new Error('Vui lòng nhập số tiền hợp lệ.');
      }
      const appliedCoupon = (coupon || '').trim().toUpperCase();
      const hasCoupon = !!appliedCoupon && discountPercent > 0 && discountAmount > 0;
      const token = localStorage.getItem('tg_token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để tạo đơn và thanh toán.');
      }
      const current = await UserAPI.current();
      const userId = (current as any)?.user?.id;
      if (!userId) throw new Error('Vui lòng đăng nhập để tạo đơn và thanh toán.');
      
      // Handle combo booking differently
      if (isCombo) {
        // For combo, we don't need destinationId - create a special combo booking
        const bookingPayload:any = {
          type: 'combo',
          comboTitle: comboTitle || 'Combo du lịch',
          comboIncludes: comboIncludes,
          guests,
          name: (current as any)?.user?.name || 'Khách hàng',
          email: (current as any)?.user?.email,
          price: Number(finalAmount),
          totalAmount: Number(finalAmount),
          paymentMethod: method === 'bank_qr' ? 'bank_transfer' : method,
        } as any;
        if (cardMeta) {
          bookingPayload.cardInfo = cardMeta;
        }
        if (hasCoupon) {
          bookingPayload.coupon = appliedCoupon;
          bookingPayload.discountPercent = discountPercent;
          bookingPayload.discountAmount = discountAmount;
        }
        const booking = await BookingAPI.create(bookingPayload as any);
        const bookingId = (booking as any)?.id || (booking as any)?.booking?.id;
        if (!bookingId) {
          throw new Error('Không thể tạo đơn combo (thiếu mã đơn).');
        }
        const paymentPayload: any = { bookingId, provider: method, amount: Number(finalAmount), note: `${description || 'Thanh toán TravelGo'} | REF:${transferNote}` };
        if (cardMeta) {
          paymentPayload.cardInfo = cardMeta;
        }
        if (hasCoupon) {
          paymentPayload.coupon = appliedCoupon;
          paymentPayload.discountPercent = discountPercent;
          paymentPayload.discountAmount = discountAmount;
        }
        const paymentResponse = await PaymentAPI.create(paymentPayload);
        // Redirect to payment gateway if URL is provided (PayPal or Stripe)
        if (paymentResponse?.url && (method === 'paypal' || method === 'credit_card')) {
          window.location.href = paymentResponse.url as string;
          return;
        }
      } else {
        // Regular tour booking
        if (!destinationId) {
          throw new Error('Vui lòng mở một điểm đến và bấm "Đặt ngay" để tới trang thanh toán.');
        }
        const bookingPayload: any = {
          destination: destinationSlug,
          destinationName: destinationName || undefined,
          guests,
          name: (current as any)?.user?.name || 'Khách hàng',
          email: (current as any)?.user?.email,
          price: Number(finalAmount),
          totalAmount: Number(finalAmount),
          paymentMethod: method === 'bank_qr' ? 'bank_transfer' : method,
        };
        if (cardMeta) {
          bookingPayload.cardInfo = cardMeta;
        }
        if (hasCoupon) {
          bookingPayload.coupon = appliedCoupon;
          bookingPayload.discountPercent = discountPercent;
          bookingPayload.discountAmount = discountAmount;
        }
        const booking = await BookingAPI.create(bookingPayload as any);
        const bookingId = (booking as any)?.id || (booking as any)?.booking?.id;
        if (!bookingId) {
          throw new Error('Không thể tạo đơn (thiếu mã đơn).');
        }
        const paymentPayload: any = { bookingId, provider: method, amount: Number(finalAmount), note: `${description || 'Thanh toán TravelGo'} | REF:${transferNote}` };
        if (cardMeta) {
          paymentPayload.cardInfo = cardMeta;
        }
        if (hasCoupon) {
          paymentPayload.coupon = appliedCoupon;
          paymentPayload.discountPercent = discountPercent;
          paymentPayload.discountAmount = discountAmount;
        }
        const paymentResponse = await PaymentAPI.create(paymentPayload);
        // Redirect to payment gateway if URL is provided (PayPal or Stripe)
        if (paymentResponse?.url && (method === 'paypal' || method === 'credit_card')) {
          window.location.href = paymentResponse.url as string;
          return;
        }
      }
      // thông báo để trang Payments có thể tự refetch khi quay về
      window.dispatchEvent(new Event('payment-created'));
    } catch (err: any) {
      // Nếu không tạo được booking (khách chưa đăng nhập), hiển thị lỗi rõ ràng
      let errorMessage = err?.message || 'Không thể tạo đơn/thanh toán.';
      
      // Hiển thị thông báo thân thiện hơn cho lỗi PayPal
      if (errorMessage.includes('PayPal authentication failed') || errorMessage.includes('invalid_client')) {
        errorMessage = 'Lỗi xác thực PayPal. Vui lòng thử lại sau hoặc chọn phương thức thanh toán khác.';
      } else if (errorMessage.includes('PayPal')) {
        errorMessage = 'Không thể kết nối với PayPal. Vui lòng thử lại sau hoặc chọn phương thức thanh toán khác.';
      }
      
      setErrorMsg(errorMessage);
      setSubmitting(false);
      return;
    }
    setSuccess(true);
    setSubmitting(false);
    setTimeout(() => navigate('/account/payments'), 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 px-8 py-6 text-white">
            <h1 className="text-3xl font-bold mb-2">
              {isCombo ? 'Thanh toán combo' : 'Thanh toán tour'}
            </h1>
            <p className="text-blue-100 text-sm">
              {isCombo ? 'Thanh toán gói combo du lịch' : 'Điền thông tin và xác nhận thanh toán'}
            </p>
          </div>

          {/* Combo Info */}
          {isCombo && comboTitle && (
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CalendarDaysIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{comboTitle}</h3>
                  {comboIncludes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Bao gồm:</p>
                      <ul className="space-y-1.5">
                        {comboIncludes.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tour Info */}
          {!isCombo && destinationName && (
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CalendarDaysIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{destinationName}</h3>
                  <p className="text-sm text-gray-600 mt-1">Tour du lịch</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {success && (
            <div className="px-8 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircleIcon className="w-6 h-6" />
                <span className="font-semibold">Thanh toán thành công! Đang chuyển hướng...</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <BanknotesIcon className="w-5 h-5 text-blue-600" />
                Số tiền (VNĐ)
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold transition-all"
                  placeholder="Nhập số tiền"
                  type="number"
                  value={amount}
                  onChange={e=>{ if (basePrice <= 0) setAmount(e.target.value); }}
                  readOnly={basePrice > 0}
                  required
                />
                {basePrice > 0 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <span className="text-gray-400 text-sm">🔒</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Tổng: <span className="font-bold text-blue-600 text-lg">{formattedVnd} VNĐ</span>
                </span>
                {basePrice > 0 && (
                  <span className="text-gray-400">(tự tính = giá tour × số khách)</span>
                )}
              </div>
            </div>

            {/* Guests Control - Tour */}
            {(basePrice > 0 && !isCombo) && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <UserGroupIcon className="w-5 h-5 text-blue-600" />
                  Số khách
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={()=>{ const g = Math.max(1, guests-1); setGuests(g); setAmount(String(basePrice * g)); }}
                    className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all font-bold text-gray-700 flex items-center justify-center"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={guests}
                    onChange={(e)=>{ const g = Math.max(1, Number(e.target.value||1)); setGuests(g); setAmount(String(basePrice * g)); }}
                    className="w-24 text-center px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-lg"
                  />
                  <button
                    type="button"
                    onClick={()=>{ const g = guests+1; setGuests(g); setAmount(String(basePrice * g)); }}
                    className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all font-bold text-gray-700 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Giá cơ bản: <span className="font-semibold">{basePrice.toLocaleString('vi-VN')} VNĐ/người</span>
                </p>
              </div>
            )}
            
            {/* Guests Control - Combo */}
            {isCombo && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <UserGroupIcon className="w-5 h-5 text-blue-600" />
                  Số người
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={()=>{ const g = Math.max(1, guests-1); setGuests(g); }}
                    className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all font-bold text-gray-700 flex items-center justify-center"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={guests}
                    onChange={(e)=>{ const g = Math.max(1, Number(e.target.value||1)); setGuests(g); }}
                    className="w-24 text-center px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-lg"
                  />
                  <button
                    type="button"
                    onClick={()=>{ const g = guests+1; setGuests(g); }}
                    className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all font-bold text-gray-700 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Giá combo đã bao gồm tất cả dịch vụ
                </p>
              </div>
            )}

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <CreditCardIcon className="w-5 h-5 text-blue-600" />
                Phương thức thanh toán
              </label>
              {/* Coupon */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-2">
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e)=> setCoupon(e.target.value)}
                    placeholder="Nhập mã khuyến mãi (ví dụ: MEMBER10)"
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={()=> applyCoupon(coupon)}
                    className="px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                  >
                    Áp dụng
                  </button>
                </div>
                {couponMsg && (
                  <p className={`mt-2 text-sm ${discountPercent ? 'text-green-600' : 'text-red-600'}`}>{couponMsg}</p>
                )}
                <div className="mt-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-semibold">{formattedVnd} VNĐ</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Giảm giá {discountPercent}%</span>
                    <span className="font-semibold">− {formattedDiscount} VNĐ</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
                    <span className="font-bold text-gray-900">Cần thanh toán</span>
                    <span className="font-bold text-blue-600 text-lg">{formattedFinal} VNĐ</span>
                  </div>
                </div>
              </div>
              <div className="grid gap-3">
                {paymentOptions.map((option) => {
                  const selected = method === option.id;
                  return (
                    <div key={option.id} className="space-y-3">
                      <button
                        type="button"
                        onClick={() => handleMethodChange(option.id)}
                        className={`flex items-center justify-between w-full px-4 py-4 border-2 rounded-2xl transition-all ${
                          selected
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-10 flex items-center justify-center bg-white rounded-xl border border-gray-200">
                            <img
                              src={option.logo}
                              alt={option.name}
                              className="max-h-8 object-contain"
                            />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-gray-900">{option.name}</p>
                            <p className="text-xs text-gray-500">{option.description}</p>
                          </div>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                          }`}
                        >
                          {selected && (
                            <span className="w-2.5 h-2.5 bg-white rounded-full block"></span>
                          )}
                        </div>
                      </button>
                      {selected && option.id === 'credit_card' && renderCardDetails()}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QR Code Section */}
            {method === 'bank_qr' && (
              <div className="border-2 border-blue-100 rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BanknotesIcon className="w-6 h-6 text-blue-600" />
                  Quét mã VietQR để thanh toán
                </h3>
                
                <div className="bg-white rounded-xl p-6 shadow-lg mb-6 flex justify-center">
                  <img
                    src={qr.primary}
                    alt="VietQR"
                    className="max-w-full h-auto rounded-lg"
                    style={{ maxHeight: '400px' }}
                    onError={(e)=>{ (e.target as HTMLImageElement).src = qr.fallback; }}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả thanh toán</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={description}
                      onChange={e=>setDescription(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">Nội dung chuyển khoản</label>
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1"
                        onClick={async()=>{
                          try {
                            await navigator.clipboard.writeText(transferNote);
                            setCopied(true);
                            setTimeout(()=>setCopied(false), 2000);
                          } catch {}
                        }}
                      >
                        <ClipboardDocumentIcon className="w-4 h-4" />
                        {copied ? 'Đã copy!' : 'Copy'}
                      </button>
                    </div>
                    <div className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
                      <span className="font-mono text-sm text-gray-800 break-all">{transferNote}</span>
                      {copied && (
                        <span className="ml-3 text-green-600 text-xs font-semibold flex items-center gap-1">
                          <CheckCircleIcon className="w-4 h-4" />
                          Đã copy
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl px-4 py-3 border-2 border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Số tiền cần chuyển:</span>
                      <span className="text-lg font-bold text-blue-600">{formattedVnd} VNĐ</span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                    <p className="text-xs text-yellow-800">
                      ⚠️ <strong>Lưu ý:</strong> Ghi đúng nội dung chuyển khoản và số tiền để tự động đối soát. Sau khi chuyển khoản thành công, nhấn "Thanh toán" để xác nhận.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                <div className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5">⚠️</div>
                <p className="text-red-700 text-sm font-medium">{errorMsg}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !amount || Number(amount) <= 0}
              className={`w-full px-6 py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all transform ${
                (!amount || Number(amount) <= 0 || submitting)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 hover:from-cyan-600 hover:via-teal-600 hover:to-sky-600 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Đang xử lý…
                </span>
              ) : (
                '💳 Thanh toán ngay'
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="px-8 pb-6 border-t border-gray-100 pt-6">
            <Link
              to="/account/payments"
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-2 hover:underline"
            >
              <CalendarDaysIcon className="w-4 h-4" />
              Xem lịch sử thanh toán
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
