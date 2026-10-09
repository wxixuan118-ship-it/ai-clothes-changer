"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin/auth";
import { generateHairPreview } from "@/lib/ai/preset-preview";
import { adjustCredits, InsufficientCreditsError } from "@/lib/credits";
import {
  findModel,
  isProviderConfigured,
  isProviderEnabled,
  PROVIDERS,
  setSetting,
} from "@/lib/settings";

export type AdminActionResult = { ok: boolean; message?: string };

const adjustSchema = z.object({
  userId: z.string().min(1),
  amount: z.coerce
    .number()
    .int("Use a whole number")
    .refine((n) => n !== 0, "Amount can't be 0")
    .refine((n) => Math.abs(n) <= 100_000, "At most 100,000 at a time"),
  reason: z.string().trim().min(3, "Add a short reason").max(150),
});

export async function adjustCreditsAction(
  _prev: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = adjustSchema.safeParse({
    userId: formData.get("userId"),
    amount: formData.get("amount"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message };
  }
  const { userId, amount, reason } = parsed.data;
  try {
    await adjustCredits({
      userId,
      amount,
      note: `${admin.user.email}: ${reason}`,
    });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return { ok: false, message: "The user doesn't have that many credits." };
    }
    throw error;
  }
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin");
  return {
    ok: true,
    message: `${amount > 0 ? "Added" : "Removed"} ${Math.abs(amount)} credits.`,
  };
}

export async function setModelAction(
  _prev: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const model = String(formData.get("model") ?? "");
  const known = findModel(model);
  if (!known) return { ok: false, message: "Unknown model." };
  if (!isProviderConfigured(known.provider)) {
    return {
      ok: false,
      message: "That model's provider has no API key set yet.",
    };
  }
  if (!(await isProviderEnabled(known.provider))) {
    return {
      ok: false,
      message: "That provider is switched off — turn it on first.",
    };
  }
  await setSetting("ai_edit_model", model, admin.user.email);
  revalidatePath("/admin/ai");
  revalidatePath("/admin/settings");
  return { ok: true, message: `Now using ${known.label}.` };
}

const toggleSchema = z.object({
  provider: z.enum(PROVIDERS.map((p) => p.id) as [string, ...string[]]),
  state: z.enum(["on", "off"]),
});

/** Turns an image provider on or off for everyone (no redeploy). */
export async function setProviderEnabledAction(
  _prev: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const parsed = toggleSchema.safeParse({
    provider: formData.get("provider"),
    state: formData.get("state"),
  });
  if (!parsed.success) return { ok: false, message: "Invalid request." };
  const { provider, state } = parsed.data as {
    provider: (typeof PROVIDERS)[number]["id"];
    state: "on" | "off";
  };
  await setSetting(`provider_${provider}`, state, admin.user.email);
  revalidatePath("/admin/ai");
  revalidatePath("/admin/settings");
  const label = PROVIDERS.find((p) => p.id === provider)?.label ?? provider;
  return {
    ok: true,
    message: `${label} switched ${state}.`,
  };
}

/** Generates (or regenerates) one hairstyle preview image. */
export async function generatePresetPreviewAction(
  id: string,
): Promise<AdminActionResult> {
  await requireAdmin();
  try {
    const { provider } = await generateHairPreview(id);
    revalidatePath("/admin/presets");
    return { ok: true, message: `Preview ready (${provider}).` };
  } catch (error) {
    return {
      ok: false,
      message: (error instanceof Error ? error.message : String(error)).slice(
        0,
        300,
      ),
    };
  }
}
