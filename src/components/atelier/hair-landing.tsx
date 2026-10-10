import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  CameraIcon,
  CheckIcon,
  ScissorsIcon,
  SparklesIcon,
} from "lucide-react";

import { GenerateForm } from "@/components/generate/generate-form";
import { hairPresets } from "@/config/hairstyles";
import { GENERATION_COST_CREDITS, WELCOME_CREDITS } from "@/config/plans";
import { getSession } from "@/lib/auth/session";
import { env, features } from "@/lib/env";

import { BeforeAfter } from "./before-after";

const looks = [
  {
    name: "French bob",
    id: "bob" as const,
    body: "A sharper silhouette and soft fringe, with the same face and framing.",
  },
  {
    name: "Textured pixie",
    id: "pixie" as const,
    body: "See a dramatic short cut before making a salon appointment.",
  },
  {
    name: "Defined curls",
    id: "curls" as const,
    body: "Compare shape and volume on a familiar face.",
  },
];

const featured = [
  "pixie-cut",
  "copper-bob",
  "curtain-bangs",
  "wolf-cut",
  "long-curls",
  "box-braids",
  "afro",
  "silver-quiff",
].map((id) => hairPresets.find((preset) => preset.id === id)!);

export async function HairLanding() {
  const session = await getSession();

  return (
    <>
      <section className="mx-auto max-w-[1240px] px-4 pb-12 pt-7 sm:px-6 sm:pt-12">
        <div className="mx-auto max-w-3xl text-center">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--brand-line)] bg-[var(--brand-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.19em] text-[var(--brand)]">
              <SparklesIcon className="size-4" aria-hidden />
              Preview your next look
            </p>
            <h1 className="font-heading text-[clamp(3.4rem,6vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.065em]">
              AI Hairstyle <span className="text-[var(--brand)]">Changer.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-[56ch] text-lg leading-relaxed text-[var(--muted-ink)] sm:text-xl">
              Try on a new AI hairstyle before you commit. Upload a photo,
              choose a style, and compare the change.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="#studio"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--brand)] px-7 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]"
              >
                Try a hairstyle <ArrowRightIcon className="size-4" aria-hidden />
              </Link>
              <Link
                href="#before-after"
                className="inline-flex min-h-12 items-center gap-2 rounded-full border px-6 text-sm font-semibold transition-colors hover:border-[var(--brand)]"
              >
                See examples <ArrowDownIcon className="size-4" aria-hidden />
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[var(--muted-ink)]">
              <li className="flex items-center gap-2"><CheckIcon className="size-4 text-[var(--brand)]" aria-hidden />{WELCOME_CREDITS} free signup credits</li>
              <li className="flex items-center gap-2"><CheckIcon className="size-4 text-[var(--brand)]" aria-hidden />No credit card to start</li>
              <li className="flex items-center gap-2"><CheckIcon className="size-4 text-[var(--brand)]" aria-hidden />Your face stays yours</li>
            </ul>
        </div>

          <figure className="relative mx-auto mt-10 w-full max-w-[1050px]">
            <div className="rounded-[24px] border border-[#dce1e8] bg-[#f7f8fa] p-2 shadow-[0_12px_30px_rgba(0,0,0,0.3)] sm:p-3">
              <BeforeAfter name="bob" priority />
            </div>
            <figcaption className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--muted-ink)]">
              <span>The same person, before and after trying a French bob.</span>
              <span className="whitespace-nowrap">Illustrative AI example</span>
            </figcaption>
          </figure>
      </section>

      <section id="studio" className="mx-auto max-w-[1240px] scroll-mt-8 px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Your turn</p>
            <h2 className="text-title mt-3">Try it on your photo</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--muted-ink)]">
            Pick from 65 hairstyles, upload a reference, or describe your idea.
          </p>
        </div>
        <div className="rounded-[28px] border bg-[var(--paper-2)] p-3 sm:p-6">
          <GenerateForm
            balance={session?.user.creditBalance ?? 0}
            cost={GENERATION_COST_CREDITS}
            mock={env.AI_MOCK}
            signedIn={Boolean(session)}
            showHistoryLink
            tool="hair"
            auth={{
              providers: features.socialProviders,
              requiresVerification: features.email,
              magicLink: features.email,
              welcomeCredits: WELCOME_CREDITS,
            }}
          />
        </div>
      </section>

      <section id="before-after" className="scroll-mt-8 border-y bg-[var(--paper-2)] py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="mb-10 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="eyebrow">Before / After</p>
              <h2 className="text-title mt-3">See the hair change</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[var(--muted-ink)]">
              Each comparison keeps the person and camera framing consistent, so the hairstyle is the focus.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {looks.map((look) => (
              <article key={look.id} className="overflow-hidden rounded-[24px] border bg-[var(--canvas)] p-2">
                <BeforeAfter name={look.id} />
                <div className="px-3 pb-4 pt-5">
                  <h3 className="font-heading text-2xl font-semibold">{look.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted-ink)]">{look.body}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-5 text-xs text-[var(--muted-ink)]">Illustrative AI examples. Your result depends on your photo, chosen style, and model output.</p>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1240px] scroll-mt-8 px-4 py-20 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="text-title mt-3">Three steps to a new look</h2>
          <p className="mt-4 text-[var(--muted-ink)]">Use a front-facing photo with visible hair for the clearest comparison.</p>
        </div>
        <ol className="grid gap-5 md:grid-cols-3">
          {[
            { n: "01", icon: CameraIcon, title: "Upload your photo", body: "Choose a clear photo of one adult, facing the camera in good light.", image: "/hairstyle-transformations/bob-before.webp", alt: "Portrait with shoulder-length hair before a hairstyle change" },
            { n: "02", icon: ScissorsIcon, title: "Choose a hairstyle", body: "Pick a preset, add a hairstyle photo, or describe the cut and color.", image: "/hairstyles/pixie-cut.jpg", alt: "Portrait showing a short pixie haircut preset" },
            { n: "03", icon: SparklesIcon, title: "Compare your result", body: "View the new style, save your result, or try another look.", image: "/hairstyle-transformations/bob-after.webp", alt: "Portrait after a French bob hairstyle change" },
          ].map((step) => (
            <li key={step.n} className="overflow-hidden rounded-[24px] border bg-[var(--paper-2)]">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={step.image} alt={step.alt} fill unoptimized sizes="(min-width: 768px) 400px, 100vw" className="object-cover object-[center_28%]" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]"><step.icon className="size-4" aria-hidden /> Step {step.n}</div>
                <h3 className="mt-4 font-heading text-2xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-ink)]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="styles" className="mx-auto max-w-[1240px] scroll-mt-8 px-4 pb-24 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Hairstyle library</p>
            <h2 className="text-title mt-3">Find your next cut</h2>
          </div>
          <Link href="#studio" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] hover:underline">Explore all 65 styles <ArrowRightIcon className="size-4" aria-hidden /></Link>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {featured.map((preset) => (
            <li key={preset.id}>
              <Link href={`/?style=${preset.id}#studio`} scroll={false} className="group block overflow-hidden rounded-[18px] border bg-[var(--paper-2)] transition-colors hover:border-[var(--brand)]">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image src={`/hairstyles/${preset.id}.jpg`} alt={`${preset.name} hairstyle preview`} fill unoptimized sizes="(min-width: 1024px) 150px, (min-width: 640px) 25vw, 50vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="px-3 py-3"><p className="truncate text-sm font-semibold">{preset.name}</p><p className="mt-1 truncate text-xs text-[var(--muted-ink)]">{preset.category}</p></div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y bg-[var(--paper-2)] py-20">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px] border">
              <Image src="/hairstyle-transformations/pixie-before.webp" alt="Before a short hairstyle change" fill unoptimized sizes="(min-width: 1024px) 280px, 45vw" className="object-cover" />
              <span className="absolute bottom-3 left-3 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white">Before</span>
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px] border">
              <Image src="/hairstyle-transformations/pixie-after.webp" alt="Same person after trying a textured pixie cut" fill unoptimized sizes="(min-width: 1024px) 280px, 45vw" className="object-cover" />
              <span className="absolute bottom-3 left-3 rounded-full bg-[var(--brand)] px-3 py-1 text-xs font-semibold text-black">After</span>
            </div>
          </div>
          <div>
            <p className="eyebrow">Made for real decisions</p>
            <h2 className="text-title mt-3">Change your hair.<br />Keep your likeness.</h2>
            <p className="mt-6 max-w-[52ch] leading-relaxed text-[var(--muted-ink)]">
              Try a bold cut or a subtle color shift while the rest of your photo stays familiar. A preview can help you discuss a look with your stylist or simply explore what suits you.
            </p>
            <ul className="mt-7 space-y-4 text-sm">
              <li className="flex gap-3"><CheckIcon className="mt-0.5 size-4 shrink-0 text-[var(--brand)]" aria-hidden /><span>Use a hairstyle photo when you have a specific reference.</span></li>
              <li className="flex gap-3"><CheckIcon className="mt-0.5 size-4 shrink-0 text-[var(--brand)]" aria-hidden /><span>Browse cuts, curls, braids, fades, bangs, and colors.</span></li>
              <li className="flex gap-3"><CheckIcon className="mt-0.5 size-4 shrink-0 text-[var(--brand)]" aria-hidden /><span>Keep each result in your private history and delete it anytime.</span></li>
            </ul>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
              <Link href="#studio" className="inline-flex items-center gap-2 text-[var(--brand)] hover:underline">Try a hairstyle <ArrowRightIcon className="size-4" aria-hidden /></Link>
              <Link href="/ai-clothes-changer" className="inline-flex items-center gap-2 hover:underline">Explore the AI Clothes Changer <ArrowRightIcon className="size-4" aria-hidden /></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
