import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface PromoPopupProps {
  title?: string;
  message?: string;
  discount?: string;
  code?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  showDays?: number; // Show popup again after X days
}

export default function PromoPopup({
  title = '🎉 Ưu đãi đặc biệt!',
  message = 'Nhận ngay ưu đãi hấp dẫn cho chuyến du lịch của bạn',
  discount,
  code,
  imageUrl,
  linkUrl = '/deals',
  linkText = 'Xem ngay',
  showDays = 7,
}: PromoPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if popup was shown recently
    const lastShown = localStorage.getItem('promoPopupLastShown');
    const now = Date.now();
    const daysInMs = showDays * 24 * 60 * 60 * 1000;

    if (!lastShown || now - parseInt(lastShown) > daysInMs) {
      setIsVisible(true);
    }
  }, [showDays]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('promoPopupLastShown', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-soft-pop">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
          aria-label="Close popup"
        >
          <XMarkIcon className="h-5 w-5 text-gray-600" />
        </button>

        {/* Image */}
        {imageUrl && (
          <div className="relative h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{message}</p>

          {discount && (
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg text-center font-bold text-xl mb-4">
              {discount}
            </div>
          )}

          {code && (
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Mã giảm giá:</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">{code}</p>
            </div>
          )}

          <Link
            to={linkUrl}
            onClick={handleClose}
            className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            {linkText}
          </Link>

          <button
            onClick={handleClose}
            className="w-full mt-3 text-gray-500 text-sm hover:text-gray-700"
          >
            Không, cảm ơn
          </button>
        </div>
      </div>
    </div>
  );
}

