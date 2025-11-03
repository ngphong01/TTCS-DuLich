// Logout utils stub
export function enhancedSignOut() {
  // Stub
}

export function useLogout() {
  return {
    handleLogout: async () => {
      // Stub implementation
      localStorage.removeItem('tg_token');
      // Clear cookie token as well
      document.cookie = 'tg_token=; Max-Age=0; path=/;';
      window.location.replace('/signin');
    }
  };
}

