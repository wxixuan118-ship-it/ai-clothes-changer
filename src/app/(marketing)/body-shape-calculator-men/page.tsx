import type { Metadata } from "next";

import { BodyShapeLanding } from "@/components/body/body-shape-landing";

export const metadata: Metadata = {
  title: "Body Shape Calculator Men: Find Your Shape Free",
  description:
    "Free body shape calculator for men. Enter shoulder, chest, waist, and hip measurements in inches or centimeters to find your shape and outfit ideas.",
  keywords: [
    "body shape calculator men",
    "body shape male calculator",
    "body shape calculator for men",
  ],
  alternates: { canonical: "/body-shape-calculator-men" },
  openGraph: {
    title: "Body Shape Calculator Men: Find Your Shape Free",
    description:
      "Use four measurements to find an approximate men's body shape and outfit ideas.",
    url: "/body-shape-calculator-men",
  },
};

export default function MaleBodyShapeCalculatorPage() {
  return <BodyShapeLanding audience="male" />;
}
