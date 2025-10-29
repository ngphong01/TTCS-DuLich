"use client";

import Image from "next/image";

type SmartImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
};

const defaultAllowed = [
  // Only keep the domain already configured in next.config by default.
  "images.unsplash.com",
];

export default function SmartImage({ src, alt, className, fill, width, height, sizes }: SmartImageProps) {
  // Handle empty or invalid src
  if (!src || src.trim() === "") {
    const placeholder = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop";
    if (fill) {
      return <img src={placeholder} alt={alt} className={`absolute inset-0 w-full h-full object-cover ${className || ""}`} />;
    }
    return (
      <img src={placeholder} alt={alt} className={className} width={width} height={height} />
    );
  }

  let hostname = "";
  try {
    const u = new URL(src);
    hostname = u.hostname;
  } catch {
    hostname = "";
  }

  const extra = (process.env.NEXT_PUBLIC_IMAGE_HOSTS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allowed = new Set([...defaultAllowed, ...extra]);

  const isExternal = src.startsWith("http://") || src.startsWith("https://");
  const isAllowed = !isExternal || allowed.has(hostname);

  if (isAllowed) {
    if (fill) {
      return (
        <Image 
          src={src} 
          alt={alt} 
          fill 
          className={className} 
          sizes={sizes}
          priority={false}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
      );
    }
    return (
      <Image 
        src={src} 
        alt={alt} 
        width={width || 800} 
        height={height || 450} 
        className={className} 
        sizes={sizes}
        priority={false}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
    );
  }

  // Fallback: render a normal <img> to avoid Next/Image host restrictions
  if (fill) {
    return (
      <img src={src} alt={alt} className={`absolute inset-0 w-full h-full object-cover ${className || ""}`} />
    );
  }
  return <img src={src} alt={alt} className={className} width={width} height={height} />;
}


