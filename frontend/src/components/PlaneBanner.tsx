// frontend/src/components/PlaneBanner.tsx
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface PlaneBannerProps {
  count?: number;
}

export default function PlaneBanner({ count = 3 }: PlaneBannerProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            top: `${20 + index * 25}%`,
            left: `${-10 + index * 5}%`,
            animation: `fly-across ${15 + index * 5}s linear infinite`,
            animationDelay: `${index * 3}s`,
          }}
        >
          <PaperAirplaneIcon 
            className="w-20 h-20 text-white/60 transform rotate-45 drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(255, 255, 255, 0.3))',
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes fly-across {
          0% {
            transform: translateX(-100px) translateY(0) rotate(45deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          50% {
            transform: translateX(calc(50vw - 50%)) translateY(-30px) rotate(45deg);
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(100vw + 100px)) translateY(-60px) rotate(45deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

