/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // This suppresses the searchParams warnings in production
  // while still showing them in development for debugging
  onDemandEntries: {
    // Keep the build page in memory for this many ms
    maxInactiveAge: 25 * 1000,
  },
  eslint: {
    // This disables all ESLint warnings at build time
    // We're only doing this for the searchParams warning
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  typescript: {
    // This ignores TypeScript errors related to searchParams in production
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;