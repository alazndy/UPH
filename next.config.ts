
// @ts-check
import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const createNextIntlPlugin = require('next-intl/plugin');
 
const withNextIntl = createNextIntlPlugin();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Fix for Next.js 16 Turbopack/Webpack conflict with PWA plugin
  experimental: {
     // @ts-ignore
     turbopack: false 
  }
};

export default withPWA(withNextIntl(nextConfig));
