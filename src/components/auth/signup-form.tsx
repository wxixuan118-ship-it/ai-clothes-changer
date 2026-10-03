"use client";

import * as React from "react";

import { useRouter } from "next/navigation";
import { z } from "zod";

import { WELCOME_CREDITS } from "@/config/plans";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signupSchema = z.object({
  name: z.string().min(1, "Enter your name").max(100),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function SignupForm({
  requiresVerification,
  onSuccess,
  next = "/generate",
}: {
  requiresVerification: boolean;
  /** Stay on the page instead of navigating (home studio dialog). */
  onSuccess?: () => void;
  /** Where to go after sign-up — already validated by the page. */
  next?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [verifyNotice, setVerifyNotice] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const parsed = signupSchema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your input");
      return;
    }
    setPending(true);
    const { error: signUpError } = await authClient.signUp.email(parsed.data);
    if (signUpError) {
      const message = signUpError.message ?? "";
      setError(
        /exist|already/i.test(message)
          ? "That email already has an account — sign in instead."
          : /password/i.test(message)
            ? "That password is too easy to guess — use at least 8 characters."
            : message || "Sign-up failed — try again in a moment.",
      );
      setPending(false);
      return;
    }
    if (requiresVerification) {
      setVerifyNotice(true);
      return;
    }
    if (onSuccess) {
      onSuccess();
      return;
    }
    router.push(next as Parameters<typeof router.push>[0]);
    router.refresh();
  }

  // Verification gate + in-place flow: once the visitor clicks the link
  // (auto sign-in), this tab sees a session on its next focus/poll and the
  // run continues with the photo still in memory.
  React.useEffect(() => {
    if (!verifyNotice || !onSuccess) return;
    let done = false;
    const check = async () => {
      if (done) return;
      const { data } = await authClient.getSession();
      if (data?.session && !done) {
        done = true;
        onSuccess();
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    const timer = window.setInterval(check, 5000);
    return () => {
      done = true;
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(timer);
    };
  }, [verifyNotice, onSuccess]);

  if (verifyNotice) {
    return (
      <p className="text-sm text-muted-foreground">
        Almost there — check your inbox and click the verification link to
        activate your account. Your {WELCOME_CREDITS} welcome credits are
        already waiting.
        {onSuccess
          ? " Keep this tab open — your result starts as soon as you're verified."
          : null}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="signup-name">Name</Label>
        <Input
          id="signup-name"
          aria-describedby={error ? "signup-error" : undefined}
          aria-invalid={error ? true : undefined}
          name="name"
          autoComplete="name"
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          aria-describedby={error ? "signup-error" : undefined}
          aria-invalid={error ? true : undefined}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          aria-describedby={error ? "signup-error" : undefined}
          aria-invalid={error ? true : undefined}
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      {error ? (
        <p id="signup-error" role="alert" className="text-sm text-debit-text">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
