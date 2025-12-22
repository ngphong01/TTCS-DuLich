import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Skeleton from '../../components/Skeleton';
import BannerForm from '../../components/admin/BannerForm';
import {
  PhotoIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

type PageResult = { items: any[]; total: number; page: number; pageSize: number };

export default function AdminBanners() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const pageSize = 10;

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PageResult>({
    queryKey: ['admin', 'banners', page, searchTerm, positionFilter],
    queryFn: async () => {
      const token = localStorage.getItem('tg_token');
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(positionFilter && { position: positionFilter }),
      });
      const res = await fetch(`/api/banner/admin?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch banners');
      return res.json();
    },
  });

  const pageCount = data ? Math.ceil(data.total / pageSize) : 0;

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('tg_token');
      const res = await fetch(`/api/banner/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete banner');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Xóa banner thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const token = localStorage.getItem('tg_token');
      const res = await fetch(`/api/banner/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: active }),
      });
      if (!res.ok) throw new Error('Failed to update banner status');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingId(null);
  };

  const editingBanner = editingId ? data?.items.find((b) => b.id === editingId) : null;

  const positions = [
    { value: '', label: 'Tất cả vị trí' },
    { value: 'HOME_HERO', label: 'Home Hero' },
    { value: 'DESTINATION_PAGE', label: 'Trang Điểm Đến' },
    { value: 'TOUR_PAGE', label: 'Trang Tour' },
    { value: 'BLOG_PAGE', label: 'Trang Blog' },
    { value: 'SIDEBAR', label: 'Sidebar' },
  ];

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <PhotoIcon className="h-8 w-8 text-blue-600" />
          Quản lý Banner
        </h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-semibold"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Tạo banner mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Tìm kiếm banner..."
              className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700"
            >
              {positions.map((pos) => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {data?.items.map((banner: any) => {
              const now = new Date();
              const isExpired = banner.endDate && new Date(banner.endDate) < now;
              const isNotStarted = banner.startDate && new Date(banner.startDate) > now;
              const isActive = banner.isActive && !isExpired && !isNotStarted;

              return (
                <div
                  key={banner.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all"
                >
                  {/* Banner Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={banner.imageUrl}
                      alt={banner.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-banner.jpg';
                      }}
                    />
                    {!isActive && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {isExpired ? 'Đã hết hạn' : isNotStarted ? 'Chưa bắt đầu' : 'Đã tắt'}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() =>
                          toggleActiveMutation.mutate({ id: banner.id, active: !banner.isActive })
                        }
                        className={`p-2 rounded-full ${
                          isActive
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}
                        title={isActive ? 'Đang hoạt động' : 'Đã tắt'}
                      >
                        {isActive ? (
                          <EyeIcon className="h-5 w-5" />
                        ) : (
                          <EyeSlashIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Banner Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{banner.name}</h3>
                    {banner.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{banner.description}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      {banner.position && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4" />
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            {banner.position}
                          </span>
                        </div>
                      )}
                      {(banner.startDate || banner.endDate) && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            {banner.startDate
                              ? new Date(banner.startDate).toLocaleDateString('vi-VN')
                              : 'Không giới hạn'}{' '}
                            -{' '}
                            {banner.endDate
                              ? new Date(banner.endDate).toLocaleDateString('vi-VN')
                              : 'Không giới hạn'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(banner.id)}
                        className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Sửa
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Bạn có chắc muốn xóa banner này?')) {
                            deleteMutation.mutate(banner.id);
                          }
                        }}
                        className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Trang {page} / {pageCount}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setPage((p) => (p < pageCount ? p + 1 : p))}
                    disabled={page >= pageCount}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && data && data.items.length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
          <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có banner nào</h3>
          <p className="text-gray-600 mb-6">Tạo banner đầu tiên để bắt đầu</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-semibold"
          >
            Tạo banner mới
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateForm || editingId !== null) && (
        <BannerForm
          banner={editingBanner}
          onClose={handleFormClose}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
            handleFormClose();
          }}
        />
      )}
    </div>
  );
}

