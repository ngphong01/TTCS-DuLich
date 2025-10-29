import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { DESTINATIONS } from "../../../data/destinations";
import MapEmbed from "../../../components/MapEmbed";
import ReviewsSection from "../../../components/ReviewsSection";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const d = DESTINATIONS.find((x) => x.slug === resolvedParams.slug);
  if (!d) {
    return {
      title: "Điểm đến không tồn tại - TravelGo",
      description: "Không tìm thấy điểm đến bạn yêu cầu.",
    };
  }
  return {
    title: `${d.name} - ${d.country} | TravelGo`,
    description: d.description,
    openGraph: {
      title: `${d.name} - ${d.country} | TravelGo`,
      description: d.description,
      images: [{ url: d.image }],
    },
  };
}

export default async function DestinationDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const d = DESTINATIONS.find((x) => x.slug === resolvedParams.slug);

  if (!d) {
    return (
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mt-12 rounded-xl border border-black/[.08] dark:border-white/[.145] p-6">
          <p>Không tìm thấy điểm đến.</p>
          <Link href="/destinations" className="underline mt-2 inline-block">
            Quay lại danh sách →
          </Link>
        </div>
      </main>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": d.name,
    "image": [d.image],
    "description": d.description,
    "address": { "@type": "PostalAddress", "addressCountry": d.country },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": d.rating, "bestRating": 5, "ratingCount": 100 },
    "offers": { "@type": "Offer", "price": d.price, "priceCurrency": "USD", "availability": "https://schema.org/InStock" }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mt-8 grid gap-6 sm:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl overflow-hidden border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black/40">
          <div className="relative h-72 w-full">
            <Image src={d.image} alt={d.name} fill className="object-cover" sizes="100vw" />
          </div>
          <div className="p-4">
            <h1 className="text-2xl sm:text-3xl font-bold">{d.name}</h1>
            <p className="text-sm/6 text-foreground/70 mt-2">{d.description}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm/6 rounded-full px-2 py-1 border border-black/[.08] dark:border-white/[.145]">⭐ {d.rating}</span>
              <span className="font-mono text-sm/6">Từ {d.price.toLocaleString('vi-VN')} VNĐ</span>
              <span className="text-sm/6">{d.country}</span>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-black/[.08] dark:border-white/[.145] p-4 h-max">
          <h2 className="font-semibold mb-2">Đặt chỗ nhanh</h2>
          <form action="/checkout" method="get" className="grid gap-3">
            <input type="hidden" name="destination" value={d.slug} />
            <label className="text-xs font-medium">Số lượng khách</label>
            <input name="guests" type="number" min={1} defaultValue={2} className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent" />
            <label className="text-xs font-medium">Ngày đi</label>
            <input name="from" type="date" className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent" />
            <label className="text-xs font-medium">Ngày về</label>
            <input name="to" type="date" className="rounded border border-black/[.08] dark:border-white/[.145] px-3 py-2 bg-transparent" />
            <button className="mt-2 rounded-full bg-foreground text-background px-6 py-2 hover:opacity-90">Tiếp tục</button>
          </form>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Thông tin</h3>
            <ul className="text-sm/6 list-disc ml-4 text-foreground/80">
              <li>Hủy miễn phí trong 24h</li>
              <li>Thanh toán an toàn</li>
              <li>Hỗ trợ 24/7</li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <MapEmbed query={`${d.name}, ${d.country}`} />
        <ReviewsSection slug={d.slug} />
      </div>

      <div className="mt-10">
        <Link href="/destinations" className="underline">← Quay lại danh sách</Link>
      </div>
    </main>
  );
}