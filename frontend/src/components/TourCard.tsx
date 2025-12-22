import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';

interface TourCardProps {
  tour: {
    id: number;
    name: string;
    slug: string;
    image?: string | null;
    price?: number;
    originalPrice?: number | null;
    duration?: number;
    transport?: string | null;
    destination?: {
      name: string;
    } | null;
    tags?: string[] | any;
    featured?: boolean;
  };
  liked?: boolean;
  onToggleFavorite?: () => void;
  departureDate?: string;
  departurePoint?: string;
  tourCode?: string;
}

export default function TourCard({
  tour,
  liked = false,
  onToggleFavorite,
  departureDate,
  departurePoint,
  tourCode,
}: TourCardProps) {
  const imageUrl = tour.image 
    ? (tour.image.startsWith('http') ? tour.image : `${window.location.origin}${tour.image}`)
    : null;

  const formatPrice = (price?: number) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getDurationText = (duration?: number) => {
    if (!duration) return '';
    const nights = duration - 1;
    return `${duration}N${nights}Đ`;
  };

  const getTransportText = (transport?: string | null) => {
    if (!transport) return '';
    return transport === 'Flight' || transport === 'Máy bay' ? 'Máy bay' : 'Xe';
  };

  const hasDiscount = tour.originalPrice && tour.price && tour.originalPrice > tour.price;
  const isEconomical = tour.tags?.includes('Tiết kiệm') || tour.tags?.some((tag: any) => 
    typeof tag === 'string' && tag.toLowerCase().includes('tiết kiệm')
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative w-80 h-48 flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={tour.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
          )}
          
          {/* Heart icon */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite();
              }}
              className="absolute top-2 left-2 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm z-10"
            >
              {liked ? (
                <HeartIconSolid className="h-4 w-4 text-red-500" />
              ) : (
                <HeartIcon className="h-4 w-4 text-gray-400" />
              )}
            </button>
          )}

          {/* Badge Tiết kiệm */}
          {isEconomical && (
            <div className="absolute bottom-2 left-2 bg-pink-500 text-white px-2 py-1 rounded flex items-center gap-1 text-xs font-semibold z-10">
              <ShoppingBagIcon className="h-3 w-3" />
              Tiết kiệm
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          {/* Title */}
          <div>
            <Link to={`/tours/${tour.slug}`}>
              <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                {tour.name}
              </h3>
            </Link>

            {/* Tour Details */}
            <div className="space-y-1.5 mb-3">
              {tourCode && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Mã tour:</span> {tourCode}
                </div>
              )}
              
              <div className="flex items-center gap-4 flex-wrap text-sm text-gray-600">
                {tour.duration && (
                  <span>
                    <span className="font-medium">Thời gian:</span> {getDurationText(tour.duration)}
                  </span>
                )}
                
                {departureDate && (
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">
                    {departureDate}
                  </span>
                )}
                
                {departurePoint && (
                  <span>
                    <span className="font-medium">Khởi hành:</span> {departurePoint}
                  </span>
                )}
                
                {tour.transport && (
                  <span>
                    <span className="font-medium">Phương tiện:</span> {getTransportText(tour.transport)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div>
              <div className="text-sm text-gray-500 mb-1">Giá từ:</div>
              <div className="text-2xl font-bold text-red-600">
                {formatPrice(tour.price)} ₫
              </div>
              {hasDiscount && tour.originalPrice && (
                <div className="text-sm text-gray-400 line-through">
                  {formatPrice(tour.originalPrice)} ₫
                </div>
              )}
            </div>
            
            <Link
              to={`/tours/${tour.slug}`}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

