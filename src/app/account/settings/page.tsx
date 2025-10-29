"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
  loginTime: string;
}

interface UserResponse {
  authenticated: boolean;
  user: User | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user info
  const fetchUserInfo = async () => {
    try {
      console.log('🔍 Settings: Fetching user info...');
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Settings: Response status:', response.status);
      const data: UserResponse = await response.json();
      console.log('📊 Settings: User data:', data);

      if (data.authenticated && data.user) {
        setUser(data.user);
        console.log('✅ Settings: User authenticated:', data.user.name);
      } else {
        setUser(null);
        console.log('❌ Settings: User not authenticated');
      }
    } catch (error) {
      console.error('💥 Settings: Error fetching user info:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/signin");
    }
  }, [mounted, loading, user, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Chưa đăng nhập</h1>
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập để truy cập cài đặt</p>
          <Link href="/api/auth/oauth/google" className="block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Đăng nhập với Google
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Quay lại tài khoản
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
          <p className="text-gray-600 mt-2">Quản lý cài đặt tài khoản và ứng dụng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Settings */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Thông tin tài khoản
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Tên hiển thị</p>
                    <p className="text-sm text-gray-600">{user.name}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Chỉnh sửa
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Chỉnh sửa
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Ảnh đại diện</p>
                    <p className="text-sm text-gray-600">Từ {user.provider}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Thay đổi
                  </button>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5" />
                Bảo mật
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Mật khẩu</p>
                    <p className="text-sm text-gray-600">Đăng nhập qua {user.provider}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Đổi mật khẩu
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Xác thực 2 bước</p>
                    <p className="text-sm text-gray-600">Chưa bật</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Bật
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BellIcon className="h-5 w-5" />
                Thông báo
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Email thông báo</p>
                    <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Thông báo đặt chỗ</p>
                    <p className="text-sm text-gray-600">Thông báo về đặt chỗ mới</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
              <div className="space-y-3">
                <Link
                  href="/account"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Thông tin tài khoản</span>
                </Link>
                <Link
                  href="/account/password"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Đổi mật khẩu</span>
                </Link>
                <Link
                  href="/orders"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Cog6ToothIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Đơn hàng</span>
                </Link>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài khoản</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ID</span>
                  <span className="font-mono text-sm text-gray-900">{user.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nhà cung cấp</span>
                  <span className="font-semibold capitalize text-gray-900">{user.provider}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tham gia</span>
                  <span className="text-gray-900">{new Date(user.loginTime).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}