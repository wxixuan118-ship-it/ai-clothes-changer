import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory confuses root inference.
  turbopack: { root: path.join(__dirname) },
  experimental: {
    // Two downscaled photos (≤3.5MB each, typically ~1MB) plus form
    // overhead; stays under the proxy's default 10MB body cap.
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
