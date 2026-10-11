"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { FaceAnalyzer } from "@/components/face/face-analyzer";
import { faceShapeHairstyles as recommendations } from "@/config/face-shape-hairstyles";
import { detectFaceShape, type FaceShapeResult } from "@/lib/face/face-shape";


export function HairstyleFaceShapeTool() {
  const [result, setResult] = React.useState<FaceShapeResult | null>(null);
  const picks = result ? recommendations[result.shape] : null;

  return (
    <FaceAnalyzer
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
