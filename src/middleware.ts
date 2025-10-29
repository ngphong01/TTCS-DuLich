import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Tối ưu hóa caching headers
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    // Cache auth API responses
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  } else if (request.nextUrl.pathname.startsWith('/_next/static/')) {
    // Cache static assets aggressively
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (request.nextUrl.pathname.startsWith('/api/')) {
    // Cache API responses
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60');
  }

  // Tối ưu hóa security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  // Secure CSP headers với specific domains
  const isDev = process.env.NODE_ENV !== 'production';
  const scriptSrc = [
    "script-src",
    "'self'",
    "'unsafe-inline'",
    // Allow eval only in development to support React Refresh / HMR
    ...(isDev ? ["'unsafe-eval'"] : []),
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://accounts.google.com",
  ].join(' ');

  const connectSrc = [
    "connect-src",
    "'self'",
    "https://oauth2.googleapis.com",
    "https://api.github.com",
    "https://www.googleapis.com",
    "https://generativelanguage.googleapis.com",
    "https://www.google-analytics.com",
    // HMR/WebSocket during development
    ...(isDev ? ["ws:", "wss:", "http://127.0.0.1:3000", "http://localhost:3000"] : []),
  ].join(' ');

  const cspHeader = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://images.unsplash.com https://cdnmedia.baotintuc.vn https://bcp.cdnchinhphu.vn https://nld.mediacdn.vn https://image.vietgoing.com https://hoangkimtravels.com https://pystravel.vn https://tse4.mm.bing.net https://encrypted-tbn0.gstatic.com https://www.google-analytics.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    connectSrc,
    "worker-src 'self' blob:",
    "frame-src 'self' https://accounts.google.com https://github.com",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', cspHeader);

  // Tối ưu hóa performance
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

