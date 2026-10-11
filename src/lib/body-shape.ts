export type BodyShape =
  "hourglass" | "pear" | "inverted-triangle" | "rectangle" | "apple";
export type MeasurementUnit = "in" | "cm";

export type BodyMeasurements = {
  bust: number;
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

export function convertMeasurement(
  value: number,
  from: MeasurementUnit,
  to: MeasurementUnit,
): number {
  if (from === to) return value;
  return from === "in" ? value * 2.54 : value / 2.54;
}
