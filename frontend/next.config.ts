import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Enable standalone output for Docker
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
