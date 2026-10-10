"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon, MenuIcon, ScissorsIcon, ShirtIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type NavLink = { href: string; label: string };

const products = [
  { href: "/", label: "AI Hairstyle", icon: ScissorsIcon, desc: "Try new haircuts & colors" },
  { href: "/ai-clothes-changer", label: "AI Clothes Changer", icon: ShirtIcon, desc: "Virtually try on outfits" },
] as const;

export function ProductsDropdown() {
  const pathname = usePathname();
  const isProductPage = products.some((p) => p.href === pathname);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "pill inline-flex items-center gap-1 px-4 py-2 text-sm",
            isProductPage
              ? "pill-light px-5"
              : "text-[var(--muted-ink)] hover:text-[var(--ink)]",
          )}
        >
          Products
          <ChevronDownIcon className="size-3.5" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 rounded-2xl p-2">
        {products.map((product) => {
          const current = product.href === pathname;
          const Icon = product.icon;
          return (
            <DropdownMenuItem key={product.href} asChild className="p-0">
              <Link
                href={product.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                  current
                    ? "bg-[var(--brand)]/10 text-[var(--ink)]"
                    : "hover:bg-[color-mix(in_oklch,var(--ink),transparent_92%)]",
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand)]/10 text-[var(--brand)]">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{product.label}</p>
                  <p className="text-xs text-[var(--muted-ink)]">{product.desc}</p>
                </div>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Only real routes can be "current" — "/#faq" is a section of "/". */
function isCurrent(href: string, pathname: string): boolean {
  return !href.includes("#") && href === pathname;
}

export function NavLinks({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="mx-auto hidden items-center gap-1 lg:flex"
    >
      {links.map((link) => {
        const current = isCurrent(link.href, pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "pill px-4 py-2 text-sm",
              current
                ? "pill-light px-5"
                : "text-[var(--muted-ink)] hover:text-[var(--ink)]",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

// Disclosure menu for < lg. Closes on Escape (focus back to the toggle),
// outside pointerdown, and link click.
export function MobileNav({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const menuId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="lg:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="flex size-9 items-center justify-center rounded-full border"
      >
        {open ? (
          <XIcon className="size-4" aria-hidden />
        ) : (
          <MenuIcon className="size-4" aria-hidden />
        )}
      </button>
      {open ? (
        <nav
          id={menuId}
          aria-label="Main"
          className="absolute inset-x-4 top-full z-50 mt-2 rounded-[24px] border bg-[var(--paper-2)] p-3 sm:inset-x-6"
        >
          <ul className="grid gap-1">
            <li className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-ink)]">
              Products
            </li>
            {products.map((product) => {
              const current = product.href === pathname;
              const Icon = product.icon;
              return (
                <li key={product.href}>
                  <Link
                    href={product.href}
                    aria-current={current ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm",
                      current
                        ? "bg-[var(--ink)] text-[var(--ink-deep)]"
                        : "hover:bg-[color-mix(in_oklch,var(--ink),transparent_92%)]",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    {product.label}
                  </Link>
                </li>
              );
            })}
            <li className="my-1 h-px bg-[color-mix(in_oklch,var(--ink),transparent_90%)]" />
            {links.map((link) => {
              const current = isCurrent(link.href, pathname);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={current ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-full px-4 py-2.5 text-sm",
                      current
                        ? "bg-[var(--ink)] text-[var(--ink-deep)]"
                        : "hover:bg-[color-mix(in_oklch,var(--ink),transparent_92%)]",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
