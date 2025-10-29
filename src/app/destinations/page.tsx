import DestinationCard from "../../components/DestinationCard";
import FiltersBar from "../../components/FiltersBar";
import SortBar from "../../components/SortBar";
import PaginationBar from "../../components/PaginationBar";
import { DESTINATIONS } from "../../data/destinations";

type Search = {
  q?: string;
  from?: string;
  to?: string;
  countries?: string; // comma-separated
  tags?: string; // comma-separated
  priceMin?: string;
  priceMax?: string;
  ratingMin?: string;
  sort?: string;
  page?: string;
  pageSize?: string;
};

async function fetchDestinations(searchParams: Search) {
  const params = new URLSearchParams(Object.entries(searchParams).filter(([_, v]) => v));
  const url = `/api/destinations?${params.toString()}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
    });
    if (res.ok) {
      return res.json() as Promise<{
        total: number;
        page: number;
        pageSize: number;
        items: Array<{
          slug: string;
          name: string;
          description: string;
          image: string;
          rating: number;
          price: number;
          country: string;
          tags: string[];
        }>;
      }>;
    }
  } catch {
    // ignore and fallback
  }

  // Fallback to static data when API is unavailable (e.g., DB not ready)
  const q = (searchParams.q || "").toLowerCase().trim();
  const priceMin = Number(searchParams.priceMin || 0);
  const priceMax = Number(searchParams.priceMax || Infinity);
  const ratingMin = Number(searchParams.ratingMin || 0);
  const countries = (searchParams.countries || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const tags = (searchParams.tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const sort = searchParams.sort || "";
  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = Math.max(1, Number(searchParams.pageSize || 9));

  const filtered = DESTINATIONS.filter((d) => {
    const matchQ =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q) ||
      d.tags.some((t) => t.toLowerCase().includes(q));
    const matchCountries = countries.length === 0 || countries.includes(d.country);
    const matchTags = tags.length === 0 || tags.every((t) => d.tags.includes(t));
    const matchPrice = d.price >= priceMin && d.price <= priceMax;
    const matchRating = d.rating >= ratingMin;
    return matchQ && matchCountries && matchTags && matchPrice && matchRating;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating-desc":
        return b.rating - a.rating;
      case "name-asc":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = sorted.slice(start, end);

  return {
    total,
    page,
    pageSize,
    items,
  };
}

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams?: Promise<Search>;
}) {
  const resolvedSearchParams = await searchParams;
  const pageSize = Math.max(1, Number(resolvedSearchParams?.pageSize || 9));
  const data = await fetchDestinations({ ...(resolvedSearchParams || {}), pageSize: String(pageSize) });

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mt-8">Danh sách điểm đến</h1>
      {(resolvedSearchParams?.from || resolvedSearchParams?.to || resolvedSearchParams?.q) && (
        <p className="text-sm/6 text-foreground/70 mt-2">
          Kết quả cho: {resolvedSearchParams?.q && `"${resolvedSearchParams.q}"`} {resolvedSearchParams?.from && `• từ ${resolvedSearchParams.from}`}{" "}
          {resolvedSearchParams?.to && `• đến ${resolvedSearchParams.to}`}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <FiltersBar />
        <div className="flex justify-between items-center">
          <SortBar />
          <span className="text-sm/6 text-foreground/70">Có {data.total} điểm đến</span>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {data.items.map((d) => (
          <DestinationCard key={d.slug} d={d} />
        ))}
        {data.items.length === 0 && (
          <div className="rounded-xl border border-black/[.08] dark:border-white/[.145] p-6">
            Không tìm thấy điểm đến phù hợp. Hãy thử tiêu chí khác.
          </div>
        )}
      </div>

      <PaginationBar total={data.total} pageSize={data.pageSize} />
    </main>
  );
}