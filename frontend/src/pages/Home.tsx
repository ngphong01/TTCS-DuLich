import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Skeleton from '../components/Skeleton';
import SEOHead from '../components/SEOHead';
import { useFeaturedDestinations } from '../hooks/useDestinations';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../services/category';
import { getFeaturedReviews } from '../services/review';
import { getDestinationImageUrl } from '../utils/imageHelper';
import HeroVideo from '../components/HeroVideo';
import CheckInSection from '../components/CheckInSection';
import FlyingPlane from '../components/FlyingPlane';
import PlaneBanner from '../components/PlaneBanner';
import {
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  StarIcon,
  ArrowRightIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  SunIcon,
  HeartIcon,
  ClockIcon,
  FireIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.ok) {
        setSubmitted(true);
        setEmail('');
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {submitted && (
        <div className="mb-4 p-3 bg-green-500/20 rounded-lg border border-green-300/50 max-w-xl mx-auto">
          <p className="text-green-100 font-semibold">Đăng ký thành công! Cảm ơn bạn đã quan tâm.</p>
        </div>
      )}
      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email của bạn..."
          required
          className="flex-1 px-6 py-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-xl"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-purple-600 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký ngay'}
        </button>
      </form>
    </>
  );
}

function HomeReviewCarousel(): JSX.Element {
  const items = [
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
  const CARD_W = 320;
  const GAP = 16;
  const track = [...items, ...items];
  const [idx, setIdx] = React.useState(0);
  const [transition, setTransition] = React.useState('transform 600ms ease');

  const next = React.useCallback(() => setIdx((p) => p + 1), []);
  const prev = React.useCallback(() => setIdx((p) => (p - 1 + track.length) % track.length), [track.length]);

  React.useEffect(() => { const t = setInterval(next, 3000); return () => clearInterval(t); }, [next]);
  React.useEffect(() => {
    if (idx >= items.length) {
      const id = setTimeout(() => {
        setTransition('none');
        setIdx(0);
        requestAnimationFrame(() => {
          setTransition('transform 600ms ease');
        });
      }, 610);
      return () => clearTimeout(id);
    }
  }, [idx, items.length]);

  const offset = -(idx * (CARD_W + GAP));

  return (
    <div className="relative mx-auto max-w-6xl overflow-hidden">
      <div className="relative" style={{ height: 200 }}>
        <div className="absolute left-0 top-0 flex" style={{ gap: GAP, width: track.length * (CARD_W + GAP), transform: `translateX(${offset}px)`, transition: transition }}>
          {track.map((r: any, i: number) => (
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
              <p className="text-gray-800 font-medium mb-1">"{r.text}"</p>
              <div className="text-sm text-gray-600">— {r.author}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const { data: destinations, isLoading } = useFeaturedDestinations();
  
  // Debug: Log destinations when they load
  React.useEffect(() => {
    if (destinations && Array.isArray(destinations) && destinations.length > 0) {
      console.log('🏠 Home page - Destinations loaded:', destinations.length);
      destinations.forEach((d: any) => {
        console.log(`  📍 ${d.name}: image=${d.image || 'NONE'}, hasImage=${!!d.image}`);
      });
    }
  }, [destinations]);
  
  // 🔥 CRITICAL: Thêm lang vào query keys để React Query refetch khi đổi ngôn ngữ
  const { i18n } = useTranslation();
  
  const { data: categories, isLoading: loadingCats } = useQuery({
    queryKey: ['categories', 'home', i18n.language],
    queryFn: getCategories,
  });
  const { data: reviews } = useQuery({
    queryKey: ['reviews', 'featured', i18n.language],
    queryFn: () => getFeaturedReviews(3),
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (departureDate) {
      params.set('departureDate', departureDate);
    }
    if (returnDate) {
      params.set('returnDate', returnDate);
    }
    // Luôn navigate ngay cả khi chỉ có ngày (không có query)
    navigate(`/destinations?${params.toString()}`);
  };

  const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin;
  
  // Schema.org JSON-LD for Organization
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "TravelGo",
    "description": "Công ty du lịch hàng đầu Việt Nam - Khám phá thế giới cùng chúng tôi",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+84-1900-xxxx",
      "contactType": "customer service",
      "email": "support@travelgo.com"
    },
    "sameAs": [
      "https://www.facebook.com/travelgo",
      "https://www.instagram.com/travelgo"
    ]
  };

  // Stats data
  const stats = [
    { value: '500+', label: 'Điểm đến', icon: MapPinIcon, color: 'text-blue-500' },
    { value: '4.8/5', label: 'Đánh giá', icon: StarIcon, color: 'text-yellow-500' },
    { value: '24/7', label: 'Hỗ trợ', icon: UserGroupIcon, color: 'text-purple-500' },
    { value: '50K+', label: 'Khách hàng', icon: GlobeAltIcon, color: 'text-pink-500' },
  ];

  // Deals data with real image icons
  const deals = [
    { 
      id: 1, 
      title: 'Giảm 30% Tour Biển Đảo', 
      discount: 30, 
      description: 'Áp dụng cho tất cả tour biển trong tháng này',
      expires: '31/12/2024',
      gradient: 'from-blue-500 to-cyan-500',
      imgSrc: '/icons/beach.svg'
    },
    { 
      id: 2, 
      title: 'Combo 2 Người 1 Giá', 
      discount: 50, 
      description: 'Mua 2 tour chỉ tính giá 1 người',
      expires: '30/11/2024',
      gradient: 'from-purple-500 to-pink-500',
      imgSrc: '/globe.svg'
    },
    { 
      id: 3, 
      title: 'Early Bird - Giảm 25%', 
      discount: 25, 
      description: 'Đặt tour trước 30 ngày nhận ưu đãi đặc biệt',
      expires: '20/12/2024',
      gradient: 'from-orange-500 to-red-500',
      imgSrc: '/window.svg'
    },
  ];

  return (
    <>
      <SEOHead
        title="TravelGo - Khám phá thế giới cùng chúng tôi"
        description="TravelGo - Công ty du lịch hàng đầu Việt Nam. Khám phá những điểm đến tuyệt vời trong và ngoài nước với dịch vụ chất lượng cao."
        keywords="du lịch, tour, điểm đến, travel, vietnam travel, đặt tour, tour trong nước, tour quốc tế"
        image={`${siteUrl}/logo.png`}
        url={siteUrl}
        type="website"
        schema={organizationSchema}
      />
      <div className="w-full">
      {/* Hero Section với Video Background */}
      <section className="relative overflow-hidden text-white min-h-[100vh] flex items-center">
        {/* Video Background Component */}
        <div className="absolute inset-0 w-full h-full">
          <HeroVideo 
            videoSrc="/videos/hero-travel.mp4"
            posterSrc="/images/hero-poster.jpg"
            fallbackImage="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
          />
        </div>

        {/* Additional Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 z-10"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse z-10"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse z-10" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse z-10" style={{ animationDelay: '2s' }}></div>

        {/* Flying Planes - Tăng tính hấp dẫn với nhiều máy bay */}
        <PlaneBanner count={5} />
        <FlyingPlane size="lg" delay={0} duration={25} direction="left-to-right" />
        <FlyingPlane size="md" delay={5} duration={28} direction="right-to-left" />
        <FlyingPlane size="sm" delay={10} duration={22} direction="left-to-right" />
        <FlyingPlane size="md" delay={15} duration={30} direction="right-to-left" />
        <FlyingPlane size="lg" delay={20} duration={26} direction="left-to-right" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge với animation */}
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xl rounded-full px-4 py-1.5 mb-4 shadow-xl border border-white/30 hover:bg-white/30 transition-all duration-300 animate-fade-in">
              <StarIconSolid className="h-4 w-4 text-yellow-300 animate-spin-slow" />
              <span className="text-xs font-semibold">TravelGo - Nền tảng du lịch hàng đầu</span>
            </div>

            {/* Main Heading với animation */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 leading-tight animate-fade-in-up">
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl">
                Khám phá thế giới
              </span>
              <br />
              <span className="text-white drop-shadow-2xl">theo cách của bạn</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl lg:text-2xl text-white/95 mb-8 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Tìm kiếm điểm đến yêu thích, xem gợi ý và đặt chỗ nhanh chóng. 
              TravelGo đồng hành cùng mọi hành trình của bạn.
            </p>

            {/* Enhanced Search Bar với glassmorphism */}
            <div className="bg-white/15 backdrop-blur-2xl rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/30 mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Main Search Input */}
                <div className="relative">
                  <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Bạn muốn đi đâu? (Hà Nội, Đà Nẵng, Paris...)"
                    className="w-full pl-12 pr-4 py-4 text-lg text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-white/50 shadow-lg"
                  />
                </div>

                {/* Date Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      placeholder="Ngày đi"
                      className="w-full pl-12 pr-4 py-3 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-white/50 shadow-lg"
                    />
                  </div>
                  <div className="relative">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      placeholder="Ngày về"
                      min={departureDate || undefined}
                      className="w-full pl-12 pr-4 py-3 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-white/50 shadow-lg"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="w-full sm:w-auto sm:px-12 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-lg rounded-xl hover:from-yellow-500 hover:to-orange-600 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  <span>Tìm kiếm</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Stats với animation */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white/15 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/30 hover:bg-white/25 hover:border-white/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg"
                  >
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color} mb-1.5 sm:mb-2 mx-auto drop-shadow-lg`} />
                    <div className="text-xl sm:text-2xl font-bold mb-0.5 text-white drop-shadow-lg">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs text-white/90 font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
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

      {/* Categories Section */}
      <section className="py-6 sm:py-10 lg:py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
              Khám phá theo <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">sở thích</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Chọn loại hình du lịch phù hợp với phong cách của bạn
            </p>
          </div>

          {loadingCats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 sm:h-32 rounded-xl sm:rounded-2xl" />
              ))}
            </div>
          )}

          {!loadingCats && categories && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((c: any) => (
                <Link
                  key={c.id}
                  to={`/destinations?categoryId=${c.id}`}
                  className="group relative overflow-hidden bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-100 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 text-center"
                >
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg sm:rounded-xl group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                      <MapPinIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{c.name}</h3>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300 rounded-xl sm:rounded-2xl"></div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-12 bg-white relative overflow-hidden">
        {/* Decorative Planes */}
        <FlyingPlane size="sm" delay={0} duration={25} direction="left-to-right" />
        <FlyingPlane size="md" delay={12} duration={30} direction="right-to-left" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Điểm đến <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">nổi bật</span>
              </h2>
              <p className="text-lg text-gray-600">Những địa điểm được yêu thích nhất</p>
            </div>
            <Link
              to="/destinations"
              className="hidden sm:flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 text-sm"
            >
              Xem tất cả
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          )}

          {!isLoading && destinations && Array.isArray(destinations) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.slice(0, 6).map((d: any) => {
                // Debug: Log destination data
                console.log(`🔍 ${d.name}:`, {
                  hasImageField: !!d.image,
                  imageField: d.image,
                  name: d.name
                });
                
                const imageUrl = getDestinationImageUrl(d);
                const hasImage = imageUrl && imageUrl.length > 0;
                
                // Debug log
                console.log(`  → Image URL result: "${imageUrl}", hasImage: ${hasImage}`);
                
                // 🔥 CRITICAL: Tính rating giống như Destinations page - dùng reviews thực tế
                // Deterministic fallback rating (4.0 - 5.0) when no reviews available
                const computeFallbackRating = (slug: string): number => {
                  let sum = 0;
                  for (let i = 0; i < slug.length; i++) sum += slug.charCodeAt(i);
                  const step = (sum % 11); // 0..10 -> 11 values
                  return 4.0 + step / 10; // 4.0 .. 5.0 in 0.1 steps
                };
                
                // Use destination rating from API if available, otherwise compute fallback
                // Note: Home page không fetch reviews cho từng destination (performance)
                // Nên dùng rating từ API hoặc fallback rating dựa trên slug
                // Destinations page thì fetch reviews để tính chính xác hơn
                const displayRating = typeof d.rating === 'number' && d.rating > 0
                  ? d.rating 
                  : computeFallbackRating(d.slug || d.name || 'dest');
                
                return (
                <Link
                  to={`/destinations/${d.slug}`}
                  key={d.id}
                  className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  {/* Image */}
                  <div className="relative h-64 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 overflow-hidden">
                    {/* Actual Image */}
                    {hasImage && (
                      <img
                        src={imageUrl.startsWith('http') ? imageUrl : `${window.location.origin}${imageUrl}`}
                        alt={d.name}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                        style={{ display: 'block' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.error(`❌ Failed to load image for ${d.name}:`, imageUrl);
                          console.error(`   Status:`, (e.target as HTMLImageElement).complete ? 'Complete but error' : 'Incomplete');
                          target.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log(`✅ Image loaded successfully for ${d.name}:`, imageUrl);
                          console.log(`   Image dimensions:`, (document.querySelector(`img[alt="${d.name}"]`) as HTMLImageElement)?.naturalWidth, 'x', (document.querySelector(`img[alt="${d.name}"]`) as HTMLImageElement)?.naturalHeight);
                        }}
                      />
                    )}
                    {/* Gradient overlay - should be above image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 pointer-events-none"></div>
                    {/* Placeholder Icon - only show if no image */}
                    {!hasImage && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity duration-500">
                        <PhotoIcon className="h-32 w-32 text-white group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                    {d.featured && (
                      <div className="absolute top-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg z-10">
                        <StarIconSolid className="h-4 w-4" />
                        Nổi bật
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-gray-900 shadow-lg flex items-center gap-1 z-10">
                      <StarIconSolid className="h-4 w-4 text-yellow-500" />
                      {displayRating.toFixed(1)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-xl text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                      {d.name}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-3 leading-relaxed">{d.description}</p>
                    {d.price && (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Từ</div>
                          <div className="text-xl font-bold text-blue-600">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(d.price)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-600 font-semibold group-hover:translate-x-1 transition-transform text-sm">
                          <span>Xem ngay</span>
                          <ArrowRightIcon className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Deals Section */}
      <section className="py-12 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden">
        {/* Hot Deals Planes */}
        <FlyingPlane size="lg" delay={0} duration={20} direction="left-to-right" />
        <FlyingPlane size="sm" delay={7} duration={18} direction="right-to-left" />
        <FlyingPlane size="md" delay={14} duration={22} direction="left-to-right" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold mb-3">
              <SparklesIcon className="h-4 w-4" />
              Ưu đãi đặc biệt
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
              <FireIcon className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Ưu đãi hot</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cơ hội tiết kiệm tuyệt vời đang chờ bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-orange-300"
              >
                {/* Discount Badge */}
                <div className={`absolute top-4 right-4 bg-gradient-to-br ${deal.gradient} text-white text-xl font-black px-4 py-2 rounded-xl shadow-lg transform group-hover:scale-105 transition-transform z-10`}>
                  -{deal.discount}%
                </div>

                {/* Icon (real image) */}
                <div className="mb-4 transform group-hover:scale-105 transition-transform duration-300">
                  <div className={`p-3 bg-gradient-to-br ${deal.gradient} bg-opacity-10 rounded-xl inline-flex`}>
                    <img src={deal.imgSrc} alt="deal-icon" className="h-10 w-10 object-contain" loading="lazy" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {deal.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{deal.description}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Hết hạn: {deal.expires}</span>
                  <div className="flex items-center gap-1.5 text-orange-600 font-semibold group-hover:translate-x-1 transition-transform text-sm">
                    <span>Xem chi tiết</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Check-in Section */}
      <CheckInSection />

      {/* Video Showcase Section - Hành trình thực tế (YouTube autoplay, loop, no controls) */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
              <PhotoIcon className="h-5 w-5" />
              Hành trình thực tế
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Khám phá <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">hành trình</span> thực tế
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Video thực tế từ Hạ Long, Phú Quốc và Đà Lạt – chạy tự động, không gián đoạn.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Main Video: Hạ Long Bay */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="relative aspect-video bg-black overflow-hidden">
                {/* 
                  Trick: phóng to và đẩy iframe lên trên/dưới để cắt bỏ vùng chứa UI YouTube 
                  + pointer-events-none: người dùng không thể bấm play/pause hay mở YouTube
                */}
                <iframe
                  title="Hạ Long Bay - Kỳ quan thiên nhiên"
                  // Cắt ngắn thời lượng: chỉ phát đoạn đầu (ví dụ 60s) rồi loop lại
                  src="https://www.youtube.com/embed/vt9OL_sJ5gA?autoplay=1&mute=1&loop=1&playlist=vt9OL_sJ5gA&controls=0&rel=0&modestbranding=1&showinfo=0&start=0&end=60"
                  className="pointer-events-none absolute -top-[10%] left-0 w-full h-[120%]"
                  allow="autoplay; encrypted-media"
                  allowFullScreen={false}
                  frameBorder="0"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="pointer-events-none absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Hạ Long Bay - Kỳ quan thiên nhiên</h3>
                  <p className="text-white/90">Hành trình thực tế khám phá vẻ đẹp hùng vĩ của vịnh Hạ Long.</p>
                </div>
              </div>
            </div>

            {/* Side Videos: Phú Quốc & Đà Lạt */}
            <div className="grid grid-cols-1 gap-6">
              {[
                {
                  id: 'Ahr6upMWeGE',
                  title: 'Phú Quốc - Thiên đường biển đảo',
                  description: 'Nước biển trong xanh, cát trắng và hoàng hôn tuyệt đẹp.',
                },
                {
                  id: 'MILNjcJETQQ',
                  title: 'Đà Lạt - Thành phố ngàn hoa',
                  description: 'Không khí se lạnh, sương mù và những đồi thông thơ mộng.',
                },
              ].map((video) => (
                <div
                  key={video.id}
                  className="relative rounded-2xl overflow-hidden shadow-xl"
                >
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <iframe
                      title={video.title}
                      src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&loop=1&playlist=${video.id}&controls=0&rel=0&modestbranding=1&showinfo=0`}
                      className="pointer-events-none absolute -top-[10%] left-0 w-full h-[120%]"
                      allow="autoplay; encrypted-media"
                      allowFullScreen={false}
                      frameBorder="0"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="pointer-events-none absolute bottom-4 left-4 right-4">
                      <h4 className="text-lg font-bold text-white">{video.title}</h4>
                      <p className="text-sm text-white/85">{video.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Đánh giá từ <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">khách hàng</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những phản hồi chân thật từ hành trình của bạn
            </p>
          </div>

          <HomeReviewCarousel />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-cyan-500 via-teal-500 to-sky-500 text-white relative overflow-hidden">
        {/* Flying Planes in CTA Section */}
        <FlyingPlane size="md" delay={0} duration={18} direction="left-to-right" />
        <FlyingPlane size="lg" delay={6} duration={22} direction="right-to-left" />
        
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            Khám phá ngay chuyến đi<br />tiếp theo của bạn
          </h2>
          <p className="text-lg sm:text-xl mb-8 opacity-95 max-w-2xl mx-auto">
            Hàng ngàn điểm đến tuyệt vời đang chờ bạn khám phá và trải nghiệm
          </p>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold text-base rounded-lg hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            <span>Khám phá ngay</span>
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">Đăng ký nhận bản tin</h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Nhận thông tin ưu đãi độc quyền và điểm đến mới mỗi tuần
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </div>
    </>
  );
}