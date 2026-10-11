import type { Metadata } from "next";

import { BodyShapeLanding } from "@/components/body/body-shape-landing";

const title = "Male Body Shape Calculator: Find Your Build | StyleMirror AI";
const description =
  "Free male body shape calculator: enter shoulder, chest, waist and hip measurements to find your build — trapezoid, rectangle, oval and more.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/body-shape-calculator-men" },
  openGraph: { title, description, url: "/body-shape-calculator-men" },
  twitter: { title, description },
};

export default function MaleBodyShapeCalculatorPage() {
  return <BodyShapeLanding audience="male" />;
}
