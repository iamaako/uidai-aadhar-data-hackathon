import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // For Netlify deployment
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
