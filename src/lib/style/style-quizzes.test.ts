import { describe, expect, it } from "vitest";

import { bodyTypeResult, frameSize, scoreSomatotype } from "@/lib/body-type";

import { colorSeasonQuiz, pickSeason, seasonInfo, seasons } from "./color-season";
import { faceShapeQuiz } from "./face-shape-quiz";
import { kibbeInfo, kibbeQuiz, kibbeTypes, pickKibbe } from "./kibbe";
import { tally, type QuizDef } from "./quiz";

/** Answers each question with the option that scores `key` highest. */
function answerFor<K extends string>(def: QuizDef<K>, key: K): number[] {
  return def.questions.map((q) => {
    let best = 0;
    q.options.forEach((o, i) => {
      if ((o.scores[key] ?? 0) > (q.options[best].scores[key] ?? 0)) best = i;
    });
    return best;
  });
}

describe("face shape quiz", () => {
  it("lands on the shape the answers point to", () => {
    for (const shape of ["round", "heart", "oblong"] as const) {
      const r = faceShapeQuiz.resolve(tally(faceShapeQuiz, answerFor(faceShapeQuiz, shape)));
      expect(r.title.toLowerCase()).toBe(shape);
    }
  });
});

describe("color season", () => {
  it("picks seasons from the dominant axis", () => {
    expect(pickSeason(1, 6, 0)).toBe("light-spring");
    expect(pickSeason(-1, 6, 0)).toBe("light-summer");
    expect(pickSeason(2, -7, 1)).toBe("deep-autumn");
    expect(pickSeason(-2, 1, 7)).toBe("bright-winter");
    expect(pickSeason(-1, 0, -6)).toBe("soft-summer");
    expect(pickSeason(8, 2, 1)).toBe("true-spring");
    expect(pickSeason(8, -2, -1)).toBe("true-autumn");
    expect(pickSeason(-8, 2, -1)).toBe("true-summer");
    expect(pickSeason(-8, -2, 1)).toBe("true-winter");
  });

  it("has 12 seasons with 8-color palettes", () => {
    expect(seasons).toHaveLength(12);
    for (const s of seasons) expect(seasonInfo[s].palette).toHaveLength(8);
  });

  it("resolves an all-warm quiz to a warm season", () => {
    const r = colorSeasonQuiz.resolve(tally(colorSeasonQuiz, answerFor(colorSeasonQuiz, "temp")));
    expect(["Spring", "Autumn"].some((f) => r.eyebrow.includes(f))).toBe(true);
  });
});

describe("kibbe", () => {
  it("covers all 13 types", () => {
    expect(kibbeTypes).toHaveLength(13);
  });

  it("maps family pairs to types", () => {
    expect(pickKibbe("D", "R", 1)).toBe("soft-dramatic");
    expect(pickKibbe("D", "R", 5)).toBe("dramatic");
    expect(pickKibbe("N", "D", 1)).toBe("flamboyant-natural");
    expect(pickKibbe("G", "R", 2)).toBe("soft-gamine");
    expect(pickKibbe("R", "D", 0)).toBe("theatrical-romantic");
    expect(pickKibbe("C", "C", 4)).toBe("classic");
  });

  it("resolves an all-romantic quiz to Romantic", () => {
    const r = kibbeQuiz.resolve(tally(kibbeQuiz, answerFor(kibbeQuiz, "R")));
    expect(r.title).toBe(kibbeInfo.romantic.label);
  });
});

describe("body type calculator", () => {
  const lean = {
    sex: "male" as const,
    heightCm: 185,
    weightKg: 62,
    wristCm: 16,
    shouldersCm: 105,
    waistCm: 74,
    hipsCm: 88,
  };

  it("sizes frames from height and wrist", () => {
    expect(frameSize("male", 185, 16)).toBe("small");
    expect(frameSize("female", 165, 17)).toBe("large");
  });

  it("scores a lean, small-framed build as ectomorph", () => {
    const s = scoreSomatotype(lean);
    expect(s.ectomorph).toBeGreaterThan(s.endomorph);
    expect(bodyTypeResult(lean).title).toMatch(/^Ecto/);
  });

  it("scores a heavier, large-framed build as endomorph", () => {
    const s = scoreSomatotype({ ...lean, weightKg: 110, wristCm: 20, waistCm: 108, shouldersCm: 118 });
    expect(s.endomorph).toBeGreaterThan(s.ectomorph);
  });
});
