import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GlassesIcon } from "lucide-react";

import {
  appSchema,
  Container,
  FaqList,
  faqSchema,
  Hero,
  InfoCards,
  JsonLd,
  MoreTools,
  SectionHeader,
  SourceLink,
  StepCards,
  type FaqItem,
} from "@/components/site/blocks";
import { PricingCards } from "@/components/site/pricing-cards";
import { Studio } from "@/components/site/studio";
import { glassesCategories, glassesPresets } from "@/config/glasses";
import { GENERATION_COST_CREDITS, WELCOME_CREDITS } from "@/config/plans";
import { faceShapeInfo, type FaceShape } from "@/lib/face/face-shape-info";
import { absoluteUrl } from "@/lib/site-url";

const title = "Glasses Try-On: See Frames on Your Photo | StyleMirror";
const description =
  "Virtual glasses try-on with AI: see eyeglasses and sunglasses on your own photo from 18 curated frames, a product photo or a short description.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/glasses-try-on" },
  openGraph: { title, description, url: "/glasses-try-on" },
  twitter: { title, description },
};

const shapes = Object.keys(faceShapeInfo) as FaceShape[];

const steps = [
  {
    title: "Upload a selfie",
    body: "A clear, front-facing photo with your eyes open. Take off your current glasses if you can.",
  },
  {
    title: "Pick the frames",
    body: "Choose from 18 curated frames, upload a product photo of any pair, or describe the glasses you want.",
  },
  {
    title: "See them on you",
    body: "Get a realistic result in about 15 seconds, then compare frames side by side in your history.",
  },
] as const;

const uses = [
  {
    title: "Shop online with confidence",
    body: "Upload the product photo from any optician's site and see the exact pair on your face before you order.",
  },
  {
    title: "Find your frame shape",
    body: "Compare round, square, cat-eye and aviator frames on the same photo to see which shape balances your face.",
  },
  {
    title: "Try sunglasses too",
    body: "Tinted aviators, wayfarers and oversized shades work the same way as clear eyeglasses.",
  },
  {
    title: "Replace the pair you wear",
    body: "Already wear glasses? The try-on swaps them for the new frames instead of stacking two pairs.",
  },
] as const;

const faqs: FaqItem[] = [
  {
    q: "How does the AI glasses try-on work?",
    a: "An image-editing model adds the frames you choose to your photo, sized to your face with matching perspective, reflections and shadows. Your face, hair, expression and background stay the same.",
  },
  {
    q: "Is the glasses try-on free?",
    a: `New accounts get ${WELCOME_CREDITS} free credits and each try-on costs ${GENERATION_COST_CREDITS} credits, the same as a hairstyle. Failed runs are refunded automatically.`,
  },
  {
    q: "Can I try on glasses from another store?",
    a: "Yes. Switch to the glasses photo option and upload a front-view product image. Clean, plain backgrounds give the most accurate frames.",
  },
  {
    q: "Will the size be exact?",
    a: "The frames are scaled to look natural on your face, but a photo can't measure lens width or bridge size. Check the frame measurements printed on the temple before ordering prescription glasses.",
  },
  {
    q: "What photo works best?",
    a: "A straight-on photo at eye level in even light, eyes open, hair off your face. JPG, PNG or WebP up to 25 MB.",
  },
  {
    q: "Are my photos private?",
    a: "We don't store the photos you upload — they are only used to create your result. Results are saved to your history and you can delete any of them.",
  },
];

export default function GlassesTryOnPage() {
  return (
    <>
      <JsonLd
        data={[
          appSchema({
            name: "AI Glasses Try-On",
            description,
            url: absoluteUrl("/glasses-try-on"),
          }),
          faqSchema(faqs),
        ]}
      />

      <Hero
        eyebrow={`${WELCOME_CREDITS} free credits when you sign up · No card needed`}
        title={
          <>
            Glasses try-on:{" "}
            <span className="text-[var(--brand)]">see any frames on you</span>
          </>
        }
        intro="Upload a selfie and the AI glasses try-on puts new frames on your face in seconds — pick a curated pair, upload a product photo from any store, or describe the glasses you want."
        badges={["18 curated frames", "Eyeglasses & sunglasses", "Results in seconds"]}
      >
        <Studio tool="glasses" />
      </Hero>

      <Container id="frames" className="pt-20">
        <SectionHeader
          title="Frames to try on"
          sub="Pick a pair and it loads in the glasses try-on studio above."
        />
        {glassesCategories.map((category) => (
          <div key={category} className="mb-6">
            <p className="mb-3 font-bold">{category}</p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {glassesPresets
                .filter((preset) => preset.category === category)
                .map((preset) => (
                  <li key={preset.id}>
                    <Link
                      href={`/glasses-try-on?style=${preset.id}#studio`}
                      scroll={false}
                      className="card flex items-center gap-3 p-3"
                    >
                      <span
                        className="tile size-10 rounded-full bg-[var(--paper-2)]"
                        style={{ color: preset.tint }}
                      >
                        <GlassesIcon className="size-6" aria-hidden />
                      </span>
                      <span className="text-sm font-semibold">{preset.name}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </Container>

      <Container id="how-it-works" className="pt-20">
        <SectionHeader
          title="How the glasses try-on works"
          sub="No webcam filters or 3D models — the frames are drawn into your own photo."
        />
        <StepCards steps={steps} />
      </Container>

      <Container id="face-shapes" className="pt-20">
        <div className="grid items-start gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeader
              title="Best glasses for your face shape"
              sub={
                <>
                  Not sure of your shape? Use the free{" "}
                  <Link
                    href="/face-shape-detector"
                    className="font-semibold text-[var(--brand-strong)] underline underline-offset-4"
                  >
                    face shape detector
                  </Link>{" "}
                  first.
                </>
              }
            />
            <ul className="grid gap-3 sm:grid-cols-2">
              {shapes.map((shape) => (
                <li key={shape} className="card p-4">
                  <p className="font-extrabold">{faceShapeInfo[shape].label} face</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted-ink)]">
                    {faceShapeInfo[shape].glasses.join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <figure className="card overflow-hidden p-3">
            <Image
              src="/guides/free-tools/glasses-try-on.svg"
              alt="Glasses try-on illustration with rectangular frames on a face and frame color swatches"
              width={400}
              height={300}
              unoptimized
              loading="lazy"
              className="h-auto w-full rounded-2xl"
            />
            <figcaption className="px-2 pt-3 pb-1 text-sm text-[var(--muted-ink)]">
              Contrast is the rule of thumb: angular frames for soft faces,
              rounded frames for angular faces.
            </figcaption>
          </figure>
        </div>
      </Container>

      <Container className="pt-20">
        <SectionHeader
          title="Why use a virtual glasses try-on"
          sub={
            <>
              It works like a{" "}
              <SourceLink href="https://en.wikipedia.org/wiki/Virtual_dressing_room">
                virtual fitting room
              </SourceLink>{" "}
              for eyewear, using your own photo.
            </>
          }
        />
        <InfoCards items={uses} cols={4} />
      </Container>

      <MoreTools current="glasses" label="Products and free style tools" />

      <Container id="pricing" className="pt-6">
        <SectionHeader
          title="Glasses try-on pricing"
          sub={`Each try-on costs ${GENERATION_COST_CREDITS} credits. Start with ${WELCOME_CREDITS} free credits and cancel any time.`}
          center
        />
        <PricingCards />
      </Container>

      <Container id="faq" className="pt-20 pb-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.7fr]">
          <SectionHeader title="Glasses try-on FAQ" />
          <FaqList items={faqs} />
        </div>
      </Container>
    </>
  );
}
