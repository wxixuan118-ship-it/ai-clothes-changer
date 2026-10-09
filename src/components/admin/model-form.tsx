"use client";

import * as React from "react";

import { toast } from "sonner";

import {
  setModelAction,
  type AdminActionResult,
} from "@/app/(app)/admin/actions";
import { BusyButton } from "@/components/busy-button";
import { cn } from "@/lib/utils";

const initial: AdminActionResult = { ok: true };

export function ModelForm({
  models,
  current,
}: {
  models: readonly {
    id: string;
    label: string;
    note: string;
    disabled?: boolean;
    /** Why the option is disabled. */
    reason?: string;
  }[];
  current: string;
}) {
  const [state, action, pending] = React.useActionState(
    setModelAction,
    initial,
  );
  const [selected, setSelected] = React.useState(current);
  React.useEffect(() => {
    if (state === initial || !state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <fieldset className="grid gap-2">
        <legend className="sr-only">Image model</legend>
        {models.map((model) => (
          <label
            key={model.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-[14px] border p-3",
              model.disabled && "cursor-not-allowed opacity-50",
              selected === model.id &&
                "border-[var(--brand)] bg-[var(--brand-soft)]",
            )}
          >
            <input
              type="radio"
              name="model"
              value={model.id}
              checked={selected === model.id}
              disabled={model.disabled}
              onChange={() => setSelected(model.id)}
              className="mt-1 accent-[var(--brand)]"
            />
            <span>
              <span className="font-medium">{model.label}</span>
              <span className="ml-2 font-mono text-xs text-[var(--muted-ink)]">
                {model.id}
              </span>
              <span className="block text-sm text-[var(--muted-ink)]">
                {model.note}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      <BusyButton
        type="submit"
        busy={pending}
        busyLabel="Saving…"
        disabled={selected === current}
        className="rounded-full"
      >
        Save model
      </BusyButton>
    </form>
  );
}
