import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site-url";

// Rendered per request: the canonical origin comes from runtime env, which
// container builds don't have.
export const dynamic = "force-dynamic";

// Indexable public pages only — auth pages are noindexed, the (app) group is
// session-gated.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { path: "/", priority: 1 },
    { path: "/ai-clothes-changer", priority: 0.9 },
    { path: "/face-shape-detector", priority: 0.8 },
    { path: "/hairstyles-for-face-shape", priority: 0.8 },
    { path: "/foundation-shade-finder", priority: 0.8 },
    { path: "/body-shape-calculator-female", priority: 0.8 },
    { path: "/body-shape-calculator-men", priority: 0.8 },
    { path: "/pricing", priority: 0.8 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
  ].map(({ path, priority }) => ({
    url: absoluteUrl(path),
    changeFrequency: "weekly",
    priority,
  }));
}
