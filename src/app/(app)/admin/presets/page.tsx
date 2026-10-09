import { PresetPreviews } from "@/components/admin/preset-previews";
import { hairCategoriesByGender, hairPresets } from "@/config/hairstyles";
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
    gender: preset.gender,
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
          One sample photo per curated hairstyle, all on the same model per
          gender, shown in the style picker. Each preview edits the model photo
          with the image model selected under AI (≈ $0.02 each).
          {provider
            ? ` Model photos are rendered with ${provider === "kie" ? "kie.ai Seedream 5.0 Flash" : "Nbility gpt-image-2"}.`
            : " Turn on kie.ai or Nbility under AI to generate them."}{" "}
          Don&apos;t like one? Regenerate it.
        </p>
      </div>
      <PresetPreviews
        items={items}
        groups={[
          {
            gender: "female",
            label: "Female",
            categories: hairCategoriesByGender.female,
          },
          {
            gender: "male",
            label: "Male",
            categories: hairCategoriesByGender.male,
          },
        ]}
        bases={[
          {
            gender: "female",
            label: "Female",
            version: stored["_base-female"] ?? null,
          },
          {
            gender: "male",
            label: "Male",
            version: stored["_base-male"] ?? null,
          },
        ]}
        canGenerate={provider !== null}
      />
    </div>
  );
}
