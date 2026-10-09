import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { env } from "@/lib/env";

// Runtime settings editable in /admin. Every key has a schema; unknown keys
// and invalid values are rejected. Values are cached briefly per instance.

/** Image-editing models the provider supports (Alibaba Model Studio). */
export const EDIT_MODELS = [
  {
    id: "qwen-image-edit-plus",
    label: "Qwen Image Edit Plus",
    note: "$0.03/image · 2 req/s · recommended",
  },
  {
    id: "qwen-image-edit-plus-2025-12-15",
    label: "Qwen Image Edit Plus (2025-12-15 snapshot)",
    note: "$0.03/image · newer snapshot, pinned",
  },
  {
    id: "qwen-image-edit-max",
    label: "Qwen Image Edit Max",
    note: "$0.075/image · best quality · only 2 req/min",
  },
  {
    id: "qwen-image-edit",
    label: "Qwen Image Edit",
    note: "$0.045/image · original model",
  },
] as const;

const schemas = {
  ai_edit_model: z.enum(
    EDIT_MODELS.map((model) => model.id) as [string, ...string[]],
  ),
} as const;

export type SettingKey = keyof typeof schemas;

const TTL_MS = 30_000;
const cache = new Map<SettingKey, { value: string | null; at: number }>();

export async function getSetting(key: SettingKey): Promise<string | null> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  const [row] = await db
    .select({ value: appSettings.value })
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .limit(1);
  const parsed = row ? schemas[key].safeParse(row.value) : null;
  const value = parsed?.success ? parsed.data : null;
  cache.set(key, { value, at: Date.now() });
  return value;
}

export async function setSetting(
  key: SettingKey,
  value: string,
  updatedBy: string,
): Promise<void> {
  const parsed = schemas[key].parse(value);
  await db
    .insert(appSettings)
    .values({ key, value: parsed, updatedBy, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value: parsed, updatedBy, updatedAt: new Date() },
    });
  cache.delete(key);
}

/** The model to use now: admin setting, else AI_EDIT_MODEL env. */
export async function getEditModel(): Promise<string> {
  return (await getSetting("ai_edit_model")) ?? env.AI_EDIT_MODEL;
}
