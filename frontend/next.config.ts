import type { NextConfig } from "next";
import path from 'path';
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true, // オフライン遷移を安定化
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\/_next\/data\/.*\.json$/,
        handler: "NetworkFirst",
        options: {
          cacheName: "next-data",
          networkTimeoutSeconds: 3,
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\/_rsc=.*$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-rsc-data",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore - Turbopack config is required to bypass the custom webpack check in Next.js 16+
  turbopack: {},
};

export default withPWA(nextConfig);
