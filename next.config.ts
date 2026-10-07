import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  // Matches cache.wrappedTtlSeconds in lib/config.ts (24 hours).
  cacheLife: {
    wrapped: {
      stale: 300,
      revalidate: 86400,
      expire: 172800,
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
