import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MapPinIcon, TagIcon, ChatBubbleLeftRightIcon, InformationCircleIcon, EnvelopeIcon, CreditCardIcon, StarIcon, UserIcon, Cog6ToothIcon, KeyIcon, PhotoIcon, BellIcon, ShieldCheckIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { useSimpleAuth, signOut } from "../lib/use-simple-auth";
import { useDebounceFn, useOptimizedClickHandler, useEventCleanup, usePerformanceMonitor } from "../lib/performance-optimizations";
import { enhancedSignOut, useLogout } from "../lib/logout-utils";

export default function OptimizedNavBar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session, status } = useSimpleAuth() as any;
  const [mounted, setMounted] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  
  // Performance monitoring
  const { renderCount } = usePerformanceMonitor('OptimizedNavBar');
  
  // Event cleanup
  const { addEventListener } = useEventCleanup();

  // Optimized click handlers
  const handleMenuToggle = useOptimizedClickHandler(() => {
    setOpen(prev => !prev);
  });

  const handleUserMenuToggle = useOptimizedClickHandler(() => {
    setUserMenuOpen(prev => !prev);
  });

  // Enhanced logout handler
  const { handleLogout } = useLogout();
  
  const handleSignOut = useOptimizedClickHandler(async () => {
    console.log('🚪 User clicked logout...');
    await handleLogout();
  });

  const handlePickAvatar = () => fileRef.current?.click();
  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const token = localStorage.getItem('tg_token');
    try {
      const res = await fetch('/api/account/avatar', {
        method: 'POST',
        body: form,
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } as any : undefined,
      });
      const json = await res.json();
      if (json?.success && json?.url) {
        const base = (process.env.REACT_APP_BACKEND_URL || window.location.origin).replace(/\/$/, '');
        const url = json.url.startsWith('http') ? json.url : `${base}${json.url}`;
        setAvatarUrl(url);
        window.dispatchEvent(new Event('avatar-updated'));
      } else {
        alert(json?.error || 'Upload failed');
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // Debounced outside click handler
  const closeUserMenu = useCallback(() => {
    setUserMenuOpen(false);
  }, []);
  
  const debouncedCloseUserMenu = useDebounceFn(closeUserMenu, 100);

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
  }, []);

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

  // Memoized auth area
  const authArea = useMemo(() => {
    if (!mounted) return null;
    
    if (status === "loading") {
      return (
        <div className="flex items-center gap-2 px-4 py-2 text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-sm">Đang tải...</span>
        </div>
      );
    }

    if ((session as any)?.user) {
      const user = (session as any).user;
      return (
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={handleUserMenuToggle}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
              <span className="relative inline-block">
              <img
                src={avatarUrl || user.image || "/default-avatar.png"}
                alt={user.name || "User"}
                className="w-10 h-10 rounded-full object-cover"
              />
              <button
                type="button"
                onClick={(ev) => { ev.stopPropagation(); handlePickAvatar(); }}
                title="Đổi ảnh"
                className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-green-500 border-2 border-white shadow hover:bg-green-600"
              />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} />
            </span>
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              {user.name || "User"}
              {(user as any).role === 'ADMIN' && (
                <ShieldCheckIcon className="w-4 h-4 text-blue-600" title="Admin đã xác minh" />
              )}
            </span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <Link
                to="/account"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setUserMenuOpen(false)}
              >
                <UserIcon className="h-4 w-4" />
                Tài khoản
              </Link>
              <div className="px-4 py-2 text-xs text-gray-500 border-t">
                <div>Tham gia: {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('vi-VN') : '—'}</div>
                <div>Cập nhật: {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('vi-VN') : '—'}</div>
              </div>
              <Link
                to="/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setUserMenuOpen(false)}
              >
                <Cog6ToothIcon className="h-4 w-4" />
                Cài đặt
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
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
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
        >
          Đăng nhập
        </Link>
        <Link
          to="/signup"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Đăng ký
        </Link>
      </div>
    );
  }, [mounted, status, session, userMenuOpen, handleUserMenuToggle, handleSignOut]);

  // Performance warning in development
  if (process.env.NODE_ENV === 'development' && renderCount > 10) {
    console.warn(`⚠️ OptimizedNavBar has rendered ${renderCount} times - consider optimizing further`);
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container flex items-center justify-between py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden shadow">
            <img 
              src="https://png.pngtree.com/png-vector/20250112/ourmid/pngtree-travel-go-logo-blue-and-yellow-design-png-image_15159391.png"
              alt="TravelGo Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 bg-clip-text text-transparent">
            TravelGo
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navigationItems.map(({ href, label, Icon }) => (
            <NavigationItem key={href} href={href} label={label} Icon={Icon} />
          ))}
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
