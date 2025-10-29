"use client";
import { useEffect, useState } from "react";
import AccountSidebar from "@/components/AccountSidebar";

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs(JSON.parse(raw));
    } catch {}
  }, []);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const Row = ({
    id,
    title,
    desc,
  }: { id: keyof NotiPrefs; title: string; desc: string }) => (
    <label className="flex items-start gap-4 p-4 border rounded-xl border-gray-200 dark:border-gray-700">
      <input
        type="checkbox"
        checked={prefs[id]}
        onChange={(e) => setPrefs({ ...prefs, [id]: e.target.checked })}
        className="mt-1 h-5 w-5 accent-blue-600"
      />
      <span>
        <div className="font-semibold text-gray-900 dark:text-gray-200">{title}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{desc}</div>
      </span>
    </label>
  );

  return (
    <main className="container">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <AccountSidebar />
        </div>

        {/* Content */}
        <div className="lg:col-span-2">
          <div className="card p-6 animate-soft-pop">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Thông báo</h1>
        <p className="text-sm/6 text-gray-600 dark:text-gray-400 mt-1">
          Bật/tắt các loại thông báo và email từ TravelGo.
        </p>

        <div className="mt-6 grid gap-4">
          <Row
            id="bookingUpdates"
            title="Cập nhật đặt chỗ"
            desc="Nhận thông báo thay đổi lịch trình, vé và thanh toán."
          />
          <Row
            id="reviewReminders"
            title="Nhắc đánh giá chuyến đi"
            desc="Nhận lời nhắc chia sẻ trải nghiệm sau chuyến đi."
          />
          <Row
            id="promoEmails"
            title="Ưu đãi & khuyến mãi"
            desc="Nhận email về mã giảm giá và chương trình ưu đãi."
          />
          <Row
            id="productNews"
            title="Tin mới sản phẩm"
            desc="Nhận cập nhật về tính năng mới và câu chuyện hành trình."
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={save} className="btn btn-primary">Lưu cài đặt</button>
          {saved && (
            <span className="text-sm text-green-600">Đã lưu!</span>
          )}
        </div>
          </div>
        </div>
      </div>
    </main>
  );
}


