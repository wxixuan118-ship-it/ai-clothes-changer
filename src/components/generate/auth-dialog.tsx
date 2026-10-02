"use client";

import * as React from "react";

import { LoginForm } from "@/components/auth/login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { SignupForm } from "@/components/auth/signup-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type AuthOptions = {
  google: boolean;
  github: boolean;
  /** Resend configured → email verification gates sign-up. */
  requiresVerification: boolean;
  magicLink: boolean;
  welcomeCredits: number;
};

// In-place sign-up for the home studio: the visitor's photo and outfit
// choice live in client state, so authenticating without navigating away
// lets the run continue the moment the account exists.
export function AuthDialog({
  open,
  onOpenChange,
  options,
  onAuthenticated,
  returnFocusRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: AuthOptions;
  onAuthenticated: () => void;
  /** The dialog has no trigger — say where keyboard focus goes on close. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const [view, setView] = React.useState<"signup" | "login">("signup");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[calc(100%-2rem)] rounded-[28px] border bg-[var(--paper-2)] p-6 sm:max-w-md sm:p-7"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef?.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {view === "signup"
              ? `Get ${options.welcomeCredits} free credits`
              : "Welcome back"}
          </DialogTitle>
          <DialogDescription>
            {view === "signup"
              ? "Create a free account to see your new look. Your photo and outfit stay selected in this tab."
              : "Log in to see your new look. Your photo and outfit stay selected in this tab."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5">
          {/* OAuth leaves the page, so the visitor re-picks their photo
              after returning — say so instead of promising otherwise. */}
          {options.google || options.github ? (
            <div className="grid gap-2">
              <OAuthButtons
                google={options.google}
                github={options.github}
                next="/#studio"
              />
              <p className="text-xs text-[var(--muted-ink)]">
                Continuing with a provider reloads the page — you&apos;ll re-add
                your photo.
              </p>
            </div>
          ) : null}
          {view === "signup" ? (
            <SignupForm
              requiresVerification={options.requiresVerification}
              onSuccess={onAuthenticated}
            />
          ) : (
            <LoginForm
              magicLink={options.magicLink}
              next="/"
              onSuccess={onAuthenticated}
            />
          )}
          <p className="text-sm text-[var(--muted-ink)]">
            {view === "signup" ? "Already have an account? " : "New here? "}
            <button
              type="button"
              onClick={() => setView(view === "signup" ? "login" : "signup")}
              className="text-[var(--ink)] underline underline-offset-4"
            >
              {view === "signup" ? "Log in" : "Create an account"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
