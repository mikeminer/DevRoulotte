import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://shipordie.club https://api.producthunt.com https://peerpush.com https://www.uneed.best",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self' https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com",
  "frame-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(self), microphone=(self), geolocation=(), payment=(), usb=(), bluetooth=(), serial=()",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
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
