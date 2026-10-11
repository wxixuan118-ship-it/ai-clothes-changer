"use client";

import * as React from "react";

import Link from "next/link";
import { ArrowRightIcon, SparklesIcon, DropletIcon, PaletteIcon } from "lucide-react";

import type { FoundationShadeResult } from "@/lib/face/foundation-shade";

export function FoundationResultCard({ result }: { result: FoundationShadeResult }) {
  return (
    <div className="mt-8 space-y-6">
      {/* Main result */}
      <div className="rounded-2xl border bg-[var(--paper-2)] p-6 text-center sm:p-8">
        <p className="eyebrow text-[var(--brand)]">Your match</p>
        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <div
            className="size-24 rounded-full border-4 border-white shadow-lg"
            style={{ backgroundColor: result.skinColor.hex }}
            aria-label="Your skin color"
          />
          <div className="text-left">
            <h3 className="text-3xl font-bold">
              {result.skinToneLabel} · {result.undertoneLabel}
            </h3>
            <p className="mt-2 max-w-md text-[var(--muted-ink)]">
              {result.description}
            </p>
          </div>
        </div>
        <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border bg-[var(--canvas)] px-3 py-1 text-xs text-[var(--muted-ink)]">
          <SparklesIcon className="size-3" />
          ITA: {result.ita.toFixed(1)}° · L*: {result.skinColor.l.toFixed(1)}
        </div>
      </div>

      {/* Skin details */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-[var(--paper-2)] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-ink)]">
            Skin Tone
          </p>
          <p className="mt-2 text-2xl font-bold">{result.skinToneLabel}</p>
          <p className="mt-1 text-xs text-[var(--muted-ink)]">
            Based on Fitzpatrick-inspired scale
          </p>
        </div>
        <div className="rounded-2xl border bg-[var(--paper-2)] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-ink)]">
            Undertone
          </p>
          <p className="mt-2 text-2xl font-bold">{result.undertoneLabel}</p>
          <p className="mt-1 text-xs text-[var(--muted-ink)]">
            Warm, cool, neutral, or olive
          </p>
        </div>
        <div className="rounded-2xl border bg-[var(--paper-2)] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-ink)]">
            Hex Color
          </p>
          <p className="mt-2 font-mono text-2xl font-bold uppercase">
            {result.skinColor.hex}
          </p>
          <p className="mt-1 text-xs text-[var(--muted-ink)]">
            Average skin color sample
          </p>
        </div>
      </div>

      {/* Foundation recommendations */}
      <div className="rounded-2xl border bg-[var(--paper-2)] p-6">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand)]/10 text-[var(--brand)]">
            <DropletIcon className="size-4" />
          </span>
          <h4 className="text-lg font-bold">Your foundation matches</h4>
        </div>
        <p className="mt-2 text-sm text-[var(--muted-ink)]">
          Best matches from popular brands, sorted by color closeness.
        </p>
        <ul className="mt-5 space-y-3">
          {result.recommendations.map((shade, i) => (
            <li
              key={`${shade.brand}-${shade.shade}`}
              className="flex items-center gap-4 rounded-xl border bg-[var(--canvas)] p-4"
            >
              <div
                className="size-12 shrink-0 rounded-full border-2 border-white shadow-md"
                style={{ backgroundColor: shade.hex }}
                aria-label={`${shade.brand} ${shade.shade} swatch`}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {shade.brand} · {shade.shade}
                </p>
                <p className="text-sm text-[var(--muted-ink)]">{shade.product}</p>
              </div>
              <div className="text-right">
                <span className="chip-mono">ΔE {shade.deltaE.toFixed(1)}</span>
                {i === 0 && (
                  <p className="mt-1 text-xs text-[var(--brand)]">Best match</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Undertone guide */}
      <div className="rounded-2xl border bg-[var(--paper-2)] p-6">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--pop-pink)]/30">
            <PaletteIcon className="size-4" />
          </span>
          <h4 className="text-lg font-bold">About your undertone</h4>
        </div>
        <p className="mt-3 text-[var(--muted-ink)]">
          {result.undertone === "warm" &&
            "Warm undertones have golden, yellow, or peachy hues. Look for foundations labeled 'warm', 'golden', or with a 'W' in the shade code."}
          {result.undertone === "cool" &&
            "Cool undertones have pink, red, or bluish hues. Look for foundations labeled 'cool', 'rosy', or with a 'C' in the shade code."}
          {result.undertone === "neutral" &&
            "Neutral undertones have a balanced mix of warm and cool. Most shades labeled 'neutral' or with an 'N' should work well for you."}
          {result.undertone === "olive" &&
            "Olive undertones have subtle green or golden hints. Look for foundations with olive or golden undertones — avoid overly pink shades which can look chalky."}
        </p>
      </div>

      {/* Cross-sell */}
      <div className="rounded-2xl border border-[var(--brand)]/30 bg-[var(--brand)]/5 p-6 text-center">
        <p className="font-semibold">Loved your foundation match?</p>
        <p className="mt-1 text-sm text-[var(--muted-ink)]">
          Try on new hairstyles or outfits with our AI generators.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="pill pill-brand inline-flex items-center gap-1.5 py-2.5 pr-2.5 pl-5"
          >
            Try AI Hairstyles
            <span className="flex size-7 items-center justify-center rounded-full bg-[var(--ink-deep)] text-[var(--ink)]">
              <ArrowRightIcon className="size-4" />
            </span>
          </Link>
          <Link
            href="/ai-clothes-changer"
            className="pill inline-flex items-center gap-1.5 py-2.5 pr-2.5 pl-5"
          >
            Try AI Clothes
            <span className="flex size-7 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--ink),transparent_85%)]">
              <ArrowRightIcon className="size-4" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
