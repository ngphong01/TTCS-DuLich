import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo } from "react";
import { DESTINATIONS } from "../data/destinations";

export default function FiltersBar() {
  const router = useNavigate();
  const [searchParams] = useSearchParams();

  // Prefer server-provided filters if present in URL (preloaded by page)
  const countries = useMemo(() => {
    const fromUrl = (searchParams.get("countriesOptions") || "").split(",").map((s: string) => s.trim()).filter(Boolean);
    if (fromUrl.length) return fromUrl;
    return Array.from(new Set(DESTINATIONS.map((d) => d.country))).sort();
  }, [searchParams]);

  const tags = useMemo(() => {
    const fromUrl = (searchParams.get("tagsOptions") || "").split(",").map((s: string) => s.trim()).filter(Boolean);
    if (fromUrl.length) return fromUrl;
    return Array.from(new Set(DESTINATIONS.flatMap((d) => d.tags))).sort();
  }, [searchParams]);

  const pushParams = (params: URLSearchParams) => {
    // Reset về trang 1 khi thay đổi filter
    params.set("page", "1");
    router(`/destinations?${params.toString()}`);
  };

  const update = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    pushParams(params);
  };

  const selectedTags = (searchParams.get("tags") || "")
    .split(",")
    .map((t: string) => t.trim())
    .filter(Boolean);

  const selectedCountries = (searchParams.get("countries") || "")
    .split(",")
    .map((t: string) => t.trim())
    .filter(Boolean);

  const toggleMulti = (key: "tags" | "countries", current: string[], value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const set = new Set(current);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    const joined = Array.from(set).join(",");
    if (joined) params.set(key, joined);
    else params.delete(key);
    pushParams(params);
  };

  const toggleTag = (tag: string) => toggleMulti("tags", selectedTags, tag);
  const toggleCountry = (country: string) => toggleMulti("countries", selectedCountries, country);

  return (
    <div className="mt-4 rounded-xl border border-black/[.08] dark:border-white/[.145] p-4 bg-white dark:bg-black/40 grid gap-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-medium">Giá từ</label>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={searchParams.get("priceMin") || ""}
            onChange={(e) => update("priceMin", e.target.value || undefined)}
            className="w-full rounded border border-black/[.08] dark:border-white/[.145] bg-transparent px-3 py-2"
          />
        </div>

        <div>
          <label className="text-xs font-medium">Giá đến</label>
          <input
            type="number"
            min={0}
            placeholder="500"
            value={searchParams.get("priceMax") || ""}
            onChange={(e) => update("priceMax", e.target.value || undefined)}
            className="w-full rounded border border-black/[.08] dark:border-white/[.145] bg-transparent px-3 py-2"
          />
        </div>

        <div>
          <label className="text-xs font-medium">Rating tối thiểu</label>
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            placeholder="4.5"
            value={searchParams.get("ratingMin") || ""}
            onChange={(e) => update("ratingMin", e.target.value || undefined)}
            className="w-full rounded border border-black/[.08] dark:border-white/[.145] bg-transparent px-3 py-2"
          />
        </div>
        <div>
          <label className="text-xs font-medium">Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tên tour, quốc gia, tag..."
            value={searchParams.get("q") || ""}
            onChange={(e) => update("q", e.target.value || undefined)}
            className="w-full rounded border border-black/[.08] dark:border-white/[.145] bg-transparent px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium">Quốc gia (chọn nhiều)</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {countries.map((c: string) => {
            const active = selectedCountries.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCountry(c)}
                className={`text-sm/6 rounded-full px-3 py-1 border transition ${
                  active
                    ? "bg-blue-600 text-white border-transparent"
                    : "border-black/[.08] dark:border-white/[.145] hover:bg-blue-50 dark:hover:bg-[#1a1a1a]"
                }`}
                aria-pressed={active}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium">Tags (chọn nhiều)</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((t: string) => {
            const active = selectedTags.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                className={`text-sm/6 rounded-full px-3 py-1 border transition ${
                  active
                    ? "bg-blue-600 text-white border-transparent"
                    : "border-black/[.08] dark:border-white/[.145] hover:bg-blue-50 dark:hover:bg-[#1a1a1a]"
                }`}
                aria-pressed={active}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}