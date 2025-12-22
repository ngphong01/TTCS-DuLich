import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Tour {
  id: number;
  name: string;
  slug: string;
  image?: string;
  price: number;
  adultPrice?: number;
  childPrice?: number;
  duration: number;
  rating: number;
  reviewCount: number;
  destination?: {
    name: string;
    country: string;
  };
  highlights?: any[];
  tags?: string[];
}

interface TourComparisonProps {
  tours: Tour[];
  onRemove?: (tourId: number) => void;
}

export default function TourComparison({ tours, onRemove }: TourComparisonProps) {
  const [selectedTours, setSelectedTours] = useState<Tour[]>(tours);

  const handleRemove = (tourId: number) => {
    const updated = selectedTours.filter((t) => t.id !== tourId);
    setSelectedTours(updated);
    onRemove?.(tourId);
  };

  if (selectedTours.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-gray-500">Chưa có tour nào để so sánh</p>
        <Link to="/tours" className="mt-4 inline-block text-blue-600 hover:underline">
          Xem các tour
        </Link>
      </div>
    );
  }

  const getImageUrl = (image?: string) => {
    if (!image) return '/placeholder-tour.jpg';
    if (image.startsWith('http')) return image;
    if (image.startsWith('/uploads')) return image;
    return `/uploads/destinations/${image}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">So sánh tour</h2>
        <p className="text-gray-600 mt-1">{selectedTours.length} tour được chọn</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tiêu chí</th>
              {selectedTours.map((tour) => (
                <th key={tour.id} className="px-6 py-4 text-center min-w-[250px]">
                  <div className="relative">
                    <button
                      onClick={() => handleRemove(tour.id)}
                      className="absolute top-0 right-0 p-1 hover:bg-gray-200 rounded-full transition-colors"
                      aria-label="Remove tour"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-500" />
                    </button>
                    <img
                      src={getImageUrl(tour.image)}
                      alt={tour.name}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-tour.jpg';
                      }}
                    />
                    <Link
                      to={`/tours/${tour.slug}`}
                      className="block font-bold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {tour.name}
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Price */}
            <tr>
              <td className="px-6 py-4 font-semibold text-gray-700">Giá</td>
              {selectedTours.map((tour) => (
                <td key={tour.id} className="px-6 py-4 text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {((tour.adultPrice || tour.price) / 1000).toFixed(0)}k VNĐ
                  </div>
                  {tour.childPrice && (
                    <div className="text-sm text-gray-500">
                      Trẻ em: {(tour.childPrice / 1000).toFixed(0)}k VNĐ
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* Duration */}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 font-semibold text-gray-700">Thời lượng</td>
              {selectedTours.map((tour) => (
                <td key={tour.id} className="px-6 py-4 text-center">
                  {tour.duration} ngày
                </td>
              ))}
            </tr>

            {/* Rating */}
            <tr>
              <td className="px-6 py-4 font-semibold text-gray-700">Đánh giá</td>
              {selectedTours.map((tour) => (
                <td key={tour.id} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="font-bold">{tour.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({tour.reviewCount})</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Destination */}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 font-semibold text-gray-700">Điểm đến</td>
              {selectedTours.map((tour) => (
                <td key={tour.id} className="px-6 py-4 text-center">
                  {tour.destination?.name || 'N/A'}
                  {tour.destination?.country && (
                    <div className="text-sm text-gray-500">{tour.destination.country}</div>
                  )}
                </td>
              ))}
            </tr>

            {/* Highlights */}
            {selectedTours.some((t) => t.highlights && t.highlights.length > 0) && (
              <tr>
                <td className="px-6 py-4 font-semibold text-gray-700">Điểm nổi bật</td>
                {selectedTours.map((tour) => (
                  <td key={tour.id} className="px-6 py-4">
                    <ul className="space-y-1">
                      {tour.highlights?.slice(0, 3).map((highlight: any, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{typeof highlight === 'string' ? highlight : highlight.text}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            )}

            {/* Tags */}
            {selectedTours.some((t) => t.tags && t.tags.length > 0) && (
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-700">Tags</td>
                {selectedTours.map((tour) => (
                  <td key={tour.id} className="px-6 py-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {tour.tags?.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            )}

            {/* Actions */}
            <tr>
              <td className="px-6 py-4"></td>
              {selectedTours.map((tour) => (
                <td key={tour.id} className="px-6 py-4 text-center">
                  <Link
                    to={`/tours/${tour.slug}`}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Xem chi tiết
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

