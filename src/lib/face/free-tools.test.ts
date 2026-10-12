import { describe, expect, it } from "vitest";

import { boxAt, faceBox } from "./blur";
import {
  analyzeEyebrowShape,
  analyzeEyeShape,
  analyzeJawlineShape,
  analyzeLipShape,
  analyzeNoseShape,
  classifyBrowShape,
  classifyEyeShape,
  classifyNoseShape,
  measureEyes,
} from "./features";
import { classifyFaceShapeFromMeasurements } from "./face-shape-calc";
import { levelFace } from "./geometry";
import {
  blushPalette,
  classifyEyeColor,
  labToRgb,
  lipstickPalette,
  nearestMonk,
  type Depth,
  type Temp,
} from "./makeup";
import { rgbToLab } from "./foundation-shade";
import {
  analyzeAttractiveness,
  analyzeCanthalTilt,
  analyzeFaceRating,
  analyzeGoldenRatio,
  analyzeSymmetry,
  canthalLabel,
  measureSymmetry,
  toTen,
} from "./proportions";
import { rotateFace, testFace } from "./test-face";

const W = 1000;
const H = 1000;

describe("level face", () => {
  it("removes head roll before measuring eye tilt", () => {
    const flat = measureEyes(levelFace(testFace(), W, H));
    const tilted = measureEyes(levelFace(rotateFace(testFace(), 12), W, H));
    expect(Math.abs(flat.tilt)).toBeLessThan(0.5);
    expect(Math.abs(tilted.tilt - flat.tilt)).toBeLessThan(0.5);
  });

  it("measures balanced eye spacing on the reference face", () => {
    const m = measureEyes(levelFace(testFace(), W, H));
    expect(m.spacing).toBeCloseTo(1, 1);
  });
});

describe("feature detectors", () => {
  it("reads the reference face as almond eyes", () => {
    expect(analyzeEyeShape(testFace(), W, H).title).toBe("Almond");
  });

  it("detects upturned eyes when the outer corners lift", () => {
    const face = testFace({ 33: [365, 368], 263: [635, 368] });
    expect(analyzeEyeShape(face, W, H).title).toBe("Upturned");
  });

  it("classifies eye shapes from metrics", () => {
    expect(classifyEyeShape({ openness: 0.45, tilt: 0, lidSpace: 0.5 })).toBe("round");
    expect(classifyEyeShape({ openness: 0.3, tilt: -4, lidSpace: 0.5 })).toBe("downturned");
    expect(classifyEyeShape({ openness: 0.3, tilt: 2, lidSpace: 0.3 })).toBe("hooded");
    expect(classifyEyeShape({ openness: 0.2, tilt: 2, lidSpace: 0.5 })).toBe("monolid");
  });

  it("classifies brow shapes from metrics", () => {
    expect(classifyBrowShape({ arch: 0.03, peakAt: 0.5, peakAngle: 175, tailRise: 0 })).toBe("straight");
    expect(classifyBrowShape({ arch: 0.16, peakAt: 0.75, peakAngle: 140, tailRise: 0 })).toBe("high-arched");
    expect(classifyBrowShape({ arch: 0.02, peakAt: 0.5, peakAngle: 175, tailRise: -0.2 })).toBe("downward");
  });

  it("returns a labeled result for every face feature", () => {
    const face = testFace();
    for (const fn of [analyzeEyebrowShape, analyzeNoseShape, analyzeLipShape, analyzeJawlineShape]) {
      const r = fn(face, W, H);
      expect(r.title.length).toBeGreaterThan(0);
      expect(r.metrics.length).toBeGreaterThan(0);
    }
  });

  it("reads a straight bridge as straight and a hump as Roman", () => {
    const base = { widthRatio: 1, lengthRatio: 0.43, tipRatio: 0.7, projection: 0.5 };
    expect(classifyNoseShape({ ...base, hump: 0 })).toBe("straight");
    expect(classifyNoseShape({ ...base, hump: 0.045 })).toBe("roman");
    expect(classifyNoseShape({ ...base, hump: -0.04, lengthRatio: 0.35 })).toBe("snub");
    expect(analyzeNoseShape(testFace(), W, H).title).toBe("Straight (Greek)");
  });
});

