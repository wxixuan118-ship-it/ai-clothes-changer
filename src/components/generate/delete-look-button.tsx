"use client";

import * as React from "react";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { deleteGenerationAction } from "@/app/(app)/generate/actions";

export function DeleteLookButton({ id, label }: { id: string; label: string }) {
  const [pending, startTransition] = React.useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={`Delete ${label}`}
      onClick={() => {
        if (!window.confirm("Delete this look? This can't be undone.")) return;
        startTransition(async () => {
          const result = await deleteGenerationAction(id);
          if (result.ok) toast.success("Look deleted.");
          else toast.error("Couldn't delete that look — try again.");
        });
      }}
      className="flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--muted-ink)] transition-colors hover:bg-[color-mix(in_oklch,var(--ink),transparent_90%)] hover:text-[var(--ink)] disabled:opacity-50"
    >
      <Trash2Icon className="size-4" aria-hidden />
    </button>
  );
}
