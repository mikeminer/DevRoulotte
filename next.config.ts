import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "shipordie.club",
        pathname: "/logo.webp",
      },
    ],
  },
};

export default nextConfig;
