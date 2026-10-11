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
  it("appears among free tools at its public route", () => {
    expect(toolOrder).toContain("body-shape");
    expect(tools["body-shape"].landing).toBe("/body-shape-calculator-female");
    expect(tools["body-shape"].type).toBe("calculator");
  });
});
