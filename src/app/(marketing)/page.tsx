import type { Metadata } from "next";

import { ToolLanding } from "@/components/atelier/tool-landing";
import { siteConfig } from "@/config/site";

// Primary keyword page: "ai hairstyle changer".
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return <ToolLanding tool="hair" description={siteConfig.description} />;
}
