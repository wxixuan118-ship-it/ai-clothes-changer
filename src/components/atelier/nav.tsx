import Link from "next/link";

import { getSession } from "@/lib/auth/session";
import { siteConfig } from "@/config/site";
import { MobileNav, NavLinks } from "./nav-links";
import { Sparkle } from "./sparkle";

const links = [
  { href: "/", label: "Hairstyle changer" },
  { href: "/ai-clothes-changer", label: "Clothes changer" },
  { href: "/#styles", label: "Hairstyles" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
] as const;

// Auth-aware: visitors get Log In + Sign Up, signed-in users get one
// "Open studio" button.
export async function AtelierNav() {
  const session = await getSession();

  return (
    <header className="relative z-40 mx-auto w-full max-w-[1240px] px-4 pt-4 sm:px-6">
      <div className="flex h-16 items-center gap-6 px-2 sm:px-4">
        <Link
          href="/"
          aria-label={siteConfig.name}
          className="flex items-center gap-2.5 font-heading text-lg font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-[var(--brand)] text-[var(--ink-deep)]">
            <Sparkle className="size-4 text-[var(--ink-deep)]" />
          </span>
          <span className="hidden whitespace-nowrap sm:inline">
            {siteConfig.name}
          </span>
        </Link>
        <NavLinks links={links} />
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {session ? (
            <Link
              href="/generate"
              className="pill pill-brand px-5 py-2 text-sm"
            >
              Open studio
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="pill pill-dark hidden px-5 py-2 text-sm sm:inline-flex"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="pill pill-brand px-5 py-2 text-sm"
              >
                Sign Up
              </Link>
            </>
          )}
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}
