export type BodyShape =
  "hourglass" | "pear" | "inverted-triangle" | "rectangle" | "apple";
export type MeasurementUnit = "in" | "cm";

export type BodyMeasurements = {
  bust: number;
  waist: number;
  hips: number;
};

export type MaleBodyShape =
  "trapezoid" | "inverted-triangle" | "rectangle" | "triangle" | "oval";

export type MaleBodyMeasurements = {
  shoulders: number;
  chest: number;
  waist: number;
  hips: number;
};

export const bodyShapeInfo: Record<
  BodyShape,
  {
    label: string;
    description: string;
    ideas: readonly string[];
  }
> = {
  hourglass: {
    label: "Hourglass",
    description:
      "Your bust and hips are close in size, with a more defined waist.",
    ideas: ["Wrap dresses", "Waist-defined jackets", "High-rise trousers"],
  },
  pear: {
    label: "Pear",
    description: "Your hips measure wider than your bust.",
    ideas: ["Statement necklines", "A-line skirts", "Structured tops"],
  },
  "inverted-triangle": {
    label: "Inverted triangle",
    description: "Your bust measures wider than your hips.",
    ideas: ["Wide-leg trousers", "A-line skirts", "Simple V-neck tops"],
  },
  rectangle: {
    label: "Rectangle",
    description:
      "Your bust and hips are close in size, with a gentler waist difference.",
    ideas: [
      "Belts and waist ties",
      "Layered separates",
      "Fit-and-flare dresses",
    ],
  },
  apple: {
    label: "Apple",
    description: "Your waist is close in size to your bust or hips.",
    ideas: ["Open-front layers", "Straight-leg trousers", "Flowing dresses"],
  },
};

export const maleBodyShapeInfo: Record<
  MaleBodyShape,
  { label: string; description: string; ideas: readonly string[] }
> = {
  trapezoid: {
    label: "Trapezoid",
    description:
      "Your upper body is moderately wider than your waist and hips.",
    ideas: [
      "Tailored jackets",
      "Straight-leg trousers",
      "Clean-fitting shirts",
    ],
  },
  "inverted-triangle": {
    label: "Inverted triangle",
    description:
      "Your shoulders and chest are noticeably broader than your waist and hips.",
    ideas: ["Unstructured jackets", "Straight-leg jeans", "Simple tops"],
  },
  rectangle: {
    label: "Rectangle",
    description:
      "Your shoulders, waist, and hips have a relatively straight outline.",
    ideas: ["Layered shirts", "Structured jackets", "Relaxed trousers"],
  },
  triangle: {
    label: "Triangle",
    description: "Your hips measure wider than your shoulders and chest.",
    ideas: [
      "Structured shoulders",
      "Open-neck shirts",
      "Straight-leg trousers",
    ],
  },
  oval: {
    label: "Oval",
    description: "Your waist is close to or wider than your chest and hips.",
    ideas: [
      "Open-front layers",
      "Straight-cut jackets",
      "Comfortable mid-rise trousers",
    ],
  },
};

/** A transparent styling heuristic, not a medical or body composition assessment. */
export function calculateBodyShape(
  measurements: BodyMeasurements,
): BodyShape | null {
  const { bust, waist, hips } = measurements;
  if (
    ![bust, waist, hips].every((value) => Number.isFinite(value) && value > 0)
  ) {
    return null;
  }

  const upper = Math.max(bust, hips);
  if (waist >= upper * 0.9) return "apple";
  if (hips >= bust * 1.05) return "pear";
  if (bust >= hips * 1.05) return "inverted-triangle";
  if (waist <= Math.min(bust, hips) * 0.8) return "hourglass";
  return "rectangle";
}

/** Uses circumferences, including a tape wrapped around the shoulders. */
export function calculateMaleBodyShape(
  measurements: MaleBodyMeasurements,
): MaleBodyShape | null {
  const { shoulders, chest, waist, hips } = measurements;
  if (
    ![shoulders, chest, waist, hips].every(
      (value) => Number.isFinite(value) && value > 0,
    )
  ) {
    return null;
  }

  const upper = Math.max(shoulders, chest);
  if (waist >= Math.max(chest, hips) * 0.95) return "oval";
  if (hips >= upper * 1.05) return "triangle";
  if (upper >= hips * 1.15 && upper >= waist * 1.15) {
    return "inverted-triangle";
  }
  if (upper >= hips * 1.05 && upper >= waist * 1.05) {
    return "trapezoid";
  }
  return "rectangle";
}

export function convertMeasurement(
  value: number,
  from: MeasurementUnit,
  to: MeasurementUnit,
): number {
  if (from === to) return value;
  return from === "in" ? value * 2.54 : value / 2.54;
}
