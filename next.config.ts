import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server (.next/standalone/server.js) — what the AnySites
  // Docker build copies and runs.
  output: "standalone",
  // Migrations run on server start (src/instrumentation.ts), so the SQL
  // files must ship inside the standalone output.
  outputFileTracingIncludes: {
    "/*": ["./drizzle/**/*"],
  },
  // A stray lockfile in the home directory confuses root inference.
  turbopack: { root: path.join(__dirname) },
  // next build's type-check pass gets OOM-killed under AnySites' 1.5GB build
  // memory cap, so the Dockerfile sets SKIP_TYPECHECK=1. CI runs `pnpm typecheck`.
  typescript: { ignoreBuildErrors: process.env.SKIP_TYPECHECK === "1" },
  experimental: {
    // Two downscaled photos (≤3.5MB each, typically ~1MB) plus form
    // overhead; stays under the proxy's default 10MB body cap.
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
