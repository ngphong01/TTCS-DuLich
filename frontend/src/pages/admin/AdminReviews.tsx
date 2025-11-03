import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useState } from 'react';
import Skeleton from '../../components/Skeleton';
import Table from '../../components/Table';
import { getAdminReviewsPaged } from '../../services/admin';
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-gray-700">{rating}/5</span>
    </div>
  );
}

type PageResult = { items: any[]; total: number; page: number; pageSize: number };

export default function AdminReviews() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = useQuery<PageResult>({
    queryKey: ['admin', 'reviews', page, sortBy, order],
    queryFn: () => getAdminReviewsPaged({ page, pageSize, sortBy, order }),
    placeholderData: keepPreviousData,
  });

  const total = data?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Đánh giá</h1>
          <p className="text-gray-500 mt-1">Quản lý tất cả đánh giá từ người dùng</p>
        </div>
        <div className="p-3 bg-orange-50 rounded-xl">
          <StarIcon className="h-8 w-8 text-orange-600" />
        </div>
      </div>

      {/* Stats */}
      {!isLoading && data && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Tổng số đánh giá</p>
          <p className="text-4xl font-bold">{total}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sắp xếp theo</label>
            <select 
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Ngày tạo</option>
              <option value="rating">Điểm đánh giá</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Thứ tự</label>
            <select 
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </div>
      )}

      {!isLoading && data && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <Table headers={['ID', 'Người dùng', 'Điểm đến', 'Điểm', 'Bình luận', 'Ngày tạo']}>
              {data.items.map((r: any) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.user?.email || r.user?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.destination?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <RatingStars rating={r.rating} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                    <p className="truncate">{r.comment || '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
            <div className="text-sm text-gray-700">
              Trang <span className="font-semibold">{page}</span> / <span className="font-semibold">{pageCount}</span>
            </div>
            <div className="flex gap-2">
              <button 
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                onClick={() => setPage((p) => Math.max(1, p - 1))} 
                disabled={page === 1}
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Trước
              </button>
              <button 
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                onClick={() => setPage((p) => (p < pageCount ? p + 1 : p))} 
                disabled={page >= pageCount}
              >
                Sau
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {!isLoading && data && data.items.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có đánh giá nào</p>
        </div>
      )}
    </div>
  );
}