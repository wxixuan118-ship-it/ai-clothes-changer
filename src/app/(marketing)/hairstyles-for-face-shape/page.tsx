import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { HairstyleFaceShapeTool } from "@/components/face/hairstyle-face-shape-tool";
import { OtherTool } from "@/components/atelier/other-tool";

export const metadata: Metadata = {
  title: "Best Hairstyles for Your Face Shape",
  description: "Find hairstyles for your face shape from a selfie. Get free, private recommendations for oval, round, square, heart, diamond, oblong, and triangle faces.",
  alternates: { canonical: "/hairstyles-for-face-shape" },
  openGraph: { title: "Best Hairstyles for Your Face Shape", description: "Find haircuts that suit your face shape from a selfie.", url: "/hairstyles-for-face-shape" },
};

export default function HairstylesForFaceShapePage() {
  return (
    <>
      <section className="mx-auto w-full max-w-[1240px] px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-[var(--brand)]">Free hairstyle finder</p>
          <h1 className="text-display mt-3">Hairstyles for your face shape</h1>
          <p className="mx-auto mt-4 max-w-[55ch] text-[var(--muted-ink)] sm:text-lg">Find your face shape from a selfie, browse matching cuts, and try a favorite on your photo.</p>
        </div>
        <HairstyleFaceShapeTool />
      </section>
      <section className="mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-6">
        <p className="eyebrow text-center text-[var(--brand)]">How it works</p>
        <h2 className="text-title mt-3 text-center">Find a look in three steps</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            ["01", "Upload a selfie", "Use a clear, front-facing photo with your hair away from your face."],
            ["02", "See your face shape", "Your browser measures facial landmarks and selects the closest shape."],
            ["03", "Explore hairstyles", "Browse recommended cuts and open one in the hairstyle changer."],
          ].map(([step, title, body]) => <div key={step} className="rounded-2xl border bg-[var(--paper-2)] p-6"><span className="chip-mono">{step}</span><h3 className="mt-3 text-xl font-bold">{title}</h3><p className="mt-2 text-[var(--muted-ink)]">{body}</p></div>)}
        </div>
      </section>
      <OtherTool tool="face-shape" />
      <section className="mx-auto w-full max-w-[1240px] px-4 pb-16 sm:px-6">
        <div className="rounded-[28px] border bg-[var(--paper-2)] p-8 text-center sm:p-12">
          <p className="eyebrow text-[var(--brand)]">Ready to see your new look?</p>
          <h2 className="text-title mx-auto mt-3 max-w-2xl">Try a hairstyle on your photo</h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[var(--muted-ink)]">Choose a cut you love and preview it with the AI Hairstyle Changer.</p>
          <Link href="/#studio" className="pill pill-brand mt-7 inline-flex items-center gap-2 py-2.5 pl-6 pr-3">
            Try AI Hairstyle Changer
            <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
