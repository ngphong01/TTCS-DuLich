// Session utilities for proper cleanup
export const clearSessionData = () => {
  if (typeof window !== 'undefined') {
    // Clear localStorage
    localStorage.removeItem('simple-session');
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear any other auth-related storage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('next-auth') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
  }
};

export const forceSessionRefresh = () => {
  if (typeof window !== 'undefined') {
    // Force reload to clear all cached state
    window.location.reload();
  }
};

export const signOutWithCleanup = async (signOut: (options?: { callbackUrl?: string; redirect?: boolean }) => Promise<void>) => {
  try {
    // Clear session data first
    clearSessionData();
    
    // Sign out with redirect
    await signOut({ 
      callbackUrl: "/",
      redirect: true
    });
    
    // Force page reload as fallback
    forceSessionRefresh();
  } catch (error) {
    console.error("SignOut error:", error);
    // Fallback: force reload
    forceSessionRefresh();
  }
};