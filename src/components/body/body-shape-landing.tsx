import Image from "next/image";
import Link from "next/link";

import {
  appSchema,
  Container,
  CtaPanel,
  FaqList,
  faqSchema,
  Hero,
  JsonLd,
  MoreTools,
  SectionHeader,
  SourceLink,
  StepCards,
  type FaqItem,
} from "@/components/site/blocks";
import { cn } from "@/lib/utils";
import { bodyShapeInfo, maleBodyShapeInfo } from "@/lib/body-shape";
import { absoluteUrl } from "@/lib/site-url";

import { BodyShapeCalculator } from "./body-shape-calculator";

type Audience = "female" | "male";

type PageCopy = {
  name: string;
  path: string;
  description: string;
  eyebrow: string;
  h1: React.ReactNode;
  intro: string;
  steps: { title: string; body: string }[];
  h2: { measure: string; shapes: string; rules: string; faq: string };
  shapesSub: string;
  rules: string[];
  rulesSub: React.ReactNode;
  faq: FaqItem[];
  folder: "women" | "men";
  altSuffix: string;
};

const shared: FaqItem[] = [
  {
    q: "Is the result exact?",
    a: "No. Body shape labels are approximate styling categories. A tape measure cannot capture every detail of a silhouette, and many people sit between two shapes.",
  },
  {
    q: "Are my measurements saved?",
    a: "No. The calculation runs in your browser and does not upload or save your measurements.",
  },
];

const copy: Record<Audience, PageCopy> = {
  female: {
    name: "Body Shape Calculator",
    path: "/body-shape-calculator-female",
    description:
      "Free body shape calculator for women: enter bust, waist and hip measurements to find your body shape and outfit ideas.",
    eyebrow: "Free · No sign-up · Inches or centimeters",
    h1: (
      <>
        Body shape calculator{" "}
        <span className="text-[var(--brand)]">for women</span>
      </>
    ),
    intro:
      "Enter your bust, waist and hip measurements and this free body shape calculator finds your closest shape — hourglass, pear, apple, rectangle or inverted triangle — with outfit ideas for each body shape.",
    steps: [
      {
        title: "Measure your bust",
        body: "Wrap the tape around the fullest part of your bust, keeping it level across your back.",
      },
      {
        title: "Measure your waist",
        body: "Measure your natural waist — the narrowest point, usually just above the belly button — without pulling tight.",
      },
      {
        title: "Measure your hips",
        body: "Measure around the fullest part of your hips and seat, with your feet together.",
      },
    ],
    h2: {
      measure: "How to use the body shape calculator",
      shapes: "Body shapes the calculator can find",
      rules: "How the body shape calculator decides",
      faq: "Body shape calculator FAQ",
    },
    shapesSub:
      "Five common styling categories, each with a few outfit ideas to start from.",
    rules: [
      "Apple — your waist is at least 90% of your larger bust or hip measurement.",
      "Pear — your hips are at least 5% wider than your bust.",
      "Inverted triangle — your bust is at least 5% wider than your hips.",
      "Hourglass — bust and hips are close, and your waist is 80% or less of the smaller one.",
      "Rectangle — bust and hips are close, with a gentler waist difference.",
    ],
    rulesSub: (
      <>
        The rules follow the common five-category system described in{" "}
        <SourceLink href="https://en.wikipedia.org/wiki/Female_body_shape">
          female body shape
        </SourceLink>{" "}
        references, checked in this order.
      </>
    ),
    faq: [
      {
        q: "What measurements do I need?",
        a: "Bust, natural waist and hips. Use the same unit for all three — inches or centimeters both work.",
      },
      {
        q: "How does it work?",
        a: "It compares the relative sizes of your three measurements and picks the closest of five common styling categories, using the rules listed above.",
      },
      ...shared,
    ],
    folder: "women",
    altSuffix: "body shape calculator result",
  },
  male: {
    name: "Male Body Shape Calculator",
    path: "/body-shape-calculator-men",
    description:
      "Free male body shape calculator: enter shoulder, chest, waist and hip measurements to find your build — trapezoid, rectangle, oval and more.",
    eyebrow: "Free · No sign-up · Inches or centimeters",
    h1: (
      <>
        Male body shape calculator{" "}
        <span className="text-[var(--brand)]">for your build</span>
      </>
    ),
    intro:
      "Enter four measurements and this free male body shape calculator finds your closest build — trapezoid, inverted triangle, rectangle, triangle or oval — with outfit ideas for each male body shape.",
    steps: [
      {
        title: "Measure your shoulders",
        body: "Wrap the tape all the way around the widest part of your shoulders. Ask someone to keep it level.",
      },
      {
        title: "Measure your chest",
        body: "Measure around the fullest part of your chest, under your arms, after a normal breath out.",
      },
      {
        title: "Measure your waist",
        body: "Measure your natural waist without pulling the tape tight or holding your breath.",
      },
      {
        title: "Measure your hips",
        body: "Measure around the fullest part of your hips and seat, with your feet together.",
      },
    ],
    h2: {
      measure: "How to use the male body shape calculator",
      shapes: "Five male body shapes and builds",
      rules: "How the male body shape calculator decides",
      faq: "Male body shape calculator FAQ",
    },
    shapesSub:
      "Five common menswear categories, each with a few outfit ideas to start from.",
    rules: [
      "Oval — your waist is at least 95% of your larger chest or hip measurement.",
      "Triangle — your hips are at least 5% wider than your shoulders and chest.",
      "Inverted triangle — shoulders or chest at least 15% wider than both waist and hips.",
      "Trapezoid — shoulders or chest at least 5% wider than both waist and hips.",
      "Rectangle — shoulders, waist and hips stay close in size.",
    ],
    rulesSub: (
      <>
        Shoulders are a circumference, not the straight-line{" "}
        <SourceLink href="https://en.wikipedia.org/wiki/Biacromial_breadth">
          biacromial breadth
        </SourceLink>{" "}
        between shoulder points. Rules are checked in this order.
      </>
    ),
    faq: [
      {
        q: "What measurements do I need?",
        a: "Shoulder circumference, chest, natural waist and hips. Use the same unit for all four measurements.",
      },
      {
        q: "Is shoulder width the same as shoulder circumference?",
        a: "No. Wrap the tape all the way around your shoulders. Do not enter the straight-line distance between your shoulder points.",
      },
      {
        q: "How does it work?",
        a: "It compares the relative sizes of four circumferences and picks the closest of five menswear styling categories, using the rules listed above.",
      },
      ...shared,
    ],
    folder: "men",
    altSuffix: "male body shape calculator result",
  },
};

