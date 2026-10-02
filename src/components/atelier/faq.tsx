import { PlusIcon } from "lucide-react";

import { GENERATION_COST_CREDITS, WELCOME_CREDITS } from "@/config/plans";

const faqs = [
  {
    q: "What is an AI clothes changer?",
    a: "It is a tool that replaces the outfit in your photo with a new one — from a garment image, a text description, or a preset style — while keeping your face, pose, and background.",
  },
  {
    q: "Is it free to try?",
    a: `Yes. New accounts get ${WELCOME_CREDITS} free credits. Each generated image costs ${GENERATION_COST_CREDITS} credit, and failed generations are refunded automatically.`,
  },
  {
    q: "What kind of photo works best?",
    a: "A clear, well-lit photo of one person facing the camera, half or full body, with nothing covering the clothes. JPG, PNG, or WebP up to 25 MB.",
  },
  {
    q: "Can I use my own clothing photo?",
    a: "Yes. Upload a product shot, a flat lay, or a photo of someone wearing it. Clean backgrounds give the most accurate results.",
  },
  {
    q: "Can I use the images commercially?",
    a: "Images created on a paid plan can be used commercially, for example on product pages, ads, or social media.",
  },
  {
    q: "Are my photos private?",
    a: "We don't store the photos you upload — they are only used to create your result. Results are saved to your account history, and you can delete any of them at any time.",
  },
  {
    q: "What content is not allowed?",
    a: "Nudity, sexual content, and photos of minors or of people without their consent are not allowed. Accounts that misuse the tool are closed.",
  },
] as const;

export function AtelierFaq() {
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
        {faqs.map((faq) => (
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

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};
