import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_BACKEND_URL!,
        pathname: "/media/**"
      }
    ]
  }
};

export default nextConfig;
