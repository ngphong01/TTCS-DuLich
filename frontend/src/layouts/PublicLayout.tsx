import { Link, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { 
  MapPinIcon, 
  TagIcon, 
  ChatBubbleLeftRightIcon, 
  InformationCircleIcon, 
  EnvelopeIcon,
  PhoneIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <header className="sticky top-0 z-30 bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo with gradient icon */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">TG</span>
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight">
              <span className="text-blue-600">Travel</span>
              <span className="text-purple-600">Go</span>
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm text-gray-700">
            <Link className="hover:text-sky-600 transition-colors whitespace-nowrap" to="/destinations">Điểm đến</Link>
            <Link className="hover:text-sky-600 transition-colors whitespace-nowrap" to="/categories">Danh mục</Link>
            <Link className="hover:text-sky-600 transition-colors whitespace-nowrap" to="/destinations?featured=true">Nổi bật</Link>
            <Link className="hover:text-sky-600 transition-colors whitespace-nowrap" to="/stories">Câu chuyện</Link>
            <Link className="hover:text-sky-600 transition-colors whitespace-nowrap" to="/deals">Ưu đãi</Link>
            <Link className="hover:text-sky-600 transition-colors whitespace-nowrap" to="/about">Giới thiệu</Link>
            <Link className="hover:text-sky-600 transition-colors whitespace-nowrap" to="/contact">Liên hệ</Link>
          </nav>

          {/* Auth + Book Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link 
              to="/signin" 
              className="px-3 lg:px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-md transition-all font-medium text-sm whitespace-nowrap"
            >
              Đặt chỗ
            </Link>
            <Link
              to="/signin"
              className="px-3 lg:px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm whitespace-nowrap"
            >
              Đăng nhập
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
              <Link 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-700 hover:text-sky-600 transition-colors"
                to="/destinations"
              >
                Điểm đến
              </Link>
              <Link 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-700 hover:text-sky-600 transition-colors"
                to="/categories"
              >
                Danh mục
              </Link>
              <Link 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-700 hover:text-sky-600 transition-colors"
                to="/destinations?featured=true"
              >
                Nổi bật
              </Link>
              <Link 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-700 hover:text-sky-600 transition-colors"
                to="/stories"
              >
                Câu chuyện
              </Link>
              <Link 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-700 hover:text-sky-600 transition-colors"
                to="/deals"
              >
                Ưu đãi
              </Link>
              <Link 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-700 hover:text-sky-600 transition-colors"
                to="/about"
              >
                Giới thiệu
              </Link>
              <Link 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-700 hover:text-sky-600 transition-colors"
                to="/contact"
              >
                Liên hệ
              </Link>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link 
                  onClick={() => setMobileMenuOpen(false)}
                  to="/signin" 
                  className="block w-full text-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-md transition-all font-medium"
                >
                  Đặt chỗ
                </Link>
                <Link
                  onClick={() => setMobileMenuOpen(false)}
                  to="/signin"
                  className="block w-full text-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Đăng nhập
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Outlet />
        </div>
      </main>
      <footer className="mt-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="py-10 sm:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-6 lg:gap-8">
              {/* Brand */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">TG</span>
                  </div>
                  <span className="font-bold text-xl">
                    <span className="text-blue-400">Travel</span>
                    <span className="text-purple-400">Go</span>
                  </span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                  Nền tảng du lịch giúp bạn khám phá, lên kế hoạch và đặt chỗ cho những hành trình tuyệt vời.
                </p>
              </div>

              {/* Navigation */}
              <div>
                <h3 className="font-semibold mb-4 text-white text-base">Điều hướng</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link className="flex items-center gap-2 hover:text-blue-400 transition-colors group" to="/destinations">
                      <MapPinIcon className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span>Điểm đến</span>
                    </Link>
                  </li>
                  <li>
                    <Link className="flex items-center gap-2 hover:text-blue-400 transition-colors group" to="/destinations?featured=true">
                      <TagIcon className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span>Đặt chỗ</span>
                    </Link>
                  </li>
                  <li>
                    <Link className="flex items-center gap-2 hover:text-blue-400 transition-colors group" to="/deals">
                      <TagIcon className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span>Ưu đãi</span>
                    </Link>
                  </li>
                  <li>
                    <Link className="flex items-center gap-2 hover:text-blue-400 transition-colors group" to="/stories">
                      <ChatBubbleLeftRightIcon className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span>Câu chuyện</span>
                    </Link>
                  </li>
                  <li>
                    <Link className="flex items-center gap-2 hover:text-blue-400 transition-colors group" to="/about">
                      <InformationCircleIcon className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span>Giới thiệu</span>
                    </Link>
                  </li>
                  <li>
                    <Link className="flex items-center gap-2 hover:text-blue-400 transition-colors group" to="/contact">
                      <EnvelopeIcon className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span>Liên hệ</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="font-semibold mb-4 text-white text-base">Liên hệ</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <EnvelopeIcon className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                    <a 
                      className="hover:text-blue-400 transition-colors break-words" 
                      href="mailto:support@travelgo.example"
                    >
                      support@travelgo.example
                    </a>ư
                  </li>
                  <li className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <a 
                      className="hover:text-blue-400 transition-colors" 
                      href="tel:19001234"
                    >
                      1900 1234
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <HomeIcon className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                    <span>123 Trần Phú, Hà Nội</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-700/50 pt-4 pb-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-400 text-center sm:text-left">
                © {new Date().getFullYear()} <span className="text-blue-400">TravelGo</span>. All rights reserved.
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <Link to="/about" className="hover:text-blue-400 transition-colors whitespace-nowrap">Chính sách</Link>
                <Link to="/contact" className="hover:text-blue-400 transition-colors whitespace-nowrap">Điều khoản</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}