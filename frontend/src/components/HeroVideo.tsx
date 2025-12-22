// frontend/src/components/HeroVideo.tsx
import { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

interface HeroVideoProps {
  videoSrc?: string;
  posterSrc?: string;
  fallbackImage?: string;
}

export default function HeroVideo({ 
  videoSrc = '/videos/hero-travel.mp4',
  posterSrc = '/images/hero-poster.jpg',
  fallbackImage = '/images/hero-fallback.jpg'
}: HeroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Auto-play failed, show controls
        setShowControls(true);
        setIsPlaying(false);
      });
    }
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        poster={posterSrc}
        loop
        muted={isMuted}
        playsInline
        onError={() => {
          // Fallback to image if video fails
          const container = videoRef.current?.parentElement;
          if (container) {
            container.innerHTML = `<img src="${fallbackImage}" alt="Hero" class="absolute inset-0 w-full h-full object-cover" />`;
          }
        }}
      >
        <source src={videoSrc} type="video/mp4" />
        {/* Fallback image */}
        <img src={fallbackImage} alt="Travel Hero" className="absolute inset-0 w-full h-full object-cover" />
      </video>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

      {/* Video Controls */}
      <div 
        className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 z-20"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <button
          onClick={togglePlay}
          className="text-white hover:text-yellow-400 transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <PauseIcon className="h-5 w-5" />
          ) : (
            <PlayIcon className="h-5 w-5" />
          )}
        </button>
        {showControls && (
          <button
            onClick={toggleMute}
            className="text-white hover:text-yellow-400 transition-colors text-sm"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        )}
      </div>
    </div>
  );
}

