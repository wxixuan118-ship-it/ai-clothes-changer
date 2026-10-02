import type { Metadata } from "next";

import { LegalPage } from "@/components/atelier/legal-page";
import { GENERATION_COST_CREDITS } from "@/config/plans";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description: `The rules for using ${siteConfig.name}: acceptable use, credits, payments, and your content.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" updated="October 2, 2026">
      <section>
        <h2>Using the service</h2>
        <p>
          {siteConfig.name} changes the outfit in photos with AI. You must be 18
          or older to use it. By creating an account you agree to these terms.
        </p>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <p>You may only upload photos you have the right to use. Never:</p>
        <ul>
          <li>create nude, sexual, or sexually suggestive images;</li>
          <li>upload photos of minors;</li>
          <li>
            upload photos of other people without their consent, or use results
            to impersonate, harass, or deceive anyone;
          </li>
          <li>use the service for anything unlawful.</li>
        </ul>
        <p>
          We may block requests and suspend or close accounts that break these
          rules, without a refund of credits spent on them.
        </p>
      </section>
      <section>
        <h2>Credits and payments</h2>
        <ul>
          <li>
            Each result costs {GENERATION_COST_CREDITS} credit. If a run fails,
            its credit is refunded automatically.
          </li>
          <li>
            Subscriptions renew monthly and add credits on each payment. Unused
            credits roll over. You can cancel any time in Billing; you keep
            access until the end of the paid period.
          </li>
          <li>Credit packs are one-time purchases and don&apos;t expire.</li>
          <li>Prices are shown before you pay; Stripe processes payments.</li>
        </ul>
      </section>
      <section>
        <h2>Your content</h2>
        <p>
          You keep the rights to the photos you upload. You may use your results
          for personal purposes on any plan, and commercially on a paid plan.
          You are responsible for how you use them.
        </p>
      </section>
      <section>
        <h2>AI results</h2>
        <p>
          Results are generated automatically and may contain mistakes — fit,
          details, or colors may differ from the real garment. Don&apos;t rely
          on them as an exact representation of a product.
        </p>
      </section>
      <section>
        <h2>Liability and changes</h2>
        <p>
          The service is provided as is. To the extent the law allows, our
          liability is limited to the amount you paid us in the last 12 months.
          We may update these terms and will post changes here.
        </p>
      </section>
    </LegalPage>
  );
}
