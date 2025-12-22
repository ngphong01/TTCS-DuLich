import { useQuery, keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Skeleton from '../../components/Skeleton';
import Table from '../../components/Table';
import { getAdminPaymentsPaged, updatePaymentStatus } from '../../services/admin';
import { 
  CreditCardIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  FunnelIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import PaymentInsights from '../../components/admin/PaymentInsights';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

function getStatusBadge(status: string, onClick?: (e?: React.MouseEvent) => void, isDropdown?: boolean) {
  const statusMap: Record<string, { bg: string; text: string; label: string; icon: any }> = {
    SUCCESS: { bg: 'bg-green-50', text: 'text-green-700', label: 'Thành công', icon: CheckCircleIcon },
    PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Đang chờ', icon: ClockIcon },
    FAILED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Thất bại', icon: XCircleIcon },
    REFUNDED: { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Đã hoàn tiền', icon: ArrowPathIcon },
  };
  const statusInfo = statusMap[status] || { bg: 'bg-gray-50', text: 'text-gray-700', label: status, icon: ClockIcon };
  const StatusIcon = statusInfo.icon;
  
  const baseClasses = `inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${statusInfo.bg} ${statusInfo.text} border border-current/20`;
  const clickableClasses = isDropdown ? `${baseClasses} cursor-pointer hover:shadow-md transition-all` : baseClasses;
  
  return (
    <span 
      className={clickableClasses} 
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      <StatusIcon className="h-3.5 w-3.5" />
      {statusInfo.label}
      {isDropdown && <ChevronDownIcon className="h-3 w-3 ml-1" />}
    </span>
  );
}

type PageResult = { items: any[]; total: number; page: number; pageSize: number };

export default function AdminPayments() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.status-dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const { data, isLoading } = useQuery<PageResult>({
    queryKey: ['admin', 'payments', page, sortBy, order],
    queryFn: () => getAdminPaymentsPaged({ page, pageSize, sortBy, order }),
    placeholderData: keepPreviousData,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ paymentId, status }: { paymentId: number; status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' }) =>
      updatePaymentStatus(paymentId, status),
    onSuccess: (data, variables) => {
      const statusLabels: Record<string, string> = {
        PENDING: 'Đang chờ',
        SUCCESS: 'Thành công',
        FAILED: 'Thất bại',
        REFUNDED: 'Đã hoàn tiền',
      };
      if (variables.status === 'SUCCESS') {
        toast.success('Thanh toán đã được xác nhận thành công! Booking đã được cập nhật.');
      } else {
        toast.success(`Đã cập nhật trạng thái thanh toán thành "${statusLabels[variables.status]}"`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      setOpenDropdown(null);
    },
    onError: (error: any) => {
      console.error('Error updating payment status:', error);
      toast.error(error?.response?.data?.message || 'Không thể cập nhật trạng thái. Vui lòng thử lại!');
    },
  });

  const handleStatusChange = (paymentId: number, newStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED') => {
    updateStatusMutation.mutate({ paymentId, status: newStatus });
  };

  const total = data?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  
  // Calculate stats
  const items = data?.items || [];
  const stats = {
    total: total,
    success: items.filter((p: any) => p.status === 'SUCCESS').length || 0,
    pending: items.filter((p: any) => p.status === 'PENDING').length || 0,
    failed: items.filter((p: any) => p.status === 'FAILED').length || 0,
    refunded: items.filter((p: any) => p.status === 'REFUNDED').length || 0,
    totalRevenue: items
      .filter((p: any) => p.status === 'SUCCESS')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0,
    averageAmount: items.length > 0
      ? (items.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) / items.length)
      : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-2xl shadow-lg">
                <CreditCardIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Quản Lý Thanh Toán
                </h1>
                <p className="text-gray-600 mt-1">Theo dõi tất cả giao dịch thanh toán</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2">
                <FunnelIcon className="h-5 w-5" />
                Bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {!isLoading && data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <BanknotesIcon className="h-6 w-6 text-white" />
                </div>
                <ArrowTrendingUpIcon className="h-5 w-5 text-white/80" />
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(stats.totalRevenue)}</div>
              <div className="text-sm text-white/90">Tổng doanh thu</div>
            </div>

            {/* Total Transactions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
              <div className="text-sm text-gray-600">Tổng giao dịch</div>
            </div>

            {/* Success Rate */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.success}</div>
              <div className="text-sm text-gray-600">Thành công</div>
            </div>

            {/* Average Amount */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <CreditCardIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(stats.averageAmount)}</div>
              <div className="text-sm text-gray-600">Trung bình/GD</div>
            </div>
          </div>
        )}

        {/* AI Payment Insights */}
        {!isLoading && data && (
          <PaymentInsights
            payments={data.items}
            totalRevenue={stats.totalRevenue}
            successfulPayments={stats.success}
            failedPayments={stats.failed}
          />
        )}

        {/* Status Filter Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 border border-white/20">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: 'ALL', label: 'Tất cả', count: stats.total, color: 'green' },
              { key: 'SUCCESS', label: 'Thành công', count: stats.success, color: 'green' },
              { key: 'PENDING', label: 'Đang chờ', count: stats.pending, color: 'yellow' },
              { key: 'FAILED', label: 'Thất bại', count: stats.failed, color: 'red' },
              { key: 'REFUNDED', label: 'Hoàn tiền', count: stats.refunded, color: 'gray' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedStatus === tab.key
                    ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg`
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sắp xếp theo</label>
              <select 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Ngày tạo</option>
                <option value="amount">Số tiền</option>
                <option value="status">Trạng thái</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Thứ tự</label>
              <select 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
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
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          </div>
        )}

        {!isLoading && data && (
          <>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Người dùng</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Điểm đến</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Số tiền</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nhà cung cấp</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.items.map((p: any) => (
                      <tr key={p.id} className="hover:bg-green-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-sm text-green-600">#{p.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {p.booking?.user?.avatarUrl ? (
                              <img 
                                src={p.booking.user.avatarUrl} 
                                alt={p.booking?.user?.name || p.booking?.user?.email || 'User'} 
                                className="w-10 h-10 rounded-full object-cover border-2 border-green-200"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`bg-gradient-to-br from-green-500 to-emerald-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${p.booking?.user?.avatarUrl ? 'hidden' : ''}`}
                            >
                              {p.booking?.user?.name?.charAt(0).toUpperCase() || p.booking?.user?.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{p.booking?.user?.name || p.booking?.user?.email || '-'}</div>
                              <div className="text-xs text-gray-500">{p.booking?.user?.email || 'Khách hàng'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <CalendarIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">{p.booking?.destination?.name || '-'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-lg text-green-600">
                            {formatCurrency(p.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative status-dropdown-container">
                            {getStatusBadge(p.status, () => {
                              setOpenDropdown(openDropdown === p.id ? null : p.id);
                            }, true)}
                            {openDropdown === p.id && (
                              <div 
                                className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 min-w-[180px] overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {[
                                  { value: 'PENDING', label: 'Đang chờ', icon: ClockIcon },
                                  { value: 'SUCCESS', label: 'Thành công', icon: CheckCircleIcon },
                                  { value: 'FAILED', label: 'Thất bại', icon: XCircleIcon },
                                  { value: 'REFUNDED', label: 'Đã hoàn tiền', icon: ArrowPathIcon },
                                ].map((statusOption) => {
                                  const OptionIcon = statusOption.icon;
                                  const isSelected = p.status === statusOption.value;
                                  return (
                                    <button
                                      key={statusOption.value}
                                      onClick={() => {
                                        if (!isSelected) {
                                          handleStatusChange(p.id, statusOption.value as any);
                                        }
                                      }}
                                      disabled={isSelected || updateStatusMutation.isPending}
                                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                                        isSelected ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700'
                                      } ${updateStatusMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                      <OptionIcon className="h-4 w-4" />
                                      <span>{statusOption.label}</span>
                                      {isSelected && <CheckCircleIcon className="h-4 w-4 ml-auto" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
                            {p.provider || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4" />
                            {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                          </div>
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
                  Hiển thị <span className="font-bold text-green-600">{(page - 1) * pageSize + 1}</span> đến{' '}
                  <span className="font-bold text-green-600">{Math.min(page * pageSize, total)}</span> trong tổng số{' '}
                  <span className="font-bold text-green-600">{total}</span> giao dịch
                </div>
                <div className="flex gap-2">
                  <button 
                    className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-green-50 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
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
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                              : 'border-2 border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button 
                    className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-green-50 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
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
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCardIcon className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Chưa có giao dịch nào</h3>
            <p className="text-gray-600">Các giao dịch thanh toán sẽ xuất hiện tại đây</p>
          </div>
        )}
      </div>
    </div>
  );
}