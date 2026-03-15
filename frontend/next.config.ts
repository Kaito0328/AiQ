import type { NextConfig } from "next";
import path from 'path';
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore - Turbopack config is required to bypass the custom webpack check in Next.js 16+
  turbopack: {},
};

export default withPWA(nextConfig);
