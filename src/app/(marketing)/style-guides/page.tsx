import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import {
  Container,
  CtaPanel,
  Hero,
  JsonLd,
  SectionHeader,
  SourceLink,
} from "@/components/site/blocks";
import { bodyShapeInfo, maleBodyShapeInfo } from "@/lib/body-shape";
import { faceShapeInfo, type FaceShape } from "@/lib/face/face-shape-info";
import { absoluteUrl } from "@/lib/site-url";

const title = "Free Style Guides for Face, Body & Makeup | StyleMirror";
const description =
  "Free style guides for face shapes, body shapes, hairstyles and foundation, each paired with a free tool so you can check what suits you in minutes.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/style-guides" },
  openGraph: { title, description, url: "/style-guides" },
  twitter: { title, description },
};

const faceShapes = Object.keys(faceShapeInfo) as FaceShape[];

const hairAndMakeup = [
  {
    title: "Hairstyles for every face shape",
    body: "Three hand-picked cuts for each of the seven face shapes, plus how texture and styling time change the choice.",
    href: "/hairstyles-for-face-shape#by-face-shape",
    link: "Hairstyles by face shape",
  },
  {
    title: "Measure your face shape by hand",
    body: "Four tape measurements — forehead, cheekbones, jaw and length — and how to compare them without a photo.",
    href: "/face-shape-detector",
    link: "Face measuring guide",
  },
  {
    title: "Skin tone and undertone",
    body: "Six tone groups and four undertones, with the vein and jewelry checks that tell warm, cool, neutral and olive apart.",
    href: "/foundation-shade-finder#undertones",
    link: "Undertone guide",
  },
  {
    title: "Test a foundation match",
    body: "Where to swatch, what light to check in, and why you should wait ten minutes before you decide on a shade.",
    href: "/foundation-shade-finder#undertones",
    link: "Foundation matching tips",
  },
] as const;

const linkClass =
  "mt-auto inline-flex min-h-11 items-center gap-1.5 pt-2 text-sm font-bold text-[var(--brand-strong)]";

