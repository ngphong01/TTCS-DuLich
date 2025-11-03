import { useState } from "react";
import { MapPinIcon, UsersIcon, CalendarDaysIcon, BanknotesIcon, EnvelopeIcon, UserIcon, ClipboardDocumentListIcon, TrashIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { getAuthHeaders } from "../utils/fetchHelpers";

type Booking = {
  id: string;
  destination?: string;
  guests: number;
  from?: string;
  to?: string;
  name: string;
  email: string;
  note?: string;
  price: number;
  status: string;
  createdAt: string;
};

const STATUS = ["pending", "paid", "cancelled"];

export default function AdminBookingsManager({ initialItems }: { initialItems: Booking[] }) {
  const [items, setItems] = useState<Booking[]>(initialItems);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setError(null);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Cập nhật trạng thái thất bại");
      }
      const updated = await res.json();
      setItems((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (e: unknown) {
      const error = e as { message?: string };
      setError(error.message || "Có lỗi xảy ra");
    }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings?id=${encodeURIComponent(id)}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Xóa đơn thất bại");
      }
      setItems((prev) => prev.filter((b) => b.id !== id));
    } catch (e: unknown) {
      const error = e as { message?: string };
      setError(error.message || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <ClipboardDocumentListIcon className="h-6 w-6" />
          Danh sách đơn đặt chỗ
        </h2>
        {error && <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded-lg">{error}</p>}
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="grid gap-4">
        {items.map((b) => (
            <div key={b.id} className="group bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:shadow-lg border border-gray-200">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                    <ClipboardDocumentListIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-mono text-sm font-medium text-gray-700">{b.id.slice(0, 12)}...</div>
                    <div className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                  b.status === 'paid' ? 'bg-green-100 text-green-800 border border-green-200' :
                  b.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                  'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {b.status === 'paid' ? <CheckCircleIcon className="h-4 w-4" /> :
                   b.status === 'pending' ? <ClockIcon className="h-4 w-4" /> :
                   <XCircleIcon className="h-4 w-4" />}
                  {b.status === 'paid' ? 'Đã thanh toán' : b.status === 'pending' ? 'Chờ xử lý' : 'Hủy bỏ'}
                </span>
              </div>
              
              {/* Booking Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Điểm đến:</span>
                    <span className="font-semibold text-gray-800">{(b as any).destinationName || (b as any).destination?.name || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-gray-700" />
                    <span className="text-sm text-gray-600">Khách:</span>
                    <span className="font-semibold text-gray-800">{b.guests} người</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-700" />
                    <span className="text-sm text-gray-600">Thời gian:</span>
                    <span className="font-semibold text-gray-800">{b.from || "-"} → {b.to || "-"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BanknotesIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Tổng:</span>
                    <span className="font-bold text-lg text-green-600">${b.price.toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    <span className="text-sm text-gray-600">Người đặt:</span>
                    <span className="font-semibold text-gray-800">{b.name}</span>
            </div>
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="font-medium text-blue-600">{b.email}</span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
                <select
                  value={b.status}
                  onChange={(e) => updateStatus(b.id, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s === 'paid' ? '✅ Đã thanh toán' :
                         s === 'pending' ? '⏳ Chờ xử lý' :
                         '❌ Hủy bỏ'}
                      </option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={() => remove(b.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  Xóa
                </button>
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có đơn đặt chỗ</h3>
              <p className="text-gray-500">Các đơn đặt chỗ mới sẽ xuất hiện ở đây</p>
            </div>
          )}
          </div>
      </div>
    </div>
  );
}