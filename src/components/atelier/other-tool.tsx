import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { tools, type ToolId } from "@/config/tools";

import { portraitSrc } from "./portraits";

// Cross-promotion content for each tool — what to show when linking TO it.
const promo: Record<ToolId, { pitch: string; image: string; alt: string; eyebrow: string }> = {
  hair: {
    eyebrow: "AI Generator",
    pitch:
      "New haircut, same face. Try bobs, curls, fades, and bold colors on your own photo.",
    image: "1586266195531-76cfa365cb43",
    alt: "Woman with a glossy red bob and blunt bangs",
  },
  clothes: {
    eyebrow: "AI Generator",
    pitch:
      "Complete the look. Try on any outfit from a garment photo, a few words, or a curated style.",
    image: "1515886657613-9f3515b0c78f",
    alt: "Woman in a mustard tracksuit under a blue sky",
  },
  "face-shape": {
    eyebrow: "Free Analyzer",
    pitch:
      "Find your face shape in seconds. Get personalized hairstyle and glasses recommendations that flatter your features.",
    image: "1586266195531-76cfa365cb43",
    alt: "Face shape analysis illustration",
  },
  foundation: {
    eyebrow: "Free Analyzer",
    pitch:
      "Match your perfect foundation shade. Discover your skin tone, undertone, and the best shades from top brands.",
    image: "1515886657613-9f3515b0c78f",
    alt: "Foundation shade matching illustration",
  },
};

// Cross-link to another tool. Used on landing pages to guide visitors
// between our four products.
export function OtherTool({ tool }: { tool: ToolId }) {
  const { eyebrow, pitch, image, alt } = promo[tool];
  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6">
      <Link
        href={tools[tool].landing}
        className="group grid items-center gap-8 overflow-hidden rounded-[28px] border bg-[var(--paper-2)] p-6 sm:grid-cols-[1fr_220px] sm:p-10"
      >
        <div>
          <p className="eyebrow text-[var(--brand)]">{eyebrow}</p>
          <h2 className="text-title mt-3">{tools[tool].name}</h2>
          <p className="mt-4 max-w-[52ch] text-[var(--muted-ink)]">{pitch}</p>
          <span className="pill pill-brand mt-7 py-2.5 pr-2.5 pl-6">
            Try {tools[tool].name.split(" ")[0]}
            <span className="flex size-7 items-center justify-center rounded-full bg-[var(--ink-deep)] text-[var(--ink)]">
              <ArrowRightIcon className="size-4" aria-hidden />
            </span>
          </span>
        </div>
        <div className="arch-soft relative mx-auto aspect-[3/4] w-full max-w-[220px] bg-[var(--pop-sky-bold)]">
          <Image
            src={portraitSrc(image, 500)}
            unoptimized
            alt={alt}
            fill
            sizes="220px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </Link>
    </section>
  );
}
