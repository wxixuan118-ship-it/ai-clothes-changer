import type { Metadata } from "next";
import Image from "next/image";

import {
  Container,
  CtaPanel,
  FaqList,
  faqSchema,
  Hero,
  JsonLd,
  SectionHeader,
  SourceLink,
  ToolCard,
  type FaqItem,
} from "@/components/site/blocks";
import {
  categoryLabels,
  freeCategories,
  toolOrder,
  tools,
  toolsInCategory,
} from "@/config/tools";
import { absoluteUrl } from "@/lib/site-url";

const title = "Free Face Tools: Face Shape, Skin Tone & Makeup | StyleMirror";
const description =
  "31 free face tools that run in your browser: face shape detector, face analyzer, skin tone analyzer, makeup shade finders and body type calculators.";

const faqs: FaqItem[] = [
  {
    q: "Are these free face tools really free?",
    a: "Yes. Every tool on this page is free with no sign-up, no watermark and no daily limit. Only the AI hairstyle and outfit try-on use credits.",
  },
  {
    q: "Do the tools upload my photo?",
    a: "No. Face detection runs on your device with Google's MediaPipe model, so photos never reach our servers.",
  },
  {
    q: "Which tool should I start with?",
    a: "The face analyzer runs most readings from one selfie. From there, open the dedicated tool for anything you want to explore in more depth.",
  },
  {
    q: "Do they work on phones?",
    a: "Yes. Every tool works in a modern mobile browser, and photo tools can use your front camera.",
  },
];

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
        data={[
          faqSchema(faqs),
          {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "StyleMirror free tools",
          itemListElement: free.map((id, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: tools[id].name,
            url: absoluteUrl(tools[id].landing),
          })),
          },
        ]}
      />
      <Hero
        eyebrow={`${free.length} free tools · No sign-up · Photos stay on your device`}
        title={
          <>
            Free face tools{" "}
            <span className="text-[var(--brand)]">that run in your browser</span>
          </>
        }
        intro="These free face tools run on your own device — face shape, facial features, proportions, makeup shades, color seasons and body type. No account, no uploads, no limits."
      />
      {freeCategories.map((category) => (
        <Container key={category} id={category} className="pt-16">
          <SectionHeader
            title={`Free face tools: ${categoryLabels[category].toLowerCase()}`}
            sub={categoryIntro[category]}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toolsInCategory(category).map((id) => (
              <ToolCard key={id} id={id} compact />
            ))}
          </div>
        </Container>
      ))}
      <Container id="about" className="pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionHeader
              title="Why our free face tools run in your browser"
              sub={
                <>
                  Detection uses Google&apos;s{" "}
                  <SourceLink href="https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker">
                    MediaPipe Face Landmarker
                  </SourceLink>
                  .
                </>
              }
            />
            <div className="space-y-4 leading-relaxed text-[var(--muted-ink)] sm:text-[17px]">
              <p>
                Most online face analysis sites upload your selfie to a server.
                Ours download a small detection model once, then measure 478
                points on your face entirely on your phone or computer. Your
                photo is never sent anywhere, so there is nothing to store,
                leak or delete later.
              </p>
              <p>
                Running locally also keeps every tool fast and unlimited. There
                is no queue, no daily cap and no account. The first photo takes
                a few seconds while the model loads; after that, results appear
                almost instantly.
              </p>
              <p>
                The same landmarks power every photo tool, from face shape and
                eye shape to symmetry, golden ratio and makeup shades, so
                results stay consistent when you move between them. Quizzes and
                calculators need no photo at all.
              </p>
            </div>
          </div>
          <figure className="card overflow-hidden p-3">
            <Image
              src="/guides/free-tools/free-tools.svg"
              alt="Free face tools illustration with face landmarks and color swatches"
              width={400}
              height={300}
              unoptimized
              loading="lazy"
              className="h-auto w-full rounded-2xl"
            />
            <figcaption className="px-2 pt-3 pb-1 text-sm text-[var(--muted-ink)]">
              One set of face landmarks powers every photo tool.
            </figcaption>
          </figure>
        </div>
      </Container>

      <Container id="faq" className="pt-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.7fr]">
          <SectionHeader title="Free face tools FAQ" />
          <FaqList items={faqs} />
        </div>
      </Container>

      <CtaPanel
        title="Ready to see a new look?"
        sub="Preview hairstyles and outfits on your own photo with StyleMirror's AI try-on."
        href="/#studio"
        label="Try a hairstyle"
      />
    </>
  );
}
