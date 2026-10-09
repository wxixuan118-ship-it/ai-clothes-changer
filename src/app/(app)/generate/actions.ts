"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { GENERATION_COST_CREDITS } from "@/config/plans";
import { getHairPreset } from "@/config/hairstyles";
import { getStylePreset } from "@/config/styles";
import { db } from "@/db";
import { generations } from "@/db/schema";
import {
  getImageProvider,
  type GarmentType,
  type InputImage,
} from "@/lib/ai/provider";
import { deleteStoredImage, storeGeneratedImage } from "@/lib/ai/storage";
import { getSession, requireSession } from "@/lib/auth/session";
import {
  InsufficientCreditsError,
  hasPurchasedCredits,
  refundCredits,
  spendCredits,
} from "@/lib/credits";
import { ContentBlockedError, ProviderBusyError } from "@/lib/ai/errors";
import { hasPaidPlan } from "@/lib/entitlements";
import { env, features } from "@/lib/env";
import { screenPrompt } from "@/lib/moderation";
import { limitGeneration } from "@/lib/rate-limit";
import { getEditModel } from "@/lib/settings";

const promptSchema = z
  .string()
  .trim()
  .min(3, "Prompt must be at least 3 characters")
  .max(300, "Prompt must be at most 300 characters");

// "garment" (clothes) and "reference" (hair) both mean "use the uploaded
// reference photo".
const modeSchema = z.enum(["garment", "reference", "prompt", "style"]);
const toolSchema = z.enum(["clothes", "hair"]);

// Only the hair may change; everything else is the user's.
const KEEP_FOR_HAIR =
  "Keep the face, facial features, skin, makeup, expression, head shape, clothing, background, and lighting unchanged. Make the hairline and hair texture look natural.";
const garmentTypeSchema = z.enum(["top", "bottom", "dress", "full"]);

/**
 * Per-photo backstop. The form downscales to ≤1600px JPEG (~0.3–2MB), so two
 * photos stay well inside serverActions.bodySizeLimit (next.config.ts) and
 * the proxy's 10MB body cap.
 */
const MAX_PHOTO_BYTES = 3.5 * 1024 * 1024;

/** Real format from the file's leading bytes — never the client's label. */
function sniffImageType(bytes: Buffer): string | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

const garmentLabels: Record<GarmentType, string> = {
  top: "top",
  bottom: "bottom",
  dress: "dress",
  full: "full outfit",
};

export type GenerateResult = {
  ok: boolean;
  /** Set on success — the stored image and its history label. */
  result?: {
    imageUrl: string;
    label: string;
    /** May be shown/downloaded without the watermark. */
    watermarkFree: boolean;
  };
  error?:
    | "invalid_photo"
    | "invalid_garment"
    | "invalid_prompt"
    | "invalid_style"
    | "unauthenticated"
    /** Hard block (undress, nudity, sexual, minors) — no credit spent. */
    | "blocked_prompt"
    /** Not supported yet (swimwear, lingerie, suggestive wording). */
    | "unsupported_prompt"
    /** The provider's safety check refused the photo or result — refunded. */
    | "blocked_result"
    /** Non-Latin script in the description — the tools are English-only. */
    | "english_only"
    /** No image provider is configured — nothing is spent. */
    | "unavailable"
    /** Provider throttled us after retries — refunded. */
    | "provider_busy"
    | "rate_limited"
    | "insufficient_credits"
    | "generation_failed";
};

async function readPhoto(value: FormDataEntryValue | null) {
  if (!(value instanceof File)) return null;
  if (value.size === 0 || value.size > MAX_PHOTO_BYTES) return null;
  const bytes = Buffer.from(await value.arrayBuffer());
  const mediaType = sniffImageType(bytes);
  if (!mediaType) return null;
  const image: InputImage = { bytes, mediaType };
  return image;
}

type ChangeRequest = {
  /** What the history grid shows. */
  label: string;
  /** What the model receives. */
  instruction: string;
  task: "clothes" | "hair";
  /** The user's own words (prompt mode) — screened before any spend. */
  userText?: string;
  personImage: InputImage;
  referenceImage?: InputImage;
  garmentType?: GarmentType;
};

