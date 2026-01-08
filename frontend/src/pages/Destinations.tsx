import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getDestinationsPaged } from '../services/destination';
import { getToursPaged, Tour } from '../services/tour';
import Skeleton from '../components/Skeleton';
import { getDestinationImageUrl } from '../utils/imageHelper';
import { UserAPI } from '../utils/api';
import { addToWishlist, getUserWishlist, removeFromWishlist } from '../services/wishlist';
import { 
  MapPinIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';

// ============================================
// CONSTANTS - Dễ dàng thay đổi khi cần
// ============================================
const STORAGE_KEYS = {
  WISHLIST: 'travelgo:wishlist',
  AUTH_TOKEN: 'tg_token',
} as const;

const PAGINATION = {
  DEFAULT_PAGE: 1,
  PAGE_SIZE: 10,
  MAX_VISIBLE_PAGES: 5,
} as const;

const BUDGET_OPTIONS = [
  { value: 'under-5', label: 'Dưới 5 triệu', minPrice: undefined, maxPrice: 5_000_000 },
  { value: '5-10', label: '5-10 triệu', minPrice: 5_000_000, maxPrice: 10_000_000 },
  { value: '10-20', label: '10-20 triệu', minPrice: 10_000_000, maxPrice: 20_000_000 },
  { value: 'over-20', label: 'Trên 20 triệu', minPrice: 20_000_000, maxPrice: undefined },
] as const;

const TOUR_TYPE_OPTIONS = [
  { value: 'premium', label: 'Cao cấp' },
  { value: 'standard', label: 'Tiêu chuẩn' },
  { value: 'economical', label: 'Tiết kiệm' },
  { value: 'good-price', label: 'Giá tốt' },
] as const;

const TRANSPORT_OPTIONS = [
  { value: 'car', label: 'Xe', icon: '🚗' },
  { value: 'airplane', label: 'Máy bay', icon: '✈️' },
] as const;

const DEPARTURE_POINTS = [
  { value: 'hanoi', label: 'Hà Nội' },
  { value: 'hochiminh', label: 'TP. Hồ Chí Minh' },
  { value: 'danang', label: 'Đà Nẵng' },
] as const;

// ============================================
// TYPES
// ============================================
type ViewMode = 'destinations' | 'tours';
type SortOption = 'all' | 'price-asc' | 'price-desc' | 'popular' | 'name-asc' | 'name-desc';

interface FilterState {
  searchQuery: string | undefined;
  budgetRange: string | undefined;
  departurePoint: string | undefined;
  destinationName: string | undefined;
  departureDate: string | undefined;
  tourType: string | undefined;
  transportType: string | undefined;
  sortBy: SortOption;
}

interface PriceRange {
  minPrice: number | undefined;
  maxPrice: number | undefined;
}

interface Destination {
  id: number;
  name: string;
  slug: string;
  country?: string;
  price?: number;
  description?: string;
  featured?: boolean;
  image?: string;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN').format(price);
};

const getPriceRangeFromBudget = (budgetValue: string | undefined): PriceRange => {
  const budget = BUDGET_OPTIONS.find(b => b.value === budgetValue);
  return {
    minPrice: budget?.minPrice,
    maxPrice: budget?.maxPrice,
  };
};

const highlightSearchTerm = (text: string, searchTerm: string | undefined) => {
  if (!searchTerm) return text;
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedTerm})`, 'gi');
  return text.split(regex).map((part, index) =>
    regex.test(part) ? <mark key={index} className="bg-yellow-200 px-0.5 rounded">{part}</mark> : part
  );
};

// ============================================
// CUSTOM HOOKS
// ============================================
const useFiltersFromURL = (searchParams: URLSearchParams): FilterState => {
  return useMemo(() => ({
    searchQuery: searchParams.get('q') || searchParams.get('search') || undefined,
    budgetRange: searchParams.get('budgetRange') || undefined,
    departurePoint: searchParams.get('departurePoint') || undefined,
    destinationName: searchParams.get('destination') || undefined,
    departureDate: searchParams.get('departureDate') || undefined,
    tourType: searchParams.get('tourType') || undefined,
    transportType: searchParams.get('transport') || undefined,
    sortBy: (searchParams.get('sort') as SortOption) || 'all',
  }), [searchParams]);
};

const useWishlist = (userId: number | undefined) => {
  const [guestWishlistSlugs, setGuestWishlistSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      if (savedWishlist) {
        setGuestWishlistSlugs(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error('Failed to load guest wishlist:', error);
    }
  }, []);

  const { data: userWishlistItems, refetch: refetchUserWishlist } = useQuery({
    queryKey: ['wishlist', userId],
    queryFn: () => getUserWishlist(userId!),
    enabled: Boolean(userId),
  });

  const userWishlistDestinationIds = useMemo(() => {
    if (!userWishlistItems) return new Set<number>();
    return new Set(userWishlistItems.map(item => item.destinationId));
  }, [userWishlistItems]);

  const isInWishlist = useCallback((tour: Tour): boolean => {
    const destinationId = tour.destinationId || tour.id;
    if (userId) {
      return userWishlistDestinationIds.has(destinationId);
    }
    const tourSlug = tour.slug || String(tour.id);
    return guestWishlistSlugs.includes(tourSlug);
  }, [userId, userWishlistDestinationIds, guestWishlistSlugs]);

  const toggleWishlistItem = useCallback(async (tour: Tour) => {
    const destinationId = tour.destinationId || tour.id;
    
    if (userId) {
      const existingItem = userWishlistItems?.find(item => item.destinationId === destinationId);
      if (existingItem) {
        await removeFromWishlist(existingItem.id);
      } else {
        await addToWishlist(destinationId);
      }
      await refetchUserWishlist();
    } else {
      const tourSlug = tour.slug || String(tour.id);
      const updatedWishlist = guestWishlistSlugs.includes(tourSlug)
        ? guestWishlistSlugs.filter(slug => slug !== tourSlug)
        : [...guestWishlistSlugs, tourSlug];
      
      setGuestWishlistSlugs(updatedWishlist);
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(updatedWishlist));
    }
  }, [userId, userWishlistItems, guestWishlistSlugs, refetchUserWishlist]);

  return { isInWishlist, toggleWishlistItem };
};

// ============================================
// SUB-COMPONENTS
// ============================================

// Filter Button Component
interface FilterButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const FilterButton = ({ isActive, onClick, children, className = '' }: FilterButtonProps) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1.5 text-sm rounded-lg border-2 font-medium transition-all
      ${isActive
        ? 'bg-blue-600 border-blue-600 text-white'
        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400'
      }
      ${className}
    `}
  >
    {children}
  </button>
);

