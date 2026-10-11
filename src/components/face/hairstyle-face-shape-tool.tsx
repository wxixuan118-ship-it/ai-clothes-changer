"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { FaceAnalyzer } from "@/components/face/face-analyzer";
import { detectFaceShape, type FaceShape, type FaceShapeResult } from "@/lib/face/face-shape";

const recommendations: Record<FaceShape, { note: string; styles: { id: string; name: string }[] }> = {
  oval: { note: "Balanced proportions work with many lengths and textures.", styles: [{ id: "long-bob", name: "Long bob" }, { id: "beach-waves", name: "Beach waves" }, { id: "pixie-cut", name: "Pixie cut" }] },
  round: { note: "Height and face-framing layers can add definition.", styles: [{ id: "long-layers", name: "Long layers" }, { id: "asymmetric-bob", name: "Asymmetric bob" }, { id: "high-ponytail", name: "High ponytail" }] },
  square: { note: "Soft movement can complement an angular jawline.", styles: [{ id: "beach-waves", name: "Beach waves" }, { id: "side-swept-bangs", name: "Side-swept bangs" }, { id: "shag", name: "Shag" }] },
  heart: { note: "Volume near the jaw can balance a wider forehead.", styles: [{ id: "french-bob", name: "French bob" }, { id: "curtain-bangs", name: "Curtain bangs" }, { id: "long-layers", name: "Long layers" }] },
  diamond: { note: "Fringe and fullness near the jaw frame your cheekbones.", styles: [{ id: "side-swept-bangs", name: "Side-swept bangs" }, { id: "long-bob", name: "Long bob" }, { id: "loose-curls", name: "Loose curls" }] },
  oblong: { note: "Fringe and side volume can add visual width.", styles: [{ id: "blunt-bangs", name: "Blunt bangs" }, { id: "french-bob", name: "French bob" }, { id: "loose-curls", name: "Loose curls" }] },
  triangle: { note: "Volume near the temples can balance a wider jaw.", styles: [{ id: "curtain-bangs", name: "Curtain bangs" }, { id: "pixie-cut", name: "Pixie cut" }, { id: "long-layers", name: "Long layers" }] },
};

export function HairstyleFaceShapeTool() {
  const [result, setResult] = React.useState<FaceShapeResult | null>(null);
  const picks = result ? recommendations[result.shape] : null;

  return (
    <FaceAnalyzer
      title="Find your best hairstyles"
      description="Upload a front-facing selfie to find your face shape and explore haircuts picked for your proportions."
      badges={["Free to use", "Runs in your browser", "Photo stays private"]}
      onAnalyze={(landmarks) => setResult(detectFaceShape(landmarks))}
    >
      {result && picks ? (
        <div className="mt-8 space-y-6" aria-live="polite">
          <div className="rounded-2xl border bg-[var(--paper-2)] p-6 sm:p-8">
            <p className="eyebrow text-[var(--brand)]">Your result</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Hairstyles for a {result.shapeLabel.toLowerCase()} face</h2>
            <p className="mt-3 text-[var(--muted-ink)]">{picks.note}</p>
            <p className="mt-2 text-sm text-[var(--muted-ink)]">Face shape is a guide. Hair texture and your preferences matter too.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {picks.styles.map((style) => (
              <Link key={style.id} href={`/generate?tool=hair&style=${style.id}`} className="group overflow-hidden rounded-2xl border bg-[var(--paper-2)] transition-colors hover:border-[var(--brand)]">
                <div className="relative aspect-[4/3]"><Image src={`/hairstyles/${style.id}.jpg`} alt={`${style.name} hairstyle preview`} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" /></div>
                <div className="flex items-center justify-between gap-2 p-4"><span className="font-semibold">{style.name}</span><ArrowRightIcon className="size-4 text-[var(--brand)]" aria-hidden /></div>
              </Link>
            ))}
          </div>
          <div className="rounded-2xl border bg-[var(--paper-2)] p-6">
            <h3 className="text-lg font-bold">More ideas for your face shape</h3>
            <ul className="mt-4 flex flex-wrap gap-2">{result.hairstyles.map((style) => <li key={style} className="rounded-full border px-3 py-2 text-sm">{style}</li>)}</ul>
          </div>
        </div>
      ) : null}
    </FaceAnalyzer>
  );
}
