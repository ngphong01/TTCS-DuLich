import { useState } from 'react';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  UserIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import MapEmbed from '../components/MapEmbed';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsSubmitting(false);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Branch offices
  const branches = [
    {
      city: 'Hà Nội',
      address: '123 Đường Láng, Đống Đa, Hà Nội',
      phone: '024 1234 5678',
      email: 'hanoi@travelgo.vn',
      hours: '8:00 - 18:00',
    },
    {
      city: 'TP.HCM',
      address: '456 Nguyễn Huệ, Quận 1, TP.HCM',
      phone: '028 9876 5432',
      email: 'hcmc@travelgo.vn',
      hours: '8:00 - 18:00',
    },
    {
      city: 'Đà Nẵng',
      address: '789 Trần Phú, Hải Châu, Đà Nẵng',
      phone: '0236 5555 8888',
      email: 'danang@travelgo.vn',
      hours: '8:00 - 17:00',
    },
  ];

  // Support channels
  const supportChannels = [
    {
      name: 'Messenger',
      icon: '💬',
      link: '#',
      description: 'Chat trực tiếp trên Facebook Messenger',
    },
    {
      name: 'Zalo',
      icon: '💙',
      link: '#',
      description: 'Liên hệ qua Zalo OA',
    },
    {
      name: 'Telegram',
      icon: '✈️',
      link: '#',
      description: 'Hỗ trợ nhanh qua Telegram',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-2.5 mb-6">
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              <span className="font-semibold">Liên hệ & Hỗ trợ</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ để được tư vấn tốt nhất.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhoneIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hotline</h3>
            <p className="text-2xl font-bold text-blue-600 mb-2">1900 1234</p>
            <p className="text-gray-600">24/7 hỗ trợ khách hàng</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-2 border-purple-200 hover:border-purple-400 transition-colors">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <EnvelopeIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
            <p className="text-lg font-semibold text-purple-600 mb-2">support@travelgo.vn</p>
            <p className="text-gray-600">Phản hồi trong 24 giờ</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-2 border-pink-200 hover:border-pink-400 transition-colors">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPinIcon className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Địa chỉ</h3>
            <p className="text-lg text-gray-700 mb-2">123 Đường ABC, Quận XYZ</p>
            <p className="text-gray-600">TP.HCM, Việt Nam</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6">Gửi yêu cầu</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                <p className="text-green-700 font-semibold">
                  Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập họ và tên"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0900 123 456"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chủ đề <span className="text-red-500">*</span>
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn chủ đề</option>
                  <option value="tour">Tư vấn tour</option>
                  <option value="booking">Đặt tour</option>
                  <option value="payment">Thanh toán</option>
                  <option value="refund">Hoàn tiền</option>
                  <option value="complaint">Khiếu nại</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nội dung yêu cầu <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Mô tả chi tiết yêu cầu của bạn..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>Đang gửi...</>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-5 w-5" />
                    Gửi yêu cầu
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Map & Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Văn phòng chính</h2>
              <MapEmbed query="TravelGo Vietnam" className="mb-4" />
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Địa chỉ</p>
                    <p className="text-gray-600">123 Đường ABC, Quận XYZ, TP.HCM, Việt Nam</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ClockIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Giờ làm việc</p>
                    <p className="text-gray-600">Thứ 2 - Chủ nhật: 8:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Support */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                Hỗ trợ trực tuyến
              </h3>
              <p className="text-gray-700 mb-4">
                Chat trực tiếp với chúng tôi để được hỗ trợ nhanh chóng
              </p>
              <div className="grid grid-cols-3 gap-3">
                {supportChannels.map((channel, i) => (
                  <a
                    key={i}
                    href={channel.link}
                    className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition-all"
                  >
                    <div className="text-3xl mb-2">{channel.icon}</div>
                    <div className="text-sm font-semibold text-gray-900">{channel.name}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* Chatbot Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <GlobeAltIcon className="h-6 w-6 text-purple-600" />
                Chatbot tự động
              </h3>
              <p className="text-gray-700">
                Trả lời câu hỏi nhanh chóng 24/7. Hãy thử hỏi về tour, giá cả, hoặc bất kỳ thắc mắc nào!
              </p>
              <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                Mở chatbot
              </button>
            </div>
          </div>
        </div>

        {/* Branch Offices */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Chi nhánh & Đại lý</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branches.map((branch, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">{branch.city}</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <span>{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <span>{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <span>{branch.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <span>{branch.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Đăng ký nhận bản tin</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Nhận thông tin ưu đãi độc quyền, điểm đến mới và tin tức du lịch mỗi tuần
          </p>
          <form className="max-w-xl mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              className="flex-1 px-6 py-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/50"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-lg whitespace-nowrap"
            >
              Đăng ký ngay
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}