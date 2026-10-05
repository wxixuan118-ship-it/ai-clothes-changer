import type { Metadata, ResolvingMetadata } from "next";

import { ToolLanding } from "@/components/atelier/tool-landing";

// Secondary keyword page: "ai clothes changer".
const title = "AI Clothes Changer: Try On Any Outfit Online | StyleMirror AI";
const description =
  "Upload a photo and change clothes with AI. Try on any outfit from a garment image, a text prompt, or a curated style — your face and pose stay the same.";

// openGraph/twitter replace the parent objects wholesale, so spread the
// parent's to keep the file-based share image.
export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const previous = await parent;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/ai-clothes-changer" },
    openGraph: {
      ...previous.openGraph,
      title,
      description,
      url: "/ai-clothes-changer",
    },
    twitter: { ...previous.twitter, title, description },
  };
}

export default function AiClothesChangerPage() {
  return <ToolLanding tool="clothes" description={description} />;
}
