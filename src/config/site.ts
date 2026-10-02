// Site-wide constants, safe for client components. The canonical origin is
// env-driven and server-only: see src/lib/site-url.ts.
export const siteConfig = {
  name: "AI Clothes Changer",
  title: "AI Clothes Changer — Try On Any Outfit in Seconds",
  description:
    "Upload a photo and change clothes with AI. Try on any outfit from a garment image, a text prompt, or a curated style — realistic, private, no photoshoot.",
} as const;
