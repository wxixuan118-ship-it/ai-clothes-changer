import Image from "next/image";
import { ImageUpIcon, ShirtIcon, SparklesIcon } from "lucide-react";

import { portraitSrc } from "./portraits";

const steps = [
  {
    n: "01",
    icon: ImageUpIcon,
    title: "Upload your photo",
    body: "A clear, front-facing photo works best. One person, full or half body.",
    image: "1784708232475-0215c4d67e69",
    alt: "Front-facing portrait of a person in a denim shirt",
  },
  {
    n: "02",
    icon: ShirtIcon,
    title: "Choose the outfit",
    body: "Upload a garment photo, describe the look in words, or pick a curated style.",
    image: "1490481651871-ab68de25d43d",
    alt: "Neutral-toned clothes hanging on a rail",
  },
  {
    n: "03",
    icon: SparklesIcon,
    title: "Get your new look",
    body: "A realistic result in seconds. Download it in high resolution, or run it again.",
    image: null,
    alt: "",
  },
] as const;

export function AtelierHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto w-full max-w-[1240px] scroll-mt-8 px-4 py-24 sm:px-6"
    >
      <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">How it works</p>
          <h2 className="text-title mt-3">Three steps to a new outfit</h2>
        </div>
        <p className="max-w-sm text-[var(--muted-ink)]">
          No editing skills, no photoshoot. The AI redraws only the clothes.
        </p>
      </div>
      <ol className="grid gap-5 md:grid-cols-3">
        {steps.map((step) => (
          <li
            key={step.n}
            className="flex flex-col overflow-hidden rounded-[28px] border bg-[var(--paper-2)]"
          >
            <div className="relative aspect-[4/3] bg-[color-mix(in_oklch,var(--canvas),var(--pop-mint-bold)_35%)]">
              {step.image ? (
                <Image
                  src={portraitSrc(step.image, 800)}
                  unoptimized
                  alt={step.alt}
                  fill
                  sizes="(min-width: 768px) 380px, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center gap-4">
                  {["var(--pop-sky-bold)", "var(--pop-pink-bold)"].map(
                    (tint) => (
                      <div
                        key={tint}
                        className="arch-soft h-[78%] w-[30%]"
                        style={{ background: tint }}
                      />
                    ),
                  )}
                  <SparklesIcon
                    className="absolute size-10 text-[var(--brand)]"
                    aria-hidden
                  />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full border">
                  <step.icon className="size-4" aria-hidden />
                </span>
                <span className="text-sm text-[var(--muted-ink)]">
                  Step {step.n}
                </span>
              </div>
              <h3 className="text-2xl">{step.title}</h3>
              <p className="text-[var(--muted-ink)]">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
