"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AccountSidebar from "@/components/AccountSidebar";

type Payment = {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  gatewayTransactionId?: string;
  createdAt?: string;
};

type ApiResponse = {
  payments: Payment[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    processing: "bg-yellow-100 text-yellow-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-blue-100 text-blue-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
};

export default function PaymentHistoryPage() {
  const [items, setItems] = useState<Payment[]>([]);
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
    fetch(`/api/account/payments?${params.toString()}`)
      .then(async (r) => {
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          throw new Error(d.error || "Không tải được lịch sử thanh toán");
        }
        return r.json() as Promise<ApiResponse>;
      })
      .then((d) => {
        if (!cancelled) {
          setItems(d.payments as Payment[]);
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
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lịch sử thanh toán</h1>
            <p className="text-sm text-gray-600 mt-1">Xem lại các giao dịch đã thực hiện</p>
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
          <option value="completed">Thành công</option>
          <option value="processing">Đang xử lý</option>
          <option value="pending">Đang chờ</option>
          <option value="failed">Thất bại</option>
          <option value="refunded">Đã hoàn tiền</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4">
        {loading && <div className="card p-4">Đang tải...</div>}
        {error && <div className="card p-4 text-red-600">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="card p-6">
            <div className="font-semibold">Chưa có giao dịch thanh toán</div>
            <p className="text-sm text-gray-600 mt-1">Giao dịch của bạn sẽ hiển thị ở đây sau khi thanh toán.</p>
          </div>
        )}

        {!loading && !error && items.map((p) => (
          <div key={p.id} className="rounded-2xl border border-black/[.08] dark:border-white/[.145] p-4 bg-white dark:bg-black/40">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Giao dịch #{p.id}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {p.createdAt ? new Date(p.createdAt).toLocaleString("vi-VN") : "—"}
                </div>
                <div className="text-sm text-gray-600 mt-1">Phương thức: {p.paymentMethod}</div>
                {p.gatewayTransactionId && (
                  <div className="text-xs text-gray-500">Mã cổng: {p.gatewayTransactionId}</div>
                )}
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(p.status)}`}>{p.status}</span>
                <div className="mt-2 text-lg font-semibold">
                  {p.amount != null ? p.amount.toLocaleString("vi-VN") + " " + (p.currency || "VND") : "—"}
                </div>
                <div className="mt-2">
                  <Link href={`/api/receipt/${p.id}`} className="underline">Xem biên lai</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button className="btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Trước</button>
          <div className="text-sm text-gray-700">Trang {page}/{totalPages}</div>
          <button className="btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Sau</button>
        </div>
      )}
        </div>
      </div>
    </main>
  );
}


