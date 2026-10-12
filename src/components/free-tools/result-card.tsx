import Link from "next/link";
import { AlertTriangleIcon, ArrowRightIcon, SparklesIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/lib/face/analysis-result";

function Bar({ value }: { value: number }) {
  return (
    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
      <span
        className="block h-full rounded-full bg-[var(--brand)]"
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </span>
  );
}

/** Renders any free tool's result. `compact` drops the hero styling. */
export function ResultCard({
  result,
  compact = false,
}: {
  result: AnalysisResult;
  compact?: boolean;
}) {
  return (
    <div className={cn("space-y-5", compact ? "" : "mt-8")}>
      {result.warnings?.length ? (
        <div className="flex gap-3 rounded-2xl border border-[var(--pop-orange-bold)]/40 bg-[var(--pop-orange)] p-4 text-sm">
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>{result.warnings.join(" ")}</div>
        </div>
      ) : null}

      <div
        className={cn(
          "rounded-2xl border bg-[var(--paper-2)] text-center",
          compact ? "p-5" : "p-6 sm:p-8",
        )}
      >
        <p className="eyebrow text-[var(--brand)]">{result.eyebrow}</p>
        <p
          className={cn(
            "mt-2 font-bold tracking-tight",
            compact ? "text-2xl" : "text-4xl sm:text-5xl",
          )}
        >
          {result.title}
        </p>
        <p className="mx-auto mt-3 max-w-xl text-[var(--muted-ink)]">
          {result.summary}
        </p>
        {result.score ? (
          <div className="mx-auto mt-5 max-w-xs text-left">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted-ink)]">
              <span>{result.score.label}</span>
              <span>
                {result.score.value}
                {result.score.max === 100 ? "%" : ` / ${result.score.max}`}
              </span>
            </div>
            <Bar value={(result.score.value / result.score.max) * 100} />
          </div>
        ) : null}
        {result.tags?.length ? (
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {result.tags.map((tag) => (
              <li
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border bg-[var(--canvas)] px-3 py-1 text-xs text-[var(--muted-ink)]"
              >
                <SparklesIcon className="size-3" aria-hidden />
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {result.metrics.length ? (
        <div
          className={cn(
            "grid gap-3",
            result.metrics.length % 3 === 0
              ? "sm:grid-cols-3"
              : "sm:grid-cols-2",
          )}
        >
          {result.metrics.map((m) => (
            <div key={m.label} className="rounded-2xl border bg-[var(--paper-2)] p-4">
              <p className="text-xs font-semibold tracking-wider text-[var(--muted-ink)] uppercase">
                {m.label}
              </p>
              <p className="mt-1.5 text-xl font-bold capitalize">{m.value}</p>
              {m.score !== undefined ? <Bar value={m.score} /> : null}
              {m.hint ? (
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted-ink)]">
                  {m.hint}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {result.swatches?.map((group) => (
        <div key={group.title} className="rounded-2xl border bg-[var(--paper-2)] p-5">
          <p className="font-bold">{group.title}</p>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {group.items.map((s) => (
              <li key={`${s.name}-${s.hex}`} className="flex items-center gap-3">
                <span
                  className="size-11 shrink-0 rounded-xl border"
                  style={{ background: s.hex }}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {s.name}
                  </span>
                  <span className="block text-xs text-[var(--muted-ink)]">
                    {s.note ?? s.hex}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {result.sections.map((section) => (
        <div key={section.title} className="rounded-2xl border bg-[var(--paper-2)] p-5">
          <p className="font-bold">{section.title}</p>
          <ul className="mt-3 space-y-2">
            {section.items.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {!compact && result.links?.length ? (
        <div className="flex flex-wrap gap-3">
          {result.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="pill pill-outline gap-1.5 px-4 py-2 text-sm"
            >
              {link.label}
              <ArrowRightIcon className="size-4" aria-hidden />
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
