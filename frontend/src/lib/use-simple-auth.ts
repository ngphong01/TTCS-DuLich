import React from 'react';

type SessionUser = {
  id?: number;
  email?: string;
  name?: string;
  image?: string | null;
  joinedAt?: string | null;
  updatedAt?: string | null;
  role?: 'USER' | 'ADMIN';
};

// Singleton cache to prevent repeated fetch loops in dev/StrictMode
let sessionCache: { user?: SessionUser } | null | undefined;
let sessionPromise: Promise<{ user?: SessionUser } | null> | null = null;

export function useSimpleAuth() {
  const [data, setData] = React.useState<{ user?: SessionUser } | null>(sessionCache ?? null);
  const [status, setStatus] = React.useState<'loading' | 'authenticated' | 'unauthenticated'>(sessionCache ? 'authenticated' : 'loading');
  const ranRef = React.useRef(false);

  const fetchSession = React.useCallback(async () => {
    const token = localStorage.getItem('tg_token');
    if (!token) {
      sessionCache = null;
      setData(null);
      setStatus('unauthenticated');
      return;
    }
    try {
      if (!sessionPromise) {
        sessionPromise = fetch('/api/auth/user', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        })
        .then(r => r.json())
        .then(json => (json?.authenticated && json?.user) ? { user: { id: json.user.id, email: json.user.email, name: json.user.name, image: json.user.avatarUrl || json.user.picture || null, joinedAt: json.user.createdAt || null, updatedAt: json.user.updatedAt || null, role: json.user.role || 'USER' } } : null)
        .catch(() => null);
      }
      const result = await sessionPromise;
      sessionCache = result;
      if (result) {
        setData(result);
        setStatus('authenticated');
      } else {
        setData(null);
        setStatus('unauthenticated');
      }
    } finally {
      sessionPromise = null;
    }
  }, []);

  React.useEffect(() => {
    if (ranRef.current) return; // guard against StrictMode double invoke
    ranRef.current = true;
    fetchSession();
  }, [fetchSession]);

  // Refresh session when avatar is updated
  React.useEffect(() => {
    const handler = () => fetchSession();
    window.addEventListener('avatar-updated', handler as any);
    return () => window.removeEventListener('avatar-updated', handler as any);
  }, []);

  return { user: data?.user || null, data, status } as const;
}

export function signOut() {
  localStorage.removeItem('tg_token');
  document.cookie = 'tg_token=; Max-Age=0; path=/;';
}

export function SimpleAuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  return React.createElement(React.Fragment, {}, children);
}

