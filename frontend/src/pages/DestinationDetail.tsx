import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getDestinationBySlug, getDestinations } from '../services/destination';
import { getDestinationReviews } from '../services/review';
import { getCategories } from '../services/category';
import { getHotelsPaged } from '../services/hotel';
import { getRestaurantsPaged } from '../services/restaurant';
import { getToursPaged } from '../services/tour';
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
} from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/outline';
import Skeleton from '../components/Skeleton';
import SEOHead from '../components/SEOHead';

export default function DestinationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch destination data
  const { data: destination, isLoading } = useQuery({
    queryKey: ['destination', slug, i18n.language],
    queryFn: () => getDestinationBySlug(slug!),
    enabled: !!slug,
  });

  // Fetch related data
  const { data: relatedToursData } = useQuery({
    queryKey: ['related-tours', destination?.id, i18n.language],
    queryFn: () => getToursPaged(1, 3, { destinationId: destination?.id ?? undefined }),
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

  // Get images
  const images = useMemo(() => {
    if (!destination) return [];
    const allImages: string[] = [];
    if (destination.image) allImages.push(getDestinationImageUrl(destination));
    return allImages.length > 0 ? allImages : ['/placeholder.jpg'];
  }, [destination]);

  // Format price
  const formatPrice = (price?: number | null) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Skeleton className="h-96 w-full" />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy điểm đến</h2>
          <Link to="/destinations" className="text-blue-600 hover:underline">
            ← Xem tất cả điểm đến
          </Link>
        </div>
      </div>
    );
  }

  const mainImage = images[selectedImageIndex] || images[0] || getDestinationImageUrl(destination) || '/placeholder.jpg';
  const price = destination.price;

  return (
    <>
      <SEOHead
        title={destination.name}
        description={destination.description || ''}
        image={mainImage}
        type="website"
      />

      <div className="min-h-screen bg-white">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <button
            onClick={() => navigate('/destinations')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="font-medium">Quay lại danh sách điểm đến</span>
          </button>
        </div>

        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[600px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={mainImage}
              alt={destination.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/60" />
          </div>

          {/* Destination Info Overlay - Bottom Left */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <div className="max-w-7xl mx-auto px-4 pb-8">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg p-6 max-w-2xl">
                {/* Destination Title */}
                <h1 className="text-4xl font-bold text-white mb-4">{destination.name}</h1>

                {/* Destination Details */}
                <div className="flex flex-wrap items-center gap-6 text-white mb-4">
                  {destination.country && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5" />
                      <span>{destination.country}</span>
                    </div>
                  )}
                  {price && (
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💰</span>
                      <span className="font-semibold">{formatPrice(price)}</span>
                    </div>
                  )}
                </div>

                {/* Short Description */}
                <p className="text-white/90 text-lg">
                  {destination.description?.substring(0, 150) || 'Khám phá điểm đến tuyệt vời này với nhiều hoạt động thú vị và trải nghiệm độc đáo.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Introduction Section */}
          <div className="bg-white rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📝</span>
              <h2 className="text-2xl font-bold text-gray-900">Giới thiệu</h2>
            </div>
            <div className="text-gray-700 leading-relaxed">
              {destination.description || 'Khám phá điểm đến tuyệt vời này với nhiều hoạt động thú vị và trải nghiệm độc đáo.'}
            </div>
          </div>

          {/* Related Tours */}
          {relatedTours.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tours tại {destination.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedTours.map((tour) => (
                  <Link
                    key={tour.id}
                    to={`/tours/${tour.slug}`}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={tour.image || getDestinationImageUrl(tour)}
                        alt={tour.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-tour.jpg';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {tour.name}
                      </h3>
                      <div className="text-sm text-gray-600 mb-2">
                        {tour.duration && <span>{tour.duration}</span>}
                      </div>
                      {tour.price && (
                        <div className="text-lg font-bold text-blue-600">
                          {formatPrice(tour.price)}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Hotels */}
          {hotels.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Khách sạn tại {destination.name}</h2>
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
                          {formatPrice(hotel.price)}
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
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Nhà hàng tại {destination.name}</h2>
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
                          {formatPrice(restaurant.price)}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
