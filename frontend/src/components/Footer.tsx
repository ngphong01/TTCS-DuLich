import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  GlobeAltIcon,
  HeartIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                <img 
                  src="/uploads/avatars/travelgo-admin.png"
                  alt="TravelGo Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                TravelGo
              </span>
            </Link>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Nền tảng du lịch hàng đầu giúp bạn khám phá những điểm đến tuyệt vời trên khắp thế giới. 
              Đặt chỗ nhanh chóng, giá cả hợp lý và trải nghiệm không thể quên.
            </p>
            
            {/* Social Media */}
            <div className="flex items-center gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-400 flex items-center justify-center transition-all hover:scale-110"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 flex items-center justify-center transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-110"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-bold mb-4 text-blue-400">Điều hướng</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/destinations" 
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <MapPinIcon className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                  <span>Điểm đến</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/categories" 
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <GlobeAltIcon className="w-4 h-4 group-hover:text-teal-400 transition-colors" />
                  <span>Danh mục</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/featured" 
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <HeartIcon className="w-4 h-4 group-hover:text-pink-400 transition-colors" />
                  <span>Nổi bật</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/deals" 
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <svg className="w-4 h-4 group-hover:text-yellow-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Ưu đãi</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/stories" 
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <svg className="w-4 h-4 group-hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Câu chuyện</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-base font-bold mb-4 text-teal-400">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <a 
                  href="#faq" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a 
                  href="#terms" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a 
                  href="#privacy" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a 
                  href="#refund" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Chính sách hoàn tiền
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base font-bold mb-4 text-pink-400">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <BuildingOfficeIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Địa chỉ:</p>
                  <p className="text-white text-sm">6/160 Tân Triều</p>
                  <p className="text-white text-sm">Thanh Trì, Hà Nội</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Hotline:</p>
                  <a href="tel:0868156027" className="text-white text-sm hover:text-blue-400 transition-colors">
                    0868156027
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <EnvelopeIcon className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Email:</p>
                  <a 
                    href="mailto:phong@triennguyen.com" 
                    className="text-white text-sm hover:text-blue-400 transition-colors break-all"
                  >
                    phong@triennguyen.com
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <GlobeAltIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Website:</p>
                  <a 
                    href="https://travelgo.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white text-sm hover:text-blue-400 transition-colors"
                  >
                    www.travelgo.com
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-gray-400 text-xs text-center md:text-left">
              © {currentYear} <span className="text-white font-semibold">TravelGo</span>. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <a href="#terms" className="text-gray-400 hover:text-white transition-colors">
                Điều khoản
              </a>
              <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">
                Bảo mật
              </a>
              <a href="#cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
