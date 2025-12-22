import { 
  Cog6ToothIcon, 
  ShieldCheckIcon, 
  BellIcon, 
  GlobeAltIcon,
  UserGroupIcon,
  CreditCardIcon,
  ChartBarIcon,
  KeyIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  LanguageIcon,
  ServerIcon,
  CloudIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function AdminSettings() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-gray-500 to-slate-600 p-4 rounded-2xl shadow-lg">
                <Cog6ToothIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-slate-700 bg-clip-text text-transparent">
                  Cài Đặt Hệ Thống
                </h1>
                <p className="text-gray-600 mt-1">Cấu hình và quản lý các tùy chọn hệ thống</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-xl flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Hệ thống hoạt động tốt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl">
                <ServerIcon className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Hoạt động</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">99.9%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl">
                <CloudIcon className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Bình thường</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">2.4 GB</div>
            <div className="text-sm text-gray-600">Bộ nhớ đã dùng</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-xl">
                <UserGroupIcon className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Online</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">142</div>
            <div className="text-sm text-gray-600">Người dùng online</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-3 rounded-xl">
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Cao</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">1.2K</div>
            <div className="text-sm text-gray-600">Requests/phút</div>
          </div>
        </div>

        {/* Main Settings Categories */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
            Danh mục cài đặt
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Security Settings */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <ShieldCheckIcon className="h-8 w-8" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold mb-2">Bảo mật</h3>
                <p className="text-sm text-white/90">Quản lý bảo mật hệ thống</p>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <LockClosedIcon className="h-5 w-5 text-blue-500" />
                  <span>Xác thực hai yếu tố</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <KeyIcon className="h-5 w-5 text-blue-500" />
                  <span>Quản lý API keys</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <UserGroupIcon className="h-5 w-5 text-blue-500" />
                  <span>Phân quyền người dùng</span>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <BellIcon className="h-8 w-8" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold mb-2">Thông báo</h3>
                <p className="text-sm text-white/90">Cấu hình thông báo</p>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <EnvelopeIcon className="h-5 w-5 text-purple-500" />
                  <span>Email notifications</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <DevicePhoneMobileIcon className="h-5 w-5 text-purple-500" />
                  <span>Push notifications</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <BellIcon className="h-5 w-5 text-purple-500" />
                  <span>SMS notifications</span>
                </div>
              </div>
            </div>

            {/* Language & Region */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <GlobeAltIcon className="h-8 w-8" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ngôn ngữ & Khu vực</h3>
                <p className="text-sm text-white/90">Cài đặt địa phương hóa</p>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <LanguageIcon className="h-5 w-5 text-green-500" />
                  <span>Ngôn ngữ hiển thị</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <ClockIcon className="h-5 w-5 text-green-500" />
                  <span>Múi giờ hệ thống</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <GlobeAltIcon className="h-5 w-5 text-green-500" />
                  <span>Định dạng ngày tháng</span>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <ServerIcon className="h-8 w-8" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold mb-2">Hệ thống</h3>
                <p className="text-sm text-white/90">Cấu hình hệ thống</p>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <ServerIcon className="h-5 w-5 text-orange-500" />
                  <span>Thông số server</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <CloudIcon className="h-5 w-5 text-orange-500" />
                  <span>Backup & Storage</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <ChartBarIcon className="h-5 w-5 text-orange-500" />
                  <span>Hiệu năng</span>
                </div>
              </div>
            </div>

            {/* Payment Settings */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <CreditCardIcon className="h-8 w-8" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold mb-2">Thanh toán</h3>
                <p className="text-sm text-white/90">Cấu hình thanh toán</p>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <CreditCardIcon className="h-5 w-5 text-cyan-500" />
                  <span>Cổng thanh toán</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <ShieldCheckIcon className="h-5 w-5 text-cyan-500" />
                  <span>Bảo mật giao dịch</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <ChartBarIcon className="h-5 w-5 text-cyan-500" />
                  <span>Báo cáo tài chính</span>
                </div>
              </div>
            </div>

            {/* Analytics Settings */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <ChartBarIcon className="h-8 w-8" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold mb-2">Phân tích</h3>
                <p className="text-sm text-white/90">Cấu hình analytics</p>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <ChartBarIcon className="h-5 w-5 text-yellow-500" />
                  <span>Google Analytics</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <UserGroupIcon className="h-5 w-5 text-yellow-500" />
                  <span>Theo dõi người dùng</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <ServerIcon className="h-5 w-5 text-yellow-500" />
                  <span>Báo cáo hệ thống</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative p-12 text-center">
            {/* Decorative background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
            </div>

            <div className="relative">
              <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Cog6ToothIcon className="h-10 w-10 text-white animate-spin-slow" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Tính năng đang phát triển</h3>
              <p className="text-white/90 text-lg max-w-2xl mx-auto mb-6">
                Các tính năng cài đặt chi tiết sẽ được bổ sung trong phiên bản tiếp theo. 
                Chúng tôi đang làm việc chăm chỉ để mang đến trải nghiệm tốt nhất!
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                  <div className="text-2xl font-bold text-white">Q2 2024</div>
                  <div className="text-sm text-white/80">Dự kiến ra mắt</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}