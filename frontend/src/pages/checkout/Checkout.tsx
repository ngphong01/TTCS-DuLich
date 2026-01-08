import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PaymentAPI, UserAPI, BookingAPI } from '../../utils/api';
import { getDestinationBySlug } from '../../services/destination';
import { getTourById, getTourBySlug } from '../../services/tour';
import {
  CreditCardIcon,
  BanknotesIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';

// Types
interface PaymentOption {
  id: 'credit_card' | 'paypal' | 'bank_qr';
  name: string;
  description: string;
  logo: string;
}

interface CardMeta {
  holder: string;
  brand: string;
  last4: string;
  expiry: string;
}

interface UserData {
  id: number;
  email?: string;
  name?: string;
  fullName?: string;
  username?: string;
}

// Constants
const COUPONS: Record<string, number> = {
  MEMBER10: 10,
  EARLY10: 10,
  GROUP5: 5,
};

const PAYMENT_OPTIONS: PaymentOption[] = [
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
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Utility functions
const generateTransferNote = (): string => {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const ts = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 12);
  return `TRAVELGO-${ts}-${rand}`;
};

const formatCardNumber = (value: string): string =>
  value
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();

const formatExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length <= 2) return cleaned;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
};

const detectCardBrand = (digits: string): string => {
  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^35/.test(digits)) return 'JCB';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';
  return 'Thẻ';
};

const formatCurrency = (value: number): string => {
  return (value || 0).toLocaleString('vi-VN');
};

const getErrorMessage = (err: any, context: string): string => {
  let errorMessage = `Không thể tải thông tin ${context}. `;

  if (err?.response?.status === 404) {
    errorMessage += `${context} không tồn tại. `;
  } else if (err?.response?.status === 400) {
    errorMessage += 'Dữ liệu không hợp lệ. ';
  } else if (err?.code === 'NETWORK_ERROR' || err?.message?.includes('Network')) {
    errorMessage += 'Lỗi kết nối mạng. ';
  } else if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
    errorMessage += 'Hết thời gian chờ. ';
  }

  errorMessage += 'Vui lòng nhập số tiền thủ công hoặc thử lại sau.';
  return errorMessage;
};

const getUserDisplayName = (user: UserData): string => {
  return user?.name || user?.fullName || user?.username || 'Khách hàng';
};

