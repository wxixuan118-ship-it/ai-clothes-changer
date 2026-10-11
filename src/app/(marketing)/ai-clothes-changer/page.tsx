import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { portraitSrc } from "@/components/atelier/portraits";
import {
  appSchema,
  Container,
  CtaPanel,
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
import { GENERATION_COST_CREDITS, WELCOME_CREDITS } from "@/config/plans";
import { stylePresets } from "@/config/styles";
import { absoluteUrl } from "@/lib/site-url";

// Secondary keyword page: "ai clothes changer".
const title = "AI Clothes Changer: Try On Outfits Online | StyleMirror AI";
const description =
  "Use the AI clothes changer to try on any outfit in your own photo — from a garment image, a text prompt or a curated style. Your face and pose stay the same.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/ai-clothes-changer" },
  openGraph: { title, description, url: "/ai-clothes-changer" },
  twitter: { title, description },
};

const featured = stylePresets.filter((preset) => preset.cover);

const steps = [
  {
    title: "Upload your photo",
    body: "A clear, front-facing photo of one person works best — half or full body, nothing covering the clothes.",
  },
  {
    title: "Choose the outfit",
    body: "Upload a garment photo, describe the look in a few words, or pick one of the curated styles.",
  },
  {
    title: "Get your new look",
    body: "See a realistic result in seconds. Download it, keep it in your history, or run another outfit.",
  },
] as const;

const uses = [
  {
    title: "Try before you buy",
    body: "Upload a product photo from any shop and see how the piece looks on you before you order.",
  },
  {
    title: "Describe it in words",
    body: "“Light blue linen suit” is enough. The model handles fit, fabric and how it drapes on your pose.",
  },
  {
    title: "Plan an event outfit",
    body: "Compare wedding, black-tie and party looks side by side without a single fitting room trip.",
  },
  {
    title: "Refresh a profile photo",
    body: "Swap a T-shirt for a navy blazer and get a polished LinkedIn or résumé photo from a casual shot.",
  },
  {
    title: "You stay you",
    body: "Face, hair, pose and background are preserved. Only the outfit changes in each result.",
  },
  {
    title: "Private by default",
    body: "We don't keep the photos you upload, and you can delete any result from your history.",
  },
] as const;

const faqs: FaqItem[] = [
  {
    q: "What is an AI clothes changer?",
    a: "It is a tool that replaces the outfit in your photo with a new one — from a garment image, a text description or a preset style — while keeping your face, pose and background.",
  },
  {
    q: "Is it free to try?",
    a: `New accounts get ${WELCOME_CREDITS} free credits, and each outfit costs ${GENERATION_COST_CREDITS} credits. Failed runs are refunded automatically.`,
  },
  {
    q: "What kind of photo works best?",
    a: "A clear, well-lit photo of one person facing the camera, half or full body, with nothing covering the clothes. JPG, PNG or WebP up to 25 MB.",
  },
  {
    q: "Can I use my own clothing photo?",
    a: "Yes. Upload a product shot, a flat lay or a photo of someone wearing it. Clean backgrounds give the most accurate results.",
  },
  {
    q: "Are my photos private?",
    a: "We don't store the photos you upload — they are only used to create your result. Results are saved to your account history and you can delete any of them.",
  },
  {
    q: "What content is not allowed?",
    a: "Nudity, sexual content, and photos of minors or of people without their consent are not allowed. Accounts that misuse the tool are closed.",
  },
];

