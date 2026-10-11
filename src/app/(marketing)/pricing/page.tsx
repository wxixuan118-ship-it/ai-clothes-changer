import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckIcon, MinusIcon } from "lucide-react";

import {
  Container,
  CtaPanel,
  InfoCards,
  FaqList,
  faqSchema,
  Hero,
  JsonLd,
  SectionHeader,
  SourceLink,
  type FaqItem,
} from "@/components/site/blocks";
import { PricingCards, usd } from "@/components/site/pricing-cards";
import {
  GENERATION_COST_CREDITS,
  plans,
  topupPack,
  WELCOME_CREDITS,
} from "@/config/plans";
import { absoluteUrl } from "@/lib/site-url";

const title = "StyleMirror AI Pricing: Free Credits, Pro & Ultra Plans";
const description =
  "StyleMirror AI pricing is simple: 20 free credits to start, 10 credits per AI image, Pro at $9 and Ultra at $29 a month, plus one-time credit packs.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/pricing" },
  openGraph: { title, description, url: "/pricing" },
  twitter: { title, description },
};

const imagesPerMonth = (credits: number) =>
  Math.floor(credits / GENERATION_COST_CREDITS).toLocaleString("en-US");

const rows: { label: string; values: [React.ReactNode, React.ReactNode, React.ReactNode] }[] = [
  {
    label: "Price",
    values: [
      usd(plans.free.priceMonthlyCents),
      `${usd(plans.pro.priceMonthlyCents)} / month`,
      `${usd(plans.ultra.priceMonthlyCents)} / month`,
    ],
  },
  {
    label: "Credits",
    values: [
      `${WELCOME_CREDITS} once`,
      `${plans.pro.monthlyCredits.toLocaleString("en-US")} / month`,
      `${plans.ultra.monthlyCredits.toLocaleString("en-US")} / month`,
    ],
  },
  {
    label: "AI images",
    values: [
      imagesPerMonth(WELCOME_CREDITS),
      `${imagesPerMonth(plans.pro.monthlyCredits)} / month`,
      `${imagesPerMonth(plans.ultra.monthlyCredits)} / month`,
    ],
  },
  { label: "Watermark-free downloads", values: [false, true, true] },
  { label: "Commercial use", values: [false, true, true] },
  { label: "Free style tools", values: [true, true, true] },
];

const faqs: FaqItem[] = [
  {
    q: "How does StyleMirror AI pricing work?",
    a: `Pricing is credit-based. Every AI hairstyle or outfit image costs ${GENERATION_COST_CREDITS} credits. New accounts get ${WELCOME_CREDITS} free credits, and paid plans add credits every month.`,
  },
  {
    q: "Which tools are free?",
    a: "The face shape detector, hairstyles for face shape finder, foundation shade finder and both body shape calculators are free with no sign-up. They run in your browser and never use credits.",
  },
  {
    q: "What happens if an image fails?",
    a: "Failed runs are refunded to your balance automatically, so you only pay for results you receive.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. Manage or cancel your plan from the billing page. Your plan stays active until the end of the period you paid for.",
  },
  {
    q: "Do I need a subscription to buy more credits?",
    a: `No. The ${topupPack.name} pack gives ${topupPack.credits.toLocaleString("en-US")} credits for ${usd(topupPack.priceCents)}, one-time.`,
  },
  {
    q: "How do I pay, and is my card stored?",
    a: "Checkout runs on Stripe. Your card details go straight to Stripe and are never stored on StyleMirror servers.",
  },
  {
    q: "Do the free tools need an account?",
    a: "No. The face, foundation and body shape tools work without signing up. You only need an account to create AI images.",
  },
  {
    q: "Can I use the images commercially?",
    a: "Images created on a paid plan carry no watermark and can be used commercially. Free downloads carry a small watermark and are for personal use.",
  },
];

