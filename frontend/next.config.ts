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
        urlPattern: /^https:\/\/.*\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: {
            maxEntries: 128,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        urlPattern: /^https:\/\/.*\/_next\/data\/.*\.json$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "next-data",
          networkTimeoutSeconds: 2, // 2秒で諦める
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60,
          },
        },
      },
      {
        urlPattern: /\/_rsc=.*$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "next-rsc-data",
          networkTimeoutSeconds: 1, // 1秒で諦めてキャッシュを使う
          expiration: {
            maxEntries: 128,
            maxAgeSeconds: 24 * 60 * 60,
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
