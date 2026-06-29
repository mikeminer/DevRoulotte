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
      {
        protocol: "https",
        hostname: "peerpush.com",
        pathname: "/p/devroulottechat/badge.png",
      },
      {
        protocol: "https",
        hostname: "www.uneed.best",
        pathname: "/EMBED3B.png",
      },
    ],
  },
};

export default nextConfig;
