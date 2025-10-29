"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DESTINATIONS } from "@/data/destinations";
import AccountSidebar from "@/components/AccountSidebar";

const STORAGE_KEY = "travelgo:wishlist";

export default function WishlistPage() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {}
  }, []);

  const items = useMemo(() => {
    const set = new Set(ids);
    return DESTINATIONS.filter((d) => set.has(d.slug));
  }, [ids]);

  const remove = (slug: string) => {
    const next = ids.filter((s) => s !== slug);
    setIds(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Danh sách yêu thích</h1>
            <p className="text-sm text-gray-600 mt-1">Các tour/điểm đến bạn đã lưu</p>
          </div>

      {items.length === 0 ? (
        <div className="mt-6 card p-6">
          <div className="font-semibold">Bạn chưa lưu điểm đến nào.</div>
          <Link href="/destinations" className="underline mt-2 inline-block">Khám phá điểm đến →</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((d) => (
            <div key={d.slug} className="rounded-2xl border border-black/[.08] dark:border-white/[.145] p-4 bg-white dark:bg-black/40">
              <img src={d.image} alt={d.name} className="h-40 w-full object-cover rounded" />
              <div className="mt-3 font-semibold text-gray-900">{d.name}</div>
              <div className="text-sm text-gray-600">{d.country}</div>
              <div className="mt-3 flex items-center gap-3">
                <Link href={`/destinations/${d.slug}`} className="underline">Xem chi tiết</Link>
                <Link href={`/checkout?destination=${d.slug}`} className="underline">Đặt ngay</Link>
                <button onClick={() => remove(d.slug)} className="underline text-red-600">Bỏ thích</button>
              </div>
            </div>
          ))}
        </div>
      )}
        </div>
      </div>
    </main>
  );
}


