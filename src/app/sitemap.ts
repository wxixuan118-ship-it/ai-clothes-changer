import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site-url";

// Rendered per request: the canonical origin comes from runtime env, which
// container builds don't have.
export const dynamic = "force-dynamic";

// Indexable public pages only — auth pages are noindexed, the (app) group is
// session-gated.
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/pricing", "/privacy", "/terms"].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : path === "/pricing" ? 0.8 : 0.3,
  }));
}