async function parseHairRequest(
  formData: FormData,
  mode: z.infer<typeof modeSchema>,
  personImage: InputImage,
): Promise<ChangeRequest | NonNullable<GenerateResult["error"]>> {
  if (mode === "reference" || mode === "garment") {
    const referenceImage = await readPhoto(formData.get("referenceImage"));
    if (!referenceImage) return "invalid_garment";
    return {
      task: "hair",
      label: "Hairstyle photo",
      instruction: `Give the person the hairstyle shown in the reference photo — same cut, length, texture, and color. ${KEEP_FOR_HAIR}`,
      personImage,
      referenceImage,
    };
  }
  if (mode === "style") {
    const preset = getHairPreset(String(formData.get("styleId") ?? ""));
    if (!preset) return "invalid_style";
    return {
      task: "hair",
      label: `Hairstyle · ${preset.name}`,
      instruction: `Change only the person's hair to ${preset.prompt}. ${KEEP_FOR_HAIR}`,
      personImage,
    };
  }
  const prompt = promptSchema.safeParse(formData.get("prompt"));
  if (!prompt.success) return "invalid_prompt";
  return {
    task: "hair",
    label: prompt.data,
    userText: prompt.data,
    instruction: `Change only the person's hair to: ${prompt.data}. ${KEEP_FOR_HAIR}`,
    personImage,
  };
}

async function parseChangeRequest(
  formData: FormData,
): Promise<ChangeRequest | NonNullable<GenerateResult["error"]>> {
  const personImage = await readPhoto(formData.get("personImage"));
  if (!personImage) return "invalid_photo";

  const mode = modeSchema.safeParse(formData.get("mode") ?? "prompt");
  if (!mode.success) return "invalid_prompt";
  const tool = toolSchema.safeParse(formData.get("tool") ?? "clothes");
  if (!tool.success) return "invalid_prompt";

  if (tool.data === "hair") {
    return parseHairRequest(formData, mode.data, personImage);
  }

  if (mode.data === "garment" || mode.data === "reference") {
    const garmentImage = await readPhoto(formData.get("garmentImage"));
    if (!garmentImage) return "invalid_garment";
    const type = garmentTypeSchema.safeParse(
      formData.get("garmentType") ?? "full",
    );
    const garmentType = type.success ? type.data : "full";
    return {
      task: "clothes",
      label: `Garment photo · ${garmentLabels[garmentType]}`,
      instruction: `Dress the person in the ${garmentLabels[garmentType]} shown in the garment reference photo. Keep face, hair, pose, body shape, background, and lighting unchanged.`,
      personImage,
      referenceImage: garmentImage,
      garmentType,
    };
  }

  if (mode.data === "style") {
    const preset = getStylePreset(String(formData.get("styleId") ?? ""));
    if (!preset) return "invalid_style";
    return {
      task: "clothes",
      label: `Style · ${preset.name}`,
      instruction: `Change the person's outfit to ${preset.prompt}. Keep face, hair, pose, body shape, background, and lighting unchanged.`,
      personImage,
    };
  }

  const prompt = promptSchema.safeParse(formData.get("prompt"));
  if (!prompt.success) return "invalid_prompt";
  return {
    task: "clothes",
    label: prompt.data,
    userText: prompt.data,
    instruction: `Change the person's outfit to: ${prompt.data}. Keep face, hair, pose, body shape, background, and lighting unchanged.`,
    personImage,
  };
}

