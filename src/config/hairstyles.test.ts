import { describe, expect, it } from "vitest";

import { screenPrompt } from "@/lib/moderation";

import { hairCategories, hairPresets } from "./hairstyles";

describe("hair presets", () => {
  it("ships 10 styles with 5 unique choices each", () => {
    expect(hairCategories).toHaveLength(10);
    expect(new Set(hairPresets.map((p) => p.id)).size).toBe(50);
    for (const category of hairCategories) {
      expect(hairPresets.filter((p) => p.category === category)).toHaveLength(
        5,
      );
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
