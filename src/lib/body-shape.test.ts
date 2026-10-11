import { describe, expect, it } from "vitest";

import {
  calculateBodyShape,
  calculateMaleBodyShape,
  convertMeasurement,
} from "./body-shape";

describe("body shape styling calculator", () => {
  it.each([
    [{ bust: 36, waist: 26, hips: 36 }, "hourglass"],
    [{ bust: 34, waist: 29, hips: 40 }, "pear"],
    [{ bust: 40, waist: 30, hips: 35 }, "inverted-triangle"],
    [{ bust: 36, waist: 31, hips: 36 }, "rectangle"],
    [{ bust: 38, waist: 36, hips: 39 }, "apple"],
  ] as const)("classifies %j as %s", (measurements, expected) => {
    expect(calculateBodyShape(measurements)).toBe(expected);
  });

  it("rejects missing and invalid measurements", () => {
    expect(calculateBodyShape({ bust: 0, waist: 28, hips: 38 })).toBeNull();
    expect(
      calculateBodyShape({ bust: Number.NaN, waist: 28, hips: 38 }),
    ).toBeNull();
  });

  it("is unit-independent", () => {
    const inches = { bust: 36, waist: 26, hips: 36 };
    const centimeters = {
      bust: convertMeasurement(inches.bust, "in", "cm"),
      waist: convertMeasurement(inches.waist, "in", "cm"),
      hips: convertMeasurement(inches.hips, "in", "cm"),
    };
    expect(calculateBodyShape(centimeters)).toBe(calculateBodyShape(inches));
    expect(convertMeasurement(centimeters.bust, "cm", "in")).toBeCloseTo(
      inches.bust,
    );
  });
});

describe("men's body shape styling calculator", () => {
  it.each([
    [{ shoulders: 44, chest: 42, waist: 36, hips: 40 }, "trapezoid"],
    [{ shoulders: 48, chest: 44, waist: 34, hips: 38 }, "inverted-triangle"],
    [{ shoulders: 40, chest: 39, waist: 37, hips: 39 }, "rectangle"],
    [{ shoulders: 38, chest: 39, waist: 35, hips: 42 }, "triangle"],
    [{ shoulders: 40, chest: 40, waist: 42, hips: 40 }, "oval"],
  ] as const)("classifies %j as %s", (measurements, expected) => {
    expect(calculateMaleBodyShape(measurements)).toBe(expected);
  });

  it("rejects invalid measurements", () => {
    expect(
      calculateMaleBodyShape({ shoulders: 0, chest: 40, waist: 34, hips: 39 }),
    ).toBeNull();
  });
});