// Money-flow order (F4): create the generation record FIRST so the spend
// ref exists before money moves — no orphaned spends. Spend BEFORE the
// provider call; refund on any failure after the spend. Both credit
// mutations are idempotent on the generation id.
//
// (prevState, formData) signature: passed to useActionState directly, so
// the form keeps working before hydration (progressive enhancement).
export async function generateImageAction(
  _prevState: GenerateResult,
  formData: FormData,
): Promise<GenerateResult> {
  // A structured error, not requireSession()'s redirect: the home page can
  // then reopen its sign-in dialog without losing the visitor's photo.
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "unauthenticated" };
  }

  const request = await parseChangeRequest(formData);
  if (typeof request === "string") {
    return { ok: false, error: request };
  }

  // Content screen before rate limit, record, or spend: a blocked request
  // leaves no trace in the ledger. Log the rule only, never the text.
  if (request.userText) {
    const verdict = screenPrompt(request.userText, request.task);
    if (verdict) {
      console.warn(
        `[safety] prompt blocked user=${session.user.id} tool=${request.task} rule=${verdict.rule} severity=${verdict.severity}`,
      );
      return {
        ok: false,
        error:
          verdict.severity === "hard"
            ? "blocked_prompt"
            : verdict.rule === "script"
              ? "english_only"
              : "unsupported_prompt",
      };
    }
  }

  // Without a real provider every run would spend and refund — say so
  // instead, before touching the ledger.
  if (!features.imageEditing) {
    return { ok: false, error: "unavailable" };
  }

  const limit = await limitGeneration(session.user.id);
  if (!limit.success) {
    return { ok: false, error: "rate_limited" };
  }

  const provider = getImageProvider();
  // Resolved once so the record, the provider call and admin stats agree.
  // null = an admin switched every provider off.
  const model = env.AI_MOCK ? provider.modelId : await getEditModel();
  if (!model) {
    return { ok: false, error: "unavailable" };
  }
  const [generation] = await db
    .insert(generations)
    .values({
      userId: session.user.id,
      prompt: request.label,
      model,
    })
    .returning({ id: generations.id });
  if (!generation) {
    throw new Error("generate: failed to create the generation record");
  }
  const ref = { type: "generation", id: generation.id };

  try {
    await spendCredits({
      userId: session.user.id,
      amount: GENERATION_COST_CREDITS,
      ref,
    });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      // No money moved — remove the never-started record entirely so
      // nothing is left pending. (generations is not the ledger; deletes
      // are fine here.)
      await db.delete(generations).where(eq(generations.id, generation.id));
      // The client's balance is stale if we got here — refresh it.
      revalidatePath("/", "layout");
      return { ok: false, error: "insufficient_credits" };
    }
    // Unknown failure: the spend may have committed even though we saw an
    // error (lost commit-ack). Keep the pending row — a pending record with
    // a spend_{id} and no refund_{id} is the detectable reconciliation
    // signal; deleting it would orphan the charge.
    throw error;
  }

  // Paid plan, or credits the user bought → this result may be downloaded
  // without the watermark (free sign-up credits alone don't qualify).
  const watermarkFree =
    (await hasPaidPlan(session.user.id)) ||
    (await hasPurchasedCredits(session.user.id));

  let storedUrl: string;
  try {
    const image = await provider.generateImage({
      prompt: request.instruction,
      userId: session.user.id,
      task: request.task,
      personImage: request.personImage,
      referenceImage: request.referenceImage,
      garmentType: request.garmentType,
      model,
    });
    // Stored clean; /api/images adds the watermark when serving to anyone
    // not entitled to the clean file (pricing promise for free results).
    storedUrl = await storeGeneratedImage({
      generationId: generation.id,
      url: image.url,
    });
    await db
      .update(generations)
      .set({
        imageUrl: storedUrl,
        status: "completed",
        model: image.model,
        completedAt: new Date(),
        watermarkFree,
      })
      .where(eq(generations.id, generation.id));
  } catch (error) {
    console.error(
      "[generate] provider/storage failed:",
      error instanceof Error ? error.message : error,
    );
    // Shown in /admin → Generations. Codes for known cases, else the
    // (secret-free) error message, truncated.
    const failureReason =
      error instanceof ContentBlockedError
        ? `blocked: ${error.code}`
        : error instanceof ProviderBusyError
          ? `busy: ${error.code}`
          : (error instanceof Error ? error.message : String(error)).slice(
              0,
              300,
            );
    try {
      await refundCredits({ userId: session.user.id, ref });
    } catch (refundError) {
      // Do NOT tell the user they were refunded — they weren't. Mark the
      // row failed so nothing dangles as pending, log the reconciliation
      // signal, and surface a real error. refundCredits is idempotent, so
      // a retry heals this.
      console.error(
        `[generate] REFUND FAILED for generation ${generation.id} — spend_${generation.id} has no matching refund; manual reconciliation or retry needed:`,
        refundError instanceof Error ? refundError.message : refundError,
      );
      await db
        .update(generations)
        .set({
          status: "failed",
          failureReason: `refund failed — ${failureReason}`,
          completedAt: new Date(),
        })
        .where(eq(generations.id, generation.id));
      throw refundError;
    }
    await db
      .update(generations)
      .set({ status: "failed", failureReason, completedAt: new Date() })
      .where(eq(generations.id, generation.id));
    revalidatePath("/", "layout");
    if (error instanceof ProviderBusyError) {
      return { ok: false, error: "provider_busy" };
    }
    if (error instanceof ContentBlockedError) {
      console.warn(
        `[safety] provider blocked user=${session.user.id} tool=${request.task} code=${error.code}`,
      );
      return { ok: false, error: "blocked_result" };
    }
    return { ok: false, error: "generation_failed" };
  }

  revalidatePath("/", "layout");
  return {
    ok: true,
    result: { imageUrl: storedUrl, label: request.label, watermarkFree },
  };
}

/**
 * Deletes one finished result: the stored image and its history row. Pending
 * rows stay — "pending + spend without refund" is the reconciliation signal.
 * Ledger rows are untouched (they reference the id as plain text).
 */
export async function deleteGenerationAction(
  generationId: string,
): Promise<{ ok: boolean }> {
  const session = await requireSession();
  const id = z.uuid().safeParse(generationId);
  if (!id.success) return { ok: false };

  const [row] = await db
    .delete(generations)
    .where(
      and(
        eq(generations.id, id.data),
        eq(generations.userId, session.user.id),
        ne(generations.status, "pending"),
      ),
    )
    .returning({ imageUrl: generations.imageUrl });
  if (!row) return { ok: false };

  if (row.imageUrl) {
    await deleteStoredImage(row.imageUrl).catch((error: unknown) => {
      console.error(
        "[generate] stored image delete failed:",
        error instanceof Error ? error.message : error,
      );
    });
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
