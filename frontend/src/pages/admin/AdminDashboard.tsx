import { useAdminSummary } from '../../hooks/useAdmin';
import Skeleton from '../../components/Skeleton';
import { Link } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  StarIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const { data, isLoading } = useAdminSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-gray-500 mt-1">Chào mừng trở lại! Đây là tổng quan về hệ thống của bạn.</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Alerts */}
      {!isLoading && data?.alerts && data.alerts.pendingBookings > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Có {data.alerts.pendingBookings} đơn đặt chỗ đang chờ xác nhận
              </h3>
              <Link to="/admin/bookings?status=PENDING" className="text-sm text-yellow-700 hover:text-yellow-900 underline mt-1">
                Xem ngay →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Cards */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Skeleton className="h-20" />
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Doanh thu"
              value={formatCurrency(data.revenue)}
              icon={CurrencyDollarIcon}
              iconColor="bg-green-500"
              iconBgColor="bg-green-50"
              trend={data.revenue > 0 ? 'up' : 'neutral'}
              subtitle="Tổng doanh thu"
            />
            <StatCard
              title="Đặt chỗ"
              value={data.totalBookings}
              icon={ClipboardDocumentListIcon}
              iconColor="bg-blue-500"
              iconBgColor="bg-blue-50"
              trend={data.totalBookings > 0 ? 'up' : 'neutral'}
              subtitle={`${data.todayBookings || 0} đơn hôm nay`}
            />
            <StatCard
              title="Người dùng"
              value={data.totalUsers}
              icon={UsersIcon}
              iconColor="bg-purple-500"
              iconBgColor="bg-purple-50"
              trend="up"
              subtitle="Tài khoản đăng ký"
            />
            <StatCard
              title="Điểm đến"
              value={data.totalDestinations}
              icon={MapPinIcon}
              iconColor="bg-orange-500"
              iconBgColor="bg-orange-50"
              trend="up"
              subtitle={`${data.featuredDestinations || 0} tour nổi bật`}
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MiniStatCard
              title="Đơn chờ xác nhận"
              value={data.pendingBookings || 0}
              icon={ClockIcon}
              color="text-yellow-600"
              bgColor="bg-yellow-50"
              href="/admin/bookings?status=PENDING"
            />
            <MiniStatCard
              title="Đánh giá mới"
              value={data.recentReviews || 0}
              icon={StarIcon}
              color="text-blue-600"
              bgColor="bg-blue-50"
              subtitle="7 ngày qua"
            />
            <MiniStatCard
              title="Đơn hôm nay"
              value={data.todayBookings || 0}
              icon={CalendarIcon}
              color="text-green-600"
              bgColor="bg-green-50"
            />
          </div>
        </>
      )}

      {/* Recent Pending Bookings */}
      {!isLoading && data?.alerts?.recentBookings && data.alerts.recentBookings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Đơn đặt chỗ mới nhất cần xử lý</h2>
            <Link to="/admin/bookings" className="text-sm text-blue-600 hover:text-blue-700">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-3">
            {data.alerts.recentBookings.map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{booking.destination}</p>
                  <p className="text-xs text-gray-500 mt-1">{booking.user}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickActionCard
          title="Quản lý Tour"
          description="Thêm hoặc chỉnh sửa điểm đến"
          href="/admin/destinations"
          icon={MapPinIcon}
          color="from-blue-500 to-cyan-500"
        />
        <QuickActionCard
          title="Quản lý Đặt chỗ"
          description="Xem và xử lý đơn đặt tour"
          href="/admin/bookings"
          icon={ClipboardDocumentListIcon}
          color="from-purple-500 to-pink-500"
        />
        <QuickActionCard
          title="Quản lý Người dùng"
          description="Xem danh sách người dùng"
          href="/admin/users"
          icon={UsersIcon}
          color="from-orange-500 to-red-500"
        />
        <QuickActionCard
          title="Quản lý Đánh giá"
          description="Xem và duyệt đánh giá"
          href="/admin/reviews"
          icon={StarIcon}
          color="from-green-500 to-emerald-500"
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColor: string;
  iconBgColor: string;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}

function StatCard({ title, value, icon: Icon, iconColor, iconBgColor, trend = 'neutral', subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={`${iconBgColor} p-3 rounded-xl`}>
          <Icon className={`h-8 w-8 ${iconColor.replace('bg-', 'text-')}`} />
        </div>
      </div>
      {trend !== 'neutral' && (
        <div className="mt-4 flex items-center text-xs">
          {trend === 'up' ? (
            <>
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">Tăng trưởng</span>
            </>
          ) : (
            <>
              <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-600 font-medium">Giảm</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

function QuickActionCard({ title, description, href, icon: Icon, color }: QuickActionCardProps) {
  return (
    <Link
      to={href}
      className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white hover:shadow-lg transition-all duration-200 hover:scale-105 block`}
    >
      <Icon className="h-10 w-10 mb-4 opacity-90" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </Link>
  );
}

interface MiniStatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bgColor: string;
  subtitle?: string;
  href?: string;
}

function MiniStatCard({ title, value, icon: Icon, color, bgColor, subtitle, href }: MiniStatCardProps) {
  const content = (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`${bgColor} p-2 rounded-lg`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}