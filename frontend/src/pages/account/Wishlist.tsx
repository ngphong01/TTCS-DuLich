import { useEffect, useMemo, useState } from "react";
import { Link } from 'react-router-dom';
import { 
  HeartIcon,
  MapPinIcon,
  TrashIcon,
  ShoppingBagIcon,
  EyeIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { DESTINATIONS } from "../../data/destinations";
import AccountSidebar from "../../components/AccountSidebar";

const STORAGE_KEY = "travelgo:wishlist";

type ViewMode = 'grid' | 'list';

export default function WishlistPage() {
  const [ids, setIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'rating'>('name');
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {}
  }, []);

  const items = useMemo(() => {
    const set = new Set(ids);
    let filtered = DESTINATIONS.filter((d) => set.has(d.slug));
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'price-asc': return (a.price || 0) - (b.price || 0);
        case 'price-desc': return (b.price || 0) - (a.price || 0);
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        default: return 0;
      }
    });
    
    return filtered;
  }, [ids, searchQuery, sortBy]);

  const remove = (slug: string) => {
    setRemovingId(slug);
    setTimeout(() => {
      const next = ids.filter((s) => s !== slug);
      setIds(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setRemovingId(null);
      window.dispatchEvent(new Event('wishlist-updated'));
    }, 300);
  };

  const clearAll = () => {
    if (window.confirm(`Xóa tất cả ${items.length} điểm đến?`)) {
      setIds([]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      window.dispatchEvent(new Event('wishlist-updated'));
    }
  };

  const stats = {
    total: items.length,
    countries: new Set(items.map(d => d.country)).size,
    totalValue: items.reduce((sum, d) => sum + (d.price || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <AccountSidebar />
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              <div className="relative bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 px-8 py-10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
                      <HeartIconSolid className="w-9 h-9 text-white drop-shadow-lg" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-black text-white drop-shadow-lg">Yêu thích</h1>
                      <p className="text-white/90 mt-1 text-lg font-medium">Bộ sưu tập của bạn</p>
                    </div>
                  </div>
                  {items.length > 0 && (
                    <div className="hidden sm:block">
                      <div className="px-6 py-3 bg-white/25 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl">
                        <div className="text-center">
                          <div className="text-3xl font-black text-white">{items.length}</div>
                          <div className="text-xs text-white/90 font-semibold uppercase tracking-wider">Điểm đến</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {items.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all">
                  <div className="text-center">
                    <div className="text-3xl font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">{stats.total}</div>
                    <div className="text-sm font-semibold text-gray-600 mt-1">Tổng số</div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all">
                  <div className="text-center">
                    <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.countries}</div>
                    <div className="text-sm font-semibold text-gray-600 mt-1">Quốc gia</div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all">
                  <div className="text-center">
                    <div className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {new Intl.NumberFormat('vi-VN', { 
                        notation: 'compact',
                        maximumFractionDigits: 0
                      }).format(stats.totalValue)}₫
                    </div>
                    <div className="text-sm font-semibold text-gray-600 mt-1">Tổng giá trị</div>
                  </div>
                </div>
              </div>
            )}

            {/* Toolbar */}
            {items.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm điểm đến..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none font-medium"
                    />
                  </div>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none font-semibold cursor-pointer"
                  >
                    <option value="name">Tên A-Z</option>
                    <option value="price-asc">Giá thấp → cao</option>
                    <option value="price-desc">Giá cao → thấp</option>
                    <option value="rating">Đánh giá cao nhất</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-3 rounded-xl transition-all ${
                        viewMode === 'grid'
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Squares2X2Icon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3 rounded-xl transition-all ${
                        viewMode === 'list'
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <ListBulletIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Clear All */}
                  <button
                    onClick={clearAll}
                    className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition-all flex items-center gap-2"
                  >
                    <TrashIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Xóa tất cả</span>
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {items.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-16 border border-white/50 text-center">
                <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
                  <HeartIcon className="w-16 h-16 text-pink-500" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-4">Trống trơn quá!</h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  Hãy khám phá và lưu những điểm đến tuyệt vời để bắt đầu bộ sưu tập của bạn
                </p>
                <Link 
                  to="/destinations" 
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  <MapPinIcon className="w-6 h-6" />
                  Khám phá ngay
                </Link>
              </div>
            ) : (
              <>
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {items.map((d) => (
                      <div 
                        key={d.slug}
                        className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                          removingId === d.slug ? 'opacity-50 scale-95' : ''
                        }`}
                      >
                        {/* Image */}
                        <div className="relative h-56 overflow-hidden">
                          <img 
                            src={d.image} 
                            alt={d.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          
                          {/* Badges */}
                          <div className="absolute top-4 right-4">
                            <div className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center shadow-xl">
                              <HeartIconSolid className="w-6 h-6 text-rose-500" />
                            </div>
                          </div>
                          
                          {d.rating && (
                            <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-2 bg-white/95 rounded-full shadow-xl">
                              <StarIconSolid className="w-5 h-5 text-amber-400" />
                              <span className="font-bold text-gray-900">{d.rating}</span>
                            </div>
                          )}

                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-xl">
                              <p className="font-bold text-gray-900 text-center">{d.country}</p>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h3 className="text-xl font-black text-gray-900 mb-2 line-clamp-1 group-hover:text-pink-600 transition-colors">
                            {d.name}
                          </h3>
                          
                          {d.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {d.description}
                            </p>
                          )}

                          {d.price && (
                            <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
                              <div className="text-center">
                                <div className="text-2xl font-black text-emerald-600">
                                  {new Intl.NumberFormat('vi-VN', { 
                                    style: 'currency', 
                                    currency: 'VND' 
                                  }).format(d.price)}
                                </div>
                                <div className="text-xs font-semibold text-gray-600 mt-1">Giá tour</div>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="grid grid-cols-3 gap-2">
                            <Link 
                              to={`/destinations/${d.slug}`}
                              className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                            >
                              <EyeIcon className="w-5 h-5" />
                              <span>Xem</span>
                            </Link>
                            <button 
                              onClick={() => remove(d.slug)}
                              className="flex items-center justify-center p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                          
                          <Link 
                            to={`/checkout?destination=${d.slug}`}
                            className="mt-2 flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                          >
                            <ShoppingBagIcon className="w-5 h-5" />
                            Đặt ngay
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {items.map((d) => (
                      <div 
                        key={d.slug}
                        className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-all ${
                          removingId === d.slug ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row">
                          {/* Image */}
                          <div className="relative sm:w-64 h-48 sm:h-auto overflow-hidden flex-shrink-0">
                            <img 
                              src={d.image} 
                              alt={d.name}
                              className="w-full h-full object-cover"
                            />
                            {d.rating && (
                              <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-2 bg-white/95 rounded-full shadow-lg">
                                <StarIconSolid className="w-4 h-4 text-amber-400" />
                                <span className="font-bold text-sm">{d.rating}</span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-2xl font-black text-gray-900 mb-1">{d.name}</h3>
                                <p className="text-sm font-semibold text-gray-600">{d.country}</p>
                              </div>
                              {d.price && (
                                <div className="text-right">
                                  <div className="text-2xl font-black text-emerald-600">
                                    {new Intl.NumberFormat('vi-VN', { 
                                      style: 'currency', 
                                      currency: 'VND',
                                      notation: 'compact'
                                    }).format(d.price)}
                                  </div>
                                  <div className="text-xs text-gray-500">Giá tour</div>
                                </div>
                              )}
                            </div>
                            
                            {d.description && (
                              <p className="text-gray-600 mb-4 line-clamp-2">{d.description}</p>
                            )}

                            <div className="flex flex-wrap gap-2">
                              <Link 
                                to={`/destinations/${d.slug}`}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
                              >
                                <EyeIcon className="w-4 h-4" />
                                Chi tiết
                              </Link>
                              <Link 
                                to={`/checkout?destination=${d.slug}`}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all"
                              >
                                <ShoppingBagIcon className="w-4 h-4" />
                                Đặt ngay
                              </Link>
                              <button 
                                onClick={() => remove(d.slug)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg transition-all"
                              >
                                <TrashIcon className="w-4 h-4" />
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}