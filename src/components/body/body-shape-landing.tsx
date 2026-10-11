import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { bodyShapeInfo, maleBodyShapeInfo } from "@/lib/body-shape";

import { BodyShapeCalculator } from "./body-shape-calculator";

type Audience = "female" | "male";

const copy = {
  female: {
    title: "Body shape calculator for women",
    intro:
      "Enter three measurements to explore your proportions and discover outfit ideas. This free women's body shape calculator works in inches or centimeters.",
    measurements: [
      [
        "Bust",
        "Wrap the tape around the fullest part of your bust. Keep it level.",
      ],
      ["Waist", "Measure your natural waist without pulling the tape tight."],
      ["Hips", "Measure around the fullest part of your hips and seat."],
    ],
    shapes: bodyShapeInfo,
    faq: [
      [
        "What measurements do I need?",
        "Bust, natural waist, and hips. Use the same unit for all three measurements.",
      ],
      [
        "How does the calculator work?",
        "It compares the relative sizes of your three measurements and chooses the closest of five common styling categories.",
      ],
    ],
  },
  male: {
    title: "Body shape calculator for men",
    intro:
      "Enter shoulder, chest, waist, and hip measurements to explore your proportions and find outfit ideas. Use inches or centimeters.",
    measurements: [
      [
        "Shoulders",
        "Wrap the tape around the widest part of your shoulders. Ask someone to help keep it level.",
      ],
      [
        "Chest",
        "Measure around the fullest part of your chest, under your arms.",
      ],
      ["Waist", "Measure your natural waist without pulling the tape tight."],
      ["Hips", "Measure around the fullest part of your hips and seat."],
    ],
    shapes: maleBodyShapeInfo,
    faq: [
      [
        "What measurements do I need?",
        "Shoulder circumference, chest, natural waist, and hips. Use the same unit for all four.",
      ],
      [
        "Is shoulder width the same as shoulder circumference?",
        "No. Wrap the tape all the way around your shoulders. Do not enter the straight-line distance between shoulder points.",
      ],
      [
        "How does the calculator work?",
        "It compares the relative sizes of four circumferences and chooses the closest of five common menswear styling categories.",
      ],
    ],
  },
} as const;

export function BodyShapeLanding({ audience }: { audience: Audience }) {
  const page = copy[audience];
  const shapeCards = Object.values(page.shapes);

  return (
    <>
      <section className="mx-auto w-full max-w-[1240px] px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-[var(--brand)]">Free style tool</p>
          <h1 className="text-display mt-3">{page.title}</h1>
          <p className="mx-auto mt-4 max-w-[55ch] text-[var(--muted-ink)] sm:text-lg">
            {page.intro}
          </p>
          <nav
            aria-label="Choose calculator"
            className="mt-7 inline-flex rounded-full border bg-[var(--paper-2)] p-1.5"
          >
            <Link
              href="/body-shape-calculator-female"
              aria-current={audience === "female" ? "page" : undefined}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${audience === "female" ? "bg-[var(--brand)] text-[var(--ink-deep)]" : "text-[var(--muted-ink)] hover:text-[var(--ink)]"}`}
            >
              Women
            </Link>
            <Link
              href="/body-shape-calculator-men"
              aria-current={audience === "male" ? "page" : undefined}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${audience === "male" ? "bg-[var(--brand)] text-[var(--ink-deep)]" : "text-[var(--muted-ink)] hover:text-[var(--ink)]"}`}
            >
              Men
            </Link>
          </nav>
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            <li className="badge-brand">Free to use</li>
            <li className="badge-brand">Inches or centimeters</li>
            <li className="badge-brand">No sign-up</li>
            <li className="badge-brand">Measurements stay private</li>
          </ul>
        </div>
        <BodyShapeCalculator audience={audience} />
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-6">
        <p className="eyebrow text-center text-[var(--brand)]">
          Before you begin
        </p>
        <h2 className="text-title mt-3 text-center">How to measure</h2>
        <div
          className={`mt-10 grid gap-5 sm:grid-cols-2 ${audience === "female" ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}
        >
          {page.measurements.map(([title, description], index) => (
            <div
              key={title}
              className="rounded-2xl border bg-[var(--paper-2)] p-6"
            >
              <span className="chip-mono">
                {String(index + 1).padStart(2, "0")}
              </span>
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
          {shapeCards.map((shape) => (
            <div
              key={shape.label}
              className="rounded-2xl border bg-[var(--paper-2)] p-6"
            >
              <h3 className="text-xl font-bold">{shape.label}</h3>
              <p className="mt-2 text-[var(--muted-ink)]">
                {shape.description}
              </p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-[var(--muted-ink)]">
          These are approximate styling categories, not rules about what you can
          wear or a measure of health.
        </p>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6">
        <div className="rounded-[28px] border bg-[var(--paper-2)] p-8 text-center sm:p-12">
          <p className="eyebrow text-[var(--brand)]">Try your next look</p>
          <h2 className="text-title mt-3">See an outfit on your photo</h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[var(--muted-ink)]">
            Pick a style you like and preview it with the AI Clothes Changer.
          </p>
          <Link
            href="/ai-clothes-changer#studio"
            className="pill pill-brand mt-7 inline-flex items-center gap-2 px-6 py-3"
          >
            Try AI Clothes Changer{" "}
            <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <p className="eyebrow text-center text-[var(--brand)]">FAQ</p>
        <h2 className="text-title mt-3 text-center">Questions</h2>
        <div className="mt-8 space-y-3">
          {[
            ...page.faq,
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
