"use client";

import * as React from "react";

import { toast } from "sonner";

import {
  setProviderEnabledAction,
  type AdminActionResult,
} from "@/app/(app)/admin/actions";
import { BusyButton } from "@/components/busy-button";

const initial: AdminActionResult = { ok: true };

export function ProviderToggle({
  provider,
  enabled,
  label,
}: {
  provider: string;
  enabled: boolean;
  label: string;
}) {
  const [state, action, pending] = React.useActionState(
    setProviderEnabledAction,
    initial,
  );
  React.useEffect(() => {
    if (state === initial || !state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          enabled &&
          !window.confirm(
            `Switch ${label} off? Its models stop being used right away.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="provider" value={provider} />
      <input type="hidden" name="state" value={enabled ? "off" : "on"} />
      <BusyButton
        type="submit"
        size="sm"
        variant={enabled ? "outline" : "default"}
        busy={pending}
        busyLabel="Saving…"
        className="rounded-full"
      >
        {enabled ? "Turn off" : "Turn on"}
      </BusyButton>
    </form>
  );
}
