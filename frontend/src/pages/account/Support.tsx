import { useState } from "react";
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  DocumentTextIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import AccountSidebar from "../../components/AccountSidebar";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(false);

    if (!subject.trim() || !message.trim()) {
      setError("Vui lòng điền đầy đủ thông tin");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/account/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, category }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Gửi yêu cầu thất bại");
      }
      setOk(true);
      setSubject("");
      setMessage("");
      setCategory("general");
      setTimeout(() => setOk(false), 5000);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'general', label: 'Câu hỏi chung', icon: QuestionMarkCircleIcon },
    { value: 'booking', label: 'Đặt chỗ', icon: DocumentTextIcon },
    { value: 'payment', label: 'Thanh toán', icon: EnvelopeIcon },
    { value: 'technical', label: 'Kỹ thuật', icon: LightBulbIcon },
  ];

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
          <div className="lg:col-span-3 space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-6 py-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Trung tâm hỗ trợ</h1>
                    <p className="text-white/90 mt-1">Chúng tôi luôn sẵn sàng giúp đỡ bạn</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {ok && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircleIcon className="w-7 h-7 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Gửi yêu cầu thành công!</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Chúng tôi đã nhận được yêu cầu của bạn và sẽ phản hồi qua email trong vòng 24 giờ.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <ClockIcon className="w-4 h-4" />
                      <span>Thời gian phản hồi trung bình: 2-4 giờ</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <ExclamationTriangleIcon className="w-7 h-7 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 mb-1">Có lỗi xảy ra</h3>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Support Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5 text-teal-600" />
                      Gửi yêu cầu hỗ trợ
                    </h2>
                  </div>

                  <form onSubmit={submit} className="p-6 space-y-6">
                    {/* Category Selection */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                        <QuestionMarkCircleIcon className="w-4 h-4 text-gray-500" />
                        Danh mục
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {categories.map((cat) => {
                          const Icon = cat.icon;
                          return (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => setCategory(cat.value)}
                              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                                category === cat.value
                                  ? 'border-teal-500 bg-teal-50'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                category === cat.value ? 'bg-teal-100' : 'bg-gray-100'
                              }`}>
                                <Icon className={`w-5 h-5 ${
                                  category === cat.value ? 'text-teal-600' : 'text-gray-600'
                                }`} />
                              </div>
                              <span className={`text-sm font-semibold ${
                                category === cat.value ? 'text-teal-900' : 'text-gray-700'
                              }`}>
                                {cat.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Subject Field */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                        <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-500" />
                        Chủ đề
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-200 to-cyan-300 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        <div className="relative">
                          <input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white font-medium"
                            placeholder="Ví dụ: Tôi gặp sự cố với đặt chỗ..."
                            required
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">Mô tả ngắn gọn vấn đề của bạn</p>
                    </div>

                    {/* Message Field */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                        <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                        Nội dung chi tiết
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-indigo-300 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        <div className="relative">
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={8}
                            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white font-medium resize-none"
                            placeholder="Mô tả chi tiết vấn đề của bạn, bao gồm các bước bạn đã thực hiện và thông tin liên quan..."
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">Cung cấp càng nhiều thông tin càng tốt</p>
                        <p className="text-xs text-gray-400">{message.length} ký tự</p>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading || !subject.trim() || !message.trim()}
                      className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Đang gửi...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <PaperAirplaneIcon className="w-5 h-5" />
                          Gửi yêu cầu hỗ trợ
                        </span>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Contact Info Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Contact Methods */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PhoneIcon className="w-5 h-5 text-teal-600" />
                    Liên hệ trực tiếp
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <PhoneIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Hotline</p>
                        <p className="text-sm font-bold text-gray-900">1900 xxxx</p>
                        <p className="text-xs text-gray-600 mt-1">24/7 hỗ trợ</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <EnvelopeIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                        <p className="text-sm font-bold text-gray-900">support@travelgo.vn</p>
                        <p className="text-xs text-gray-600 mt-1">Phản hồi trong 24h</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Time */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Thời gian phản hồi</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Email: 2-4 giờ</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Hotline: Ngay lập tức</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Form: 24 giờ</span>
                    </li>
                  </ul>
                </div>

                {/* FAQ Link */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <LightBulbIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Câu hỏi thường gặp</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Tìm câu trả lời nhanh cho các câu hỏi phổ biến
                  </p>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm">
                    Xem FAQ
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