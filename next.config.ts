import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const API_TARGET = process.env.API_PROXY_TARGET ?? "https://api.andinoh.com";

const nextConfig: NextConfig = {
  // Django routes end in "/"; Next's default slash-stripping redirect fights its APPEND_SLASH (redirect loop).
  skipTrailingSlashRedirect: true,
  turbopack: {},
  env: {
    // The live socket follows the API proxy target (e.g. a local backend), unless set explicitly.
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL ?? `${API_TARGET.replace(/^http/, "ws")}/ws/notifications/`,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async rewrites() {
    // Same-origin API in the browser; point elsewhere (e.g. a local backend) with API_PROXY_TARGET.
    // The first rule keeps the trailing slash, which :path* would otherwise drop.
    return [
      { source: "/api/v1/:path*/", destination: `${API_TARGET}/api/v1/:path*/` },
      { source: "/api/v1/:path*", destination: `${API_TARGET}/api/v1/:path*` },
      // Uploaded files the API returns as /media/… paths.
      { source: "/media/:path*", destination: `${API_TARGET}/media/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          // Location for "hotels near me"; microphone for chat voice notes.
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(self)" },
        ],
      },
    ];
  },
};

export default withPWA({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
