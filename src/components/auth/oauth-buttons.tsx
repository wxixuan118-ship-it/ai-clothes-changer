"use client";

import * as React from "react";

import { toast } from "sonner";

import { socialLabels, type SocialProvider } from "@/config/social";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

// Brand marks are inline SVGs: lucide-react dropped brand icons, and
// DESIGN.md's lucide-only rule is about UI glyphs, not provider logos.

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
      />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.72-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"
      />
    </svg>
  );
}

const marks: Record<SocialProvider, () => React.ReactElement> = {
  google: GoogleMark,
  facebook: FacebookMark,
  github: GitHubMark,
};

export function OAuthButtons({
  providers,
  next,
}: {
  /** Configured providers (features.socialProviders), in display order. */
  providers: readonly SocialProvider[];
  next: string;
}) {
  const [pending, setPending] = React.useState<SocialProvider | null>(null);

  async function signIn(provider: SocialProvider) {
    setPending(provider);
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: next,
    });
    if (error) {
      toast.error(error.message ?? "Sign-in failed");
      setPending(null);
    }
    // On success the browser navigates to the provider — no state to reset.
  }

  if (providers.length === 0) return null;

  return (
    <div className="grid gap-2">
      {providers.map((provider) => {
        const Mark = marks[provider];
        return (
          <Button
            key={provider}
            variant="outline"
            disabled={pending !== null}
            onClick={() => signIn(provider)}
          >
            <Mark />
            Continue with {socialLabels[provider]}
          </Button>
        );
      })}
    </div>
  );
}
