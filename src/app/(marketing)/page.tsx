import type { Metadata } from "next";

import { ToolLanding } from "@/components/atelier/tool-landing";
import { siteConfig } from "@/config/site";

// Primary keyword page: "ai hairstyle".
export const metadata: Metadata = {
  title: "AI Hairstyle: Try On New Haircuts & Colors — StyleMirror AI",
  description:
    "Try an AI hairstyle on your own photo. Compare before and after haircuts, browse 65 hairstyle previews, or use a reference photo to find your next look.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "AI Hairstyle: Try On New Haircuts & Colors",
    description:
      "Try AI hairstyles on your own photo. Explore realistic before and after examples and 65 haircut previews.",
    url: "/",
  },
};

export default function Home() {
  return <ToolLanding tool="hair" description={siteConfig.description} />;
}
