import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDestinationsPaged } from '../services/destination';
import { getCategories } from '../services/category';
import { getDestinationReviews } from '../services/review';
import Skeleton from '../components/Skeleton';
import MapEmbed from '../components/MapEmbed';
import { getDestinationImageUrl } from '../utils/imageHelper';
import {
  MapPinIcon,
  StarIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  GlobeAltIcon,
  SparklesIcon,
  CameraIcon,
  HeartIcon,
  Squares2X2Icon,
  MapIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';

// Danh mục cấp 1
const REGIONS = {
  vietnam: {
    name: 'Việt Nam 🇻🇳',
    icon: '🇻🇳',
    color: 'from-red-500 to-orange-500',
    areas: {
      north: ['Hà Giang', 'Sa Pa', 'Hà Nội', 'Ninh Bình', 'Hạ Long'],
      central: ['Đà Nẵng', 'Huế', 'Hội An', 'Quy Nhơn', 'Nha Trang'],
      south: ['TP.HCM', 'Phú Quốc', 'Cần Thơ', 'Vũng Tàu', 'Côn Đảo'],
    },
  },
  international: {
    name: 'Quốc tế 🌏',
    icon: '🌏',
    color: 'from-blue-500 to-purple-500',
    areas: {
      southeastAsia: ['Thái Lan', 'Singapore', 'Malaysia', 'Indonesia'],
      asia: ['Hàn Quốc', 'Nhật Bản', 'Trung Quốc', 'Ấn Độ'],
      other: ['Châu Âu', 'Mỹ', 'Úc'],
    },
  },
};

type FilterState = {
  region?: string;
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  search?: string;
  sort?: string;
};

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 12;

  // Filters từ URL
  const filters: FilterState = {
    region: searchParams.get('region') || undefined,
    area: searchParams.get('area') || undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined,
    search: searchParams.get('q') || undefined,
    sort: searchParams.get('sort') || 'created_desc',
  };

  // Fetch destinations
  const { data: destinationsData, isLoading } = useQuery({
    queryKey: ['destinations', page, filters],
    queryFn: () => getDestinationsPaged(page, pageSize, {
      q: filters.search,
      country: filters.region, // Use region as country filter (vietnam/international)
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
    }),
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const destinations = destinationsData?.items || [];
  const total = destinationsData?.total || 0;

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
    setSelectedRegion('');
    setSelectedArea('');
  };

  const hasActiveFilters = filters.region || filters.area || filters.minPrice || filters.maxPrice || filters.rating;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section - Enhanced */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            animation: 'float 20s ease-in-out infinite'
          }} />
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-2.5 mb-6 shadow-lg">
              <SparklesIcon className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-semibold">Hàng trăm điểm đến tuyệt vời</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                Khám phá điểm đến
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto mb-10">
              Tìm kiếm và khám phá những địa điểm tuyệt vời trong và ngoài nước
            </p>

            {/* Enhanced Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                  placeholder="Bạn muốn đi đâu? (Hà Nội, Đà Nẵng, Phú Quốc, Thái Lan...)"
                  className="w-full pl-14 pr-6 py-5 text-lg text-gray-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/50 shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <button
              onClick={() => {
                setSelectedRegion('');
                handleFilterChange('region', undefined);
              }}
              className={`px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 ${
                !filters.region
                  ? 'bg-white text-blue-600 shadow-xl'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => handleFilterChange('region', 'vietnam')}
              className={`px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 ${
                filters.region === 'vietnam'
                  ? 'bg-white text-red-600 shadow-xl'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              🇻🇳 Việt Nam
            </button>
            <button
              onClick={() => handleFilterChange('region', 'international')}
              className={`px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 ${
                filters.region === 'international'
                  ? 'bg-white text-blue-600 shadow-xl'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              🌏 Quốc tế
            </button>
          </div>
        </div>

        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-20 text-white" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-6 flex-wrap">
              <div>
                <div className="text-3xl font-bold text-gray-900">{total}</div>
                <div className="text-sm text-gray-600">Điểm đến</div>
              </div>
              <div className="h-12 w-px bg-gray-200"></div>
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {categories?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Danh mục</div>
              </div>
              {hasActiveFilters && (
                <>
                  <div className="h-12 w-px bg-gray-200"></div>
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold"
                  >
                    <XMarkIcon className="h-5 w-5" />
                    Xóa bộ lọc
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <select
                value={filters.sort || 'popular'}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-700"
              >
                <option value="popular">⭐ Phổ biến nhất</option>
                <option value="price-asc">💰 Giá tăng dần</option>
                <option value="price-desc">💸 Giá giảm dần</option>
                <option value="rating-desc">⭐ Đánh giá cao nhất</option>
                <option value="name-asc">🔤 Tên A-Z</option>
              </select>

              <div className="flex items-center gap-0 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Xem dạng lưới"
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    viewMode === 'map'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Xem bản đồ"
                >
                  <MapIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between px-6 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 transition-colors shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <FunnelIcon className="h-6 w-6 text-gray-600" />
              <span className="font-semibold text-gray-900">Bộ lọc nâng cao</span>
              {hasActiveFilters && (
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">
                  Đang áp dụng
                </span>
              )}
            </div>
            <ArrowRightIcon className={`h-5 w-5 text-gray-400 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
          </button>

          {showFilters && (
            <div className="mt-4 bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Region Filter */}
                <div className="w-full">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <GlobeAltIcon className="h-4 w-4" />
                    Khu vực
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => {
                      setSelectedRegion(e.target.value);
                      setSelectedArea('');
                      handleFilterChange('region', e.target.value || undefined);
                    }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  >
                    <option value="">Tất cả khu vực</option>
                    <optgroup label="🇻🇳 Việt Nam">
                      <option value="north">Miền Bắc</option>
                      <option value="central">Miền Trung</option>
                      <option value="south">Miền Nam</option>
                    </optgroup>
                    <optgroup label="🌏 Quốc tế">
                      <option value="southeast-asia">Đông Nam Á</option>
                      <option value="asia">Châu Á</option>
                      <option value="other">Châu Âu / Mỹ / Úc</option>
                    </optgroup>
                  </select>
                </div>

                {/* Area Filter */}
                {selectedRegion && (
                  <div className="w-full">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4" />
                      Địa điểm cụ thể
                    </label>
                    <select
                      value={selectedArea}
                      onChange={(e) => {
                        setSelectedArea(e.target.value);
                        handleFilterChange('area', e.target.value || undefined);
                      }}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                    >
                      <option value="">Tất cả địa điểm</option>
                      {selectedRegion === 'north' && REGIONS.vietnam.areas.north.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                      {selectedRegion === 'central' && REGIONS.vietnam.areas.central.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                      {selectedRegion === 'south' && REGIONS.vietnam.areas.south.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                      {selectedRegion === 'southeast-asia' && REGIONS.international.areas.southeastAsia.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                      {selectedRegion === 'asia' && REGIONS.international.areas.asia.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                      {selectedRegion === 'other' && REGIONS.international.areas.other.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Price Range */}
                <div className="w-full">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    💰 Khoảng giá (VNĐ)
                  </label>
                  <div className="flex gap-2 w-full">
                    <input
                      type="number"
                      placeholder="Từ"
                      value={filters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="flex-1 min-w-0 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Đến"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="flex-1 min-w-0 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="w-full">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    ⭐ Đánh giá tối thiểu
                  </label>
                  <select
                    value={filters.rating || ''}
                    onChange={(e) => handleFilterChange('rating', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  >
                    <option value="">Tất cả đánh giá</option>
                    <option value="4">⭐ 4 sao trở lên</option>
                    <option value="4.5">⭐⭐ 4.5 sao trở lên</option>
                    <option value="5">⭐⭐⭐ 5 sao</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {viewMode === 'map' ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <MapIcon className="h-8 w-8 text-blue-600" />
              Bản đồ điểm đến
            </h2>
            <MapEmbed query="Việt Nam" className="w-full rounded-xl overflow-hidden" />
          </div>
        ) : (
          <>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-96 rounded-2xl" />
                ))}
              </div>
            ) : destinations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {destinations.map((destination: any) => (
                  <DestinationCard key={destination.id || destination.slug} destination={destination} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPinIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">Không tìm thấy điểm đến</h3>
                <p className="text-gray-600 mb-8 text-lg">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn</p>
                <button
                  onClick={clearFilters}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}

            {/* Enhanced Pagination */}
            {total > pageSize && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2 bg-white rounded-xl shadow-lg p-2 border border-gray-100">
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('page', String(Math.max(1, page - 1)));
                      setSearchParams(newParams);
                    }}
                    disabled={page === 1}
                    className="px-5 py-2.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors font-semibold"
                  >
                    Trước
                  </button>
                  {Array.from({ length: Math.min(5, Math.ceil(total / pageSize)) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set('page', String(pageNum));
                          setSearchParams(newParams);
                        }}
                        className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                          page === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('page', String(Math.min(Math.ceil(total / pageSize), page + 1)));
                      setSearchParams(newParams);
                    }}
                    disabled={page >= Math.ceil(total / pageSize)}
                    className="px-5 py-2.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors font-semibold"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Enhanced Destination Card Component
function DestinationCard({ destination }: { destination: any }) {
  const [liked, setLiked] = useState(false);
  const STORAGE_KEY = 'travelgo:wishlist';

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      setLiked(ids.includes(destination.slug));
    } catch {}
  }, [destination.slug]);
  const { data: reviews } = useQuery({
    queryKey: ['reviews', destination.id],
    queryFn: () => getDestinationReviews(destination.id),
    enabled: !!destination.id,
  });

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : destination.rating || 4.5;

  // Get image URL from uploads folder
  const imageUrl = getDestinationImageUrl(destination);
  const hasImage = imageUrl && imageUrl.length > 0;
  
  // Convert to absolute URL if needed (same as Home page)
  const finalImageUrl = hasImage && !imageUrl.startsWith('http') 
    ? `http://localhost:3000${imageUrl}` 
    : imageUrl;

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      <Link to={`/destinations/${destination.slug}`} className="block">
        {/* Image with Gradient Overlay */}
        <div className="relative h-56 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 overflow-hidden">
          {/* Actual Image */}
          {hasImage && (
            <img
              src={finalImageUrl}
              alt={destination.name}
              className="absolute inset-0 w-full h-full object-cover z-0"
              style={{ display: 'block' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.error(`❌ Failed to load image for ${destination.name}:`, finalImageUrl);
                target.style.display = 'none';
              }}
              onLoad={() => {
                if (process.env.NODE_ENV === 'development') {
                  console.log(`✅ Image loaded for ${destination.name}:`, finalImageUrl);
                }
              }}
            />
          )}
          {/* Gradient overlay - above image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none"></div>
          
          {/* Featured Badge */}
          {destination.featured && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl z-10">
              <SparklesIcon className="h-4 w-4" />
              Nổi bật
            </div>
          )}

          {/* Like Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              try {
                const raw = localStorage.getItem(STORAGE_KEY);
                const ids: string[] = raw ? JSON.parse(raw) : [];
                const exists = ids.includes(destination.slug);
                const next = exists ? ids.filter((s) => s !== destination.slug) : [...ids, destination.slug];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                setLiked(!exists);
                // thông báo cho trang tài khoản cập nhật
                window.dispatchEvent(new Event('wishlist-updated'));
              } catch {
                setLiked((v) => !v);
              }
            }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all z-10 shadow-lg"
          >
            {liked ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {/* Rating Badge */}
          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-xl flex items-center gap-1.5 z-10">
            <StarIconSolid className="h-5 w-5 text-yellow-500" />
            <span className="font-bold text-gray-900">{avgRating.toFixed(1)}</span>
          </div>

          {/* Placeholder Icon - only show if no image */}
          {!hasImage && (
            <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
              <CameraIcon className="h-24 w-24 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
            {destination.name}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
            {destination.description || 'Điểm đến tuyệt vời đang chờ bạn khám phá'}
          </p>

          <div className="pt-4 border-t border-gray-100">
            {destination.price && destination.price > 0 ? (
              <>
                <div className="text-xs text-gray-500 mb-2">Từ</div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {new Intl.NumberFormat('vi-VN').format(destination.price)}
                    </span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent underline">đ</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-600 font-bold group-hover:translate-x-1 transition-transform flex-shrink-0">
                    <span>Xem ngay</span>
                    <ArrowRightIcon className="h-5 w-5" />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">Liên hệ để biết giá</div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}