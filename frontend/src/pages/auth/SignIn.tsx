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
      const decodedError = decodeURIComponent(errorParam);
      
      // Improve error messages for better user experience
      let userFriendlyError = decodedError;
      
      if (decodedError.includes('Google OAuth') || decodedError.includes('invalid_client')) {
        userFriendlyError = 'Không thể đăng nhập bằng Google. Vui lòng thử lại sau hoặc đăng nhập bằng email/mật khẩu.';
      } else if (decodedError.includes('no_code')) {
        userFriendlyError = 'Không nhận được mã xác thực từ Google. Vui lòng thử lại.';
      } else if (decodedError.includes('configuration')) {
        userFriendlyError = 'Lỗi cấu hình đăng nhập Google. Vui lòng liên hệ quản trị viên.';
      }
      
      setError(userFriendlyError);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    const candidate = urlToken || cookieToken || existing;
    if (!candidate) return;

    const validate = async (t: string) => {
      try {
        console.log('🔍 SignIn: Validating token...', { tokenLength: t.length, tokenPreview: `${t.substring(0, 20)}...` });
        const res = await fetch('/api/auth/user', { 
          headers: { Authorization: `Bearer ${t}` },
          credentials: 'include',
        });
        console.log('📡 SignIn: Response status:', res.status);
        const json = await res.json();
        console.log('📊 SignIn: Response data:', { authenticated: json?.authenticated, hasUser: !!json?.user, error: json?.error });
        
        if (json?.authenticated && json?.user) {
          console.log('✅ SignIn: Token valid, user authenticated:', json.user.email);
          localStorage.setItem('tg_token', t);
          if (urlToken) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('token');
            window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
          }
          navigate('/account', { replace: true });
        } else {
          console.log('❌ SignIn: Token validation failed', { authenticated: json?.authenticated, error: json?.error });
          localStorage.removeItem('tg_token');
          if (json?.error) {
            setError(`Đăng nhập thất bại: ${json.error}`);
          } else {
            setError('Token không hợp lệ. Vui lòng đăng nhập lại.');
          }
        }
      } catch (error) {
        console.error('💥 SignIn: Error validating token:', error);
        localStorage.removeItem('tg_token');
        setError('Lỗi kết nối. Vui lòng thử lại.');
      }
    };
    validate(candidate);
  }, [searchParams, navigate]);

  const buildOAuthUrl = (provider: 'google' | 'github') => {
    const upper = provider.toUpperCase();
    const authUrl = (process.env[`REACT_APP_OAUTH_${upper}_AUTH_URL` as any] as string) || '';
    const clientId = (process.env[`REACT_APP_OAUTH_${upper}_CLIENT_ID` as any] as string) || '';
    const scope = (process.env[`REACT_APP_OAUTH_${upper}_SCOPE` as any] as string) || '';
    
    // Backend runs on port 3000, frontend proxy handles /api routes
    // For OAuth redirect, we need the actual backend URL
    const backendBase = process.env.REACT_APP_BACKEND_URL 
      ? process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '')
      : 'http://localhost:3000'; // Backend port
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
    let loginSucceeded = false;
    
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    
    console.log('🔍 Frontend login attempt:', { 
      email: normalizedEmail, 
      passwordLength: normalizedPassword.length,
      emailOriginal: email,
      passwordOriginalLength: password.length
    });
    
    try {
      const payload: Record<string, unknown> = {
        email: normalizedEmail,
        password: normalizedPassword,
      };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
        console.error('❌ Login failed:', { status: response.status, data });
        const errorMessage = data?.message || data?.error || 'Sai tài khoản hoặc mật khẩu';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('tg_token', data.token);
      }

      if (data.user) {
        loginSucceeded = true;
        const userRole = data.user.role;
        if (userRole === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/account');
        }
      } else if (data.token) {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl transform group-hover:scale-110 transition-transform duration-300">
              <img 
                src="/uploads/avatars/travelgo-admin.png"
                alt="TravelGo Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-extrabold text-3xl">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Travel</span>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Go</span>
            </span>
          </Link>
          
          <h2 className="text-4xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Chào Mừng Trở Lại!
            </span>
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            Đăng nhập để tiếp tục hành trình khám phá của bạn
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-indigo-200/50">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-3 shadow-inner animate-shake">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Địa Chỉ Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-indigo-500" />
                </div>
                <input
                  type="email"
                  placeholder="email.cua.ban@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value.trim())}
                  onBlur={e => setEmail(e.target.value.trim())}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 font-medium"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-700">Mật Khẩu</label>
                <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-indigo-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={e => setPassword(e.target.value.trim())}
                  className="block w-full pl-12 pr-12 py-4 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 font-medium"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-indigo-500 hover:text-indigo-700 transition-colors"
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
              className="group w-full flex justify-center items-center gap-2 py-4 px-6 border-2 border-transparent rounded-2xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:transform-none"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang Đăng Nhập...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Đăng Nhập
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 mb-8 flex items-center">
            <div className="flex-1 border-t-2 border-gray-200"></div>
            <span className="px-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Hoặc</span>
            <div className="flex-1 border-t-2 border-gray-200"></div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                // Backend runs on port 3000
                const backendBase = process.env.REACT_APP_BACKEND_URL 
                  ? process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '')
                  : 'http://localhost:3000'; // Backend port
                window.location.href = `${backendBase}/api/auth/authorize/google`;
              }}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all text-sm font-bold text-gray-700 hover:text-blue-700 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng Nhập Với Google
            </button>
            
            <button
              type="button"
              onClick={() => window.location.href = buildOAuthUrl('github')}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border-2 border-gray-200 rounded-2xl hover:border-gray-800 hover:bg-gray-800 transition-all text-sm font-bold text-gray-700 hover:text-white shadow-sm hover:shadow-md transform hover:scale-[1.02] group"
            >
              <svg className="w-5 h-5 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
              </svg>
              Đăng Nhập Với GitHub
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 pt-6 border-t-2 border-gray-100">
            <p className="text-center text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/signup" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-full px-5 py-3 shadow-lg border border-indigo-200/50">
            <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs font-bold text-indigo-900">Kết nối bảo mật với mã hóa SSL</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}