import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.redematch.com.br",
        pathname: "/media/**"
      }
    ]
  }
};

export default nextConfig;
