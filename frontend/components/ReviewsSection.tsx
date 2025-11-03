import { useEffect, useMemo, useState } from "react";
import type { Review } from "../data/reviews";

export default function ReviewsSection({ slug }: { slug: string }) {
  const [list, setList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data: Review[]) => {
        if (!cancelled) setList(data);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const avg = useMemo(() => {
    if (list.length === 0) return 0;
    return Number(
      (list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(2)
    );
  }, [list]);

  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, author, rating, comment }),
    });
    if (!res.ok) return;
    const created: Review = await res.json();
    setList((prev) => [created, ...prev]);
    setAuthor("");
    setRating(5);
    setComment("");
  };

  return (
    <section className="rounded-2xl border border-black/[.08] dark:border-white/[.145] p-4">
      <h2 className="font-semibold">Đánh giá</h2>
      <p className="text-sm/6 text-foreground/70">Điểm trung bình: ⭐ {avg} ({list.length} đánh giá)</p>

      {loading ? (
        <p className="text-sm/6 text-foreground/60 mt-3">Đang tải đánh giá...</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {list.map((r) => (
            <li key={r.id} className="rounded-xl border border-black/[.08] dark:border-white/[.145] p-3 bg-white dark:bg-black/40">
              <div className="flex items-center justify-between">
                <span className="font-medium">{r.author}</span>
                <span className="text-sm/6">⭐ {r.rating}</span>
              </div>
              <p className="text-sm/6 mt-1">{r.comment}</p>
              <p className="text-xs/6 text-foreground/60 mt-1">{r.date}</p>
            </li>
          ))}
          {list.length === 0 && (
            <li className="rounded-xl border border-black/[.08] dark:border-white/[.145] p-3">
              Chưa có đánh giá nào cho điểm đến này.
            </li>
          )}
        </ul>
      )}

      <form onSubmit={submit} className="mt-4 grid gap-3">
        <h3 className="font-semibold">Viết đánh giá</h3>
        <input
          type="text"
          placeholder="Tên của bạn"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium">Rating (0-5)</label>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Ngày</label>
            <input
              type="date"
              value={new Date().toISOString().slice(0, 10)}
              readOnly
              className="w-full rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent"
            />
          </div>
        </div>
        <textarea
          placeholder="Cảm nhận của bạn..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent min-h-[80px]"
        />
        <button className="rounded-full bg-foreground text-background px-6 py-2 hover:opacity-90 w-max">Gửi đánh giá</button>
        <p className="text-xs/6 text-foreground/60">Đánh giá sẽ được lưu qua API (file JSON trong dev môi trường).</p>
      </form>
    </section>
  );
}