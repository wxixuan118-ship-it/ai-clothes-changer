import type { Metadata } from "next";

import {
  Container,
  CtaPanel,
  Hero,
  JsonLd,
  SectionHeader,
  ToolCard,
} from "@/components/site/blocks";
import {
  categoryLabels,
  freeCategories,
  toolOrder,
  tools,
  toolsInCategory,
} from "@/config/tools";
import { absoluteUrl } from "@/lib/site-url";

const title = "Free Face & Style Tools: Face Shape, Skin Tone & More | StyleMirror";
const description =
  "Free face and style tools that run in your browser: face shape detector, face analyzer, skin tone analyzer, makeup shade finders, body type calculators and more.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/free-tools" },
  openGraph: { title, description, url: "/free-tools" },
  twitter: { title, description },
};

const free = toolOrder.filter((id) => tools[id].type !== "generator");

const categoryIntro: Record<string, string> = {
  "face-shape": "Find your face shape from a selfie, a tape measure or a quiz.",
  features: "Detect the shape of your eyes, brows, nose and lips.",
  proportions: "Measure symmetry, golden ratio, canthal tilt and facial thirds.",
  fun: "Geometry-based scores, for fun.",
  makeup: "Shades picked for your skin tone, undertone and eye color.",
  color: "Your undertone and seasonal color palette.",
  body: "Body shape, somatotype and Kibbe type.",
  privacy: "Photo utilities that never upload your pictures.",
};

export default function FreeToolsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "StyleMirror free tools",
          itemListElement: free.map((id, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: tools[id].name,
            url: absoluteUrl(tools[id].landing),
          })),
        }}
      />
      <Hero
        eyebrow={`${free.length} free tools · No sign-up · Photos stay on your device`}
        title={
          <>
            Free face and style tools{" "}
            <span className="text-[var(--brand)]">that run in your browser</span>
          </>
        }
        intro="Every free tool here runs on your own device — face shape, facial features, proportions, makeup shades, color seasons and body type. No account, no uploads, no limits."
      />
      {freeCategories.map((category) => (
        <Container key={category} id={category} className="pt-16">
          <SectionHeader
            title={`Free ${categoryLabels[category].toLowerCase()} tools`}
            sub={categoryIntro[category]}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toolsInCategory(category).map((id) => (
              <ToolCard key={id} id={id} compact />
            ))}
          </div>
        </Container>
      ))}
      <CtaPanel
        title="Ready to see a new look?"
        sub="Preview hairstyles and outfits on your own photo with StyleMirror's AI try-on."
        href="/#studio"
        label="Try a hairstyle"
      />
    </>
  );
}
