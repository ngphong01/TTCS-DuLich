type Props = {
  query: string; // e.g., "Hà Nội, Việt Nam"
  className?: string;
};

/**
 * Simple Google Maps embed without API key using query string.
 * Note: For production-grade maps, integrate Google Maps Platform or Mapbox.
 */
export default function MapEmbed({ query, className }: Props) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <div className={className}>
      <div className="rounded-xl overflow-hidden border border-black/[.08] dark:border-white/[.145]">
        <iframe
          title={`Bản đồ - ${query}`}
          src={src}
          className="w-full h-64 sm:h-80"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}