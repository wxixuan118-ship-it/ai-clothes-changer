import type { Metadata } from "next";

import { BodyShapeLanding } from "@/components/body/body-shape-landing";

export const metadata: Metadata = {
  title: "Body Shape Calculator Female: Find Your Shape Free",
  description:
    "Free body shape calculator for women. Enter bust, waist, and hip measurements in inches or centimeters to find your shape and explore outfit ideas.",
  keywords: [
    "body shape calculator female",
    "body shape women calculator",
    "female body shape calculator",
  ],
  alternates: { canonical: "/body-shape-calculator-female" },
  openGraph: {
    title: "Body Shape Calculator Female: Find Your Shape Free",
    description:
      "Use three measurements to find an approximate body shape and outfit ideas.",
    url: "/body-shape-calculator-female",
  },
};

export default function FemaleBodyShapeCalculatorPage() {
  return <BodyShapeLanding audience="female" />;
}
