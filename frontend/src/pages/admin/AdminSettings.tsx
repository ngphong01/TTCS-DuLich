import { Cog6ToothIcon, ShieldCheckIcon, BellIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
          <p className="text-gray-500 mt-1">Cấu hình hệ thống và tùy chọn quản trị</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl">
          <Cog6ToothIcon className="h-8 w-8 text-gray-600" />
        </div>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bảo mật</h3>
              <p className="text-sm text-gray-500">Cài đặt bảo mật hệ thống</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Quản lý quyền truy cập, xác thực và mã hóa dữ liệu.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <BellIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
              <p className="text-sm text-gray-500">Cài đặt thông báo</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Cấu hình email, SMS và push notifications.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <GlobeAltIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ngôn ngữ & Khu vực</h3>
              <p className="text-sm text-gray-500">Cài đặt ngôn ngữ và múi giờ</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Thiết lập ngôn ngữ hiển thị và múi giờ hệ thống.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Cog6ToothIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Hệ thống</h3>
              <p className="text-sm text-gray-500">Cài đặt hệ thống chung</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Cấu hình các thông số hệ thống và hiệu năng.</p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 text-center border border-gray-200">
        <Cog6ToothIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Tính năng đang phát triển</h3>
        <p className="text-gray-500">Các tính năng cài đặt sẽ được bổ sung trong phiên bản tiếp theo.</p>
      </div>
    </div>
  );
}