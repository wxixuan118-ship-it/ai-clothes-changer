import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({ env: {}, features: {} }));
vi.mock("@/lib/settings", () => ({ isProviderUsable: async () => false }));
vi.mock("./storage", () => ({ storePresetPreview: vi.fn() }));

import { getHairPreset, hairPresets } from "@/config/hairstyles";

import { generateHairPreview, previewPrompt } from "./preset-preview";

describe("hairstyle preview prompts", () => {
  it("describe the cut on a fitting model, fully clothed, no text", () => {
    const fade = previewPrompt(getHairPreset("classic-fade")!);
    expect(fade).toContain("a young man");
    expect(fade).toContain("classic short taper fade");
    const locs = previewPrompt(getHairPreset("locs")!);
    expect(locs).toContain("of African descent");
    for (const preset of hairPresets) {
      const prompt = previewPrompt(preset);
      expect(prompt).toContain("crew-neck top");
      expect(prompt).toContain("No text, no watermark");
    }
  });

  it("refuses unknown ids and runs without a provider", async () => {
    await expect(generateHairPreview("nope")).rejects.toThrow(/Unknown/);
    await expect(generateHairPreview("pixie-cut")).rejects.toThrow(
      /No image provider/,
    );
  });
});
