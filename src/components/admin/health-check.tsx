"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { BusyButton } from "@/components/busy-button";

/** Re-runs the server-side provider check by refreshing the page. */
export function RecheckButton() {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  return (
    <BusyButton
      type="button"
      variant="outline"
      busy={pending}
      busyLabel="Checking…"
      className="rounded-full"
      onClick={() => startTransition(() => router.refresh())}
    >
      Check again
    </BusyButton>
  );
}
