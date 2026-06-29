import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "shipordie.club",
        pathname: "/logo.webp",
      },
      {
        protocol: "https",
        hostname: "api.producthunt.com",
        pathname: "/widgets/embed-image/v1/featured.svg",
      },
    ],
  },
};

export default nextConfig;
