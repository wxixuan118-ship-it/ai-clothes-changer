"use client";

import * as React from "react";

import Link from "next/link";
import { ArrowRightIcon, GlassesIcon, SparklesIcon, ScissorsIcon } from "lucide-react";

import type { FaceShapeResult } from "@/lib/face/face-shape";

export function FaceShapeResultCard({ result }: { result: FaceShapeResult }) {
  return (
    <div className="mt-8 space-y-6">
      {/* Main result */}
      <div className="rounded-2xl border bg-[var(--paper-2)] p-6 text-center sm:p-8">
        <p className="eyebrow text-[var(--brand)]">Your face shape</p>
        <h3 className="mt-2 text-4xl font-bold sm:text-5xl">{result.shapeLabel}</h3>
        <p className="mx-auto mt-3 max-w-xl text-[var(--muted-ink)]">
          {result.description}
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border bg-[var(--canvas)] px-3 py-1 text-xs text-[var(--muted-ink)]">
          <SparklesIcon className="size-3" />
          {Math.round(result.confidence * 100)}% confidence
        </div>
      </div>

      {/* Measurements */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-[var(--paper-2)] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-ink)]">
            Length / Width
          </p>
          <p className="mt-2 text-2xl font-bold">
            {result.measurements.lengthToWidthRatio.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-[var(--muted-ink)]">
            Face length to cheekbone width ratio
          </p>
        </div>
        <div className="rounded-2xl border bg-[var(--paper-2)] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-ink)]">
            Forehead / Cheek
          </p>
          <p className="mt-2 text-2xl font-bold">
            {(result.measurements.foreheadToCheekRatio * 100).toFixed(0)}%
          </p>
          <p className="mt-1 text-xs text-[var(--muted-ink)]">
            Forehead width relative to cheekbones
          </p>
        </div>
        <div className="rounded-2xl border bg-[var(--paper-2)] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-ink)]">
            Jaw / Cheek
          </p>
          <p className="mt-2 text-2xl font-bold">
            {(result.measurements.jawToCheekRatio * 100).toFixed(0)}%
          </p>
          <p className="mt-1 text-xs text-[var(--muted-ink)]">
            Jaw width relative to cheekbones
          </p>
        </div>
      </div>

      {/* Hairstyle recommendations */}
      <div className="rounded-2xl border bg-[var(--paper-2)] p-6">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand)]/10 text-[var(--brand)]">
            <ScissorsIcon className="size-4" />
          </span>
          <h4 className="text-lg font-bold">Best hairstyles for you</h4>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {result.hairstyles.map((style) => (
            <li
              key={style}
              className="flex items-center gap-2 rounded-full border bg-[var(--canvas)] px-3 py-2 text-sm"
            >
              <span className="size-1.5 rounded-full bg-[var(--brand)]" />
              {style}
            </li>
          ))}
        </ul>
        <Link
          href="/"
          className="pill pill-brand mt-5 inline-flex items-center gap-1.5 py-2.5 pr-2.5 pl-5"
        >
          Try these hairstyles
          <span className="flex size-7 items-center justify-center rounded-full bg-[var(--ink-deep)] text-[var(--ink)]">
            <ArrowRightIcon className="size-4" />
          </span>
        </Link>
      </div>

      {/* Glasses recommendations */}
      <div className="rounded-2xl border bg-[var(--paper-2)] p-6">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--pop-sky)]/30">
            <GlassesIcon className="size-4" />
          </span>
          <h4 className="text-lg font-bold">Flattering glasses frames</h4>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {result.glasses.map((frame) => (
            <li
              key={frame}
              className="flex items-center gap-2 rounded-full border bg-[var(--canvas)] px-3 py-2 text-sm"
            >
              <span className="size-1.5 rounded-full bg-[var(--pop-sky)]" />
              {frame}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
