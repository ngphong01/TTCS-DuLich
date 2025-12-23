import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getDestinationBySlug } from '../services/destination';
import { getHotelsPaged } from '../services/hotel';
import { getRestaurantsPaged } from '../services/restaurant';
import { getToursPaged } from '../services/tour';
import { getDestinationImageUrl } from '../utils/imageHelper';
import MapEmbed from '../components/MapEmbed';
import ReviewsSection from '../components/ReviewsSection';
import Skeleton from '../components/Skeleton';
import SEOHead from '../components/SEOHead';
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';
import {
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ClockIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
  CameraIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ShareIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  TicketIcon,
  LockClosedIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/outline';

export default function DestinationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const bookingRef = useRef<HTMLDivElement | null>(null);

  // Fetch destination data
  const { data: destination, isLoading, error: destinationError } = useQuery({
    queryKey: ['destination', slug, i18n.language],
    queryFn: () => getDestinationBySlug(slug!),
    enabled: !!slug,
    retry: 1,
  });

  // Fetch related data
  const { data: relatedToursData } = useQuery({
    queryKey: ['related-tours', destination?.id, i18n.language],
    queryFn: () => getToursPaged(1, 6, { destinationId: destination?.id ?? undefined }),
    enabled: !!destination?.id,
  });

  const { data: hotelsData } = useQuery({
    queryKey: ['destination-hotels', destination?.id, i18n.language],
    queryFn: () => getHotelsPaged(1, 6, { destinationId: destination?.id ?? undefined }),
    enabled: !!destination?.id,
  });

  const { data: restaurantsData } = useQuery({
    queryKey: ['destination-restaurants', destination?.id, i18n.language],
    queryFn: () => getRestaurantsPaged(1, 6, { destinationId: destination?.id ?? undefined }),
    enabled: !!destination?.id,
  });

  const relatedTours = relatedToursData?.items || [];
  const hotels = hotelsData?.items || [];
  const restaurants = restaurantsData?.items || [];

  // Scroll detection for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset accordion when destination changes
  useEffect(() => {
    setExpandedAccordion(null);
  }, [slug]);

  // Get images
  const images = useMemo(() => {
    if (!destination) return [];
    const allImages: string[] = [];
    if (destination.image) {
      const imageUrl = getDestinationImageUrl(destination);
      if (imageUrl) allImages.push(imageUrl);
    }
    return allImages.length > 0 ? allImages : ['/placeholder.jpg'];
  }, [destination]);

  // Gallery images
  const galleryImages = useMemo(() => {
    return images.filter(Boolean);
  }, [images]);

  // Note: Rating will be calculated by ReviewsSection component

  // Format price
  const formatPrice = (price?: number | null) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: destination?.name,
        text: destination?.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link đã được sao chép!');
    }
  };

  // Reset selectedImageIndex if it's out of bounds
  useEffect(() => {
    if (images.length > 0 && selectedImageIndex >= images.length) {
      setSelectedImageIndex(0);
    }
  }, [images.length, selectedImageIndex]);

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

  if (destinationError) {
    console.error('Error loading destination:', destinationError);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lỗi khi tải điểm đến</h2>
          <p className="text-gray-600 mb-4">
            {destinationError instanceof Error ? destinationError.message : 'Đã xảy ra lỗi không xác định'}
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

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy điểm đến</h2>
          <p className="text-gray-600 mb-4">Điểm đến với slug "{slug}" không tồn tại.</p>
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

  const mainImage = images[selectedImageIndex] || images[0] || getDestinationImageUrl(destination) || '/placeholder.jpg';
  const finalMainImage = mainImage.startsWith('http') ? mainImage : `${window.location.origin}${mainImage}`;
  const price = destination.price || 0;

  return (
    <>
      <SEOHead
        title={destination.name}
        description={destination.description || ''}
        image={finalMainImage}
        type="website"
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
                    <h1 className="font-bold text-gray-900 line-clamp-1">{destination.name}</h1>
                    <div className="flex items-center gap-2 text-sm">
                      {destination.rating && (
                        <div className="flex items-center gap-1">
                          <StarIconSolid className="w-4 h-4 text-yellow-400" />
                          <span className="font-semibold">{destination.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {destination.country && (
                        <span className="text-gray-600">• {destination.country}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {price > 0 && (
                    <span className="text-2xl font-bold text-blue-600">{formatPrice(price)} ₫</span>
                  )}
                  <button 
                    onClick={scrollToBooking}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    Xem tour
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
              src={finalMainImage}
              alt={destination.name}
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
              {destination.featured && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-semibold border border-white/20">
                    ⭐ Nổi bật
                  </span>
                  {destination.country && (
                    <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-semibold border border-white/20">
                      📍 {destination.country}
                    </span>
                  )}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-2xl">
                {destination.name}
              </h1>

              {/* Info Cards */}
              <div className="flex flex-wrap gap-4 mb-6">
                {destination.country && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
                    <div className="flex items-center gap-2">
                      <GlobeAltIcon className="w-6 h-6 text-white" />
                      <span className="text-lg font-semibold text-white">{destination.country}</span>
                    </div>
                  </div>
                )}
                {price > 0 && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💰</span>
                      <span className="text-lg font-semibold text-white">Từ {formatPrice(price)} ₫</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Short Description */}
              {destination.description && (
                <p className="text-white/90 text-xl max-w-4xl leading-relaxed backdrop-blur-sm">
                  {destination.description.substring(0, 200)}...
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
              {destination.description && (
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Giới thiệu</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                    {destination.description}
                  </p>
                </div>
              )}

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Thư viện ảnh</h2>
                      <p className="text-gray-600 mt-1">Khám phá điểm đến qua những khoảnh khắc đẹp nhất</p>
                    </div>
                    {galleryImages.length > 8 && (
                      <button
                        onClick={() => {
                          setCurrentImageIndex(0);
                          setShowGallery(true);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                      >
                        Xem tất cả ({galleryImages.length})
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {galleryImages.slice(0, 8).map((photo: string, i: number) => {
                      const isLarge = i === 0;
                      const photoUrl = photo.startsWith('http') ? photo : `${window.location.origin}${photo}`;
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
                            src={photoUrl}
                            alt={`${destination.name} ${i + 1}`}
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

              {/* Map */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <MapPinIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Bản đồ</h2>
                </div>
                <MapEmbed query={`${destination.name}${destination.country ? `, ${destination.country}` : ''}`} />
              </div>

              {/* Important Information */}
              <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <DocumentTextIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">THÔNG TIN HỮU ÍCH</h2>
                    <p className="text-gray-600 mt-1">Thông tin chi tiết về điểm đến</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      id: 'best-time', 
                      title: 'Thời điểm tốt nhất để tham quan', 
                      icon: '📅',
                      iconBg: 'from-blue-400 to-cyan-500',
                      content: '• Mùa khô (tháng 11 - tháng 4): Thời tiết mát mẻ, ít mưa, lý tưởng cho du lịch\n• Mùa mưa (tháng 5 - tháng 10): Giá tour rẻ hơn, cảnh quan xanh tươi\n• Nên tránh các ngày lễ lớn nếu muốn tránh đông đúc\n• Đặt tour sớm để có giá tốt nhất'
                    },
                    { 
                      id: 'weather', 
                      title: 'Thời tiết và khí hậu', 
                      icon: '☀️',
                      iconBg: 'from-yellow-400 to-orange-500',
                      content: '• Khí hậu nhiệt đới gió mùa\n• Nhiệt độ trung bình: 25-30°C\n• Độ ẩm cao vào mùa mưa\n• Nên mang theo áo khoác nhẹ và ô dù\n• Chuẩn bị kem chống nắng và mũ nón'
                    },
                    { 
                      id: 'transport', 
                      title: 'Phương tiện di chuyển', 
                      icon: '🚗',
                      iconBg: 'from-green-400 to-emerald-500',
                      content: '• Xe du lịch đời mới, máy lạnh\n• Máy bay nội địa (nếu cần)\n• Tàu thuyền (nếu có tour biển đảo)\n• Xe đạp, xe máy cho khách tự do\n• Taxi và Grab có sẵn tại điểm đến'
                    },
                    { 
                      id: 'accommodation', 
                      title: 'Chỗ ở', 
                      icon: '🏨',
                      iconBg: 'from-purple-400 to-pink-500',
                      content: '• Khách sạn 2-5 sao tùy theo tour\n• Resort ven biển (nếu có)\n• Homestay và nhà nghỉ giá rẻ\n• Phòng đơn có phụ thu\n• Đặt sớm để chọn phòng đẹp'
                    },
                    { 
                      id: 'food', 
                      title: 'Ẩm thực', 
                      icon: '🍜',
                      iconBg: 'from-red-400 to-pink-500',
                      content: '• Đặc sản địa phương đa dạng\n• Hải sản tươi sống\n• Đồ ăn đường phố giá rẻ\n• Nhà hàng sang trọng\n• Phù hợp với mọi khẩu vị'
                    },
                    { 
                      id: 'tips', 
                      title: 'Mẹo du lịch', 
                      icon: '💡',
                      iconBg: 'from-indigo-400 to-blue-500',
                      content: '• Mang theo tiền mặt và thẻ tín dụng\n• Đổi tiền tại ngân hàng hoặc địa điểm uy tín\n• Tôn trọng văn hóa địa phương\n• Giữ gìn vệ sinh môi trường\n• Mua bảo hiểm du lịch'
                    },
                    { 
                      id: 'contact', 
                      title: 'Liên hệ', 
                      icon: '📞',
                      iconBg: 'from-violet-400 to-purple-500',
                      content: '• Hotline: 0868156027 (24/7)\n• Email: support@travelgo.com\n• Website: www.travelgo.com\n• Văn phòng: 6/160 Tân Triều, Thanh Trì, Hà Nội\n• Giờ làm việc: Thứ 2 - Chủ nhật: 8:00 - 20:00'
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
                          setExpandedAccordion(expandedAccordion === item.id ? null : item.id);
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

              {/* Reviews */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <ReviewsSection slug={destination.slug} />
              </div>
            </div>

            {/* Right Column (Booking Card) - Sticky */}
            <div className="lg:col-span-1" ref={bookingRef}>
              <div className="sticky top-24 space-y-6">
                {/* Main Info Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-blue-100 hover:border-blue-300 transition-colors">
                  <div className="mb-6">
                    {price > 0 ? (
                      <p className="text-4xl font-bold text-blue-600">
                        {formatPrice(price)} ₫
                      </p>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">
                        Liên hệ để biết giá
                      </p>
                    )}
                    <p className="text-gray-600 mt-2">Giá tham khảo</p>
                  </div>

                  {/* Trust Badges */}
                  <div className="space-y-3 pt-4 border-t-2 border-gray-100 mb-6">
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                      <ShieldCheckIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">Đảm bảo chất lượng</p>
                        <p className="text-xs text-gray-600 mt-0.5">Tour được kiểm định chất lượng</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <TicketIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">Hỗ trợ 24/7</p>
                        <p className="text-xs text-gray-600 mt-0.5">Luôn sẵn sàng hỗ trợ bạn</p>
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
                    onClick={() => navigate(`/destinations?destination=${destination.name}&view=tours`)}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🎫 Xem các tour tại đây
                  </button>

                  {/* Social Proof */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <CheckBadgeIcon className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-900">{relatedTours.length}+</span>
                      <span>tour có sẵn</span>
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
                <h2 className="text-2xl font-bold text-gray-900">TOUR TẠI {destination.name.toUpperCase()}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedTours.map((tour) => {
                  const tourImage = tour.image || getDestinationImageUrl(tour);
                  const tourPrice = tour.price || 0;
                  const tourCode = `NDSGN${tour.id?.toString().padStart(3, '0') || '000'}`;
                  
                  return (
                    <Link
                      key={tour.id}
                      to={`/tours/${tour.slug}`}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={tourImage}
                          alt={tour.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/400x300?text=Tour';
                          }}
                        />
                        {tourPrice < 5000000 && (
                          <div className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            Tiết kiệm
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors">
                          {tour.name}
                        </h3>
                        <div className="text-xs text-gray-600 mb-2 space-y-1">
                          <p className="flex items-center gap-1.5">
                            <span>🎫</span>
                            Mã: {tourCode} • {tour.duration || '6N5Đ'}
                          </p>
                        </div>
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-xs text-gray-600">Giá từ</span>
                          <span className="text-xl font-bold text-red-500">
                            {formatPrice(tourPrice)}
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

          {/* Related Hotels */}
          {hotels.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">KHÁCH SẠN TẠI {destination.name.toUpperCase()}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hotels.map((hotel: any) => (
                  <Link
                    key={hotel.id}
                    to={`/hotels/${hotel.slug}`}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={hotel.image || '/placeholder-hotel.jpg'}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-hotel.jpg';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {hotel.name}
                      </h3>
                      {hotel.price && (
                        <div className="text-lg font-bold text-blue-600">
                          {formatPrice(hotel.price)} ₫
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Restaurants */}
          {restaurants.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <BuildingStorefrontIcon className="w-8 h-8 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">NHÀ HÀNG TẠI {destination.name.toUpperCase()}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {restaurants.map((restaurant: any) => (
                  <Link
                    key={restaurant.id}
                    to={`/restaurants/${restaurant.slug}`}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={restaurant.image || '/placeholder-restaurant.jpg'}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-restaurant.jpg';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {restaurant.name}
                      </h3>
                      {restaurant.price && (
                        <div className="text-lg font-bold text-blue-600">
                          {formatPrice(restaurant.price)} ₫
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
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
            src={galleryImages[currentImageIndex]?.startsWith('http') ? galleryImages[currentImageIndex] : `${window.location.origin}${galleryImages[currentImageIndex]}`}
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
    </>
  );
}
