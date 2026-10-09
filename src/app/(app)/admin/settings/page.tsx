import { ModelForm } from "@/components/admin/model-form";
import { requireAdmin } from "@/lib/admin/auth";
import { env, features } from "@/lib/env";
import { EDIT_MODELS, getEditModel } from "@/lib/settings";

export const dynamic = "force-dynamic";

function Row({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <span>{label}</span>
      <span className={ok ? "text-credit-text" : "text-debit-text"}>
        {value}
      </span>
    </li>
  );
}

export default async function AdminSettingsPage() {
  await requireAdmin();
  const current = await getEditModel();

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
      <section className="space-y-4 rounded-[20px] border bg-[var(--paper-2)] p-5">
        <div>
          <h2 className="font-sans text-base font-medium tracking-normal">
            Image model
          </h2>
          <p className="text-sm text-[var(--muted-ink)]">
            Used by both the hairstyle and clothes changers. Takes effect within
            30 seconds — no redeploy. Default from env:{" "}
            <code>{env.AI_EDIT_MODEL}</code>
          </p>
        </div>
        <ModelForm models={EDIT_MODELS} current={current} />
      </section>
      <section className="space-y-2 rounded-[20px] border bg-[var(--paper-2)] p-5">
        <h2 className="font-sans text-base font-medium tracking-normal">
          Service status
        </h2>
        <p className="text-sm text-[var(--muted-ink)]">
          Set in AnySites → Environment variables (redeploy after changes).
        </p>
        <ul className="divide-y">
          <Row
            label="AI model key (DASHSCOPE_API_KEY)"
            value={
              features.dashscope
                ? "Connected"
                : env.AI_MOCK
                  ? "Mock mode"
                  : "Missing"
            }
            ok={features.imageEditing}
          />
          <Row
            label="AI region"
            value={
              env.DASHSCOPE_BASE_URL.includes("intl")
                ? "Singapore"
                : env.DASHSCOPE_BASE_URL.replace("https://", "")
            }
            ok
          />
          <Row
            label="Stripe"
            value={
              features.billing
                ? /^(sk|rk)_live_/.test(env.STRIPE_SECRET_KEY ?? "")
                  ? "Live mode"
                  : "Test mode"
                : "Missing"
            }
            ok={features.billing}
          />
          <Row
            label="Image storage (S3)"
            value={features.s3Storage ? "Connected" : "Local disk"}
            ok={features.s3Storage}
          />
          <Row
            label="Email (Resend)"
            value={features.email ? "Connected" : "Not set"}
            ok={features.email}
          />
          <Row
            label="Google login"
            value={features.googleOAuth ? "On" : "Off"}
            ok={features.googleOAuth}
          />
          <Row
            label="Facebook login"
            value={features.facebookOAuth ? "On" : "Off"}
            ok={features.facebookOAuth}
          />
          <Row
            label="Admins"
            value={`${env.ADMIN_EMAILS.length} email(s)`}
            ok={env.ADMIN_EMAILS.length > 0}
          />
        </ul>
      </section>
    </div>
  );
}
