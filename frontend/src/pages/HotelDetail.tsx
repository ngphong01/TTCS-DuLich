import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getHotelBySlug } from '../services/hotel';
import Skeleton from '../components/Skeleton';
import SEOHead from '../components/SEOHead';
import {
  MapPinIcon,
  StarIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  HeartIcon,
  ShareIcon,
  CheckIcon,
  WifiIcon,
  TvIcon,
  FireIcon,
  HomeIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';
import { useState } from 'react';

export default function HotelDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel', slug],
    queryFn: () => getHotelBySlug(slug!),
    enabled: !!slug,
  });

  const formatPrice = (price?: number) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  // Calculate total nights and price
  const calculateTotal = () => {
    if (!checkIn || !checkOut || !hotel?.pricePerNight) return 0;
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * hotel.pricePerNight : 0;
  };

  const totalNights = checkIn && checkOut 
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const totalPrice = calculateTotal();
  const serviceFee = totalPrice * 0.1;
  const grandTotal = totalPrice + serviceFee;

  const handleReserve = () => {
    if (!checkIn || !checkOut) {
      alert('Vui lòng chọn ngày check-in và check-out');
      return;
    }
    navigate(`/checkout?type=hotel&id=${hotel?.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
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

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Khách sạn không tồn tại</h2>
          <Link to="/hotels" className="text-blue-600 hover:underline">
            ← Quay lại danh sách khách sạn
          </Link>
        </div>
      </div>
    );
  }

  // Parse amenities
  const amenitiesList = Array.isArray(hotel.amenities) ? hotel.amenities : [];
  
  // Amenity icons mapping
  const amenityIcons: { [key: string]: any } = {
    'wifi': WifiIcon,
    'tv': TvIcon,
    'spa': FireIcon,
    'pool': HomeIcon,
    'restaurant': BuildingOfficeIcon,
    'parking': BuildingOfficeIcon,
  };

  return (
    <>
      <SEOHead
        title={`${hotel.name} - TravelGo`}
        description={hotel.description || `Đặt phòng tại ${hotel.name}`}
        url={`/hotels/${hotel.slug}`}
        image={hotel.image || undefined}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Image */}
        <div className="relative">
          <div className="h-80 md:h-96 bg-gray-200 overflow-hidden">
            {hotel.image ? (
              <img
                src={hotel.image}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                <BuildingOfficeIcon className="h-32 w-32 text-white/30" />
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Hotel Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hotel Header Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                      {hotel.name}
                    </h1>
                    
                    {/* Rating & Location */}
                    <div className="flex flex-wrap items-center gap-4 text-gray-600">
                      {hotel.rating && (
                        <div className="flex items-center gap-1">
                          <StarIconSolid className="h-5 w-5 text-yellow-400" />
                          <span className="font-semibold text-gray-900">{hotel.rating.toFixed(1)}</span>
                          <span className="text-sm">(256 reviews)</span>
                        </div>
                      )}
                      
                      {hotel.address && (
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="h-5 w-5" />
                          <span className="text-sm">{hotel.address}</span>
                        </div>
                      )}
                    </div>
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

                {/* Guests Info */}
                <div className="flex flex-wrap items-center gap-4 text-gray-700 pt-4 border-t">
                  <div className="flex items-center gap-1.5">
                    <UserGroupIcon className="h-5 w-5" />
                    <span className="font-medium">{guests} guests</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HomeIcon className="h-5 w-5" />
                    <span className="font-medium">1 bedroom</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BuildingOfficeIcon className="h-5 w-5" />
                    <span className="font-medium">1 private bath</span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenitiesList.length > 0 ? (
                    amenitiesList.map((amenity, index) => {
                      const IconComponent = amenityIcons[amenity.toLowerCase()] || CheckIcon;
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                          <span className="text-gray-700">{amenity}</span>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <HomeIcon className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">Rooms and Suites</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">Dining</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FireIcon className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">Spa and Wellness</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <WifiIcon className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">Pool and Recreation</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">Business and Events</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Unique Features */}
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Unique Features</h2>
                <ul className="space-y-3 text-gray-700">
                  {hotel.description ? (
                    <li className="leading-relaxed">{hotel.description}</li>
                  ) : (
                    <>
                      <li>• Known as the "Pink Palace," the hotel has been an icon of glamour and luxury since its opening in 1912</li>
                      <li>• Frequented by celebrities, dignitaries, and discerning travelers from around the world</li>
                      <li>• Historic bungalows offer a private retreat with a rich history, having hosted numerous famous guests over the years</li>
                      <li>• The hotel's design combines classic Hollywood elegance with modern comforts, maintaining a timeless charm</li>
                      <li>• Some rooms offer private balconies or patios with garden or city views</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <div className="space-y-4">
                  {hotel.contact && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <PhoneIcon className="h-5 w-5 text-gray-500" />
                      <span>{hotel.contact}</span>
                    </div>
                  )}
                  {hotel.website && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <GlobeAltIcon className="h-5 w-5 text-gray-500" />
                      <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {hotel.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sticky Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(hotel.pricePerNight)}
                    </span>
                    <span className="text-gray-600">per night</span>
                  </div>
                  {hotel.rating && (
                    <div className="flex items-center gap-2 mt-2">
                      <StarIconSolid className="h-5 w-5 text-yellow-400" />
                      <span className="font-semibold">{hotel.rating.toFixed(1)}</span>
                      <span className="text-gray-600 text-sm">(256 reviews)</span>
                    </div>
                  )}
                </div>

                {/* Date Pickers */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-in
                      </label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-out
                      </label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        min={checkIn || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guests
                    </label>
                    <div className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2">
                      <span className="text-gray-700">{guests} guests</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 hover:border-blue-500 flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          -
                        </button>
                        <button
                          onClick={() => setGuests(guests + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 hover:border-blue-500 flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                {totalNights > 0 && (
                  <div className="border-t border-gray-200 pt-4 mb-6 space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>{formatPrice(hotel.pricePerNight)} x {totalNights} nights</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>10% campaign discount</span>
                      <span className="text-green-600">-{formatPrice(totalPrice * 0.1)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Service fee</span>
                      <span>{formatPrice(serviceFee)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
                      <span>Total</span>
                      <span>{formatPrice(grandTotal)}</span>
                    </div>
                  </div>
                )}

                {/* Reserve Button */}
                <button
                  onClick={handleReserve}
                  disabled={!checkIn || !checkOut}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 flex items-center justify-center gap-2"
                >
                  <CheckIcon className="h-5 w-5" />
                  Reserve
                </button>

                {/* Report Link */}
                <div className="mt-4 text-center">
                  <button className="text-sm text-gray-600 hover:text-gray-900 underline flex items-center gap-1 mx-auto">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    Report this property
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
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors whitespace-nowrap">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
