import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { HairstyleFaceShapeTool } from "@/components/face/hairstyle-face-shape-tool";
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
import { faceShapeHairstyles } from "@/config/face-shape-hairstyles";
import { faceShapeInfo, type FaceShape } from "@/lib/face/face-shape-info";
import { absoluteUrl } from "@/lib/site-url";

const title = "Hairstyles for Face Shape: Free Finder | StyleMirror AI";
const description =
  "Free hairstyles for face shape finder: upload a selfie to get cuts for oval, round, square, heart, diamond, oblong and triangle faces, then try one on.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/hairstyles-for-face-shape" },
  openGraph: { title, description, url: "/hairstyles-for-face-shape" },
  twitter: { title, description },
};

const shapes = Object.keys(faceShapeHairstyles) as FaceShape[];

const steps = [
  {
    title: "Upload a selfie",
    body: "Use a clear, front-facing photo with your hair pulled away from your face and even light.",
  },
  {
    title: "See your face shape",
    body: "Your browser measures facial landmarks and picks the closest of seven face shapes.",
  },
  {
    title: "Explore matching hairstyles",
    body: "Browse cuts picked for your proportions, then try one on your own photo in the hairstyle changer.",
  },
] as const;

const beyond = [
  {
    title: "Hair texture",
    body: "Fine, straight hair holds a blunt line; thick or curly hair suits layers that remove bulk. Pick cuts that work with your texture, not against it.",
  },
  {
    title: "Your features",
    body: "A fringe draws attention to the eyes, a side part softens a strong jaw, and volume at the crown adds height. Use these as levers, not rules.",
  },
  {
    title: "Daily styling time",
    body: "A sleek bob needs regular trims and a blow-dry; long layers and natural curls are usually lower effort day to day.",
  },
] as const;

const faqs: FaqItem[] = [
  {
    q: "How do I find hairstyles for my face shape?",
    a: "Upload a clear front-facing photo above. The analysis runs in your browser, finds the closest face shape and lists hairstyles that tend to flatter it.",
  },
  {
    q: "Is the hairstyle finder free?",
    a: "Yes. Face shape analysis and recommendations are free and need no sign-up. Trying a hairstyle on your own photo uses the AI hairstyle changer, which runs on credits.",
  },
  {
    q: "Do face shape rules always apply?",
    a: "No. Face shape is a helpful starting point, but hair texture, your features and how much time you spend styling matter just as much. Many people sit between two shapes.",
  },
  {
    q: "Is my photo uploaded?",
    a: "No. The face analysis uses Google's MediaPipe model in your browser and your photo never leaves your device.",
  },
];

export default function HairstylesForFaceShapePage() {
  return (
    <>
      <JsonLd
        data={[
          appSchema({
            name: "Hairstyles for Face Shape Finder",
            description,
            url: absoluteUrl("/hairstyles-for-face-shape"),
            category: "LifestyleApplication",
          }),
          faqSchema(faqs),
        ]}
      />

      <Hero
        eyebrow="Free · No sign-up · Photo stays on your device"
        title={
          <>
            Hairstyles for face shape,{" "}
            <span className="text-[var(--brand)]">made simple</span>
          </>
        }
        intro="Get free hairstyles for face shape recommendations from one selfie — the finder detects your face shape, suggests hairstyles that balance your proportions, and lets you try those hairstyles on your own photo."
      >
        <HairstyleFaceShapeTool />
      </Hero>

      <Container id="how-it-works" className="pt-20">
        <SectionHeader
          title="How to find hairstyles for your face shape"
          sub={
            <>
              Face detection uses Google&apos;s{" "}
              <SourceLink href="https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker">
                MediaPipe Face Landmarker
              </SourceLink>{" "}
              and runs entirely on your device.
            </>
          }
        />
        <StepCards steps={steps} />
      </Container>

      <Container id="by-face-shape" className="pt-20">
        <SectionHeader
          title="Best hairstyles for each face shape"
          sub="Tap a cut to open it in the AI hairstyle changer."
        />
        <ul className="grid gap-5 lg:grid-cols-2">
          {shapes.map((shape) => {
            const picks = faceShapeHairstyles[shape];
            const info = faceShapeInfo[shape];
            return (
              <li key={shape} className="card p-5">
                <div className="flex items-center gap-4">
                  <Image
                    src={`/guides/face-shapes/${shape}.svg`}
                    alt={`${info.label} face outline in the hairstyles for face shape guide`}
                    width={200}
                    height={210}
                    unoptimized
                    loading="lazy"
                    className="h-auto w-16 shrink-0 rounded-xl bg-[var(--paper-2)]"
                  />
                  <div>
                    <p className="text-lg font-extrabold">
                      {info.label} face
                    </p>
                    <p className="text-sm leading-relaxed text-[var(--muted-ink)]">
                      {picks.note}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">
                      <span className="font-bold">More ideas:</span>{" "}
                      {info.hairstyles.join(", ")}.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {picks.styles.map((style) => (
                    <Link
                      key={style.id}
                      href={`/?style=${style.id}#studio`}
                      className="overflow-hidden rounded-[14px] border border-[var(--border)] transition-colors hover:border-[var(--brand-line)]"
                    >
                      <Image
                        src={`/hairstyles/${style.id}.jpg`}
                        alt={`${style.name}, one of the best hairstyles for a ${info.label.toLowerCase()} face shape`}
                        width={360}
                        height={480}
                        unoptimized
                        loading="lazy"
                        className="aspect-[3/4] w-full object-cover"
                      />
                      <span className="block truncate px-2.5 py-2 text-sm font-bold">
                        {style.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </Container>

      <Container className="pt-20">
        <SectionHeader
          title="Hairstyles for face shape and hair type"
          sub="Face shape is one input. These three matter just as much when you choose a cut."
        />
        <InfoCards items={beyond} />
      </Container>

      <Container id="faq" className="pt-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.7fr]">
          <SectionHeader
            title="Hairstyles for face shape FAQ"
            sub={
              <>
                Only need your shape? Use the{" "}
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

      <MoreTools current="hairstyle-face-shape" />

      <CtaPanel
        title="Ready to see a new cut on you?"
        sub="Pick a hairstyle you like and preview it with the AI hairstyle changer."
        href="/#studio"
        label="Try a hairstyle"
      />
    </>
  );
}
