import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRestaurantsPaged } from '../services/restaurant';
import Skeleton from '../components/Skeleton';
import {
  MapPinIcon,
  StarIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';

type FilterState = {
  city?: string;
  cuisine?: string;
  priceRange?: string;
  search?: string;
  sort?: string;
};

export default function Restaurants() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 12;

  const filters: FilterState = {
    city: searchParams.get('city') || undefined,
    cuisine: searchParams.get('cuisine') || undefined,
    priceRange: searchParams.get('priceRange') || undefined,
    search: searchParams.get('q') || undefined,
    sort: searchParams.get('sort') || 'created_desc',
  };

  const { data: restaurantsData, isLoading } = useQuery({
    queryKey: ['restaurants', page, filters],
    queryFn: () => getRestaurantsPaged(page, pageSize, {
      q: filters.search,
      city: filters.city,
      cuisine: filters.cuisine,
      priceRange: filters.priceRange,
      sort: filters.sort,
    }),
  });

  const restaurants = restaurantsData?.items || [];
  const total = restaurantsData?.total || 0;

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

  const hasActiveFilters = filters.city || filters.cuisine || filters.priceRange;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                Nhà hàng & Ẩm thực
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto mb-10">
              Khám phá những nhà hàng ngon nhất trong và ngoài nước
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                  placeholder="Tìm kiếm nhà hàng (tên, món ăn, địa chỉ...)"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Loại ẩm thực</label>
              <input
                type="text"
                value={filters.cuisine || ''}
                onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                placeholder="VD: Việt Nam, Ý, Nhật"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mức giá</label>
              <select
                value={filters.priceRange || ''}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Tất cả</option>
                <option value="$">Rẻ ($)</option>
                <option value="$$">Vừa phải ($$)</option>
                <option value="$$$">Đắt ($$$)</option>
                <option value="$$$$">Rất đắt ($$$$)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sắp xếp</label>
              <select
                value={filters.sort || 'created_desc'}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="created_desc">Mới nhất</option>
                <option value="name_asc">Tên A-Z</option>
                <option value="name_desc">Tên Z-A</option>
                <option value="rating_desc">Đánh giá cao</option>
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-orange-600 hover:text-orange-800 font-semibold"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Tìm thấy <span className="font-bold text-orange-600">{total}</span> nhà hàng
          </p>
        </div>

        {/* Restaurants Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <BuildingStorefrontIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">Không tìm thấy nhà hàng nào</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {restaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  to={`/restaurants/${restaurant.slug}`}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={restaurant.image && restaurant.image.startsWith('http') ? restaurant.image : (restaurant.image && restaurant.image.startsWith('/uploads') ? restaurant.image : `/uploads/destinations/${restaurant.image}`) || '/placeholder-restaurant.jpg'}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-restaurant.jpg';
                      }}
                    />
                    {restaurant.featured && (
                      <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                        Nổi bật
                      </div>
                    )}
                    {restaurant.rating && (
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                        <StarIconSolid className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-bold">{restaurant.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {restaurant.name}
                    </h3>
                    {restaurant.cuisine && (
                      <div className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                        {restaurant.cuisine}
                      </div>
                    )}
                    {restaurant.address && (
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPinIcon className="h-4 w-4" />
                        <span className="text-sm">{restaurant.address}</span>
                      </div>
                    )}
                    {restaurant.city && (
                      <p className="text-sm text-gray-500 mb-3">{restaurant.city}, {restaurant.country || 'Việt Nam'}</p>
                    )}
                    {restaurant.priceRange && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-lg font-bold text-orange-600">
                          {restaurant.priceRange}
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

