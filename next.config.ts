
import type {NextConfig} from 'next';

/**
 * CONFIG: NextJS Kedaulatan Jastip Siau (SOP V133)
 * SOP: Penegakan Wildcard Origin untuk membasmi galat Cross Origin pada workstation dinamis.
 */
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: process.env.BUILD_TARGET === 'backend' ? 'standalone' : 'export',
  generateEtags: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'cdn-icons-png.flaticon.com' }
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        '*.cloudworkstations.dev',
        '*.hosted.app',
        'localhost:9002'
      ]
    }
  }
};

export default nextConfig;
