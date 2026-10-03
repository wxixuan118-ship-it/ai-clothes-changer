import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site-url";

// Rendered per request: the canonical origin comes from runtime env, which
// container builds don't have.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/generate", "/billing", "/settings"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
