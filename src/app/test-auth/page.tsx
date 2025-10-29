'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState('');
  const router = useRouter();

  // Check current session
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setDebug('Checking session...');
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      setDebug(`Session response: ${JSON.stringify(data, null, 2)}`);
      
      if (data.status === 'success' && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setDebug(`Session error: ${error}`);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setDebug('Redirecting to Google OAuth...');
    // Redirect to Google OAuth
    window.location.href = '/api/auth/oauth/google';
  };

  const handleLogout = async () => {
    try {
      setDebug('Logging out...');
      // Clear session cookie
      document.cookie = 'simple-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      setUser(null);
      setDebug('Logged out');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setDebug(`Logout error: ${error}`);
    }
  };

  const testGoogleOAuth = async () => {
    try {
      setDebug('Testing Google OAuth...');
      const response = await fetch('/api/test-google-oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'test-code' })
      });
      const data = await response.json();
      setDebug(`OAuth test: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setDebug(`OAuth test error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Test Authentication</h1>
        
        {user ? (
          <div className="text-center">
            <div className="mb-4">
              {user.image && (
                <img 
                  src={user.image} 
                  alt={user.name}
                  className="w-16 h-16 rounded-full mx-auto mb-2"
                />
              )}
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">Role: {user.role}</p>
              <p className="text-sm text-gray-500">
                Email Verified: {user.emailVerified ? '✅' : '❌'}
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Not logged in</p>
            
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition disabled:opacity-50"
            >
              {loading ? 'Redirecting...' : 'Login with Google'}
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t space-y-2">
          <button
            onClick={checkSession}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
          >
            Refresh Session
          </button>
          
          <button
            onClick={testGoogleOAuth}
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition"
          >
            Test Google OAuth
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>Session API: <code>/api/auth/session</code></p>
          <p>Google OAuth: <code>/api/auth/oauth/google</code></p>
        </div>

        {debug && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-xs">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <pre className="whitespace-pre-wrap">{debug}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
