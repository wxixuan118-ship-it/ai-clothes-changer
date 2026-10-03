import type { Metadata, ResolvingMetadata } from "next";

import { AtelierFaq } from "@/components/atelier/faq";
import { AtelierPricing } from "@/components/atelier/pricing";

const title = "Pricing — AI Clothes Changer";
const description =
  "AI Clothes Changer pricing: start free with welcome credits, then pick a monthly plan or a one-time credit pack.";

// openGraph/twitter replace the parent objects wholesale, so spread the
// parent's — otherwise the file-based share image is dropped.
export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const previous = await parent;
  return {
    title: "Pricing",
    description,
    alternates: { canonical: "/pricing" },
    openGraph: { ...previous.openGraph, title, description, url: "/pricing" },
    twitter: { ...previous.twitter, title, description },
  };
}

export default function PricingPage() {
  return (
    <>
      <AtelierPricing headingLevel="h1" />
      <AtelierFaq tool="hair" />
    </>
  );
}
