// components/auth/OTPVerification.tsx
// Component xác thực OTP qua Email - "Ngon - Bổ - Rẻ"
import React, { useState, useRef, useEffect } from 'react';

// Types
interface OTPVerificationProps {
  email?: string;
  onSuccess?: (data: VerificationResult) => void;
  onCancel?: () => void;
  purpose?: string;
  autoSend?: boolean;
  mode?: 'verify' | 'login';
}

interface VerificationResult {
  success: boolean;
  email: string;
  verifiedAt?: Date;
  token?: string;
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

// API Base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email: initialEmail = '',
  onSuccess,
  onCancel,
  purpose = 'xác thực email',
  autoSend = false,
  mode = 'verify',
}) => {
  // States
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Refs for OTP inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-send OTP if email is provided
  useEffect(() => {
    if (initialEmail && autoSend) {
      handleSendOTP();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 'otp') {
      setCanResend(true);
    }
  }, [countdown, step]);

  // Focus first OTP input when entering OTP step
  useEffect(() => {
    if (step === 'otp' && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  // API Calls
  const handleSendOTP = async () => {
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Không thể gửi mã OTP');
      }

      setStep('otp');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/api/otp/verify-and-login' : '/api/otp/verify';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Mã OTP không đúng');
      }

      setStep('success');
      
      // Store token if login mode
      if (mode === 'login' && data.token) {
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
      }

      // Callback
      setTimeout(() => {
        onSuccess?.({
          success: true,
          email,
          verifiedAt: new Date(),
          token: data.token,
          user: data.user,
        });
      }, 1500);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/otp/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Không thể gửi lại mã');
      }

      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // OTP Input Handlers
  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && index === 5 && newOtp.every(d => d !== '')) {
      setTimeout(() => handleVerifyOTP(), 300);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleVerifyOTP();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      setTimeout(() => handleVerifyOTP(), 300);
    }
  };

  // Render
  return (
    <div className="w-full max-w-md mx-auto animate-fadeIn">
      {/* Email Step */}
      {step === 'email' && (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-center relative">
            <div className="text-6xl mb-4 animate-bounce">📧</div>
            <h2 className="text-2xl font-bold text-white">Xác thực Email</h2>
            <p className="text-white/80 mt-2">Nhập email để nhận mã OTP</p>
          </div>

          {/* Body */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-lg"
                    disabled={loading}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    ✉️
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-shake">
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSendOTP}
                disabled={loading || !email}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Gửi mã OTP
                  </>
                )}
              </button>

              {/* Cancel Button */}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  Hủy bỏ
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OTP Step */}
      {step === 'otp' && (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 text-center">
            <div className="text-6xl mb-4 animate-pulse">🔐</div>
            <h2 className="text-2xl font-bold text-white">Nhập mã OTP</h2>
            <p className="text-white/80 mt-2">
              Mã đã được gửi đến <span className="font-semibold">{email}</span>
            </p>
          </div>

          {/* Body */}
          <div className="p-8">
            <div className="space-y-6">
              {/* OTP Inputs */}
              <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all
                      ${error ? 'border-red-400 bg-red-50' : digit ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-gray-50'}
                      focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100`}
                    disabled={loading}
                  />
                ))}
              </div>

              {/* Timer & Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-gray-500">
                    Gửi lại mã sau <span className="font-bold text-indigo-600">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                  >
                    🔄 Gửi lại mã OTP
                  </button>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-shake">
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              {/* Verify Button */}
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.some(d => !d)}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Đang xác thực...
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    Xác nhận
                  </>
                )}
              </button>

              {/* Back Button */}
              <button
                onClick={() => {
                  setStep('email');
                  setError('');
                  setOtp(['', '', '', '', '', '']);
                }}
                className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>←</span>
                Thay đổi email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Step */}
      {step === 'success' && (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-xl animate-bounce">
              <span className="text-5xl">✅</span>
            </div>

            <h2 className="text-3xl font-bold text-white">
              Xác thực thành công!
            </h2>

            <p className="text-white/90 mt-3">
              Email <span className="font-semibold">{email}</span> đã được xác thực
            </p>

            <div className="mt-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                <span className="animate-spin">⏳</span>
                Đang chuyển hướng...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact OTP Input Component (for inline use)
export const OTPInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
}> = ({ value, onChange, length = 6, disabled, error }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('').concat(Array(length - value.length).fill(''));

  const handleChange = (index: number, digit: string) => {
    if (digit && !/^\d$/.test(digit)) return;
    
    const newValue = digits.map((d, i) => (i === index ? digit : d)).join('');
    onChange(newValue);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-2" onPaste={handlePaste}>
      {digits.slice(0, length).map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          className={`w-10 h-12 text-center text-xl font-bold rounded-lg border-2 outline-none transition-all
            ${error ? 'border-red-400 bg-red-50' : digit ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'}
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
            disabled:bg-gray-100 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
};

export default OTPVerification;
