import { Link } from 'react-router-dom';
import { CheckCircleIcon, HomeIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-green-100 text-sm">
              Giao dịch của bạn đã được xử lý thành công
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-800 text-sm text-center">
                Cảm ơn bạn đã đặt tour với TravelGo! 
                Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                to="/account/payments"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                <ClipboardDocumentListIcon className="w-5 h-5" />
                Xem lịch sử thanh toán
              </Link>
              
              <Link
                to="/"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
              >
                <HomeIcon className="w-5 h-5" />
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}