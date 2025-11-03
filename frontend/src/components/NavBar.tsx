import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import { MapPinIcon, TagIcon, ChatBubbleLeftRightIcon, InformationCircleIcon, EnvelopeIcon, CreditCardIcon, StarIcon, UserCircleIcon, ArrowRightOnRectangleIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useSimpleAuth } from '../lib/use-simple-auth';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data, status } = useSimpleAuth() as any;

  const user = (data?.user
    ? {
        id: data.user.id,
        email: data.user.email,
        role: (data.user as any).role || 'USER',
        name: data.user.name,
        image: data.user.image,
      }
    : null);

  const handleLogout = () => {
    localStorage.removeItem('tg_token');
    document.cookie = 'tg_token=; Max-Age=0; path=/;';
    window.location.replace('/signin');
  };

  const item = (href: string, label: string, Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>) => (
    <Link 
      to={href} 
      className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-150 group overflow-hidden whitespace-nowrap"
    >
      {Icon && <Icon className="h-4 w-4 group-hover:scale-105 transition-transform duration-150 flex-shrink-0" aria-hidden="true" />}
      <span className="relative z-10">{label}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-150"></div>
    </Link>
  );

  return (
    <header className="w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-lg shadow-gray-100/50">
    <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 overflow-hidden">
              <img 
                src="https://png.pngtree.com/png-vector/20250112/ourmid/pngtree-travel-go-logo-blue-and-yellow-design-png-image_15159391.png"
                alt="TravelGo Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-pink-500 transition-all duration-300">
              TravelGo
            </h1>
            <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
              Explore the World
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {item("/destinations", "Điểm đến", MapPinIcon)}
          {item("/categories", "Danh mục", TagIcon)}
          {item("/featured", "Nổi bật", StarIcon)}
          {item("/stories", "Câu chuyện", ChatBubbleLeftRightIcon)}
          {item("/deals", "Ưu đãi", TagIcon)}
          {item("/about", "Giới thiệu", InformationCircleIcon)}
          {item("/contact", "Liên hệ", EnvelopeIcon)}
        </nav>

        {/* Auth Area */}
        <div className="flex items-center gap-3">
          <Link 
            to="/orders" 
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-150 whitespace-nowrap"
          >
            <CreditCardIcon className="h-4 w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Đặt chỗ</span>
          </Link>
          
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all duration-150 shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                <img src={user.image || '/default-avatar.png'} alt={user.name || 'User'} className="w-8 h-8 rounded-full object-cover" />
                <span className="hidden sm:inline flex items-center gap-1">
                  {user.name || user.email.split('@')[0]}
                  {user.role === 'ADMIN' && (
                    <ShieldCheckIcon className="w-4 h-4 text-blue-600" title="Admin đã xác minh" />
                  )}
                </span>
                {user.role === 'ADMIN' && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-purple-100 text-purple-700 rounded font-semibold">ADMIN</span>
                )}
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      {user.name || user.email.split('@')[0]}
                      {user.role === 'ADMIN' && (
                        <ShieldCheckIcon className="w-4 h-4 text-blue-600" title="Admin đã xác minh" />
                      )}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                    </p>
                  </div>
                  
                  <Link
                    to="/account"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <UserCircleIcon className="h-4 w-4" />
                    Tài khoản
                  </Link>
                  
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                    >
                      <StarIcon className="h-4 w-4" />
                      Quản trị
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/signin" 
              className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all duration-150 shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              Đăng nhập
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-4">
          <div className="container flex flex-col gap-2">
            {item("/destinations", "Điểm đến", MapPinIcon)}
            {item("/categories", "Danh mục", TagIcon)}
            {item("/featured", "Nổi bật", StarIcon)}
            {item("/stories", "Câu chuyện", ChatBubbleLeftRightIcon)}
            {item("/deals", "Ưu đãi", TagIcon)}
            {item("/about", "Giới thiệu", InformationCircleIcon)}
            {item("/contact", "Liên hệ", EnvelopeIcon)}
            
            {user && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                {item("/account", "Tài khoản", UserCircleIcon)}
                {user.role === 'ADMIN' && item("/admin/dashboard", "Quản trị", StarIcon)}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Đăng xuất
                </button>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}