// src/components/Pagination.tsx
type Props = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};
export default function Pagination({ page, pageCount, onChange }: Props) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center gap-2">
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        Prev
      </button>
      <span className="text-sm">{page} / {pageCount}</span>
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
      >
        Next
      </button>
    </div>
  );
}