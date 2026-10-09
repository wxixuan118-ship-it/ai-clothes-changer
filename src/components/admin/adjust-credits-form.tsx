"use client";

import * as React from "react";

import { toast } from "sonner";

import {
  adjustCreditsAction,
  type AdminActionResult,
} from "@/app/(app)/admin/actions";
import { BusyButton } from "@/components/busy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AdminActionResult = { ok: true };

export function AdjustCreditsForm({ userId }: { userId: string }) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [state, action, pending] = React.useActionState(
    adjustCreditsAction,
    initial,
  );
  React.useEffect(() => {
    if (state === initial || !state.message) return;
    if (state.ok) {
      toast.success(state.message);
      formRef.current?.reset();
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      className="grid gap-3 sm:grid-cols-[140px_1fr_auto] sm:items-end"
    >
      <input type="hidden" name="userId" value={userId} />
      <div className="grid gap-1.5">
        <Label htmlFor="adjust-amount">Credits (+/−)</Label>
        <Input
          id="adjust-amount"
          name="amount"
          type="number"
          step={1}
          placeholder="e.g. 20 or -5"
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="adjust-reason">Reason (kept in the ledger)</Label>
        <Input
          id="adjust-reason"
          name="reason"
          maxLength={150}
          placeholder="e.g. compensation for failed run"
          required
        />
      </div>
      <BusyButton
        type="submit"
        busy={pending}
        busyLabel="Saving…"
        className="rounded-full"
      >
        Apply
      </BusyButton>
    </form>
  );
}
