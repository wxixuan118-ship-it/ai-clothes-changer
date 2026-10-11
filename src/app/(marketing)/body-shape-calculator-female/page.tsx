import type { Metadata } from "next";

import { BodyShapeLanding } from "@/components/body/body-shape-landing";

const title = "Body Shape Calculator for Women: Free | StyleMirror AI";
const description =
  "Free body shape calculator for women: enter bust, waist and hip measurements in inches or centimeters to find your body shape and outfit ideas.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/body-shape-calculator-female" },
  openGraph: { title, description, url: "/body-shape-calculator-female" },
  twitter: { title, description },
};

export default function FemaleBodyShapeCalculatorPage() {
  return <BodyShapeLanding audience="female" />;
}
