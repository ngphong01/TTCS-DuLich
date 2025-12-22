import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getTourBySlug, getToursPaged } from '../services/tour';
import { useLanguage } from '../contexts/LanguageContext';
import Skeleton from '../components/Skeleton';
import SEOHead from '../components/SEOHead';
import {
  CalendarDaysIcon,
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ClockIcon,
  TicketIcon,
  SparklesIcon,
  StarIcon,
  DocumentTextIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  CheckIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  CheckBadgeIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';
import { useState, useMemo, useEffect, useRef } from 'react';
import { getDestinationImageUrl } from '../utils/imageHelper';

export default function TourDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { i18n } = useTranslation();
  const bookingRef = useRef<HTMLDivElement | null>(null);
  
  // State management
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [isHighlightsExpanded, setIsHighlightsExpanded] = useState(true);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isFavorite, setIsFavorite] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Fetch tour data
  const { data: tour, isLoading, error: tourError } = useQuery({
    queryKey: ['tour', slug, i18n.language],
    queryFn: () => getTourBySlug(slug!),
    enabled: !!slug,
    retry: 1,
  });

  const { data: relatedToursData } = useQuery({
    queryKey: ['related-tours', tour?.destinationId, i18n.language],
    queryFn: () => getToursPaged(1, 3, { destinationId: tour?.destinationId ?? undefined }),
    enabled: !!tour?.destinationId,
  });

  const relatedTours = relatedToursData?.items?.filter(t => t.slug !== slug) || [];

  // Scroll detection for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset accordion when tour changes
  useEffect(() => {
    setExpandedAccordion(null);
  }, [slug]);

  // Get images
  const images = useMemo(() => {
    if (!tour) return [];
    const allImages: string[] = [];
    if (tour.image) allImages.push(tour.image);
    if (tour.photos && Array.isArray(tour.photos)) {
      allImages.push(...tour.photos);
    } else if (tour.photos && typeof tour.photos === 'string') {
      try {
        const parsed = JSON.parse(tour.photos);
        if (Array.isArray(parsed)) allImages.push(...parsed);
      } catch {}
    }
    return allImages.length > 0 ? allImages : ['/placeholder.jpg'];
  }, [tour]);

  // Gallery images
  const galleryImages = useMemo(() => {
    return images.filter(Boolean);
  }, [images]);

  // Generate tour code
  const tourCode = useMemo(() => {
    if (!tour) return 'NDSGN000';
    return `NDSGN${tour.id?.toString().padStart(3, '0') || '000'}`;
  }, [tour]);

  // Get tags
  const tags = useMemo(() => {
    if (!tour?.tags) return ['Island', 'Snorkeling'];
    if (Array.isArray(tour.tags)) return tour.tags;
    if (typeof tour.tags === 'string') {
      try {
        const parsed = JSON.parse(tour.tags);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return ['Island', 'Snorkeling'];
  }, [tour?.tags]);

  // Get highlights
  const highlights = useMemo(() => {
    if (!tour?.highlights) return [];
    if (Array.isArray(tour.highlights)) return tour.highlights;
    return [];
  }, [tour?.highlights]);

  // Get itinerary
  const itinerary = useMemo(() => {
    if (!tour?.itinerary) return [];
    if (Array.isArray(tour.itinerary)) return tour.itinerary;
    return [];
  }, [tour?.itinerary]);

  // Get FAQ
  const faq = useMemo(() => {
    if (!tour?.faq) return [];
    if (Array.isArray(tour.faq)) return tour.faq;
    return [];
  }, [tour?.faq]);

  // Reset selectedImageIndex if it's out of bounds
  useEffect(() => {
    if (images.length > 0 && selectedImageIndex >= images.length) {
      setSelectedImageIndex(0);
    }
  }, [images.length, selectedImageIndex]);

  // Format price
  const formatPrice = (price?: number) => {
    if (!price) return '0';
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const calendarDays = useMemo(() => getDaysInMonth(selectedMonth), [selectedMonth]);

  // Mock departure dates with prices - using deterministic approach
  const departureDates = useMemo(() => {
    const dates: Record<string, number> = {};
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const basePrice = tour?.price || 15590000;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const seed = year * 12 + month;
    
    for (let i = 1; i <= 28; i++) {
      const pseudoRandom = ((seed * 31 + i) % 100) / 100;
      if (pseudoRandom > 0.7) {
        const date = new Date(year, month, i);
        date.setHours(0, 0, 0, 0);
        if (date >= today) {
          dates[i.toString()] = basePrice;
        }
      }
    }
    return dates;
  }, [selectedMonth, tour?.price]);

  // Calculate prices
  const totalPrice = tour?.price ? (tour.price * adults + (tour.price * 0.7 * children)) : 0;
  const serviceFee = totalPrice * 0.05;
  const grandTotal = totalPrice + serviceFee;

  const handleBooking = () => {
    if (!selectedDate) {
      alert('Vui lòng chọn ngày khởi hành');
      return;
    }
    navigate(`/checkout?type=tour&id=${tour?.id}&date=${selectedDate}&adults=${adults}&children=${children}`);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tour?.name,
        text: tour?.shortDescription || tour?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link đã được sao chép!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Skeleton className="h-[70vh] w-full" />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (tourError) {
    console.error('Error loading tour:', tourError);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lỗi khi tải tour</h2>
          <p className="text-gray-600 mb-4">
            {tourError instanceof Error ? tourError.message : 'Đã xảy ra lỗi không xác định'}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:underline"
            >
              ← Quay lại
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:underline"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy tour</h2>
          <p className="text-gray-600 mb-4">Tour với slug "{slug}" không tồn tại.</p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  const mainImage = images[selectedImageIndex] || images[0] || '/placeholder.jpg';
  const price = tour.price || 980000;
  const originalPrice = tour.originalPrice;
  const destinationName = tour.destination?.name || 'Phú Quốc';
  const tourImage = tour.image && tour.image.startsWith('http') ? tour.image : (tour.image && tour.image.startsWith('/uploads') ? tour.image : `/uploads/destinations/${tour.image}`) || '/placeholder.jpg';

  return (
    <>
      <SEOHead
        title={tour.name}
        description={tour.description || ''}
        image={mainImage}
        type="product"
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
        {/* Sticky Top Bar - Appears on scroll */}
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate(-1)}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <div>
                    <h1 className="font-bold text-gray-900 line-clamp-1">{tour.name}</h1>
                    <div className="flex items-center gap-2 text-sm">
                      {tour.rating && (
                        <div className="flex items-center gap-1">
                          <StarIconSolid className="w-4 h-4 text-yellow-400" />
                          <span className="font-semibold">{tour.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {tour.duration && (
                        <span className="text-gray-600">• {tour.duration} ngày</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-blue-600">{formatPrice(price)} ₫</span>
                  <button 
                    onClick={scrollToBooking}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    Đặt ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section with Parallax Effect */}
        <section className="relative h-[70vh] min-h-[600px] overflow-hidden">
          {/* Background Image with Parallax */}
          <div className="absolute inset-0" style={{ transform: `translateY(${scrolled ? '50px' : '0'})`, transition: 'transform 0.3s ease-out' }}>
            <img
              src={tourImage}
              alt={tour.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>

          {/* Floating Action Buttons */}
          <div className="absolute top-6 right-6 flex gap-3 z-10">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all border border-white/30"
            >
              {isFavorite ? (
                <HeartIconSolid className="w-6 h-6 text-red-500" />
              ) : (
                <HeartIcon className="w-6 h-6 text-white" />
              )}
            </button>
            <button
              onClick={handleShare}
              className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all border border-white/30"
            >
              <ShareIcon className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map((tag: string, i: number) => (
                    <span key={i} className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-semibold border border-white/20">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-2xl">
                {tour.name}
              </h1>

              {/* Info Cards */}
              <div className="flex flex-wrap gap-4 mb-6">
                {tour.rating && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
                  <div className="flex items-center gap-2">
                      <StarIconSolid className="w-6 h-6 text-yellow-400" />
                      <span className="text-2xl font-bold text-white">{tour.rating.toFixed(1)}</span>
                      {tour.reviewCount && (
                        <span className="text-white/80 ml-2">({tour.reviewCount} đánh giá)</span>
                      )}
                  </div>
                  </div>
                )}
                {tour.duration && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
                  <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="w-6 h-6 text-white" />
                      <span className="text-lg font-semibold text-white">{tour.duration} ngày {tour.duration - 1} đêm</span>
                  </div>
                  </div>
                )}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                    <span className="text-lg font-semibold text-white">Phù hợp mọi lứa tuổi</span>
                  </div>
                  </div>
                </div>

                {/* Short Description */}
              {tour.shortDescription && (
                <p className="text-white/90 text-xl max-w-4xl leading-relaxed backdrop-blur-sm">
                  {tour.shortDescription}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (Content) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Intro */}
              {tour.description && (
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                    <h2 className="text-3xl font-bold text-gray-900">Giới thiệu</h2>
                </div>
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                    {tour.description}
                  </p>
              </div>
              )}

              {/* Highlights */}
              {highlights.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl shadow-xl p-8 border border-blue-100">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <CheckCircleIcon className="w-8 h-8 text-blue-600" />
                    Điểm nổi bật
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {highlights.map((highlight: any, i: number) => (
                      <div key={i} className="group bg-white rounded-2xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <CheckIcon className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-gray-700 font-medium leading-relaxed">{highlight.text || highlight}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Departure Schedule */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">📅</span>
                  <h2 className="text-2xl font-bold text-gray-900">LỊCH KHỞI HÀNH</h2>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Chọn tháng:</span>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium">
                      {selectedMonth.getMonth() + 1}/{selectedMonth.getFullYear()}
                    </button>
                  </div>
                </div>

                {/* Calendar */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => handleMonthChange('prev')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                      >
                        <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                      </button>
                      <h3 className="text-lg font-semibold text-blue-600">
                        THÁNG {selectedMonth.getMonth() + 1}/{selectedMonth.getFullYear()}
                      </h3>
                      <button
                        onClick={() => handleMonthChange('next')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                      >
                        <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 text-sm font-medium">
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => (
                        <div
                          key={day}
                          className={`text-center py-2 ${idx === 5 ? 'text-red-600' : 'text-gray-700'}`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 p-4">
                    {calendarDays.map((day, idx) => {
                      if (day === null) {
                        return <div key={`empty-${idx}`} className="aspect-square" />;
                      }
                      
                      const hasDeparture = departureDates[day.toString()];
                      const isSelected = selectedDate === `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      
                      return (
                        <button
                          key={day}
                          onClick={() => {
                            if (hasDeparture) {
                              setSelectedDate(`${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
                            }
                          }}
                          disabled={!hasDeparture}
                          className={`aspect-square border rounded flex flex-col items-center justify-center text-sm transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : hasDeparture
                              ? 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700'
                              : 'border-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <span className="font-medium">{day}</span>
                          {hasDeparture && (
                            <span className={`text-xs ${isSelected ? 'text-white' : 'text-red-600 font-semibold'}`}>
                              {formatPrice(hasDeparture).replace(/,/g, '.').slice(0, -3)}K
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="text-red-600 italic text-sm mt-4">
                  ⚠️ Quý khách vui lòng chọn ngày phù hợp
                </p>
              </div>

              {/* Itinerary */}
              {itinerary.length > 0 && (
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <CalendarDaysIcon className="w-6 h-6 text-white" />
                </div>
                    <h2 className="text-3xl font-bold text-gray-900">Lịch trình chi tiết</h2>
                    </div>
                  <div className="relative space-y-4">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-600" />
                    
                    {itinerary.map((day: any, i: number) => {
                      const isExpanded = expandedDay === i;
                      const dayNumber = i + 1;
                        const dayTitle = day.title || `Ngày ${dayNumber}`;
                        const dayMeals = day.meals || day.meals;
                        
                        return (
                        <div key={i} className="relative">
                          <div className="relative z-10 flex-shrink-0 mb-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg transition-all ${
                                isExpanded 
                                  ? 'bg-blue-600 scale-110' 
                                  : 'bg-gray-400 hover:bg-blue-500'
                              }`}>
                                {dayNumber}
                              </div>
                            </div>
                          <div className="ml-16 -mt-12">
                              <button
                              onClick={() => setExpandedDay(isExpanded ? null : i)}
                                className={`w-full text-left rounded-xl p-5 transition-all duration-200 ${
                                  isExpanded
                                    ? 'bg-blue-50 border-2 border-blue-200 shadow-md'
                                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <h3 className={`text-lg font-semibold mb-2 ${
                                      isExpanded ? 'text-blue-900' : 'text-gray-900'
                                    }`}>
                                      {dayTitle}
                                    </h3>
                                    {dayMeals && (
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span>{dayMeals}</span>
                                      </div>
                                    )}
                                    {isExpanded && day.description && (
                                      <div className="mt-3 text-gray-700 leading-relaxed text-sm">
                                        {day.description}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-shrink-0">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                      isExpanded
                                        ? 'bg-blue-600'
                                        : 'bg-blue-500 hover:bg-blue-600'
                                    }`}>
                                      {isExpanded ? (
                                        <ChevronUpIcon className="h-5 w-5 text-white" />
                                      ) : (
                                        <span className="text-white text-lg">▶</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
              )}

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Thư viện ảnh</h2>
                      <p className="text-gray-600 mt-1">Khám phá hành trình qua những khoảnh khắc đẹp nhất</p>
                </div>
                    <button
                      onClick={() => {
                        setCurrentImageIndex(0);
                        setShowGallery(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                    >
                      Xem tất cả ({galleryImages.length})
                    </button>
              </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {galleryImages.slice(0, 8).map((photo: string, i: number) => {
                      const isLarge = i === 0;
                      return (
                        <div
                          key={i}
                          onClick={() => {
                            setCurrentImageIndex(i);
                            setShowGallery(true);
                          }}
                          className={`relative overflow-hidden rounded-xl cursor-pointer group ${isLarge ? 'col-span-2 row-span-2' : ''} aspect-square`}
                        >
                          <img
                            src={photo.startsWith('http') ? photo : (photo.startsWith('/uploads') ? photo : `/uploads/destinations/${photo}`)}
                            alt={`${tour.name} ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading={i < 4 ? 'eager' : 'lazy'}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 text-center">
                              Ảnh {i + 1} / {galleryImages.length}
                            </div>
                          </div>
                          {i === 7 && galleryImages.length > 8 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="text-white text-center">
                                <div className="text-3xl font-bold">+{galleryImages.length - 8}</div>
                                <div className="text-sm">ảnh khác</div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Important Information */}
              <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <DocumentTextIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">NHỮNG THÔNG TIN CẦN LƯU Ý</h2>
                    <p className="text-gray-600 mt-1">Thông tin chi tiết về tour và các điều khoản</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { 
                        id: 'includes', 
                        title: 'Giá tour bao gồm', 
                        icon: '✅',
                        iconBg: 'from-green-400 to-emerald-500',
                        content: '• Xe du lịch đời mới, máy lạnh suốt tuyến\n• Hướng dẫn viên chuyên nghiệp, nhiệt tình\n• Vé tham quan các điểm du lịch theo chương trình\n• Bữa ăn theo chương trình (ăn sáng, trưa, tối)\n• Nước uống trên xe (1 chai/người/ngày)\n• Bảo hiểm du lịch với mức bồi thường tối đa 100.000.000 VNĐ/người/vụ\n• Khách sạn tiêu chuẩn 2-3 sao (2 người/phòng)'
                      },
                      { 
                        id: 'excludes', 
                        title: 'Giá tour không bao gồm', 
                        icon: '❌',
                        iconBg: 'from-red-400 to-pink-500',
                        content: '• Chi phí cá nhân: điện thoại, giặt ủi, đồ uống trong phòng khách sạn\n• Thuế VAT (10%)\n• Phụ thu phòng đơn (nếu có)\n• Chi phí tham quan ngoài chương trình\n• Tiền tip cho hướng dẫn viên và tài xế (khuyến nghị: 20.000 - 50.000 VNĐ/người/ngày)\n• Chi phí phát sinh do thay đổi lịch trình vì lý do khách quan'
                      },
                      { 
                        id: 'children', 
                        title: 'Lưu ý giá trẻ em', 
                        icon: '👶',
                        iconBg: 'from-yellow-400 to-orange-500',
                        content: '• Trẻ em dưới 2 tuổi: Miễn phí (ngủ chung giường với bố mẹ, gia đình tự lo chi phí ăn uống)\n• Trẻ em từ 2 - dưới 5 tuổi: 30% giá tour (ngủ chung giường với bố mẹ)\n• Trẻ em từ 5 - dưới 11 tuổi: 70% giá tour (ngủ chung giường với bố mẹ)\n• Trẻ em từ 11 tuổi trở lên: 100% giá tour (ngủ riêng giường)\n• Trẻ em phải có giấy khai sinh hoặc hộ chiếu hợp lệ'
                      },
                      { 
                        id: 'payment', 
                        title: 'Điều kiện thanh toán', 
                        icon: '💳',
                        iconBg: 'from-blue-400 to-cyan-500',
                        content: '• Đặt cọc 30% giá trị tour khi đăng ký\n• Thanh toán số tiền còn lại trước ngày khởi hành ít nhất 7 ngày\n• Có thể thanh toán bằng tiền mặt, chuyển khoản hoặc thẻ tín dụng\n• Thanh toán trễ sẽ bị hủy tour và mất tiền cọc\n• Trong trường hợp tour được xác nhận gần ngày khởi hành, có thể yêu cầu thanh toán 100% ngay'
                      },
                      { 
                        id: 'registration', 
                        title: 'Điều kiện đăng ký', 
                        icon: '📝',
                        iconBg: 'from-purple-400 to-pink-500',
                        content: '• Khách hàng cần cung cấp đầy đủ thông tin: Họ tên, ngày sinh, số CMND/CCCD/Hộ chiếu, số điện thoại, email\n• Khách hàng phải có sức khỏe tốt, không mắc các bệnh truyền nhiễm\n• Trẻ em phải đi cùng người lớn (bố mẹ hoặc người giám hộ)\n• Khách hàng cần đọc kỹ và đồng ý với các điều khoản của tour\n• Đăng ký sớm để được ưu tiên chọn chỗ ngồi và phòng khách sạn'
                      },
                      { 
                        id: 'change-cancel', 
                        title: 'Lưu ý về chuyển hoặc hủy tour', 
                        icon: '🔄',
                        iconBg: 'from-indigo-400 to-blue-500',
                        content: '• Khách hàng có thể chuyển sang tour khác trước ngày khởi hành ít nhất 7 ngày (phụ thu nếu có)\n• Việc hủy tour phải được thông báo bằng văn bản hoặc email\n• Phí hủy tour sẽ được tính theo quy định hủy tour\n• Khách hàng tự chịu trách nhiệm về các chi phí phát sinh khi hủy tour\n• Trong trường hợp khẩn cấp, vui lòng liên hệ hotline để được hỗ trợ'
                      },
                      { 
                        id: 'cancel-weekday', 
                        title: 'Điều kiện hủy tour ngày thường', 
                        icon: '📆',
                        iconBg: 'from-teal-400 to-cyan-500',
                        content: '• Hủy trước 15 ngày: Hoàn lại 100% giá trị tour (trừ phí dịch vụ)\n• Hủy từ 10 - 14 ngày: Hoàn lại 70% giá trị tour\n• Hủy từ 7 - 9 ngày: Hoàn lại 50% giá trị tour\n• Hủy từ 4 - 6 ngày: Hoàn lại 30% giá trị tour\n• Hủy từ 1 - 3 ngày: Không hoàn lại tiền\n• Hủy trong ngày khởi hành: Không hoàn lại tiền'
                      },
                      { 
                        id: 'cancel-holiday', 
                        title: 'Điều kiện hủy tour ngày lễ, Tết', 
                        icon: '🎉',
                        iconBg: 'from-pink-400 to-rose-500',
                        content: '• Hủy trước 30 ngày: Hoàn lại 80% giá trị tour (trừ phí dịch vụ)\n• Hủy từ 20 - 29 ngày: Hoàn lại 50% giá trị tour\n• Hủy từ 15 - 19 ngày: Hoàn lại 30% giá trị tour\n• Hủy từ 10 - 14 ngày: Hoàn lại 20% giá trị tour\n• Hủy dưới 10 ngày: Không hoàn lại tiền\n• Tour Tết và các ngày lễ lớn có chính sách hủy riêng, vui lòng liên hệ để biết chi tiết'
                      },
                      { 
                        id: 'force-majeure', 
                        title: 'Trường hợp bất khả kháng', 
                        icon: '⚠️',
                        iconBg: 'from-amber-400 to-yellow-500',
                        content: '• Thiên tai, bão lũ, động đất, sóng thần\n• Dịch bệnh, đại dịch (theo quyết định của cơ quan chức năng)\n• Chiến tranh, bạo động, khủng bố\n• Thay đổi chính sách của chính phủ\n• Sự cố kỹ thuật nghiêm trọng của phương tiện vận chuyển\n• Trong các trường hợp này, công ty sẽ hoàn lại 100% tiền tour hoặc đề xuất phương án thay thế phù hợp'
                      },
                      { 
                        id: 'contact', 
                        title: 'Liên hệ', 
                        icon: '📞',
                        iconBg: 'from-violet-400 to-purple-500',
                        content: '• Hotline: 0868156027 (24/7)\n• Email: support@travelgo.com\n• Website: www.travelgo.com\n• Văn phòng: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh\n• Giờ làm việc: Thứ 2 - Chủ nhật: 8:00 - 20:00\n• Facebook: facebook.com/travelgo\n• Zalo: zalo.me/travelgo'
                      },
                    ].map((item) => (
                      <div 
                        key={item.id}
                        className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
                          expandedAccordion === item.id 
                            ? 'border-blue-300 shadow-lg shadow-blue-100/50' 
                            : 'border-gray-200'
                        }`}
                      >
                      <button
                          onClick={() => {
                            // Chỉ cho phép mở một accordion tại một thời điểm
                            // Nếu click vào accordion đang mở thì đóng, nếu click vào accordion khác thì mở accordion mới và đóng accordion cũ
                            setExpandedAccordion(expandedAccordion === item.id ? null : item.id);
                          }}
                          onMouseEnter={(e) => {
                            // Chỉ thêm hover effect cho accordion này
                            if (expandedAccordion !== item.id) {
                              e.currentTarget.closest('div')?.classList.add('border-gray-300', 'shadow-md');
                            }
                          }}
                          onMouseLeave={(e) => {
                            // Xóa hover effect khi rời chuột
                            if (expandedAccordion !== item.id) {
                              e.currentTarget.closest('div')?.classList.remove('border-gray-300', 'shadow-md');
                            }
                          }}
                          className={`w-full text-left px-5 py-4 transition-all duration-300 flex items-center justify-between ${
                            expandedAccordion === item.id 
                              ? `bg-gradient-to-r ${item.iconBg} text-white` 
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform ${
                              expandedAccordion === item.id 
                                ? 'bg-white/20 scale-110' 
                                : `bg-gradient-to-br ${item.iconBg} text-white shadow-md`
                            }`}>
                              {item.icon}
                        </div>
                            <span className={`font-semibold text-base ${
                              expandedAccordion === item.id ? 'text-white' : 'text-gray-900'
                            }`}>
                              {item.title}
                            </span>
                          </div>
                          <div className={`transition-transform duration-300 ${
                            expandedAccordion === item.id ? 'rotate-180' : ''
                          }`}>
                        {expandedAccordion === item.id ? (
                              <ChevronUpIcon className={`h-6 w-6 ${expandedAccordion === item.id ? 'text-white' : 'text-gray-600'}`} />
                        ) : (
                              <ChevronDownIcon className="h-6 w-6 text-gray-600" />
                        )}
                          </div>
                      </button>
                        <div className={`overflow-hidden transition-all duration-300 ${
                          expandedAccordion === item.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <div className={`px-5 py-4 bg-gradient-to-br from-gray-50 to-white border-t-2 ${
                            expandedAccordion === item.id ? `border-${item.iconBg.split('-')[1]}-200` : ''
                          }`}>
                            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line space-y-2">
                              {item.content.split('\n').map((line, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <span className="text-blue-600 font-bold mt-1">•</span>
                                  <span className="flex-1">{line.replace('• ', '')}</span>
                                </div>
                    ))}
                  </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right Column (Booking Card) - Sticky */}
            <div className="lg:col-span-1" ref={bookingRef}>
              <div className="sticky top-24 space-y-6">
                {/* Main Booking Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-blue-100 hover:border-blue-300 transition-colors">
                  <div className="mb-6">
                    {originalPrice && originalPrice > price ? (
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-blue-600">
                            {formatPrice(price)} ₫
                          </span>
                          <span className="text-gray-400 line-through text-xl">
                        {formatPrice(originalPrice)} ₫
                          </span>
                      </div>
                        <div className="inline-block bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                          🔥 Giảm {Math.round(((originalPrice - price) / originalPrice) * 100)}%
                        </div>
                      </div>
                    ) : (
                      <p className="text-4xl font-bold text-blue-600">
                        {formatPrice(price)} ₫
                      </p>
                    )}
                    <p className="text-gray-600 mt-2">Giá tính theo người</p>
                    </div>

                  <div className="space-y-4 mb-6">
                    {/* Date Picker */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                        Ngày khởi hành
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                  </div>

                    {/* Adults */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Người lớn</label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={adults}
                          onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                          className="flex-1 text-center px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold"
                        />
                        <button
                          onClick={() => setAdults(adults + 1)}
                          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Trẻ em (dưới 12 tuổi)</label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={children}
                          onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
                          className="flex-1 text-center px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold"
                        />
                        <button
                          onClick={() => setChildren(children + 1)}
                          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    {(adults > 0 || children > 0) && (
                      <div className="pt-4 border-t-2 border-gray-200 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Tạm tính</span>
                          <span className="font-semibold text-gray-900">{formatPrice(totalPrice)} ₫</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Phí dịch vụ (5%)</span>
                          <span className="font-semibold text-gray-900">{formatPrice(serviceFee)} ₫</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="text-gray-700 font-semibold">Tổng cộng</span>
                          <span className="text-3xl font-bold text-blue-600">{formatPrice(grandTotal)} ₫</span>
                      </div>
                    </div>
                  )}
                  </div>

                  {/* Trust Badges */}
                  <div className="space-y-3 pt-4 border-t-2 border-gray-100 mb-6">
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                      <ShieldCheckIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">Hủy miễn phí</p>
                        <p className="text-xs text-gray-600 mt-0.5">Hủy trước 24h để được hoàn tiền 100%</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <TicketIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">Đặt giữ chỗ - Thanh toán sau</p>
                        <p className="text-xs text-gray-600 mt-0.5">Giữ chỗ ngay, thanh toán khi đến nơi</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <LockClosedIcon className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">Thanh toán an toàn</p>
                        <p className="text-xs text-gray-600 mt-0.5">Bảo mật SSL, mã hóa dữ liệu</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={!selectedDate}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    💳 {selectedDate ? 'Đặt ngay' : 'Chọn ngày để đặt'}
                  </button>

                  {/* Social Proof */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <CheckBadgeIcon className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-900">2,147+</span>
                      <span>khách đã đặt tuần này</span>
                    </div>
                    </div>
                    </div>

                {/* Contact Buttons */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-xl p-6 border border-green-100">
                  <h3 className="font-bold text-gray-900 mb-4 text-center">Cần hỗ trợ?</h3>
                  <div className="space-y-3">
                    <a
                      href="tel:0868156027"
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                    >
                      <PhoneIcon className="w-5 h-5" />
                      Gọi: 0868156027
                    </a>
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg">
                      <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      Chat ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Tours */}
          {relatedTours.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🎒</span>
                <h2 className="text-2xl font-bold text-gray-900">CÁC CHƯƠNG TRÌNH KHÁC</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedTours.map((relatedTour) => {
                  const relatedImage = relatedTour.image || getDestinationImageUrl(relatedTour);
                  const relatedPrice = relatedTour.price || 0;
                  const relatedCode = `NDSGN${relatedTour.id?.toString().padStart(3, '0') || '000'}`;
                  
                  return (
                    <Link
                      key={relatedTour.id}
                      to={`/tours/${relatedTour.slug}`}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={relatedImage}
                          alt={relatedTour.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/400x300?text=Tour';
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setIsFavorite(!isFavorite);
                          }}
                          className="absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
                        >
                          {isFavorite ? (
                            <HeartIconSolid className="h-5 w-5 text-red-500" />
                          ) : (
                            <HeartIcon className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                        <div className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          Tiết kiệm
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors">
                          {relatedTour.name}
                        </h3>
                        <div className="text-xs text-gray-600 mb-2 space-y-1">
                          <p className="flex items-center gap-1.5">
                            <span>📍</span>
                            Khởi hành: <span className="text-blue-600 font-medium">TP. Hồ Chí Minh</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <span>🎫</span>
                            Mã: {relatedCode} • {relatedTour.duration || '6N5Đ'}
                          </p>
                        </div>
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-xs text-gray-600">Giá từ</span>
                          <span className="text-xl font-bold text-red-500">
                            {formatPrice(relatedPrice)}
                          </span>
                          <span className="text-sm text-red-500">₫</span>
                        </div>
                        <div className="text-blue-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          Xem chi tiết
                          <ChevronRightIcon className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </section>
        </div>

      {/* Gallery Lightbox */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>

          {/* Navigation */}
          <button
            onClick={() => setCurrentImageIndex((currentImageIndex - 1 + galleryImages.length) % galleryImages.length)}
            className="absolute left-4 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => setCurrentImageIndex((currentImageIndex + 1) % galleryImages.length)}
            className="absolute right-4 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <ChevronRightIcon className="w-6 h-6 text-white" />
          </button>

          {/* Image */}
          <img
            src={galleryImages[currentImageIndex]?.startsWith('http') ? galleryImages[currentImageIndex] : (galleryImages[currentImageIndex]?.startsWith('/uploads') ? galleryImages[currentImageIndex] : `/uploads/destinations/${galleryImages[currentImageIndex]}`)}
            alt={`Gallery ${currentImageIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.jpg';
            }}
          />

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-white">
            {currentImageIndex + 1} / {galleryImages.length}
      </div>
        </div>
      )}

      {/* Enhanced Mobile sticky CTA */}
      {tour && (
        <div className="fixed md:hidden bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-xl border-t-2 border-gray-200 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-4 mb-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                <span>Hủy miễn phí</span>
              </div>
              <div className="flex items-center gap-1">
                <LockClosedIcon className="w-4 h-4 text-blue-600" />
                <span>An toàn</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {tour.rating && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <StarIconSolid className="w-4 h-4" />
                      <span className="font-bold text-gray-900 text-sm">{tour.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {tour.reviewCount && (
                    <span className="text-xs text-gray-600">({tour.reviewCount})</span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  {originalPrice && originalPrice > price ? (
                    <>
                      <span className="text-lg font-bold text-blue-600">{formatPrice(price)} ₫</span>
                      <span className="text-xs text-gray-400 line-through">{formatPrice(originalPrice)} ₫</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-blue-600">{formatPrice(price)} ₫</span>
                  )}
                  <span className="text-xs text-gray-600">/người</span>
                </div>
              </div>
              <button
                onClick={scrollToBooking}
                className="flex-1 py-3.5 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg text-center active:scale-95"
              >
                Đặt ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
