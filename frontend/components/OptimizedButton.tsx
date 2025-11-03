import React, { useCallback, useRef, useState } from 'react';
import { useDebounce, useThrottle, optimizeClickHandler } from '@/lib/performance-optimizations';

interface OptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  debounceMs?: number;
  throttleMs?: number;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  className?: string;
}

export default function OptimizedButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  debounceMs = 0,
  throttleMs = 0,
  preventDefault = false,
  stopPropagation = false,
  className = '',
  onClick,
  disabled,
  ...props
}: OptimizedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Optimized click handler
  const optimizedClickHandler = useCallback(
    optimizeClickHandler(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) return;
        onClick?.(event);
      },
      {
        debounce: debounceMs,
        throttle: throttleMs,
        preventDefault,
        stopPropagation,
      }
    ),
    [onClick, loading, disabled, debounceMs, throttleMs, preventDefault, stopPropagation]
  );

  // Handle press states for better UX
  const handleMouseDown = useCallback(() => {
    if (!loading && !disabled) {
      setIsPressed(true);
    }
  }, [loading, disabled]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPressed(false);
  }, []);

  // Base styles
  const baseStyles = `
    relative inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-150 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    will-change: transform
    backface-visibility: hidden
    -webkit-backface-visibility: hidden
    transform: translateZ(0)
  `;

  // Variant styles
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
      text-white shadow-lg hover:shadow-xl
      focus:ring-blue-500
      ${isPressed ? 'scale-95' : 'hover:scale-105'}
    `,
    secondary: `
      bg-gray-100 text-gray-900 hover:bg-gray-200
      focus:ring-gray-500
      ${isPressed ? 'scale-95' : 'hover:scale-105'}
    `,
    outline: `
      border-2 border-blue-500 text-blue-500
      hover:bg-blue-500 hover:text-white
      focus:ring-blue-500
      ${isPressed ? 'scale-95' : 'hover:scale-105'}
    `,
    ghost: `
      text-gray-700 hover:bg-gray-100
      focus:ring-gray-500
      ${isPressed ? 'scale-95' : 'hover:scale-105'}
    `,
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Loading styles
  const loadingStyles = loading ? 'cursor-wait' : '';

  return (
    <button
      ref={buttonRef}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${loadingStyles}
        ${className}
      `.trim()}
      onClick={optimizedClickHandler}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <span className={`transition-opacity duration-150 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      
      {/* Ripple effect */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300" />
      </div>
    </button>
  );
}

// Optimized Link Button component
interface OptimizedLinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function OptimizedLinkButton({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: OptimizedLinkButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPressed(false);
  }, []);

  // Base styles
  const baseStyles = `
    relative inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-150 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    will-change: transform
    backface-visibility: hidden
    -webkit-backface-visibility: hidden
    transform: translateZ(0)
    no-underline
  `;

  // Variant styles
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
      text-white shadow-lg hover:shadow-xl
      focus:ring-blue-500
      ${isPressed ? 'scale-95' : 'hover:scale-105'}
    `,
    secondary: `
      bg-gray-100 text-gray-900 hover:bg-gray-200
      focus:ring-gray-500
      ${isPressed ? 'scale-95' : 'hover:scale-105'}
    `,
    outline: `
      border-2 border-blue-500 text-blue-500
      hover:bg-blue-500 hover:text-white
      focus:ring-blue-500
      ${isPressed ? 'scale-95' : 'hover:scale-105'}
    `,
    ghost: `
      text-gray-700 hover:bg-gray-100
      focus:ring-gray-500
      ${isPressed ? 'scale-95' : 'hover:scale-105'}
    `,
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <a
      href={href}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim()}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </a>
  );
}
