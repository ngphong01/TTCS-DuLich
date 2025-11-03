import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FireIcon,
  ClockIcon,
  GiftIcon,
  SparklesIcon,
  TicketIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import {
  FireIcon as FireIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';

export default function Deals() {
  const [activeTab, setActiveTab] = useState<'today' | 'combo' | 'member' | 'season'>('today');
  const [discountFilter, setDiscountFilter] = useState<'all' | 10 | 20 | 25 | 30>(
    'all'
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Flash Sale Countdown
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Flash Sale Deals
  const flashSales = [
    {
      id: 1,
      title: 'Tour Đà Lạt 3N2Đ',
      originalPrice: 4500000,
      salePrice: 3150000,
      discount: 30,
      image: '🏔️',
      imageUrl: '/uploads/destinations/Tour-Da-Lat-3-Ngay-2-Dem.png',
      timeLeft: '2 giờ',
    },
    {
      id: 2,
      title: 'Phú Quốc 4N3Đ',
      originalPrice: 5500000,
      salePrice: 3850000,
      discount: 30,
      image: '🏖️',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
      timeLeft: '5 giờ',
    },
    {
      id: 3,
      title: 'Combo Hà Nội - Hạ Long',
      originalPrice: 3800000,
      salePrice: 2660000,
      discount: 30,
      image: '⛰️',
      imageUrl: '/uploads/destinations/Combo Hà Nội - Hạ Long.jpg',
      timeLeft: '1 giờ',
    },
    {
      id: 4,
      title: 'Nha Trang 3N2Đ',
      originalPrice: 4200000,
      salePrice: 2940000,
      discount: 30,
      image: '🌊',
      imageUrl: '/uploads/destinations/Nha Trang 3N2Đ.jpg',
      timeLeft: '4 giờ',
    },
    {
      id: 5,
      title: 'Hội An - Đà Nẵng',
      originalPrice: 3600000,
      salePrice: 2520000,
      discount: 30,
      image: '🏮',
      imageUrl: '/uploads/destinations/Hội An - Đà Nẵng.jpg',
      timeLeft: '6 giờ',
    },
    {
      id: 6,
      title: 'Sapa Trekking 2N1Đ',
      originalPrice: 3000000,
      salePrice: 2100000,
      discount: 30,
      image: '⛰️',
      imageUrl: '/uploads/destinations/Sapa Trekking 2N1Đ.jpg',
      timeLeft: '8 giờ',
    },
  ];

  // Vouchers
  const vouchers = [
    { id: 1, discount: 5, code: 'TRAVEL5', minOrder: 1000000, imageUrl: '/uploads/destinations/Combo Hà Nội - Hạ Long.jpg', title: 'Ưu đãi nhẹ nhàng' },
    { id: 2, discount: 10, code: 'TRAVEL10', minOrder: 3000000, imageUrl: '/uploads/destinations/Nha Trang 3N2Đ.jpg', title: 'Giảm 10% đơn từ 3 triệu' },
    { id: 3, discount: 15, code: 'TRAVEL15', minOrder: 5000000, imageUrl: '/uploads/destinations/Tour-Da-Lat-3-Ngay-2-Dem.png', title: 'Giảm sâu 15%' },
    { id: 4, discount: 20, code: 'TRAVEL20', minOrder: 7000000, imageUrl: '/uploads/destinations/combo-ve-may-bay-va-khach-san.jpg', title: 'Combo bay + khách sạn' },
    { id: 5, discount: 25, code: 'MEGA25', minOrder: 10000000, imageUrl: '/uploads/destinations/Đi nhóm - Ưu đãi thêm người.jpg', title: 'Đi nhóm càng rẻ' },
    { id: 6, discount: 30, code: 'HOT30', minOrder: 15000000, imageUrl: '/uploads/destinations/Staycation cuối tuần.jpg', title: 'Siêu ưu đãi 30%' },
  ];

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1200);
    } catch {}
  }

  // Combos
  const combos = [
    {
      id: 1,
      title: 'Tour + Khách sạn + Vé máy bay',
      description: 'Trọn gói tiết kiệm 30%',
      originalPrice: 8000000,
      salePrice: 5600000,
      savings: 2400000,
      image: '✈️',
      imageUrl: '/uploads/destinations/combo-ve-may-bay-va-khach-san.jpg',
      includes: ['Tour 3 ngày', 'Khách sạn 4 sao', 'Vé máy bay khứ hồi', 'Bữa sáng'],
    },
    {
      id: 2,
      title: 'Book sớm - Giảm sâu',
      description: 'Đặt trước 30 ngày',
      originalPrice: 5000000,
      salePrice: 3750000,
      savings: 1250000,
      image: '📅',
      imageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop',
      includes: ['Giảm 25% khi đặt sớm', 'Tặng bảo hiểm du lịch', 'Hỗ trợ visa'],
    },
    {
      id: 3,
      title: 'Đi nhóm - Ưu đãi thêm người',
      description: 'Mua 2 tour chỉ tính giá 1 người',
      originalPrice: 6000000,
      salePrice: 3000000,
      savings: 3000000,
      image: '👥',
      imageUrl: '/uploads/destinations/Đi nhóm - Ưu đãi thêm người.jpg',
      includes: ['Từ 4 người trở lên', 'Giảm thêm 10%', 'Tặng bữa tối đặc biệt'],
    },
    {
      id: 4,
      title: 'Staycation cuối tuần',
      description: 'Nghỉ dưỡng 2N1Đ trong thành phố',
      originalPrice: 2600000,
      salePrice: 1990000,
      savings: 610000,
      image: '🏨',
      imageUrl: '/uploads/destinations/Staycation cuối tuần.jpg',
      includes: ['Khách sạn 4 sao', 'Buffet sáng', 'Spa 30 phút'],
    },
  ];

  // Membership Tiers
  const membershipTiers = [
    {
      level: 'Member',
      icon: '🥉',
      color: 'from-gray-400 to-gray-600',
      benefits: ['Điểm tích lũy 1%', 'Ưu đãi thường xuyên', 'Thông tin tour mới'],
      points: '0-999',
    },
    {
      level: 'Silver',
      icon: '🥈',
      color: 'from-gray-300 to-gray-500',
      benefits: ['Điểm tích lũy 2%', 'Giảm 5% mọi tour', 'Ưu tiên đặt chỗ', 'Tặng bảo hiểm'],
      points: '1000-4999',
    },
    {
      level: 'Gold',
      icon: '🥇',
      color: 'from-yellow-400 to-yellow-600',
      benefits: ['Điểm tích lũy 3%', 'Giảm 10% mọi tour', 'VIP lounge', 'Tặng combo', 'Tư vấn 24/7'],
      points: '5000-19999',
    },
    {
      level: 'Diamond',
      icon: '💎',
      color: 'from-purple-400 to-pink-600',
      benefits: ['Điểm tích lũy 5%', 'Giảm 15% mọi tour', 'VIP service', 'Private tour', 'Hỗ trợ đặc biệt'],
      points: '20000+',
    },
  ];

  // Seasonal Promotions
  const seasonalDeals = [
    {
      season: 'Hè sôi động',
      image: '☀️',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
      title: 'Combo biển đảo mùa hè',
      description: 'Giảm 25% tất cả tour biển',
      discount: 25,
      validUntil: '31/08/2025',
    },
    {
      season: 'Giáng sinh - Năm mới',
      image: '🎄',
      imageUrl: '/uploads/destinations/Tour năm mới đặc biệt.jpg',
      title: 'Tour năm mới đặc biệt',
      description: 'Ưu đãi đặc biệt cho dịp lễ',
      discount: 20,
      validUntil: '31/12/2024',
    },
    {
      season: 'Valentine - 8/3 - 20/10',
      image: '💝',
      imageUrl: '/uploads/destinations/Tour lãng mạn cho đôi.jpg',
      title: 'Tour lãng mạn cho đôi',
      description: 'Combo dành cho cặp đôi',
      discount: 30,
      validUntil: '28/02/2025',
    },
    {
      season: 'Thu săn mây',
      image: '🍂',
      imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop',
      title: 'Săn mây Tây Bắc',
      description: 'Giảm 15% tour săn mây',
      discount: 15,
      validUntil: '30/10/2025',
    },
  ];

  // Special Offers
  const specialOffers = [
    {
      title: 'Sinh viên',
      icon: AcademicCapIcon,
      description: 'Giảm 15% khi có thẻ sinh viên',
      code: 'STUDENT15',
    },
    {
      title: 'Gia đình',
      icon: UserGroupIcon,
      description: 'Giảm thêm 5% khi đi từ 4 người',
      code: 'FAMILY5',
    },
    {
      title: 'Doanh nghiệp',
      icon: BuildingOfficeIcon,
      description: 'Ưu đãi đặc biệt cho đoàn công ty',
      code: 'CORP10',
    },
    {
      title: 'Ngân hàng',
      icon: CreditCardIcon,
      description: 'Giảm thêm khi thanh toán qua BIDV, Techcombank',
      code: 'BANK20',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-2.5 mb-6">
              <FireIconSolid className="h-6 w-6 text-yellow-300" />
              <span className="font-semibold">Ưu đãi đặc biệt</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
              Khuyến mãi & Ưu đãi
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Tiết kiệm đến 50% với các chương trình khuyến mãi độc quyền
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-200">
          {[
            { id: 'today', label: 'Ưu đãi hôm nay', icon: FireIcon },
            { id: 'combo', label: 'Combo hấp dẫn', icon: GiftIcon },
            { id: 'member', label: 'Chương trình thành viên', icon: StarIcon },
            { id: 'season', label: 'Khuyến mãi theo mùa', icon: SparklesIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Flash Sale Tab */}
        {activeTab === 'today' && (
          <div className="space-y-8">
            {/* Countdown Banner */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <FireIconSolid className="h-6 w-6" />
                    Flash Sale
                  </h2>
                  <p className="text-white/90">Chỉ còn hôm nay!</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className="text-sm">Giờ</div>
                  </div>
                  <div className="text-2xl">:</div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div className="text-sm">Phút</div>
                  </div>
                  <div className="text-2xl">:</div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div className="text-sm">Giây</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Discount Chips */}
            <div className="mb-6 flex flex-wrap gap-2">
              {[
                { label: 'Tất cả', value: 'all' as const },
                { label: '≥ 10%', value: 10 as const },
                { label: '≥ 20%', value: 20 as const },
                { label: '≥ 25%', value: 25 as const },
                { label: '≥ 30%', value: 30 as const },
              ].map((chip) => (
                <button
                  key={String(chip.value)}
                  onClick={() => setDiscountFilter(chip.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    discountFilter === chip.value
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Flash Sale Items */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {flashSales
                .filter((x) =>
                  discountFilter === 'all' ? true : x.discount >= discountFilter
                )
                .map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  <div className="h-48 bg-gray-50 relative border-b border-gray-100 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">{item.image}</div>
                    )}
                    <div className="absolute top-3 right-3 bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-semibold border border-rose-200">-{item.discount}%</div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{item.title}</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm text-gray-500 line-through">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.originalPrice)}
                      </span>
                      <span className="text-2xl font-bold text-blue-700">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.salePrice)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <ClockIcon className="h-4 w-4" />
                      <span>Còn {item.timeLeft}</span>
                    </div>
                    <Link
                      to="/destinations"
                      className="block w-full text-center px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-semibold"
                    >
                      Đặt ngay
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Vouchers */}
            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <TicketIcon className="h-8 w-8 text-purple-500" />
                Voucher giảm giá
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {vouchers.map((v) => (
                  <div key={v.id} className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100">
                    <div className="h-32 relative overflow-hidden">
                      {v.imageUrl ? (
                        <img src={v.imageUrl} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-white/90 text-gray-900 text-xs font-semibold">
                        {v.title || 'Ưu đãi'}
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200">
                        -{v.discount}%
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-gray-500 mb-1">Mã giảm giá</div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-mono text-lg font-bold tracking-wider">{v.code}</div>
                        <button onClick={() => copyCode(v.code)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50">
                          {copiedCode === v.code ? 'Đã copy' : 'Copy'}
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        Đơn tối thiểu {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.minOrder)}
                      </div>
                      <Link
                        to={`/destinations?q=${encodeURIComponent(v.code)}`}
                        className="block w-full text-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black font-semibold"
                      >
                        Áp dụng ngay
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Combos Tab */}
        {activeTab === 'combo' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {combos
              .filter((c) =>
                discountFilter === 'all'
                  ? true
                  : Math.round(((c.originalPrice - c.salePrice) / c.originalPrice) * 100) >=
                    (discountFilter as number)
              )
              .map((combo) => (
              <div
                key={combo.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <div className="h-48 bg-gray-50 relative overflow-hidden border-b border-gray-100">
                  {combo.imageUrl ? (
                    <img src={combo.imageUrl} alt={combo.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">{combo.image}</div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{combo.title}</h3>
                  <p className="text-gray-600 mb-4">{combo.description}</p>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-gray-500 line-through">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(combo.originalPrice)}
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(combo.salePrice)}
                    </span>
                  </div>
                  <div className="bg-green-50 text-green-700 text-sm font-semibold px-3 py-2 rounded-lg mb-4">
                    Tiết kiệm {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(combo.savings)}
                  </div>
                  <ul className="space-y-2 mb-6">
                    {combo.includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/destinations"
                    className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Membership Tab */}
        {activeTab === 'member' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {membershipTiers.map((tier) => (
                <div
                  key={tier.level}
                  className={`bg-gradient-to-br ${tier.color} rounded-xl p-6 text-white relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative z-10">
                    <div className="text-5xl mb-3">{tier.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{tier.level}</h3>
                    <div className="text-sm text-white/80 mb-4">{tier.points} điểm</div>
                    <ul className="space-y-2">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">TravelPoints - Điểm thưởng</h3>
              <p className="text-gray-700 mb-6">
                Mỗi khi đặt tour, bạn sẽ nhận được TravelPoints. Điểm này có thể quy đổi thành voucher giảm giá hoặc sử dụng trực tiếp để thanh toán.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600 mb-2">1 điểm</div>
                  <div className="text-sm text-gray-600">= 1,000 VNĐ</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600 mb-2">100 điểm</div>
                  <div className="text-sm text-gray-600">= 1 voucher 5%</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-pink-600 mb-2">500 điểm</div>
                  <div className="text-sm text-gray-600">= 1 voucher 15%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seasonal Tab */}
        {activeTab === 'season' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {seasonalDeals.map((deal) => (
                <div
                  key={deal.season}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  <div className="h-48 bg-gray-50 relative overflow-hidden border-b border-gray-100">
                    {deal.imageUrl ? (
                      <img src={deal.imageUrl} alt={deal.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">{deal.image}</div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-3">
                      {deal.season}
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{deal.title}</h3>
                    <p className="text-gray-600 mb-4">{deal.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-blue-700">-{deal.discount}%</div>
                        <div className="text-xs text-gray-500">Hết hạn: {deal.validUntil}</div>
                      </div>
                      <Link
                        to="/destinations"
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-semibold"
                      >
                        Xem ngay
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Offers */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Ưu đãi đặc biệt</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {specialOffers.map((offer) => {
                  const Icon = offer.icon;
                  return (
                    <div
                      key={offer.title}
                      className="bg-white rounded-xl shadow-lg p-6 border-2 border-transparent hover:border-blue-300 transition-all"
                    >
                      <Icon className="h-12 w-12 text-blue-600 mb-4" />
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{offer.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
                      <div className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-lg inline-block">
                        {offer.code}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}