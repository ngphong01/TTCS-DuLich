"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AccountSidebar from "@/components/AccountSidebar";

type Booking = {
  id: string;
  destinationName: string;
  destinationImage?: string;
  status: string;
  totalPrice?: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
};

type ApiResponse = {
  bookings: Booking[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    processing: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
};

export default function MyBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (status) params.set("status", status);
    fetch(`/api/account/bookings?${params.toString()}`)
      .then(async (r) => {
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          throw new Error(d.error || "Không tải được danh sách đặt chỗ");
        }
        return r.json() as Promise<ApiResponse>;
      })
      .then((d) => {
        if (!cancelled) {
          setItems(d.bookings as Booking[]);
          setTotal(d.total);
        }
      })
      .catch((e: unknown) => {
        const err = e as { message?: string };
        if (!cancelled) setError(err.message || "Có lỗi xảy ra");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, status]);

  return (
    <main className="container">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <AccountSidebar />
        </div>

        {/* Content */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Đơn đặt chỗ của tôi</h1>
              <p className="text-sm text-gray-600 mt-1">Quản lý các đặt chỗ đã thực hiện</p>
            </div>
          </div>

      <div className="mt-6 flex items-center gap-3">
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="processing">Đang xử lý</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4">
        {loading && <div className="card p-4">Đang tải...</div>}
        {error && <div className="card p-4 text-red-600">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="card p-6">
            <div className="font-semibold">Chưa có đặt chỗ nào</div>
            <p className="text-sm text-gray-600 mt-1">Hãy khám phá điểm đến và đặt chuyến đi đầu tiên của bạn.</p>
            <Link href="/destinations" className="underline mt-2 inline-block">Khám phá điểm đến →</Link>
          </div>
        )}

        {!loading && !error && items.map((b) => (
          <div key={b.id} className="rounded-2xl border border-black/[.08] dark:border-white/[.145] p-4 bg-white dark:bg-black/40">
            <div className="flex items-center gap-4">
              {b.destinationImage ? (
                <img src={b.destinationImage} alt={b.destinationName} className="h-16 w-24 object-cover rounded" />
              ) : (
                <div className="h-16 w-24 bg-gray-100 rounded" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">{b.destinationName || "Chuyến đi"}</div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(b.status)}`}>{b.status}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {b.startDate && b.endDate ? (
                    <span>
                      {new Date(b.startDate).toLocaleDateString("vi-VN")} — {new Date(b.endDate).toLocaleDateString("vi-VN")}
                    </span>
                  ) : (
                    <span>Ngày đặt: {b.createdAt ? new Date(b.createdAt).toLocaleDateString("vi-VN") : "—"}</span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <Link href={`/account/bookings/${b.id}`} className="underline">Xem chi tiết</Link>
                  <Link href={`/api/invoice/${b.id}`} className="underline">Tải hóa đơn</Link>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Tổng</div>
                <div className="text-lg font-semibold">{b.totalPrice ? b.totalPrice.toLocaleString("vi-VN") + " ₫" : "—"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            className="btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >Trước</button>
          <div className="text-sm text-gray-700">Trang {page}/{totalPages}</div>
          <button
            className="btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >Sau</button>
        </div>
      )}
        </div>
      </div>
    </main>
  );
}


