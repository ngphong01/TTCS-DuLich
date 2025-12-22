import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useState } from 'react';
import Skeleton from '../../components/Skeleton';
import Table from '../../components/Table';
import { getAdminReviewsPaged } from '../../services/admin';
import { 
  StarIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  CalendarIcon,
  FunnelIcon,
  ChartBarIcon,
  HandThumbUpIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import ReviewAnalysis from '../../components/admin/ReviewAnalysis';

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-5 w-5 ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-bold text-gray-900">{rating.toFixed(1)}</span>
    </div>
  );
}

type PageResult = { items: any[]; total: number; page: number; pageSize: number };

export default function AdminReviews() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRating, setSelectedRating] = useState<number | 'ALL'>('ALL');
  const [minRating, setMinRating] = useState<number | ''>('');

  const { data, isLoading } = useQuery<PageResult>({
    queryKey: ['admin', 'reviews', page, sortBy, order],
    queryFn: () => getAdminReviewsPaged({ page, pageSize, sortBy, order }),
    placeholderData: keepPreviousData,
  });

  const total = data?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // Calculate stats
  const items = data?.items || [];
  const stats = {
    total: total,
    averageRating: items.length > 0
      ? (items.reduce((sum: number, r: any) => sum + r.rating, 0) / items.length)
      : 0,
    rating5: items.filter((r: any) => r.rating === 5).length || 0,
    rating4: items.filter((r: any) => r.rating === 4).length || 0,
    rating3: items.filter((r: any) => r.rating === 3).length || 0,
    rating2: items.filter((r: any) => r.rating === 2).length || 0,
    rating1: items.filter((r: any) => r.rating === 1).length || 0,
    withComments: items.filter((r: any) => r.comment && r.comment.trim()).length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-2xl shadow-lg">
                <StarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Quản Lý Đánh Giá
                </h1>
                <p className="text-gray-600 mt-1">Theo dõi và quản lý đánh giá từ khách hàng</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2">
                <FunnelIcon className="h-5 w-5" />
                Bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {!isLoading && data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Reviews */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
              <div className="text-sm text-gray-600">Tổng đánh giá</div>
            </div>

            {/* Average Rating */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-xl p-6 text-white hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <StarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</div>
                <StarIcon className="h-6 w-6 fill-white" />
              </div>
              <div className="text-sm text-white/90">Điểm trung bình</div>
            </div>

            {/* 5 Star Reviews */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <HandThumbUpIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.rating5}</div>
              <div className="text-sm text-gray-600">5 sao xuất sắc</div>
            </div>

            {/* With Comments */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.withComments}</div>
              <div className="text-sm text-gray-600">Có bình luận</div>
            </div>
          </div>
        )}

        {/* Rating Distribution */}
        {!isLoading && data && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ChartBarIcon className="h-6 w-6 text-orange-500" />
              Phân bố đánh giá
            </h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats[`rating${rating}` as keyof typeof stats] as number;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-semibold text-gray-700">{rating}</span>
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm font-semibold text-gray-700">{count}</span>
                      <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Review Analysis */}
        {!isLoading && data && (
          <ReviewAnalysis
            reviews={data.items}
            averageRating={stats.averageRating}
            totalReviews={stats.total}
          />
        )}

        {/* Rating Filter Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 border border-white/20">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: 'ALL', label: 'Tất cả', count: stats.total },
              { key: 5, label: '5 sao', count: stats.rating5 },
              { key: 4, label: '4 sao', count: stats.rating4 },
              { key: 3, label: '3 sao', count: stats.rating3 },
              { key: 2, label: '2 sao', count: stats.rating2 },
              { key: 1, label: '1 sao', count: stats.rating1 },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedRating(tab.key === 'ALL' ? 'ALL' : Number(tab.key))}
                className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  (tab.key === 'ALL' && selectedRating === 'ALL') || (tab.key !== 'ALL' && selectedRating === tab.key)
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="text-sm">{tab.label}</div>
                <div className="text-lg font-bold mt-1">{tab.count}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <StarIcon className="h-4 w-4 text-yellow-500" />
                Đánh giá tối thiểu
              </label>
              <select 
                className="w-full border-2 border-blue-500 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-medium"
                value={minRating === '' ? '' : minRating}
                onChange={(e) => setMinRating(e.target.value === '' ? '' : parseFloat(e.target.value))}
              >
                <option value="">Tất cả đánh giá</option>
                <option value="4">⭐ 4 sao trở lên</option>
                <option value="4.5">⭐⭐ 4.5 sao trở lên</option>
                <option value="5">⭐⭐⭐ 5 sao</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sắp xếp theo</label>
              <select 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Ngày tạo</option>
                <option value="rating">Điểm đánh giá</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Thứ tự</label>
              <select 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                value={order} 
                onChange={(e) => setOrder(e.target.value as any)}
              >
                <option value="desc">Giảm dần</option>
                <option value="asc">Tăng dần</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          </div>
        )}

        {!isLoading && data && (
          <>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-50 to-red-50 border-b-2 border-orange-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Người dùng</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Điểm đến</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Đánh giá</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Bình luận</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ngày tạo</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.items
                      .filter((r: any) => {
                        // Filter by minimum rating if set
                        if (minRating !== '' && typeof minRating === 'number') {
                          return r.rating >= minRating;
                        }
                        // Filter by exact rating if selected
                        if (selectedRating !== 'ALL' && typeof selectedRating === 'number') {
                          return r.rating === selectedRating;
                        }
                        return true;
                      })
                      .map((r: any) => (
                      <tr key={r.id} className="hover:bg-orange-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-sm text-orange-600">#{r.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-orange-500 to-red-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
                              {(r.user?.email || r.user?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{r.user?.email || r.user?.name || '-'}</div>
                              <div className="text-xs text-gray-500">Khách hàng</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{r.destination?.name || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <RatingStars rating={r.rating} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            {r.comment ? (
                              <p className="text-sm text-gray-700 line-clamp-2">{r.comment}</p>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Không có bình luận</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4" />
                            {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button className="bg-orange-100 text-orange-700 hover:bg-orange-200 p-2 rounded-lg transition-colors">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 px-6 py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-bold text-orange-600">{(page - 1) * pageSize + 1}</span> đến{' '}
                  <span className="font-bold text-orange-600">{Math.min(page * pageSize, total)}</span> trong tổng số{' '}
                  <span className="font-bold text-orange-600">{total}</span> đánh giá
                </div>
                <div className="flex gap-2">
                  <button 
                    className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-orange-50 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
                    onClick={() => setPage((p) => Math.max(1, p - 1))} 
                    disabled={page === 1}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Trước
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                      let pageNum: number;
                      if (pageCount <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= pageCount - 2) {
                        pageNum = pageCount - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                              : 'border-2 border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button 
                    className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-orange-50 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
                    onClick={() => setPage((p) => (p < pageCount ? p + 1 : p))} 
                    disabled={page >= pageCount}
                  >
                    Sau
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && data && data.items.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="bg-gradient-to-br from-orange-100 to-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <StarIcon className="h-12 w-12 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Chưa có đánh giá nào</h3>
            <p className="text-gray-600">Các đánh giá từ khách hàng sẽ xuất hiện tại đây</p>
          </div>
        )}
      </div>
    </div>
  );
}