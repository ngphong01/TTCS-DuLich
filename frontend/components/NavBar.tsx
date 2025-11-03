import { Link } from 'react-router-dom';
import { useState } from "react";
import { MapPinIcon, TagIcon, ChatBubbleLeftRightIcon, InformationCircleIcon, EnvelopeIcon, CreditCardIcon, StarIcon } from "@heroicons/react/24/outline";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  const item = (href: string, label: string, Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>) => (
    <Link 
      to={href} 
      className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-150 group overflow-hidden whitespace-nowrap"
    >
      {Icon && <Icon className="h-4 w-4 group-hover:scale-105 transition-transform duration-150 flex-shrink-0" aria-hidden="true" />}
      <span className="relative z-10">{label}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-150"></div>
    </Link>
  );

  return (
    <header className="w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-lg shadow-gray-100/50">
      <div className="container h-24 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 overflow-hidden">
              <img 
                src="https://png.pngtree.com/png-clipart/20250314/original/pngtree-travel-go-logo-blue-and-yellow-design-png-image_20197838.png"
                alt="TravelGo Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-pink-500 transition-all duration-300">
              TravelGo
            </h1>
            <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
              Explore the World
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {item("/destinations", "Điểm đến", MapPinIcon)}
          {item("/categories", "Danh mục", TagIcon)}
          {item("/featured", "Nổi bật", StarIcon)}
          {item("/stories", "Câu chuyện", ChatBubbleLeftRightIcon)}
          {item("/deals", "Ưu đãi", TagIcon)}
          {item("/about", "Giới thiệu", InformationCircleIcon)}
          {item("/contact", "Liên hệ", EnvelopeIcon)}
        </nav>

        {/* Auth Area */}
        <div className="flex items-center gap-3">
          <Link 
            to="/orders" 
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-150 whitespace-nowrap"
          >
            <CreditCardIcon className="h-4 w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Đặt chỗ</span>
          </Link>
          
          <Link 
            to="/signin" 
            className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all duration-150 shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            Đăng nhập
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-4">
          <div className="container flex flex-col gap-2">
            {item("/destinations", "Điểm đến", MapPinIcon)}
            {item("/categories", "Danh mục", TagIcon)}
            {item("/featured", "Nổi bật", StarIcon)}
            {item("/stories", "Câu chuyện", ChatBubbleLeftRightIcon)}
            {item("/deals", "Ưu đãi", TagIcon)}
            {item("/about", "Giới thiệu", InformationCircleIcon)}
            {item("/contact", "Liên hệ", EnvelopeIcon)}
          </div>
        </div>
      )}
    </header>
  );
}