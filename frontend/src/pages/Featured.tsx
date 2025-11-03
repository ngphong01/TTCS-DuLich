import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFeaturedDestinations } from '../services/destination';
import { getFeaturedReviews } from '../services/review';
import Skeleton from '../components/Skeleton';
import { getDestinationImageUrl } from '../utils/imageHelper';
import {
  FireIcon,
  StarIcon,
  ArrowRightIcon,
  TrophyIcon,
  SparklesIcon,
  PhotoIcon,
  VideoCameraIcon,
  CalendarIcon,
  ChartBarIcon,
  HeartIcon,
  MapPinIcon,
  EyeIcon,
  ClockIcon,
  UserGroupIcon,
  SunIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  FireIcon as FireIconSolid,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';

export default function Featured() {
  const [activeTab, setActiveTab] = useState<'tours' | 'destinations' | 'reviews' | 'events'>('tours');
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());

  const { data: featuredDestinations, isLoading: loadingDestinations } = useQuery({
    queryKey: ['destinations', 'featured'],
    queryFn: getFeaturedDestinations,
  });

  const { data: featuredReviews } = useQuery({
    queryKey: ['reviews', 'featured'],
    queryFn: () => getFeaturedReviews(10),
  });

  // Mock data - trong production sẽ fetch từ API
  const topTours = [
    { id: 0, name: 'Paris Seine Cruise & Eiffel', bookings: 1680, price: 27800000, originalPrice: 32500000, discount: 14, Icon: MapPinIcon, imageUrl: '/uploads/avatars/paris.jpg' },
    { id: 1, name: 'Combo Đà Lạt 3N2Đ', bookings: 1250, price: 4500000, originalPrice: 5600000, discount: 20, Icon: MapPinIcon, imageUrl: '/uploads/destinations/Combo Đà Lạt 3N2Đ.png' },
    { id: 2, name: 'Tour Phú Quốc 4N3Đ', bookings: 980, price: 3570000, originalPrice: 4200000, discount: 15, Icon: SunIcon, imageUrl: '/uploads/destinations/Tour Phú Quốc 4N3Đ.png' },
    { id: 3, name: 'Sapa 2 ngày trekking', bookings: 756, price: 2520000, originalPrice: 2800000, discount: 10, Icon: MapPinIcon, imageUrl: '/uploads/destinations/Sapa 2 ngày trekking.jpg' },
    { id: 4, name: 'Hà Nội - Hạ Long - Ninh Bình', bookings: 650, price: 3344000, originalPrice: 3800000, discount: 12, Icon: BuildingOffice2Icon, imageUrl: '/uploads/destinations/ha-noi-ha-long-ninh-binh.jpg' },
    { id: 5, name: 'Combo Hội An - Đà Nẵng', bookings: 542, price: 2624000, originalPrice: 3200000, discount: 18, Icon: SparklesIcon, imageUrl: '/uploads/destinations/Hội An - Đà Nẵng.jpg' },
  ];

  const topDestinations = featuredDestinations?.slice(0, 5) || [];

  const topInfluencers = [
    { id: 1, name: 'Olivia Chen', followers: '150K', rating: 4.9, posts: 245, avatarUrl: `https://i.pravatar.cc/120?u=${encodeURIComponent('Olivia Chen')}` },
    { id: 2, name: 'Liam Martinez', followers: '120K', rating: 4.8, posts: 189, avatarUrl: `https://i.pravatar.cc/120?u=${encodeURIComponent('Liam Martinez')}` },
    { id: 3, name: 'Sofia Ivanova', followers: '95K', rating: 4.7, posts: 156, avatarUrl: `https://i.pravatar.cc/120?u=${encodeURIComponent('Sofia Ivanova')}` },
    { id: 4, name: 'Noah Schmidt', followers: '80K', rating: 4.6, posts: 132, avatarUrl: `https://i.pravatar.cc/120?u=${encodeURIComponent('Noah Schmidt')}` },
    { id: 5, name: 'Emma Dubois', followers: '65K', rating: 4.5, posts: 98, avatarUrl: `https://i.pravatar.cc/120?u=${encodeURIComponent('Emma Dubois')}` },
  ];

  const events = [
    {
      id: 1,
      title: 'Festival Hoa Đà Lạt 2025',
      date: '15/03/2025',
      location: 'Đà Lạt',
      type: 'Festival',
      Icon: SparklesIcon,
      imageUrl: '/uploads/destinations/Festival-hoa-da-lat-2025.jpg',
      attendees: '50K+',
    },
    {
      id: 2,
      title: 'Carnival Nha Trang',
      date: '20/04/2025',
      location: 'Nha Trang',
      type: 'Carnival',
      Icon: FireIcon,
      imageUrl: '/uploads/destinations/Carnival-nha-trang.jpg',
      attendees: '30K+',
    },
    {
      id: 3,
      title: 'Lễ hội Ẩm thực Hội An',
      date: '10/05/2025',
      location: 'Hội An',
      type: 'Ẩm thực',
      Icon: SparklesIcon,
      imageUrl: '/uploads/destinations/le-hoi-am-thuc-hoi-an.jpeg',
      attendees: '25K+',
    },
    {
      id: 4,
      title: 'Countdown Phú Quốc 2025',
      date: '31/12/2024',
      location: 'Phú Quốc',
      type: 'Sự kiện',
      Icon: FireIcon,
      imageUrl: '/uploads/destinations/Countdown-phu-quoc.jpg',
      attendees: '100K+',
    },
  ];

  const articles = [
    {
      id: 1,
      title: 'Top 5 điểm check-in hot nhất tháng',
      Icon: PhotoIcon,
      imageUrl: '/uploads/destinations/combo-da-nang-hoi-an.jpg',
      views: '12K',
      date: '15/01/2025',
      category: 'Du lịch',
    },
    {
      id: 2,
      title: 'Review địa điểm trending: Đà Lạt mùa hoa',
      Icon: PhotoIcon,
      imageUrl: '/uploads/destinations/Combo Đà Lạt 3N2Đ.png',
      views: '8.5K',
      date: '12/01/2025',
      category: 'Review',
    },
    {
      id: 3,
      title: 'Hành trình 7 ngày khám phá miền Bắc',
      Icon: VideoCameraIcon,
      imageUrl: '/uploads/destinations/ha-noi-ha-long-ninh-binh.jpg',
      views: '6.2K',
      date: '10/01/2025',
      category: 'Trải nghiệm',
    },
  ];

  const toggleLike = (id: number) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Simple countdown to end of day for deals
  function Countdown(): JSX.Element {
    const [left, setLeft] = useState<string>("");
    useState(() => {
      const t = setInterval(() => {
        const now = new Date();
        const end = new Date();
        end.setHours(23,59,59,999);
        const ms = Math.max(0, end.getTime() - now.getTime());
        const hh = Math.floor(ms / 3600000).toString().padStart(2,'0');
        const mm = Math.floor((ms % 3600000)/60000).toString().padStart(2,'0');
        const ss = Math.floor((ms % 60000)/1000).toString().padStart(2,'0');
        setLeft(`${hh}:${mm}:${ss}`);
      }, 1000);
      return () => clearInterval(t);
    });
    return <span>{left || '00:00:00'}</span>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section - Enhanced */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            animation: 'float 20s ease-in-out infinite'
          }} />
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-2.5 mb-6 shadow-lg">
              <FireIconSolid className="h-6 w-6 text-yellow-300" />
              <span className="font-semibold">Nội dung nổi bật</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                Xu hướng & Nổi bật
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto mb-10">
              Khám phá những tour hot, điểm đến trending và nội dung mới nhất từ cộng đồng du lịch
            </p>
          </div>
        </div>

        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-20 text-white" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Trust Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {label: 'Điểm hài lòng', value: '4.8/5', sub: '100K+ đánh giá'},
            {label: 'Lượt đặt', value: '1.2M+', sub: 'trong 12 tháng'},
            {label: 'Đối tác', value: '500+', sub: 'nhà cung cấp uy tín'},
            {label: 'Hỗ trợ', value: '24/7', sub: 'đa kênh'},
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
              <div className="text-sm font-semibold text-gray-700">{s.label}</div>
              <div className="text-xs text-gray-500 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              'Biển', 'Núi', 'Văn hoá', 'Nghỉ dưỡng', 'Gia đình', 'Cặp đôi',
              'Dưới 3tr', '3-10tr', 'Trên 10tr', 'Cuối tuần', '3-5 ngày', '7+ ngày',
            ].map((t, i) => (
              <button key={i} className="px-3 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
                {t}
              </button>
            ))}
          </div>
        </div>
        {/* Enhanced Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-8 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'tours', label: 'Tour nổi bật', icon: TrophyIcon, color: 'from-orange-500 to-red-500' },
              { id: 'destinations', label: 'Điểm đến trending', icon: StarIcon, color: 'from-yellow-500 to-orange-500' },
              { id: 'reviews', label: 'Bài viết nổi bật', icon: SparklesIcon, color: 'from-purple-500 to-pink-500' },
              { id: 'events', label: 'Sự kiện & Lễ hội', icon: CalendarIcon, color: 'from-blue-500 to-purple-500' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                    isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'tours' && (
          <div className="space-y-12">
            {/* Deals with Countdown */}
            <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Ưu đãi đang diễn ra</h2>
                <span className="text-sm font-semibold text-rose-600" id="deal-countdown">Kết thúc trong: <Countdown /></span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[{title:'Giảm 30% Tour Biển', off:30},{title:'Early Bird 25%', off:25},{title:'Combo 2 người', off:50}].map((d,i)=>(
                  <div key={i} className="rounded-xl border border-gray-200 p-5 bg-gray-50">
                    <div className="text-sm text-gray-600 mb-1">Ưu đãi</div>
                    <div className="text-xl font-bold text-gray-900 mb-2">{d.title}</div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-sm font-semibold border border-rose-200">-{d.off}%</div>
                  </div>
                ))}
              </div>
            </section>
            {/* Top Tours */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-bold flex items-center gap-3 mb-2">
                    <TrophyIcon className="h-10 w-10 text-orange-500" />
                    Top 5 Tour được đặt nhiều nhất
                  </h2>
                  <p className="text-gray-600">Những tour được yêu thích nhất trong tháng này</p>
                </div>
                <Link
                  to="/destinations"
                  className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
                >
                  Xem tất cả
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topTours.map((tour, index) => (
                  <div
                    key={tour.id}
                    className="group relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-2"
                  >
                    {/* Rank Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-xl shadow-sm bg-white text-gray-800 border border-gray-200`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                    </div>

                    {/* Image Section */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 overflow-hidden">
                      {tour.imageUrl ? (
                        <img
                          src={tour.imageUrl}
                          alt={tour.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                          {(() => { const Icon = tour.Icon; return <Icon className="h-20 w-20 text-gray-500" />; })()}
                        </div>
                      )}
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 text-sm font-semibold text-gray-900 border border-gray-200">
                        <StarIconSolid className="h-4 w-4 text-yellow-500" />
                        {tour.bookings} lượt
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {tour.name}
                      </h3>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.price)}
                            </span>
                            {tour.discount > 0 && (
                              <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full border border-rose-200">
                                -{tour.discount}%
                              </span>
                            )}
                          </div>
                          {tour.originalPrice && (
                            <div className="text-sm text-gray-500 line-through">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.originalPrice)}
                            </div>
                          )}
                        </div>
                        <Link
                          to="/destinations"
                          className="ml-4 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-semibold shadow-sm hover:shadow-md"
                        >
                          Đặt ngay
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
        </div>
      </section>

            {/* Best Seller Combos */}
            <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 md:p-12 border-2 border-purple-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                  <SparklesIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-gray-900">Combo Best-Seller</h2>
                  <p className="text-gray-600 mt-1">Ưu đãi đặc biệt cho combo trọn gói</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-4xl shadow-lg">
                      ✈️
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl text-gray-900">Tour + Khách sạn + Vé máy bay</h3>
                      <p className="text-sm text-gray-600 mt-1">Tiết kiệm đến 30%</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Combo trọn gói bao gồm tour, khách sạn 4-5 sao và vé máy bay khứ hồi. Giá tốt nhất thị trường với dịch vụ đảm bảo chất lượng!
                  </p>
                  <ul className="space-y-2 mb-6">
                    {['✓ Tour đầy đủ dịch vụ', '✓ Khách sạn 4-5 sao', '✓ Vé máy bay khứ hồi', '✓ Bảo hiểm du lịch'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700">
                        <span className="text-green-500 font-bold">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/deals"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold transform hover:scale-105"
                  >
                    Xem chi tiết
                    <ArrowRightIcon className="h-5 w-5" />
                  </Link>
            </div>
            
                <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-4xl shadow-lg">
                      👥
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl text-gray-900">Book sớm - Giảm sâu</h3>
                      <p className="text-sm text-gray-600 mt-1">Đặt trước 30 ngày</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Đặt tour trước 30 ngày và nhận ưu đãi đặc biệt. Giảm thêm khi đi nhóm từ 4 người trở lên. Càng đặt sớm, càng tiết kiệm nhiều!
                  </p>
                  <ul className="space-y-2 mb-6">
                    {['✓ Giảm 25% khi đặt sớm', '✓ Tặng bảo hiểm du lịch', '✓ Hỗ trợ visa', '✓ Ưu đãi nhóm thêm 10%'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700">
                        <span className="text-green-500 font-bold">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/deals"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:shadow-xl transition-all font-semibold transform hover:scale-105"
                  >
                    Xem chi tiết
                    <ArrowRightIcon className="h-5 w-5" />
                  </Link>
            </div>
          </div>
        </section>
          </div>
        )}

        {activeTab === 'destinations' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-bold flex items-center gap-3 mb-2">
                  <StarIcon className="h-10 w-10 text-yellow-500" />
                  Top 5 Điểm đến yêu thích
                </h2>
                <p className="text-gray-600">Những địa điểm được khách hàng yêu thích nhất</p>
              </div>
              <Link
                to="/destinations"
                className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
              >
                Xem tất cả
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
            
            {loadingDestinations ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-96 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topDestinations.map((dest: any, index: number) => {
                  const imageUrl = getDestinationImageUrl(dest);
                  const hasImage = imageUrl && imageUrl.length > 0;
                  
                  return (
                  <Link
                    key={dest.id}
                    to={`/destinations/${dest.slug}`}
                    className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100"
                  >
                    <div className="relative h-56 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 overflow-hidden">
                      {/* Actual Image */}
                      {hasImage && (
                        <img
                          src={imageUrl}
                          alt={dest.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute top-4 left-4 bg-white/90 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-sm border border-amber-200 z-10">
                        <TrophyIcon className="h-4 w-4 text-amber-600" />
                        #{index + 1}
                      </div>
                      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-xl flex items-center gap-1.5 z-10">
                        <StarIconSolid className="h-5 w-5 text-yellow-500" />
                        <span className="font-bold text-gray-900">{dest.rating || 4.5}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-2xl text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {dest.description || 'Điểm đến tuyệt vời'}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        {dest.price && (
                          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dest.price)}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                          <span>Xem ngay</span>
                          <ArrowRightIcon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                  );
                })}
            </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-12">
            {/* Reviews Snippet Carousel (simple auto-rotate) */}
            <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Khách nói gì về TravelGo</h2>
              <ReviewCarousel />
            </section>
            {/* Featured Articles */}
            <section>
              <h2 className="text-4xl font-bold mb-8 flex items-center gap-3">
                <SparklesIcon className="h-10 w-10 text-purple-500" />
                Bài viết nổi bật
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    to="/stories"
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100"
                  >
                    <div className="relative h-56 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 overflow-hidden">
                      {article.imageUrl ? (
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
                          {(() => { const Icon = article.Icon; return <Icon className="h-20 w-20 text-purple-500" />; })()}
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-purple-700 shadow-sm border border-purple-200">
                        {article.category}
                      </div>
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-900 shadow-sm border border-gray-200 flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        {article.views}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4" />
                        <span>{article.date}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Top Influencers */}
            <section>
              <h2 className="text-4xl font-bold mb-8 flex items-center gap-3">
                <ChartBarIcon className="h-10 w-10 text-blue-500" />
                Top 5 Influencer Review
              </h2>
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="space-y-4">
                  {topInfluencers.map((influencer, index) => (
                    <div
                      key={influencer.id}
                      className="flex items-center justify-between p-5 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                          index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                          'bg-gradient-to-br from-blue-400 to-purple-500'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </div>
                        <img
                          src={influencer.avatarUrl}
                          alt={influencer.name}
                          className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-sm"
                          loading="lazy"
                        />
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{influencer.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                            <span className="font-semibold">{influencer.followers} followers</span>
                            <span>•</span>
                            <span>{influencer.posts} bài viết</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <StarIconSolid className="h-4 w-4 text-yellow-500" />
                              <span className="font-semibold">{influencer.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link
                        to="/stories"
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold transform hover:scale-105"
                      >
                        Xem review
                      </Link>
            </div>
              ))}
            </div>
          </div>
        </section>

            {/* TravelGo Stories Gallery */}
            <section className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-3xl p-8 md:p-12 border-2 border-pink-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-xl">
                  <PhotoIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-gray-900">Góc ảnh TravelGo</h2>
                  <p className="text-gray-600 mt-1">Bộ sưu tập ảnh đẹp của khách hàng</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  '/uploads/destinations/Combo Đà Lạt 3N2Đ.png',
                  '/uploads/destinations/Tour Phú Quốc 4N3Đ.png',
                  '/uploads/destinations/Sapa 2 ngày trekking.jpg',
                  '/uploads/destinations/ha-noi-ha-long-ninh-binh.jpg',
                  '/uploads/destinations/combo-da-nang-hoi-an.jpg',
                  '/uploads/destinations/Hội An - Đà Nẵng.jpg',
                  '/uploads/destinations/Combo Hà Nội - Hạ Long.jpg',
                  '/uploads/destinations/combo-ve-may-bay-va-khach-san.jpg',
                ].map((src, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-transform">
                    <img
                      src={src}
                      alt={`TravelGo photo ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e)=>{ (e.target as HTMLImageElement).style.display='none'; (e.currentTarget.parentElement as HTMLElement).classList.add('bg-gradient-to-br','from-blue-400','via-purple-500','to-pink-500','flex','items-center','justify-center'); (e.currentTarget.parentElement as HTMLElement).textContent='📷'; }}
                    />
                  </div>
                ))}
              </div>
              <div className="text-center">
          <Link 
                  to="/stories"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold text-lg transform hover:scale-105"
                >
                  Xem tất cả ảnh
                  <ArrowRightIcon className="h-6 w-6" />
          </Link>
        </div>
      </section>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-bold flex items-center gap-3 mb-2">
                  <CalendarIcon className="h-10 w-10 text-blue-500" />
                  Sự kiện & Lễ hội
                </h2>
                <p className="text-gray-600">Các sự kiện du lịch và lễ hội đặc sắc đang diễn ra</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="relative h-56 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 overflow-hidden">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
                        {(() => { const Icon = event.Icon; return <Icon className="h-20 w-20 text-blue-500" />; })()}
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-blue-600 shadow-lg">
                      {event.type}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                      {event.title}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">{event.date}</span>
                      </div>
                      {event.attendees && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <UserGroupIcon className="h-4 w-4 text-pink-500" />
                          <span className="font-medium">{event.attendees} người tham gia</span>
                        </div>
                      )}
              </div>
            </div>
              </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Sitewide CTA: Email Capture */}
        <section className="mt-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-extrabold mb-2">Nhận ưu đãi độc quyền</h2>
            <p className="text-white/90 mb-4">Đăng ký email để nhận tin khuyến mãi và trend du lịch mới nhất.</p>
            <form onSubmit={(e)=>e.preventDefault()} className="flex flex-col sm:flex-row gap-3">
              <input type="email" required placeholder="Nhập email của bạn" className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none" />
              <button className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black">Đăng ký</button>
            </form>
          </div>
        </section>
      </div>
      </div>
  );
}

function ReviewCarousel(): JSX.Element {
  const reviews = [
    { author: 'Olivia Chen', text: 'Amazing support and seamless booking experience!', rating: 5 },
    { author: 'Liam Martinez', text: 'Great value, family-friendly options. Highly recommend.', rating: 4.9 },
    { author: 'Sofia Ivanova', text: 'Fast checkout, secure payments. Trip was perfect.', rating: 4.8 },
    { author: 'Noah Schmidt', text: 'Very organized itinerary. Will book again.', rating: 4.7 },
    { author: 'Aiko Tanaka', text: 'Beautiful destinations and helpful guides!', rating: 5 },
    { author: 'Mateo Rossi', text: 'Responsive team and fair prices.', rating: 4.8 },
    { author: 'Emma Dubois', text: 'Loved the hotel selection and tours.', rating: 4.9 },
    { author: 'Lucas Silva', text: 'Quick support, smooth process.', rating: 4.7 },
    { author: 'Mia Kowalski', text: 'Safe payment, instant confirmation.', rating: 4.8 },
    { author: 'Arun Patel', text: 'Great recommendations for couples.', rating: 4.9 },
    { author: 'Isla McCarthy', text: 'Wonderful experience overall!', rating: 4.8 },
    { author: 'Yara Haddad', text: 'Excellent customer service!', rating: 4.9 },
  ];
  // Three-card slider
  const CARD_W = 320;
  const GAP = 16;
  const track = [...reviews, ...reviews];
  const [idx, setIdx] = useState(0);
  const [transition, setTransition] = useState('transform 600ms ease');
  const next = () => setIdx((p)=> p+1);
  const prev = () => setIdx((p)=> (p-1+track.length)%track.length);
  useState(() => { const t = setInterval(next, 3000); return () => clearInterval(t); });
  useState(() => {
    if (idx >= reviews.length) {
      const id = setTimeout(() => {
        setTransition('none');
        setIdx(0);
        requestAnimationFrame(() => setTransition('transform 600ms ease'));
      }, 610);
      return () => clearTimeout(id);
    }
  });
  const offset = -(idx * (CARD_W + GAP));
  return (
    <div className="relative mx-auto max-w-6xl overflow-hidden">
      <div className="relative" style={{ height: 200 }}>
        <div className="absolute left-0 top-0 flex" style={{ gap: GAP, width: track.length * (CARD_W + GAP), transform: `translateX(${offset}px)`, transition }}>
          {track.map((r, i)=> (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5" style={{ width: CARD_W }}>
              <div className="flex items-center justify-center mb-2">
                <img
                  src={`https://i.pravatar.cc/80?u=${encodeURIComponent(r.author)}`}
                  alt={r.author}
                  className="h-10 w-10 rounded-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, k) => (
                  <StarIconSolid key={k} className={`h-4 w-4 ${k < Math.round(r.rating) ? 'text-yellow-500' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-gray-800 font-medium mb-1">“{r.text}”</p>
              <div className="text-sm text-gray-600">— {r.author}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
