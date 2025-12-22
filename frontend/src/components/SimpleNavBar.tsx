import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MapPinIcon, TagIcon, ChatBubbleLeftRightIcon, InformationCircleIcon, EnvelopeIcon, CreditCardIcon, StarIcon, UserIcon, Cog6ToothIcon, KeyIcon } from "@heroicons/react/24/outline";
import { useDebounce, useDebounceFn, useOptimizedClickHandler, useEventCleanup, usePerformanceMonitor } from "../lib/simple-performance";

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
  const fetchingRef = useRef(false); // Thêm ref để tránh fetch trùng lặp
  
  const { renderCount } = usePerformanceMonitor('SimpleNavBar');
  const { addEventListener } = useEventCleanup();

  // **FIX 1: Cải thiện fetchUserInfo với retry và error handling**
  const fetchUserInfo = useCallback(async (retryCount = 0) => {
    // Tránh fetch trùng lặp
    if (fetchingRef.current) {
      console.log('⏳ Already fetching user info, skipping...');
      return;
    }

    fetchingRef.current = true;
    
    try {
      console.log('🔍 SimpleNavBar: Fetching user info... (Attempt:', retryCount + 1, ')');
      
      const token = localStorage.getItem('tg_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include',
        headers,
        cache: 'no-store',
      });

      console.log('📡 SimpleNavBar: Response status:', response.status);
      
      // **FIX 2: Kiểm tra response có ok không**
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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
      
      // **FIX 3: Retry logic với exponential backoff**
      if (retryCount < 2) {
        console.log(`🔄 Retrying... (${retryCount + 1}/2)`);
        setTimeout(() => {
          fetchingRef.current = false;
          fetchUserInfo(retryCount + 1);
        }, 1000 * (retryCount + 1));
        return;
      }
      
      setUser(null);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  // **FIX 4: Tối ưu handleSignOut**
  const handleSignOut = useOptimizedClickHandler(async () => {
    console.log('🚪 User clicked logout...');
    setLoading(true);
    
    try {
      const token = localStorage.getItem('tg_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/auth/user', { 
        method: 'DELETE',
        credentials: 'include',
        headers,
      });
      
      if (response.ok) {
        setUser(null);
        setUserMenuOpen(false);
        
        // Clear any stored auth data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('tg_token');
          localStorage.removeItem('user');
          sessionStorage.clear();
        }
        
        // Redirect sau khi clear state
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Vẫn redirect ngay cả khi có lỗi
      window.location.href = '/';
    }
  }, [fetchUserInfo]);

  const handleMenuToggle = useOptimizedClickHandler(() => {
    setOpen(prev => !prev);
  });

  const handleUserMenuToggle = useOptimizedClickHandler(() => {
    setUserMenuOpen(prev => !prev);
  });

  const closeUserMenu = useCallback(() => {
    setUserMenuOpen(false);
  }, []);
  
  const debouncedCloseUserMenu = useDebounceFn(closeUserMenu, 100);

  // **FIX 5: Cải thiện close menu logic**
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        debouncedCloseUserMenu();
      }
    };

    if (userMenuOpen) {
      addEventListener(document, 'mousedown', handleClickOutside);
    }
    
    return () => {
      // Cleanup được xử lý bởi useEventCleanup
    };
  }, [userMenuOpen, debouncedCloseUserMenu, addEventListener]);

  // **FIX 6: Mount và fetch user info một lần**
  useEffect(() => {
    setMounted(true);
    
    // Delay nhỏ để đảm bảo component đã mount hoàn toàn
    const timer = setTimeout(() => {
      fetchUserInfo();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [fetchUserInfo]);

  // **FIX 7: Listen for login success event**
  useEffect(() => {
    const handleLoginSuccess = () => {
      console.log('🎉 Login success event received');
      fetchUserInfo();
    };
    
    const handleAvatarUpdate = () => {
      console.log('🖼️ Avatar update event received');
      fetchUserInfo();
    };

    window.addEventListener('login-success', handleLoginSuccess);
    window.addEventListener('avatar-updated', handleAvatarUpdate);
    
    return () => {
      window.removeEventListener('login-success', handleLoginSuccess);
      window.removeEventListener('avatar-updated', handleAvatarUpdate);
    };
  }, [fetchUserInfo]);

  const navigationItems = useMemo(() => [
    { href: "/destinations", label: "Điểm đến", Icon: MapPinIcon },
    { href: "/categories", label: "Danh mục", Icon: TagIcon },
    { href: "/featured", label: "Nổi bật", Icon: StarIcon },
    { href: "/stories", label: "Câu chuyện", Icon: ChatBubbleLeftRightIcon },
    { href: "/deals", label: "Ưu đãi", Icon: TagIcon },
    { href: "/about", label: "Giới thiệu", Icon: InformationCircleIcon },
    { href: "/contact", label: "Liên hệ", Icon: EnvelopeIcon },
  ], []);

  const NavigationItem = useMemo(() => {
    const Component = ({ href, label, Icon }: { href: string; label: string; Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> }) => (
      <Link 
        to={href} 
        className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-150 group overflow-hidden whitespace-nowrap"
      >
        {Icon && <Icon className="h-4 w-4 group-hover:scale-105 transition-transform duration-150 flex-shrink-0" aria-hidden="true" />}
        <span className="relative z-10">{label}</span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-150"></div>
      </Link>
    );
    Component.displayName = 'NavigationItem';
    return Component;
  }, []);

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
      const isVerified = (user as any).verified ?? (user as any).emailVerified ?? (user.provider && user.provider !== 'credentials');
      return (
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={handleUserMenuToggle}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="User menu"
          >
            <span className="relative inline-block">
              <img
                src={user.picture || "/icons/avatar.svg"}
                alt={user.name || "User avatar"}
                className="w-8 h-8 rounded-full object-cover shrink-0"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22 viewBox=%220 0 64 64%22><circle cx=%2232%22 cy=%2232%22 r=%2232%22 fill=%22%23E5E7EB%22/><circle cx=%2232%22 cy=%2226%22 r=%2212%22 fill=%22%239CA3AF%22/><path d=%22M12 54c3.5-9 12-14 20-14s16.5 5 20 14%22 fill=%22%239CA3AF%22/></svg>';
                }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 inline-block w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" aria-hidden="true"></span>
            </span>
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap flex items-center gap-1">
              {user.name || "User"}
              {isVerified && (
                <svg className="w-4 h-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-label="Verified">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414L9 13.414l4.707-4.707z" clipRule="evenodd" />
                </svg>
              )}
            </span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[9999]">
              <Link
                to="/account"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setUserMenuOpen(false)}
              >
                <UserIcon className="h-4 w-4" />
                Tài khoản
              </Link>
              <Link
                to="/account/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setUserMenuOpen(false)}
              >
                <Cog6ToothIcon className="h-4 w-4" />
                Cài đặt
              </Link>
              <button
                onClick={handleSignOut}
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
          to="/signin"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }, [mounted, loading, user, userMenuOpen, handleUserMenuToggle, handleSignOut]);

  if (process.env.NODE_ENV === 'development' && renderCount > 20) {
    console.warn(`⚠️ SimpleNavBar has rendered ${renderCount} times`);
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TG</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 bg-clip-text text-transparent">
            TravelGo
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navigationItems.map(({ href, label, Icon }) => (
            <NavigationItem key={href} href={href} label={label} Icon={Icon} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-150 whitespace-nowrap"
          >
            <CreditCardIcon className="h-4 w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Đặt chỗ</span>
          </Link>

          {authArea}
        </div>

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

      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-4">
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