export function BodyShapeLanding({ audience }: { audience: Audience }) {
  const page = copy[audience];
  const shapes = Object.entries(
    audience === "female" ? bodyShapeInfo : maleBodyShapeInfo,
  );

  return (
    <>
      <JsonLd
        data={[
          appSchema({
            name: page.name,
            description: page.description,
            url: absoluteUrl(page.path),
            category: "LifestyleApplication",
          }),
          faqSchema(page.faq),
        ]}
      />

      <Hero eyebrow={page.eyebrow} title={page.h1} intro={page.intro}>
        <nav
          aria-label="Choose calculator"
          className="mx-auto mt-7 flex w-fit rounded-[12px] border border-[var(--border)] p-1"
        >
          {(
            [
              ["female", "/body-shape-calculator-female", "Women"],
              ["male", "/body-shape-calculator-men", "Men"],
            ] as const
          ).map(([id, href, label]) => (
            <Link
              key={id}
              href={href}
              aria-current={audience === id ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-[9px] px-6 text-sm font-bold transition-colors",
                audience === id
                  ? "bg-[var(--ink)] text-[var(--ink-deep)]"
                  : "text-[var(--muted-ink)] hover:text-[var(--ink)]",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <BodyShapeCalculator audience={audience} />
      </Hero>

      <Container id="how-to-measure" className="pt-20">
        <SectionHeader
          title={page.h2.measure}
          sub="Use a soft tape measure over light clothing, standing relaxed. Then enter the numbers above."
        />
        <StepCards steps={page.steps} />
      </Container>

      <Container id="shapes" className="pt-20">
        <SectionHeader title={page.h2.shapes} sub={page.shapesSub} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shapes.map(([id, shape]) => (
            <li key={id} className="card flex gap-4 p-5">
              <Image
                src={`/guides/body-shapes/${page.folder}/${id}.svg`}
                alt={`${shape.label} silhouette, a ${page.altSuffix}`}
                width={160}
                height={280}
                unoptimized
                loading="lazy"
                className="h-auto w-20 shrink-0 self-start rounded-xl bg-[var(--paper-2)]"
              />
              <div>
                <p className="text-lg font-extrabold">{shape.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted-ink)]">
                  {shape.description}
                </p>
                <p className="mt-2 text-sm">
                  <span className="font-bold">Try:</span>{" "}
                  {shape.ideas.join(", ")}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-5 max-w-3xl text-sm text-[var(--muted-ink)]">
          These are approximate styling categories, not rules about what you
          can wear or a measure of health.
        </p>
      </Container>

      <Container id="rules" className="pt-20">
        <SectionHeader title={page.h2.rules} sub={page.rulesSub} />
        <ol className="card divide-y divide-[var(--border)] px-6">
          {page.rules.map((rule, i) => (
            <li key={rule} className="flex gap-4 py-4 leading-relaxed">
              <span className="tile size-8 rounded-full bg-[var(--pop-sky)] text-sm font-extrabold text-[var(--pop-sky-bold)]">
                {i + 1}
              </span>
              {rule}
            </li>
          ))}
        </ol>
        <p className="mt-5 max-w-3xl leading-relaxed text-[var(--muted-ink)]">
          Sitting right on a boundary is common. If two results feel close,
          read both descriptions and use the outfit ideas that match how your
          clothes actually fit. Measurements shift with training, weight and
          posture, so measure again every few months.
        </p>
      </Container>

      <Container id="faq" className="pt-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.7fr]">
          <SectionHeader
            title={page.h2.faq}
            sub={
              <>
                Want to see an outfit on you? Try the{" "}
                <Link
                  href="/ai-clothes-changer"
                  className="font-semibold text-[var(--brand-strong)] underline underline-offset-4"
                >
                  AI clothes changer
                </Link>
                .
              </>
            }
          />
          <FaqList items={page.faq} />
        </div>
      </Container>

      <MoreTools current={audience === "female" ? "body-shape" : "body-shape-men"} />

      <CtaPanel
        title="Know your shape? See an outfit on you"
        sub="Pick a style you like and preview it on your own photo with the AI clothes changer."
        href="/ai-clothes-changer#studio"
        label="Try an outfit"
      />
    </>
  );
}
