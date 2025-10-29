"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect to signin after 5 seconds
    const timer = setTimeout(() => {
      router.push('/signin?message=Password reset successful. Please sign in.');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Password Reset Complete!</h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800 font-medium">Auto-redirect in 5 seconds</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
          </div>

          <div className="space-y-4">
            <Link 
              href="/signin" 
              className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In Now
            </Link>
            
            <Link 
              href="/" 
              className="w-full flex justify-center py-3 px-6 border border-gray-300 rounded-xl shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
            >
              Go to Homepage
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <a href="/contact" className="text-green-600 hover:text-green-500 font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
