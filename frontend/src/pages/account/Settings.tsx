import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Cog6ToothIcon,
  UserIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  LanguageIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import AccountSidebar from "../../components/AccountSidebar";
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getAuthHeaders } from '../../utils/api';

export default function SettingsPage() {
  const { language, setLanguage, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(() => {
    const saved = localStorage.getItem('travelgo:emailNotifications');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('tg_token');
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔍 Settings: User data:', data);
        
        if (data.authenticated && data.user) {
          setUser(data.user);
          setForm({ name: data.user.name || '', password: '' });
          
          // Load preferences from user settings if available
          if (data.user.settings) {
            try {
              const settings = typeof data.user.settings === 'string' 
                ? JSON.parse(data.user.settings) 
                : data.user.settings;
              
              console.log('⚙️ Settings: Parsed settings:', settings);
              
              if (settings.language && (settings.language === 'vi' || settings.language === 'en')) {
                setLanguage(settings.language);
              }
              if (settings.theme && (settings.theme === 'light' || settings.theme === 'dark' || settings.theme === 'auto')) {
                setTheme(settings.theme);
              }
              if (settings.emailNotifications !== undefined) {
                setEmailNotifications(settings.emailNotifications);
              }
            } catch (parseError) {
              console.error('❌ Settings: Error parsing settings:', parseError);
            }
          }
        } else {
          console.warn('⚠️ Settings: User not authenticated');
          // Redirect to login if not authenticated
          window.location.href = '/signin';
        }
      } catch (error) {
        console.error('❌ Settings: Error fetching user:', error);
        setError('Không thể tải thông tin người dùng. Vui lòng thử lại!');
      }
    };
    
    fetchUser();
  }, [setLanguage, setTheme]);

  // Save email notifications preference
  const handleEmailNotificationsChange = async (value: boolean) => {
    setEmailNotifications(value);
    localStorage.setItem('travelgo:emailNotifications', String(value));
    
    // Save to backend if user is logged in
    try {
      const settings = {
        language,
        theme,
        emailNotifications: value,
      };
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ settings }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status}`);
      }
      
      console.log('✅ Settings: Email notifications saved');
    } catch (err) {
      console.error('❌ Settings: Failed to save email notifications:', err);
    }
  };

  // Save theme and language to backend
  const handleLanguageChange = async (value: 'vi' | 'en') => {
    try {
      setLanguage(value);
      const settings = {
        language: value,
        theme,
        emailNotifications,
      };
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ settings }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status}`);
      }
      
      console.log('✅ Settings: Language saved:', value);
    } catch (err) {
      console.error('❌ Settings: Failed to save language:', err);
    }
  };

  const handleThemeChange = async (value: 'light' | 'dark' | 'auto') => {
    try {
      setTheme(value);
      const settings = {
        language,
        theme: value,
        emailNotifications,
      };
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ settings }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status}`);
      }
      
      console.log('✅ Settings: Theme saved:', value);
    } catch (err) {
      console.error('❌ Settings: Failed to save theme:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);
    
    try {
      const updates: any = {};
      if (form.name && form.name !== user?.name) {
        updates.name = form.name;
      }
      if (form.password) {
        if (form.password.length < 6) {
          setError('Mật khẩu phải có ít nhất 6 ký tự');
          setLoading(false);
          return;
        }
        updates.password = form.password;
      }

      if (Object.keys(updates).length > 0) {
        const res = await fetch('/api/account/profile', {
          method: 'PUT',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(updates),
        });

        if (res.ok) {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
          if (updates.name) {
            setUser({ ...user, name: updates.name });
            window.dispatchEvent(new Event('avatar-updated'));
          }
          setForm({ ...form, password: '' });
        } else {
          const data = await res.json();
          setError(data.error || 'Cập nhật thất bại');
        }
      } else {
        setError('Không có thay đổi nào để cập nhật');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

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
              <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-6 py-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Cog6ToothIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">Cài đặt tài khoản</h1>
                      <p className="text-white/90 mt-1">Quản lý thông tin và tùy chọn của bạn</p>
                    </div>
                  </div>
                  <Link
                    to="/account"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-xl transition-all duration-200 border border-white/30"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Quay lại
                  </Link>
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800">Cập nhật thành công!</p>
                    <p className="text-xs text-green-700 mt-1">Thông tin của bạn đã được lưu.</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Settings */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-indigo-600" />
                  Thông tin cá nhân
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Name Field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    Tên hiển thị
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-300 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <input
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white font-medium"
                        name="name"
                        placeholder="Nhập tên hiển thị của bạn"
                        value={form.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Tên này sẽ được hiển thị công khai trên hồ sơ của bạn</p>
                </div>

                {/* Email Display (Read-only) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    <EnvelopeIcon className="w-4 h-4 text-gray-500" />
                    Email
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-white font-medium text-gray-900"
                      value={user?.email || ''}
                      readOnly
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Email không thể thay đổi</p>
                </div>

                {/* Password Field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    <KeyIcon className="w-4 h-4 text-gray-500" />
                    Mật khẩu mới
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-red-300 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <input
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white pr-12 font-medium"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? 
                          <EyeSlashIcon className="h-5 w-5" /> : 
                          <EyeIcon className="h-5 w-5" />
                        }
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Nhập mật khẩu mới (tối thiểu 6 ký tự). Để trống nếu không muốn đổi.</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-700 hover:via-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Đang cập nhật...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircleIcon className="w-5 h-5" />
                      Lưu thay đổi
                    </span>
                  )}
                </button>
              </form>
            </div>

            {/* Preferences Settings */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <PaintBrushIcon className="w-5 h-5 text-purple-600" />
                  Tùy chọn hiển thị
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Language Selector */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <LanguageIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Ngôn ngữ</p>
                      <p className="text-sm text-gray-600">Chọn ngôn ngữ hiển thị</p>
                    </div>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value as 'vi' | 'en')}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Theme Selector */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <PaintBrushIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Giao diện</p>
                      <p className="text-sm text-gray-600">Chọn chế độ hiển thị</p>
                    </div>
                  </div>
                  <select
                    value={theme}
                    onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'auto')}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                  >
                    <option value="light">Sáng</option>
                    <option value="dark">Tối</option>
                    <option value="auto">Tự động</option>
                  </select>
                </div>

                {/* Email Notifications Toggle */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <BellIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Thông báo email</p>
                      <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEmailNotificationsChange(!emailNotifications)}
                    className={`relative w-14 h-7 rounded-full transition-all duration-200 ${
                      emailNotifications ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                      emailNotifications ? 'translate-x-7' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Liên kết nhanh</h2>
              </div>
              
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/account/security"
                  className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border border-blue-200 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Bảo mật</p>
                    <p className="text-xs text-gray-600">Quản lý bảo mật</p>
                  </div>
                </Link>

                <Link
                  to="/account/notifications"
                  className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl border border-green-200 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                    <BellIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Thông báo</p>
                    <p className="text-xs text-gray-600">Cài đặt thông báo</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Back to Account Link - Mobile */}
            <div className="sm:hidden">
              <Link
                to="/account"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-200 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Quay lại tài khoản
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}