// Destination Card Component
interface DestinationCardProps {
  destination: Destination;
}

const DestinationCard = ({ destination }: DestinationCardProps) => {
  const imageUrl = getDestinationImageUrl(destination);
  const hasValidImage = imageUrl && imageUrl.length > 0;
  const fullImageUrl = imageUrl && !imageUrl.startsWith('http') 
    ? `${window.location.origin}${imageUrl}` 
    : imageUrl;

  return (
    <Link
      to={`/destinations/${destination.slug}`}
      className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-2xl 
                 transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
    >
      {/* Image Container */}
      <div className="relative h-40 sm:h-48 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 overflow-hidden">
        {hasValidImage && fullImageUrl && (
          <img
            src={fullImageUrl}
            alt={destination.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover z-0 
                       group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
        
        {/* Placeholder Icon */}
        {!hasValidImage && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <MapPinIcon className="h-12 w-12 sm:h-16 sm:w-16 text-white/80" />
          </div>
        )}
        
        {/* Featured Badge */}
        {destination.featured && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-yellow-400 text-yellow-900 
                          px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold z-20">
            ⭐ Nổi bật
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 sm:mb-2 line-clamp-2 
                       group-hover:text-blue-600 transition-colors">
          {destination.name}
        </h3>
        
        {destination.country && (
          <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
            📍 {destination.country}
          </p>
        )}
        
        {destination.price && destination.price > 0 && (
          <div className="text-base sm:text-lg font-bold text-blue-600">
            Từ {formatPrice(destination.price)} đ
          </div>
        )}
        
        {destination.description && (
          <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2 hidden sm:block">
            {destination.description}
          </p>
        )}
      </div>
    </Link>
  );
};

// Tour Card Component
interface TourCardProps {
  tour: Tour;
  isLiked: boolean;
  onToggleLike: () => void;
  searchTerm?: string;
}

const TourCard = ({ tour, isLiked, onToggleLike, searchTerm }: TourCardProps) => {
  const imageUrl = tour.image || getDestinationImageUrl(tour);
  const fullImageUrl = imageUrl && !imageUrl.startsWith('http') 
    ? `${window.location.origin}${imageUrl}` 
    : imageUrl;
  
  const tourPrice = tour.price || 0;
  const tourCode = `ND${String(tour.id).padStart(4, '0')}`;
  const departurePoint = (tour as any).departurePoint || 'Hà Nội';
  const duration = tour.duration || '4N3Đ';
  const transport = tour.transport || 'Xe';
  const isEconomical = tourPrice < 5_000_000;

  return (
    <div className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all group">
      {/* Mobile Layout: Stacked */}
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="relative w-full sm:w-48 md:w-56 lg:w-72 flex-shrink-0">
          <div className="aspect-[16/9] sm:aspect-[4/3] bg-gradient-to-br from-blue-400 to-purple-500">
            {fullImageUrl && (
              <img 
                src={fullImageUrl} 
                alt={tour.name} 
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => { 
                  (e.target as HTMLImageElement).style.display = 'none'; 
                }} 
              />
            )}
          </div>
          
          {/* Wishlist Button */}
          <button 
            onClick={(e) => { e.preventDefault(); onToggleLike(); }}
            aria-label={isLiked ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
            className="absolute top-2 left-2 sm:top-3 sm:left-3 w-8 h-8 sm:w-9 sm:h-9 
                       bg-white/90 rounded-full flex items-center justify-center 
                       shadow-lg hover:scale-110 transition-transform"
          >
            {isLiked 
              ? <HeartIconSolid className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" /> 
              : <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            }
          </button>
          
          {/* Economy Badge */}
          {isEconomical && (
            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 
                            bg-green-500 text-white px-2 py-0.5 sm:py-1 
                            rounded text-xs font-bold">
              Tiết kiệm
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col min-w-0">
          {/* Tour Title */}
          <Link to={`/tours/${tour.slug || tour.id}`}>
            <h3 className="text-base sm:text-lg font-bold text-blue-600 hover:text-blue-700 
                           mb-2 sm:mb-3 line-clamp-2">
              {highlightSearchTerm(tour.name, searchTerm)}
            </h3>
          </Link>

          {/* Tour Details Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm mb-2 sm:mb-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="flex-shrink-0">📋</span>
              <span className="text-gray-500 hidden xs:inline">Mã:</span>
              <span className="font-semibold truncate">{tourCode}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="flex-shrink-0">📍</span>
              <span className="text-gray-500 hidden xs:inline">Khởi hành:</span>
              <span className="font-semibold text-blue-600 truncate">{departurePoint}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="flex-shrink-0">📅</span>
              <span className="text-gray-500 hidden xs:inline">Thời gian:</span>
              <span className="font-semibold">{duration}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="flex-shrink-0">🚗</span>
              <span className="text-gray-500 hidden xs:inline">Phương tiện:</span>
              <span className="font-semibold">{transport}</span>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex items-end justify-between mt-auto pt-2 sm:pt-3 border-t">
            <div>
              <span className="text-xs sm:text-sm text-gray-500">Giá từ:</span>
              <div className="text-xl sm:text-2xl font-bold text-red-500">
                {formatPrice(tourPrice)} <span className="text-sm sm:text-base">đ</span>
              </div>
            </div>
            <Link 
              to={`/tours/${tour.slug || tour.id}`}
              className="px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg 
                         font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Xem chi tiết</span>
              <span className="sm:hidden">Chi tiết</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = (): number[] => {
    const maxVisible = PAGINATION.MAX_VISIBLE_PAGES;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 3) {
      return Array.from({ length: maxVisible }, (_, i) => i + 1);
    }
    
    if (currentPage >= totalPages - 2) {
      return Array.from({ length: maxVisible }, (_, i) => totalPages - maxVisible + 1 + i);
    }
    
    return Array.from({ length: maxVisible }, (_, i) => currentPage - 2 + i);
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-6 flex justify-center items-center gap-1 sm:gap-2">
      {/* Previous Button */}
      <button
        onClick={() => currentPage > 1 && handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center
                   bg-white text-gray-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Trang trước"
      >
        <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Page Numbers */}
      {getVisiblePages().map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => handlePageClick(pageNum)}
          className={`
            w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-semibold text-sm sm:text-base
            ${currentPage === pageNum 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-blue-50'
            }
          `}
        >
          {pageNum}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => currentPage < totalPages && handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center
                   bg-white text-gray-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Trang sau"
      >
        <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

// Empty State Component
interface EmptyStateProps {
  searchQuery?: string;
  viewMode: ViewMode;
  onClearFilters: () => void;
}

const EmptyState = ({ searchQuery, viewMode, onClearFilters }: EmptyStateProps) => (
  <div className="bg-white rounded-xl border p-8 sm:p-12 text-center">
    <MapPinIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
      Không tìm thấy {viewMode === 'destinations' ? 'điểm đến' : 'tour'}
    </h3>
    <p className="text-sm sm:text-base text-gray-500 mb-4">
      {searchQuery 
        ? `Không có kết quả cho "${searchQuery}"` 
        : 'Thử điều chỉnh bộ lọc để tìm kết quả phù hợp'
      }
    </p>
    <button 
      onClick={onClearFilters} 
      className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg font-medium 
                 hover:bg-blue-700 text-sm sm:text-base"
    >
      Xóa bộ lọc
    </button>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { i18n } = useTranslation();
  
  // Mobile sidebar toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // View mode state
  const currentViewMode: ViewMode = (searchParams.get('view') as ViewMode) || 'destinations';
  
  // Parse filters from URL
  const filters = useFiltersFromURL(searchParams);
  
  // Local search input state
  const [searchInputValue, setSearchInputValue] = useState(filters.searchQuery || '');
  
  // Sync search input with URL
  useEffect(() => {
    setSearchInputValue(filters.searchQuery || '');
  }, [filters.searchQuery]);

  // Current page
  const currentPage = parseInt(searchParams.get('page') || String(PAGINATION.DEFAULT_PAGE));
  
  // Price range from budget filter
  const priceRange = useMemo(() => getPriceRangeFromBudget(filters.budgetRange), [filters.budgetRange]);

  // Check if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)));
  }, []);

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => (await UserAPI.current()).user,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Wishlist hook
  const { isInWishlist, toggleWishlistItem } = useWishlist(currentUser?.id);

  // Fetch all destinations for dropdown
  const { data: allDestinationsList = [] } = useQuery({
    queryKey: ['destinations', 'all', i18n.language],
    queryFn: async () => {
      const result = await getDestinationsPaged(1, 1000, {});
      return result?.items || [];
    },
  });

  // Fetch destinations list (for destinations view)
  const { 
    data: destinationsResponse, 
    isLoading: isLoadingDestinations 
  } = useQuery({
    queryKey: [
      'destinations', 
      'list', 
      currentPage, 
      PAGINATION.PAGE_SIZE, 
      filters.searchQuery, 
      filters.sortBy, 
      priceRange.minPrice, 
      priceRange.maxPrice, 
      i18n.language
    ],
    queryFn: async () => {
      return await getDestinationsPaged(currentPage, PAGINATION.PAGE_SIZE, {
        q: filters.searchQuery,
        sort: filters.sortBy === 'all' ? 'created-desc' : filters.sortBy,
        minPrice: priceRange.minPrice,
        maxPrice: priceRange.maxPrice,
      });
    },
    enabled: currentViewMode === 'destinations',
  });

  // Build API params for tours
  const tourApiParams = useMemo(() => {
    const destinationId = filters.destinationName
      ? allDestinationsList.find((d: any) => d.name === filters.destinationName)?.id
      : undefined;

    return {
      q: filters.searchQuery,
      destinationId: destinationId ? Number(destinationId) : undefined,
      minPrice: priceRange.minPrice,
      maxPrice: priceRange.maxPrice,
      tag: filters.tourType,
      departureDate: filters.departureDate,
    };
  }, [filters, allDestinationsList, priceRange]);

  // Fetch tours
  const { 
    data: toursResponse, 
    isLoading: isLoadingTours, 
    error: toursError 
  } = useQuery({
    queryKey: ['tours', currentPage, tourApiParams, i18n.language],
    queryFn: () => getToursPaged(currentPage, PAGINATION.PAGE_SIZE, tourApiParams),
    enabled: currentViewMode === 'tours',
  });

  // Sort tours client-side
  const sortedToursList = useMemo(() => {
    const tourItems = toursResponse?.items || [];
    
    switch (filters.sortBy) {
      case 'price-asc':
        return [...tourItems].sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-desc':
        return [...tourItems].sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'popular':
        return [...tourItems].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      default:
        return tourItems;
    }
  }, [toursResponse?.items, filters.sortBy]);

  // Calculate totals
  const totalItems = currentViewMode === 'destinations' 
    ? (destinationsResponse?.total || 0)
    : (toursResponse?.total || 0);
  const totalPages = Math.ceil(totalItems / PAGINATION.PAGE_SIZE);
  
  const destinationsList = destinationsResponse?.items || [];

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    filters.searchQuery || 
    filters.budgetRange || 
    filters.departurePoint ||
    filters.destinationName || 
    filters.departureDate || 
    filters.tourType || 
    filters.transportType
  );

  // ============================================
  // HANDLERS
  // ============================================
  const updateURLFilter = useCallback((filterKey: string, filterValue: string | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (!filterValue) {
      newParams.delete(filterKey);
      if (filterKey === 'q') newParams.delete('search');
    } else {
      newParams.set(filterKey, filterValue);
    }
    
    // Reset to first page when filter changes
    newParams.set('page', '1');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleSearchSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmedQuery = searchInputValue.trim();
    updateURLFilter('q', trimmedQuery || undefined);
    setIsMobileSidebarOpen(false);
  };

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', newMode);
    newParams.set('page', '1');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleClearAllFilters = () => {
    setSearchParams({});
    setSearchInputValue('');
    setIsMobileSidebarOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    updateURLFilter('page', String(newPage));
  };

  // ============================================
  // RENDER
  // ============================================
  const isLoading = currentViewMode === 'destinations' ? isLoadingDestinations : isLoadingTours;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        
        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg 
                     shadow-sm border border-gray-200 text-gray-700 font-medium w-full justify-center"
        >
          <FunnelIcon className="w-5 h-5" />
          <span>Bộ lọc tìm kiếm</span>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
              Đang lọc
            </span>
          )}
        </button>

        <div className="flex gap-4 lg:gap-6">
          {/* ============================================ */}
          {/* SIDEBAR - Desktop & Mobile Overlay */}
          {/* ============================================ */}
          
          {/* Mobile Overlay */}
          {isMobileSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar */}
          <div className={`
            fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
            w-[85vw] max-w-[320px] lg:w-72 flex-shrink-0
            transform transition-transform duration-300 ease-in-out
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="h-full lg:h-auto bg-white border border-gray-200 rounded-none lg:rounded-lg 
                            lg:sticky lg:top-4 shadow-xl lg:shadow-sm overflow-y-auto">
              
              {/* Sidebar Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-800 uppercase">Bộ lọc tìm kiếm</h2>
                <button 
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="lg:hidden p-1 hover:bg-gray-200 rounded"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-5">
                {/* Search Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tìm kiếm
                  </label>
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="text"
                      value={searchInputValue}
                      onChange={(e) => setSearchInputValue(e.target.value)}
                      placeholder="Nhập tên tour, điểm đến..."
                      className="w-full pl-4 pr-16 py-2.5 border-2 border-gray-200 rounded-lg 
                                 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      {searchInputValue && (
                        <button 
                          type="button" 
                          onClick={() => { 
                            setSearchInputValue(''); 
                            updateURLFilter('q', undefined); 
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          aria-label="Xóa tìm kiếm"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        type="submit" 
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        aria-label="Tìm kiếm"
                      >
                        <MagnifyingGlassIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                  
                  {/* Active Search Tag */}
                  {filters.searchQuery && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500">Đang tìm:</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        "{filters.searchQuery}"
                      </span>
                    </div>
                  )}
                </div>

                {/* Budget Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngân sách
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {BUDGET_OPTIONS.map((option) => (
                      <FilterButton
                        key={option.value}
                        isActive={filters.budgetRange === option.value}
                        onClick={() => updateURLFilter(
                          'budgetRange', 
                          filters.budgetRange === option.value ? undefined : option.value
                        )}
                      >
                        {option.label}
                      </FilterButton>
                    ))}
                  </div>
                </div>

                {/* Departure Point Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Điểm khởi hành
                  </label>
                  <select
                    value={filters.departurePoint || ''}
                    onChange={(e) => updateURLFilter('departurePoint', e.target.value || undefined)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm 
                               focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Tất cả</option>
                    {DEPARTURE_POINTS.map((point) => (
                      <option key={point.value} value={point.value}>
                        {point.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Điểm đến
                  </label>
                  <select
                    value={filters.destinationName || ''}
                    onChange={(e) => updateURLFilter('destination', e.target.value || undefined)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm 
                               focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Tất cả</option>
                    {allDestinationsList
                      .sort((a: any, b: any) => a.name.localeCompare(b.name))
                      .map((dest: any) => (
                        <option key={dest.id} value={dest.name}>
                          {dest.name}
                        </option>
                      ))
                    }
                  </select>
                </div>

                {/* Departure Date Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngày đi
                  </label>
                  <input
                    type="date"
                    value={filters.departureDate || ''}
                    onChange={(e) => updateURLFilter('departureDate', e.target.value || undefined)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm 
                               focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Tour Type Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dòng tour
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TOUR_TYPE_OPTIONS.map((option) => (
                      <FilterButton
                        key={option.value}
                        isActive={filters.tourType === option.value}
                        onClick={() => updateURLFilter(
                          'tourType', 
                          filters.tourType === option.value ? undefined : option.value
                        )}
                      >
                        {option.label}
                      </FilterButton>
                    ))}
                  </div>
                </div>

                {/* Transport Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phương tiện
                  </label>
                  <div className="flex gap-2">
                    {TRANSPORT_OPTIONS.map((option) => (
                      <FilterButton
                        key={option.value}
                        isActive={filters.transportType === option.value}
                        onClick={() => updateURLFilter(
                          'transport', 
                          filters.transportType === option.value ? undefined : option.value
                        )}
                        className="flex items-center gap-1.5"
                      >
                        <span>{option.icon}</span>
                        {option.label}
                      </FilterButton>
                    ))}
                  </div>
                </div>

                {/* Clear All Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAllFilters}
                    className="w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 
                               hover:bg-red-50 rounded-lg border-2 border-red-200 font-medium"
                  >
                    🗑️ Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* MAIN CONTENT */}
          {/* ============================================ */}
          <div className="flex-1 min-w-0">
            {/* View Mode Tabs */}
            <div className="mb-4 sm:mb-5 bg-white rounded-lg p-1 shadow-sm border inline-flex">
              <button
                onClick={() => handleViewModeChange('destinations')}
                className={`
                  px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all
                  ${currentViewMode === 'destinations'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }
                `}
              >
                📍 Điểm đến ({allDestinationsList.length})
              </button>
              <button
                onClick={() => handleViewModeChange('tours')}
                className={`
                  px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all
                  ${currentViewMode === 'tours'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }
                `}
              >
                🎫 Tour ({toursResponse?.total || 0})
              </button>
            </div>

            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5 
                            bg-white rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm border">
              <div className="text-sm sm:text-base">
                {isLoading ? (
                  <span className="text-gray-500">Đang tìm kiếm...</span>
                ) : toursError ? (
                  <span className="text-red-500">Có lỗi xảy ra</span>
                ) : (
                  <span className="text-gray-700">
                    Tìm thấy{' '}
                    <span className="text-blue-600 font-bold text-base sm:text-lg">
                      {totalItems}
                    </span>{' '}
                    {currentViewMode === 'destinations' ? 'điểm đến' : 'tour'}
                    {filters.searchQuery && (
                      <span className="text-gray-500"> cho "{filters.searchQuery}"</span>
                    )}
                  </span>
                )}
              </div>
              
              {/* Sort Dropdown */}
              <select
                value={filters.sortBy}
                onChange={(e) => updateURLFilter('sort', e.target.value)}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm 
                           focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="all">Mặc định</option>
                {currentViewMode === 'tours' && (
                  <>
                    <option value="price-asc">Giá thấp → cao</option>
                    <option value="price-desc">Giá cao → thấp</option>
                    <option value="popular">Phổ biến nhất</option>
                  </>
                )}
                {currentViewMode === 'destinations' && (
                  <>
                    <option value="name-asc">Tên A-Z</option>
                    <option value="name-desc">Tên Z-A</option>
                    <option value="price-asc">Giá thấp → cao</option>
                    <option value="price-desc">Giá cao → thấp</option>
                  </>
                )}
              </select>
            </div>

            {/* Content Grid/List */}
            {currentViewMode === 'destinations' ? (
              // Destinations View
              isLoadingDestinations ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-56 sm:h-64 rounded-xl" />
                  ))}
                </div>
              ) : destinationsList.length > 0 ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {destinationsList.map((destination: any) => (
                    <DestinationCard key={destination.id} destination={destination} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  searchQuery={filters.searchQuery} 
                  viewMode={currentViewMode}
                  onClearFilters={handleClearAllFilters} 
                />
              )
            ) : (
              // Tours View
              isLoadingTours ? (
                <div className="space-y-3 sm:space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-40 sm:h-52 rounded-xl" />
                  ))}
                </div>
              ) : sortedToursList.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {sortedToursList.map((tour) => (
                    <TourCard
                      key={tour.id}
                      tour={tour}
                      isLiked={isInWishlist(tour)}
                      onToggleLike={() => toggleWishlistItem(tour)}
                      searchTerm={filters.searchQuery}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  searchQuery={filters.searchQuery} 
                  viewMode={currentViewMode}
                  onClearFilters={handleClearAllFilters} 
                />
              )
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
