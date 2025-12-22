import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  MapPinIcon, 
  ClipboardDocumentListIcon, 
  StarIcon, 
  CreditCardIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { getCurrentUser } from '../lib/auth';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const handleLogout = () => {
    localStorage.removeItem('tg_token');
    navigate('/signin');
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Tổng quan', icon: HomeIcon },
    { href: '/admin/destinations', label: 'Điểm đến', icon: MapPinIcon },
    { href: '/admin/tours', label: 'Quản lý Tour', icon: MapPinIcon },
    { href: '/admin/bookings', label: 'Đặt chỗ', icon: ClipboardDocumentListIcon },
    { href: '/admin/users', label: 'Người dùng', icon: UsersIcon },
    { href: '/admin/reviews', label: 'Đánh giá', icon: StarIcon },
    { href: '/admin/payments', label: 'Thanh toán', icon: CreditCardIcon },
    { href: '/admin/settings', label: 'Cài đặt', icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl shadow-lg overflow-hidden bg-white">
              <img
                src="/uploads/avatars/travelgo-admin.png"
                alt="TravelGo Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center hidden">
                <span className="text-white font-bold text-sm">TG</span>
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                TravelGo Admin
              </span>
              {user && (
                <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
              )}
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4 rotate-180" />
            Về trang chủ
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Bảng điều khiển</h1>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}