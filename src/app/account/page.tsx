"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  UserIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  KeyIcon, 
  Cog6ToothIcon,
  ArrowLeftIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";
import AccountSidebar from "@/components/AccountSidebar";

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

export default function AccountPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch user info
  const fetchUserInfo = async () => {
    try {
      console.log('🔍 Account Page: Fetching user info...');
      console.log('🌐 Current URL:', window.location.href);
      
      const response = await fetch('/api/auth/user', {
        credentials: 'include', // Đảm bảo gửi cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Account Page: Response status:', response.status);
      console.log('📡 Account Page: Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data: UserResponse = await response.json();
      console.log('📊 Account Page: User data:', data);

      if (data.authenticated && data.user) {
        setUser(data.user);
        setRetryCount(0); // Reset retry count on success
        console.log('✅ Account Page: User authenticated:', data.user.name);
        console.log('✅ Account Page: User email:', data.user.email);
        console.log('✅ Account Page: User picture:', data.user.picture);
      } else {
        setUser(null);
        console.log('❌ Account Page: User not authenticated');
        console.log('❌ Account Page: Data:', data);
        
        // Retry mechanism
        if (retryCount < 3) {
          console.log(`🔄 Account Page: Retrying... (${retryCount + 1}/3)`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            fetchUserInfo();
          }, 1000);
        }
      }
    } catch (error) {
      console.error('💥 Account Page: Error fetching user info:', error);
      setUser(null);
    } finally {
      setLoading(false);
      console.log('🏁 Account Page: Loading finished');
    }
  };

  useEffect(() => {
    console.log('🚀 Account Page: Component mounted, starting fetch...');
    setMounted(true);
    fetchUserInfo();
  }, []);

  // Force re-fetch when component mounts
  useEffect(() => {
    if (mounted) {
      console.log('🔄 Account Page: Re-fetching user info after mount...');
      fetchUserInfo();
    }
  }, [mounted]);

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
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Chưa đăng nhập</h1>
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem thông tin tài khoản</p>
          <div className="space-y-2">
            <Link href="/api/auth/oauth/google" className="block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Đăng nhập
            </Link>
            <Link href="/debug-session" className="block bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
              🔧 Debug Session
            </Link>
            <Link href="/" className="block bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
              Về trang chủ
            </Link>
          </div>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Debug Info:</strong> User session không được tìm thấy. 
              Hãy kiểm tra console để xem chi tiết hoặc sử dụng trang debug.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user.name || user.email?.split('@')[0] || "User";
  const initial = displayName.slice(0, 1).toUpperCase();
  const isImageAvatar = user.picture && 
    (user.picture.startsWith('data:') || user.picture.startsWith('http')) &&
    user.picture.length > 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Quay lại trang chủ
              </Link>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Tài khoản của tôi</h1>
                  <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
                </div>
                <button
                  onClick={() => {
                    console.log('🔄 Manual refresh triggered');
                    setLoading(true);
                    setRetryCount(0);
                    fetchUserInfo();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Làm mới
                </button>
              </div>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <AccountSidebar />
          </div>

          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-6 mb-8">
                {/* Avatar */}
                <div className="relative">
                  {isImageAvatar ? (
                    <img
                      src={user.picture || ""}
                      alt={displayName}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                      {initial}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Đã xác thực
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Tài khoản
                    </span>
                  </div>
                </div>
              </div>

                  {/* User Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Tên hiển thị</p>
                            <p className="font-medium">{displayName}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const newName = prompt('Nhập tên mới:', displayName);
                            if (newName && newName.trim()) {
                              console.log('🔄 Updating name to:', newName);
                              // TODO: Implement name update API
                              alert('Tính năng đang được phát triển!');
                            }
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          Chỉnh sửa
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{user.email}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          Email đã xác thực
                        </span>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Tham gia</p>
                          <p className="font-medium">{new Date(user.loginTime).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <PhotoIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Ảnh đại diện</p>
                            <p className="font-medium">
                              {isImageAvatar ? "Đã tải lên" : "Chưa có ảnh"}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            console.log('🔄 Updating avatar...');
                            // TODO: Implement avatar update API
                            alert('Tính năng đổi avatar đang được phát triển!');
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          Đổi ảnh
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <KeyIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Mật khẩu</p>
                            <p className="font-medium">Mật khẩu đã được thiết lập</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            console.log('🔄 Changing password...');
                            // TODO: Implement password change API
                            alert('Tính năng đổi mật khẩu đang được phát triển!');
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          Đổi mật khẩu
                        </button>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Cog6ToothIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Trạng thái</p>
                          <p className="font-medium">Tài khoản hoạt động</p>
                        </div>
                      </div>
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
                  href="/account/password"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Đổi mật khẩu</span>
                </Link>

                <Link
                  href="/account/settings"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Cog6ToothIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Cài đặt</span>
                </Link>
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đánh giá</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đặt chỗ</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Yêu thích</span>
                  <span className="font-semibold">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}