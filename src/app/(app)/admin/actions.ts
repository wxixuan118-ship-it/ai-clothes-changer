"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin/auth";
import { adjustCredits, InsufficientCreditsError } from "@/lib/credits";
import { setSetting } from "@/lib/settings";

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
  try {
    await setSetting("ai_edit_model", model, admin.user.email);
  } catch {
    return { ok: false, message: "Unknown model." };
  }
  revalidatePath("/admin/settings");
  return { ok: true, message: `Model switched to ${model}.` };
}
