import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdnmedia.baotintuc.vn",
      },
      {
        protocol: "https",
        hostname: "bcp.cdnchinhphu.vn",
      },
      {
        protocol: "https",
        hostname: "nld.mediacdn.vn",
      },
      {
        protocol: "https",
        hostname: "image.vietgoing.com",
      },
      {
        protocol: "https",
        hostname: "hoangkimtravels.com",
      },
      {
        protocol: "https",
        hostname: "pystravel.vn",
      },
      {
        protocol: "https",
        hostname: "tse4.mm.bing.net",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
    ],
    // Performance optimizations
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Enhanced performance optimizations
      experimental: {
        optimizeCss: true, // Re-enable CSS optimization
        optimizePackageImports: [
          '@heroicons/react', 
          'next-auth', 
          '@prisma/client',
          'zod'
        ],
      },
      serverExternalPackages: ['mysql2', 'bcryptjs', 'better-sqlite3', 'googleapis', 'google-auth-library'],
      turbopack: {
        rules: {
          '*.svg': {
            loaders: ['@svgr/webpack'],
            as: '*.js',
          },
        },
      },
  // Enhanced bundling optimization
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
          utils: {
            test: /[\\/]src[\\/]lib[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 15,
          },
        },
      };
      
      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    
    // Development optimizations
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    
    return config;
  },
  
  // Enhanced compression and caching
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Enhanced output configuration
  output: 'standalone',
  
  // Environment-specific optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
  }),
};

export default nextConfig;
