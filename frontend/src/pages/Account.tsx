import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { 
  UserIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  KeyIcon, 
  Cog6ToothIcon,
  ArrowLeftIcon,
  PhotoIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  HeartIcon,
  StarIcon,
  CalendarDaysIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import AccountSidebar from "../components/AccountSidebar";
import AvatarSelectorModal from "../components/AvatarSelectorModal";

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
  loginTime: string;
  verified?: boolean;
  role?: string;
  settings?: any;
  avatarUrl?: string;
  createdAt?: string;
}

interface UserResponse {
  authenticated: boolean;
  user: User | null;
}

export default function AccountPage() {
  const router = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Handle token from URL query params (OAuth callback)
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      console.log('🔑 Account Page: Token found in URL, saving to localStorage...');
      localStorage.setItem('tg_token', urlToken);
      // Remove token from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('token');
      window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Fetch user info
  const fetchUserInfo = async () => {
    try {
      console.log('🔍 Account Page: Fetching user info...');
      console.log('🌐 Current URL:', window.location.href);
      
      // Get token from localStorage or URL
      const urlToken = searchParams.get('token');
      const token = urlToken || localStorage.getItem('tg_token');
      
      if (urlToken) {
        localStorage.setItem('tg_token', urlToken);
      }
      
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      console.log('📡 Account Page: Response status:', response.status);
      const data: UserResponse = await response.json();
      console.log('📊 Account Page: User data:', data);

      if (data.authenticated && data.user) {
        // 🔥 CRITICAL: Map avatarUrl vào picture để hiển thị ảnh Google
        const mapped: any = {
          ...data.user,
          picture: (data.user as any).avatarUrl || (data.user as any).picture || null,
          avatarUrl: (data.user as any).avatarUrl || (data.user as any).picture || null, // Đảm bảo cả 2 field đều có
          settings: (data.user as any).settings || {},
        };
        console.log('🖼️ Avatar URL:', mapped.avatarUrl, 'Picture:', mapped.picture);
        setUser(mapped);
        console.log('✅ Account Page: User authenticated:', data.user.name);
        console.log('✅ Account Page: User settings:', mapped.settings);
        
        // Allow admin to view their own account page
        // Only redirect if explicitly requested (not when clicking "Tài khoản" from menu)
        // Admin can access both /account and /admin/dashboard
      } else {
        setUser(null);
        console.log('❌ Account Page: User not authenticated');
        console.log('   Response data:', data);
        if ((data as any).error) {
          console.error('   Error from server:', (data as any).error);
        }
        // If we have a token but authentication failed, clear it
        if (token) {
          console.log('   Clearing invalid token from localStorage');
          localStorage.removeItem('tg_token');
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
    fetchUserInfo();
  }, [searchParams]);

  useEffect(() => {
    if (!loading && !user) {
      window.location.assign('/signin');
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

function InlineNameEditor({ current, onSaved }: { current: string; onSaved: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(current);
  useEffect(()=>{ setValue(current); }, [current]);
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex-shrink-0 text-indigo-600 hover:text-indigo-700 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all duration-200"
      >
        Sửa
      </button>
    );
  }
    return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <input
        value={value}
        onChange={(e)=>setValue(e.target.value)}
        className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[150px]"
        placeholder="Nhập tên mới"
        autoFocus
      />
      <button
        onClick={async () => {
          const trimmed = value.trim();
          if (!trimmed || trimmed === current) { setOpen(false); return; }
          const token = localStorage.getItem('tg_token');
          const res = await fetch('/api/account/profile', {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ name: trimmed }),
          });
          const json = await res.json();
          if (res.ok && json?.success) {
            onSaved(trimmed);
            setOpen(false);
            window.dispatchEvent(new Event('avatar-updated'));
          } else {
            alert(json?.error || 'Cập nhật tên thất bại');
          }
        }}
        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        ✓ Lưu
      </button>
      <button 
        onClick={()=>{
          setValue(current);
          setOpen(false);
        }} 
        className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-gray-100 text-gray-700 border border-gray-300 transition-all duration-200"
      >
        Hủy
      </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Chưa đăng nhập</h1>
            <p className="text-gray-600 mb-8">Vui lòng đăng nhập để xem thông tin tài khoản của bạn</p>
            <div className="space-y-3">
              <Link 
                to="/api/auth/oauth/google" 
                className="block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Đăng nhập ngay
            </Link>
              <Link 
                to="/" 
                className="block bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
              Về trang chủ
            </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user.name || user.email?.split('@')[0] || "User";
  const initial = displayName.slice(0, 1).toUpperCase();
  // 🔥 CRITICAL: Đảm bảo đọc đúng avatarUrl từ Google hoặc từ database
  // Ưu tiên avatarUrl (từ database) sau đó mới đến picture (từ OAuth)
  const avatarUrl = (user as any).avatarUrl || user.picture || null;
  const isImageAvatar = !!(avatarUrl && avatarUrl.length > 5);
  
  console.log('🖼️ Display Avatar - avatarUrl:', (user as any).avatarUrl, 'picture:', user.picture, 'final:', avatarUrl);
  
  // Get full avatar URL if it's a relative path
  const getAvatarUrl = () => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    if (avatarUrl.startsWith('/uploads')) return avatarUrl;
    return `/uploads/avatars/${avatarUrl}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section - Enhanced */}
        <div className="relative overflow-hidden rounded-3xl mb-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30" />
          
          <div className="relative p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar Section with Upload */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative">
                  {isImageAvatar ? (
                    <img
                      src={getAvatarUrl() || '/default-avatar.png'}
                      alt={displayName}
                      className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                      }}
                    />
                  ) : (
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-white to-gray-100 flex items-center justify-center text-indigo-600 text-4xl font-bold border-4 border-white shadow-2xl">
                      {initial}
                    </div>
                  )}
                      <input
                    id="avatar-file-hero" 
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const form = new FormData();
                          form.append('file', file);
                      const token = localStorage.getItem('tg_token');
                      const res = await fetch('/api/account/avatar', {
                        method: 'POST',
                        body: form,
                        credentials: 'include',
                        headers: token ? { Authorization: `Bearer ${token}` } as any : undefined,
                      });
                          const json = await res.json();
                      if (json?.success && json?.url) {
                        const base = (process.env.REACT_APP_BACKEND_URL || window.location.origin).replace(/\/$/, '');
                        const full = json.url.startsWith('http') ? json.url : `${base}${json.url}`;
                        setUser((prev) => prev ? { ...prev, picture: full } as any : prev);
                          } else {
                        alert(json?.error || 'Upload failed');
                          }
                        }}
                      />
                      {/* Upload Avatar Button */}
                      <button 
                    onClick={() => (document.getElementById('avatar-file-hero') as HTMLInputElement)?.click()}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-white hover:bg-gray-50 text-indigo-600 rounded-full border-2 border-indigo-100 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                    title="Upload ảnh đại diện"
                      >
                    <PhotoIcon className="w-5 h-5" />
                      </button>
                      {/* Generate Avatar Button */}
                      <button 
                    onClick={() => setShowAvatarModal(true)}
                    className="absolute -bottom-2 -left-2 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                    title="Chọn avatar ngẫu nhiên"
                      >
                    <SparklesIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">{displayName}</h1>
                  <CheckBadgeIcon className="w-7 h-7 text-blue-300" />
                </div>
                <p className="text-white/90 text-lg mb-4 font-medium">{user.email}</p>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/30 text-white shadow-lg">
                    <ShieldCheckIcon className="w-4 h-4" />
                    Email đã xác thực
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/30 text-white shadow-lg">
                    <UserIcon className="w-4 h-4" />
                    {user.settings && (user.settings as any).loyaltyRank ? `Thành viên ${(user.settings as any).loyaltyRank}` : 'Thành viên'}
                  </span>
                  {(user as any).createdAt && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/30 text-white shadow-lg">
                      <CalendarIcon className="w-4 h-4" />
                      Tham gia {new Date((user as any).createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                      </div>
                    </div>

              {/* Quick Actions - Hero */}
              <div className="hidden lg:flex gap-3">
                    <Link 
                  to="/account/settings"
                  className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl border border-white/30 transition-all duration-200 group"
                  title="Cài đặt"
                    >
                  <Cog6ToothIcon className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                    </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <AccountSidebar />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Information Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserIcon className="w-6 h-6" />
                  Thông tin cá nhân
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <div className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 hover:border-indigo-300 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tên hiển thị</p>
                          <p className="font-semibold text-gray-900 text-lg truncate">{displayName}</p>
                        </div>
                      </div>
                      <InlineNameEditor current={displayName} onSaved={(name)=>setUser(prev=> prev ? ({...prev, name} as any): prev)} />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 hover:border-green-300 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                          <EnvelopeIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                          <p className="font-semibold text-gray-900 truncate">{user.email}</p>
                        </div>
                      </div>
                      <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                        <CheckBadgeIcon className="w-4 h-4" />
                        Đã xác thực
                      </span>
                    </div>
                  </div>

                  {/* Join Date */}
                  <div className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 hover:border-purple-300 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <CalendarDaysIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ngày tham gia</p>
                        <p className="font-semibold text-gray-900">
                          {(user as any).createdAt 
                            ? new Date((user as any).createdAt).toLocaleDateString('vi-VN', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })
                            : (user as any).loginTime 
                            ? new Date((user as any).loginTime).toLocaleDateString('vi-VN', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })
                            : '—'
                          }
                        </p>
                      </div>
                      </div>
                    </div>

                  {/* Account Status */}
                  <div className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Trạng thái tài khoản</p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Đang hoạt động
                    </span>
                  </div>
                </div>
              </div>
            </div>
                </div>
              </div>
            </div>

            {/* Security & Settings Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <KeyIcon className="w-6 h-6" />
                  Bảo mật & Cài đặt
                </h2>
          </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                <Link
                  to="/account/password"
                    className="group bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-xl p-5 border border-orange-200 hover:border-orange-300 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center transition-colors">
                          <KeyIcon className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Mật khẩu</p>
                          <p className="font-semibold text-gray-900">Đổi mật khẩu</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-orange-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                </Link>

                  {/* Settings */}
                <Link
                  to="/account/settings"
                    className="group bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl p-5 border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                          <Cog6ToothIcon className="h-5 w-5 text-blue-600 group-hover:rotate-90 transition-transform duration-300" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Tùy chỉnh</p>
                          <p className="font-semibold text-gray-900">Cài đặt tài khoản</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                </Link>
              </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <StarIcon className="w-6 h-6" />
                  Thống kê hoạt động
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Reviews */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border border-yellow-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <StarIcon className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">0</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-600">Đánh giá</p>
                  </div>

                  {/* Bookings */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <CalendarDaysIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">0</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-600">Đặt chỗ</p>
            </div>

                  {/* Favorites */}
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                        <HeartIcon className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">0</p>
                      </div>
                </div>
                    <p className="text-sm font-semibold text-gray-600">Yêu thích</p>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Selector Modal */}
      {user && (
        <AvatarSelectorModal
          isOpen={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          userId={parseInt(user.id)}
          currentAvatar={getAvatarUrl() || undefined}
          onAvatarChange={(newAvatarUrl) => {
            setUser((prev) => prev ? { ...prev, picture: newAvatarUrl, avatarUrl: newAvatarUrl } as any : prev);
          }}
        />
      )}
    </div>
  );
}
