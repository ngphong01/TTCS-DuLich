"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { MapPinIcon, TagIcon, ChatBubbleLeftRightIcon, InformationCircleIcon, EnvelopeIcon, CreditCardIcon, StarIcon, UserIcon, Cog6ToothIcon, KeyIcon, PhotoIcon, BellIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useSimpleAuth, signOut } from "@/lib/use-simple-auth";
import { enhancedSignOut } from "@/lib/logout-utils";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session, status } = useSimpleAuth();
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);


  const item = (href: string, label: string, Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>) => (
    <Link 
      href={href} 
      className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-150 group overflow-hidden whitespace-nowrap"
      prefetch={true}
    >
      {Icon && <Icon className="h-4 w-4 group-hover:scale-105 transition-transform duration-150 flex-shrink-0" aria-hidden="true" />}
      <span className="relative z-10">{label}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-150"></div>
    </Link>
  );

  const authArea = () => {
    // Avoid hydration mismatch: render a neutral placeholder until mounted
    if (!mounted || status === "loading") {
      return (
        <div className="w-[110px] h-9" aria-hidden="true"></div>
      );
    }

    // Check if user is logged in
    if (session?.user?.email) {
      // Tạo tên hiển thị gọn gàng hơn
      const displayName = session.user.name || session.user.email?.split('@')[0] || "User";
      const shortName = displayName.length > 12 ? displayName.substring(0, 12) + "..." : displayName;
      const initial = displayName.slice(0, 1).toUpperCase();
      const currentAvatar = session.user.image || initial;
      
      // Check if it's a real image (data URL or http URL) vs just an initial/emoji
      const isImageAvatar = session.user.image && 
        (session.user.image.startsWith('data:') || 
         session.user.image.startsWith('http')) &&
        session.user.image.length > 10;
      
      return (
        <div className="relative" ref={userMenuRef}>
          {/* User Avatar Button */}
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-150 group"
          >
            {isImageAvatar ? (
              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-150">
                <img 
                  src={session.user.image} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center text-gray-700 font-bold text-sm shadow-lg group-hover:shadow-xl group-hover:scale-105 group-hover:border-blue-300 transition-all duration-150">
                {currentAvatar}
              </div>
            )}
             <div className="hidden sm:block text-left">
               <div className="text-sm font-medium text-gray-900">
                 {shortName}
               </div>
               <div className="text-xs text-gray-500 truncate max-w-[120px]">
                 {session.user.email}
               </div>
             </div>
          </button>

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {isImageAvatar ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg">
                      <img 
                        src={session.user.image} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center text-gray-700 font-bold text-lg shadow-lg">
                      {currentAvatar}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">
                      {shortName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {session.user.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link 
                  href="/account" 
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <UserIcon className="h-4 w-4" />
                  Thông tin cá nhân
                </Link>
                
                <Link 
                  href="/account/avatar" 
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <PhotoIcon className="h-4 w-4" />
                  Đổi avatar
                </Link>
                
                <Link 
                  href="/account/password" 
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <KeyIcon className="h-4 w-4" />
                  Đổi mật khẩu
                </Link>
                
                <Link 
                  href="/account/settings" 
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                  Cài đặt
                </Link>
                
                <Link 
                  href="/account/notifications" 
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <BellIcon className="h-4 w-4" />
                  Thông báo
                </Link>
                
                <Link 
                  href="/account/security" 
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <ShieldCheckIcon className="h-4 w-4" />
                  Bảo mật
                </Link>

                {/* Admin Menu */}
                {(session.user as { role?: string })?.role === 'admin' && (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <Link 
                      href="/admin" 
                      className="flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Cog6ToothIcon className="h-4 w-4" />
                      Quản trị
                    </Link>
                    
                    <Link 
                      href="/admin/chat" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      Quản lý Chat
                    </Link>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* Logout */}
              <button
                onClick={async () => {
                  setUserMenuOpen(false);
                  console.log('🚪 User clicked logout...');
                  // Enhanced logout with proper cleanup
                  await enhancedSignOut({ 
                    redirect: true,
                    callbackUrl: '/'
                  });
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-1.5">
        <Link 
          href="/signin" 
          className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all duration-150 shadow-lg hover:shadow-xl whitespace-nowrap"
        >
          Đăng nhập
        </Link>
      </div>
    );
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-lg shadow-gray-100/50">
      <div className="container h-24 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 overflow-hidden">
              <img 
                src="https://png.pngtree.com/png-clipart/20250314/original/pngtree-travel-go-logo-blue-and-yellow-design-png-image_20197838.png"
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
            href="/orders" 
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-150 whitespace-nowrap"
          >
            <CreditCardIcon className="h-4 w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Đặt chỗ</span>
          </Link>
          
          {authArea()}
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
          </div>
        </div>
      )}
    </header>
  );
}