"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from './simple-auth';

interface UseSimpleAuthReturn {
  data: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  user: User | null;
}

interface SimpleAuthContextType extends UseSimpleAuthReturn {
  refreshSession: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | null>(null);

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData.user) {
          setSession(sessionData);
          setStatus('authenticated');
        } else {
          setSession(null);
          setStatus('unauthenticated');
        }
      } else {
        setSession(null);
        setStatus('unauthenticated');
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setSession(null);
      setStatus('unauthenticated');
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const refreshSession = async () => {
    await checkSession();
  };

  const value: SimpleAuthContextType = {
    data: session,
    status,
    user: session?.user || null,
    refreshSession,
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export function useSimpleAuth(): UseSimpleAuthReturn {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useSimpleAuth must be used within SimpleAuthProvider');
  }
  return context;
}

// Simple signOut function
export async function signOut(options?: { redirect?: boolean; callbackUrl?: string }) {
  try {
    // Clear session cookie
    await fetch('/api/auth/signout', { method: 'POST' });
    
    if (options?.redirect !== false) {
      window.location.href = options?.callbackUrl || '/';
    }
  } catch (error) {
    console.error('Sign out error:', error);
  }
}