export default function StyleGuidesPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "StyleMirror style guides",
            description,
            url: absoluteUrl("/style-guides"),
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Style guides",
            itemListElement: [
              ["Face shape guide", "/face-shape-detector"],
              ["Hairstyles for face shape", "/hairstyles-for-face-shape"],
              ["Foundation shade guide", "/foundation-shade-finder"],
              ["Body shape guide for women", "/body-shape-calculator-female"],
              ["Body shape guide for men", "/body-shape-calculator-men"],
            ].map(([name, path], i) => ({
              "@type": "ListItem",
              position: i + 1,
              name,
              url: absoluteUrl(path),
            })),
          },
        ]}
      />

      <Hero
        eyebrow="Free guides · Paired with free tools"
        title={
          <>
            Style guides to find{" "}
            <span className="text-[var(--brand)]">what suits you</span>
          </>
        }
        intro="These free style guides explain face shapes, body shapes, hairstyles and foundation shades simply. All style guides link to a free tool, so you can check yours in minutes."
      />

      <Container id="face-shapes" className="pt-16">
        <SectionHeader
          title="Face shape style guides"
          sub="Seven face shapes, the proportions that define them, and what tends to flatter each one."
          action={
            <Link href="/face-shape-detector" className="pill pill-outline px-5">
              Detect my face shape
            </Link>
          }
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {faceShapes.map((shape) => {
            const info = faceShapeInfo[shape];
            return (
              <li key={shape}>
                <Link
                  href="/face-shape-detector#face-shapes"
                  className="card flex h-full flex-col gap-2 p-5"
                >
                  <Image
                    src={`/guides/face-shapes/${shape}.svg`}
                    alt={`${info.label} face shape outline from the face shape style guides`}
                    width={200}
                    height={210}
                    unoptimized
                    loading="lazy"
                    className="h-auto w-16 rounded-xl bg-[var(--paper-2)]"
                  />
                  <span className="text-lg font-extrabold">{info.label} face</span>
                  <span className="text-sm leading-relaxed text-[var(--muted-ink)]">
                    {info.description.split(". ")[0]}.
                  </span>
                  <span className="text-sm">
                    <span className="font-bold">Try:</span>{" "}
                    {info.hairstyles.slice(0, 2).join(", ")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>

      <Container id="body-shapes" className="pt-20">
        <SectionHeader
          title="Body shape style guides"
          sub="Five common shapes for women and five builds for men, each with outfit ideas to start from."
        />
        {(
          [
            ["Women", "women", bodyShapeInfo, "/body-shape-calculator-female"],
            ["Men", "men", maleBodyShapeInfo, "/body-shape-calculator-men"],
          ] as const
        ).map(([label, folder, info, href]) => (
          <div key={folder} className="mb-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xl font-extrabold">{label}</p>
              <Link href={href} className={linkClass.replace("mt-auto ", "")}>
                {label === "Women"
                  ? "Body shape calculator for women"
                  : "Male body shape calculator"}
                <ArrowRightIcon className="size-4" aria-hidden />
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {Object.entries(info).map(([id, shape]) => (
                <li key={id}>
                  <Link href={`${href}#shapes`} className="card flex h-full flex-col gap-2 p-5">
                    <Image
                      src={`/guides/body-shapes/${folder}/${id}.svg`}
                      alt={`${shape.label} silhouette from the body shape style guides`}
                      width={160}
                      height={280}
                      unoptimized
                      loading="lazy"
                      className="h-auto w-14 rounded-xl bg-[var(--paper-2)]"
                    />
                    <span className="font-extrabold">{shape.label}</span>
                    <span className="text-sm leading-relaxed text-[var(--muted-ink)]">
                      {shape.description}
                    </span>
                    <span className="text-sm">
                      <span className="font-bold">Try:</span>{" "}
                      {shape.ideas.slice(0, 2).join(", ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <Container id="hair-makeup" className="pt-12">
        <SectionHeader
          title="Hair and makeup style guides"
          sub={
            <>
              Practical how-tos for cuts, colors and shade matching. Looking
              for haircut names? See this{" "}
              <SourceLink href="https://en.wikipedia.org/wiki/List_of_hairstyles">
                list of hairstyles
              </SourceLink>
              .
            </>
          }
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hairAndMakeup.map((guide) => (
            <li key={guide.title} className="card flex flex-col gap-2 p-6">
              <p className="text-lg font-extrabold">{guide.title}</p>
              <p className="leading-relaxed text-[var(--muted-ink)]">{guide.body}</p>
              <Link href={guide.href} className={linkClass}>
                {guide.link}
                <ArrowRightIcon className="size-4" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="pt-20">
        <SectionHeader title="How to use these style guides" />
        <div className="grid gap-6 leading-relaxed text-[var(--muted-ink)] md:grid-cols-2">
          <p>
            Start with the free tool for the guide you are reading: a selfie
            for face shape and foundation, a tape measure for body shape. The
            tool gives you a starting label in a minute or two, and the style
            guide explains what that label means and which cuts, frames or
            outfits usually work with it.
          </p>
          <p>
            Treat every label as a guide, not a rule. Many people sit between
            two shapes, and texture, personal taste and how much time you spend
            styling matter as much as proportions. When you find a look you
            like, preview it on your own photo with the{" "}
            <Link href="/" className="font-semibold text-[var(--brand-strong)] underline underline-offset-4">
              AI hairstyle changer
            </Link>{" "}
            or the{" "}
            <Link href="/ai-clothes-changer" className="font-semibold text-[var(--brand-strong)] underline underline-offset-4">
              AI clothes changer
            </Link>{" "}
            before you commit.
          </p>
        </div>
      </Container>

      <CtaPanel
        title="Know your shape? See a new look on you"
        sub="Try any of 65 hairstyles or a new outfit on your own photo. 20 free credits."
        href="/#studio"
        label="Try it free"
      />
    </>
  );
}
