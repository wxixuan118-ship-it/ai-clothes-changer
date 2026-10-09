import { describe, expect, it } from "vitest";

import { getHairColor, hairColorInstruction, hairColors } from "./hair-colors";
import { hairCategoriesByGender, hairPresets } from "./hairstyles";
import { screenPrompt } from "@/lib/moderation";

describe("hair presets", () => {
  it("Female: 8 styles × 5, Male: 5 styles × 5, unique ids", () => {
    expect(new Set(hairPresets.map((p) => p.id)).size).toBe(hairPresets.length);
    for (const [gender, categories, count] of [
      ["female", hairCategoriesByGender.female, 8],
      ["male", hairCategoriesByGender.male, 5],
    ] as const) {
      expect(categories).toHaveLength(count);
      for (const category of categories) {
        expect(
          hairPresets.filter(
            (p) => p.gender === gender && p.category === category,
          ),
        ).toHaveLength(5);
      }
    }
  });

  it.each(hairPresets.map((p) => [p.id, p.prompt]))(
    "%s passes the prompt screen",
    (_id, prompt) => {
      // null = nothing flagged.
      expect(screenPrompt(prompt, "hair")).toBeNull();
    },
  );
});

describe("hair colors", () => {
  it("has unique ids, AI recommended and No change first", () => {
    expect(new Set(hairColors.map((c) => c.id)).size).toBe(hairColors.length);
    expect(hairColors.slice(0, 2).map((c) => c.id)).toEqual(["ai", "keep"]);
  });

  it("turns a pick into one instruction sentence", () => {
    expect(hairColorInstruction(getHairColor("keep")!)).toMatch(
      /Keep the person's current hair color/,
    );
    expect(hairColorInstruction(getHairColor("pastel-pink")!)).toBe(
      "Hair color: pastel pink.",
    );
    expect(hairColorInstruction(getHairColor("ai")!)).toMatch(/flattering/);
  });

  it.each(hairColors.filter((c) => c.prompt).map((c) => [c.id, c.prompt!]))(
    "%s passes the prompt screen",
    (_id, prompt) => {
      expect(screenPrompt(prompt, "hair")).toBeNull();
    },
  );
});
