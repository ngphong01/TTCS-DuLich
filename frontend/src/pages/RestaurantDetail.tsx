import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRestaurantBySlug } from '../services/restaurant';
import Skeleton from '../components/Skeleton';
import SEOHead from '../components/SEOHead';
import {
  MapPinIcon,
  StarIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  GlobeAltIcon,
  ClockIcon,
  UserGroupIcon,
  HeartIcon,
  ShareIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';
import { useState } from 'react';

export default function RestaurantDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: () => getRestaurantBySlug(slug!),
    enabled: !!slug,
  });

  const handleReservation = () => {
    if (!reservationDate || !reservationTime) {
      alert('Vui lòng chọn ngày và giờ đặt bàn');
      return;
    }
    navigate(`/checkout?type=restaurant&id=${restaurant?.id}&date=${reservationDate}&time=${reservationTime}&partySize=${partySize}`);
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

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nhà hàng không tồn tại</h2>
          <Link to="/restaurants" className="text-blue-600 hover:underline">
            ← Quay lại danh sách nhà hàng
          </Link>
        </div>
      </div>
    );
  }

  // Parse amenities & opening hours
  const amenitiesList = Array.isArray(restaurant.amenities) ? restaurant.amenities : [];
  const openingHours = restaurant.openingHours && typeof restaurant.openingHours === 'object' 
    ? restaurant.openingHours 
    : { mon: '9:00 AM - 10:00 PM', tue: '9:00 AM - 10:00 PM', wed: '9:00 AM - 10:00 PM', thu: '9:00 AM - 10:00 PM', fri: '9:00 AM - 11:00 PM', sat: '9:00 AM - 11:00 PM', sun: '9:00 AM - 10:00 PM' };

  return (
    <>
      <SEOHead
        title={`${restaurant.name} - TravelGo`}
        description={restaurant.description || `Đặt bàn tại ${restaurant.name}`}
        url={`/restaurants/${restaurant.slug}`}
        image={restaurant.image || undefined}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Image */}
        <div className="relative">
          <div className="h-80 md:h-96 bg-gray-200 overflow-hidden">
            {restaurant.image ? (
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500">
                <BuildingStorefrontIcon className="h-32 w-32 text-white/30" />
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Restaurant Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Restaurant Header Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                      {restaurant.name}
                    </h1>
                    
                    {/* Rating & Cuisine */}
                    <div className="flex flex-wrap items-center gap-4 text-gray-600">
                      {restaurant.rating && (
                        <div className="flex items-center gap-1">
                          <StarIconSolid className="h-5 w-5 text-yellow-400" />
                          <span className="font-semibold text-gray-900">{restaurant.rating.toFixed(1)}</span>
                          <span className="text-sm">(256 reviews)</span>
                        </div>
                      )}
                      
                      {restaurant.cuisine && (
                        <div className="flex items-center gap-1">
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                            {restaurant.cuisine}
                          </span>
                        </div>
                      )}

                      {restaurant.priceRange && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-700 font-semibold">{restaurant.priceRange}</span>
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    {restaurant.address && (
                      <div className="flex items-center gap-2 text-gray-600 mt-3">
                        <MapPinIcon className="h-5 w-5" />
                        <span className="text-sm">{restaurant.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Favorite & Share Buttons */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      {isFavorite ? (
                        <HeartIconSolid className="h-6 w-6 text-red-500" />
                      ) : (
                        <HeartIcon className="h-6 w-6 text-gray-600" />
                      )}
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <ShareIcon className="h-6 w-6 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* About & Description */}
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">About</h2>
                <p className="text-gray-700 leading-relaxed">
                  {restaurant.description || 'Trải nghiệm ẩm thực tuyệt vời với các món ăn đặc sắc được chế biến từ nguyên liệu tươi ngon. Không gian ấm cúng, phục vụ chu đáo, đảm bảo mang đến cho bạn những trải nghiệm đáng nhớ.'}
                </p>
              </div>

              {/* Amenities */}
              {amenitiesList.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenitiesList.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckIcon className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Opening Hours */}
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ClockIcon className="h-6 w-6" />
                  Opening Hours
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(openingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-gray-700">
                      <span className="font-medium capitalize">{day}:</span>
                      <span>{hours as string}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <div className="space-y-4">
                  {restaurant.contact && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <PhoneIcon className="h-5 w-5 text-gray-500" />
                      <a href={`tel:${restaurant.contact}`} className="hover:text-blue-600">
                        {restaurant.contact}
                      </a>
                    </div>
                  )}
                  {restaurant.website && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <GlobeAltIcon className="h-5 w-5 text-gray-500" />
                      <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {restaurant.website}
                      </a>
                    </div>
                  )}
                  {restaurant.address && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPinIcon className="h-5 w-5 text-gray-500" />
                      <span>{restaurant.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sticky Reservation Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl shadow-xl p-6 border border-orange-100">
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Make a Reservation</h3>
                  {restaurant.rating && (
                    <div className="flex items-center gap-2">
                      <StarIconSolid className="h-5 w-5 text-yellow-400" />
                      <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
                      <span className="text-gray-600 text-sm">(256 reviews)</span>
                    </div>
                  )}
                </div>

                {/* Reservation Form */}
                <div className="space-y-4 mb-6">
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={reservationDate}
                      onChange={(e) => setReservationDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <select
                      value={reservationTime}
                      onChange={(e) => setReservationTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    >
                      <option value="">Select time</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="11:30">11:30 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="12:30">12:30 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="13:30">1:30 PM</option>
                      <option value="18:00">6:00 PM</option>
                      <option value="18:30">6:30 PM</option>
                      <option value="19:00">7:00 PM</option>
                      <option value="19:30">7:30 PM</option>
                      <option value="20:00">8:00 PM</option>
                      <option value="20:30">8:30 PM</option>
                      <option value="21:00">9:00 PM</option>
                    </select>
                  </div>

                  {/* Party Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party Size
                    </label>
                    <div className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2">
                      <span className="text-gray-700">{partySize} people</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setPartySize(Math.max(1, partySize - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 hover:border-orange-500 flex items-center justify-center text-gray-600 hover:text-orange-600 transition-colors"
                        >
                          -
                        </button>
                        <button
                          onClick={() => setPartySize(partySize + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 hover:border-orange-500 flex items-center justify-center text-gray-600 hover:text-orange-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reserve Button */}
                <button
                  onClick={handleReservation}
                  disabled={!reservationDate || !reservationTime}
                  className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-orange-600 disabled:hover:to-red-600 flex items-center justify-center gap-2"
                >
                  <CheckIcon className="h-5 w-5" />
                  Reserve Table
                </button>

                {/* Info */}
                <div className="mt-4 text-center text-sm text-gray-600">
                  <p>You won't be charged yet</p>
                </div>

                {/* Report Link */}
                <div className="mt-4 text-center">
                  <button className="text-sm text-gray-600 hover:text-gray-900 underline flex items-center gap-1 mx-auto">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    Report this restaurant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16 mt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Get the Latest Travel Tips and Deals</h2>
            <p className="text-gray-300 mb-8">
              Stay updated with the latest travel tips, blog posts, and exclusive deals. Subscribe to our newsletter and never miss an update.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email Here"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="px-8 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors whitespace-nowrap">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
