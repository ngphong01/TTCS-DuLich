import { Link } from 'react-router-dom';
import { XCircleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function CheckoutFail() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 px-8 py-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircleIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Thanh toán thất bại
            </h1>
            <p className="text-red-100 text-sm">
              Đã có lỗi xảy ra trong quá trình thanh toán
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 text-sm text-center">
                Giao dịch không thể hoàn tất. Vui lòng kiểm tra thông tin thanh toán 
                và thử lại. Nếu vấn đề vẫn tiếp tục, hãy liên hệ với chúng tôi để được hỗ trợ.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Lưu ý:</strong> Nếu tiền đã bị trừ nhưng bạn nhận được thông báo này, 
                vui lòng liên hệ hotline <strong>1900 xxxx</strong> để được hỗ trợ.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                to="/checkout"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-600 transition-all"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Thử lại thanh toán
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