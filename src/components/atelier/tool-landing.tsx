import { AtelierFaq, faqJsonLd } from "@/components/atelier/faq";
import { AtelierFeatures } from "@/components/atelier/features";
import { AtelierHero } from "@/components/atelier/hero";
import { AtelierHowItWorks } from "@/components/atelier/how-it-works";
import { OtherTool } from "@/components/atelier/other-tool";
import { AtelierPricing } from "@/components/atelier/pricing";
import { AtelierStyles } from "@/components/atelier/styles-section";
import { HairLanding } from "@/components/atelier/hair-landing";
import { tools, type ToolId } from "@/config/tools";
import { absoluteUrl } from "@/lib/site-url";

// One keyword landing page per generator: the tool in the hero, then the
// sections that explain and sell it, and a cross-link to the other tool.
export function ToolLanding({
  tool,
  description,
}: {
  tool: ToolId;
  description: string;
}) {
  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tools[tool].name,
    description,
    url: absoluteUrl(tools[tool].landing),
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([appJsonLd, faqJsonLd(tool)]),
        }}
      />
      {tool === "hair" ? (
        <HairLanding />
      ) : (
        <>
          <AtelierHero tool={tool} />
          <AtelierHowItWorks tool={tool} />
          <AtelierStyles tool={tool} />
        </>
      )}
      {tool === "clothes" ? (
        <>
          <AtelierFeatures tool={tool} />
          <OtherTool tool="hair" />
        </>
      ) : null}
      <AtelierPricing />
      <AtelierFaq tool={tool} />
    </>
  );
}
