"use client";

import * as React from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  generateBaseModelAction,
  generatePresetPreviewAction,
} from "@/app/(app)/admin/actions";
import { BusyButton } from "@/components/busy-button";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  name: string;
  gender: "female" | "male";
  category: string;
  tint: string;
  version: number | null;
};

const CONCURRENCY = 3;

type Base = {
  gender: "female" | "male";
  label: string;
  version: number | null;
};

export function PresetPreviews({
  items,
  groups,
  bases,
  canGenerate,
}: {
  items: Item[];
  /** Sections in display order: gender + its categories. */
  groups: {
    gender: "female" | "male";
    label: string;
    categories: readonly string[];
  }[];
  bases: Base[];
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

  async function generateBase(gender: "female" | "male") {
    const id = `_base-${gender}`;
    setRunning((current) => new Set(current).add(id));
    const result = await generateBaseModelAction(gender).catch((error) => ({
      ok: false,
      message: error instanceof Error ? error.message : "Request failed",
    }));
    setRunning((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    if (result.ok) {
      toast.success("Model photo ready — regenerate the previews to use it.");
    } else {
      setErrors((current) => ({
        ...current,
        [id]: result.message ?? "Failed",
      }));
    }
    router.refresh();
  }

  async function generateMissing(all = false) {
    const queue = items
      .filter((item) => all || item.version === null)
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
          onClick={() => generateMissing()}
          className="rounded-full"
        >
          {missing
            ? `Generate ${missing} missing previews`
            : "All previews ready"}
        </BusyButton>
        <BusyButton
          type="button"
          variant="outline"
          busy={false}
          busyLabel=""
          disabled={!canGenerate || batch !== null}
          onClick={() => {
            if (
              window.confirm(
                `Regenerate all ${items.length} previews? That is ${items.length} new images.`,
              )
            ) {
              void generateMissing(true);
            }
          }}
          className="rounded-full"
        >
          Regenerate all
        </BusyButton>
        <p className="text-sm text-[var(--muted-ink)]">
          {items.length - missing}/{items.length} ready · keep this tab open
          while it runs (about 20–60s per image, {CONCURRENCY} at a time).
        </p>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm text-[var(--muted-ink)]">
          Model photos — every preview is this person with a new haircut
        </h3>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {bases.map((base) => {
            const id = `_base-${base.gender}`;
            const busy = running.has(id);
            return (
              <li
                key={id}
                className="overflow-hidden rounded-[16px] border border-[var(--brand)] bg-[var(--paper-2)]"
              >
                <div className="relative aspect-[3/4] bg-[var(--canvas)]">
                  {base.version !== null ? (
                    // eslint-disable-next-line @next/next/no-img-element -- small stored JPEG
                    <img
                      src={`/api/preset-previews/hair/${id}?v=${base.version}`}
                      alt={`${base.label} model`}
                      className={cn(
                        "absolute inset-0 size-full object-cover",
                        busy && "opacity-40",
                      )}
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center p-2 text-center text-xs text-[var(--muted-ink)]">
                      {busy
                        ? "Generating…"
                        : "Made automatically with the first preview"}
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-2.5">
                  <p className="truncate text-sm">{base.label} model</p>
                  {errors[id] ? (
                    <p className="text-xs break-words text-red-300">
                      {errors[id]}
                    </p>
                  ) : null}
                  <BusyButton
                    type="button"
                    size="sm"
                    variant="outline"
                    busy={busy}
                    busyLabel="Generating…"
                    disabled={!canGenerate || batch !== null}
                    onClick={() => generateBase(base.gender)}
                    className="w-full rounded-full"
                  >
                    {base.version !== null ? "New model" : "Generate"}
                  </BusyButton>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {groups.map((group) => (
        <div key={group.gender} className="space-y-4">
          <h3 className="font-sans text-base font-medium tracking-normal">
            {group.label}
          </h3>
          {group.categories.map((category) => (
            <section key={category} className="space-y-2">
              <h3 className="text-sm text-[var(--muted-ink)]">{category}</h3>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {items
                  .filter(
                    (item) =>
                      item.gender === group.gender &&
                      item.category === category,
                  )
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
      ))}
    </div>
  );
}