describe("proportions", () => {
  it("scores a mirrored face as highly symmetrical", () => {
    const s = measureSymmetry(levelFace(testFace(), W, H));
    expect(s.score).toBeGreaterThanOrEqual(98);
    expect(analyzeSymmetry(testFace(), W, H).title).toMatch(/% symmetrical$/);
  });

  it("lowers the symmetry score when one side moves", () => {
    const skewed = testFace({ 263: [650, 395], 291: [575, 645], 397: [670, 640] });
    expect(measureSymmetry(levelFace(skewed, W, H)).score).toBeLessThan(
      measureSymmetry(levelFace(testFace(), W, H)).score,
    );
  });

  it("labels canthal tilt bands", () => {
    expect(canthalLabel(6)).toBe("Positive canthal tilt");
    expect(canthalLabel(2)).toBe("Neutral canthal tilt");
    expect(canthalLabel(-1)).toBe("Negative canthal tilt");
    expect(analyzeCanthalTilt(testFace(), W, H).tags).toContain("Neutral canthal tilt");
  });

  it("keeps scores within their scales", () => {
    expect(toTen(0)).toBe(3.5);
    expect(toTen(100)).toBe(9.7);
    for (const fn of [analyzeAttractiveness, analyzeFaceRating, analyzeGoldenRatio]) {
      const { score } = fn(testFace(), W, H);
      expect(score).toBeDefined();
      expect(score!.value).toBeGreaterThanOrEqual(0);
      expect(score!.value).toBeLessThanOrEqual(score!.max);
    }
  });
});

describe("color helpers", () => {
  it("round-trips RGB through Lab", () => {
    for (const c of [
      { r: 230, g: 190, b: 160 },
      { r: 90, g: 60, b: 40 },
      { r: 20, g: 120, b: 200 },
    ]) {
      const back = labToRgb(rgbToLab(c.r, c.g, c.b));
      expect(Math.abs(back.r - c.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.g - c.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.b - c.b)).toBeLessThanOrEqual(1);
    }
  });

  it("maps the Monk scale ends", () => {
    expect(nearestMonk(rgbToLab(246, 237, 228))).toBe(1);
    expect(nearestMonk(rgbToLab(41, 36, 32))).toBe(10);
  });

  it("classifies iris colors", () => {
    expect(classifyEyeColor(rgbToLab(70, 110, 160))).toBe("blue");
    expect(classifyEyeColor(rgbToLab(40, 25, 15))).toBe("dark-brown");
    expect(classifyEyeColor(rgbToLab(90, 110, 60))).toBe("green");
  });

  it("has a full palette for every depth and undertone", () => {
    for (const d of ["light", "medium", "deep"] as Depth[]) {
      for (const t of ["warm", "cool", "neutral"] as Temp[]) {
        expect(lipstickPalette(d, t)).toHaveLength(5);
        expect(blushPalette(d, t)).toHaveLength(4);
      }
    }
  });
});

describe("face shape calculator", () => {
  it("classifies measurement sets", () => {
    const m = { forehead: 13, cheekbones: 14, jaw: 12, length: 20, chin: "rounded" as const };
    expect(classifyFaceShapeFromMeasurements(m)).toBe("oval");
    expect(classifyFaceShapeFromMeasurements({ ...m, length: 24, forehead: 13.5, jaw: 13 })).toBe("oblong");
    expect(classifyFaceShapeFromMeasurements({ ...m, length: 17, jaw: 13 })).toBe("square");
    expect(classifyFaceShapeFromMeasurements({ ...m, length: 17, jaw: 11.5 })).toBe("round");
    expect(classifyFaceShapeFromMeasurements({ ...m, forehead: 14, jaw: 11, chin: "pointed" })).toBe("heart");
    expect(classifyFaceShapeFromMeasurements({ ...m, forehead: 11, jaw: 15 })).toBe("triangle");
  });
});

describe("blur face boxes", () => {
  it("pads, clips and hit-tests face boxes", () => {
    const box = faceBox(testFace(), W, H);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeLessThan(200);
    expect(box.x + box.w).toBeLessThanOrEqual(W);
    expect(boxAt([box], 500, 500)).toBe(0);
    expect(boxAt([box], 5, 995)).toBe(-1);
  });
});
