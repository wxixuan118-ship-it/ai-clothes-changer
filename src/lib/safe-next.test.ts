import { describe, expect, it } from "vitest";

import { safeNext } from "./safe-next";

describe("safeNext", () => {
  it.each([
    ["/billing", "/billing"],
    ["/generate?style=navy-suit#studio", "/generate?style=navy-suit#studio"],
  ])("keeps same-origin path %s", (input, expected) => {
    expect(safeNext(input)).toBe(expected);
  });

  it.each([
    "//evil.example/phish",
    "/\\evil.example/phish",
    "/\t/evil.example/phish",
    "/\n/evil.example",
    "https://evil.example",
    "javascript:alert(1)",
    "",
    undefined,
    null,
  ])("rejects %j", (input) => {
    expect(safeNext(input, "/fallback")).toBe("/fallback");
  });
});
