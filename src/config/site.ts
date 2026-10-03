// Site-wide constants, safe for client components. The canonical origin is
// env-driven and server-only: see src/lib/site-url.ts.
export const siteConfig = {
  name: "AI Hairstyle Changer",
  title: "AI Hairstyle Changer — Try New Hairstyles on Your Photo",
  description:
    "Upload a selfie and try any hairstyle with AI: haircuts, colors, curls, and bangs from a reference photo, a text prompt, or a curated style. Your face stays yours.",
} as const;
