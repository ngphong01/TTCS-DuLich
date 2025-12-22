import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getHotelsPaged } from '../services/hotel';
import Skeleton from '../components/Skeleton';
import {
  MapPinIcon,
  StarIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';

type FilterState = {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
};

export default function Hotels() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 12;

  const filters: FilterState = {
    city: searchParams.get('city') || undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    search: searchParams.get('q') || undefined,
    sort: searchParams.get('sort') || 'created_desc',
  };

  const { data: hotelsData, isLoading } = useQuery({
    queryKey: ['hotels', page, filters],
    queryFn: () => getHotelsPaged(page, pageSize, {
      q: filters.search,
      city: filters.city,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
    }),
  });

  const hotels = hotelsData?.items || [];
  const total = hotelsData?.total || 0;

  const handleFilterChange = (key: keyof FilterState | 'q', value: any) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === undefined || value === '') {
      newParams.delete(key === 'q' ? 'q' : key);
    } else {
      newParams.set(key === 'q' ? 'q' : key, String(value));
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = filters.city || filters.minPrice || filters.maxPrice;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-teal-500 to-sky-500 text-white">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                Khách sạn & Resort
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto mb-10">
              Tìm kiếm khách sạn phù hợp với nhu cầu của bạn
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                  placeholder="Tìm kiếm khách sạn (tên, địa chỉ, thành phố...)"
                  className="w-full pl-14 pr-6 py-5 text-lg text-gray-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/50 shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Thành phố</label>
              <input
                type="text"
                value={filters.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="VD: Hà Nội, Đà Nẵng"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Giá tối thiểu (VND)</label>
              <input
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Giá tối đa (VND)</label>
              <input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Không giới hạn"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sắp xếp</label>
              <select
                value={filters.sort || 'created_desc'}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_desc">Mới nhất</option>
                <option value="name_asc">Tên A-Z</option>
                <option value="name_desc">Tên Z-A</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="rating_desc">Đánh giá cao</option>
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 hover:text-blue-800 font-semibold"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Tìm thấy <span className="font-bold text-blue-600">{total}</span> khách sạn
          </p>
        </div>

        {/* Hotels Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-20">
            <BuildingOfficeIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">Không tìm thấy khách sạn nào</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {hotels.map((hotel) => (
                <Link
                  key={hotel.id}
                  to={`/hotels/${hotel.slug}`}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={hotel.image && hotel.image.startsWith('http') ? hotel.image : (hotel.image && hotel.image.startsWith('/uploads') ? hotel.image : `/uploads/destinations/${hotel.image}`) || '/placeholder-hotel.jpg'}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-hotel.jpg';
                      }}
                    />
                    {hotel.featured && (
                      <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                        Nổi bật
                      </div>
                    )}
                    {hotel.rating && (
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                        <StarIconSolid className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-bold">{hotel.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {hotel.name}
                    </h3>
                    {hotel.address && (
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPinIcon className="h-4 w-4" />
                        <span className="text-sm">{hotel.address}</span>
                      </div>
                    )}
                    {hotel.city && (
                      <p className="text-sm text-gray-500 mb-3">{hotel.city}, {hotel.country || 'Việt Nam'}</p>
                    )}
                    {hotel.pricePerNight && (
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {hotel.pricePerNight.toLocaleString('vi-VN')} VND
                          </p>
                          <p className="text-xs text-gray-500">/ đêm</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {total > pageSize && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) })}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                  Trước
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Trang {page} / {Math.ceil(total / pageSize)}
                </span>
                <button
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) })}
                  disabled={page >= Math.ceil(total / pageSize)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