function Cell({ value }: { value: React.ReactNode }) {
  if (value === true)
    return (
      <CheckIcon
        className="mx-auto size-5 text-[var(--pop-green-bold)]"
        aria-label="Included"
      />
    );
  if (value === false)
    return (
      <MinusIcon
        className="mx-auto size-5 text-[var(--muted-ink)]"
        aria-label="Not included"
      />
    );
  return <>{value}</>;
}

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: "StyleMirror AI",
            description,
            url: absoluteUrl("/pricing"),
            offers: Object.values(plans).map((plan) => ({
              "@type": "Offer",
              name: plan.name,
              price: (plan.priceMonthlyCents / 100).toFixed(2),
              priceCurrency: "USD",
            })),
          },
          faqSchema(faqs),
        ]}
      />

      <Hero
        eyebrow={`${WELCOME_CREDITS} free credits · Cancel any time`}
        title={
          <>
            StyleMirror AI pricing,{" "}
            <span className="text-[var(--brand)]">simple and fair</span>
          </>
        }
        intro={`StyleMirror AI pricing is credit-based, so you pay per image: every AI hairstyle or outfit costs ${GENERATION_COST_CREDITS} credits, and every StyleMirror AI account starts with ${WELCOME_CREDITS} free credits.`}
      />

      <Container id="plans" className="pt-14">
        <SectionHeader title="StyleMirror AI pricing plans" center />
        <PricingCards />
      </Container>

      <Container id="compare" className="pt-20">
        <SectionHeader
          title="Compare StyleMirror AI plans"
          sub={`One AI image = ${GENERATION_COST_CREDITS} credits on every plan.`}
        />
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th scope="col" className="p-4 font-bold">
                  <span className="sr-only">Feature</span>
                </th>
                {Object.values(plans).map((plan) => (
                  <th key={plan.id} scope="col" className="p-4 text-center font-extrabold">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                  <th scope="row" className="p-4 font-semibold">
                    {row.label}
                  </th>
                  {row.values.map((value, i) => (
                    <td key={i} className="p-4 text-center text-[var(--muted-ink)]">
                      <Cell value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 max-w-3xl leading-relaxed text-[var(--muted-ink)]">
          How credits work: your balance goes down by {GENERATION_COST_CREDITS}{" "}
          credits when an image starts and goes back up automatically if the
          run fails. Paid plans add their monthly credits on each renewal, and
          a one-time {topupPack.name} pack adds{" "}
          {topupPack.credits.toLocaleString("en-US")} credits whenever you need
          more. Your balance, every charge and every refund are listed in the
          credit history on your dashboard, so you always know where each
          credit went.
        </p>
      </Container>

      <Container className="pt-8">
        <InfoCards
          items={[
            {
              title: "Just curious? Stay on Free",
              body: `Your ${WELCOME_CREDITS} welcome credits cover ${imagesPerMonth(WELCOME_CREDITS)} images — enough to test a haircut or an outfit on your own photo before you spend anything.`,
            },
            {
              title: "Planning a change? Go Pro",
              body: `Pro adds ${imagesPerMonth(plans.pro.monthlyCredits)} images a month without a watermark — room to compare dozens of cuts, colors and outfits before a salon visit or a big event.`,
            },
            {
              title: "Creating content? Pick Ultra",
              body: `Ultra adds ${imagesPerMonth(plans.ultra.monthlyCredits)} images a month with commercial use, for stylists, salons and creators who make looks for clients or social posts.`,
            },
          ]}
        />
      </Container>

      <Container id="examples" className="pt-20">
        <SectionHeader
          title="What one StyleMirror AI image looks like"
          sub={`Each of these hairstyle changes took ${GENERATION_COST_CREDITS} credits. Clothes changes cost the same.`}
        />
        <ul className="grid grid-cols-3 gap-4">
          {[
            ["bob", "French bob"],
            ["curls", "Defined curls"],
            ["pixie", "Textured pixie"],
          ].map(([id, name]) => (
            <li key={id} className="card overflow-hidden">
              <Image
                src={`/hairstyle-transformations/${id}-after.webp`}
                alt={`${name} hairstyle result, a StyleMirror AI pricing example at ${GENERATION_COST_CREDITS} credits per image`}
                width={700}
                height={850}
                unoptimized
                loading="lazy"
                className="aspect-[4/5] w-full object-cover object-[center_25%]"
              />
              <p className="px-4 py-3 font-bold">{name}</p>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[var(--muted-ink)]">
          Try it yourself with the{" "}
          <Link href="/" className="font-semibold text-[var(--brand-strong)] underline underline-offset-4">
            AI hairstyle changer
          </Link>{" "}
          or the{" "}
          <Link href="/ai-clothes-changer" className="font-semibold text-[var(--brand-strong)] underline underline-offset-4">
            AI clothes changer
          </Link>
          . Payments are processed securely by{" "}
          <SourceLink href="https://stripe.com">Stripe</SourceLink>.
        </p>
      </Container>

      <Container id="faq" className="pt-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.7fr]">
          <SectionHeader
            title="StyleMirror AI pricing FAQ"
            sub={
              <>
                Free tools never use credits — start with the{" "}
                <Link
                  href="/face-shape-detector"
                  className="font-semibold text-[var(--brand-strong)] underline underline-offset-4"
                >
                  face shape detector
                </Link>
                .
              </>
            }
          />
          <FaqList items={faqs} />
        </div>
      </Container>

      <CtaPanel
        title="Start with 20 free credits"
        sub="No credit card needed. Upgrade only when you want more images."
        href="/signup"
        label="Sign up free"
      />
    </>
  );
}
