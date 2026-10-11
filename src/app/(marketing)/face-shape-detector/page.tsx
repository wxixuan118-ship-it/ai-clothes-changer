import type { Metadata, ResolvingMetadata } from "next";

import { FaceShapeDetector } from "@/components/face/face-shape-detector";
import { OtherTool } from "@/components/atelier/other-tool";

const title = "Face Shape Detector: Find Your Face Shape Free | StyleMirror AI";
const description =
  "Upload a photo and find your face shape in seconds — free, private, and powered by AI. Get personalized hairstyle and glasses recommendations for oval, round, square, heart, and more.";

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const previous = await parent;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/face-shape-detector" },
    openGraph: {
      ...previous.openGraph,
      title,
      description,
      url: "/face-shape-detector",
    },
    twitter: { ...previous.twitter, title, description },
  };
}

export default function FaceShapeDetectorPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-[1240px] px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-[var(--brand)]">Free Face Shape Analyzer</p>
          <h1 className="text-display mt-3">What shape is your face?</h1>
          <p className="mt-4 max-w-[52ch] text-[var(--muted-ink)] sm:text-lg">
            Upload a selfie and discover your face shape in seconds. Get
            personalized recommendations for hairstyles, glasses, and makeup
            that flatter your unique features.
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            <li className="badge-brand">100% Free</li>
            <li className="badge-brand">No sign-up</li>
            <li className="badge-brand">Photo stays private</li>
            <li className="badge-brand">Powered by AI</li>
          </ul>
        </div>

        <FaceShapeDetector />
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-6">
        <p className="eyebrow text-center text-[var(--brand)]">How it works</p>
        <h2 className="text-title mt-3 text-center">Three easy steps</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Upload your photo",
              desc: "Take a clear front-facing selfie or upload one from your camera roll.",
            },
            {
              step: "02",
              title: "AI analyzes your face",
              desc: "Our AI maps 478 facial landmarks and measures your proportions.",
            },
            {
              step: "03",
              title: "Get your results",
              desc: "See your face shape plus hairstyle, glasses, and makeup recommendations.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border bg-[var(--paper-2)] p-6"
            >
              <span className="chip-mono">{item.step}</span>
              <h3 className="mt-3 text-xl font-bold">{item.title}</h3>
              <p className="mt-2 text-[var(--muted-ink)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Face shapes */}
      <section className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6">
        <p className="eyebrow text-center text-[var(--brand)]">7 Face Shapes</p>
        <h2 className="text-title mt-3 text-center">Which one are you?</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Oval", desc: "Longer than wide, rounded jaw" },
            { name: "Round", desc: "Equal width and length, soft angles" },
            { name: "Square", desc: "Strong jaw, similar width all over" },
            { name: "Heart", desc: "Wide forehead, narrow chin" },
            { name: "Diamond", desc: "Wide cheekbones, narrow forehead & jaw" },
            { name: "Oblong", desc: "Much longer than wide, straight sides" },
            { name: "Triangle", desc: "Narrow forehead, wide jaw" },
          ].map((shape) => (
            <div
              key={shape.name}
              className="rounded-2xl border bg-[var(--paper-2)] p-5 text-center"
            >
              <div className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-[var(--brand)]/30 bg-[var(--brand)]/5">
                <span className="text-xl font-bold text-[var(--brand)]">
                  {shape.name.charAt(0)}
                </span>
              </div>
              <h3 className="mt-3 font-bold">{shape.name}</h3>
              <p className="mt-1 text-sm text-[var(--muted-ink)]">{shape.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cross-link to other tools */}
      <OtherTool tool="hair" />
      <OtherTool tool="clothes" />

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <p className="eyebrow text-center text-[var(--brand)]">FAQ</p>
        <h2 className="text-title mt-3 text-center">Questions</h2>
        <div className="mt-8 space-y-3">
          {[
            {
              q: "Is the face shape detector really free?",
              a: "Yes, completely free. No sign-up, no watermarks, no usage limits. The analysis runs entirely in your browser.",
            },
            {
              q: "Does my photo get uploaded anywhere?",
              a: "No. Everything runs locally in your browser using Google's MediaPipe AI. Your photo never leaves your device.",
            },
            {
              q: "How accurate is it?",
              a: "Our AI uses 478 facial landmarks to measure your proportions. Results are generally accurate for clear front-facing photos with good lighting.",
            },
            {
              q: "What kind of photo works best?",
              a: "Use a clear front-facing photo with your hair pulled back and good even lighting. Remove glasses if possible.",
            },
          ].map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border bg-[var(--paper-2)] p-5"
            >
              <summary className="flex cursor-pointer items-center justify-between font-semibold list-none">
                {item.q}
                <span className="ml-4 text-[var(--muted-ink)] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-[var(--muted-ink)]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
