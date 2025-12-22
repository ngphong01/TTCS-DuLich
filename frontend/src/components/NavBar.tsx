import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from "react";
import { MapPinIcon, TagIcon, ChatBubbleLeftRightIcon, InformationCircleIcon, EnvelopeIcon, CreditCardIcon, StarIcon, UserCircleIcon, ArrowRightOnRectangleIcon, ShieldCheckIcon, BuildingOfficeIcon, BuildingStorefrontIcon, ChevronDownIcon, SparklesIcon, FireIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid, FireIcon as FireIconSolid } from "@heroicons/react/24/solid";
import { useSimpleAuth } from '../lib/use-simple-auth';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getFeaturedDestinations } from '../services/destination';
import { getDestinationImageUrl } from '../utils/imageHelper';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showServicesMenu, setShowServicesMenu] = useState(false);
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const [showSupportMenu, setShowSupportMenu] = useState(false);
  const servicesMenuRef = useRef<HTMLDivElement>(null);
  const exploreMenuRef = useRef<HTMLDivElement>(null);
  const supportMenuRef = useRef<HTMLDivElement>(null);
  const servicesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const exploreTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supportTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data, status } = useSimpleAuth() as any;
  const { t } = useTranslation('header');
  
  // Fetch featured destinations for explore menu
  const { data: featuredDestinations } = useQuery({
    queryKey: ['destinations', 'featured', 'menu'],
    queryFn: getFeaturedDestinations,
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  });

  const user = (data?.user
    ? {
        id: data.user.id,
        email: data.user.email,
        role: (data.user as any).role || 'USER',
        name: data.user.name,
        image: data.user.image || (data.user as any).avatarUrl || (data.user as any).picture || null,
      }
    : null);

  const handleLogout = () => {
    localStorage.removeItem('tg_token');
    document.cookie = 'tg_token=; Max-Age=0; path=/;';
    window.location.replace('/signin');
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesMenuRef.current && !servicesMenuRef.current.contains(event.target as Node)) {
        setShowServicesMenu(false);
      }
      if (exploreMenuRef.current && !exploreMenuRef.current.contains(event.target as Node)) {
        setShowExploreMenu(false);
      }
      if (supportMenuRef.current && !supportMenuRef.current.contains(event.target as Node)) {
        setShowSupportMenu(false);
      }
    };

    if (showServicesMenu || showExploreMenu || showSupportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showServicesMenu, showExploreMenu, showSupportMenu]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
      if (exploreTimeoutRef.current) clearTimeout(exploreTimeoutRef.current);
      if (supportTimeoutRef.current) clearTimeout(supportTimeoutRef.current);
    };
  }, []);

  const item = (href: string, label: string, Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>) => (
    <Link 
      to={href} 
      className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-150 group overflow-hidden whitespace-nowrap"
    >
      {Icon && <Icon className="h-3.5 w-3.5 group-hover:scale-105 transition-transform duration-150 flex-shrink-0" aria-hidden="true" />}
      <span className="relative z-10">{label}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-150"></div>
    </Link>
  );

  return (
    <header className="w-full bg-white/80 backdrop-blur-2xl border-b border-gray-200/50 sticky top-0 z-50 shadow-md shadow-gray-100/50 transition-all duration-300 hover:bg-white/95">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 overflow-hidden">
              <img 
                src="/uploads/avatars/travelgo-admin.png"
                alt="TravelGo Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 bg-clip-text text-transparent group-hover:from-cyan-400 group-hover:via-teal-400 group-hover:to-sky-400 transition-all duration-300">
              TravelGo
            </h1>
            <p className="text-[10px] text-gray-500 group-hover:text-gray-600 transition-colors duration-300 leading-tight">
              {t('tagline')}
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* Khám phá Dropdown */}
          <div 
            className="relative" 
            ref={exploreMenuRef}
            onMouseEnter={() => {
              // Đóng tất cả menu khác ngay lập tức
              if (servicesTimeoutRef.current) {
                clearTimeout(servicesTimeoutRef.current);
                servicesTimeoutRef.current = null;
              }
              if (supportTimeoutRef.current) {
                clearTimeout(supportTimeoutRef.current);
                supportTimeoutRef.current = null;
              }
              setShowServicesMenu(false);
              setShowSupportMenu(false);
              
              // Mở menu này
              if (exploreTimeoutRef.current) {
                clearTimeout(exploreTimeoutRef.current);
                exploreTimeoutRef.current = null;
              }
              setShowExploreMenu(true);
            }}
            onMouseLeave={() => {
              exploreTimeoutRef.current = setTimeout(() => {
                setShowExploreMenu(false);
              }, 150);
            }}
          >
            <button
              onClick={() => setShowExploreMenu(!showExploreMenu)}
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-150 group overflow-hidden whitespace-nowrap"
            >
              <SparklesIcon className="h-3.5 w-3.5 group-hover:scale-105 transition-transform duration-150 flex-shrink-0" />
              <span className="relative z-10">{t('explore')}</span>
              <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-150 ${showExploreMenu ? 'rotate-180' : ''}`} />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-150"></div>
            </button>
            
            {showExploreMenu && (
              <div
                className="absolute top-full left-0 mt-2 w-[440px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[100] pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Compact Header */}
                <div className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500">
                  <div className="flex items-center gap-2">
                    <FireIconSolid className="h-4 w-4 text-white" />
                    <h3 className="text-white font-bold text-sm">Đang hot</h3>
                  </div>
                </div>

                <div className="p-3">
                  {/* Compact Featured Destinations - Scan in 2-3 seconds */}
                  <div className="space-y-2 mb-3">
                    {(featuredDestinations?.slice(0, 3) || []).map((dest: any, index: number) => {
                      const imageUrl = getDestinationImageUrl(dest);
                      const finalImageUrl = imageUrl && !imageUrl.startsWith('http') 
                        ? `${window.location.origin}${imageUrl}` 
                        : imageUrl;
                      const displayPrice = dest.price ? Math.round(dest.price / 1000) : null;
                      const rating = dest.rating || 4.5;
                      
                      return (
                        <Link
                          key={dest.id || index}
                          to={`/destinations/${dest.slug}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowExploreMenu(false);
                          }}
                          className="group relative flex items-center gap-2.5 p-2 rounded-lg hover:bg-orange-50 transition-all duration-150 border border-transparent hover:border-orange-200"
                        >
                          {/* Compact Image */}
                          <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-150 group-hover:scale-105">
                            {finalImageUrl ? (
                              <img
                                src={finalImageUrl}
                                alt={dest.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500"></div>
                            )}
                            {/* Hot Badge - chỉ số 1 */}
                            {index === 0 && (
                              <div className="absolute top-1 left-1 bg-red-500 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">
                                🔥
                              </div>
                            )}
                          </div>
                          
                          {/* Compact Info - Tên + Rating/Giá cùng hàng */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 group-hover:text-orange-600 transition-colors truncate mb-0.5">
                              {dest.name}
                            </h4>
                            <div className="flex items-center gap-3">
                              {/* Rating */}
                              <div className="flex items-center gap-1">
                                <StarIconSolid className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
                              </div>
                              {/* Price */}
                              {displayPrice && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-sm font-bold text-orange-600">
                                    {displayPrice.toLocaleString('vi-VN')}K
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Light CTA */}
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="px-2 py-1 bg-orange-500 text-white rounded text-xs font-medium whitespace-nowrap">
                              Xem
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Minimal Divider */}
                  <div className="my-2.5 border-t border-gray-100"></div>

                  {/* Compact Quick Links */}
                  <div className="flex items-center gap-2">
                    <Link
                      to="/categories"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowExploreMenu(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors text-xs font-medium"
                    >
                      <TagIcon className="h-3.5 w-3.5" />
                      <span>Sở thích</span>
                    </Link>
                    <Link
                      to="/stories"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowExploreMenu(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-pink-600 transition-colors text-xs font-medium"
                    >
                      <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
                      <span>Câu chuyện</span>
                    </Link>
                    <Link
                      to="/destinations"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowExploreMenu(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-semibold"
                    >
                      <MapPinIcon className="h-3.5 w-3.5" />
                      <span>Tất cả</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Services Dropdown */}
          <div 
            className="relative" 
            ref={servicesMenuRef}
            onMouseEnter={() => {
              // Đóng tất cả menu khác ngay lập tức
              if (exploreTimeoutRef.current) {
                clearTimeout(exploreTimeoutRef.current);
                exploreTimeoutRef.current = null;
              }
              if (supportTimeoutRef.current) {
                clearTimeout(supportTimeoutRef.current);
                supportTimeoutRef.current = null;
              }
              setShowExploreMenu(false);
              setShowSupportMenu(false);
              
              // Mở menu này
              if (servicesTimeoutRef.current) {
                clearTimeout(servicesTimeoutRef.current);
                servicesTimeoutRef.current = null;
              }
              setShowServicesMenu(true);
            }}
            onMouseLeave={() => {
              servicesTimeoutRef.current = setTimeout(() => {
                setShowServicesMenu(false);
              }, 150);
            }}
          >
            <button
              onClick={() => setShowServicesMenu(!showServicesMenu)}
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-150 group overflow-hidden whitespace-nowrap"
            >
              <BuildingOfficeIcon className="h-3.5 w-3.5 group-hover:scale-105 transition-transform duration-150 flex-shrink-0" />
              <span className="relative z-10">Dịch vụ</span>
              <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-150 ${showServicesMenu ? 'rotate-180' : ''}`} />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-150"></div>
            </button>
            
            {showServicesMenu && (
              <div
                className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-[100] pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  to="/hotels"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowServicesMenu(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors group cursor-pointer"
                >
                  <BuildingOfficeIcon className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Khách sạn</p>
                    <p className="text-[11px] text-gray-600 leading-tight">Tìm khách sạn phù hợp</p>
                  </div>
                </Link>
                <Link
                  to="/restaurants"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowServicesMenu(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-colors group border-t border-gray-100 cursor-pointer"
                >
                  <BuildingStorefrontIcon className="h-4 w-4 text-orange-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Nhà hàng</p>
                    <p className="text-[11px] text-gray-600 leading-tight">Khám phá ẩm thực</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Ưu đãi - Standalone */}
          {item("/deals", "Ưu đãi", TagIcon)}

          {/* Hỗ trợ Dropdown */}
          <div 
            className="relative" 
            ref={supportMenuRef}
            onMouseEnter={() => {
              // Đóng tất cả menu khác ngay lập tức
              if (exploreTimeoutRef.current) {
                clearTimeout(exploreTimeoutRef.current);
                exploreTimeoutRef.current = null;
              }
              if (servicesTimeoutRef.current) {
                clearTimeout(servicesTimeoutRef.current);
                servicesTimeoutRef.current = null;
              }
              setShowExploreMenu(false);
              setShowServicesMenu(false);
              
              // Mở menu này
              if (supportTimeoutRef.current) {
                clearTimeout(supportTimeoutRef.current);
                supportTimeoutRef.current = null;
              }
              setShowSupportMenu(true);
            }}
            onMouseLeave={() => {
              supportTimeoutRef.current = setTimeout(() => {
                setShowSupportMenu(false);
              }, 150);
            }}
          >
            <button
              onClick={() => setShowSupportMenu(!showSupportMenu)}
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-150 group overflow-hidden whitespace-nowrap"
            >
              <InformationCircleIcon className="h-3.5 w-3.5 group-hover:scale-105 transition-transform duration-150 flex-shrink-0" />
              <span className="relative z-10">Hỗ trợ</span>
              <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-150 ${showSupportMenu ? 'rotate-180' : ''}`} />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-150"></div>
            </button>
            
            {showSupportMenu && (
              <div
                className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-[100] pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  to="/about"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSupportMenu(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-colors group cursor-pointer"
                >
                  <InformationCircleIcon className="h-4 w-4 text-indigo-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Giới thiệu</p>
                    <p className="text-[11px] text-gray-600 leading-tight">Về TravelGo</p>
                  </div>
                </Link>
                <Link
                  to="/contact"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSupportMenu(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors group border-t border-gray-100 cursor-pointer"
                >
                  <EnvelopeIcon className="h-4 w-4 text-teal-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Liên hệ</p>
                    <p className="text-[11px] text-gray-600 leading-tight">Hỗ trợ khách hàng</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Auth Area */}
        <div className="flex items-center gap-3">
          <Link 
            to="/orders" 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-150 whitespace-nowrap"
          >
            <CreditCardIcon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">Đặt chỗ</span>
          </Link>
          
          {/* 🔥 CRITICAL: Language Switcher - Hiển thị luôn, bất kể đã đăng nhập hay chưa */}
          <LanguageSwitcher />
          
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all duration-150 shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <img 
                  src={user.image ? (user.image.startsWith('http') ? user.image : (user.image.startsWith('/uploads') ? user.image : `/uploads/avatars/${user.image}`)) : '/default-avatar.png'} 
                  alt={user.name || 'User'} 
                  className="w-7 h-7 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.png';
                  }}
                />
                <span className="hidden sm:inline flex items-center gap-1">
                  {user.name || user.email.split('@')[0]}
                  {user.role === 'ADMIN' && (
                    <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-600" title="Admin đã xác minh" />
                  )}
                </span>
                {user.role === 'ADMIN' && (
                  <span className="px-1 py-0.5 text-[9px] bg-teal-100 text-teal-700 rounded font-semibold">ADMIN</span>
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
                      className="flex items-center gap-2 px-4 py-2 text-sm text-teal-700 hover:bg-teal-50 transition-colors"
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
              className="px-2.5 py-1 text-xs font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all duration-150 shadow-md hover:shadow-lg whitespace-nowrap"
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
            {/* Khám phá Dropdown Mobile */}
            <div className="relative">
              <button
                onClick={() => setShowExploreMenu(!showExploreMenu)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-150"
              >
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4" />
                  <span>Khám phá</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-150 ${showExploreMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showExploreMenu && (
                <div className="ml-4 mt-2 space-y-1">
                  {/* 1. Cảm hứng (Stories) */}
                  <Link
                    to="/stories"
                    onClick={() => {
                      setShowExploreMenu(false);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    <span>{t('exploreSubmenu.stories')}</span>
                    <span className="ml-auto px-2 py-0.5 bg-pink-100 text-pink-700 text-[10px] font-semibold rounded-full">Mới</span>
                  </Link>
                  {/* 2. Xu hướng (Featured) */}
                  <Link
                    to="/featured"
                    onClick={() => {
                      setShowExploreMenu(false);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                  >
                    <StarIcon className="h-4 w-4" />
                    <span>{t('exploreSubmenu.featured')}</span>
                    <span className="ml-auto text-red-500 text-xs">🔥</span>
                  </Link>
                  {/* 3. Theo sở thích (Categories) */}
                  <Link
                    to="/categories"
                    onClick={() => {
                      setShowExploreMenu(false);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                  >
                    <TagIcon className="h-4 w-4" />
                    <span>{t('exploreSubmenu.categories')}</span>
                  </Link>
                  {/* Divider */}
                  <div className="my-2 border-t border-gray-200"></div>
                  {/* 4. Tất cả điểm đến (Destinations) */}
                  <Link
                    to="/destinations"
                    onClick={() => {
                      setShowExploreMenu(false);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                  >
                    <MapPinIcon className="h-4 w-4" />
                    <span>{t('exploreSubmenu.destinations')}</span>
                    <span className="ml-auto px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-full">200+</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Services Dropdown Mobile */}
            <div className="relative">
              <button
                onClick={() => setShowServicesMenu(!showServicesMenu)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-150"
              >
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span>Dịch vụ</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-150 ${showServicesMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showServicesMenu && (
                <div className="ml-4 mt-2 space-y-1">
                  <Link
                    to="/hotels"
                    onClick={() => {
                      setShowServicesMenu(false);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <BuildingOfficeIcon className="h-4 w-4" />
                    <span>Khách sạn</span>
                  </Link>
                  <Link
                    to="/restaurants"
                    onClick={() => {
                      setShowServicesMenu(false);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <BuildingStorefrontIcon className="h-4 w-4" />
                    <span>Nhà hàng</span>
                  </Link>
                </div>
              )}
            </div>

            {item("/deals", "Ưu đãi", TagIcon)}

            {/* Hỗ trợ Dropdown Mobile */}
            <div className="relative">
              <button
                onClick={() => setShowSupportMenu(!showSupportMenu)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-150"
              >
                <div className="flex items-center gap-2">
                  <InformationCircleIcon className="h-4 w-4" />
                  <span>Hỗ trợ</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-150 ${showSupportMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showSupportMenu && (
                <div className="ml-4 mt-2 space-y-1">
                  <Link
                    to="/about"
                    onClick={() => {
                      setShowSupportMenu(false);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <InformationCircleIcon className="h-4 w-4" />
                    <span>Giới thiệu</span>
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => {
                      setShowSupportMenu(false);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                    <span>Liên hệ</span>
                  </Link>
                </div>
              )}
            </div>
            
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