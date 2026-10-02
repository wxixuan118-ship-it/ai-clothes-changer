import type { Metadata } from "next";

import { AtelierFaq, faqJsonLd } from "@/components/atelier/faq";
import { AtelierFeatures } from "@/components/atelier/features";
import { AtelierHero } from "@/components/atelier/hero";
import { AtelierHowItWorks } from "@/components/atelier/how-it-works";
import { AtelierPricing } from "@/components/atelier/pricing";
import { AtelierStyles } from "@/components/atelier/styles-section";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  description: siteConfig.description,
  url: absoluteUrl("/"),
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([appJsonLd, faqJsonLd]),
        }}
      />
      <AtelierHero />
      <AtelierHowItWorks />
      <AtelierStyles />
      <AtelierFeatures />
      <AtelierPricing />
      <AtelierFaq />
    </>
  );
}
