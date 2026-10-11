import Link from "next/link";
import { ArrowRightIcon, CheckIcon, PlusIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { toolOrder, tools, type ToolId } from "@/config/tools";

import { toolIcon, toolTint } from "./tool-style";

// Shared building blocks for the Canvas-theme marketing pages. Section
// titles are the page's H2 outline — keep them on the page's keyword.
// Card titles and promo blocks use styled <p> so they don't dilute it.

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function Container({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "mx-auto w-full max-w-[1280px] scroll-mt-8 px-4 sm:px-6",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Hero({
  eyebrow,
  title,
  intro,
  badges,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro: React.ReactNode;
  badges?: string[];
  children?: React.ReactNode;
}) {
  return (
    <Container className="pt-12 sm:pt-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--muted-ink)]">
          <CheckIcon className="size-4 text-[var(--brand)]" aria-hidden />
          {eyebrow}
        </p>
        <h1 className="text-display mt-5 max-w-[18ch]">{title}</h1>
        <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-[var(--muted-ink)] sm:text-[19px]">
          {intro}
        </p>
        {badges?.length ? (
          <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-medium text-[var(--muted-ink)]">
            {badges.map((badge) => (
              <li key={badge} className="flex items-center gap-1.5">
                <CheckIcon
                  className="size-4 text-[var(--pop-green-bold)]"
                  aria-hidden
                />
                {badge}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {children}
    </Container>
  );
}

export function SectionHeader({
  title,
  sub,
  center = false,
  action,
}: {
  title: string;
  sub?: React.ReactNode;
  center?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-wrap items-end justify-between gap-4",
        center && "justify-center text-center",
      )}
    >
      <div className={cn(center && "mx-auto max-w-2xl")}>
        <h2 className="text-[clamp(1.75rem,1.2rem+1.4vw,2.25rem)] leading-tight font-extrabold tracking-[-0.02em]">
          {title}
        </h2>
        {sub ? (
          <p className="mt-2 text-base leading-relaxed text-[var(--muted-ink)] sm:text-[17px]">
            {sub}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function StepCards({
  steps,
}: {
  steps: readonly { title: string; body: string }[];
}) {
  return (
    <ol
      className={cn(
        "grid gap-5",
        steps.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3",
      )}
    >
      {steps.map((step, i) => (
        <li key={step.title} className="card flex flex-col gap-2.5 p-6">
          <span className="tile size-10 rounded-full bg-[var(--brand-soft)] font-extrabold text-[var(--brand-strong)]">
            {i + 1}
          </span>
          <p className="text-lg font-extrabold">{step.title}</p>
          <p className="leading-relaxed text-[var(--muted-ink)]">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function InfoCards({
  items,
  cols = 3,
}: {
  items: readonly { title: string; body: string; aside?: React.ReactNode }[];
  cols?: 2 | 3 | 4;
}) {
  return (
    <ul
      className={cn(
        "grid gap-4 sm:grid-cols-2",
        cols === 3 && "lg:grid-cols-3",
        cols === 4 && "lg:grid-cols-4",
      )}
    >
      {items.map((item) => (
        <li key={item.title} className="card flex flex-col gap-2 p-6">
          {item.aside}
          <p className="text-lg font-extrabold">{item.title}</p>
          <p className="leading-relaxed text-[var(--muted-ink)]">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}

export function ToolCard({ id, compact = false }: { id: ToolId; compact?: boolean }) {
  const Icon = toolIcon[id];
  const [bg, fg] = toolTint[id];
  const tool = tools[id];
  return (
    <Link
      href={tool.landing}
      className={cn(
        "card flex gap-4",
        compact ? "flex-col p-5" : "items-center p-6",
      )}
    >
      <span className="tile size-12" style={{ background: bg, color: fg }}>
        <Icon className="size-6" aria-hidden />
      </span>
      <span className="flex flex-1 flex-col gap-1">
        <span className="font-extrabold">{tool.name}</span>
        <span className="text-sm leading-relaxed text-[var(--muted-ink)]">
          {tool.desc}
        </span>
      </span>
      {tool.type === "generator" ? (
        <span className="text-xs font-bold text-[var(--brand-strong)]">
          10 credits
        </span>
      ) : (
        <span className="self-start rounded-full bg-[var(--pop-mint)] px-2 py-1 text-[11px] font-bold text-[var(--free-text)]">
          FREE
        </span>
      )}
    </Link>
  );
}

/** Cross-links to the other tools. A promo block, so no heading. */
export function MoreTools({
  current,
  label = "More from StyleMirror",
}: {
  current: ToolId;
  label?: string;
}) {
  const ids = toolOrder.filter((id) => id !== current);
  return (
    <Container className="py-14">
      <p className="mb-6 text-2xl font-extrabold tracking-[-0.02em]">{label}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ids.map((id) => (
          <ToolCard key={id} id={id} compact />
        ))}
      </div>
    </Container>
  );
}

export type FaqItem = { q: string; a: string };

export function FaqList({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="divide-y divide-[var(--border)] rounded-[20px] border border-[var(--border)] px-6">
      {items.map((faq) => (
        <details key={faq.q} name="faq" className="group py-1">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-3 text-[17px] font-bold [&::-webkit-details-marker]:hidden">
            {faq.q}
            <span className="tile size-8 shrink-0 rounded-full border border-[var(--border)] transition-transform group-open:rotate-45">
              <PlusIcon className="size-4" aria-hidden />
            </span>
          </summary>
          <p className="pb-5 leading-relaxed text-[var(--muted-ink)]">{faq.a}</p>
        </details>
      ))}
    </div>
  );
}

export function faqSchema(items: readonly FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export function appSchema({
  name,
  description,
  url,
  category = "MultimediaApplication",
}: {
  name: string;
  description: string;
  url: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url,
    applicationCategory: category,
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

/** Closing call to action. A promo block, so no heading. */
export function CtaPanel({
  title,
  sub,
  href,
  label,
}: {
  title: string;
  sub: string;
  href: string;
  label: string;
}) {
  return (
    <Container className="py-14">
      <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
        <p className="max-w-[24ch] text-[clamp(1.6rem,1.1rem+1.6vw,2.4rem)] leading-tight font-extrabold tracking-[-0.03em]">
          {title}
        </p>
        <p className="max-w-[52ch] text-[17px] text-[var(--muted-ink)]">{sub}</p>
        <Link href={href} className="pill pill-brand mt-3 px-7 text-base">
          {label}
          <ArrowRightIcon className="size-4" aria-hidden />
        </Link>
      </div>
    </Container>
  );
}

/** Outbound reference link: opens a new tab, no referrer leakage. */
export function SourceLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-[var(--brand-strong)] underline underline-offset-4"
    >
      {children}
    </a>
  );
}
