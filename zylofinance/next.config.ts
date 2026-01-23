import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: Removed 'output: export' to support Web3/wagmi functionality
  // Capacitor can work with Next.js dev/build output using a local server
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'encoding');
    return config;
  },
};

export default nextConfig;
