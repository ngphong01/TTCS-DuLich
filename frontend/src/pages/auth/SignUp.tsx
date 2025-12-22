import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    let registerSucceeded = false;
    
    try {
      const payload: Record<string, unknown> = { email, password, name };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      
      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Parse error:', parseError);
        setError('Lỗi phản hồi từ server. Vui lòng thử lại!');
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        const errorMessage = data?.message || data?.error || 'Đăng ký thất bại';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (data?.token && data?.user) {
        localStorage.setItem('tg_token', data.token);
        registerSucceeded = true;
        setSuccess(true);
        setLoading(false);
        
        setTimeout(() => {
          if (data?.user?.role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else {
            navigate('/account');
          }
        }, 2000);
      } else {
        setError('Phản hồi không hợp lệ từ server');
        setLoading(false);
      }
    } catch (e) {
      console.error('Register error:', e);
      setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!');
      setLoading(false);
    } finally {
    }
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, label: '', color: '' };
    if (pass.length < 6) return { strength: 33, label: 'Yếu', color: 'bg-red-500' };
    if (pass.length < 10) return { strength: 66, label: 'Trung bình', color: 'bg-yellow-500' };
    return { strength: 100, label: 'Mạnh', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-md w-full relative z-10">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-3 justify-center group">
              <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 bg-white p-2">
                <img
                  src="/uploads/avatars/travelgo-admin.png"
                  alt="TravelGo Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">TG</div>';
                  }}
                />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  TravelGo
                </h1>
                <p className="text-xs text-gray-500">Khám phá thế giới</p>
              </div>
            </Link>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-emerald-200/50">
            <div className="text-center">
              {/* Success Animation */}
              <div className="mx-auto h-24 w-24 relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full animate-ping opacity-20"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-xl">
                  <svg className="h-12 w-12 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Confetti */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>

              <h2 className="text-4xl font-extrabold mb-3">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Chào Mừng Bạn! 🎉
                </span>
              </h2>

              <p className="text-xl font-bold text-gray-900 mb-4">Tạo Tài Khoản Thành Công</p>
              <p className="text-gray-600 text-base mb-6 leading-relaxed">
                Tài khoản của bạn đã được tạo. Sẵn sàng khám phá những điểm đến tuyệt vời!
              </p>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-5 shadow-inner">
                <div className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-emerald-800 text-sm font-bold">
                    Đang chuyển đến tài khoản của bạn...
                  </p>
                </div>
              </div>
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
          
          @keyframes confetti {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
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

          .animate-confetti {
            animation: confetti linear infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105 bg-white p-2">
              <img
                src="/uploads/avatars/travelgo-admin.png"
                alt="TravelGo Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">TG</div>';
                }}
              />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                TravelGo
              </h1>
              <p className="text-xs text-gray-500">Khám phá thế giới</p>
            </div>
          </Link>
          
          <h2 className="text-4xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Tạo Tài Khoản
            </span>
          </h2>
          
          <p className="text-gray-600 text-base leading-relaxed">
            Tham gia cùng chúng tôi và bắt đầu hành trình đến những điểm đến tuyệt vời
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-indigo-200/50">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-4 rounded-2xl text-sm flex items-start gap-3 shadow-inner animate-shake">
              <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                Họ và Tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="Nhập họ và tên của bạn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed font-medium"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                Địa Chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="email.cua.ban@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                Mật Khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tạo mật khẩu mạnh"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-12 py-4 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength */}
              {password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-600">Độ Mạnh Mật Khẩu</span>
                    <span className={`text-xs font-bold ${
                      passwordStrength.strength === 33 ? 'text-red-600' :
                      passwordStrength.strength === 66 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Sử dụng ít nhất 6 ký tự với sự kết hợp của chữ cái và số
                  </p>
                </div>
              )}
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
                  Đang Tạo Tài Khoản...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Tạo Tài Khoản
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t-2 border-gray-100">
            <p className="text-center text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link 
                to="/signin" 
                className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors underline"
              >
                Đăng nhập tại đây
              </Link>
            </p>
          </div>

          {/* Terms */}
          <p className="mt-6 text-xs text-center text-gray-500 leading-relaxed">
            Bằng cách tạo tài khoản, bạn đồng ý với{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 underline">Điều Khoản Dịch Vụ</a>
            {' '}và{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 underline">Chính Sách Bảo Mật</a>
          </p>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-full px-5 py-3 shadow-lg border border-indigo-200/50">
            <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs font-bold text-indigo-900">Dữ liệu của bạn được bảo mật an toàn</span>
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
        
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
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

        .animate-confetti {
          animation: confetti linear infinite;
        }

        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}