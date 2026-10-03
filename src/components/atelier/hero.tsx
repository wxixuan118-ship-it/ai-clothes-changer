import Image from "next/image";

import { GENERATION_COST_CREDITS, WELCOME_CREDITS } from "@/config/plans";
import { getSession } from "@/lib/auth/session";
import { env, features } from "@/lib/env";
import { GenerateForm } from "@/components/generate/generate-form";
import { tools, type ToolId } from "@/config/tools";

import { hairPortraits, portraits, portraitSrc } from "./portraits";
import { Crown, Sparkle } from "./sparkle";

// Arch heights step like the reference composition: low, high, mid, low...
const archOffsets = [
  "mt-16",
  "mt-0",
  "mt-10",
  "mt-24",
  "mt-10",
  "mt-0",
] as const;

const heroCopy: Record<ToolId, { sub: string; badges: string[] }> = {
  hair: {
    sub: "Upload a selfie and try any haircut or color in seconds — from a hairstyle photo, a few words, or a curated style.",
    badges: [
      `${WELCOME_CREDITS} free credits`,
      "No credit card",
      "Face stays yours",
    ],
  },
  clothes: {
    sub: "Upload your photo and try on any outfit in seconds — from a garment photo, a few words, or a curated style.",
    badges: [
      `${WELCOME_CREDITS} free credits`,
      "No credit card",
      "Face & pose preserved",
    ],
  },
};

// The tool IS the hero: visitors upload and pick a look right here; signing
// up happens in a dialog only when they press the action button.
export async function AtelierHero({ tool }: { tool: ToolId }) {
  const session = await getSession();
  const copy = heroCopy[tool];
  const arches = tool === "hair" ? hairPortraits : portraits;

  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
      <div className="atelier-frame relative overflow-hidden px-3 pt-8 sm:px-10 sm:pt-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Sparkle className="mb-3 size-7" />
          <h1 className="text-display">{tools[tool].name}</h1>
          <p className="mt-4 max-w-[52ch] text-base text-[var(--muted-ink)] sm:text-lg">
            {copy.sub}
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {copy.badges.map((badge) => (
              <li key={badge} className="badge-brand">
                {badge}
              </li>
            ))}
          </ul>
        </div>

        <div
          id="studio"
          className="mx-auto mt-8 max-w-6xl scroll-mt-6 rounded-[28px] border bg-[color-mix(in_oklch,var(--canvas),var(--ink)_3%)] p-3 text-left sm:p-6"
        >
          <GenerateForm
            balance={session?.user.creditBalance ?? 0}
            cost={GENERATION_COST_CREDITS}
            mock={env.AI_MOCK}
            signedIn={Boolean(session)}
            showHistoryLink
            tool={tool}
            auth={{
              google: features.googleOAuth,
              github: features.githubOAuth,
              requiresVerification: features.email,
              magicLink: features.email,
              welcomeCredits: WELCOME_CREDITS,
            }}
          />
        </div>

        <div className="mt-16 grid grid-cols-3 items-start gap-3 sm:mt-20 sm:grid-cols-6 sm:gap-5">
          {arches.map((portrait, i) => (
            <div
              key={portrait.id}
              className={`arch-rise relative ${archOffsets[i]} ${i >= 3 ? "hidden sm:block" : ""}`}
              style={{ animationDelay: `${120 + i * 90}ms` }}
            >
              {i === 5 ? (
                <Crown className="absolute -top-10 left-1/2 z-10 w-20 -translate-x-1/2" />
              ) : null}
              <div
                className="arch relative aspect-[3/5]"
                style={{ background: portrait.tint }}
              >
                <Image
                  src={portraitSrc(portrait.id)}
                  unoptimized
                  alt={portrait.alt}
                  fill
                  priority={i < 3}
                  sizes="(min-width: 640px) 190px, 33vw"
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
