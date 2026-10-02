import type { Metadata } from "next";

import { LegalPage } from "@/components/atelier/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${siteConfig.name} handles your photos, account, and payment data.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="October 2, 2026">
      <section>
        <h2>The short version</h2>
        <ul>
          <li>
            We use the photos you upload only to create the outfit change you
            asked for. We don&apos;t keep the uploaded photos afterwards.
          </li>
          <li>
            Results are saved to your account history until you delete them or
            delete your account.
          </li>
          <li>We don&apos;t use your photos to train AI models.</li>
          <li>We don&apos;t sell your data or show you third-party ads.</li>
        </ul>
      </section>
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Account data:</strong> your name, email address, and a
            hashed password (or the identity provider you sign in with).
          </li>
          <li>
            <strong>Photos you upload:</strong> the person photo and, if you use
            one, the garment photo. They are resized in your browser, sent to
            our AI image provider to create the result, and not stored by us.
          </li>
          <li>
            <strong>Results:</strong> each generated image, the outfit
            description or style you chose, and when it was created.
          </li>
          <li>
            <strong>Credits and billing:</strong> your credit balance and its
            history. Card payments are handled by Stripe — your card number
            never reaches our servers.
          </li>
          <li>
            <strong>Technical data:</strong> a session cookie that keeps you
            signed in, and basic server logs for security and debugging. We
            don&apos;t use analytics or advertising cookies.
          </li>
        </ul>
      </section>
      <section>
        <h2>Who processes data for us</h2>
        <p>
          We rely on a small number of providers: our AI image provider (to
          create results), Stripe (payments), our email provider (account
          emails), and our hosting and storage providers. They process data only
          to provide their service to us.
        </p>
      </section>
      <section>
        <h2>Deleting your data</h2>
        <p>
          Delete any result from your history at any time. Deleting your account
          in Settings removes your account, your saved results, and your credit
          history, and cancels any active subscription.
        </p>
      </section>
      <section>
        <h2>Children</h2>
        <p>
          The service is for adults (18+). Photos of minors are not allowed.
        </p>
      </section>
      <section>
        <h2>Questions</h2>
        <p>
          Reply to any email we&apos;ve sent you and we&apos;ll get back to you.
          We&apos;ll post changes to this policy on this page.
        </p>
      </section>
    </LegalPage>
  );
}
