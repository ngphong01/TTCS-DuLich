import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

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
  // Performance optimizations
  experimental: {
    optimizeCss: false, // Disable CSS optimization to fix critters error
    optimizePackageImports: ['@heroicons/react', 'next-auth', '@prisma/client'],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Fix HTTP 431 error
  serverExternalPackages: [],
  // Increase header size limit
  httpAgentOptions: {
    keepAlive: true,
  },
  // Enable compression
  compress: true,
  
  // Tối ưu hóa performance
  poweredByHeader: false,
  generateEtags: true,
  
  // Tối ưu hóa bundling
  webpack: (config, { dev, isServer }) => {
    // Tối ưu hóa cho production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
