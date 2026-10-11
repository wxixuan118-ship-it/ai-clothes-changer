import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

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
import { CompareSlider } from "@/components/site/compare-slider";
import { PricingCards } from "@/components/site/pricing-cards";
import { Studio } from "@/components/site/studio";
import { ToolShortcuts } from "@/components/site/tool-shortcuts";
import { hairPresets } from "@/config/hairstyles";
import { GENERATION_COST_CREDITS, WELCOME_CREDITS } from "@/config/plans";
import { absoluteUrl } from "@/lib/site-url";

// Primary keyword page: "ai hairstyle".
const title = "AI Hairstyle Changer: Try New Haircuts | StyleMirror AI";
const description =
  "Try an AI hairstyle on your own photo. Preview new haircuts, colors, curls and bangs from 65 styles, a reference photo or a prompt. Start with free credits.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, url: "/" },
  twitter: { title, description },
};

const featured = [
  "pixie-cut",
  "copper-bob",
  "curtain-bangs",
  "wolf-cut",
  "long-curls",
  "box-braids",
  "afro",
  "silver-quiff",
].map((id) => hairPresets.find((preset) => preset.id === id)!);

const steps = [
  {
    title: "Upload a selfie",
    body: "Use a clear, front-facing photo of one person with the hair visible and good light.",
  },
  {
    title: "Pick a hairstyle",
    body: "Choose one of 65 curated styles, upload a haircut photo, or describe the cut and color.",
  },
  {
    title: "Compare and save",
    body: "See the new hairstyle next to your original photo, download it, or try another look.",
  },
] as const;

const reasons = [
  {
    title: "Copy any haircut",
    body: "Upload a photo of a hairstyle you love — from a salon, a magazine or a celebrity — and see it on yourself.",
  },
  {
    title: "Describe it in words",
    body: "“Short curly bob, copper red” is enough. The model handles cut, length, texture and color.",
  },
  {
    title: "Cuts and colors",
    body: "Pixies, bobs, layers, curls, braids, locs, fades and quiffs, plus bold or subtle hair color changes.",
  },
  {
    title: "You stay you",
    body: "Your face, features, makeup and background stay the same. Only the hair changes in every result.",
  },
  {
    title: "Every look saved",
    body: "Each result lands in your private history, so you can compare options side by side before you book.",
  },
  {
    title: "Private by default",
    body: "We don't keep the photos you upload. Delete any result from your history at any time.",
  },
] as const;

const faqs: FaqItem[] = [
  {
    q: "What is an AI hairstyle changer?",
    a: "It is a tool that gives the person in your photo a new haircut or hair color — from a hairstyle photo, a text description or a preset style — while keeping their face, features and background.",
  },
  {
    q: "Is the AI hairstyle tool free to try?",
    a: `Yes. New accounts get ${WELCOME_CREDITS} free credits and each AI hairstyle costs ${GENERATION_COST_CREDITS} credits. Failed runs are refunded automatically.`,
  },
  {
    q: "What kind of photo works best?",
    a: "A clear, well-lit photo of one person facing the camera with the hair visible and not covered by a hat or hands. JPG, PNG or WebP up to 25 MB.",
  },
  {
    q: "Can I try a hairstyle from a celebrity or salon photo?",
    a: "Yes. Upload the hairstyle photo as a reference and the AI recreates the cut, length and color on your photo.",
  },
  {
    q: "Can I only change my hair color?",
    a: "Yes. Pick a color such as platinum blonde or copper red, or describe the shade you want in words.",
  },
  {
    q: "Are my photos private?",
    a: "We don't store the photos you upload — they are only used to create your result. Results are saved to your account history and you can delete any of them.",
  },
  {
    q: "Can I use the images commercially?",
    a: "Images created on a paid plan carry no watermark and can be used commercially, for example on social media or in ads.",
  },
];

