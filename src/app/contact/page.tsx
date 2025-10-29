"use client";
import { useState } from "react";
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  UserIcon,
  PaperAirplaneIcon
} from "@heroicons/react/24/outline";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");
  };

  return (
    <main className="container">
      {/* Hero Section */}
      <section className="mt-10 sm:mt-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Liên hệ với chúng tôi
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với đội ngũ TravelGo 
            để được tư vấn và giải đáp mọi thắc mắc về du lịch.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhoneIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Hotline</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">1900 1234 567</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Hỗ trợ 24/7</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <EnvelopeIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">support@travelgo.vn</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Phản hồi trong 2h</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPinIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Văn phòng</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">123 Nguyễn Huệ, Q1, TP.HCM</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">T2-T6: 8h-18h</p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Contact Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gửi tin nhắn</h2>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Họ và tên *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Nhập họ và tên"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Nhập email của bạn"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chủ đề
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Chọn chủ đề</option>
                <option value="booking">Đặt chỗ & Thanh toán</option>
                <option value="tour">Tour & Dịch vụ</option>
                <option value="support">Hỗ trợ kỹ thuật</option>
                <option value="feedback">Góp ý & Phản hồi</option>
                <option value="partnership">Hợp tác</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tin nhắn *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Hãy chia sẻ câu hỏi hoặc góp ý của bạn..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              Gửi tin nhắn
            </button>

            {sent && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="font-medium">Đã gửi thành công! Chúng tôi sẽ phản hồi sớm nhất.</span>
              </div>
            )}
          </form>
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          {/* Office Hours */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Giờ làm việc</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Thứ 2 - Thứ 6:</span>
                <span className="font-medium text-gray-900 dark:text-white">8:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Thứ 7:</span>
                <span className="font-medium text-gray-900 dark:text-white">8:00 - 12:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Chủ nhật:</span>
                <span className="font-medium text-gray-900 dark:text-white">Nghỉ</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Hotline 24/7:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">1900 1234 567</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Câu hỏi thường gặp
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Làm thế nào để đặt chỗ?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Bạn có thể đặt chỗ trực tuyến qua website hoặc gọi hotline 1900 1234 567.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Thời gian xử lý yêu cầu?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Chúng tôi sẽ phản hồi email trong vòng 2 giờ, hotline ngay lập tức.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Có hỗ trợ hoàn tiền không?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Có, chúng tôi hỗ trợ hoàn tiền 100% nếu hủy trước 24h.
                </p>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-900/20 dark:to-orange-900/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Theo dõi chúng tôi
            </h3>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-[#1877f2] flex items-center justify-center hover:opacity-90 transition">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor" aria-hidden="true"><path d="M22 12.06C22 6.477 17.523 2 11.94 2 6.358 2 1.88 6.477 1.88 12.06c0 4.999 3.657 9.144 8.438 9.94v-7.03H7.897v-2.91h2.42V9.845c0-2.39 1.423-3.709 3.6-3.709 1.043 0 2.134.186 2.134.186v2.35h-1.203c-1.186 0-1.557.736-1.557 1.49v1.79h2.648l-.423 2.91h-2.225V22c4.78-.796 8.43-4.941 8.43-9.94z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center hover:opacity-90 transition">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor" aria-hidden="true"><path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.054 1.96.24 2.41.4.61.236 1.05.518 1.51.977.46.46.74.9.98 1.51.16.45.347 1.24.4 2.41.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.053 1.17-.24 1.96-.4 2.41-.236.61-.518 1.05-.977 1.51-.46.46-.9.74-1.51.98-.45.16-1.24.347-2.41.4-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.053-1.96-.24-2.41-.4a4.39 4.39 0 0 1-1.51-.977 4.39 4.39 0 0 1-.98-1.51c-.16-.45-.347-1.24-.4-2.41C2.212 15.584 2.2 15.2 2.2 12s.012-3.584.07-4.85c.053-1.17.24-1.96.4-2.41.236-.61.518-1.05.977-1.51.46-.46.9-.74 1.51-.98.45-.16 1.24-.347 2.41-.4C8.416 2.212 8.8 2.2 12 2.2Zm0 1.8c-3.16 0-3.53.012-4.77.07-.98.045-1.51.208-1.86.345-.47.182-.8.4-1.15.75-.35.35-.57.68-.75 1.15-.137.35-.3.88-.345 1.86-.058 1.24-.07 1.61-.07 4.77s.012 3.53.07 4.77c.045.98.208 1.51.345 1.86.182.47.4.8.75 1.15.35.35.68.57 1.15.75.35.137.88.3 1.86.345 1.24.058 1.61.07 4.77.07s3.53-.012 4.77-.07c.98-.045 1.51-.208 1.86-.345.47-.182.8-.4 1.15-.75.35-.35.57-.68.75-1.15.137-.35.3-.88.345-1.86.058-1.24.07-1.61.07-4.77s-.012-3.53-.07-4.77c-.045-.98-.208-1.51-.345-1.86-.182-.47-.4-.8-.75-1.15-.35-.35-.68-.57-1.15-.75-.35-.137-.88-.3-1.86-.345-1.24-.058-1.61-.07-4.77-.07Zm0 3.6a5.4 5.4 0 1 1 0 10.8 5.4 5.4 0 0 1 0-10.8Zm0 1.8a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm5-2.16a1.26 1.26 0 1 1-2.52 0 1.26 1.26 0 0 1 2.52 0Z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X" className="w-10 h-10 rounded-full bg-[#1da1f2] flex items-center justify-center hover:opacity-90 transition">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor" aria-hidden="true"><path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.27 4.27 0 0 0 1.87-2.36 8.53 8.53 0 0 1-2.71 1.04 4.26 4.26 0 0 0-7.26 3.88A12.1 12.1 0 0 1 3.15 4.6a4.25 4.25 0 0 0 1.32 5.68 4.22 4.22 0 0 1-1.93-.53v.05a4.26 4.26 0 0 0 3.42 4.18 4.3 4.3 0 0 1-1.92.07 4.27 4.27 0 0 0 3.99 2.97A8.54 8.54 0 0 1 2 19.54a12.06 12.06 0 0 0 6.53 1.92c7.84 0 12.13-6.49 12.13-12.12 0-.18 0-.36-.01-.54A8.67 8.67 0 0 0 22.46 6Z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-10 h-10 rounded-full bg-[#ff0000] flex items-center justify-center hover:opacity-90 transition">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor" aria-hidden="true"><path d="M23.5 7.2a3 3 0 0 0-2.1-2.1C19.8 4.6 12 4.6 12 4.6s-7.8 0-9.4.5a3 3 0 0 0-2.1 2.1C0 8.8 0 12 0 12s0 3.2.5 4.8a3 3 0 0 0 2.1 2.1c1.6.5 9.4.5 9.4.5s7.8 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.6.5-4.8.5-4.8s0-3.2-.5-4.8ZM9.6 15V9l6 3-6 3Z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}