'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

export default function UserInfo() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/user');
      const data: UserResponse = await response.json();
      
      if (data.authenticated && data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/user', { method: 'DELETE' });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-600">Loading...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {user.picture && (
            <img 
              src={user.picture} 
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="text-sm">
            <p className="font-medium text-gray-900">Welcome, {user.name}!</p>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Link 
        href="/api/auth/oauth/google"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Login with Google
      </Link>
    </div>
  );
}
