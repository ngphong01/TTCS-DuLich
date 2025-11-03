
import { useState } from "react";
import { getAuthHeaders } from "../utils/fetchHelpers";
import {
  CheckCircleIcon,
  XCircleIcon,
  BanknotesIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type Booking = {
  id: string;
  name: string;
  email: string;
  destinationName?: string | null;
  guests: number;
  price: number;
  status: string;
  from?: string | null;
  to?: string | null;
  createdAt: string;
};

export default function AdminBookingsTable({ initial }: { initial: Booking[] }) {
  const [items, setItems] = useState<Booking[]>(initial);
  const [view, setView] = useState<Booking | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const update = async (id: string, status: string) => {
    setBusy(id);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ bookingId: id, status }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Cập nhật thất bại");
      const updated = await res.json();
      setItems((prev) => prev.map((b) => (b.id === id ? { ...b, status: updated.status } : b)));
    } catch (err) {
      console.error(err);
      alert("Không thể cập nhật trạng thái");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <h2 className="text-xl font-semibold text-gray-800">Danh sách đặt tour</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{(b.name || "U").slice(0, 1).toUpperCase()}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{b.name}</div>
                      <div className="text-sm text-gray-500">{b.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{b.destinationName || "N/A"}</div>
                  <div className="text-sm text-gray-500">{b.guests} khách</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{b.from || "-"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-green-600">{b.price.toLocaleString("vi-VN")} VNĐ</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    b.status === "pending" || b.status === "pending_confirmation"
                      ? "bg-yellow-100 text-yellow-800"
                      : b.status === "confirmed"
                      ? "bg-blue-100 text-blue-800"
                      : b.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {b.status === "pending" || b.status === "pending_confirmation" ? (
                      <>
                        <button
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                          disabled={busy === b.id}
                          onClick={() => update(b.id, "confirmed")}
                        >
                          <CheckCircleIcon className="h-4 w-4" /> Xác nhận
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                          disabled={busy === b.id}
                          onClick={() => update(b.id, "cancelled")}
                        >
                          <XCircleIcon className="h-4 w-4" /> Từ chối
                        </button>
                      </>
                    ) : null}
                    {b.status === "confirmed" ? (
                      <button
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                        disabled={busy === b.id}
                        onClick={() => update(b.id, "paid")}
                      >
                        <BanknotesIcon className="h-4 w-4" /> Thanh toán
                      </button>
                    ) : null}
                    <button
                      className="px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1"
                      onClick={() => setView(b)}
                    >
                      <EyeIcon className="h-4 w-4" /> Chi tiết
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {view && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Chi tiết đơn #{view.id.slice(0, 8)}</h3>
              <button onClick={() => setView(null)} className="p-2 rounded-lg hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-600">Khách:</span> <span className="font-semibold">{view.name}</span> ({view.email})</div>
              <div><span className="text-gray-600">Tour:</span> <span className="font-semibold">{view.destinationName || "N/A"}</span></div>
              <div><span className="text-gray-600">Số khách:</span> <span className="font-semibold">{view.guests}</span></div>
              <div><span className="text-gray-600">Thời gian:</span> <span className="font-semibold">{view.from || "-"} → {view.to || "-"}</span></div>
              <div><span className="text-gray-600">Giá:</span> <span className="font-semibold text-green-600">{view.price.toLocaleString("vi-VN")} VNĐ</span></div>
              <div><span className="text-gray-600">Trạng thái:</span> <span className="font-semibold">{view.status}</span></div>
            </div>
            <div className="mt-6 text-right">
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700" onClick={() => setView(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


