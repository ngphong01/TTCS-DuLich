import { useAdminSummary } from '../../hooks/useAdmin';
import Skeleton from '../../components/Skeleton';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import RevenueInsights from '../../components/admin/RevenueInsights';
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
  ChartBarIcon,
  BellAlertIcon,
  SparklesIcon,
  FireIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [performancePeriod, setPerformancePeriod] = useState<'7days' | '30days' | '3months'>('7days');
  const { data, isLoading } = useAdminSummary(performancePeriod);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 border border-white/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Dashboard Tổng Quan
                </h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base hidden sm:block">Chào mừng trở lại! Theo dõi hiệu suất hệ thống của bạn</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 md:px-6 py-2 md:py-3 rounded-xl border border-blue-200 w-full md:w-auto">
              <div className="flex items-center gap-2 text-blue-700">
                <CalendarIcon className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-xs md:text-sm font-semibold">
                  {new Date().toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {!isLoading && data?.alerts && data.alerts.pendingBookings > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-xl">
                <BellAlertIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-800 mb-1">
                  Cần xử lý ngay!
                </h3>
                <p className="text-yellow-700">
                  Có <span className="font-bold">{data.alerts.pendingBookings}</span> đơn đặt chỗ đang chờ xác nhận
                </p>
              </div>
              <Link 
                to="/admin/bookings?status=PENDING" 
                className="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Xem ngay →
              </Link>
            </div>
          </div>
        )}

        {/* Main Stats Cards */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <Skeleton className="h-32 rounded-xl" />
              </div>
            ))}
          </div>
        )}
        
        {!isLoading && data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard
                title="Doanh thu"
                value={formatCurrency(data.revenue)}
                icon={CurrencyDollarIcon}
                gradient="from-green-500 to-emerald-600"
                trend={data.revenue > 0 ? 'up' : 'neutral'}
                subtitle="Tổng doanh thu"
                percentage="+12.5%"
              />
              <StatCard
                title="Đặt chỗ"
                value={data.totalBookings}
                icon={ClipboardDocumentListIcon}
                gradient="from-blue-500 to-cyan-600"
                trend={data.totalBookings > 0 ? 'up' : 'neutral'}
                subtitle={`${data.todayBookings || 0} đơn hôm nay`}
                percentage="+8.2%"
              />
              <StatCard
                title="Người dùng"
                value={data.totalUsers}
                icon={UsersIcon}
                gradient="from-purple-500 to-pink-600"
                trend="up"
                subtitle="Tài khoản đăng ký"
                percentage="+15.3%"
              />
              <StatCard
                title="Điểm đến"
                value={data.totalDestinations}
                icon={MapPinIcon}
                gradient="from-orange-500 to-red-600"
                trend="up"
                subtitle={`${data.featuredDestinations || 0} tour nổi bật`}
                percentage="+5.1%"
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <MiniStatCard
                title="Đơn chờ xác nhận"
                value={data.pendingBookings || 0}
                icon={ClockIcon}
                gradient="from-yellow-400 to-orange-500"
                href="/admin/bookings?status=PENDING"
              />
              <MiniStatCard
                title="Đánh giá mới"
                value={data.recentReviews || 0}
                icon={StarIcon}
                gradient="from-blue-400 to-indigo-500"
                subtitle="7 ngày qua"
              />
              <MiniStatCard
                title="Đơn hôm nay"
                value={data.todayBookings || 0}
                icon={FireIcon}
                gradient="from-red-400 to-pink-500"
              />
            </div>

            {/* AI Revenue Insights */}
            {!isLoading && data && (
              <RevenueInsights
                revenue={data.revenue}
                growth={12.5}
                bookings={data.totalBookings}
                popularTours={data.featuredDestinations}
                period={performancePeriod}
              />
            )}
          </>
        )}

        {/* Recent Activity & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Pending Bookings */}
          {!isLoading && data?.alerts?.recentBookings && data.alerts.recentBookings.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  Đơn cần xử lý
                </h2>
                <Link to="/admin/bookings" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Xem tất cả →
                </Link>
              </div>
              <div className="space-y-3">
                {data.alerts.recentBookings.map((booking: any) => (
                  <div key={booking.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all border border-gray-200 hover:border-blue-300 hover:shadow-md">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
                        {booking.destination.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{booking.destination}</p>
                        <p className="text-xs text-gray-600 mt-1">{booking.user}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-xs font-semibold text-blue-600 mt-1">
                        Mới
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Chart Placeholder */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <ChartBarIcon className="h-5 w-5 text-green-600" />
                </div>
                Hiệu suất
              </h2>
              <select 
                value={performancePeriod}
                onChange={(e) => setPerformancePeriod(e.target.value as '7days' | '30days' | '3months')}
                className="text-sm border-2 border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                <option value="7days">7 ngày qua</option>
                <option value="30days">30 ngày qua</option>
                <option value="3months">3 tháng qua</option>
              </select>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tỷ lệ hoàn thành</span>
                <span className="text-sm font-bold text-green-600">
                  {data?.performance?.completionRate || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-300" 
                  style={{width: `${data?.performance?.completionRate || 0}%`}}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">Tỷ lệ hủy</span>
                <span className="text-sm font-bold text-red-600">
                  {data?.performance?.cancellationRate || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-red-400 to-pink-500 h-3 rounded-full transition-all duration-300" 
                  style={{width: `${data?.performance?.cancellationRate || 0}%`}}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">Đánh giá trung bình</span>
                <span className="text-sm font-bold text-yellow-600 flex items-center gap-1">
                  <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {data?.performance?.averageRating ? `${data.performance.averageRating}/5` : '0/5'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-300" 
                  style={{width: `${data?.performance?.ratingPercentage || 0}%`}}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Thao tác nhanh</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <QuickActionCard
              title="Quản lý Tour"
              description="Thêm hoặc chỉnh sửa điểm đến"
              href="/admin/destinations"
              icon={MapPinIcon}
              gradient="from-blue-500 to-cyan-500"
            />
            <QuickActionCard
              title="Quản lý Đặt chỗ"
              description="Xem và xử lý đơn đặt tour"
              href="/admin/bookings"
              icon={ClipboardDocumentListIcon}
              gradient="from-purple-500 to-pink-500"
            />
            <QuickActionCard
              title="Quản lý Người dùng"
              description="Xem danh sách người dùng"
              href="/admin/users"
              icon={UsersIcon}
              gradient="from-orange-500 to-red-500"
            />
            <QuickActionCard
              title="Quản lý Đánh giá"
              description="Xem và duyệt đánh giá"
              href="/admin/reviews"
              icon={StarIcon}
              gradient="from-green-500 to-emerald-500"
            />
            <QuickActionCard
              title="Quản lý Mã Giảm Giá"
              description="Tạo và quản lý voucher"
              href="/admin/promo"
              icon={SparklesIcon}
              gradient="from-purple-500 to-pink-500"
            />
            <QuickActionCard
              title="Quản lý Blog"
              description="Viết và quản lý bài viết"
              href="/admin/blogs"
              icon={FireIcon}
              gradient="from-orange-500 to-red-500"
            />
            <QuickActionCard
              title="Quản lý Banner"
              description="Quản lý banner và slider"
              href="/admin/banners"
              icon={PhotoIcon}
              gradient="from-indigo-500 to-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  percentage?: string;
}

function StatCard({ title, value, icon: Icon, gradient, trend = 'neutral', subtitle, percentage }: StatCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl border border-white/20 p-4 md:p-6 hover:shadow-2xl transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs md:text-sm font-semibold text-gray-600 mb-1 md:mb-2 truncate">{title}</p>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 truncate">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
          )}
        </div>
        <div className={`bg-gradient-to-br ${gradient} p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
          <Icon className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
        </div>
      </div>
      {trend !== 'neutral' && percentage && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-xs">
            {trend === 'up' ? (
              <>
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-semibold">{percentage}</span>
              </>
            ) : (
              <>
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-600 font-semibold">{percentage}</span>
              </>
            )}
          </div>
          <span className="text-xs text-gray-500">so với tháng trước</span>
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
  gradient: string;
}

function QuickActionCard({ title, description, href, icon: Icon, gradient }: QuickActionCardProps) {
  return (
    <Link
      to={href}
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105 block relative overflow-hidden group`}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
      </div>
      
      <div className="relative">
        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform">
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-white/90">{description}</p>
      </div>
    </Link>
  );
}

interface MiniStatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  subtitle?: string;
  href?: string;
}

function MiniStatCard({ title, value, icon: Icon, gradient, subtitle, href }: MiniStatCardProps) {
  const content = (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 ${href ? 'cursor-pointer hover:scale-105' : ''} group`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
        </div>
        <div className={`bg-gradient-to-br ${gradient} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="h-7 w-7 text-white" />
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