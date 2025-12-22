import { useEffect, useMemo, useState } from "react";
import type { Review } from "../data/reviews";
import ReviewForm from "./ReviewForm";

export default function ReviewsSection({ slug }: { slug: string }) {
  const [list, setList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/review/slug/${encodeURIComponent(slug)}`)
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
              {(r as any).images && Array.isArray((r as any).images) && (r as any).images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(r as any).images.map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Review image ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              )}
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

      <div className="mt-4">
        <ReviewForm
          destinationSlug={slug}
          onSuccess={() => {
            // Refresh reviews
            fetch(`/api/review/slug/${encodeURIComponent(slug)}`)
              .then((r) => r.json())
              .then((data: Review[]) => setList(data));
          }}
        />
      </div>
    </section>
  );
}