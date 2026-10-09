import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { env, features } from "@/lib/env";

// Runtime settings editable in /admin. Every key has a schema; unknown keys
// and invalid values are rejected. Values are cached briefly per instance.

export type ModelProvider = "dashscope" | "nbility";

/**
 * Image-editing models the admin can pick. `cost` is the provider's list
 * price per image — used only for the admin spend estimate.
 */
export const EDIT_MODELS = [
  {
    id: "gpt-image-2",
    provider: "nbility",
    label: "GPT Image 2 (Nbility)",
    note: "≈ ¥0.02/image (image group) · strongest edits · 30–90s",
    cost: { amount: 0.02, currency: "CNY" },
  },
  {
    id: "qwen-image-edit-plus",
    provider: "dashscope",
    label: "Qwen Image Edit Plus",
    note: "$0.03/image · 2 req/s · fast",
    cost: { amount: 0.03, currency: "USD" },
  },
  {
    id: "qwen-image-edit-plus-2025-12-15",
    provider: "dashscope",
    label: "Qwen Image Edit Plus (2025-12-15 snapshot)",
    note: "$0.03/image · newer snapshot, pinned",
    cost: { amount: 0.03, currency: "USD" },
  },
  {
    id: "qwen-image-edit-max",
    provider: "dashscope",
    label: "Qwen Image Edit Max",
    note: "$0.075/image · best Qwen quality · only 2 req/min",
    cost: { amount: 0.075, currency: "USD" },
  },
  {
    id: "qwen-image-edit",
    provider: "dashscope",
    label: "Qwen Image Edit",
    note: "$0.045/image · original model",
    cost: { amount: 0.045, currency: "USD" },
  },
] as const satisfies readonly {
  id: string;
  provider: ModelProvider;
  label: string;
  note: string;
  cost: { amount: number; currency: "CNY" | "USD" };
}[];

export type EditModel = (typeof EDIT_MODELS)[number];

export function findModel(id: string): EditModel | undefined {
  return EDIT_MODELS.find((model) => model.id === id);
}

/** Which provider serves a model id (unknown ids: DashScope, env-pinned). */
export function providerOf(id: string): ModelProvider {
  return findModel(id)?.provider ?? "dashscope";
}

export function isProviderConfigured(provider: ModelProvider): boolean {
  return provider === "nbility" ? features.nbility : features.dashscope;
}

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

/**
 * The model to use now: the admin setting (when its provider has a key),
 * else gpt-image-2 when Nbility is configured, else AI_EDIT_MODEL.
 */
export async function getEditModel(): Promise<string> {
  const chosen = await getSetting("ai_edit_model");
  if (chosen && isProviderConfigured(providerOf(chosen))) return chosen;
  if (features.nbility) return "gpt-image-2";
  return env.AI_EDIT_MODEL;
}
