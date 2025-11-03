import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle OAuth callback / existing session: validate token before redirect
  useEffect(() => {
    const urlToken = searchParams.get('token');
    const errorParam = searchParams.get('error');

    const cookieTokenMatch = document.cookie.split('; ').find((c) => c.startsWith('tg_token='));
    const cookieToken = cookieTokenMatch ? decodeURIComponent(cookieTokenMatch.split('=')[1]) : null;
    const existing = localStorage.getItem('tg_token');

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    const candidate = urlToken || cookieToken || existing;
    if (!candidate) return;

    const validate = async (t: string) => {
      try {
        const res = await fetch('/api/auth/user', { headers: { Authorization: `Bearer ${t}` } });
        const json = await res.json();
        if (json?.authenticated && json?.user) {
          localStorage.setItem('tg_token', t);
          if (urlToken) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('token');
            window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
          }
          navigate('/account', { replace: true });
        } else {
          localStorage.removeItem('tg_token');
        }
      } catch {
        localStorage.removeItem('tg_token');
      }
    };
    validate(candidate);
  }, [searchParams, navigate]);

  const backendUrl = (process.env.REACT_APP_BACKEND_URL || '/api').replace(/\/$/, '');

  const buildOAuthUrl = (provider: 'google' | 'github') => {
    const upper = provider.toUpperCase();
    const authUrl = (process.env[`REACT_APP_OAUTH_${upper}_AUTH_URL` as any] as string) || '';
    const clientId = (process.env[`REACT_APP_OAUTH_${upper}_CLIENT_ID` as any] as string) || '';
    const scope = (process.env[`REACT_APP_OAUTH_${upper}_SCOPE` as any] as string) || '';
    
    // Use full backend URL for redirect_uri (backend will handle the callback)
    // For production, this should be configured in .env
    const backendBase = process.env.REACT_APP_BACKEND_URL 
      ? process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '')
      : 'http://localhost:3000';
    const redirectUri = `${backendBase}/api/auth/callback/${provider}`;
    
    const state = Math.random().toString(36).slice(2);
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state,
    });
    return `${authUrl}?${params.toString()}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Trim và normalize input
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    
    console.log('🔍 Frontend login attempt:', { 
      email: normalizedEmail, 
      passwordLength: normalizedPassword.length,
      emailOriginal: email,
      passwordOriginalLength: password.length
    });
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword }),
        credentials: 'include',
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      let data: any;
      try {
        const responseText = await response.text();
        console.log('📥 Raw response:', responseText);
        data = JSON.parse(responseText);
        console.log('📦 Parsed data:', data);
      } catch (parseError) {
        console.error('❌ Parse error:', parseError);
        setError('Lỗi phản hồi từ server. Vui lòng thử lại!');
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        // Lỗi từ server (401, 400, etc.)
        console.error('❌ Login failed:', { status: response.status, data });
        const errorMessage = data?.message || data?.error || 'Sai tài khoản hoặc mật khẩu';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Đăng nhập thành công
      if (data.token) {
        localStorage.setItem('tg_token', data.token);
      }

      // Kiểm tra role và redirect
      if (data.user) {
        const userRole = data.user.role;
        if (userRole === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/account');
        }
      } else if (data.token) {
        // Nếu chỉ có token, redirect về account
        navigate('/account');
      } else {
        setError('Phản hồi không hợp lệ từ server');
      }
    } catch (e) {
      console.error('Login error:', e);
      setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow">
              <img 
                src="https://png.pngtree.com/png-vector/20250112/ourmid/pngtree-travel-go-logo-blue-and-yellow-design-png-image_15159391.png"
                alt="TravelGo Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-2xl">
              <span className="text-blue-600">Travel</span>
              <span className="text-purple-600">Go</span>
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Chào mừng trở lại!</h2>
          <p className="text-gray-600 text-sm">Đăng nhập để tiếp tục hành trình của bạn</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value.trim())}
                  onBlur={e => setEmail(e.target.value.trim())}
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={e => setPassword(e.target.value.trim())}
                  className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-base hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">hoặc</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                const backendBase = process.env.REACT_APP_BACKEND_URL 
                  ? process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '')
                  : 'http://localhost:3000';
                window.location.href = `${backendBase}/api/auth/authorize/google`;
              }}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-semibold text-gray-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng nhập với Google
            </button>
            <button
              type="button"
              onClick={() => window.location.href = buildOAuthUrl('github')}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-semibold text-gray-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
              </svg>
              Đăng nhập với GitHub
            </button>
            <button
              type="button"
              onClick={() => window.location.href = `${backendUrl}/api/auth/dev/authorize?state=${Math.random().toString(36).slice(2)}`}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-green-50 border-2 border-green-200 rounded-xl hover:border-green-300 hover:bg-green-100 transition-all text-sm font-semibold text-green-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Đăng nhập Demo (DEV)
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}