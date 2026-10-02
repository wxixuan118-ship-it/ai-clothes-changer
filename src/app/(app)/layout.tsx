import type { Metadata } from "next";
import Link from "next/link";
import { ZapIcon } from "lucide-react";

import { SidebarNav } from "@/components/app/sidebar-nav";
import { UserMenu } from "@/components/app/user-menu";
import { requireSession } from "@/lib/auth/session";
import { siteConfig } from "@/config/site";
import { Sparkle } from "@/components/atelier/sparkle";

// Account pages and the signed-in app stay out of search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// The layout renders user data, but it is NOT the security boundary — every
// (app) page re-checks the session itself via requireSession() (layouts
// don't re-run on soft navigation; AGENTS.md: never trust middleware alone).
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();

  return (
    <div className="flex min-h-dvh w-full">
      <aside className="hidden w-60 shrink-0 flex-col border-r-2 bg-sidebar md:flex">
        <div className="flex h-14 items-center border-b-2 px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-base font-semibold whitespace-nowrap"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-[var(--brand)]">
              <Sparkle className="size-3.5 text-[var(--ink-deep)]" />
            </span>
            {siteConfig.name}
          </Link>
        </div>
        <div className="p-3">
          <SidebarNav />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b-2 px-6">
          <Link
            href="/"
            aria-label={siteConfig.name}
            className="flex items-center md:hidden"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-[var(--brand)]">
              <Sparkle className="size-3.5 text-[var(--ink-deep)]" />
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <div
              className="flex items-center gap-1.5 rounded-full border px-3 py-1"
              title="Credit balance"
            >
              <ZapIcon
                className="size-3.5 fill-[var(--brand)] text-[var(--brand)]"
                aria-hidden
              />
              <span className="sr-only">Credits</span>
              <span
                className="text-sm font-semibold"
                data-testid="credit-balance"
              >
                {session.user.creditBalance}
              </span>
            </div>
            <UserMenu name={session.user.name} email={session.user.email} />
          </div>
        </header>
        <div className="border-b px-3 py-2 md:hidden">
          <SidebarNav orientation="horizontal" />
        </div>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
