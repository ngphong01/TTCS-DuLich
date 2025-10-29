"use client";
import DestinationCard from "../../components/DestinationCard";
import { DESTINATIONS } from "../../data/destinations";
import { 
  FireIcon, 
  ClockIcon, 
  GiftIcon, 
  StarIcon,
  CheckCircleIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function DealsPage() {
  const deals = DESTINATIONS.filter((d) => d.tags.includes("beach") || d.tags.includes("city"));
  const [timeLeft, setTimeLeft] = useState<{d:number;h:number;m:number;s:number}>({ d: 0, h: 0, m: 0, s: 0 });

  // Set a dynamic deadline (end of current month at 23:59:59)
  useEffect(() => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const tick = () => {
      const diff = Math.max(0, end.getTime() - Date.now());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft({ d, h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="container">
      {/* Hero Section */}
      <section className="mt-10 sm:mt-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <FireIcon className="h-4 w-4" />
            Ưu đãi đặc biệt
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Khuyến mãi hấp dẫn
          </h1>
          <p className="mt-4 text-lg text-gray-900 max-w-2xl mx-auto">
            Khám phá những điểm đến tuyệt vời với giá ưu đãi lên đến 50%. 
            Đặt chỗ ngay hôm nay để không bỏ lỡ cơ hội du lịch tiết kiệm!
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ClockIcon className="h-5 w-5 text-red-600" />
            <span className="font-bold text-gray-900 dark:text-red-400">Ưu đãi kết thúc sau:</span>
          </div>
          <div className="flex justify-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-extrabold text-red-600 dark:text-red-400">{String(timeLeft.d).padStart(2,'0')}</div>
              <div className="text-xs font-semibold text-gray-900">Ngày</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-red-600 dark:text-red-400">{String(timeLeft.h).padStart(2,'0')}</div>
              <div className="text-xs font-semibold text-gray-900">Giờ</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-red-600 dark:text-red-400">{String(timeLeft.m).padStart(2,'0')}</div>
              <div className="text-xs font-semibold text-gray-900">Phút</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-red-600 dark:text-red-400">{String(timeLeft.s).padStart(2,'0')}</div>
              <div className="text-xs font-semibold text-gray-900">Giây</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <GiftIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Giảm giá lên đến 50%</h3>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-300">
              Áp dụng cho tất cả các gói du lịch biển và thành phố trong tháng này.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Đặt chỗ an toàn</h3>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-300">
              Hỗ trợ 24/7, thanh toán bảo mật, hoàn tiền 100% nếu hủy trước 24h.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Trải nghiệm độc quyền</h3>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-300">
              Các tour và dịch vụ đặc biệt chỉ dành cho khách hàng ưu đãi.
            </p>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <StarIcon className="h-5 w-5 text-yellow-500" />
            Điều khoản ưu đãi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base text-gray-900 font-semibold dark:text-gray-200">
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-gray-900">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                Áp dụng cho các điểm đến thuộc nhóm &quot;biển&quot; và &quot;thành phố&quot;
              </li>
              <li className="flex items-start gap-2 text-gray-900">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                Thời gian áp dụng: đến hết tháng hiện tại
              </li>
              <li className="flex items-start gap-2 text-gray-900">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                Không áp dụng cho các ngày lễ, tết
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-gray-900">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                Hỗ trợ đặt chỗ và tư vấn 24/7
              </li>
              <li className="flex items-start gap-2 text-gray-900">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                Thanh toán an toàn, bảo mật thông tin
              </li>
              <li className="flex items-start gap-2 text-gray-900">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                Hoàn tiền 100% nếu hủy trước 24h
              </li>
          </ul>
          </div>
        </div>
      </section>

      {/* Deals Grid */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Điểm đến ưu đãi
          </h2>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-400">
            {deals.length} điểm đến đang có ưu đãi
          </div>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((d) => (
            <div key={d.slug} className="relative">
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  -50%
                </div>
              </div>
              <DestinationCard d={d} />
            </div>
          ))}
        </div>
        
        {deals.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <GiftIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Hiện chưa có ưu đãi nào
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Vui lòng quay lại sau để xem các ưu đãi mới nhất
            </p>
            <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200">
              Đăng ký nhận thông báo ưu đãi
            </button>
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="mt-16 mb-8">
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Đăng ký nhận ưu đãi độc quyền</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Nhận thông báo sớm nhất về các chương trình khuyến mãi, ưu đãi đặc biệt 
            và cơ hội du lịch tiết kiệm từ TravelGo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Đăng ký ngay
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}