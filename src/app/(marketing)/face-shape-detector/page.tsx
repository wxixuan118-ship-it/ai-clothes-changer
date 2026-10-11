import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { FaceShapeDetector } from "@/components/face/face-shape-detector";
import {
  appSchema,
  Container,
  CtaPanel,
  FaqList,
  faqSchema,
  Hero,
  JsonLd,
  MoreTools,
  SectionHeader,
  SourceLink,
  StepCards,
  type FaqItem,
} from "@/components/site/blocks";
import { faceShapeInfo, type FaceShape } from "@/lib/face/face-shape-info";
import { absoluteUrl } from "@/lib/site-url";

const title = "Face Shape Detector: Find Your Face Shape Free | StyleMirror";
const description =
  "Free face shape detector: upload a selfie to find out if your face is oval, round, square, heart, diamond, oblong or triangle, plus haircuts and glasses.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/face-shape-detector" },
  openGraph: { title, description, url: "/face-shape-detector" },
  twitter: { title, description },
};

const shapes = Object.keys(faceShapeInfo) as FaceShape[];

const steps = [
  {
    title: "Upload a selfie",
    body: "Take a clear front-facing photo, or use your camera. Pull your hair back and remove glasses if you can.",
  },
  {
    title: "Landmarks are measured",
    body: "The detector maps 478 facial landmarks in your browser and measures face length, forehead, cheekbones and jaw.",
  },
  {
    title: "Get your face shape",
    body: "See the closest of seven face shapes, with haircuts and glasses frames that suit your proportions.",
  },
] as const;

const measure = [
  ["Forehead", "Measure across your forehead, halfway between your eyebrows and hairline."],
  ["Cheekbones", "Measure across the widest point of your cheekbones, just below the outer corners of your eyes."],
  ["Jawline", "Measure from the tip of your chin to below your ear, then double it."],
  ["Face length", "Measure from the center of your hairline down to the tip of your chin."],
] as const;

const faqs: FaqItem[] = [
  {
    q: "Is the face shape detector free?",
    a: "Yes, completely free. No sign-up, no watermarks and no usage limits. The analysis runs entirely in your browser.",
  },
  {
    q: "Does my photo get uploaded anywhere?",
    a: "No. The face shape detector runs locally in your browser using Google's MediaPipe model. Your photo never leaves your device.",
  },
  {
    q: "How accurate is the face shape detector?",
    a: "It measures 478 facial landmarks and compares your proportions to seven reference shapes. Results are most reliable with a clear, front-facing photo in even light. Many faces sit between two shapes, so treat the result as a guide.",
  },
  {
    q: "What kind of photo works best?",
    a: "A straight-on photo at eye level, hair pulled back, glasses off and a neutral expression. Avoid wide-angle selfies held very close to the face.",
  },
  {
    q: "How many face shapes can it detect?",
    a: "Seven: oval, round, square, heart, diamond, oblong and triangle.",
  },
];

export default function FaceShapeDetectorPage() {
  return (
    <>
      <JsonLd
        data={[
          appSchema({
            name: "Face Shape Detector",
            description,
            url: absoluteUrl("/face-shape-detector"),
            category: "LifestyleApplication",
          }),
          faqSchema(faqs),
        ]}
      />

      <Hero
        eyebrow="100% free · No sign-up · Photo stays on your device"
        title={
          <>
            Face shape detector:{" "}
            <span className="text-[var(--brand)]">what shape is your face?</span>
          </>
        }
        intro="Upload a selfie and the free face shape detector finds your face shape in seconds, from oval and round to heart and diamond. Each face shape result comes with haircuts and glasses frames that flatter it."
      >
        <FaceShapeDetector />
      </Hero>

      <Container id="how-it-works" className="pt-20">
        <SectionHeader
          title="How the face shape detector works"
          sub={
            <>
              Detection uses Google&apos;s{" "}
              <SourceLink href="https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker">
                MediaPipe Face Landmarker
              </SourceLink>
              , running on your device.
            </>
          }
        />
        <StepCards steps={steps} />
      </Container>

      <Container id="face-shapes" className="pt-20">
        <SectionHeader
          title="7 face shapes the detector recognizes"
          sub="Find yours below, with the haircuts and frames that tend to suit it."
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shapes.map((shape) => {
            const info = faceShapeInfo[shape];
            return (
              <li key={shape} className="card flex gap-4 p-5">
                <Image
                  src={`/guides/face-shapes/${shape}.svg`}
                  alt={`${info.label} face shape reference outline used by the face shape detector`}
                  width={200}
                  height={210}
                  unoptimized
                  loading="lazy"
                  className="h-auto w-24 shrink-0 self-start rounded-xl bg-[var(--paper-2)]"
                />
                <div>
                  <p className="text-lg font-extrabold">{info.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted-ink)]">
                    {info.description}
                  </p>
                  <p className="mt-2 text-sm">
                    <span className="font-bold">Haircuts:</span>{" "}
                    {info.hairstyles.slice(0, 3).join(", ")}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-bold">Glasses:</span>{" "}
                    {info.glasses.slice(0, 2).join(", ")}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>

      <Container className="pt-20">
        <SectionHeader
          title="Check your face shape by hand"
          sub="No photo handy? Four measurements with a soft tape give you the same comparison the detector makes."
        />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {measure.map(([name, how], i) => (
            <li key={name} className="card p-6">
              <span className="tile size-10 rounded-full bg-[var(--pop-mint)] font-extrabold text-[var(--free-text)]">
                {i + 1}
              </span>
              <p className="mt-3 text-lg font-extrabold">{name}</p>
              <p className="mt-1 leading-relaxed text-[var(--muted-ink)]">{how}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 max-w-3xl leading-relaxed text-[var(--muted-ink)]">
          Then compare: if face length is clearly the largest number, your face
          is oval or oblong. If width and length are close, it is round or
          square — a sharp jaw points to square. A forehead wider than the jaw
          suggests heart, cheekbones wider than both suggest diamond, and a jaw
          wider than the forehead suggests triangle.
        </p>
      </Container>

      <Container id="faq" className="pt-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.7fr]">
          <SectionHeader
            title="Face shape detector FAQ"
            sub={
              <>
                Know your shape? See the{" "}
                <Link
                  href="/hairstyles-for-face-shape"
                  className="font-semibold text-[var(--brand-strong)] underline underline-offset-4"
                >
                  best hairstyles for your face shape
                </Link>
                .
              </>
            }
          />
          <FaqList items={faqs} />
        </div>
      </Container>

      <MoreTools current="face-shape" />

      <CtaPanel
        title="Found your face shape? Try a haircut that suits it"
        sub="Preview any of 65 hairstyles on your own photo with the AI hairstyle changer."
        href="/#studio"
        label="Try a hairstyle"
      />
    </>
  );
}
