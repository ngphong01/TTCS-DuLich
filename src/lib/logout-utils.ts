/**
 * Logout Utilities - Tối ưu hóa xử lý đăng xuất
 * Giải quyết vấn đề logout không thành công
 */

import { signOut } from "./use-simple-auth";

/**
 * Enhanced logout function với proper cleanup
 */
export const enhancedSignOut = async (options?: {
  callbackUrl?: string;
  redirect?: boolean;
}) => {
  try {
    console.log('🚪 Starting enhanced logout...');
    
    // Step 1: Clear all client-side storage
    if (typeof window !== 'undefined') {
      // Clear localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('next-auth') || key.includes('auth') || key.includes('session')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear cookies (if possible)
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.includes('next-auth') || name.includes('auth')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        }
      });
    }
    
    // Step 2: Call simple-auth signOut
    console.log('🔄 Calling simple-auth signOut...');
    await signOut({
      redirect: options?.redirect ?? true,
      callbackUrl: options?.callbackUrl ?? '/'
    });
    
    // Step 3: Force cleanup as fallback
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        console.log('🔄 Force reloading page...');
        window.location.href = options?.callbackUrl ?? '/';
      }
    }, 1000);
    
    console.log('✅ Enhanced logout completed');
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    
    // Fallback: Force redirect
    if (typeof window !== 'undefined') {
      window.location.href = options?.callbackUrl ?? '/';
    }
  }
};

/**
 * Logout with session cleanup
 */
export const logoutWithCleanup = async () => {
  try {
    // Clear session data
    if (typeof window !== 'undefined') {
      // Clear all auth-related data
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    }
    
    // Sign out
    await signOut({
      redirect: true,
      callbackUrl: '/'
    });
    
  } catch (error) {
    console.error('Logout cleanup error:', error);
    // Force redirect
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
};

/**
 * Force logout - Last resort
 */
export const forceLogout = () => {
  if (typeof window !== 'undefined') {
    // Clear everything
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    });
    
    // Force redirect
    window.location.href = '/';
  }
};

/**
 * Logout hook với error handling
 */
export const useLogout = () => {
  const handleLogout = async () => {
    try {
      await enhancedSignOut();
    } catch (error) {
      console.error('Logout failed:', error);
      // Try force logout
      forceLogout();
    }
  };
  
  return { handleLogout };
};

/**
 * Debug logout issues
 */
export const debugLogout = () => {
  if (typeof window === 'undefined') return;
  
  console.log('🔍 Debugging logout issues...');
  
  // Check localStorage
  const localStorageKeys = Object.keys(localStorage);
  console.log('📦 localStorage keys:', localStorageKeys);
  
  // Check sessionStorage
  const sessionStorageKeys = Object.keys(sessionStorage);
  console.log('📦 sessionStorage keys:', sessionStorageKeys);
  
  // Check cookies
  const cookies = document.cookie.split(';').map(c => c.trim());
  console.log('🍪 Cookies:', cookies);
  
  // Check NextAuth session
  const nextAuthKeys = localStorageKeys.filter(key => key.includes('next-auth'));
  console.log('🔐 NextAuth keys:', nextAuthKeys);
  
  return {
    localStorage: localStorageKeys,
    sessionStorage: sessionStorageKeys,
    cookies,
    nextAuthKeys
  };
};
