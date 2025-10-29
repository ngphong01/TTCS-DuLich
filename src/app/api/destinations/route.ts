import { NextResponse } from "next/server";
import { db } from "@/lib/mysql";
import { DestinationsQuerySchema } from "@/lib/validation";
import { DESTINATIONS } from "@/data/destinations";
import { optimizedQueries } from "@/lib/db-optimization";
import { handleApiError, createRequestContext } from "@/lib/logger";

export async function GET(request: Request) {
  const context = createRequestContext();
  
  try {
    const { searchParams } = new URL(request.url);
    const parsed = DestinationsQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }
    
    const q = (parsed.data.q || "").toLowerCase().trim();
    const priceMin = Number(parsed.data.priceMin || 0);
    const priceMax = Number(parsed.data.priceMax || Infinity);
    const ratingMin = Number(parsed.data.ratingMin || 0);
    const countries = (parsed.data.countries || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const tags = (parsed.data.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const sort = parsed.data.sort || "";
    const page = Math.max(1, Number(parsed.data.page || 1));
    const pageSize = Math.max(1, Number(parsed.data.pageSize || 9));
    const offset = (page - 1) * pageSize;

    // Use optimized query
    const result = await optimizedQueries.getDestinationsOptimized({
      limit: pageSize,
      offset,
      search: q || undefined,
      countries: countries.length > 0 ? countries : undefined,
      tags: tags.length > 0 ? tags : undefined,
      priceMin,
      priceMax: Number.isFinite(priceMax) ? priceMax : undefined,
      ratingMin: ratingMin > 0 ? ratingMin : undefined,
      sort: sort || undefined,
    });

    const placeholder = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop";
    const items = result.destinations.map((d: any) => ({
      slug: d.slug,
      name: d.name,
      description: d.description,
      image: d.image && d.image.trim() !== "" ? d.image : placeholder,
      rating: d.rating,
      price: d.price,
      country: d.country,
      tags: d.tags.split(",").filter(Boolean),
    }));

    return NextResponse.json({ 
      total: result.total, 
      page: result.page, 
      pageSize: result.pageSize, 
      hasMore: result.hasMore,
      items 
    });
    
  } catch (error) {
    const sanitized = handleApiError(error, 'GET /api/destinations', context);
    
    // Fallback to static data if DB is not ready
    try {
      const { searchParams } = new URL(request.url);
      const parsed = DestinationsQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
      
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
      }
      
      const q = (parsed.data.q || "").toLowerCase().trim();
      const priceMin = Number(parsed.data.priceMin || 0);
      const priceMax = Number(parsed.data.priceMax || Infinity);
      const ratingMin = Number(parsed.data.ratingMin || 0);
      const countries = (parsed.data.countries || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const tags = (parsed.data.tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const sort = parsed.data.sort || "";
      const page = Math.max(1, Number(parsed.data.page || 1));
      const pageSize = Math.max(1, Number(parsed.data.pageSize || 9));

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

      return NextResponse.json({
        total,
        page,
        pageSize,
        hasMore: end < total,
        items: items.map((d) => ({
          slug: d.slug,
          name: d.name,
          description: d.description,
          image: d.image,
          rating: d.rating,
          price: Math.round(d.price),
          country: d.country,
          tags: d.tags,
        })),
        fallback: true, // Indicate this is fallback data
      });
      
    } catch (fallbackError) {
      return NextResponse.json(
        { error: sanitized.message },
        { status: 500 }
      );
    }
  }
}