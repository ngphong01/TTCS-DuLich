import { useState } from "react";
import { getAuthHeaders } from "../utils/fetchHelpers";

type Review = {
  id: string;
  slug: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
};

export default function AdminReviewsManager({ initialItems }: { initialItems: Review[] }) {
  const [items, setItems] = useState<Review[]>(initialItems);
  const [error, setError] = useState<string | null>(null);

  const remove = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Xóa đánh giá thất bại");
      }
      setItems((prev) => prev.filter((r) => r.id !== id));
    } catch (e: unknown) {
      const error = e as { message?: string };
      setError(error.message || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="card p-4 animate-soft-pop">
      <h2 className="font-semibold">Danh sách đánh giá</h2>
      {error && <p className="text-xs/6 text-red-600 mt-2">{error}</p>}
      <div className="mt-4 grid gap-3">
        {items.map((r) => (
          <div key={r.id} className="card p-3">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs/6">{r.slug}</div>
              <span className="text-sm/6">⭐ {r.rating}</span>
            </div>
            <p className="text-sm/6 mt-1">{r.comment}</p>
            <p className="text-xs/6 text-foreground/60">{r.author} — {r.date}</p>
            <div className="mt-2 text-right">
              <button className="btn" onClick={() => remove(r.id)}>Xóa</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="card p-4">Chưa có đánh giá.</div>}
      </div>
    </div>
  );
}