export default function Home() {
  return (
    <>
      <JsonLd
        data={[
          appSchema({
            name: "AI Hairstyle Changer",
            description,
            url: absoluteUrl("/"),
          }),
          faqSchema(faqs),
        ]}
      />

      <Hero
        eyebrow={`${WELCOME_CREDITS} free credits when you sign up · No card needed`}
        title={
          <>
            Try an AI hairstyle{" "}
            <span className="text-[var(--brand)]">before the salon</span>
          </>
        }
        intro="Upload a selfie and try an AI hairstyle in seconds — new haircuts, colors, curls or bangs from 65 styles, a photo or a prompt. Your face stays yours in every AI hairstyle."
      >
        <ToolShortcuts />
        <Studio tool="hair" />
      </Hero>

      <Container id="styles" className="pt-20">
        <SectionHeader
          title="Trending AI hairstyles"
          sub={
            <>
              Pick a style to load it in the studio above. Want more ideas?
              Browse this <SourceLink href="https://en.wikipedia.org/wiki/List_of_hairstyles">list of hairstyles</SourceLink>.
            </>
          }
          action={
            <Link
              href="/#studio"
              className="inline-flex min-h-11 items-center gap-1.5 font-bold text-[var(--brand-strong)]"
            >
              See all 65 hairstyles
              <ArrowRightIcon className="size-4" aria-hidden />
            </Link>
          }
        />
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {featured.map((preset) => (
            <li key={preset.id}>
              <Link
                href={`/?style=${preset.id}#studio`}
                scroll={false}
                className="card block overflow-hidden"
              >
                <Image
                  src={`/hairstyles/${preset.id}.jpg`}
                  alt={`${preset.name} AI hairstyle preview`}
                  width={360}
                  height={480}
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
                  <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-bold text-[var(--brand-strong)]">
                    Try
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      <Container id="examples" className="pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <CompareSlider
            before="/hairstyle-transformations/bob-before.webp"
            after="/hairstyle-transformations/bob-after.webp"
            beforeAlt="Before: shoulder-length hair, original photo"
            afterAlt="After: the same person with a French bob AI hairstyle"
            afterLabel="French bob"
          />
          <div>
            <h2 className="text-[clamp(1.9rem,1.2rem+2vw,2.9rem)] leading-[1.08] font-extrabold tracking-[-0.03em]">
              AI hairstyle before and after
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--muted-ink)]">
              Drag the slider to compare. The model keeps your
              face, skin and framing, and only changes the hair you asked
              for, so the comparison shows the cut, not a different person.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                ["curls", "Defined curls"],
                ["pixie", "Textured pixie"],
              ].map(([id, name]) => (
                <figure key={id} className="card overflow-hidden">
                  <Image
                    src={`/hairstyle-transformations/${id}-after.webp`}
                    alt={`After: ${name.toLowerCase()} AI hairstyle result`}
                    width={700}
                    height={850}
                    unoptimized
                    loading="lazy"
                    className="aspect-square w-full object-cover object-[center_25%]"
                  />
                  <figcaption className="px-3 py-2.5 text-sm font-bold">
                    {name}
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--muted-ink)]">
              Illustrative AI examples. Your result depends on your photo,
              chosen style and model output.
            </p>
          </div>
        </div>
      </Container>

      <Container id="how-it-works" className="pt-20">
        <SectionHeader
          title="How to use the AI hairstyle changer"
          sub="Three steps, about a minute. No salon visit, no regrets."
        />
        <StepCards steps={steps} />
      </Container>

      <Container className="pt-20">
        <SectionHeader
          title="Why try an AI hairstyle first"
          sub="A haircut takes months to grow out. A preview takes seconds."
        />
        <InfoCards items={reasons} />
      </Container>

      <MoreTools current="hair" label="Products and free style tools" />

      <Container id="pricing" className="pt-6">
        <SectionHeader
          title="AI hairstyle pricing"
          sub={`Each image costs ${GENERATION_COST_CREDITS} credits. Start with ${WELCOME_CREDITS} free credits and cancel any time.`}
          center
        />
        <PricingCards />
      </Container>

      <Container id="faq" className="pt-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.7fr]">
          <SectionHeader
            title="AI hairstyle FAQ"
            sub={
              <>
                Still unsure? Read the <Link href="/hairstyles-for-face-shape" className="font-semibold text-[var(--brand-strong)] underline underline-offset-4">hairstyles for face shape guide</Link>.
              </>
            }
          />
          <FaqList items={faqs} />
        </div>
      </Container>

      <CtaPanel
        title="See your next haircut before the salon does"
        sub={`${WELCOME_CREDITS} free credits. No credit card.`}
        href="/#studio"
        label="Try an AI hairstyle"
      />
    </>
  );
}
