"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { GENERATION_COST_CREDITS } from "@/config/plans";
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
  refundCredits,
  spendCredits,
} from "@/lib/credits";
import { limitGeneration } from "@/lib/rate-limit";

const promptSchema = z
  .string()
  .trim()
  .min(3, "Prompt must be at least 3 characters")
  .max(1000, "Prompt must be at most 1000 characters");

const modeSchema = z.enum(["garment", "prompt", "style"]);
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
  result?: { imageUrl: string; label: string };
  error?:
    | "invalid_photo"
    | "invalid_garment"
    | "invalid_prompt"
    | "invalid_style"
    | "unauthenticated"
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
  personImage: InputImage;
  garmentImage?: InputImage;
  garmentType?: GarmentType;
};

async function parseChangeRequest(
  formData: FormData,
): Promise<ChangeRequest | NonNullable<GenerateResult["error"]>> {
  const personImage = await readPhoto(formData.get("personImage"));
  if (!personImage) return "invalid_photo";

  const mode = modeSchema.safeParse(formData.get("mode") ?? "prompt");
  if (!mode.success) return "invalid_prompt";

  if (mode.data === "garment") {
    const garmentImage = await readPhoto(formData.get("garmentImage"));
    if (!garmentImage) return "invalid_garment";
    const type = garmentTypeSchema.safeParse(
      formData.get("garmentType") ?? "full",
    );
    const garmentType = type.success ? type.data : "full";
    return {
      label: `Garment photo · ${garmentLabels[garmentType]}`,
      instruction: `Dress the person in the ${garmentLabels[garmentType]} shown in the garment reference photo. Keep face, hair, pose, body shape, background, and lighting unchanged.`,
      personImage,
      garmentImage,
      garmentType,
    };
  }

  if (mode.data === "style") {
    const preset = getStylePreset(String(formData.get("styleId") ?? ""));
    if (!preset) return "invalid_style";
    return {
      label: `Style · ${preset.name}`,
      instruction: `Change the person's outfit to ${preset.prompt}. Keep face, hair, pose, body shape, background, and lighting unchanged.`,
      personImage,
    };
  }

  const prompt = promptSchema.safeParse(formData.get("prompt"));
  if (!prompt.success) return "invalid_prompt";
  return {
    label: prompt.data,
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

  const limit = await limitGeneration(session.user.id);
  if (!limit.success) {
    return { ok: false, error: "rate_limited" };
  }

  const provider = getImageProvider();
  const [generation] = await db
    .insert(generations)
    .values({
      userId: session.user.id,
      prompt: request.label,
      model: provider.modelId,
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

  let storedUrl: string;
  try {
    const image = await provider.generateImage({
      prompt: request.instruction,
      userId: session.user.id,
      personImage: request.personImage,
      garmentImage: request.garmentImage,
      garmentType: request.garmentType,
    });
    storedUrl = await storeGeneratedImage({
      generationId: generation.id,
      url: image.url,
    });
    await db
      .update(generations)
      .set({ imageUrl: storedUrl, status: "completed", model: image.model })
      .where(eq(generations.id, generation.id));
  } catch (error) {
    console.error(
      "[generate] provider/storage failed:",
      error instanceof Error ? error.message : error,
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
        .set({ status: "failed" })
        .where(eq(generations.id, generation.id));
      throw refundError;
    }
    await db
      .update(generations)
      .set({ status: "failed" })
      .where(eq(generations.id, generation.id));
    revalidatePath("/", "layout");
    return { ok: false, error: "generation_failed" };
  }

  revalidatePath("/", "layout");
  return { ok: true, result: { imageUrl: storedUrl, label: request.label } };
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
