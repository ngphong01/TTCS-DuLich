import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getDestinationsPaged } from '../services/destination';
import { getToursPaged } from '../services/tour';
import Skeleton from '../components/Skeleton';
import { getDestinationImageUrl } from '../utils/imageHelper';
import { UserAPI } from '../utils/api';
import { addToWishlist, getUserWishlist, removeFromWishlist, WishlistItem } from '../services/wishlist';
import {
  MapPinIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';

const LOCAL_WISHLIST_KEY = 'travelgo:wishlist';

type FilterState = {
  budgetRange?: string;
  departurePoint?: string;
  destination?: string;
  departureDate?: string;
  tourType?: string;
  transport?: string;
  sort?: string;
  search?: string;
};

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { i18n } = useTranslation();
  
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 10;

  // Filters từ URL
  const filters: FilterState = {
    budgetRange: searchParams.get('budgetRange') || undefined,
    departurePoint: searchParams.get('departurePoint') || undefined,
    destination: searchParams.get('destination') || undefined,
    departureDate: searchParams.get('departureDate') || undefined,
    tourType: searchParams.get('tourType') || undefined,
    transport: searchParams.get('transport') || undefined,
    sort: searchParams.get('sort') || 'all',
    search: searchParams.get('q') || searchParams.get('search') || undefined,
  };

  // Fetch all destinations for filter dropdown
  const { data: allDestinations } = useQuery({
    queryKey: ['destinations', 'all', i18n.language],
    queryFn: () => getDestinationsPaged(1, 1000, {}),
    select: (data) => data?.items || [],
  });

  // Fetch tours
  const { data: toursData, isLoading: isLoadingTours } = useQuery({
    queryKey: ['tours', filters, page, i18n.language],
    queryFn: () => {
      let minPrice: number | undefined;
      let maxPrice: number | undefined;
      
      if (filters.budgetRange === 'under-5') {
        maxPrice = 5000000;
      } else if (filters.budgetRange === '5-10') {
        minPrice = 5000000;
        maxPrice = 10000000;
      } else if (filters.budgetRange === '10-20') {
        minPrice = 10000000;
        maxPrice = 20000000;
      } else if (filters.budgetRange === 'over-20') {
        minPrice = 20000000;
      }
      
      // Tìm kiếm: ưu tiên search term, nếu không có thì dùng destination
      const searchQuery = filters.search || filters.destination || undefined;
      
      // Tìm destinationId từ tên destination
      const destinationId = filters.destination && allDestinations?.find((d: any) => d.name === filters.destination)?.id;
      
      return getToursPaged(page, pageSize, {
        q: searchQuery,
        minPrice,
        maxPrice,
        tag: filters.tourType || undefined,
        destinationId: destinationId ? Number(destinationId) : undefined,
      });
    },
  });

  // Sort tours client-side if needed
  const tours = useMemo(() => {
    const items = toursData?.items || [];
    if (filters.sort === 'price-asc') {
      return [...items].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (filters.sort === 'price-desc') {
      return [...items].sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (filters.sort === 'popular') {
      return [...items].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }
    return items;
  }, [toursData?.items, filters.sort]);
  
  const toursTotal = toursData?.total || 0;

  // Wishlist/auth helpers
  const [hasToken, setHasToken] = useState(false);
  const [guestWishlist, setGuestWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasToken(Boolean(localStorage.getItem('tg_token')));
      const raw = localStorage.getItem(LOCAL_WISHLIST_KEY);
      if (raw) {
        try {
          setGuestWishlist(JSON.parse(raw));
        } catch {
          setGuestWishlist([]);
        }
      }
    }
  }, []);

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await UserAPI.current();
      return res.user;
    },
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: wishlistData,
    refetch: refetchWishlist,
  } = useQuery({
    queryKey: ['wishlist', currentUser?.id],
    queryFn: () => getUserWishlist(currentUser!.id),
    enabled: Boolean(currentUser?.id),
  });

  const wishlistMap = useMemo(() => {
    if (!wishlistData) return new Map<number, WishlistItem>();
    return new Map(wishlistData.map((item) => [item.destinationId, item]));
  }, [wishlistData]);

  const isFavorite = useCallback(
    (tour: any) => {
      if (currentUser?.id) {
        return wishlistMap.has(tour.destinationId || tour.id);
      }
      return guestWishlist.includes(tour.slug || tour.id?.toString());
    },
    [currentUser?.id, wishlistMap, guestWishlist]
  );

  const toggleFavorite = useCallback(
    async (tour: any) => {
      const destId = tour.destinationId || tour.id;
      if (currentUser?.id) {
        const existing = wishlistMap.get(destId);
        try {
          if (existing) {
            await removeFromWishlist(existing.id);
          } else {
            await addToWishlist(destId);
          }
          await refetchWishlist();
        } catch (error) {
          console.error('Wishlist error:', error);
        }
      } else {
        try {
          const slug = tour.slug || tour.id?.toString();
          const exists = guestWishlist.includes(slug);
          const next = exists
            ? guestWishlist.filter((s) => s !== slug)
            : [...guestWishlist, slug];
          setGuestWishlist(next);
          localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(next));
          window.dispatchEvent(new Event('wishlist-updated'));
        } catch {
          // ignore
        }
      }
    },
    [currentUser?.id, wishlistMap, guestWishlist, refetchWishlist]
  );

  const handleFilterChange = (key: keyof FilterState | 'q', value: any) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === undefined || value === '') {
      // Xóa cả 'q' và 'search' nếu key là 'search'
      if (key === 'search') {
        newParams.delete('q');
        newParams.delete('search');
      } else {
        newParams.delete(key);
      }
    } else {
      // Nếu là search, lưu vào cả 'q' và 'search' để tương thích
      if (key === 'search') {
        newParams.set('q', String(value));
        newParams.set('search', String(value));
      } else {
        newParams.set(key, String(value));
      }
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const totalPages = Math.ceil(toursTotal / pageSize);

  // Check if any filter is active
  const hasActiveFilters = filters.budgetRange || filters.departurePoint || filters.destination || filters.departureDate || filters.tourType || filters.transport;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filter - Left */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-4 shadow-sm">
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Bộ lọc tìm kiếm</h2>
              </div>
              
              <div className="p-4 space-y-6">
                {/* Tìm kiếm */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm kiếm tour</label>
                  <input
                    type="text"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                    placeholder="Nhập tên tour, điểm đến..."
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Ngân sách */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Ngân sách</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'under-5', label: 'Dưới 5 triệu' },
                      { value: '5-10', label: 'Từ 5 - 10 triệu' },
                      { value: '10-20', label: 'Từ 10 - 20 triệu' },
                      { value: 'over-20', label: 'Trên 20 triệu' },
                    ].map((range) => (
                      <button
                        key={range.value}
                        onClick={() => handleFilterChange('budgetRange', filters.budgetRange === range.value ? undefined : range.value)}
                        className={`px-3 py-2 text-sm rounded-lg border-2 font-medium transition-all duration-200 ${
                          filters.budgetRange === range.value
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Điểm khởi hành */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Điểm khởi hành</label>
                  <select
                    value={filters.departurePoint || ''}
                    onChange={(e) => handleFilterChange('departurePoint', e.target.value || undefined)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="">Tất cả</option>
                    <option value="hanoi">Hà Nội</option>
                    <option value="hochiminh">TP. Hồ Chí Minh</option>
                    <option value="danang">Đà Nẵng</option>
                  </select>
                </div>

                {/* Điểm đến */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Điểm đến</label>
                  <select
                    value={filters.destination || ''}
                    onChange={(e) => handleFilterChange('destination', e.target.value || undefined)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="">Tất cả</option>
                    {allDestinations && allDestinations.length > 0 ? (
                      allDestinations
                        .sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''))
                        .map((dest: any) => (
                          <option key={dest.id} value={dest.name}>
                            {dest.name}
                          </option>
                        ))
                    ) : (
                      <>
                        <option value="Hà Giang">Hà Giang</option>
                        <option value="Sa Pa">Sa Pa</option>
                        <option value="Đà Lạt">Đà Lạt</option>
                        <option value="Phú Quốc">Phú Quốc</option>
                        <option value="Nha Trang">Nha Trang</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Ngày đi */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Ngày đi</label>
                  <input
                    type="date"
                    value={filters.departureDate || ''}
                    onChange={(e) => handleFilterChange('departureDate', e.target.value || undefined)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  />
                </div>

                {/* Dòng tour */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Dòng tour</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'premium', label: 'Cao cấp' },
                      { value: 'standard', label: 'Tiêu chuẩn' },
                      { value: 'economical', label: 'Tiết kiệm' },
                      { value: 'good-price', label: 'Giá tốt' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => handleFilterChange('tourType', filters.tourType === type.value ? undefined : type.value)}
                        className={`px-3 py-2 text-sm rounded-lg border-2 font-medium transition-all duration-200 ${
                          filters.tourType === type.value
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phương tiện */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Phương tiện</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'car', label: 'Xe', icon: '🚗' },
                      { value: 'airplane', label: 'Máy bay', icon: '✈️' },
                    ].map((transport) => (
                      <button
                        key={transport.value}
                        onClick={() => handleFilterChange('transport', filters.transport === transport.value ? undefined : transport.value)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border-2 font-medium transition-all duration-200 ${
                          filters.transport === transport.value
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        <span className="text-base">{transport.icon}</span>
                        {transport.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Áp dụng button */}
                <button
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                >
                  Áp dụng
                </button>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tour List - Right */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-5 bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200">
              <p className="text-gray-700">
                Chúng tôi tìm thấy <span className="text-blue-600 font-bold text-lg">{toursTotal}</span> chương trình tour cho quý khách
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Sắp xếp theo:</span>
                <select
                  value={filters.sort || 'all'}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="all">Tất cả</option>
                  <option value="price-asc">Giá thấp → cao</option>
                  <option value="price-desc">Giá cao → thấp</option>
                  <option value="popular">Phổ biến nhất</option>
                </select>
              </div>
            </div>

            {/* Tour Cards */}
            {isLoadingTours ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-56 rounded-xl" />
                ))}
              </div>
            ) : tours.length > 0 ? (
              <div className="space-y-4">
                {tours.map((tour: any) => (
                  <TourCard
                    key={tour.id}
                    tour={tour}
                    liked={isFavorite(tour)}
                    onToggleFavorite={() => toggleFavorite(tour)}
                    departurePoint={
                      filters.departurePoint === 'hanoi' ? 'Hà Nội' : 
                      filters.departurePoint === 'hochiminh' ? 'TP. Hồ Chí Minh' : 
                      filters.departurePoint === 'danang' ? 'Đà Nẵng' : 
                      undefined
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-5">
                  <MapPinIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy tour nào</h3>
                <p className="text-gray-500 mb-6">Hãy thử điều chỉnh bộ lọc để tìm tour phù hợp với bạn</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200">
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('page', String(Math.max(1, page - 1)));
                      setSearchParams(newParams);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page === 1}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set('page', String(pageNum));
                          setSearchParams(newParams);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-semibold transition-all ${
                          page === pageNum
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('page', String(Math.min(totalPages, page + 1)));
                      setSearchParams(newParams);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page >= totalPages}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tour Card Component - Beautiful Design matching reference
function TourCard({
  tour,
  liked,
  onToggleFavorite,
  departurePoint,
}: {
  tour: any;
  liked: boolean;
  onToggleFavorite: () => void;
  departurePoint?: string;
}) {
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [dateStartIndex, setDateStartIndex] = useState(0);
  
  // Get image URL
  const imageUrl = tour.image || tour.images?.[0] || getDestinationImageUrl(tour);
  const hasImage = imageUrl && imageUrl.length > 0;
  
  const getBackendUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
  };
  
  const finalImageUrl = hasImage && !imageUrl.startsWith('http') 
    ? `${getBackendUrl()}${imageUrl}` 
    : imageUrl;

  // Generate tour code
  const tourCode = `ND${tour.id?.toString().padStart(4, '0') || '0000'}`;
  
  // Parse duration
  const duration = tour.duration || '4N3Đ';
  
  // Get departure dates
  const allDepartureDates = tour.departureDates || ['31/12', '01/01', '08/01', '15/01', '22/01', '29/01', '05/02'];
  const visibleDates = allDepartureDates.slice(dateStartIndex, dateStartIndex + 5);
  
  // Price formatting - đảm bảo format đúng với dấu chấm phân cách hàng nghìn
  const price = tour.price || tour.priceFrom || 0;
  const originalPrice = tour.originalPrice || null;
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
  const formattedOriginalPrice = originalPrice ? new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(originalPrice) : null;

  // Determine tour tag
  const getTourTag = () => {
    if (tour.tag === 'premium' || price > 15000000) return { label: 'Cao cấp', color: 'bg-gradient-to-r from-purple-500 to-purple-600' };
    if (tour.tag === 'economical' || price < 5000000) return { label: 'Tiết kiệm', color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' };
    if (tour.tag === 'good-price') return { label: 'Giá tốt', color: 'bg-gradient-to-r from-orange-500 to-orange-600' };
    return null;
  };
  
  const tourTag = getTourTag();

  const handlePrevDates = () => {
    setDateStartIndex(Math.max(0, dateStartIndex - 1));
  };

  const handleNextDates = () => {
    setDateStartIndex(Math.min(allDepartureDates.length - 5, dateStartIndex + 1));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 group">
      <div className="flex">
        {/* Image - Left Side */}
        <div className="relative w-80 flex-shrink-0">
          <div className="aspect-[4/3] relative overflow-hidden">
            {hasImage ? (
              <img
                src={finalImageUrl}
                alt={tour.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center">
                <MapPinIcon className="h-16 w-16 text-white/60" />
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
          
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="absolute top-3 left-3 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
          >
            {liked ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-400 group-hover:text-red-400 transition-colors" />
            )}
          </button>
          
          {/* Tour Tag */}
          {tourTag && (
            <div className={`absolute bottom-3 left-3 ${tourTag.color} text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg`}>
              {tourTag.label}
            </div>
          )}
        </div>

        {/* Content - Right Side */}
        <div className="flex-1 p-5 flex flex-col min-w-0">
          {/* Tour Name */}
          <Link 
            to={`/tours/${tour.slug || tour.id}`}
            className="group/link"
          >
            <h3 className="text-lg font-bold text-blue-600 group-hover/link:text-blue-700 mb-4 line-clamp-2 leading-snug transition-colors">
              {tour.name}
            </h3>
          </Link>

          {/* Tour Info Grid - Clean Design */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-4">
            {/* Mã tour */}
            <div className="flex items-center gap-3">
              <span className="text-xl">📋</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Mã tour:</span>
                <span className="font-bold text-gray-800 text-sm">{tourCode}</span>
              </div>
            </div>
            
            {/* Khởi hành */}
            <div className="flex items-center gap-3">
              <span className="text-xl">📍</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Khởi hành:</span>
                <span className="font-bold text-blue-600 text-sm">{departurePoint || tour.departurePoint || 'Hà Nội'}</span>
              </div>
            </div>
            
            {/* Thời gian */}
            <div className="flex items-center gap-3">
              <span className="text-xl">📅</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Thời gian:</span>
                <span className="font-bold text-gray-800 text-sm">{duration}</span>
              </div>
            </div>
            
            {/* Phương tiện */}
            <div className="flex items-center gap-3">
              <span className="text-xl">🚗</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Phương tiện:</span>
                <span className="font-bold text-gray-800 text-sm">{tour.transport || 'Xe'}</span>
              </div>
            </div>
          </div>

          {/* Departure Dates - Refined */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🗓️</span>
              <span className="text-gray-500 text-sm whitespace-nowrap">Ngày khởi hành:</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handlePrevDates}
                disabled={dateStartIndex === 0}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex gap-2">
                {visibleDates.map((date: string, idx: number) => {
                  const actualIndex = dateStartIndex + idx;
                  const isSelected = actualIndex === selectedDateIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDateIndex(actualIndex)}
                      className={`px-3 py-1.5 text-sm rounded-lg border-2 font-semibold transition-all duration-200 ${
                        isSelected 
                          ? 'bg-orange-50 border-orange-400 text-orange-600 shadow-sm' 
                          : 'border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {date}
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={handleNextDates}
                disabled={dateStartIndex >= allDepartureDates.length - 5}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Price and CTA - Enhanced */}
          <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-100">
            <div>
              <span className="text-sm text-gray-500 block mb-1">Giá từ:</span>
              <div className="flex items-baseline gap-2 flex-wrap">
                {formattedOriginalPrice && (
                  <span className="text-lg text-gray-400 line-through">{formattedOriginalPrice} đ</span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-red-500">{formattedPrice}</span>
                  <span className="text-lg text-red-500 font-bold">đ</span>
                </div>
                {formattedOriginalPrice && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded">
                    -{Math.round((1 - price / originalPrice) * 100)}%
                  </span>
                )}
              </div>
            </div>
            
            <Link
              to={`/tours/${tour.slug || tour.id}`}
              className="px-7 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}