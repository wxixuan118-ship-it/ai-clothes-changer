"use client";

import * as React from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { generatePresetPreviewAction } from "@/app/(app)/admin/actions";
import { BusyButton } from "@/components/busy-button";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  name: string;
  category: string;
  tint: string;
  version: number | null;
};

const CONCURRENCY = 3;

export function PresetPreviews({
  items,
  categories,
  canGenerate,
}: {
  items: Item[];
  categories: readonly string[];
  canGenerate: boolean;
}) {
  const router = useRouter();
  const [running, setRunning] = React.useState<Set<string>>(new Set());
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [batch, setBatch] = React.useState<{
    done: number;
    total: number;
  } | null>(null);

  async function generate(id: string): Promise<boolean> {
    setRunning((current) => new Set(current).add(id));
    setErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    const result = await generatePresetPreviewAction(id).catch((error) => ({
      ok: false,
      message: error instanceof Error ? error.message : "Request failed",
    }));
    setRunning((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    if (!result.ok) {
      setErrors((current) => ({
        ...current,
        [id]: result.message ?? "Failed",
      }));
    }
    return result.ok;
  }

  async function generateOne(id: string) {
    const ok = await generate(id);
    if (ok) toast.success("Preview ready.");
    router.refresh();
  }

  async function generateMissing() {
    const queue = items
      .filter((item) => item.version === null)
      .map((i) => i.id);
    if (queue.length === 0) return;
    setBatch({ done: 0, total: queue.length });
    let failed = 0;
    const worker = async () => {
      for (let id = queue.shift(); id; id = queue.shift()) {
        if (!(await generate(id))) failed++;
        setBatch((b) => (b ? { ...b, done: b.done + 1 } : b));
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    setBatch(null);
    router.refresh();
    if (failed) toast.error(`${failed} preview(s) failed — see the red notes.`);
    else toast.success("All previews generated.");
  }

  const missing = items.filter((item) => item.version === null).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <BusyButton
          type="button"
          busy={batch !== null}
          busyLabel={
            batch ? `Generating ${batch.done}/${batch.total}…` : "Generating…"
          }
          disabled={!canGenerate || missing === 0}
          onClick={generateMissing}
          className="rounded-full"
        >
          {missing
            ? `Generate ${missing} missing previews`
            : "All previews ready"}
        </BusyButton>
        <p className="text-sm text-[var(--muted-ink)]">
          {items.length - missing}/{items.length} ready · keep this tab open
          while it runs (about 20–60s per image, {CONCURRENCY} at a time).
        </p>
      </div>

      {categories.map((category) => (
        <section key={category} className="space-y-2">
          <h3 className="text-sm text-[var(--muted-ink)]">{category}</h3>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {items
              .filter((item) => item.category === category)
              .map((item) => {
                const busy = running.has(item.id);
                return (
                  <li
                    key={item.id}
                    className="overflow-hidden rounded-[16px] border bg-[var(--paper-2)]"
                  >
                    <div
                      className="relative aspect-[3/4]"
                      style={{ background: item.tint }}
                    >
                      {item.version !== null ? (
                        // eslint-disable-next-line @next/next/no-img-element -- small stored JPEG
                        <img
                          src={`/api/preset-previews/hair/${item.id}?v=${item.version}`}
                          alt={item.name}
                          className={cn(
                            "absolute inset-0 size-full object-cover",
                            busy && "opacity-40",
                          )}
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-xs text-[var(--ink-deep)]">
                          {busy ? "Generating…" : "No preview"}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 p-2.5">
                      <p className="truncate text-sm">{item.name}</p>
                      {errors[item.id] ? (
                        <p className="text-xs break-words text-red-300">
                          {errors[item.id]}
                        </p>
                      ) : null}
                      <BusyButton
                        type="button"
                        size="sm"
                        variant="outline"
                        busy={busy}
                        busyLabel="Generating…"
                        disabled={!canGenerate || batch !== null}
                        onClick={() => generateOne(item.id)}
                        className="w-full rounded-full"
                      >
                        {item.version !== null ? "Regenerate" : "Generate"}
                      </BusyButton>
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
