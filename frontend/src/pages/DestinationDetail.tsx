import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDestinationBySlug } from '../services/destination';
import { getDestinationReviews } from '../services/review';
import { getCategories } from '../services/category';
import { getDestinationImageUrl } from '../utils/imageHelper';
import MapEmbed from '../components/MapEmbed';
import ReviewsSection from '../components/ReviewsSection';
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
} from '@heroicons/react/24/outline';

export default function DestinationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [guests, setGuests] = useState(2);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Fetch destination
  const { data: destination, isLoading } = useQuery({
    queryKey: ['destination', slug],
    queryFn: () => getDestinationBySlug(slug!),
    enabled: !!slug,
  });

  // Fetch reviews
  const { data: reviews } = useQuery({
    queryKey: ['reviews', destination?.id],
    queryFn: () => getDestinationReviews(destination!.id),
    enabled: !!destination?.id,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Get category name
  const category = categories?.find((cat: any) => cat.id === destination?.categoryId);

  // Calculate average rating
  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 4.5;

  // Get image URL
  const imageUrl = destination ? getDestinationImageUrl(destination) : '';
  const finalImageUrl = imageUrl && !imageUrl.startsWith('http')
    ? `http://localhost:3000${imageUrl}`
    : imageUrl;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      destination: slug || '',
      guests: guests.toString(),
      ...(fromDate && { from: fromDate }),
      ...(toDate && { to: toDate }),
    });
    navigate(`/checkout?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Đang tải thông tin điểm đến...</div>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPinIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Không tìm thấy điểm đến</h2>
          <p className="text-gray-600 mb-8">Điểm đến bạn đang tìm có thể đã bị xóa hoặc không tồn tại.</p>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Quay lại danh sách điểm đến
          </Link>
        </div>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": destination.name,
    "image": finalImageUrl ? [finalImageUrl] : [],
    "description": destination.description,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": destination.country || "Việt Nam"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": avgRating,
      "bestRating": 5,
      "ratingCount": reviews?.length || 0
    },
    "offers": {
      "@type": "Offer",
      "price": destination.price || 0,
      "priceCurrency": "VND",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          to="/destinations"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full hover:bg-gray-50 transition-all shadow-lg text-gray-900 font-semibold border border-gray-200"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Quay lại
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              {finalImageUrl ? (
                <img
                  src={finalImageUrl}
                  alt={destination.name}
                  className="w-full h-[500px] object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-[500px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <CameraIcon className="h-32 w-32 text-white/30" />
          </div>
              )}
              
              {/* Title Section below image */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  {destination.featured && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg">
                      <SparklesIcon className="h-4 w-4" />
                      Nổi bật
                    </span>
                  )}
                  {category && (
                    <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {category.name}
                    </span>
                  )}
                  <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold flex items-center gap-1.5">
                    <MapPinIcon className="h-4 w-4" />
                    {destination.country || 'Việt Nam'}
                  </span>
                  <div className="flex items-center gap-2 bg-yellow-50 px-4 py-1.5 rounded-full">
                <StarIconSolid className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                    <span className="text-gray-600 text-sm">
                      ({reviews?.length || 0} đánh giá)
                    </span>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                  {destination.name}
                </h1>

                {destination.price && destination.price > 0 && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-600 text-sm">Từ</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {new Intl.NumberFormat('vi-VN').format(destination.price)}
              </span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent underline">đ</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Details Sections */}
            <div className="space-y-8">
              {/* Description Section */}
              <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <GlobeAltIcon className="h-8 w-8 text-blue-600" />
                  Giới thiệu
                </h2>
              {destination.description ? (
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                    {destination.description}
                  </p>
                  {!destination.description.includes('\n') && (
                    <div className="mt-6 space-y-4">
                      <p className="text-gray-700 leading-relaxed">
                        Khám phá {destination.name} - một điểm đến tuyệt vời với những trải nghiệm độc đáo và đáng nhớ. 
                        Nơi đây mang đến cho bạn cơ hội khám phá văn hóa địa phương, thưởng thức ẩm thực đặc sắc và tận hưởng không gian nghỉ dưỡng tuyệt vời.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        Với {avgRating.toFixed(1)}/5 sao từ {reviews?.length || 0} đánh giá, đây chắc chắn là một lựa chọn hoàn hảo cho chuyến du lịch của bạn.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed text-lg">
                  Khám phá {destination.name} - một điểm đến tuyệt vời với những trải nghiệm độc đáo và đáng nhớ. 
                  Nơi đây mang đến cho bạn cơ hội khám phá văn hóa địa phương, thưởng thức ẩm thực đặc sắc và tận hưởng không gian nghỉ dưỡng tuyệt vời.
                </p>
              )}
            </section>

              {/* Highlights Section */}
              <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Điểm nổi bật</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">An toàn & Bảo đảm</h3>
                    <p className="text-gray-600 text-sm">Hủy miễn phí trong 24h, thanh toán an toàn</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Hỗ trợ 24/7</h3>
                    <p className="text-gray-600 text-sm">Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <StarIconSolid className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Đánh giá cao</h3>
                    <p className="text-gray-600 text-sm">{avgRating.toFixed(1)}/5 sao từ {reviews?.length || 0} đánh giá</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <SparklesIcon className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Trải nghiệm độc đáo</h3>
                    <p className="text-gray-600 text-sm">Nhiều hoạt động và dịch vụ đặc biệt</p>
                  </div>
                </div>
              </div>
            </section>

              {/* Map Section */}
              <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <MapPinIcon className="h-8 w-8 text-blue-600" />
                  Vị trí
                </h2>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <MapEmbed query={`${destination.name}, ${destination.country || 'Việt Nam'}`} className="w-full h-96" />
                </div>
              </section>

              {/* Reviews Section */}
              <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Đánh giá từ khách hàng</h2>
                <ReviewsSection slug={destination.slug} />
              </section>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Đặt chỗ ngay</h2>
                
                <form onSubmit={handleCheckout} className="space-y-6">
                  {/* Price Display */}
                  {destination.price && destination.price > 0 && (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                      <div className="text-sm text-gray-600 mb-1">Giá từ</div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(destination.price)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">cho mỗi người</div>
        </div>
                  )}

                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <UserGroupIcon className="h-5 w-5 text-gray-500" />
                      Số lượng khách
                    </label>
            <input 
              type="number" 
              min={1} 
                      max={20}
              value={guests}
                      onChange={(e) => setGuests(Math.max(1, Math.min(20, Number(e.target.value))))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
                    />
                  </div>

                  {/* From Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-gray-500" />
                      Ngày đi
                    </label>
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
                    />
                  </div>

                  {/* To Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-gray-500" />
                      Ngày về
                    </label>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
                      min={fromDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Tiếp tục đặt chỗ
            </button>
          </form>

                {/* Info Box */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Thông tin đặt chỗ</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <ShieldCheckIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Hủy miễn phí trong 24h</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ShieldCheckIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Thanh toán an toàn, bảo mật</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ShieldCheckIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Xác nhận ngay lập tức</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ShieldCheckIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Hỗ trợ khách hàng 24/7</span>
                    </li>
            </ul>
                </div>
              </div>
            </div>
          </div>
      </div>
      </div>
    </div>
  );
}
