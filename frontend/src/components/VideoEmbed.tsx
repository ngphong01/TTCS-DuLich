import { useState } from 'react';
import { PlayIcon } from '@heroicons/react/24/outline';

interface VideoEmbedProps {
  url: string;
  title?: string;
  thumbnail?: string;
  className?: string;
}

export default function VideoEmbed({ url, title, thumbnail, className = '' }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract video ID from various platforms
  const getVideoEmbedUrl = (videoUrl: string): string | null => {
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = videoUrl.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = videoUrl.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Direct embed URL
    if (videoUrl.includes('youtube.com/embed') || videoUrl.includes('vimeo.com/video')) {
      return videoUrl;
    }

    return null;
  };

  const embedUrl = getVideoEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-500">Video URL không hợp lệ</p>
      </div>
    );
  }

  if (isPlaying) {
    return (
      <div className={`relative w-full aspect-video rounded-lg overflow-hidden ${className}`}>
        <iframe
          src={`${embedUrl}?autoplay=1`}
          title={title || 'Video'}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full aspect-video rounded-lg overflow-hidden cursor-pointer group ${className}`}
      onClick={() => setIsPlaying(true)}
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title || 'Video thumbnail'}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
          <PlayIcon className="h-16 w-16 text-white" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <div className="bg-white/90 rounded-full p-4 group-hover:scale-110 transition-transform">
          <PlayIcon className="h-12 w-12 text-blue-600" />
        </div>
      </div>
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white font-bold">{title}</h3>
        </div>
      )}
    </div>
  );
}

