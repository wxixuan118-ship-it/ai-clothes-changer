import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { FoundationShadeFinder } from "@/components/face/foundation-shade-finder";
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
import { absoluteUrl } from "@/lib/site-url";

const title = "Foundation Shade Finder: Match Your Skin Tone | StyleMirror";
const description =
  "Free foundation shade finder: upload a selfie to read your skin tone and undertone, then see close shades from Fenty Beauty, MAC, NARS and more.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/foundation-shade-finder" },
  openGraph: { title, description, url: "/foundation-shade-finder" },
  twitter: { title, description },
};

const steps = [
  {
    title: "Upload a selfie",
    body: "Use natural daylight and a bare or lightly made-up face, looking straight at the camera.",
  },
  {
    title: "Skin is sampled",
    body: "The finder averages skin color from your forehead, both cheeks and chin, avoiding eyes, brows and lips.",
  },
  {
    title: "Get matched shades",
    body: "See your skin tone, undertone and the closest shades across 35 foundations from five brands.",
  },
] as const;

// Display swatches for the six tone groups the finder reports.
const tones = [
  { name: "Fair", hex: "#FDE8D0", body: "The lightest group. Often labeled porcelain, ivory or the lowest shade numbers." },
  { name: "Light", hex: "#F0CEA6", body: "Light skin with visible warmth or pink. Common labels include light, nude and beige." },
  { name: "Light medium", hex: "#DDB17F", body: "Between light and medium, often where sand, natural and buff shades sit." },
  { name: "Medium", hex: "#C28E5A", body: "The middle of most ranges, with golden, olive or neutral hints." },
  { name: "Tan", hex: "#9A683A", body: "Deeper golden or caramel skin; check both warm and neutral options." },
  { name: "Deep", hex: "#613D21", body: "Rich, deep skin where red, neutral and golden undertones vary widely." },
] as const;

const undertones = [
  { title: "Warm", body: "Golden, yellow or peachy hints. Veins look greenish and gold jewelry tends to flatter. Look for W or golden shades." },
  { title: "Cool", body: "Pink, red or bluish hints. Veins look blue or purple and silver tends to flatter. Look for C or pink shades." },
  { title: "Neutral", body: "A balance of warm and cool. Both gold and silver work, and N shades usually match best." },
  { title: "Olive", body: "A subtle green-gray cast over warm or neutral skin. Often misread as neutral; try olive or neutral-warm shades." },
] as const;

const faqs: FaqItem[] = [
  {
    q: "Is it free to use?",
    a: "Yes, completely free. No sign-up, no paywalls and no usage limits. The analysis runs entirely in your browser.",
  },
  {
    q: "Does my photo get uploaded to a server?",
    a: "No. Face detection uses Google's MediaPipe model in your browser and your photo never leaves your device.",
  },
  {
    q: "How accurate is the shade match?",
    a: "Colors are compared in the CIELAB color space using the CIEDE2000 difference formula. Lighting and camera white balance shift results, so natural daylight works best — always swatch the closest two shades on your jaw before buying.",
  },
  {
    q: "Which brands are included?",
    a: "Fenty Beauty, MAC, NARS, Estée Lauder and Maybelline — 35 shades in total.",
  },
  {
    q: "What kind of photo works best?",
    a: "Face a window in daylight, remove heavy makeup and glasses, and avoid filters or beauty modes that smooth or tint the skin.",
  },
];

export default function FoundationShadeFinderPage() {
  return (
    <>
      <JsonLd
        data={[
          appSchema({
            name: "Foundation Shade Finder",
            description,
            url: absoluteUrl("/foundation-shade-finder"),
            category: "LifestyleApplication",
          }),
          faqSchema(faqs),
        ]}
      />

      <Hero
        eyebrow="100% free · No sign-up · Photo stays on your device"
        title={
          <>
            Foundation shade finder{" "}
            <span className="text-[var(--brand)]">from one selfie</span>
          </>
        }
        intro="Upload a selfie and the free foundation shade finder reads your skin tone and undertone in seconds. It then lists the closest foundation shades from five brands, including Fenty Beauty, MAC and NARS."
      >
        <FoundationShadeFinder />
      </Hero>

      <Container id="how-it-works" className="pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
          <Image
            src="/guides/foundation-sampling.svg"
            alt="Foundation shade finder sample points on the forehead, cheeks and chin, above six skin tone swatches"
            width={320}
            height={270}
            unoptimized
            loading="lazy"
            className="card mx-auto h-auto w-full max-w-[420px] p-4"
          />
          <div>
            <SectionHeader
              title="How the foundation shade finder works"
              sub={
                <>
                  Shades are compared with the{" "}
                  <SourceLink href="https://en.wikipedia.org/wiki/Color_difference#CIEDE2000">
                    CIEDE2000 color difference
                  </SourceLink>{" "}
                  formula, which tracks how people perceive color.
                </>
              }
            />
            <StepCards steps={steps} />
          </div>
        </div>
      </Container>

      <Container id="skin-tones" className="pt-20">
        <SectionHeader
          title="Skin tones the foundation shade finder detects"
          sub="Your result lands in one of six tone groups. Labels differ by brand, so use them as a starting point."
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tones.map((tone) => (
            <li key={tone.name} className="card flex items-start gap-4 p-5">
              <span
                aria-hidden
                className="size-12 shrink-0 rounded-full border-4 border-white shadow-[0_2px_8px_rgba(14,19,24,0.18)]"
                style={{ backgroundColor: tone.hex }}
              />
              <div>
                <p className="text-lg font-extrabold">{tone.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted-ink)]">
                  {tone.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>

      <Container id="undertones" className="pt-20">
        <SectionHeader
          title="Undertones and your foundation shade"
          sub="Depth gets you close; undertone is what makes a shade disappear on skin."
        />
        <InfoCards items={undertones} cols={4} />
        <div className="card mt-5 p-6">
          <p className="text-lg font-extrabold">How to test your match in store</p>
          <ul className="mt-3 grid gap-x-8 gap-y-2 leading-relaxed text-[var(--muted-ink)] md:grid-cols-2">
            <li>Swatch your top two shades side by side along the jawline, not the hand.</li>
            <li>Check the stripes in daylight by a window, not under store lights.</li>
            <li>Wait ten minutes — many formulas oxidize and turn slightly darker.</li>
            <li>The right shade blends into your neck without a visible line.</li>
            <li>Between two shades? Pick the lighter one and warm it with bronzer.</li>
            <li>Skin often darkens in summer, so re-check your match each season.</li>
          </ul>
        </div>
      </Container>

      <Container id="faq" className="pt-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.7fr]">
          <SectionHeader
            title="Foundation shade finder FAQ"
            sub={
              <>
                Curious about your features too? Try the free{" "}
                <Link
                  href="/face-shape-detector"
                  className="font-semibold text-[var(--brand-strong)] underline underline-offset-4"
                >
                  face shape detector
                </Link>
                .
              </>
            }
          />
          <FaqList items={faqs} />
        </div>
      </Container>

      <MoreTools current="foundation" />

      <CtaPanel
        title="Match your makeup, then try a new hair color"
        sub="Preview copper, blonde or brunette shades on your own photo with the AI hairstyle changer."
        href="/#studio"
        label="Try a hair color"
      />
    </>
  );
}
