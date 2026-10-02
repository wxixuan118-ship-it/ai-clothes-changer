import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { stylePresets } from "@/config/styles";

import { portraitSrc } from "./portraits";

// Curated looks double as SEO scene pages later (wedding, suits, dating…).
export function AtelierStyles() {
  const featured = stylePresets.filter((preset) => preset.cover).slice(0, 4);

  return (
    <section
      id="styles"
      className="mx-auto w-full max-w-[1240px] scroll-mt-8 px-4 py-12 sm:px-6"
    >
      <div className="atelier-frame px-5 py-14 sm:px-10">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow">Curated styles</p>
          <h2 className="text-title mt-3">A look for every moment</h2>
          <p className="mt-4 text-[var(--muted-ink)]">
            Skip the prompt. Pick a style and the AI dresses your photo in it.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featured.map((preset) => (
            <li key={preset.id}>
              <Link
                href={`/?style=${preset.id}#studio`}
                scroll={false}
                className="group block"
              >
                <div
                  className="arch-soft relative aspect-[3/4]"
                  style={{ background: preset.tint }}
                >
                  {preset.cover ? (
                    <Image
                      src={portraitSrc(preset.cover, 600)}
                      unoptimized
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 280px, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : null}
                </div>
                <div className="mt-4 flex items-center justify-between gap-2 px-1">
                  <div>
                    <p className="font-heading text-lg font-semibold">
                      {preset.name}
                    </p>
                    <p className="text-sm text-[var(--muted-ink)]">
                      {preset.category}
                    </p>
                  </div>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors group-hover:bg-[var(--ink)] group-hover:text-[var(--ink-deep)]">
                    <ArrowUpRightIcon className="size-4" aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
