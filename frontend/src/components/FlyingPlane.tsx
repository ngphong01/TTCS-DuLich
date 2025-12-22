// frontend/src/components/FlyingPlane.tsx
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface FlyingPlaneProps {
  size?: 'sm' | 'md' | 'lg';
  delay?: number;
  duration?: number;
  direction?: 'left-to-right' | 'right-to-left';
}

export default function FlyingPlane({ 
  size = 'md', 
  delay = 0,
  duration = 20,
  direction = 'left-to-right'
}: FlyingPlaneProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const animationName = direction === 'left-to-right' ? 'fly-left-to-right' : 'fly-right-to-left';
  const startPosition = direction === 'left-to-right' ? '-10%' : '110%';
  const endPosition = direction === 'left-to-right' ? '110%' : '-10%';

  // Random top position for variety
  const randomTop = Math.random() * 40 + 15; // Between 15% and 55%

  return (
    <>
      <style>{`
        @keyframes fly-left-to-right {
          0% {
            transform: translate(${startPosition}, 0) rotate(45deg) scale(0.8);
            opacity: 0;
          }
          5% {
            opacity: 0.8;
          }
          50% {
            transform: translate(calc(50vw - 50%), -30px) rotate(45deg) scale(1);
            opacity: 1;
          }
          95% {
            opacity: 0.8;
          }
          100% {
            transform: translate(${endPosition}, -80px) rotate(45deg) scale(0.8);
            opacity: 0;
          }
        }
        
        @keyframes fly-right-to-left {
          0% {
            transform: translate(${startPosition}, 0) rotate(225deg) scale(0.8);
            opacity: 0;
          }
          5% {
            opacity: 0.8;
          }
          50% {
            transform: translate(calc(50vw - 50%), -30px) rotate(225deg) scale(1);
            opacity: 1;
          }
          95% {
            opacity: 0.8;
          }
          100% {
            transform: translate(${endPosition}, -80px) rotate(225deg) scale(0.8);
            opacity: 0;
          }
        }
        
        .plane-flying-${delay} {
          animation: ${animationName} ${duration}s linear infinite;
          animation-delay: ${delay}s;
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
        }
      `}</style>
      <div 
        className={`plane-flying-${delay} absolute ${sizeClasses[size]} text-white/90 z-10 pointer-events-none`}
        style={{
          top: `${randomTop}%`,
        }}
      >
        <PaperAirplaneIcon className="w-full h-full transform rotate-45" />
      </div>
    </>
  );
}
