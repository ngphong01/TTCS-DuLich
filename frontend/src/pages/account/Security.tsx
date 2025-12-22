import { useState } from "react";
import { Link } from 'react-router-dom';
import { 
  ShieldCheckIcon,
  LockClosedIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  DevicePhoneMobileIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';
import AccountSidebar from "../../components/AccountSidebar";

export default function AccountSecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(false);
    
    if (!newPassword || newPassword !== confirm) {
      setError("Mật khẩu mới không khớp.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Đổi mật khẩu thất bại");
      }
      setOk(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setTimeout(() => setOk(false), 3000);
    } catch (e: unknown) {
      const error = e as { message?: string };
      setError(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <AccountSidebar />
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <ShieldCheckIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Bảo mật tài khoản</h1>
                    <p className="text-white/90 mt-1">Quản lý mật khẩu và cài đặt bảo mật</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Change Password Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <KeyIcon className="w-5 h-5 text-indigo-600" />
                      Đổi mật khẩu
                    </h2>
                  </div>

                  <form onSubmit={submit} className="p-6 space-y-6">
                    {/* Success Message */}
                    {ok && (
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-4 animate-fade-in">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-green-800">Đổi mật khẩu thành công!</p>
                            <p className="text-xs text-green-700 mt-1">Mật khẩu của bạn đã được cập nhật.</p>
                          </div>
                        </div>
                      </div>
                    )}

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
                            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white focus:bg-white pr-12 font-medium"
                            placeholder="Nhập mật khẩu hiện tại"
                            autoComplete="current-password"
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
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
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
                      {confirm && (
                        <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${
                          newPassword === confirm ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {newPassword === confirm ? (
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

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading || !currentPassword || !newPassword || !confirm || newPassword !== confirm}
                      className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Đang xử lý...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <KeyIcon className="w-5 h-5" />
                          Đổi mật khẩu
                        </span>
                      )}
                    </button>

                    {/* Forgot Password Link */}
                    <div className="text-center pt-4 border-t border-gray-200">
                      <Link 
                        to="/forgot-password" 
                        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        <InformationCircleIcon className="w-4 h-4" />
                        Quên mật khẩu?
                      </Link>
                    </div>
                  </form>
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

                {/* Two-Factor Authentication */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DevicePhoneMobileIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Xác thực 2 yếu tố</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Tăng cường bảo mật với xác thực hai yếu tố (2FA)
                  </p>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm">
                    Bật 2FA
                  </button>
                </div>

                {/* Biometric */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FingerPrintIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Sinh trắc học</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Đăng nhập bằng vân tay hoặc Face ID
                  </p>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm">
                    Thiết lập
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}