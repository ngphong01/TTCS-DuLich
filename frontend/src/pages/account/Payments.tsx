import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BanknotesIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import AccountSidebar from "../../components/AccountSidebar";
import { PaymentAPI, UserAPI } from '../../utils/api';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const current = await UserAPI.current();
        const userId = (current as any)?.user?.id;
        if (userId) {
          const data = await PaymentAPI.byUser(userId).catch(() => [] as any[]);
          if (!cancelled) setPayments(Array.isArray(data) ? data : []);
        } else {
          if (!cancelled) setPayments([]);
        }
      } catch {
        if (!cancelled) setPayments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    window.addEventListener('payment-created', onFocus as any);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('payment-created', onFocus as any);
    };
  }, []);

  const getStatusConfig = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    const configs: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      success: { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-800', 
        icon: CheckCircleIcon,
        label: 'Thành công'
      },
      completed: { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-800', 
        icon: CheckCircleIcon,
        label: 'Hoàn tất'
      },
      pending: { 
        bg: 'bg-amber-100', 
        text: 'text-amber-800', 
        icon: ClockIcon,
        label: 'Đang xử lý'
      },
      failed: { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        icon: XCircleIcon,
        label: 'Thất bại'
      },
    };
    return configs[normalizedStatus] || { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800', 
      icon: ClockIcon,
      label: status || 'Không rõ' 
    };
  };

  const getMethodIcon = (method: string) => {
    const normalized = method?.toLowerCase();
    if (normalized?.includes('card') || normalized?.includes('credit')) return CreditCardIcon;
    if (normalized?.includes('bank') || normalized?.includes('transfer')) return BanknotesIcon;
    return CreditCardIcon;
  };

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status?.toLowerCase() === filter;
    const matchesSearch = !searchTerm || 
      payment.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.method?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: payments.length,
    success: payments.filter(p => ['success', 'completed'].includes(p.status?.toLowerCase())).length,
    pending: payments.filter(p => p.status?.toLowerCase() === 'pending').length,
    failed: payments.filter(p => p.status?.toLowerCase() === 'failed').length,
    totalAmount: payments
      .filter(p => ['success', 'completed'].includes(p.status?.toLowerCase()))
      .reduce((sum, p) => sum + (p.amount || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 hidden lg:block">
            <AccountSidebar />
          </div>
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600"></div>
                  <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
              </div>
            </div>
          </div>
        </main>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
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
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <CreditCardIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Lịch sử thanh toán</h1>
                    <p className="text-white/90 mt-1">Quản lý và theo dõi các giao dịch của bạn</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tổng giao dịch</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <CreditCardIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Thành công</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.success}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Đang xử lý</p>
                    <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tổng chi tiêu</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND',
                        notation: 'compact',
                        maximumFractionDigits: 1
                      }).format(stats.totalAmount)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo mã giao dịch hoặc phương thức..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                      filter === 'all'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setFilter('success')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                      filter === 'success'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Thành công
                  </button>
                  <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                      filter === 'pending'
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Đang xử lý
                  </button>
                  <button
                    onClick={() => setFilter('failed')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                      filter === 'failed'
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Thất bại
                  </button>
                </div>
              </div>
            </div>

            {/* Payments List */}
            {payments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CreditCardIcon className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có giao dịch nào</h3>
                <p className="text-gray-600 mb-6">Bạn chưa thực hiện giao dịch thanh toán nào</p>
                <Link 
                  to="/destinations" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Khám phá điểm đến
                </Link>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MagnifyingGlassIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy kết quả</h3>
                <p className="text-gray-600 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <button
                  onClick={() => {
                    setFilter('all');
                    setSearchTerm('');
                  }}
                  className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Đặt lại bộ lọc
                </button>
            </div>
          ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Mã giao dịch
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Phương thức
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Số tiền
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Ngày
                        </th>
                  </tr>
                </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPayments.map((payment: any) => {
                        const statusConfig = getStatusConfig(payment.status);
                        const StatusIcon = statusConfig.icon;
                        const MethodIcon = getMethodIcon(payment.method);
                        
                        return (
                          <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                  <CreditCardIcon className="w-4 h-4 text-indigo-600" />
                                </div>
                                <span className="font-mono text-sm font-semibold text-gray-900">
                                  #{payment.id}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <MethodIcon className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900 capitalize">
                                  {payment.method || '-'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-bold text-gray-900">
                                {payment.amount 
                                  ? new Intl.NumberFormat('vi-VN', { 
                                      style: 'currency', 
                                      currency: 'VND' 
                                    }).format(payment.amount) 
                                  : '-'}
                              </span>
                      </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusConfig.label}
                        </span>
                      </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                {payment.createdAt 
                                  ? new Date(payment.createdAt).toLocaleDateString('vi-VN', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : '-'}
                              </div>
                            </td>
                    </tr>
                        );
                      })}
                </tbody>
              </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-200">
                  {filteredPayments.map((payment: any) => {
                    const statusConfig = getStatusConfig(payment.status);
                    const StatusIcon = statusConfig.icon;
                    const MethodIcon = getMethodIcon(payment.method);
                    
                    return (
                      <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                              <CreditCardIcon className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-mono text-xs text-gray-500">Mã giao dịch</p>
                              <p className="font-semibold text-gray-900">#{payment.id}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MethodIcon className="w-4 h-4 text-gray-400" />
                              <span className="capitalize">{payment.method || '-'}</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">
                              {payment.amount 
                                ? new Intl.NumberFormat('vi-VN', { 
                                    style: 'currency', 
                                    currency: 'VND',
                                    notation: 'compact',
                                    maximumFractionDigits: 1
                                  }).format(payment.amount) 
                                : '-'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span>
                              {payment.createdAt 
                                ? new Date(payment.createdAt).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                : '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Results Count */}
            {filteredPayments.length > 0 && (
              <div className="text-center text-sm text-gray-600">
                Hiển thị <span className="font-semibold text-gray-900">{filteredPayments.length}</span> trong tổng số <span className="font-semibold text-gray-900">{payments.length}</span> giao dịch
            </div>
          )}
        </div>
      </div>
    </main>
    </div>
  );
}