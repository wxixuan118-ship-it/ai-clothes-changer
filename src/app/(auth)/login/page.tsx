import type { Metadata } from "next";
import Link from "next/link";

import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { getSession } from "@/lib/auth/session";
import { features } from "@/lib/env";
import { safeNext as toSafeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Same-origin paths only — never redirect to a caller-supplied host.
  const safeNext = toSafeNext(next, "/dashboard");
  // Already signed in: skip the form.
  if (await getSession()) redirect(safeNext);

  return (
    <div className="grid gap-6">
      <div>
        <p className="eyebrow">Sign in</p>
        <h1 className="mt-2 text-2xl">Welcome back</h1>
      </div>
      <OAuthButtons providers={features.socialProviders} next={safeNext} />
      <LoginForm magicLink={features.email} next={safeNext} />
      <p className="text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(safeNext)}`}
          className="link-pop"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
