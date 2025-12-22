import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Skeleton from '../../components/Skeleton';
import Table from '../../components/Table';
import PromoCodeForm from '../../components/admin/PromoCodeForm';
import {
  TicketIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

type PageResult = { items: any[]; total: number; page: number; pageSize: number };

export default function AdminPromoCodes() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const pageSize = 10;

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PageResult>({
    queryKey: ['admin', 'promo', page, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
      });
      const token = localStorage.getItem('tg_token');
      const res = await fetch(`/api/promo/admin?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('tg_token');
      const res = await fetch(`/api/promo/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Xóa mã giảm giá thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'promo'] });
    },
    onError: () => {
      toast.error('Không thể xóa mã giảm giá');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const token = localStorage.getItem('tg_token');
      const res = await fetch(`/api/promo/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'promo'] });
    },
    onError: () => {
      toast.error('Không thể cập nhật trạng thái');
    },
  });

  const total = data?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
                <TicketIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Quản Lý Mã Giảm Giá
                </h1>
                <p className="text-gray-600 mt-1">Quản lý voucher và mã khuyến mãi</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Tạo mã giảm giá
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <input
            type="text"
            placeholder="Tìm kiếm mã giảm giá..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Table */}
        {isLoading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {!isLoading && data && (
          <>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Mã</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Mô tả</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Giảm giá</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Hạn sử dụng</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Đã dùng</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.items.map((promo: any) => {
                      const now = new Date();
                      const validFrom = new Date(promo.validFrom);
                      const validUntil = new Date(promo.validUntil);
                      const isExpired = now > validUntil;
                      const isNotStarted = now < validFrom;
                      const isActive = promo.active && !isExpired && !isNotStarted;

                      return (
                        <tr key={promo.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-blue-600">{promo.code}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">{promo.description || '-'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {promo.discountType === 'PERCENTAGE' ? (
                                <span className="font-semibold text-green-600">
                                  {promo.discountValue}%
                                  {promo.maxDiscount && ` (tối đa ${promo.maxDiscount.toLocaleString('vi-VN')} VNĐ)`}
                                </span>
                              ) : (
                                <span className="font-semibold text-green-600">
                                  {promo.discountValue.toLocaleString('vi-VN')} VNĐ
                                </span>
                              )}
                            </div>
                            {promo.minAmount > 0 && (
                              <div className="text-xs text-gray-500">
                                Đơn tối thiểu: {promo.minAmount.toLocaleString('vi-VN')} VNĐ
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                {new Date(promo.validFrom).toLocaleDateString('vi-VN')} -{' '}
                                {new Date(promo.validUntil).toLocaleDateString('vi-VN')}
                              </div>
                              {isExpired && (
                                <span className="text-xs text-red-600 font-semibold">(Đã hết hạn)</span>
                              )}
                              {isNotStarted && (
                                <span className="text-xs text-yellow-600 font-semibold">(Chưa bắt đầu)</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">
                              {promo.usedCount || 0} / {promo.usageLimit || '∞'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                toggleActiveMutation.mutate({ id: promo.id, active: !promo.active })
                              }
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                isActive
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {isActive ? 'Hoạt động' : 'Tạm khóa'}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingId(promo.id)}
                                className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                                title="Chỉnh sửa"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Bạn có chắc muốn xóa mã giảm giá này?')) {
                                    deleteMutation.mutate(promo.id);
                                  }
                                }}
                                className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                                title="Xóa"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
            <TicketIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có mã giảm giá nào</h3>
            <p className="text-gray-600 mb-6">Tạo mã giảm giá đầu tiên để bắt đầu</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-semibold"
            >
              Tạo mã giảm giá
            </button>
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {(showCreateForm || editingId !== null) && (
          <PromoCodeForm
            promoCode={editingId ? data?.items.find((p: any) => p.id === editingId) : undefined}
            onClose={() => {
              setShowCreateForm(false);
              setEditingId(null);
            }}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['admin', 'promo'] });
              setShowCreateForm(false);
              setEditingId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