export default function AiClothesChangerPage() {
  return (
    <>
      <JsonLd
        data={[
          appSchema({
            name: "AI Clothes Changer",
            description,
            url: absoluteUrl("/ai-clothes-changer"),
          }),
          faqSchema(faqs),
        ]}
      />

      <Hero
        eyebrow={`${WELCOME_CREDITS} free credits when you sign up · No card needed`}
        title={
          <>
            Try on any outfit with the{" "}
            <span className="text-[var(--brand)]">AI clothes changer</span>
          </>
        }
        intro="Upload a photo and the AI clothes changer dresses you in a new outfit in seconds — from a garment photo, a few words or a curated style. Your face, pose and background stay exactly as they were."
        badges={["Face & pose preserved", "Garment photo or prompt", "Results in seconds"]}
      >
        <Studio tool="clothes" />
      </Hero>

      <Container id="styles" className="pt-20">
        <SectionHeader
          title="AI clothes changer styles"
          sub="Skip the prompt. Pick a curated look and it loads in the studio above."
        />
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featured.map((preset) => (
            <li key={preset.id}>
              <Link
                href={`/ai-clothes-changer?style=${preset.id}#studio`}
                scroll={false}
                className="card block overflow-hidden"
              >
                <Image
                  src={portraitSrc(preset.cover!, 600)}
                  alt={`${preset.name} outfit idea for the AI clothes changer`}
                  width={600}
                  height={800}
                  unoptimized
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover"
                />
                <span className="flex items-center justify-between gap-2 px-4 py-3">
                  <span>
                    <span className="block font-bold">{preset.name}</span>
                    <span className="block text-sm text-[var(--muted-ink)]">
                      {preset.category}
                    </span>
                  </span>
                  <span className="rounded-full bg-[var(--pop-pink)] px-2.5 py-1 text-xs font-bold text-[var(--pop-pink-bold)]">
                    Try
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-[var(--muted-ink)]">
          {stylePresets.length} curated styles across professional, wedding,
          casual, evening and seasonal looks — or upload any garment you like.
        </p>
      </Container>

      <Container id="how-it-works" className="pt-20">
        <SectionHeader
          title="How the AI clothes changer works"
          sub="No editing skills, no photoshoot. The model redraws only the clothes."
        />
        <StepCards steps={steps} />
        <div className="card mt-5 p-6">
          <p className="text-lg font-extrabold">Tips for a realistic result</p>
          <ul className="mt-3 grid gap-x-8 gap-y-2 leading-relaxed text-[var(--muted-ink)] md:grid-cols-2">
            <li>Stand facing the camera with your arms relaxed at your sides.</li>
            <li>Use even daylight; harsh shadows can confuse fabric and fit.</li>
            <li>Pick a garment photo on a plain background, front view only.</li>
            <li>Match the framing: a full-body outfit needs a full-body photo.</li>
            <li>Describe color, fabric and cut, for example “cream wool coat”.</li>
            <li>Run the same outfit twice to compare small fit differences.</li>
          </ul>
        </div>
      </Container>

      <Container className="pt-20">
        <SectionHeader
          title="What you can do with an AI clothes changer"
          sub={
            <>
              It works like a{" "}
              <SourceLink href="https://en.wikipedia.org/wiki/Virtual_dressing_room">
                virtual dressing room
              </SourceLink>{" "}
              that uses your own photo instead of a 3D avatar.
            </>
          }
        />
        <InfoCards items={uses} />
      </Container>

      <MoreTools current="clothes" label="Products and free style tools" />

      <Container id="pricing" className="pt-6">
        <SectionHeader
          title="AI clothes changer pricing"
          sub={`Each image costs ${GENERATION_COST_CREDITS} credits. Start with ${WELCOME_CREDITS} free credits and cancel any time.`}
          center
        />
        <PricingCards />
      </Container>

      <Container id="faq" className="pt-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.7fr]">
          <SectionHeader
            title="AI clothes changer FAQ"
            sub={
              <>
                Want outfit ideas for your proportions? Try the free{" "}
                <Link
                  href="/body-shape-calculator-female"
                  className="font-semibold text-[var(--brand-strong)] underline underline-offset-4"
                >
                  body shape calculator
                </Link>
                .
              </>
            }
          />
          <FaqList items={faqs} />
        </div>
      </Container>

      <CtaPanel
        title="See the outfit on you before you buy it"
        sub={`${WELCOME_CREDITS} free credits. No credit card.`}
        href="/ai-clothes-changer#studio"
        label="Try an outfit free"
      />
    </>
  );
}
