"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MapPinIcon, TagIcon, ChatBubbleLeftRightIcon, InformationCircleIcon, EnvelopeIcon, CreditCardIcon, StarIcon, UserIcon, Cog6ToothIcon, KeyIcon, PhotoIcon, BellIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useDebounce, useOptimizedClickHandler, useEventCleanup, usePerformanceMonitor } from "@/lib/simple-performance";
import dynamic from "next/dynamic";

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

export default function SimpleNavBar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Performance monitoring
  const { renderCount } = usePerformanceMonitor('SimpleNavBar');
  
  // Event cleanup
  const { addEventListener } = useEventCleanup();

  // Fetch user info
  const fetchUserInfo = useCallback(async () => {
    try {
      console.log('🔍 SimpleNavBar: Fetching user info...');
      const response = await fetch('/api/auth/user', {
        credentials: 'include', // Đảm bảo gửi cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 SimpleNavBar: Response status:', response.status);
      const data: UserResponse = await response.json();
      console.log('📊 SimpleNavBar: User data:', data);

      if (data.authenticated && data.user) {
        setUser(data.user);
        console.log('✅ SimpleNavBar: User authenticated:', data.user.name);
      } else {
        setUser(null);
        console.log('❌ SimpleNavBar: User not authenticated');
      }
    } catch (error) {
      console.error('💥 SimpleNavBar: Error fetching user info:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimized click handlers
  const handleMenuToggle = useOptimizedClickHandler(() => {
    setOpen(prev => !prev);
  }, []);

  const handleUserMenuToggle = useOptimizedClickHandler(() => {
    setUserMenuOpen(prev => !prev);
  }, []);

  const handleSignOut = useOptimizedClickHandler(async () => {
    console.log('🚪 User clicked logout...');
    try {
      await fetch('/api/auth/user', { method: 'DELETE' });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, []);

  // Debounced outside click handler
  const debouncedCloseUserMenu = useDebounce(() => {
    setUserMenuOpen(false);
  }, 100);

  // Close user menu when clicking outside - optimized
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        debouncedCloseUserMenu();
      }
    };

    addEventListener(document, 'mousedown', handleClickOutside);
  }, [debouncedCloseUserMenu, addEventListener]);

  useEffect(() => {
    setMounted(true);
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Memoized navigation items to prevent re-renders
  const navigationItems = useMemo(() => [
    { href: "/destinations", label: "Điểm đến", Icon: MapPinIcon },
    { href: "/categories", label: "Danh mục", Icon: TagIcon },
    { href: "/featured", label: "Nổi bật", Icon: StarIcon },
    { href: "/stories", label: "Câu chuyện", Icon: ChatBubbleLeftRightIcon },
    { href: "/deals", label: "Ưu đãi", Icon: TagIcon },
    { href: "/about", label: "Giới thiệu", Icon: InformationCircleIcon },
    { href: "/contact", label: "Liên hệ", Icon: EnvelopeIcon },
  ], []);

  // Memoized navigation item component
  const NavigationItem = useMemo(() => {
    const Component = ({ href, label, Icon }: { href: string; label: string; Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> }) => (
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
    Component.displayName = 'NavigationItem';
    return Component;
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TG</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              TravelGo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigationItems.map(({ href, label, Icon }) => (
              <NavigationItem key={href} href={href} label={label} Icon={Icon} />
            ))}
          </nav>

          {/* Auth Area - Loading state */}
          <div className="flex items-center gap-3">
            <Link 
              href="/orders" 
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-150 whitespace-nowrap"
            >
              <CreditCardIcon className="h-4 w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Đặt chỗ</span>
            </Link>
            
            <div className="flex items-center gap-2 px-4 py-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-sm">Đang tải...</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={handleMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
    );
  }

  // Memoized auth area - chỉ render khi mounted để tránh hydration mismatch
  const authArea = useMemo(() => {
    if (!mounted) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-sm">Đang tải...</span>
        </div>
      );
    }
    
    if (loading) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-sm">Đang tải...</span>
        </div>
      );
    }

    if (user) {
      return (
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={handleUserMenuToggle}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <img
              src={user.picture || "/default-avatar.png"}
              alt={user.name || "User"}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-gray-700" suppressHydrationWarning={true}>
              {mounted ? (user.name || "User") : "User"}
            </span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[9999]">
              <Link
                href="/account"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => {
                  console.log('🔗 Clicked Account link');
                  setUserMenuOpen(false);
                }}
              >
                <UserIcon className="h-4 w-4" />
                Tài khoản
              </Link>
              <Link
                href="/account/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => {
                  console.log('🔗 Clicked Settings link');
                  setUserMenuOpen(false);
                }}
              >
                <Cog6ToothIcon className="h-4 w-4" />
                Cài đặt
              </Link>
              <button
                onClick={() => {
                  console.log('🔗 Clicked Logout button');
                  handleSignOut();
                  setUserMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors cursor-pointer"
              >
                <KeyIcon className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Link
          href="/api/auth/oauth/google"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }, [mounted, loading, user, userMenuOpen, handleUserMenuToggle, handleSignOut]);

  // Performance warning in development - only for excessive renders
  if (process.env.NODE_ENV === 'development' && renderCount > 20) {
    console.warn(`⚠️ SimpleNavBar has rendered ${renderCount} times - consider optimizing further`);
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40" suppressHydrationWarning={true}>
      <div className="container flex items-center justify-between py-4" suppressHydrationWarning={true}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TG</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            TravelGo
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1" suppressHydrationWarning={true}>
          {navigationItems.map(({ href, label, Icon }) => (
            <NavigationItem key={href} href={href} label={label} Icon={Icon} />
          ))}
        </nav>

        {/* Auth Area */}
        <div className="flex items-center gap-3" suppressHydrationWarning={true}>
          <Link
            href="/orders"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-150 whitespace-nowrap"
          >
            <CreditCardIcon className="h-4 w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Đặt chỗ</span>
          </Link>

          {authArea}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={handleMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-4" suppressHydrationWarning={true}>
          <div className="container flex flex-col gap-2">
            {navigationItems.map(({ href, label, Icon }) => (
              <NavigationItem key={href} href={href} label={label} Icon={Icon} />
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