const validateUserEmail = (email: string | undefined): string | null => {
  if (!email) {
    return 'Tài khoản của bạn chưa có email. Vui lòng cập nhật email trong phần cài đặt tài khoản trước khi thanh toán.';
  }
  if (!EMAIL_REGEX.test(email)) {
    return 'Email không hợp lệ. Vui lòng cập nhật email trong phần cài đặt tài khoản.';
  }
  return null;
};

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Form state
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<PaymentOption['id']>('credit_card');
  const [guests, setGuests] = useState<number>(1);
  const [description, setDescription] = useState<string>('Thanh toán tour TravelGo');
  const [transferNote] = useState<string>(generateTransferNote);
  const [coupon, setCoupon] = useState<string>('');

  // Card details
  const [cardHolder, setCardHolder] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardError, setCardError] = useState<string | null>(null);

  // Data state
  const [basePrice, setBasePrice] = useState<number>(0);
  const [destinationId, setDestinationId] = useState<number | null>(null);
  const [destinationSlug, setDestinationSlug] = useState<string | null>(null);
  const [destinationName, setDestinationName] = useState<string | null>(null);

  // Tour booking state
  const [tourId, setTourId] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState<string | null>(null);
  const [adultsCount, setAdultsCount] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>(0);

  // Combo state
  const [isCombo, setIsCombo] = useState<boolean>(false);
  const [comboTitle, setComboTitle] = useState<string | null>(null);
  const [comboIncludes, setComboIncludes] = useState<string[]>([]);

  // Discount state
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Calculated values
  const subtotal = useMemo(() => Number(amount || 0), [amount]);

  const discountAmount = useMemo(
    () => Math.max(0, Math.round(subtotal * (discountPercent / 100))),
    [subtotal, discountPercent]
  );

  const finalAmount = useMemo(
    () => Math.max(0, subtotal - discountAmount),
    [subtotal, discountAmount]
  );

  const formattedVnd = useMemo(() => formatCurrency(subtotal), [subtotal]);
  const formattedDiscount = useMemo(() => formatCurrency(discountAmount), [discountAmount]);
  const formattedFinal = useMemo(() => formatCurrency(finalAmount), [finalAmount]);

  // QR code generation
  const qr = useMemo(() => {
    const amountNumber = Number(finalAmount || 0);
    const bank = process.env.REACT_APP_VIETQR_BANK || 'tpbank';
    const account = process.env.REACT_APP_VIETQR_ACCOUNT || '77601112004';
    const accountName = process.env.REACT_APP_VIETQR_NAME || 'DAO VAN PHONG';

    const vietqrUrl =
      bank && account
        ? `https://img.vietqr.io/image/${bank}-${account}-compact2.jpg?amount=${amountNumber}&addInfo=${encodeURIComponent(transferNote)}${accountName ? `&accountName=${encodeURIComponent(accountName)}` : ''}`
        : null;

    const text = `Thanh toan TravelGo\nSo tien: ${formatCurrency(finalAmount)} VND\nNoi dung: ${transferNote}`;
    const generic = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
    const fallback = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(text)}`;

    return {
      primary: vietqrUrl || generic,
      fallback,
    };
  }, [finalAmount, transferNote]);

  // Validation
  const validateCreditCard = useCallback((): string | null => {
    const sanitized = cardNumber.replace(/\s+/g, '');

    if (!cardHolder.trim()) {
      return 'Vui lòng nhập tên chủ thẻ như trên thẻ.';
    }

    if (!/^\d{13,19}$/.test(sanitized)) {
      return 'Số thẻ không hợp lệ.';
    }

    const expiryMatch = cardExpiry.match(/^(\d{2})\/(\d{2})$/);
    if (!expiryMatch) {
      return 'Ngày hết hạn phải có định dạng MM/YY.';
    }

    const month = Number(expiryMatch[1]);
    const year = Number(expiryMatch[2]) + 2000;

    if (month < 1 || month > 12) {
      return 'Tháng hết hạn không hợp lệ.';
    }

    const expiryDate = new Date(year, month);
    if (expiryDate <= new Date()) {
      return 'Thẻ đã hết hạn.';
    }

    if (!/^\d{3,4}$/.test(cardCvv)) {
      return 'CVV phải gồm 3-4 chữ số.';
    }

    return null;
  }, [cardHolder, cardNumber, cardExpiry, cardCvv]);

  // Coupon handler
  const applyCoupon = useCallback((code: string) => {
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
  }, []);

  // Method change handler
  const handleMethodChange = useCallback((value: PaymentOption['id']) => {
    setMethod(value);
    if (value !== 'credit_card') {
      setCardError(null);
    }
  }, []);

  // Guest change handlers
  const handleGuestChange = useCallback(
    (newGuests: number) => {
      const g = Math.max(1, newGuests);
      setGuests(g);
      if (basePrice > 0 && !isCombo) {
        setAmount(String(basePrice * g));
      }
    },
    [basePrice, isCombo]
  );

  // Copy to clipboard
  const handleCopyTransferNote = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(transferNote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [transferNote]);

  // Calculate tour price
  const calculateTourPrice = useCallback(
    (price: number, adults: number, children: number): number => {
      const totalPrice = price * adults + price * 0.7 * children;
      const serviceFee = totalPrice * 0.05;
      return Math.round(totalPrice + serviceFee);
    },
    []
  );

  // Fetch tour by ID with slug fallback
  const fetchTourData = useCallback(
    async (tourIdParam: number, tourSlug: string | null, adults: number, children: number) => {
      try {
        const tour = await getTourById(tourIdParam);

        setErrorMsg(null);
        const price = Number(tour?.price || 0);

        if (price > 0) {
          const calculatedAmount = calculateTourPrice(price, adults, children);

          setBasePrice(price);
          setDestinationId(tour?.destinationId || null);
          setDestinationName(tour?.name || null);
          setDestinationSlug(tourSlug || tour?.slug || null);
          setDescription(`Thanh toán tour: ${tour.name || 'Tour'}`);
          setGuests(adults + children);
          setAmount(String(calculatedAmount));
        } else {
          setErrorMsg('Tour không có giá. Vui lòng liên hệ hỗ trợ.');
          setBasePrice(0);
        }
      } catch (err: any) {
        if (tourSlug && err?.response?.status === 404) {
          try {
            const tour = await getTourBySlug(tourSlug);

            setErrorMsg(null);
            const price = Number(tour?.price || 0);

            if (price > 0) {
              const calculatedAmount = calculateTourPrice(price, adults, children);

              setBasePrice(price);
              setDestinationId(tour?.destinationId || null);
              setDestinationName(tour?.name || null);
              setDestinationSlug(tourSlug);
              setDescription(`Thanh toán tour: ${tour.name || 'Tour'}`);
              setGuests(adults + children);
              setAmount(String(calculatedAmount));
              if (tour?.id) {
                setTourId(tour.id);
              }
            } else {
              setErrorMsg('Tour không có giá. Vui lòng liên hệ hỗ trợ.');
              setBasePrice(0);
            }
          } catch (slugErr: any) {
            setErrorMsg(getErrorMessage(slugErr, 'tour'));
            setBasePrice(0);
          }
        } else {
          setErrorMsg(getErrorMessage(err, 'tour'));
          setBasePrice(0);
        }
      } finally {
        setIsLoadingData(false);
      }
    },
    [calculateTourPrice]
  );

  // Fetch destination data
  const fetchDestinationData = useCallback(async (slug: string, qGuests: number) => {
    try {
      setDestinationSlug(slug);
      const dest = await getDestinationBySlug(slug);

      const price = Number(dest?.price || 0);

      setDestinationId((dest as any)?.id ?? null);
      setDestinationName((dest as any)?.name ?? null);
      setBasePrice(price);

      if (price > 0) {
        const totalAmount = price * Math.max(1, qGuests);
        setAmount(String(totalAmount));
        setDescription(`Thanh toán tour: ${dest.name || 'Điểm đến'}`);
      } else {
        setErrorMsg(
          'Điểm đến này không có giá. Vui lòng liên hệ hỗ trợ hoặc nhập số tiền thủ công.'
        );
      }
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err, 'điểm đến'));
      setBasePrice(0);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Initialize from URL params
  useEffect(() => {
    setIsLoadingData(true);

    const qAmount = searchParams.get('amount');
    const slug = searchParams.get('slug') || searchParams.get('destination');
    const qGuests = Number(searchParams.get('guests') || '1');
    const qMethod = searchParams.get('method') as PaymentOption['id'] | null;
    const type = searchParams.get('type');
    const title = searchParams.get('title');
    const includes = searchParams.get('includes');
    const qTourId = searchParams.get('id');
    const adults = Number(searchParams.get('adults') || '1');
    const children = Number(searchParams.get('children') || '0');
    const date = searchParams.get('date');

    if (qMethod && ['credit_card', 'paypal', 'bank_qr'].includes(qMethod)) {
      setMethod(qMethod);
    }
    setGuests(Math.max(1, qGuests));
    setAdultsCount(adults);
    setChildrenCount(children);

    if (date) {
      setBookingDate(date);
    }

    // Combo booking
    if (type === 'combo') {
      setIsCombo(true);

      if (title) {
        const decodedTitle = decodeURIComponent(title);
        setComboTitle(decodedTitle);
        setDescription(`Thanh toán combo: ${decodedTitle}`);
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

      setIsLoadingData(false);
      return;
    }

    // Tour booking by ID
    if (type === 'tour' && qTourId) {
      const id = Number(qTourId);
      const tourSlug = searchParams.get('slug');

      if (!isNaN(id) && id > 0) {
        setTourId(id);
        setDestinationSlug(tourSlug);
        fetchTourData(id, tourSlug, adults, children);
      } else {
        setErrorMsg('ID tour không hợp lệ.');
        setIsLoadingData(false);
      }
      return;
    }

    // Direct amount
    if (qAmount) {
      setAmount(qAmount);
      setIsLoadingData(false);
      return;
    }

    // Destination by slug
    if (slug) {
      fetchDestinationData(slug, qGuests);
      return;
    }

    // No parameters - allow manual entry
    setBasePrice(0);
    setIsLoadingData(false);
  }, [searchParams, fetchTourData, fetchDestinationData]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setErrorMsg(null);
      setSubmitting(true);

      // Validate credit card if selected
      if (method === 'credit_card') {
        const cardValidationError = validateCreditCard();
        if (cardValidationError) {
          setCardError(cardValidationError);
          setSubmitting(false);
          return;
        }
        setCardError(null);
      }

      // Validate amount
      if (!finalAmount || finalAmount <= 0) {
        throw new Error('Vui lòng nhập số tiền hợp lệ.');
      }

      // Check authentication
      const token = localStorage.getItem('tg_token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để tạo đơn và thanh toán.');
      }

      const current = await UserAPI.current();
      const user = (current as any)?.user as UserData | undefined;

      if (!user?.id) {
        throw new Error('Vui lòng đăng nhập để tạo đơn và thanh toán.');
      }

      // Validate user email
      const emailError = validateUserEmail(user.email);
      if (emailError) {
        throw new Error(emailError);
      }

      const userEmail = user.email as string;
      const userName = getUserDisplayName(user);

      // Prepare card metadata
      const sanitizedCardNumber =
        method === 'credit_card' ? cardNumber.replace(/\s+/g, '') : '';
      const cardMeta: CardMeta | null =
        method === 'credit_card'
          ? {
              holder: cardHolder.trim(),
              brand: detectCardBrand(sanitizedCardNumber),
              last4: sanitizedCardNumber.slice(-4),
              expiry: cardExpiry,
            }
          : null;

      // Prepare coupon data
      const appliedCoupon = coupon.trim().toUpperCase();
      const hasCoupon = !!appliedCoupon && discountPercent > 0 && discountAmount > 0;

      // Prepare payment method for backend
      const paymentMethodValue = method === 'bank_qr' ? 'bank_transfer' : method;

      // Create booking
      let bookingId: number;

      if (isCombo) {
        // ========== COMBO BOOKING ==========
        const bookingPayload: any = {
          type: 'combo',
          comboTitle: comboTitle || 'Combo du lịch',
          comboIncludes,
          destination: 'combo', // Backend cần destination slug
          destinationName: comboTitle || 'Combo du lịch',
          guests: guests || 1,
          name: userName,
          email: userEmail,
          price: finalAmount,
          totalAmount: finalAmount,
          paymentMethod: paymentMethodValue,
        };

        if (cardMeta) {
          bookingPayload.cardInfo = cardMeta;
        }

        if (hasCoupon) {
          bookingPayload.couponCode = appliedCoupon;
          bookingPayload.discountAmount = discountAmount;
        }

        console.log('📦 Combo Booking Payload:', bookingPayload);

        const booking = await BookingAPI.create(bookingPayload);
        bookingId = (booking as any)?.id || (booking as any)?.booking?.id;

        if (!bookingId) {
          throw new Error('Không thể tạo đơn combo (thiếu mã đơn).');
        }
      } else if (tourId || destinationSlug) {
        // ========== TOUR BOOKING ==========
        const bookingPayload: any = {
          type: 'tour',
          destination: destinationSlug, // Backend cần trường này
          destinationName: destinationName || undefined,
          guests: guests || adultsCount + childrenCount || 1,
          name: userName,
          email: userEmail,
          price: finalAmount,
          totalAmount: finalAmount,
          paymentMethod: paymentMethodValue,
        };

        // Thêm tourId nếu có
        if (tourId) {
          bookingPayload.tourId = tourId;
        }

        // Thêm destinationId nếu có
        if (destinationId) {
          bookingPayload.destinationId = destinationId;
        }

        // Thêm ngày đặt tour
        if (bookingDate) {
          bookingPayload.from = bookingDate;
          bookingPayload.to = bookingDate;
        }

        // Thêm số người lớn và trẻ em
        if (adultsCount > 0) {
          bookingPayload.adults = adultsCount;
        }
        if (childrenCount > 0) {
          bookingPayload.children = childrenCount;
        }

        if (cardMeta) {
          bookingPayload.cardInfo = cardMeta;
        }

        if (hasCoupon) {
          bookingPayload.couponCode = appliedCoupon;
          bookingPayload.discountAmount = discountAmount;
        }

        console.log('📦 Tour Booking Payload:', bookingPayload);

        const booking = await BookingAPI.create(bookingPayload);
        bookingId = (booking as any)?.id || (booking as any)?.booking?.id;

        if (!bookingId) {
          throw new Error('Không thể tạo đơn tour (thiếu mã đơn).');
        }
      } else if (destinationId) {
        // ========== DESTINATION BOOKING (Legacy) ==========
        const bookingPayload: any = {
          type: 'destination',
          destination: destinationSlug,
          destinationName: destinationName || undefined,
          guests: guests || 1,
          name: userName,
          email: userEmail,
          price: finalAmount,
          totalAmount: finalAmount,
          paymentMethod: paymentMethodValue,
        };

        if (destinationId) {
          bookingPayload.destinationId = destinationId;
        }

        if (cardMeta) {
          bookingPayload.cardInfo = cardMeta;
        }

        if (hasCoupon) {
          bookingPayload.couponCode = appliedCoupon;
          bookingPayload.discountAmount = discountAmount;
        }

        console.log('📦 Destination Booking Payload:', bookingPayload);

        const booking = await BookingAPI.create(bookingPayload);
        bookingId = (booking as any)?.id || (booking as any)?.booking?.id;

        if (!bookingId) {
          throw new Error('Không thể tạo đơn (thiếu mã đơn).');
        }
      } else {
        throw new Error(
          'Vui lòng mở một tour/điểm đến và bấm "Đặt ngay" để tới trang thanh toán.'
        );
      }

      // ========== CREATE PAYMENT ==========
      const paymentPayload: any = {
        bookingId,
        provider: method,
        amount: finalAmount,
        note: `${description || 'Thanh toán TravelGo'} | REF:${transferNote}`,
      };

      if (cardMeta) {
        paymentPayload.cardInfo = cardMeta;
      }

      if (hasCoupon) {
        paymentPayload.couponCode = appliedCoupon;
        paymentPayload.discountAmount = discountAmount;
      }

      console.log('💳 Payment Payload:', paymentPayload);

      const paymentResponse = await PaymentAPI.create(paymentPayload);

      // Redirect to payment gateway if URL is provided
      if (paymentResponse?.url && (method === 'paypal' || method === 'credit_card')) {
        window.location.href = paymentResponse.url as string;
        return;
      }

      // Notify other components
      window.dispatchEvent(new Event('payment-created'));

      // Success
      setSuccess(true);
      setSubmitting(false);
      setTimeout(() => navigate('/account/payments'), 800);
    } catch (err: any) {
      console.error('❌ Checkout Error:', err);
      console.error('❌ Error Response:', err?.response?.data);

      let errorMessage = err?.response?.data?.message || err?.message || 'Không thể tạo đơn/thanh toán.';

      // Friendly error messages
      if (
        errorMessage.includes('PayPal authentication failed') ||
        errorMessage.includes('invalid_client')
      ) {
        errorMessage =
          'Lỗi xác thực PayPal. Vui lòng thử lại sau hoặc chọn phương thức thanh toán khác.';
      } else if (errorMessage.includes('PayPal')) {
        errorMessage =
          'Không thể kết nối với PayPal. Vui lòng thử lại sau hoặc chọn phương thức thanh toán khác.';
      } else if (errorMessage.includes('Missing required fields')) {
        errorMessage = 'Thiếu thông tin bắt buộc. Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ.';
      } else if (errorMessage.includes('Destination not found')) {
        errorMessage = 'Không tìm thấy điểm đến. Vui lòng chọn tour khác.';
      } else if (errorMessage.includes('Authentication required')) {
        errorMessage = 'Vui lòng đăng nhập để tiếp tục thanh toán.';
      }

      setErrorMsg(errorMessage);
      setSubmitting(false);
    }
  };

  // Render card details form
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

  // Render QR code section
  const renderQRSection = () => (
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
          onError={(e) => {
            (e.target as HTMLImageElement).src = qr.fallback;
          }}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Mô tả thanh toán
          </label>
          <input
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              Nội dung chuyển khoản
            </label>
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1"
              onClick={handleCopyTransferNote}
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
              {copied ? 'Đã copy!' : 'Copy'}
            </button>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="font-mono text-sm text-gray-800 break-all">
              {transferNote}
            </span>
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
            <span className="text-sm font-semibold text-gray-700">
              Số tiền cần chuyển:
            </span>
            <span className="text-lg font-bold text-blue-600">
              {formattedFinal} VNĐ
            </span>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <p className="text-xs text-yellow-800">
            ⚠️ <strong>Lưu ý:</strong> Ghi đúng nội dung chuyển khoản và số tiền để
            tự động đối soát. Sau khi chuyển khoản thành công, nhấn "Thanh toán" để
            xác nhận.
          </p>
        </div>
      </div>
    </div>
  );

  // Render guests control
  const renderGuestsControl = () => {
    if (basePrice <= 0 && !isCombo) return null;

    return (
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <UserGroupIcon className="w-5 h-5 text-blue-600" />
          {isCombo ? 'Số người' : 'Số khách'}
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleGuestChange(guests - 1)}
            className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all font-bold text-gray-700 flex items-center justify-center"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => handleGuestChange(Number(e.target.value || 1))}
            className="w-24 text-center px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-lg"
          />
          <button
            type="button"
            onClick={() => handleGuestChange(guests + 1)}
            className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all font-bold text-gray-700 flex items-center justify-center"
          >
            +
          </button>
        </div>
        <p className="text-xs text-gray-500">
          {isCombo ? (
            'Giá combo đã bao gồm tất cả dịch vụ'
          ) : (
            <>
              Giá cơ bản:{' '}
              <span className="font-semibold">
                {formatCurrency(basePrice)} VNĐ/người
              </span>
            </>
          )}
        </p>
      </div>
    );
  };

  // Render price summary
  const renderPriceSummary = () => {
    if (isLoadingData) {
      return (
        <div className="mt-3 text-sm text-gray-400 text-center py-2">
          Đang tải thông tin...
        </div>
      );
    }

    if (!amount || Number(amount) <= 0) {
      return (
        <div className="mt-3 text-sm text-gray-500 text-center py-2">
          Vui lòng nhập số tiền để xem tổng thanh toán
        </div>
      );
    }

    return (
      <div className="mt-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Tạm tính</span>
          <span className="font-semibold">{formattedVnd} VNĐ</span>
        </div>
        {discountPercent > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Giảm giá {discountPercent}%</span>
            <span className="font-semibold text-green-600">
              − {formattedDiscount} VNĐ
            </span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
          <span className="font-bold text-gray-900">Cần thanh toán</span>
          <span className="font-bold text-blue-600 text-lg">
            {formattedFinal} VNĐ
          </span>
        </div>
      </div>
    );
  };

  // Render booking info summary
  const renderBookingInfo = () => {
    if (!tourId && !destinationId && !isCombo) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
        <h4 className="font-semibold text-blue-800 mb-2">Thông tin đặt tour</h4>
        <div className="space-y-1 text-sm text-blue-700">
          {destinationName && (
            <p>
              Tour: <span className="font-medium">{destinationName}</span>
            </p>
          )}
          {bookingDate && (
            <p>
              Ngày khởi hành: <span className="font-medium">{bookingDate}</span>
            </p>
          )}
          {(adultsCount > 0 || childrenCount > 0) && (
            <p>
              Khách:{' '}
              <span className="font-medium">
                {adultsCount} người lớn
                {childrenCount > 0 && `, ${childrenCount} trẻ em`}
              </span>
            </p>
          )}
        </div>
      </div>
    );
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
              {isCombo
                ? 'Thanh toán gói combo du lịch'
                : 'Điền thông tin và xác nhận thanh toán'}
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
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {comboTitle}
                  </h3>
                  {comboIncludes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Bao gồm:</p>
                      <ul className="space-y-1.5">
                        {comboIncludes.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-gray-600"
                          >
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
                  <h3 className="font-bold text-lg text-gray-900">
                    {destinationName}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {bookingDate && `Ngày: ${bookingDate} • `}
                    {adultsCount} người lớn
                    {childrenCount > 0 && `, ${childrenCount} trẻ em`}
                  </p>
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
                <span className="font-semibold">
                  Thanh toán thành công! Đang chuyển hướng...
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Booking Info Summary */}
            {renderBookingInfo()}

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <BanknotesIcon className="w-5 h-5 text-blue-600" />
                Số tiền (VNĐ)
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Nhập số tiền"
                  type="number"
                  min="0"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  readOnly={basePrice > 0 && !errorMsg && !isLoadingData}
                  disabled={isLoadingData}
                  required
                />
                {basePrice > 0 && !errorMsg && !isLoadingData && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <span className="text-gray-400 text-sm">🔒</span>
                  </div>
                )}
                {errorMsg && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <span
                      className="text-blue-600 text-sm"
                      title="Có thể nhập thủ công"
                    >
                      ✏️
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {isLoadingData ? (
                    <span className="text-gray-400">Đang tải thông tin tour...</span>
                  ) : amount && Number(amount) > 0 ? (
                    <>
                      {discountPercent > 0 ? (
                        <>
                          Tổng:{' '}
                          <span className="font-bold text-blue-600 text-lg">
                            {formattedFinal} VNĐ
                          </span>
                          <span className="text-gray-400 text-xs ml-2 line-through">
                            {formattedVnd} VNĐ
                          </span>
                        </>
                      ) : (
                        <>
                          Tổng:{' '}
                          <span className="font-bold text-blue-600 text-lg">
                            {formattedVnd} VNĐ
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">
                      {basePrice > 0
                        ? 'Vui lòng nhập số tiền'
                        : 'Vui lòng nhập số tiền hoặc chọn tour từ trang chi tiết'}
                    </span>
                  )}
                </span>
                {basePrice > 0 && !isLoadingData && amount && Number(amount) > 0 && (
                  <span className="text-gray-400">
                    (tự tính = giá tour × số khách)
                  </span>
                )}
              </div>
            </div>

            {/* Guests Control */}
            {renderGuestsControl()}

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
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Nhập mã khuyến mãi (ví dụ: MEMBER10)"
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => applyCoupon(coupon)}
                    className="px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                  >
                    Áp dụng
                  </button>
                </div>
                {couponMsg && (
                  <p
                    className={`mt-2 text-sm ${
                      discountPercent ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {couponMsg}
                  </p>
                )}
                {renderPriceSummary()}
              </div>

              {/* Payment options */}
              <div className="grid gap-3">
                {PAYMENT_OPTIONS.map((option) => {
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
                            <p className="font-semibold text-gray-900">
                              {option.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {option.description}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selected
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {selected && (
                            <span className="w-2.5 h-2.5 bg-white rounded-full block"></span>
                          )}
                        </div>
                      </button>
                      {selected &&
                        option.id === 'credit_card' &&
                        renderCardDetails()}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QR Code Section */}
            {method === 'bank_qr' && renderQRSection()}

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
                !amount || Number(amount) <= 0 || submitting
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