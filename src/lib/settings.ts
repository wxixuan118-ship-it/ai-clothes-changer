import { z } from "zod";

import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { env, features } from "@/lib/env";

// Runtime settings editable in /admin. Every key has a schema; unknown keys
// and invalid values are ignored on read and rejected on write. All rows
// are cached together for a short TTL per instance.

export type ModelProvider = "nbility" | "kie" | "dashscope";

/** Image providers, in fallback order when the chosen one is unusable. */
export const PROVIDERS = [
  {
    id: "nbility",
    label: "Nbility",
    envKey: "NBILITY_API_KEY",
    console: "https://nbility.ai/console",
  },
  {
    id: "kie",
    label: "kie.ai",
    envKey: "KIE_API_KEY",
    console: "https://kie.ai/logs",
  },
  {
    id: "dashscope",
    label: "Alibaba DashScope",
    envKey: "DASHSCOPE_API_KEY",
    console: "https://modelstudio.console.alibabacloud.com",
  },
] as const satisfies readonly {
  id: ModelProvider;
  label: string;
  envKey: string;
  console: string;
}[];

/**
 * Image-editing models the admin can pick. `cost` is the provider's list
 * price per image — used only for the admin spend estimate. The first
 * model of each provider is that provider's default.
 */
export const EDIT_MODELS = [
  {
    id: "gpt-image-2",
    provider: "nbility",
    label: "GPT Image 2",
    note: "≈ ¥0.02/image (image group) · strongest edits · 30–90s",
    cost: { amount: 0.02, currency: "CNY" },
  },
  {
    id: "seedream/5-flash-image-to-image",
    provider: "kie",
    label: "Seedream 5.0 Flash",
    note: "≈ $0.016/image (3.24 kie credits) · 2K · fast",
    cost: { amount: 0.0162, currency: "USD" },
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

/** The provider has an API key in the environment. */
export function isProviderConfigured(provider: ModelProvider): boolean {
  return features[provider];
}

const onOff = z.enum(["on", "off"]);
const schemas = {
  ai_edit_model: z.enum(
    EDIT_MODELS.map((model) => model.id) as [string, ...string[]],
  ),
  provider_nbility: onOff,
  provider_kie: onOff,
  provider_dashscope: onOff,
} as const;

export type SettingKey = keyof typeof schemas;

const TTL_MS = 30_000;
let cache: { values: Map<string, string>; at: number } | null = null;

async function allSettings(): Promise<Map<string, string>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.values;
  const rows = await db
    .select({ key: appSettings.key, value: appSettings.value })
    .from(appSettings);
  cache = {
    values: new Map(rows.map((r) => [r.key, r.value])),
    at: Date.now(),
  };
  return cache.values;
}

export async function getSetting(key: SettingKey): Promise<string | null> {
  const raw = (await allSettings()).get(key);
  const parsed = raw === undefined ? null : schemas[key].safeParse(raw);
  return parsed?.success ? parsed.data : null;
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
  cache = null;
}

/** Admin on/off switch (default on). */
export async function isProviderEnabled(
  provider: ModelProvider,
): Promise<boolean> {
  return (await getSetting(`provider_${provider}`)) !== "off";
}

/** Has a key AND is switched on. */
export async function isProviderUsable(
  provider: ModelProvider,
): Promise<boolean> {
  return isProviderConfigured(provider) && (await isProviderEnabled(provider));
}

function defaultModelOf(provider: ModelProvider): string {
  if (provider === "dashscope") return env.AI_EDIT_MODEL;
  return EDIT_MODELS.find((model) => model.provider === provider)!.id;
}

/**
 * The model to use now: the admin's choice when its provider is usable,
 * else the default model of the first usable provider (PROVIDERS order).
 * null = every provider is missing a key or switched off.
 */
export async function getEditModel(): Promise<string | null> {
  const chosen = await getSetting("ai_edit_model");
  if (chosen && (await isProviderUsable(providerOf(chosen)))) return chosen;
  for (const provider of PROVIDERS) {
    if (await isProviderUsable(provider.id)) return defaultModelOf(provider.id);
  }
  return null;
}
