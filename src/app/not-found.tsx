import type { Metadata } from "next";
import Link from "next/link";

import { Sparkle } from "@/components/atelier/sparkle";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <Sparkle className="size-10" />
      <p className="eyebrow text-[var(--brand)]">404</p>
      <h1 className="text-title">This page doesn&apos;t exist</h1>
      <p className="max-w-md text-[var(--muted-ink)]">
        The link may be old or mistyped. Your account and credits are
        unaffected.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="pill pill-brand px-6 py-3">
          Go to the clothes changer
        </Link>
        <Link href="/pricing" className="pill pill-dark px-6 py-3">
          See pricing
        </Link>
      </div>
    </div>
  );
}
