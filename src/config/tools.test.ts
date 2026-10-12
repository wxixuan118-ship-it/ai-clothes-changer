import { describe, expect, it } from "vitest";

import { parseTool, toolOrder, tools } from "./tools";

describe("hairstyles for face shape product", () => {
  it("is available from Products at its public route", () => {
    expect(toolOrder).toContain("hairstyle-face-shape");
    expect(tools["hairstyle-face-shape"].landing).toBe(
      "/hairstyles-for-face-shape",
    );
    expect(parseTool("hairstyle-face-shape")).toBe("hairstyle-face-shape");
  });
});

describe("body shape calculator product", () => {
  it("exposes distinct women and men routes among free tools", () => {
    expect(toolOrder).toContain("body-shape");
    expect(toolOrder).toContain("body-shape-men");
    expect(tools["body-shape"].landing).toBe("/body-shape-calculator-female");
    expect(tools["body-shape-men"].landing).toBe("/body-shape-calculator-men");
    expect(tools["body-shape"].type).toBe("calculator");
    expect(tools["body-shape-men"].type).toBe("calculator");
  });
});

describe("free tool pages", () => {
  it("gives every new free tool a page config and a route", async () => {
    const { existsSync } = await import("node:fs");
    const { freeToolPages } = await import("./free-tool-pages");
    const newIds = toolOrder.filter((id) => tools[id].isNew);
    expect(newIds.length).toBeGreaterThanOrEqual(26);
    for (const id of newIds) {
      expect(freeToolPages.some((p) => p.id === id)).toBe(true);
      expect(
        existsSync(`src/app/(marketing)${tools[id].landing}/page.tsx`),
      ).toBe(true);
    }
    const landings = toolOrder.map((id) => tools[id].landing);
    expect(new Set(landings).size).toBe(landings.length);
  });
});
