import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GiftIcon,
  TagIcon,
  ChevronRightIcon,
  SparklesIcon,
  XMarkIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CalendarDaysIcon,
  TicketIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

type TabType = 'today' | 'combo' | 'member' | 'season' | 'flight-hotel';
type DiscountFilter = 'all' | 10 | 20 | 30 | 50;
type ProductType = 'all' | 'tour' | 'combo' | 'hotel' | 'flight';
type TimeFilter = 'all' | 'today' | 'weekend' | 'holiday';

interface Deal {
  id: number;
  title: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  imageUrl: string;
  destination?: string;
  validUntil: string;
  duration?: string;
  rating?: number;
  reviewCount?: number;
  includes?: string[];
  reason?: string;
  tag?: 'hot' | 'new' | 'limited';
}

export default function Deals() {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [discountFilter, setDiscountFilter] = useState<DiscountFilter>('all');
  const [productFilter, setProductFilter] = useState<ProductType>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [destinationFilter, setDestinationFilter] = useState<string>('all');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data
  const flashSales: Deal[] = [
    {
      id: 1,
      title: 'Tour Đà Lạt 3N2Đ - Thành phố ngàn hoa',
      originalPrice: 4500000,
      salePrice: 3150000,
      discount: 30,
      imageUrl: '/uploads/destinations/Tour-Da-Lat-3-Ngay-2-Dem.png',
      destination: 'Đà Lạt',
      validUntil: '15/11/2025',
      duration: '3 ngày 2 đêm',
      rating: 4.8,
      reviewCount: 230,
      tag: 'hot',
    },
    {
      id: 2,
      title: 'Phú Quốc 4N3Đ - Đảo ngọc thiên đường',
      originalPrice: 5500000,
      salePrice: 3850000,
      discount: 30,
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
      destination: 'Phú Quốc',
      validUntil: '20/11/2025',
      duration: '4 ngày 3 đêm',
      rating: 4.9,
      reviewCount: 450,
      tag: 'hot',
    },
    {
      id: 3,
      title: 'Combo Hà Nội - Hạ Long',
      originalPrice: 3800000,
      salePrice: 2660000,
      discount: 30,
      imageUrl: '/uploads/destinations/Combo Hà Nội - Hạ Long.jpg',
      destination: 'Hà Nội, Hạ Long',
      validUntil: '18/11/2025',
      duration: '3 ngày 2 đêm',
      rating: 4.7,
      reviewCount: 180,
      tag: 'new',
    },
    {
      id: 4,
      title: 'Nha Trang 3N2Đ - Biển xanh cát trắng',
      originalPrice: 4200000,
      salePrice: 2940000,
      discount: 30,
      imageUrl: '/uploads/destinations/Nha Trang 3N2Đ.jpg',
      destination: 'Nha Trang',
      validUntil: '22/11/2025',
      duration: '3 ngày 2 đêm',
      rating: 4.6,
      reviewCount: 320,
      tag: 'limited',
    },
  ];

  const combos: Deal[] = [
    {
      id: 1,
      title: 'Tour + Khách sạn + Vé máy bay',
      originalPrice: 8000000,
      salePrice: 5600000,
      discount: 30,
      imageUrl: '/uploads/destinations/combo-ve-may-bay-va-khach-san.jpg',
      destination: 'Nhiều điểm đến',
      validUntil: '30/11/2025',
      includes: ['Tour 3 ngày', 'Khách sạn 4 sao', 'Vé máy bay khứ hồi', 'Bữa sáng'],
    },
    {
      id: 2,
      title: 'Book sớm - Giảm sâu',
      originalPrice: 5000000,
      salePrice: 3750000,
      discount: 25,
      imageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop',
      destination: 'Tất cả tour',
      validUntil: '31/12/2025',
      includes: ['Giảm 25% khi đặt sớm', 'Tặng bảo hiểm du lịch', 'Hỗ trợ visa'],
    },
    {
      id: 3,
      title: 'Đi nhóm - Ưu đãi thêm người',
      originalPrice: 6000000,
      salePrice: 3000000,
      discount: 50,
      imageUrl: '/uploads/destinations/Đi nhóm - Ưu đãi thêm người.jpg',
      destination: 'Tất cả tour',
      validUntil: '25/11/2025',
      includes: ['Từ 4 người trở lên', 'Giảm thêm 10%', 'Tặng bữa tối đặc biệt'],
    },
  ];

  const seasonalDeals: Deal[] = [
    {
      id: 1,
      title: 'Combo biển đảo mùa hè',
      originalPrice: 5000000,
      salePrice: 3750000,
      discount: 25,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
      destination: 'Nhiều điểm đến',
      validUntil: '31/08/2025',
    },
    {
      id: 2,
      title: 'Tour năm mới đặc biệt',
      originalPrice: 6000000,
      salePrice: 4800000,
      discount: 20,
      imageUrl: '/uploads/destinations/Tour năm mới đặc biệt.jpg',
      destination: 'Nhiều điểm đến',
      validUntil: '31/12/2024',
    },
  ];

  const specialOffers = [
    {
      title: 'Ưu đãi độc quyền cho thành viên',
      description: 'Thành viên Gold trở lên được giảm thêm 10% trên mọi tour',
      code: 'MEMBER10',
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Đặt sớm – Giảm thêm 10%',
      description: 'Đặt tour trước 30 ngày nhận thêm ưu đãi 10%',
      code: 'EARLY10',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Giảm thêm 5% khi đi nhóm từ 4 người',
      description: 'Áp dụng cho tất cả tour khi đặt từ 4 người trở lên',
      code: 'GROUP5',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const personalizedDeals: Deal[] = [
    {
      id: 1,
      title: 'Đà Nẵng - Hội An 3N2Đ',
      originalPrice: 4000000,
      salePrice: 2400000,
      discount: 40,
      imageUrl: '/uploads/destinations/Hội An - Đà Nẵng.jpg',
      destination: 'Đà Nẵng, Hội An',
      validUntil: '25/11/2025',
      duration: '3 ngày 2 đêm',
      reason: 'Dựa trên lịch sử tìm kiếm của bạn',
    },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  const filteredDeals = (deals: Deal[]) => {
    return deals.filter((deal) => {
      if (discountFilter !== 'all' && deal.discount < discountFilter) return false;
      if (destinationFilter !== 'all' && deal.destination && !deal.destination.toLowerCase().includes(destinationFilter.toLowerCase())) return false;
      return true;
    });
  };

  const activeFiltersCount = [discountFilter !== 'all', productFilter !== 'all', timeFilter !== 'all', destinationFilter !== 'all'].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <span className="text-sm font-medium">Ưu đãi đặc biệt hôm nay</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Khuyến mãi & Ưu đãi
              </h1>
              <p className="text-lg text-blue-100 mb-6 max-w-xl">
                Tiết kiệm đến 50% cho hành trình mơ ước của bạn
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link
                  to="/destinations"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
                >
                  Khám phá ngay
                </Link>
                <button
                  onClick={() => setShowFilters(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
                >
                  Bộ lọc
                </button>
              </div>
            </div>

            {/* Flash Sale Countdown - Compact */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold">Flash Sale kết thúc sau</span>
              </div>
              <div className="flex items-center gap-3">
                <TimeUnit value={timeLeft.hours} label="Giờ" />
                <span className="text-2xl font-bold">:</span>
                <TimeUnit value={timeLeft.minutes} label="Phút" />
                <span className="text-2xl font-bold">:</span>
                <TimeUnit value={timeLeft.seconds} label="Giây" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-2 inline-flex gap-2 overflow-x-auto">
            {[
              { id: 'today' as TabType, label: 'Hôm nay' },
              { id: 'combo' as TabType, label: 'Combo' },
              { id: 'member' as TabType, label: 'Thành viên' },
              { id: 'season' as TabType, label: 'Theo mùa' },
              { id: 'flight-hotel' as TabType, label: 'Vé & KS' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Filter Bar */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <span className="font-medium">Bộ lọc</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Active Filters */}
          {discountFilter !== 'all' && (
            <FilterTag
              label={`Giảm ≥${discountFilter}%`}
              onRemove={() => setDiscountFilter('all')}
            />
          )}
          {destinationFilter !== 'all' && (
            <FilterTag
              label={destinationFilter}
              onRemove={() => setDestinationFilter('all')}
            />
          )}
          {productFilter !== 'all' && (
            <FilterTag
              label={productFilter}
              onRemove={() => setProductFilter('all')}
            />
          )}
          {timeFilter !== 'all' && (
            <FilterTag
              label={timeFilter}
              onRemove={() => setTimeFilter('all')}
            />
          )}
        </div>

        {/* Personalized Section */}
        {personalizedDeals.length > 0 && (
          <section className="mb-12">
            <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-6 mb-6 border border-purple-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">★</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Dành riêng cho bạn
                  </h2>
                  <p className="text-gray-600">
                    {personalizedDeals[0].reason} - Giảm đến {personalizedDeals[0].discount}%
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personalizedDeals.map((deal) => (
                <EnhancedDealCard key={deal.id} deal={deal} featured />
              ))}
            </div>
          </section>
        )}

        {/* Main Content */}
        {activeTab === 'today' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Flash Sale hôm nay</h2>
              <span className="text-sm text-gray-500">{filteredDeals(flashSales).length} ưu đãi</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDeals(flashSales).map((deal) => (
                <EnhancedDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'combo' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Combo hấp dẫn</h2>
              <span className="text-sm text-gray-500">{filteredDeals(combos).length} combo</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDeals(combos).map((deal) => (
                <EnhancedDealCard key={deal.id} deal={deal} showIncludes />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'member' && (
          <div className="space-y-8">
            {/* TravelPoints Section - Redesigned */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">★</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">TravelPoints</h2>
                  <p className="text-gray-600">
                    Tích điểm mỗi lần đặt tour và đổi thành ưu đãi hấp dẫn
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <PointCard
                  points="1 điểm"
                  value="1,000 VNĐ"
                  color="from-blue-500 to-cyan-500"
                />
                <PointCard
                  points="100 điểm"
                  value="Voucher 5%"
                  color="from-purple-500 to-pink-500"
                />
                <PointCard
                  points="500 điểm"
                  value="Voucher 15%"
                  color="from-orange-500 to-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'season' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Khuyến mãi theo mùa</h2>
              <span className="text-sm text-gray-500">{filteredDeals(seasonalDeals).length} ưu đãi</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDeals(seasonalDeals).map((deal) => (
                <EnhancedDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'flight-hotel' && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">●</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Đang phát triển</h3>
            <p className="text-gray-600 mb-6">Tính năng này sẽ sớm có mặt</p>
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              Xem các tour hiện có
            </Link>
          </div>
        )}

        {/* Special Offers - Redesigned */}
        <section className="mt-16 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ưu đãi đặc biệt</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialOffers.map((offer, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-transparent hover:shadow-xl transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${offer.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white`}>
                  <span className="font-bold text-lg">★</span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{offer.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
                <div className="flex items-center justify-between">
                  <div className="bg-gray-100 text-gray-700 text-sm font-mono font-semibold px-3 py-1.5 rounded-lg">
                    {offer.code}
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                    Sao chép
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Social Proof - Compact */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-1">4.8/5</div>
                <div className="text-sm text-gray-500">Đánh giá trung bình</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-1">2,300+</div>
                <div className="text-sm text-gray-500">Khách hàng hài lòng</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-1">100%</div>
                <div className="text-sm text-gray-500">Hoàn tiền nếu huỷ</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-1">24/7</div>
                <div className="text-sm text-gray-500">Hỗ trợ khách hàng</div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter - Redesigned */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 lg:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '30px 30px',
              }} />
            </div>
            <div className="relative max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">★</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-3">
                Nhận ưu đãi độc quyền
              </h2>
              <p className="text-blue-100 mb-6">
                Đăng ký nhận thông báo về các chương trình khuyến mãi mới nhất
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email của bạn"
                  required
                  className="flex-1 px-4 py-3 rounded-xl text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  {subscribed ? '✓ Đã đăng ký' : 'Đăng ký'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        show={showFilters}
        onClose={() => setShowFilters(false)}
        discountFilter={discountFilter}
        setDiscountFilter={setDiscountFilter}
        productFilter={productFilter}
        setProductFilter={setProductFilter}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        destinationFilter={destinationFilter}
        setDestinationFilter={setDestinationFilter}
      />
    </div>
  );
}

// Enhanced Components

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-xs text-white/70 mt-0.5">{label}</div>
    </div>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
      <span className="capitalize">{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
      >
        <span className="text-blue-700 font-bold">×</span>
      </button>
    </div>
  );
}

function PointCard({ points, value, color }: { points: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center mb-3`}>
        <span className="text-white font-bold">★</span>
      </div>
      <div className="text-xl font-bold text-gray-900 mb-1">{points}</div>
      <div className="text-sm text-gray-600">= {value}</div>
    </div>
  );
}

function EnhancedDealCard({ 
  deal, 
  showIncludes = false,
  featured = false 
}: { 
  deal: Deal; 
  showIncludes?: boolean;
  featured?: boolean;
}) {
  const finalImageUrl = deal.imageUrl?.startsWith('http') 
    ? deal.imageUrl 
    : `${window.location.origin}${deal.imageUrl}`;

  const tagConfig = {
    hot: { label: 'Hot', color: 'bg-red-500' },
    new: { label: 'Mới', color: 'bg-green-500' },
    limited: { label: 'Giới hạn', color: 'bg-orange-500' },
  };

  return (
    <div className={`group bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-xl hover:border-transparent transition-all ${featured ? 'ring-2 ring-purple-500' : ''}`}>
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {deal.imageUrl ? (
          <img
            src={finalImageUrl}
            alt={deal.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Discount Badge */}
        <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-lg">
          -{deal.discount}%
        </div>

        {/* Tag Badge */}
        {deal.tag && (
          <div className={`absolute top-3 left-3 ${tagConfig[deal.tag].color} text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg`}>
            {tagConfig[deal.tag].label}
          </div>
        )}

        {/* Rating */}
        {deal.rating && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="text-yellow-400 font-bold">★</span>
            <span className="text-sm font-semibold text-gray-900">{deal.rating}</span>
            <span className="text-xs text-gray-500">({deal.reviewCount})</span>
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {deal.title}
        </h3>

        {/* Destination & Duration */}
        <div className="space-y-1.5 mb-4">
          {deal.destination && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-gray-400">📍</span>
              <span>{deal.destination}</span>
            </div>
          )}
          {deal.duration && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-gray-400">⏱</span>
              <span>{deal.duration}</span>
            </div>
          )}
        </div>

        {/* Includes */}
        {showIncludes && deal.includes && (
          <div className="mb-4 space-y-1.5">
            {deal.includes.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-gray-400 line-through">
            {new Intl.NumberFormat('vi-VN').format(deal.originalPrice)}đ
          </span>
          <span className="text-2xl font-bold text-blue-600">
            {new Intl.NumberFormat('vi-VN').format(deal.salePrice)}đ
          </span>
        </div>

        {/* Valid Until */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <span>📅</span>
          <span>Áp dụng đến {deal.validUntil}</span>
        </div>

        {/* CTA Button */}
        <Link
          to={`/checkout?type=combo&amount=${deal.salePrice}&title=${encodeURIComponent(deal.title)}&includes=${deal.includes ? encodeURIComponent(JSON.stringify(deal.includes)) : ''}`}
          className="block w-full text-center px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold group-hover:shadow-lg"
        >
          Đặt ngay
        </Link>
      </div>
    </div>
  );
}

function FilterSidebar({
  show,
  onClose,
  discountFilter,
  setDiscountFilter,
  productFilter,
  setProductFilter,
  timeFilter,
  setTimeFilter,
  destinationFilter,
  setDestinationFilter,
}: {
  show: boolean;
  onClose: () => void;
  discountFilter: DiscountFilter;
  setDiscountFilter: (filter: DiscountFilter) => void;
  productFilter: ProductType;
  setProductFilter: (filter: ProductType) => void;
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
  destinationFilter: string;
  setDestinationFilter: (filter: string) => void;
}) {
  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Bộ lọc</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <span className="text-gray-600 font-bold text-xl">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Discount Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="font-semibold text-gray-900">Mức giảm giá</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Tất cả', value: 'all' as DiscountFilter },
                { label: '≥ 10%', value: 10 as DiscountFilter },
                { label: '≥ 20%', value: 20 as DiscountFilter },
                { label: '≥ 30%', value: 30 as DiscountFilter },
                { label: '≥ 50%', value: 50 as DiscountFilter },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setDiscountFilter(filter.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    discountFilter === filter.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Type */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="font-semibold text-gray-900">Loại sản phẩm</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Tất cả', value: 'all' as ProductType },
                { label: 'Tour', value: 'tour' as ProductType },
                { label: 'Combo', value: 'combo' as ProductType },
                { label: 'Khách sạn', value: 'hotel' as ProductType },
                { label: 'Vé máy bay', value: 'flight' as ProductType },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setProductFilter(filter.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    productFilter === filter.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Destination */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="font-semibold text-gray-900">Điểm đến</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Tất cả', value: 'all' },
                { label: 'Đà Lạt', value: 'đà lạt' },
                { label: 'Phú Quốc', value: 'phú quốc' },
                { label: 'Bangkok', value: 'bangkok' },
                { label: 'Tokyo', value: 'tokyo' },
                { label: 'Nha Trang', value: 'nha trang' },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setDestinationFilter(filter.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    destinationFilter === filter.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="font-semibold text-gray-900">Thời gian</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Tất cả', value: 'all' as TimeFilter },
                { label: 'Hôm nay', value: 'today' as TimeFilter },
                { label: 'Cuối tuần', value: 'weekend' as TimeFilter },
                { label: 'Dịp lễ', value: 'holiday' as TimeFilter },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setTimeFilter(filter.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    timeFilter === filter.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={() => {
              setDiscountFilter('all');
              setProductFilter('all');
              setTimeFilter('all');
              setDestinationFilter('all');
            }}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Đặt lại
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </>
  );
}
