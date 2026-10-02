"use client";

import * as React from "react";

import Link from "next/link";

import { Sparkle } from "@/components/atelier/sparkle";

// Route-segment error boundary — renders inside the root layout, so the
// theme and fonts still apply. Errors surface as human sentences with a
// next step; the digest stays in the server logs, not in the UI.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <Sparkle className="size-10" />
      <p className="eyebrow text-[var(--brand)]">Error</p>
      <h1 className="text-title">Something went wrong</h1>
      <p className="max-w-md text-[var(--muted-ink)]">
        The error is logged on our side. If a run failed, its credit is refunded
        automatically.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="pill pill-brand px-6 py-3"
        >
          Try again
        </button>
        <Link href="/" className="pill pill-dark px-6 py-3">
          Back to home
        </Link>
      </div>
    </div>
  );
}
