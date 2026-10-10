// Site-wide constants, safe for client components. The canonical origin in
// production is `url` (override with SITE_URL); server code reads it through
// src/lib/site-url.ts.
export const siteConfig = {
  name: "StyleMirror AI",
  domain: "stylemirrorai.com",
  url: "https://stylemirrorai.com",
  title: "AI Hairstyle: Try On New Hairstyles Online | StyleMirror AI",
  description:
    "Upload a selfie and try any AI hairstyle: haircuts, colors, curls, and bangs from a reference photo, a text prompt, or a curated style. Your face stays yours.",
} as const;
