"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AccountSidebar from "@/components/AccountSidebar";

type Loyalty = { tier: string; points: number; history: { id: string; delta: number; note: string; at: string }[]; benefits?: string[] };

export default function LoyaltyPage() {
  const [data, setData] = useState<Loyalty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/account/loyalty")
      .then((r) => r.json())
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setError("Không tải được thông tin thành viên"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Thành viên & Điểm thưởng</h1>
            <p className="text-sm text-gray-600 mt-1">Theo dõi cấp độ và điểm thưởng của bạn</p>
          </div>

      {loading && <div className="mt-6 card p-4">Đang tải...</div>}
      {error && <div className="mt-6 card p-4 text-red-600">{error}</div>}

      {data && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/[.08] dark:border-white/[.145] p-6 bg-white dark:bg-black/40">
            <div className="text-sm text-gray-600">Cấp độ hiện tại</div>
            <div className="text-3xl font-bold mt-1">{data.tier}</div>
            <div className="mt-4 text-sm text-gray-600">Điểm hiện tại</div>
            <div className="text-2xl font-semibold">{data.points.toLocaleString("vi-VN")} điểm</div>
            {data.benefits && data.benefits.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-semibold">Quyền lợi</div>
                <ul className="text-sm text-gray-700 list-disc ml-5 mt-1">
                  {data.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
            <button className="btn mt-4" disabled>
              Đổi 500 điểm lấy voucher 50k (sắp ra mắt)
            </button>
          </div>

          <div className="rounded-2xl border border-black/[.08] dark:border-white/[.145] p-6 bg-white dark:bg-black/40">
            <div className="text-lg font-semibold">Lịch sử điểm</div>
            {(!data.history || data.history.length === 0) ? (
              <div className="mt-3 text-sm text-gray-600">Chưa có lịch sử điểm.</div>
            ) : (
              <div className="mt-3 grid gap-3">
                {data.history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">{h.note}</div>
                    <div className="text-sm font-semibold">{h.delta > 0 ? "+" : ""}{h.delta} điểm</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
        </div>
      </div>
    </main>
  );
}


