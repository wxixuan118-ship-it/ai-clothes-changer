import type { Metadata } from "next";

import { BodyShapeCalculator } from "@/components/body/body-shape-calculator";
import { OtherTool } from "@/components/atelier/other-tool";
import { bodyShapeInfo, type BodyShape } from "@/lib/body-shape";

export const metadata: Metadata = {
  title: "Body Shape Calculator Female: Find Your Shape Free",
  description:
    "Free body shape calculator for women. Enter bust, waist, and hip measurements in inches or centimeters to find your shape and explore outfit ideas.",
  keywords: [
    "body shape calculator female",
    "body shape women calculator",
    "female body shape calculator",
  ],
  alternates: { canonical: "/body-shape-calculator-female" },
  openGraph: {
    title: "Body Shape Calculator Female: Find Your Shape Free",
    description:
      "Use three measurements to find an approximate body shape and outfit ideas.",
    url: "/body-shape-calculator-female",
  },
};

const shapes: BodyShape[] = [
  "hourglass",
  "pear",
  "inverted-triangle",
  "rectangle",
  "apple",
];

export default function BodyShapeCalculatorPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-[1240px] px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-[var(--brand)]">Free style tool</p>
          <h1 className="text-display mt-3">Body shape calculator for women</h1>
          <p className="mx-auto mt-4 max-w-[55ch] text-[var(--muted-ink)] sm:text-lg">
            Enter three measurements to explore your proportions and discover
            outfit ideas. This free women&apos;s body shape calculator works in
            inches or centimeters.
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            <li className="badge-brand">Free to use</li>
            <li className="badge-brand">Inches or centimeters</li>
            <li className="badge-brand">No sign-up</li>
            <li className="badge-brand">Measurements stay private</li>
          </ul>
        </div>
        <BodyShapeCalculator />
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-6">
        <p className="eyebrow text-center text-[var(--brand)]">
          Before you begin
        </p>
        <h2 className="text-title mt-3 text-center">How to measure</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            [
              "01",
              "Bust",
              "Wrap the tape around the fullest part of your bust. Keep it level.",
            ],
            [
              "02",
              "Waist",
              "Measure your natural waist without pulling the tape tight.",
            ],
            [
              "03",
              "Hips",
              "Measure around the fullest part of your hips and seat.",
            ],
          ].map(([number, title, description]) => (
            <div
              key={number}
              className="rounded-2xl border bg-[var(--paper-2)] p-6"
            >
              <span className="chip-mono">{number}</span>
              <h3 className="mt-3 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-[var(--muted-ink)]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6">
        <p className="eyebrow text-center text-[var(--brand)]">
          Five common guides
        </p>
        <h2 className="text-title mt-3 text-center">Explore body shapes</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shapes.map((shape) => (
            <div
              key={shape}
              className="rounded-2xl border bg-[var(--paper-2)] p-6"
            >
              <h3 className="text-xl font-bold">
                {bodyShapeInfo[shape].label}
              </h3>
              <p className="mt-2 text-[var(--muted-ink)]">
                {bodyShapeInfo[shape].description}
              </p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-[var(--muted-ink)]">
          These are approximate styling categories, not rules about what you can
          wear or a measure of health.
        </p>
      </section>

      <OtherTool tool="clothes" />

      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <p className="eyebrow text-center text-[var(--brand)]">FAQ</p>
        <h2 className="text-title mt-3 text-center">Questions</h2>
        <div className="mt-8 space-y-3">
          {[
            [
              "What measurements do I need?",
              "Bust, natural waist, and hips. Use the same unit for all three measurements.",
            ],
            [
              "How does the calculator work?",
              "It compares the relative sizes of your three measurements and chooses the closest of five common styling categories.",
            ],
            [
              "Is the result exact?",
              "No. Body shape labels are approximate, and a tape measure cannot capture every detail of a silhouette.",
            ],
            [
              "Are my measurements saved?",
              "No. The calculation runs in your browser and does not upload or save your measurements.",
            ],
          ].map(([question, answer]) => (
            <details
              key={question}
              className="group rounded-2xl border bg-[var(--paper-2)] p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                {question}
                <span className="ml-4 text-[var(--muted-ink)] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-[var(--muted-ink)]">{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
