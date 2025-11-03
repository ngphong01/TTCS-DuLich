import { useEffect, useState } from "react";
import { 
  BellIcon, 
  EnvelopeIcon, 
  StarIcon, 
  SparklesIcon,
  CheckCircleIcon,
  BellAlertIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import AccountSidebar from "../../components/AccountSidebar";

type NotiPrefs = {
  bookingUpdates: boolean;
  promoEmails: boolean;
  reviewReminders: boolean;
  productNews: boolean;
};

const STORAGE_KEY = "travelgo:notification-prefs";

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<NotiPrefs>({
    bookingUpdates: true,
    promoEmails: false,
    reviewReminders: true,
    productNews: false,
  });
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialPrefs, setInitialPrefs] = useState<NotiPrefs | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPrefs(parsed);
        setInitialPrefs(parsed);
      } else {
        setInitialPrefs(prefs);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (initialPrefs) {
      const changed = JSON.stringify(prefs) !== JSON.stringify(initialPrefs);
      setHasChanges(changed);
    }
  }, [prefs, initialPrefs]);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setInitialPrefs(prefs);
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => {
    if (initialPrefs) {
      setPrefs(initialPrefs);
      setHasChanges(false);
    }
  };

  const enabledCount = Object.values(prefs).filter(Boolean).length;

  const Row = ({
    id,
    title,
    desc,
    icon: Icon,
    color,
  }: { 
    id: keyof NotiPrefs; 
    title: string; 
    desc: string;
    icon: any;
    color: string;
  }) => {
    const isEnabled = prefs[id];
    
    return (
      <label className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
        isEnabled 
          ? `${color} bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg` 
          : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
      }`}>
        <div className="flex items-start gap-4 p-6">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
            isEnabled 
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg' 
              : 'bg-gray-100 group-hover:bg-gray-200'
          }`}>
            <Icon className={`w-6 h-6 ${isEnabled ? 'text-white' : 'text-gray-400'}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-bold text-lg ${isEnabled ? 'text-gray-900' : 'text-gray-700'}`}>
                {title}
              </h3>
              {isEnabled && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  <CheckCircleIcon className="w-3 h-3" />
                  Bật
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
          </div>

          {/* Toggle Switch */}
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setPrefs({ ...prefs, [id]: e.target.checked })}
              className="sr-only"
            />
            <div className={`relative w-14 h-7 rounded-full transition-all duration-200 ${
              isEnabled ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-300'
            }`}>
              <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                isEnabled ? 'translate-x-7' : 'translate-x-0'
              }`} />
            </div>
          </div>
        </div>

        {/* Hover Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none ${
          isEnabled ? 'via-indigo-100' : ''
        }`} />
      </label>
    );
  };

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
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <BellIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Cài đặt thông báo</h1>
                    <p className="text-white/90 mt-1">Quản lý các loại thông báo và email từ TravelGo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <BellAlertIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Thông báo đang bật</p>
                    <p className="text-3xl font-bold text-gray-900">{enabledCount} / 4</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Tổng số loại thông báo</p>
                  <p className="text-2xl font-bold text-indigo-600">4</p>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-indigo-600" />
                  Tùy chọn thông báo
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <Row
                  id="bookingUpdates"
                  title="Cập nhật đặt chỗ"
                  desc="Nhận thông báo về thay đổi lịch trình, vé và thanh toán của bạn"
                  icon={BellIcon}
                  color="border-blue-300"
                />
                <Row
                  id="reviewReminders"
                  title="Nhắc đánh giá chuyến đi"
                  desc="Nhận lời nhắc chia sẻ trải nghiệm và đánh giá sau khi hoàn thành chuyến đi"
                  icon={StarIcon}
                  color="border-yellow-300"
                />
                <Row
                  id="promoEmails"
                  title="Ưu đãi & khuyến mãi"
                  desc="Nhận email về mã giảm giá, chương trình ưu đãi đặc biệt và deals hot"
                  icon={SparklesIcon}
                  color="border-pink-300"
                />
                <Row
                  id="productNews"
                  title="Tin tức sản phẩm"
                  desc="Nhận cập nhật về tính năng mới, cải tiến và câu chuyện hành trình thú vị"
                  icon={EnvelopeIcon}
                  color="border-purple-300"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {saved && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">Đã lưu thành công!</span>
                    </div>
                  )}
                  {hasChanges && !saved && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                      <BellAlertIcon className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-700">Có thay đổi chưa lưu</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  {hasChanges && (
                    <button 
                      onClick={reset}
                      className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                    >
                      Hủy thay đổi
                    </button>
                  )}
                  <button 
                    onClick={save}
                    disabled={!hasChanges}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:transform-none"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Lưu cài đặt
                  </button>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BellIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Về thông báo của chúng tôi</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    Chúng tôi chỉ gửi thông báo quan trọng và hữu ích để giúp bạn có trải nghiệm tốt nhất. 
                    Bạn có thể thay đổi cài đặt này bất cứ lúc nào.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Không spam, chỉ thông tin quan trọng</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Dễ dàng tùy chỉnh theo nhu cầu</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Bảo mật và riêng tư tuyệt đối</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}