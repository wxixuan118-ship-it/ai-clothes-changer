import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  stored: new Map<string, Buffer>(),
  generate: vi.fn(),
}));

vi.mock("@/lib/env", () => ({ env: {}, features: {} }));
vi.mock("@/lib/settings", () => ({
  isProviderUsable: async () => false,
  getEditModel: async () => "seedream/5-flash-image-to-image",
}));
vi.mock("./provider", () => ({
  getImageProvider: () => ({ modelId: "x", generateImage: state.generate }),
}));
vi.mock("./storage", () => ({
  readPresetPreview: async (_tool: string, id: string) =>
    state.stored.get(id) ?? null,
  storePresetPreview: async (_tool: string, id: string, bytes: Buffer) => {
    state.stored.set(id, bytes);
  },
}));

import sharp from "sharp";

import { getHairPreset, hairPresets } from "@/config/hairstyles";

import {
  basePrompt,
  generateHairPreview,
  previewInstruction,
} from "./preset-preview";

describe("hairstyle previews on a shared model", () => {
  it("base prompts are clothed studio portraits per gender", () => {
    expect(basePrompt("male")).toContain("young man");
    expect(basePrompt("female")).toContain("young woman");
    for (const prompt of [basePrompt("male"), basePrompt("female")]) {
      expect(prompt).toContain("crew-neck top");
      expect(prompt).toContain("No text, no watermark");
    }
  });

  it("each instruction changes only the hair and keeps the color", () => {
    for (const preset of hairPresets) {
      const text = previewInstruction(preset);
      expect(text).toContain(preset.prompt);
      expect(text).toContain("Keep the person's current dark brown hair color");
    }
  });

  it("edits the stored base photo of the preset's gender", async () => {
    const base = await sharp({
      create: { width: 600, height: 800, channels: 3, background: "#999" },
    })
      .jpeg()
      .toBuffer();
    state.stored.set("_base-male", base);
    state.generate.mockResolvedValueOnce({
      url: `data:image/jpeg;base64,${base.toString("base64")}`,
      width: 600,
      height: 800,
      model: "seedream/5-flash-image-to-image",
    });

    await generateHairPreview("classic-fade");

    const call = state.generate.mock.calls[0]?.[0];
    expect(call.task).toBe("hair");
    expect(call.personImage.bytes.equals(base)).toBe(true);
    expect(call.prompt).toContain(getHairPreset("classic-fade")!.prompt);
    expect(state.stored.has("classic-fade")).toBe(true);
  });

  it("needs a base model provider when the base photo is missing", async () => {
    await expect(generateHairPreview("pixie-cut")).rejects.toThrow(
      /No image provider/,
    );
    await expect(generateHairPreview("nope")).rejects.toThrow(/Unknown/);
  });
});
