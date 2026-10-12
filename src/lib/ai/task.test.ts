import { describe, expect, it } from "vitest";

import {
  getGlassesPreset,
  glassesCategories,
  glassesPresets,
} from "@/config/glasses";

import { referenceKind } from "./task";

describe("edit tasks", () => {
  it("names the reference photo per task", () => {
    expect(referenceKind("hair")).toBe("hairstyle");
    expect(referenceKind("glasses")).toBe("eyewear");
    expect(referenceKind("clothes")).toBe("garment");
    expect(referenceKind(undefined)).toBe("garment");
  });

  it("has unique glasses presets in known categories", () => {
    const ids = glassesPresets.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of glassesPresets) {
      expect(glassesCategories).toContain(p.category);
      expect(getGlassesPreset(p.id)).toBe(p);
    }
  });
});
