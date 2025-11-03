import SmartImage from "./SmartImage";
import { Link } from 'react-router-dom';
import type { Destination } from "../data/destinations";
import { StarIcon, MapPinIcon } from "@heroicons/react/24/solid";

export default function DestinationCard({ d }: { d: Destination }) {
  const isDeal = d.tags.includes("beach") || d.tags.includes("city");
  // Tính toán dealPrice một cách ổn định để tránh hydration mismatch
  const dealPrice = isDeal ? Math.floor(d.price * 0.9) : d.price;

  return (
    <Link 
      to={`/destinations/${d.slug}`} 
      className="group card overflow-hidden hover:shadow-xl transition-shadow duration-300"
      prefetch={true}
    >
      <div className="relative h-56 w-full overflow-hidden">
        <SmartImage
          src={d.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop"}
          alt={d.name}
          fill
          className="object-cover transition-opacity duration-300 group-hover:opacity-90"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {isDeal && (
          <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
            -10% ưu đãi
          </span>
        )}
        {/* Country badge */}
        <span className="absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full bg-white/90 text-gray-700 backdrop-blur-sm">
          {d.country}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg flex items-center gap-2 text-gray-800 group-hover:text-blue-600 transition-colors">
            <MapPinIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />
            {d.name}
          </h3>
          <span className="text-sm rounded-full px-3 py-1 bg-yellow-50 border border-yellow-200 flex items-center gap-1">
            <StarIcon className="h-4 w-4 text-yellow-500" aria-hidden="true" />
            <span className="font-semibold text-yellow-700">{d.rating}</span>
          </span>
        </div>
        {/* Description */}
        <div className="mb-4">
          <p className="text-sm leading-relaxed text-gray-600 line-clamp-3">
            {d.description}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-lg text-blue-600">
              Từ {dealPrice.toLocaleString('vi-VN')} VNĐ
            </span>
            {isDeal && (
              <span className="text-sm line-through text-gray-500">
                {d.price.toLocaleString('vi-VN')} VNĐ
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
            Xem chi tiết →
          </span>
        </div>
      </div>
    </Link>
  );
}