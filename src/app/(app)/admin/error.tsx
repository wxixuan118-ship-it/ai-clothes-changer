"use client";

import * as React from "react";

// Admin-only error boundary: unlike the public one it shows the technical
// details, so a failing admin page can be diagnosed without server logs.
// Browser-side errors carry their real message; server-side errors only a
// digest that matches the runtime log line.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="space-y-3 rounded-[20px] border border-red-400 p-5 text-sm"
    >
      <p className="font-medium text-red-300">This admin page crashed</p>
      <dl className="grid gap-1 text-[var(--muted-ink)] sm:grid-cols-[110px_1fr]">
        <dt>Where</dt>
        <dd>{error.digest ? "Server (see runtime logs)" : "Browser"}</dd>
        <dt>Message</dt>
        <dd className="break-words text-[var(--ink)]">
          {error.name}: {error.message}
        </dd>
        {error.digest ? (
          <>
            <dt>Digest</dt>
            <dd className="font-mono">{error.digest}</dd>
          </>
        ) : null}
        <dt>Page</dt>
        <dd className="break-words">
          {typeof window === "undefined" ? "" : window.location.pathname}
        </dd>
      </dl>
      <button
        type="button"
        onClick={reset}
        className="pill pill-brand px-5 py-2"
      >
        Try again
      </button>
    </div>
  );
}
