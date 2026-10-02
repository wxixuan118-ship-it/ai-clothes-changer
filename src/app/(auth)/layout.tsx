import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Sparkle } from "@/components/atelier/sparkle";
import { portraitSrc } from "@/components/atelier/portraits";
import { siteConfig } from "@/config/site";

// Account pages and the signed-in app stay out of search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-heading text-lg font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-[var(--brand)]">
            <Sparkle className="size-4 text-[var(--ink-deep)]" />
          </span>
          {siteConfig.name}
        </Link>
        <main className="flex flex-1 items-center justify-center py-16">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
      <div className="relative hidden p-4 lg:block">
        <div className="atelier-frame relative flex h-full items-end justify-center overflow-hidden bg-[var(--paper-2)] px-16 pt-16">
          <Sparkle className="absolute top-10 left-10 size-8" />
          <div className="arch relative aspect-[3/5] w-full max-w-sm bg-[var(--pop-sky-bold)]">
            <Image
              src={portraitSrc("1529139574466-a303027c1d8b", 800)}
              unoptimized
              alt="Woman in a red graphic T-shirt and black jacket against a teal wall"
              fill
              sizes="400px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
