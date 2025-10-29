"use client";
import { useEffect, useState } from "react";

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
  error?: string;
}

export default function DebugSessionPage() {
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cookies, setCookies] = useState<string>("");
  const [apiResponse, setApiResponse] = useState<any>(null);

  useEffect(() => {
    // Get cookies from browser
    setCookies(document.cookie);
    
    // Test API call
    const testApi = async () => {
      try {
        console.log('🔍 Debug: Testing /api/auth/user...');
        
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📡 Debug: Response status:', response.status);
        console.log('📡 Debug: Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('📊 Debug: Response data:', data);
        
        setUserData(data);
        setApiResponse({
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          data: data
        });
        
      } catch (error) {
        console.error('💥 Debug: Error:', error);
        setApiResponse({
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setLoading(false);
      }
    };

    testApi();
  }, []);

  const testLogin = () => {
    window.location.href = '/api/auth/oauth/google';
  };

  const clearCookies = () => {
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 Debug Session Management</h1>
        
        {/* Current Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Current Status</h2>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Loading...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>Authenticated:</strong> {userData?.authenticated ? '✅ Yes' : '❌ No'}</p>
              {userData?.user && (
                <>
                  <p><strong>Name:</strong> {userData.user.name}</p>
                  <p><strong>Email:</strong> {userData.user.email}</p>
                  <p><strong>Provider:</strong> {userData.user.provider}</p>
                </>
              )}
              {userData?.error && (
                <p className="text-red-600"><strong>Error:</strong> {userData.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Browser Cookies */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🍪 Browser Cookies</h2>
          <div className="bg-gray-100 p-3 rounded font-mono text-sm break-all">
            {cookies || 'No cookies found'}
          </div>
        </div>

        {/* API Response */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📡 API Response</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🎯 Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={testLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Login
            </button>
            <button
              onClick={clearCookies}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear All Cookies
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Refresh Page
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🧭 Navigation</h2>
          <div className="flex gap-4">
            <a
              href="/account"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Go to Account Page
            </a>
            <a
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
