import {
  ImagePlusIcon,
  LayersIcon,
  LockKeyholeIcon,
  PaletteIcon,
  ScanFaceIcon,
  ScissorsIcon,
  ShirtIcon,
  TypeIcon,
} from "lucide-react";

import type { ToolId } from "@/config/tools";

type Feature = { icon: typeof ShirtIcon; title: string; body: string };

const privacy: Feature = {
  icon: LockKeyholeIcon,
  title: "Private by default",
  body: "We don't keep your uploaded photos. Delete any result from your history.",
};
const saved: Feature = {
  icon: ImagePlusIcon,
  title: "Every look saved",
  body: "Not quite right? Run it again — each result lands in your history.",
};

const featuresByTool: Record<ToolId, { title: string; items: Feature[] }> = {
  hair: {
    title: "Everything a hair makeover needs",
    items: [
      {
        icon: ScissorsIcon,
        title: "Copy any haircut",
        body: "Upload a photo of a hairstyle you love and see it on yourself.",
      },
      {
        icon: TypeIcon,
        title: "Describe it in words",
        body: "“Short curly bob, copper red” is enough. The AI handles the rest.",
      },
      {
        icon: PaletteIcon,
        title: "Cuts and colors",
        body: "Pixies, bobs, curls, braids, fades — plus bold color changes.",
      },
      {
        icon: ScanFaceIcon,
        title: "You stay you",
        body: "Face, features, makeup, and background are preserved. Only the hair changes.",
      },
      saved,
      privacy,
    ],
  },
  clothes: {
    title: "Everything an outfit swap needs",
    items: [
      {
        icon: ShirtIcon,
        title: "Garment photo try-on",
        body: "Upload any clothing photo — flat lay or on a model — and wear it.",
      },
      {
        icon: TypeIcon,
        title: "Describe it in words",
        body: "“Light blue linen suit” is enough. The AI handles fit and fabric.",
      },
      {
        icon: LayersIcon,
        title: "Curated style library",
        body: "Suits, wedding looks, street style, evening wear — one click each.",
      },
      {
        icon: ScanFaceIcon,
        title: "You stay you",
        body: "Face, hair, pose, and background are preserved. Only the outfit changes.",
      },
      saved,
      privacy,
    ],
  },
};

export function AtelierFeatures({ tool }: { tool: ToolId }) {
  const { title, items } = featuresByTool[tool];
  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6">
      <div className="mb-12 max-w-2xl">
        <p className="eyebrow">Features</p>
        <h2 className="text-title mt-3">{title}</h2>
      </div>
      <ul className="grid gap-px overflow-hidden rounded-[28px] border bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
        {items.map((feature) => (
          <li key={feature.title} className="bg-[var(--canvas)] p-8">
            <feature.icon className="size-6 text-[var(--brand)]" aria-hidden />
            <h3 className="mt-6 text-xl">{feature.title}</h3>
            <p className="mt-2 text-[var(--muted-ink)]">{feature.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
