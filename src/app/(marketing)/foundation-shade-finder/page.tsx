import type { Metadata, ResolvingMetadata } from "next";

import { FoundationShadeFinder } from "@/components/face/foundation-shade-finder";
import { OtherTool } from "@/components/atelier/other-tool";

const title = "Foundation Shade Finder: Match Skin Tone Free | StyleMirror AI";
const description =
  "Find your perfect foundation shade with AI. Upload a photo to analyze your skin tone and undertone, then get matched to shades from MAC, Fenty, NARS, and more.";

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const previous = await parent;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/foundation-shade-finder" },
    openGraph: {
      ...previous.openGraph,
      title,
      description,
      url: "/foundation-shade-finder",
    },
    twitter: { ...previous.twitter, title, description },
  };
}

export default function FoundationShadeFinderPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-[1240px] px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-[var(--brand)]">Free Foundation Matcher</p>
          <h1 className="text-display mt-3">Find your foundation match</h1>
          <p className="mt-4 max-w-[52ch] text-[var(--muted-ink)] sm:text-lg">
            Upload a selfie and discover your skin tone, undertone, and the
            perfect foundation shades from top brands — all in seconds.
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            <li className="badge-brand">100% Free</li>
            <li className="badge-brand">No sign-up</li>
            <li className="badge-brand">Photo stays private</li>
            <li className="badge-brand">6+ brands matched</li>
          </ul>
        </div>

        <FoundationShadeFinder />
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-6">
        <p className="eyebrow text-center text-[var(--brand)]">How it works</p>
        <h2 className="text-title mt-3 text-center">Three easy steps</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Upload your photo",
              desc: "Take a clear selfie in natural light, no heavy makeup.",
            },
            {
              step: "02",
              title: "AI analyzes your skin",
              desc: "Our AI samples your skin tone from multiple facial areas.",
            },
            {
              step: "03",
              title: "Get matched",
              desc: "See your skin tone, undertone, and matching foundation shades.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border bg-[var(--paper-2)] p-6"
            >
              <span className="chip-mono">{item.step}</span>
              <h3 className="mt-3 text-xl font-bold">{item.title}</h3>
              <p className="mt-2 text-[var(--muted-ink)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Skin tones */}
      <section className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6">
        <p className="eyebrow text-center text-[var(--brand)]">6 Skin Tones</p>
        <h2 className="text-title mt-3 text-center">Where do you fall?</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { name: "Fair", hex: "#FDE8D0" },
            { name: "Light", hex: "#F0CEA6" },
            { name: "Light Medium", hex: "#DDB17F" },
            { name: "Medium", hex: "#C28E5A" },
            { name: "Tan", hex: "#9A683A" },
            { name: "Deep", hex: "#613D21" },
          ].map((tone) => (
            <div
              key={tone.name}
              className="rounded-2xl border bg-[var(--paper-2)] p-5 text-center"
            >
              <div
                className="mx-auto size-14 rounded-full border-4 border-white shadow-md"
                style={{ backgroundColor: tone.hex }}
              />
              <h3 className="mt-3 font-bold">{tone.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Undertones */}
      <section className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6">
        <p className="eyebrow text-center text-[var(--brand)]">4 Undertones</p>
        <h2 className="text-title mt-3 text-center">Warm, cool, neutral, or olive?</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "Warm",
              desc: "Golden, yellow, or peachy hues. Look for 'W' or 'warm' shades.",
            },
            {
              name: "Cool",
              desc: "Pink, red, or bluish hues. Look for 'C' or 'cool' shades.",
            },
            {
              name: "Neutral",
              desc: "Balanced mix of warm and cool. Most versatile shade range.",
            },
            {
              name: "Olive",
              desc: "Subtle green or golden hints. Often misclassified as neutral.",
            },
          ].map((undertone) => (
            <div
              key={undertone.name}
              className="rounded-2xl border bg-[var(--paper-2)] p-5"
            >
              <h3 className="font-bold">{undertone.name}</h3>
              <p className="mt-2 text-sm text-[var(--muted-ink)]">
                {undertone.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cross-link to other tools */}
      <OtherTool tool="hair" />
      <OtherTool tool="clothes" />

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <p className="eyebrow text-center text-[var(--brand)]">FAQ</p>
        <h2 className="text-title mt-3 text-center">Questions</h2>
        <div className="mt-8 space-y-3">
          {[
            {
              q: "Is the foundation shade finder really free?",
              a: "Yes, completely free. No sign-up, no paywalls, no usage limits. The analysis runs entirely in your browser.",
            },
            {
              q: "Does my photo get uploaded to a server?",
              a: "No. Everything runs locally in your browser using Google's MediaPipe AI. Your photo never leaves your device.",
            },
            {
              q: "How accurate is the shade match?",
              a: "Our AI uses CIELAB color space and CIEDE2000 color difference for matching. Lighting affects results — natural daylight works best.",
            },
            {
              q: "What brands are included?",
              a: "We match against popular brands including Fenty Beauty, MAC, NARS, Estée Lauder, and Maybelline.",
            },
            {
              q: "What kind of photo works best?",
              desc: "Use natural daylight if possible. Remove heavy makeup and glasses. Face the camera directly with even lighting.",
            },
          ].map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border bg-[var(--paper-2)] p-5"
            >
              <summary className="flex cursor-pointer items-center justify-between font-semibold list-none">
                {item.q}
                <span className="ml-4 text-[var(--muted-ink)] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-[var(--muted-ink)]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
