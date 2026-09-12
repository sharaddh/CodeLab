import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Vercel deployment
  output: "standalone",
  // Allow importing JSON files from data/
  serverExternalPackages: [],
};

export default nextConfig;
