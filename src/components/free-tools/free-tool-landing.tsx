import type { Metadata } from "next";
import Image from "next/image";

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
} from "@/components/site/blocks";
import { freeToolGuides } from "@/config/free-tool-guides";
import {
  freeToolPage,
  type FreeToolPage,
  type Widget,
} from "@/config/free-tool-pages";
import { tools, type ToolId } from "@/config/tools";
import { absoluteUrl } from "@/lib/site-url";

import { AgeGroupTool } from "./age-group-tool";
import { AgeTool } from "./age-tool";
import { BlurFace } from "./blur-face";
import { BodyTypeCalculator } from "./body-type-calculator";
import { FaceShapeCalculator } from "./face-shape-calculator";
import { LandmarkTool, type LandmarkToolId } from "./landmark-tool";
import { QuizTool } from "./quiz-tool";

export function freeToolMetadata(id: ToolId): Metadata {
  const page = freeToolPage(id);
  const path = tools[id].landing;
  return {
    title: { absolute: page.metaTitle },
    description: page.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: path,
    },
    twitter: { title: page.metaTitle, description: page.metaDescription },
  };
}

function ToolWidget({ widget }: { widget: Widget }) {
  switch (widget.kind) {
    case "landmark":
      return <LandmarkTool tool={widget.tool as LandmarkToolId} />;
    case "quiz":
      return <QuizTool quiz={widget.quiz} />;
    case "face-calc":
      return <FaceShapeCalculator />;
    case "body-type":
      return <BodyTypeCalculator />;
    case "blur":
      return <BlurFace />;
    case "age":
      return <AgeTool />;
    case "age-group":
      return <AgeGroupTool />;
    case "none":
      return null;
  }
}

function TypeCards({ types }: { types: NonNullable<FreeToolPage["types"]> }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {types.items.map((item) => (
        <li key={item.title} className="card flex flex-col gap-2 p-6">
          {item.swatches ? (
            <span className="flex gap-1.5" aria-hidden>
              {item.swatches.map((hex) => (
                <span
                  key={hex}
                  className="size-6 rounded-full border"
                  style={{ background: hex }}
                />
              ))}
            </span>
          ) : null}
          <p className="text-lg font-extrabold">{item.title}</p>
          <p className="leading-relaxed text-[var(--muted-ink)]">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}

/** Landing page for a free tool: hero + tool, how it works, types, FAQ. */
export function FreeToolLanding({ id }: { id: ToolId }) {
  const page = freeToolPage(id);
  const tool = tools[id];
  const guide = freeToolGuides[id];
  const faqs = guide ? [...page.faqs, ...guide.faqs] : page.faqs;
  const usesAgeModel =
    page.widget.kind === "age" || page.widget.kind === "age-group";
  const usesPhoto =
    page.widget.kind === "landmark" ||
    page.widget.kind === "blur" ||
    usesAgeModel;
  return (
    <>
      <JsonLd
        data={[
          appSchema({
            name: tool.name,
            description: page.metaDescription,
            url: absoluteUrl(tool.landing),
            category: "LifestyleApplication",
          }),
          faqSchema(faqs),
        ]}
      />

      <Hero
        eyebrow={page.eyebrow}
        title={
          <>
            {page.h1[0]}{" "}
            <span className="text-[var(--brand)]">{page.h1[1]}</span>
          </>
        }
        intro={page.intro}
      >
        <ToolWidget widget={page.widget} />
      </Hero>

      <Container id="how-it-works" className="pt-20">
        <SectionHeader
          title={page.stepsTitle}
          sub={
            usesAgeModel ? (
              <>
                Faces are found with{" "}
                <SourceLink href="https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker">
                  MediaPipe
                </SourceLink>
                ; ages come from the{" "}
                <SourceLink href="https://github.com/dchen236/FairFace">
                  FairFace model
                </SourceLink>{" "}
                by Kärkkäinen &amp; Joo (
                <SourceLink href="https://creativecommons.org/licenses/by/4.0/">
                  CC BY 4.0
                </SourceLink>
                ), quantized to 8-bit to run in your browser.
              </>
            ) : usesPhoto ? (
              <>
                Detection uses Google&apos;s{" "}
                <SourceLink href="https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker">
                  MediaPipe Face Landmarker
                </SourceLink>
                , running on your device.
              </>
            ) : page.source ? (
              <>
                {page.source.lead}{" "}
                <SourceLink href={page.source.href}>
                  {page.source.label}
                </SourceLink>
                .
              </>
            ) : undefined
          }
        />
        <StepCards steps={page.steps} />
      </Container>

      {page.types ? (
        <Container id="types" className="pt-20">
          <SectionHeader title={page.types.title} sub={page.types.sub} />
          <TypeCards types={page.types} />
        </Container>
      ) : null}

      {page.extra ? (
        <Container className="pt-20">
          <SectionHeader title={page.extra.title} sub={page.extra.sub} />
          <div className="max-w-3xl space-y-4">
            {page.extra.paragraphs.map((p) => (
              <p
                key={p}
                className="leading-relaxed text-[var(--muted-ink)] sm:text-[17px]"
              >
                {p}
              </p>
            ))}
          </div>
        </Container>
      ) : null}

      {guide ? (
        <Container id="guide" className="pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <SectionHeader title={guide.title} />
              <div className="space-y-4">
                {guide.paragraphs.map((p) => (
                  <p
                    key={p}
                    className="leading-relaxed text-[var(--muted-ink)] sm:text-[17px]"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
            <figure className="card overflow-hidden p-3">
              <Image
                src={`/guides/free-tools/${id}.svg`}
                alt={guide.alt}
                width={400}
                height={300}
                unoptimized
                loading="lazy"
                className="h-auto w-full rounded-2xl"
              />
              <figcaption className="px-2 pt-3 pb-1 text-sm text-[var(--muted-ink)]">
                {guide.caption}
              </figcaption>
            </figure>
          </div>
        </Container>
      ) : null}

      <Container id="faq" className="pt-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.7fr]">
          <SectionHeader title={page.faqTitle} />
          <FaqList items={faqs} />
        </div>
      </Container>

      <MoreTools current={id} />

      <CtaPanel {...page.cta} />
    </>
  );
}
