import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { del, put } from "@vercel/blob";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { generations } from "@/db/schema";
import { env, features } from "@/lib/env";

import { applyWatermark } from "./watermark";

// Persists a generated image and returns the durable URL for the
// generations record. Backends, in order: S3-compatible object storage
// (private objects, served to their owner by /api/images), Vercel Blob,
// then ./.generated on local disk (dev only — containers lose it).

const GENERATED_DIR = path.join(process.cwd(), ".generated");
const S3_PREFIX = "generations/";
const FETCH_TIMEOUT_MS = 30_000;
const MAX_RESULT_BYTES = 25 * 1024 * 1024;

let s3Client: S3Client | null = null;
function s3(): S3Client {
  s3Client ??= new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? "",
    },
  });
  return s3Client;
}

const extensionByMediaType: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

async function decodeImageUrl(
  url: string,
): Promise<{ bytes: Buffer; mediaType: string }> {
  if (url.startsWith("data:")) {
    const match = /^data:([^;,]+);base64,(.+)$/.exec(url);
    if (!match || !match[1] || !match[2]) {
      throw new Error("storage: malformed data URL from provider");
    }
    return { bytes: Buffer.from(match[2], "base64"), mediaType: match[1] };
  }
  // Provider result URLs (DashScope OSS, valid 24h): bounded in time and
  // size so a stalled or oversized download fails into the refund path.
  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(
      `storage: fetching provider image failed (${response.status})`,
    );
  }
  const mediaType =
    (response.headers.get("content-type") ?? "image/png")
      .split(";")[0]
      ?.trim() ?? "image/png";
  if (!mediaType.startsWith("image/")) {
    throw new Error(`storage: provider returned ${mediaType}, not an image`);
  }
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > MAX_RESULT_BYTES) {
    throw new Error(`storage: provider image too large (${declared} bytes)`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > MAX_RESULT_BYTES) {
    throw new Error(
      `storage: provider image too large (${bytes.length} bytes)`,
    );
  }
  return { bytes, mediaType };
}

export async function storeGeneratedImage({
  generationId,
  url,
  watermark,
}: {
  generationId: string;
  url: string;
  /** Burn this text into the image (free plan). */
  watermark?: string;
}): Promise<string> {
  const decoded = await decodeImageUrl(url);
  const { bytes, mediaType } = watermark
    ? await applyWatermark(decoded.bytes, watermark)
    : decoded;
  const extension = extensionByMediaType[mediaType] ?? "png";

  if (features.s3Storage) {
    const fileName = `${generationId}.${extension}`;
    // No ACL: objects stay private; the owner-checked route streams them.
    await s3().send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: `${S3_PREFIX}${fileName}`,
        Body: bytes,
        ContentType: mediaType,
      }),
    );
    return `/api/images/${fileName}`;
  }

  if (features.blobStorage) {
    const blob = await put(`generations/${generationId}.${extension}`, bytes, {
      access: "public",
      contentType: mediaType,
      token: env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  await mkdir(GENERATED_DIR, { recursive: true });
  await writeFile(
    path.join(GENERATED_DIR, `${generationId}.${extension}`),
    bytes,
  );
  return `/api/images/${generationId}.${extension}`;
}

/**
 * Removes a stored result (Blob object or ./.generated file). Missing files
 * are fine — the goal is "gone", and a retry must not fail.
 */
export async function deleteStoredImage(url: string): Promise<void> {
  const local = /^\/api\/images\/([0-9a-f-]{36}\.[a-z]{3,4})$/.exec(url);
  if (local?.[1]) {
    if (features.s3Storage) {
      await s3().send(
        new DeleteObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: `${S3_PREFIX}${local[1]}`,
        }),
      );
    }
    await unlink(generatedFilePath(local[1])).catch(() => undefined);
    return;
  }
  if (/^https:\/\//.test(url) && features.blobStorage) {
    await del(url, { token: env.BLOB_READ_WRITE_TOKEN });
  }
}

/** Account deletion: remove every stored result before the rows cascade. */
export async function deleteStoredImagesForUser(userId: string): Promise<void> {
  const rows = await db
    .select({ imageUrl: generations.imageUrl })
    .from(generations)
    .where(eq(generations.userId, userId));
  for (const row of rows) {
    if (row.imageUrl) await deleteStoredImage(row.imageUrl);
  }
}

/**
 * Bytes of a stored result for /api/images (caller has checked ownership
 * and validated `fileName`). Null when the object doesn't exist.
 */
export async function readStoredImage(
  fileName: string,
): Promise<Uint8Array | null> {
  if (features.s3Storage) {
    try {
      const object = await s3().send(
        new GetObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: `${S3_PREFIX}${fileName}`,
        }),
      );
      return object.Body ? await object.Body.transformToByteArray() : null;
    } catch (error) {
      if ((error as { name?: string }).name === "NoSuchKey") return null;
      throw error;
    }
  }
  try {
    return new Uint8Array(await readFile(generatedFilePath(fileName)));
  } catch {
    return null;
  }
}

/** Dev-serving helper for /api/images — resolves inside ./.generated only. */
export function generatedFilePath(fileName: string): string {
  return path.join(GENERATED_DIR, fileName);
}

export const mediaTypeByExtension: Record<string, string> = Object.fromEntries(
  Object.entries(extensionByMediaType).map(([type, ext]) => [ext, type]),
);
