import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { siteConfig } from "@/config/site";

import { Sparkle } from "./sparkle";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/#studio", label: "Clothes changer" },
      { href: "/#styles", label: "Styles" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
] as const;

export function AtelierFooter() {
  return (
    <footer className="mx-auto w-full max-w-[1240px] px-4 pb-8 sm:px-6">
      <div className="atelier-frame relative overflow-hidden px-6 py-16 text-center sm:px-10">
        <Sparkle className="mx-auto mb-6 size-8" />
        <h2 className="text-title mx-auto max-w-2xl">
          Your next outfit is one photo away
        </h2>
        <Link
          href="/#studio"
          className="pill pill-brand mt-9 py-2.5 pr-2.5 pl-7 text-base"
        >
          Try it free
          <span className="flex size-8 items-center justify-center rounded-full bg-[var(--ink-deep)] text-[var(--ink)]">
            <ArrowRightIcon className="size-4" aria-hidden />
          </span>
        </Link>
      </div>
      <div className="mt-12 flex flex-col gap-10 px-2 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <p className="font-heading text-lg font-semibold">
            {siteConfig.name}
          </p>
          <p className="mt-2 text-sm text-[var(--muted-ink)]">
            Change clothes in any photo with AI. Realistic, private, fast.
          </p>
        </div>
        <div className="flex gap-16">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="eyebrow mb-3">{column.title}</p>
              <ul className="space-y-2 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[var(--muted-ink)] transition-colors hover:text-[var(--ink)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-12 border-t px-2 pt-6 text-xs text-[var(--muted-ink)]">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </p>
    </footer>
  );
}
