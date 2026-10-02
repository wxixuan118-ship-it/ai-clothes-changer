import type { Metadata } from "next";
import Link from "next/link";

import { redirect } from "next/navigation";

import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { SignupForm } from "@/components/auth/signup-form";
import { WELCOME_CREDITS } from "@/config/plans";
import { getSession } from "@/lib/auth/session";
import { features } from "@/lib/env";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next, "/generate");
  // Already signed in: skip the form (e.g. a pricing CTA for a member).
  if (await getSession()) redirect(next);

  return (
    <div className="grid gap-6">
      <div>
        <p className="eyebrow">Create account</p>
        <h1 className="mt-2 text-2xl">
          Start with {WELCOME_CREDITS} free credits
        </h1>
      </div>
      <OAuthButtons
        google={features.googleOAuth}
        github={features.githubOAuth}
        next={next}
      />
      <SignupForm requiresVerification={features.email} next={next} />
      <p className="text-sm text-muted-foreground">
        Already registered?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="link-pop"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
