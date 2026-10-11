import { PlusIcon } from "lucide-react";

import { GENERATION_COST_CREDITS, WELCOME_CREDITS } from "@/config/plans";
import type { ToolId } from "@/config/tools";

type Faq = { q: string; a: string };

const shared: Faq[] = [
  {
    q: "Is it free to try?",
    a: `Yes. New accounts get ${WELCOME_CREDITS} free credits. Each result costs ${GENERATION_COST_CREDITS} credits, and failed runs are refunded automatically.`,
  },
  {
    q: "Can I use the images commercially?",
    a: "Images created on a paid plan can be used commercially, for example on social media, ads, or product pages.",
  },
  {
    q: "Are my photos private?",
    a: "We don't store the photos you upload — they are only used to create your result. Results are saved to your account history, and you can delete any of them at any time.",
  },
  {
    q: "What content is not allowed?",
    a: "Nudity, sexual content, and photos of minors or of people without their consent are not allowed. Accounts that misuse the tool are closed.",
  },
];

const faqsByTool: Record<ToolId, Faq[]> = {
  hair: [
    {
      q: "What is an AI hairstyle tool?",
      a: "It is a tool that gives the person in your photo a new haircut or hair color — from a hairstyle photo, a text description, or a preset style — while keeping their face, features, and background.",
    },
    {
      q: "What kind of photo works best?",
      a: "A clear, well-lit photo of one person facing the camera with the hair visible and not covered by a hat or hands. JPG, PNG, or WebP up to 25 MB.",
    },
    {
      q: "Can I try a hairstyle from a celebrity or salon photo?",
      a: "Yes. Upload the hairstyle photo as a reference and the AI recreates the cut, length, and color on your photo.",
    },
    {
      q: "Can I just change my hair color?",
      a: "Yes. Pick a color style such as platinum blonde or cherry red, or describe the color you want in words.",
    },
    ...shared,
  ],
  clothes: [
    {
      q: "What is an AI clothes changer?",
      a: "It is a tool that replaces the outfit in your photo with a new one — from a garment image, a text description, or a preset style — while keeping your face, pose, and background.",
    },
    {
      q: "What kind of photo works best?",
      a: "A clear, well-lit photo of one person facing the camera, half or full body, with nothing covering the clothes. JPG, PNG, or WebP up to 25 MB.",
    },
    {
      q: "Can I use my own clothing photo?",
      a: "Yes. Upload a product shot, a flat lay, or a photo of someone wearing it. Clean backgrounds give the most accurate results.",
    },
    ...shared,
  ],
  "face-shape": [
    {
      q: "Is the face shape detector really free?",
      a: "Yes, completely free. No sign-up, no watermarks, no usage limits. The analysis runs entirely in your browser.",
    },
    {
      q: "Does my photo get uploaded anywhere?",
      a: "No. Everything runs locally in your browser using Google's MediaPipe AI. Your photo never leaves your device.",
    },
    {
      q: "How accurate is it?",
      a: "Our AI uses 478 facial landmarks to measure your proportions. Results are generally accurate for clear front-facing photos with good lighting.",
    },
    {
      q: "What kind of photo works best?",
      a: "Use a clear front-facing photo with your hair pulled back and good even lighting. Remove glasses if possible.",
    },
    {
      q: "How many face shapes do you detect?",
      a: "We detect 7 face shapes: oval, round, square, heart, diamond, oblong, and triangle.",
    },
  ],
  "hairstyle-face-shape": [
    {
      q: "How do I find my face shape?",
      a: "Upload a clear front-facing photo. The face analysis runs in your browser and recommends hairstyles for the shape it finds.",
    },
    {
      q: "Is the hairstyle finder free?",
      a: "Yes. Face shape analysis and recommendations are free. Trying a hairstyle on your photo uses the AI hairstyle changer.",
    },
  ],
  foundation: [
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
      a: "Use natural daylight if possible. Remove heavy makeup and glasses. Face the camera directly with even lighting.",
    },
  ],
  "body-shape": [
    {
      q: "What measurements do I need?",
      a: "Measure around the fullest part of your bust and hips, plus your natural waist. Use the same unit for all three.",
    },
    {
      q: "Is my result exact?",
      a: "No. Body shape labels are approximate styling guides. Measurements do not capture every detail of your silhouette or personal style.",
    },
    {
      q: "Are my measurements saved?",
      a: "No. This calculator runs in your browser and does not send or save your measurements.",
    },
  ],
};

export function AtelierFaq({ tool }: { tool: ToolId }) {
  return (
    <section
      id="faq"
      className="mx-auto grid w-full max-w-[1240px] scroll-mt-8 gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.6fr]"
    >
      <div>
        <p className="eyebrow">FAQ</p>
        <h2 className="text-title mt-3">Questions, answered</h2>
      </div>
      <div className="divide-y border-y">
        {faqsByTool[tool].map((faq) => (
          <details key={faq.q} name="faq" className="group py-2">
            <summary className="flex list-none items-center justify-between gap-6 py-4 text-lg font-medium [&::-webkit-details-marker]:hidden">
              {faq.q}
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border transition-transform group-open:rotate-45">
                <PlusIcon className="size-4" aria-hidden />
              </span>
            </summary>
            <p className="pb-5 text-[var(--muted-ink)]">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** FAQPage structured data matching the visible questions. */
export function faqJsonLd(tool: ToolId) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqsByTool[tool].map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}
