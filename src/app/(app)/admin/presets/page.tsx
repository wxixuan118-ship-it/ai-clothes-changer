import { PresetPreviews } from "@/components/admin/preset-previews";
import { hairCategories, hairPresets } from "@/config/hairstyles";
import { requireAdmin } from "@/lib/admin/auth";
import { previewProvider } from "@/lib/ai/preset-preview";
import { listPresetPreviews } from "@/lib/ai/storage";

export const dynamic = "force-dynamic";

export default async function AdminPresetsPage() {
  await requireAdmin();
  const [stored, provider] = await Promise.all([
    listPresetPreviews("hair"),
    previewProvider(),
  ]);
  const items = hairPresets.map((preset) => ({
    id: preset.id,
    name: preset.name,
    category: preset.category,
    tint: preset.tint,
    version: stored[preset.id] ?? null,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-sans text-base font-medium tracking-normal">
          Hairstyle previews
        </h2>
        <p className="text-sm text-[var(--muted-ink)]">
          One sample photo per curated hairstyle, shown in the style picker.
          {provider
            ? ` Rendered with ${provider === "kie" ? "kie.ai Seedream 5.0 Flash (≈ $0.016 each)" : "Nbility gpt-image-2 (≈ ¥0.02 each)"}.`
            : " Turn on kie.ai or Nbility under AI to generate them."}{" "}
          Don&apos;t like one? Regenerate it.
        </p>
      </div>
      <PresetPreviews
        items={items}
        categories={hairCategories}
        canGenerate={provider !== null}
      />
    </div>
  );
}
