"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AccountSidebar from "@/components/AccountSidebar";

type Review = {
  id: string;
  slug: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
};

export default function MyReviewsPage() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/account/reviews")
      .then(async (r) => {
        if (!r.ok) throw new Error("Không tải được đánh giá");
        return r.json();
      })
      .then((d) => !cancelled && setItems(d.reviews || []))
      .catch((e: unknown) => {
        const err = e as { message?: string };
        if (!cancelled) setError(err.message || "Có lỗi xảy ra");
      })
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Đánh giá của tôi</h1>
            <p className="text-sm text-gray-600 mt-1">Quản lý các đánh giá đã viết</p>
          </div>

      {loading && <div className="mt-6 card p-4">Đang tải...</div>}
      {error && <div className="mt-6 card p-4 text-red-600">{error}</div>}
      {!loading && items.length === 0 && (
        <div className="mt-6 card p-6">Bạn chưa viết đánh giá nào.</div>
      )}

      <div className="mt-6 grid gap-4">
        {items.map((r) => (
          <div key={r.id} className="rounded-2xl border border-black/[.08] dark:border-white/[.145] p-4 bg-white dark:bg-black/40">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs text-gray-600">{r.slug}</div>
              <div className="text-sm">⭐ {r.rating}</div>
            </div>
            <p className="mt-2">{r.comment}</p>
            <div className="text-xs text-gray-500 mt-1">{r.date}</div>
            <div className="mt-2">
              <Link href={`/destinations/${r.slug}`} className="underline">Xem tour</Link>
            </div>
          </div>
        ))}
      </div>
          <div className="mt-6">
            <Link href="/account/support" className="underline">Gửi yêu cầu hỗ trợ →</Link>
          </div>
        </div>
      </div>
    </main>
  );
}


