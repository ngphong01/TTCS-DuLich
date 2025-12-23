import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getDestinationsPaged } from '../services/destination';
import { getToursPaged, Tour } from '../services/tour';
import Skeleton from '../components/Skeleton';
import { getDestinationImageUrl } from '../utils/imageHelper';
import { UserAPI } from '../utils/api';
import { addToWishlist, getUserWishlist, removeFromWishlist, WishlistItem } from '../services/wishlist';
import { MapPinIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';

const LOCAL_WISHLIST_KEY = 'travelgo:wishlist';

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { i18n } = useTranslation();

  // View mode: 'destinations' or 'tours'
  const viewMode = searchParams.get('view') || 'destinations';
  
  // Get search from URL
  const searchFromUrl = searchParams.get('q') || searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(searchFromUrl);

  // Sync input with URL when URL changes
  useEffect(() => {
    setSearchInput(searchFromUrl);
  }, [searchFromUrl]);

  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 10;

  // Parse all filters
  const filters = useMemo(() => ({
    search: searchFromUrl || undefined,
    budgetRange: searchParams.get('budgetRange') || undefined,
    departurePoint: searchParams.get('departurePoint') || undefined,
    destination: searchParams.get('destination') || undefined,
    departureDate: searchParams.get('departureDate') || undefined,
    tourType: searchParams.get('tourType') || undefined,
    transport: searchParams.get('transport') || undefined,
    sort: searchParams.get('sort') || 'all',
  }), [searchParams, searchFromUrl]);

  // Fetch destinations for dropdown and list
  const { data: allDestinations = [] } = useQuery({
    queryKey: ['destinations', 'all', i18n.language],
    queryFn: async () => {
      const result = await getDestinationsPaged(1, 1000, {});
      return result?.items || [];
    },
  });

  // Build price range from budget filter
  const priceRange = useMemo(() => {
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    switch (filters.budgetRange) {
      case 'under-5': maxPrice = 5000000; break;
      case '5-10': minPrice = 5000000; maxPrice = 10000000; break;
      case '10-20': minPrice = 10000000; maxPrice = 20000000; break;
      case 'over-20': minPrice = 20000000; break;
    }

    return { minPrice, maxPrice };
  }, [filters.budgetRange]);

  // Fetch destinations list (for destinations view)
  const { data: destinationsData, isLoading: loadingDestinations } = useQuery({
    queryKey: ['destinations', 'list', page, pageSize, searchFromUrl, filters.sort, priceRange.minPrice, priceRange.maxPrice, i18n.language],
    queryFn: async () => {
      const result = await getDestinationsPaged(page, pageSize, {
        q: searchFromUrl || undefined,
        sort: filters.sort === 'all' ? 'created-desc' : filters.sort,
        minPrice: priceRange.minPrice,
        maxPrice: priceRange.maxPrice,
      });
      return result;
    },
    enabled: viewMode === 'destinations',
  });

  // Build API params for tours
  const apiParams = useMemo(() => {
    const destId = filters.destination
      ? allDestinations.find((d: any) => d.name === filters.destination)?.id
      : undefined;

    return {
      q: filters.search || undefined,
      destinationId: destId ? Number(destId) : undefined,
      minPrice: priceRange.minPrice,
      maxPrice: priceRange.maxPrice,
      tag: filters.tourType || undefined,
      departureDate: filters.departureDate || undefined,
    };
  }, [filters, allDestinations, priceRange]);

  // Fetch tours
  const { data: toursData, isLoading, error } = useQuery({
    queryKey: ['tours', page, apiParams, i18n.language],
    queryFn: () => {
      console.log('🔍 Fetching tours with:', apiParams);
      return getToursPaged(page, pageSize, apiParams);
    },
    enabled: viewMode === 'tours',
  });

  // Sort client-side
  const tours = useMemo(() => {
    const items = toursData?.items || [];
    switch (filters.sort) {
      case 'price-asc': return [...items].sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-desc': return [...items].sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'popular': return [...items].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      default: return items;
    }
  }, [toursData?.items, filters.sort]);

  // Calculate totals based on view mode
  const total = viewMode === 'destinations' 
    ? (destinationsData?.total || 0)
    : (toursData?.total || 0);
  const totalPages = Math.ceil(total / pageSize);
  
  // Destinations list
  const destinations = destinationsData?.items || [];

  // Wishlist
  const [hasToken, setHasToken] = useState(false);
  const [guestWishlist, setGuestWishlist] = useState<string[]>([]);

  useEffect(() => {
    setHasToken(Boolean(localStorage.getItem('tg_token')));
    try {
      const raw = localStorage.getItem(LOCAL_WISHLIST_KEY);
      if (raw) setGuestWishlist(JSON.parse(raw));
    } catch { }
  }, []);

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => (await UserAPI.current()).user,
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
  });

  const { data: wishlistData, refetch: refetchWishlist } = useQuery({
    queryKey: ['wishlist', currentUser?.id],
    queryFn: () => getUserWishlist(currentUser!.id),
    enabled: Boolean(currentUser?.id),
  });

  const wishlistSet = useMemo(() => {
    if (!wishlistData) return new Set<number>();
    return new Set(wishlistData.map(w => w.destinationId));
  }, [wishlistData]);

  const isFavorite = useCallback((tour: Tour) => {
    const id = tour.destinationId || tour.id;
    if (currentUser?.id) return wishlistSet.has(id);
    return guestWishlist.includes(tour.slug || String(tour.id));
  }, [currentUser?.id, wishlistSet, guestWishlist]);

  const toggleFavorite = useCallback(async (tour: Tour) => {
    const destId = tour.destinationId || tour.id;
    if (currentUser?.id) {
      const existing = wishlistData?.find(w => w.destinationId === destId);
      if (existing) await removeFromWishlist(existing.id);
      else await addToWishlist(destId);
      await refetchWishlist();
    } else {
      const slug = tour.slug || String(tour.id);
      const next = guestWishlist.includes(slug)
        ? guestWishlist.filter(s => s !== slug)
        : [...guestWishlist, slug];
      setGuestWishlist(next);
      localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(next));
    }
  }, [currentUser?.id, wishlistData, guestWishlist, refetchWishlist]);

  // Handlers
  const updateFilter = useCallback((key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (!value) {
      params.delete(key);
      if (key === 'q') params.delete('search');
    } else {
      params.set(key, value);
    }
    params.set('page', '1');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    updateFilter('q', searchInput.trim() || undefined);
  };

  const setViewMode = useCallback((mode: 'destinations' | 'tours') => {
    const params = new URLSearchParams(searchParams);
    params.set('view', mode);
    params.set('page', '1'); // Reset to first page
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const clearAllFilters = () => {
    setSearchParams({});
    setSearchInput('');
  };

  const hasFilters = !!(filters.search || filters.budgetRange || filters.departurePoint ||
    filters.destination || filters.departureDate || filters.tourType || filters.transport);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg sticky top-4 shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-800 uppercase">Bộ lọc tìm kiếm</h2>
              </div>

              <div className="p-4 space-y-5">
                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm kiếm</label>
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="text"
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      placeholder="Nhập tên tour, điểm đến..."
                      className="w-full pl-4 pr-16 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      {searchInput && (
                        <button type="button" onClick={() => { setSearchInput(''); updateFilter('q', undefined); }}
                          className="p-1 text-gray-400 hover:text-gray-600">
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button type="submit" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <MagnifyingGlassIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                  {filters.search && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500">Đang tìm:</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        "{filters.search}"
                      </span>
                    </div>
                  )}
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngân sách</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'under-5', label: 'Dưới 5 triệu' },
                      { value: '5-10', label: '5-10 triệu' },
                      { value: '10-20', label: '10-20 triệu' },
                      { value: 'over-20', label: 'Trên 20 triệu' },
                    ].map(item => (
                      <button
                        key={item.value}
                        onClick={() => updateFilter('budgetRange', filters.budgetRange === item.value ? undefined : item.value)}
                        className={`px-3 py-1.5 text-sm rounded-lg border-2 font-medium transition-all ${filters.budgetRange === item.value
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400'
                          }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Departure Point */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Điểm khởi hành</label>
                  <select
                    value={filters.departurePoint || ''}
                    onChange={e => updateFilter('departurePoint', e.target.value || undefined)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="hanoi">Hà Nội</option>
                    <option value="hochiminh">TP. Hồ Chí Minh</option>
                    <option value="danang">Đà Nẵng</option>
                  </select>
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Điểm đến</label>
                  <select
                    value={filters.destination || ''}
                    onChange={e => updateFilter('destination', e.target.value || undefined)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Tất cả</option>
                    {allDestinations.sort((a: any, b: any) => a.name.localeCompare(b.name)).map((d: any) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày đi</label>
                  <input
                    type="date"
                    value={filters.departureDate || ''}
                    onChange={e => updateFilter('departureDate', e.target.value || undefined)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Tour Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dòng tour</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'premium', label: 'Cao cấp' },
                      { value: 'standard', label: 'Tiêu chuẩn' },
                      { value: 'economical', label: 'Tiết kiệm' },
                      { value: 'good-price', label: 'Giá tốt' },
                    ].map(item => (
                      <button
                        key={item.value}
                        onClick={() => updateFilter('tourType', filters.tourType === item.value ? undefined : item.value)}
                        className={`px-3 py-1.5 text-sm rounded-lg border-2 font-medium transition-all ${filters.tourType === item.value
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400'
                          }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transport */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phương tiện</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'car', label: 'Xe', icon: '🚗' },
                      { value: 'airplane', label: 'Máy bay', icon: '✈️' },
                    ].map(item => (
                      <button
                        key={item.value}
                        onClick={() => updateFilter('transport', filters.transport === item.value ? undefined : item.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border-2 font-medium transition-all ${filters.transport === item.value
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400'
                          }`}
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear */}
                {hasFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border-2 border-red-200 font-medium"
                  >
                    🗑️ Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* View Mode Tabs */}
            <div className="mb-5 bg-white rounded-lg p-1 shadow-sm border inline-flex">
              <button
                onClick={() => setViewMode('destinations')}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  viewMode === 'destinations'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                📍 Điểm đến ({allDestinations.length})
              </button>
              <button
                onClick={() => setViewMode('tours')}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  viewMode === 'tours'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                🎫 Tour ({toursData?.total || 0})
              </button>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-5 bg-white rounded-lg px-4 py-3 shadow-sm border">
              <div>
                {(isLoading || loadingDestinations) ? (
                  <span className="text-gray-500">Đang tìm kiếm...</span>
                ) : error ? (
                  <span className="text-red-500">Có lỗi xảy ra</span>
                ) : (
                  <span className="text-gray-700">
                    Tìm thấy <span className="text-blue-600 font-bold text-lg">{total}</span> {viewMode === 'destinations' ? 'điểm đến' : 'tour'}
                    {filters.search && <span className="text-gray-500"> cho "{filters.search}"</span>}
                  </span>
                )}
              </div>
              <select
                value={filters.sort}
                onChange={e => updateFilter('sort', e.target.value)}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">Mặc định</option>
                {viewMode === 'tours' && (
                  <>
                    <option value="price-asc">Giá thấp → cao</option>
                    <option value="price-desc">Giá cao → thấp</option>
                    <option value="popular">Phổ biến nhất</option>
                  </>
                )}
                {viewMode === 'destinations' && (
                  <>
                    <option value="name-asc">Tên A-Z</option>
                    <option value="name-desc">Tên Z-A</option>
                    <option value="price-asc">Giá thấp → cao</option>
                    <option value="price-desc">Giá cao → thấp</option>
                  </>
                )}
              </select>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'destinations' ? (
              // Destinations View
              loadingDestinations ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
                </div>
              ) : destinations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {destinations.map((d: any) => {
                    const imageUrl = getDestinationImageUrl(d);
                    const hasImage = imageUrl && imageUrl.length > 0;
                    const finalImageUrl = imageUrl && !imageUrl.startsWith('http') ? `${window.location.origin}${imageUrl}` : imageUrl;
                    
                    return (
                      <Link
                        key={d.id}
                        to={`/destinations/${d.slug}`}
                        className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                      >
                        {/* Image */}
                        <div className="relative h-48 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 overflow-hidden">
                          {hasImage && finalImageUrl && (
                            <img
                              src={finalImageUrl}
                              alt={d.name}
                              className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                          {!hasImage && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                              <MapPinIcon className="h-16 w-16 text-white/80" />
                            </div>
                          )}
                          {d.featured && (
                            <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold z-20">
                              ⭐ Nổi bật
                            </div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {d.name}
                          </h3>
                          {d.country && (
                            <p className="text-sm text-gray-500 mb-2">📍 {d.country}</p>
                          )}
                          {d.price && d.price > 0 && (
                            <div className="text-lg font-bold text-blue-600">
                              Từ {new Intl.NumberFormat('vi-VN').format(d.price)} đ
                            </div>
                          )}
                          {d.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{d.description}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl border p-12 text-center">
                  <MapPinIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy điểm đến</h3>
                  <p className="text-gray-500 mb-4">
                    {filters.search ? `Không có kết quả cho "${filters.search}"` : 'Thử điều chỉnh bộ lọc'}
                  </p>
                  <button onClick={clearAllFilters} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                    Xóa bộ lọc
                  </button>
                </div>
              )
            ) : (
              // Tours View
              isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-52 rounded-xl" />)}
                </div>
              ) : tours.length > 0 ? (
                <div className="space-y-4">
                  {tours.map(tour => (
                    <TourCard
                      key={tour.id}
                      tour={tour}
                      liked={isFavorite(tour)}
                      onToggleFavorite={() => toggleFavorite(tour)}
                      searchTerm={filters.search}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border p-12 text-center">
                  <MapPinIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy tour</h3>
                  <p className="text-gray-500 mb-4">
                    {filters.search ? `Không có kết quả cho "${filters.search}"` : 'Thử điều chỉnh bộ lọc'}
                  </p>
                  <button onClick={clearAllFilters} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                    Xóa bộ lọc
                  </button>
                </div>
              )
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                  return (
                    <button
                      key={p}
                      onClick={() => { updateFilter('page', String(p)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`w-10 h-10 rounded-lg font-semibold ${page === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-blue-50'}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// TourCard Component
function TourCard({ tour, liked, onToggleFavorite, searchTerm }: {
  tour: Tour; liked: boolean; onToggleFavorite: () => void; searchTerm?: string;
}) {
  const imageUrl = tour.image || getDestinationImageUrl(tour);
  const finalImageUrl = imageUrl && !imageUrl.startsWith('http') ? `${window.location.origin}${imageUrl}` : imageUrl;
  const price = tour.price || 0;
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(price);

  // Highlight search term
  const highlightName = (name: string) => {
    if (!searchTerm) return name;
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return name.split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
    );
  };

  return (
    <div className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all group">
      <div className="flex">
        {/* Image */}
        <div className="relative w-72 flex-shrink-0">
          <div className="aspect-[4/3] bg-gradient-to-br from-blue-400 to-purple-500">
            {finalImageUrl && (
              <img src={finalImageUrl} alt={tour.name} className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
          </div>
          <button onClick={e => { e.preventDefault(); onToggleFavorite(); }}
            className="absolute top-3 left-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            {liked ? <HeartIconSolid className="h-5 w-5 text-red-500" /> : <HeartIcon className="h-5 w-5 text-gray-400" />}
          </button>
          {price < 5000000 && (
            <div className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">Tiết kiệm</div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <Link to={`/tours/${tour.slug || tour.id}`}>
            <h3 className="text-lg font-bold text-blue-600 hover:text-blue-700 mb-3 line-clamp-2">
              {highlightName(tour.name)}
            </h3>
          </Link>

          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div className="flex items-center gap-2">
              <span>📋</span>
              <span className="text-gray-500">Mã:</span>
              <span className="font-semibold">ND{String(tour.id).padStart(4, '0')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span className="text-gray-500">Khởi hành:</span>
              <span className="font-semibold text-blue-600">{(tour as any).departurePoint || 'Hà Nội'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span className="text-gray-500">Thời gian:</span>
              <span className="font-semibold">{tour.duration || '4N3Đ'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🚗</span>
              <span className="text-gray-500">Phương tiện:</span>
              <span className="font-semibold">{tour.transport || 'Xe'}</span>
            </div>
          </div>

          <div className="flex items-end justify-between mt-auto pt-3 border-t">
            <div>
              <span className="text-sm text-gray-500">Giá từ:</span>
              <div className="text-2xl font-bold text-red-500">{formattedPrice} <span className="text-base">đ</span></div>
            </div>
            <Link to={`/tours/${tour.slug || tour.id}`}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
