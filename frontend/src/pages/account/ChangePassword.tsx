import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  CheckCircleIcon,
  KeyIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import AccountSidebar from "../../components/AccountSidebar";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const configs = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Yếu', color: 'bg-red-500' },
      { strength: 2, label: 'Trung bình', color: 'bg-yellow-500' },
      { strength: 3, label: 'Tốt', color: 'bg-blue-500' },
      { strength: 4, label: 'Mạnh', color: 'bg-green-500' },
      { strength: 5, label: 'Rất mạnh', color: 'bg-emerald-500' },
    ];

    return configs[strength];
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        setError(data.error || 'Đổi mật khẩu thất bại');
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <AccountSidebar />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 px-6 py-8">
                <Link 
                  to="/account" 
                  className="inline-flex items-center text-white/90 hover:text-white mb-4 font-medium transition-colors group"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Quay lại tài khoản
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <KeyIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Đổi mật khẩu</h1>
                    <p className="text-white/90 mt-1">Cập nhật mật khẩu để bảo mật tài khoản của bạn</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  {success ? (
                    <div className="p-12 text-center">
                      <div className="relative inline-flex mb-6">
                        <div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur opacity-75 animate-pulse"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircleIcon className="h-10 w-10 text-white" />
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Mật khẩu đã được cập nhật!
                      </h2>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Mật khẩu của bạn đã được thay đổi thành công. Tài khoản của bạn hiện đã được bảo mật hơn.
                      </p>
                      <Link
                        to="/account"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Quay lại tài khoản
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="p-8">
                      <div className="space-y-6">
                        {/* Current Password */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                            <LockClosedIcon className="w-4 h-4 text-gray-500" />
                            Mật khẩu hiện tại
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                            <div className="relative">
                              <input
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white pr-12 font-medium"
                                placeholder="Nhập mật khẩu hiện tại"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {showCurrentPassword ? 
                                  <EyeSlashIcon className="h-5 w-5" /> : 
                                  <EyeIcon className="h-5 w-5" />
                                }
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">Mật khẩu mới</span>
                          </div>
                        </div>

                        {/* New Password */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                            <KeyIcon className="w-4 h-4 text-gray-500" />
                            Mật khẩu mới
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-300 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                            <div className="relative">
                              <input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white pr-12 font-medium"
                                placeholder="Nhập mật khẩu mới"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {showNewPassword ? 
                                  <EyeSlashIcon className="h-5 w-5" /> : 
                                  <EyeIcon className="h-5 w-5" />
                                }
                              </button>
                            </div>
                          </div>
                          
                          {/* Password Strength Indicator */}
                          {newPassword && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-600">Độ mạnh mật khẩu:</span>
                                <span className={`text-xs font-bold ${
                                  passwordStrength.strength <= 2 ? 'text-red-600' :
                                  passwordStrength.strength === 3 ? 'text-blue-600' :
                                  'text-green-600'
                                }`}>
                                  {passwordStrength.label}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((level) => (
                                  <div
                                    key={level}
                                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                                      level <= passwordStrength.strength
                                        ? passwordStrength.color
                                        : 'bg-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                            <ShieldCheckIcon className="w-4 h-4 text-gray-500" />
                            Xác nhận mật khẩu mới
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-emerald-300 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white pr-12 font-medium"
                                placeholder="Nhập lại mật khẩu mới"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {showConfirmPassword ? 
                                  <EyeSlashIcon className="h-5 w-5" /> : 
                                  <EyeIcon className="h-5 w-5" />
                                }
                              </button>
                            </div>
                          </div>
                          
                          {/* Password Match Indicator */}
                          {confirmPassword && (
                            <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${
                              newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {newPassword === confirmPassword ? (
                                <>
                                  <CheckCircleIcon className="w-4 h-4" />
                                  <span>Mật khẩu khớp</span>
                                </>
                              ) : (
                                <>
                                  <ExclamationTriangleIcon className="w-4 h-4" />
                                  <span>Mật khẩu không khớp</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Error Message */}
                        {error && (
                          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-red-800">{error}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                          className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 hover:from-orange-600 hover:via-red-600 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Đang cập nhật...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <KeyIcon className="w-5 h-5" />
                              Cập nhật mật khẩu
                            </span>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Security Tips Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Security Tips */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <ShieldCheckIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Bảo mật mật khẩu</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Sử dụng ít nhất 8 ký tự</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Kết hợp chữ hoa và chữ thường</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Bao gồm số và ký tự đặc biệt</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Không sử dụng thông tin cá nhân</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Đổi mật khẩu định kỳ</span>
                    </li>
                  </ul>
                </div>

                {/* Additional Security */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <LockClosedIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Bảo mật nâng cao</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Bật xác thực hai yếu tố để tăng cường bảo mật cho tài khoản của bạn.
                  </p>
                  <Link
                    to="/account/security"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Tìm hiểu thêm
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}