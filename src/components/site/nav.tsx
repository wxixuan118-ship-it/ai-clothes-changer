import Link from "next/link";

import { getSession } from "@/lib/auth/session";
import { siteConfig } from "@/config/site";
import { Sparkle } from "@/components/atelier/sparkle";

import { FreeToolsMenu, MobileNav, NavLinks, ProductsMenu } from "./nav-menus";

const links = [
  { href: "/style-guides", label: "Guides" },
  { href: "/pricing", label: "Pricing" },
] as const;

// Auth-aware: visitors get Log in + Sign up, signed-in users get one
// "Open studio" button.
export async function SiteNav() {
  const session = await getSession();

  return (
    <header className="relative z-40 border-b border-[var(--border)] bg-[var(--canvas)]">
      <div className="mx-auto flex h-[72px] w-full max-w-[1280px] items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl font-extrabold tracking-[-0.02em]"
        >
          <span className="tile size-9 rounded-[10px] bg-[var(--brand)]">
            <Sparkle className="size-[18px] text-[var(--ink-deep)]" />
          </span>
          {siteConfig.name.replace(" AI", "")}
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          <ProductsMenu />
          <FreeToolsMenu />
          <NavLinks links={links} />
        </nav>
        <div className="ml-auto flex items-center gap-2.5">
          {session ? (
            <Link href="/generate" className="pill pill-brand px-5 text-[15px]">
              Open studio
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="pill pill-outline hidden px-[18px] text-[15px] sm:inline-flex"
              >
                Log in
              </Link>
              <Link href="/signup" className="pill pill-brand px-5 text-[15px]">
                Sign up free
              </Link>
            </>
          )}
          <MobileNav links={links} signedIn={Boolean(session)} />
        </div>
      </div>
    </header>
  );
}
