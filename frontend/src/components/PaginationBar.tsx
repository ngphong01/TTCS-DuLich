import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaginationBar({ total, pageSize }: { total: number; pageSize: number }) {
  const [searchParams] = useSearchParams();
  const router = useNavigate();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const go = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(Math.min(Math.max(1, p), pages)));
    router(`/destinations?${params.toString()}`);
  };

  if (pages <= 1) return null;

  const items = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, page + 2);
  for (let i = start; i <= end; i++) items.push(i);

  return (
    <nav className="mt-6 flex items-center justify-center gap-2">
      <button
        className="rounded-full border border-black/[.08] dark:border-white/[.145] px-3 py-1 disabled:opacity-50"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
      >
        ← Trước
      </button>
      {start > 1 && (
        <>
          <button className="rounded-full px-3 py-1 underline" onClick={() => go(1)}>1</button>
          <span className="px-1">…</span>
        </>
      )}
      {items.map((i) => (
        <button
          key={i}
          onClick={() => go(i)}
          className={`rounded-full px-3 py-1 border ${
            i === page ? "bg-foreground text-background border-transparent" : "border-black/[.08] dark:border-white/[.145]"
          }`}
        >
          {i}
        </button>
      ))}
      {end < pages && (
        <>
          <span className="px-1">…</span>
          <button className="rounded-full px-3 py-1 underline" onClick={() => go(pages)}>{pages}</button>
        </>
      )}
      <button
        className="rounded-full border border-black/[.08] dark:border-white/[.145] px-3 py-1 disabled:opacity-50"
        onClick={() => go(page + 1)}
        disabled={page >= pages}
      >
        Sau →
      </button>
    </nav>
  );
}