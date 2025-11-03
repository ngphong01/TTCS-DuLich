import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useState } from 'react';
import Skeleton from '../../components/Skeleton';
import Table from '../../components/Table';
import { getAdminPaymentsPaged } from '../../services/admin';
import { CreditCardIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

function getStatusBadge(status: string) {
  const statusMap: Record<string, { bg: string; text: string; label: string }> = {
    SUCCESS: { bg: 'bg-green-100', text: 'text-green-700', label: 'Thành công' },
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Đang chờ' },
    FAILED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Thất bại' },
    REFUNDED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Đã hoàn tiền' },
  };
  const statusInfo = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
      {statusInfo.label}
    </span>
  );
}

type PageResult = { items: any[]; total: number; page: number; pageSize: number };

export default function AdminPayments() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = useQuery<PageResult>({
    queryKey: ['admin', 'payments', page, sortBy, order],
    queryFn: () => getAdminPaymentsPaged({ page, pageSize, sortBy, order }),
    placeholderData: keepPreviousData,
  });

  const total = data?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  
  // Calculate total revenue
  const totalRevenue = data?.items
    ?.filter((p: any) => p.status === 'SUCCESS')
    ?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-500 mt-1">Quản lý tất cả giao dịch thanh toán</p>
        </div>
        <div className="p-3 bg-green-50 rounded-xl">
          <CreditCardIcon className="h-8 w-8 text-green-600" />
        </div>
      </div>

      {/* Stats */}
      {!isLoading && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Tổng số giao dịch</p>
            <p className="text-4xl font-bold">{total}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Tổng doanh thu</p>
            <p className="text-4xl font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sắp xếp theo</label>
            <select 
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Ngày tạo</option>
              <option value="amount">Số tiền</option>
              <option value="status">Trạng thái</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Thứ tự</label>
            <select 
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
            <Table headers={['ID', 'Người dùng', 'Điểm đến', 'Số tiền', 'Trạng thái', 'Nhà cung cấp', 'Ngày tạo']}>
              {data.items.map((p: any) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{p.booking?.user?.email || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{p.booking?.destination?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(p.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{p.provider || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString('vi-VN')}
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
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có giao dịch nào</p>
        </div>
      )}
    </div>
  );
}