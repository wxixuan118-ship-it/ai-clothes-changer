import { describe, expect, it } from "vitest";

import {
  AGE_BANDS,
  ageResult,
  ALIGN_TEMPLATE,
  applyAffine,
  estimateAge,
  similarityTransform,
  softmax,
} from "./age";

describe("face alignment", () => {
  it("maps a rotated, scaled, shifted copy of the template back onto it", () => {
    const angle = 0.3;
    const scale = 1.7;
    const src = ALIGN_TEMPLATE.map(([x, y]) => [
      scale * (x * Math.cos(angle) - y * Math.sin(angle)) + 40,
      scale * (x * Math.sin(angle) + y * Math.cos(angle)) - 12,
    ]) as [number, number][];
    const m = similarityTransform(src, ALIGN_TEMPLATE);
    src.forEach((p, i) => {
      const [x, y] = applyAffine(m, p);
      expect(x).toBeCloseTo(ALIGN_TEMPLATE[i][0], 4);
      expect(y).toBeCloseTo(ALIGN_TEMPLATE[i][1], 4);
    });
  });
});

describe("age estimate", () => {
  it("softmax sums to one", () => {
    const p = softmax([1, 2, 3]);
    expect(p.reduce((s, v) => s + v, 0)).toBeCloseTo(1, 6);
    expect(p[2]).toBeGreaterThan(p[0]);
  });

  it("reports the top band and a weighted estimate in years", () => {
    const logits = [-5, -5, -2, 4, 2, -2, -5, -5, -5];
    const e = estimateAge(logits);
    expect(e.band).toBe("20–29");
    expect(e.years).toBeGreaterThanOrEqual(24);
    expect(e.years).toBeLessThanOrEqual(30);
    expect(e.confidence).toBeGreaterThan(0.5);
  });

  it("builds a result with one bar per band", () => {
    const r = ageResult(estimateAge([0, 0, 0, 5, 0, 0, 0, 0, 0]));
    expect(r.title).toMatch(/years old$/);
    expect(r.metrics).toHaveLength(AGE_BANDS.length);
  });
});
