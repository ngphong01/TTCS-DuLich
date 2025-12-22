import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarDaysIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import AccountSidebar from "../../components/AccountSidebar";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('tg_token');
    fetch('/api/booking', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
        setBookings(list);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      confirmed: { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-800', 
        icon: CheckCircleIcon,
        label: 'Đã xác nhận'
      },
      pending: { 
        bg: 'bg-amber-100', 
        text: 'text-amber-800', 
        icon: ClockIcon,
        label: 'Đang chờ'
      },
      cancelled: { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        icon: XCircleIcon,
        label: 'Đã hủy'
      },
    };
    return configs[status] || { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800', 
      icon: ExclamationCircleIcon,
      label: status 
    };
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = !searchTerm || 
      booking.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.destination?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.destinationId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
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
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <CalendarDaysIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Lịch sử đặt chỗ</h1>
                    <p className="text-white/90 mt-1">Quản lý và theo dõi các đặt chỗ của bạn</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tổng số</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <CalendarDaysIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Đã xác nhận</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.confirmed}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Đang chờ</p>
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
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Đã hủy</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">{stats.cancelled}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <XCircleIcon className="w-6 h-6 text-red-600" />
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
                    placeholder="Tìm kiếm theo mã đặt chỗ hoặc điểm đến..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      filter === 'all'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setFilter('confirmed')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      filter === 'confirmed'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Đã xác nhận
                  </button>
                  <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      filter === 'pending'
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Đang chờ
                  </button>
                  <button
                    onClick={() => setFilter('cancelled')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      filter === 'cancelled'
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Đã hủy
                  </button>
                </div>
              </div>
          </div>

            {/* Bookings List */}
            {(!Array.isArray(bookings) || bookings.length === 0) ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CalendarDaysIcon className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có đặt chỗ nào</h3>
                <p className="text-gray-600 mb-6">Bắt đầu khám phá và đặt chỗ tại các điểm đến tuyệt vời</p>
                <Link 
                  to="/destinations" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <MapPinIcon className="w-5 h-5" />
                  Khám phá điểm đến
              </Link>
            </div>
            ) : filteredBookings.length === 0 ? (
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
                  <ArrowPathIcon className="w-5 h-5" />
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
                          Mã đặt chỗ
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Điểm đến
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Ngày đặt
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Thao tác
                        </th>
                  </tr>
                </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredBookings.map((booking: any) => {
                        const statusConfig = getStatusConfig(booking.status);
                        const StatusIcon = statusConfig.icon;
                        
                        return (
                          <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                  <CalendarDaysIcon className="w-4 h-4 text-indigo-600" />
                                </div>
                                <span className="font-mono text-sm font-semibold text-gray-900">
                                  #{booking.id}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <MapPinIcon className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900">
                                  {booking.destinationId || booking.destination?.name || '-'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusConfig.label}
                        </span>
                      </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                {booking.date ? new Date(booking.date).toLocaleDateString('vi-VN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <Link
                                  to={`/bookings/${booking.id}`}
                                  className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm hover:underline"
                                >
                                  Chi tiết →
                                </Link>
                                <button
                                  onClick={async () => {
                                    try {
                                      const token = localStorage.getItem('tg_token');
                                      const response = await fetch(`/api/invoice/${booking.id}`, {
                                        headers: { Authorization: `Bearer ${token}` },
                                      });
                                      if (!response.ok) throw new Error('Failed to generate invoice');
                                      const blob = await response.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `invoice-${booking.code}.pdf`;
                                      document.body.appendChild(a);
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                      document.body.removeChild(a);
                                    } catch (error) {
                                      alert('Lỗi tải hóa đơn');
                                    }
                                  }}
                                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Tải hóa đơn PDF"
                                >
                                  <DocumentArrowDownIcon className="h-5 w-5" />
                                </button>
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
                  {filteredBookings.map((booking: any) => {
                    const statusConfig = getStatusConfig(booking.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                              <CalendarDaysIcon className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-mono text-xs text-gray-500">Mã đặt chỗ</p>
                              <p className="font-semibold text-gray-900">#{booking.id}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 font-medium">
                              {booking.destinationId || booking.destination?.name || '-'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              {booking.date ? new Date(booking.date).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex gap-2">
                          <Link
                            to={`/bookings/${booking.id}`}
                            className="flex-1 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold py-2 px-4 rounded-lg transition-colors"
                          >
                            Chi tiết →
                          </Link>
                          <button
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('tg_token');
                                const response = await fetch(`/api/invoice/${booking.id}`, {
                                  headers: { Authorization: `Bearer ${token}` },
                                });
                                if (!response.ok) throw new Error('Failed to generate invoice');
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `invoice-${booking.code}.pdf`;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                              } catch (error) {
                                alert('Lỗi tải hóa đơn');
                              }
                            }}
                            className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 font-semibold rounded-lg transition-colors flex items-center gap-2"
                            title="Tải hóa đơn PDF"
                          >
                            <DocumentArrowDownIcon className="h-5 w-5" />
                            PDF
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Results Count */}
            {filteredBookings.length > 0 && (
              <div className="text-center text-sm text-gray-600">
                Hiển thị <span className="font-semibold text-gray-900">{filteredBookings.length}</span> trong tổng số <span className="font-semibold text-gray-900">{bookings.length}</span> đặt chỗ
            </div>
          )}
        </div>
      </div>
    </main>
    </div>
  );
}
