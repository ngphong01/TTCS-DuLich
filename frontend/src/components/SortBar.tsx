import { useNavigate, useSearchParams } from 'react-router-dom';

const OPTIONS = [
  { value: "", label: "Mặc định" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "rating-desc", label: "Rating cao → thấp" },
  { value: "name-asc", label: "Tên A → Z" },
];

export default function SortBar() {
  const [searchParams] = useSearchParams();
  const router = useNavigate();
  const selected = searchParams.get("sort") || "";

  const update = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router(`/destinations?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium">Sắp xếp</label>
      <select
        value={selected}
        onChange={(e) => update(e.target.value)}
        className="rounded border border-black/[.08] dark:border-white/[.145] bg-transparent px-3 py-2"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}