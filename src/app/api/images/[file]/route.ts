import { and, eq } from "drizzle-orm";

import { siteConfig } from "@/config/site";
import { db } from "@/db";
import { generations } from "@/db/schema";
import { isAdminEmail } from "@/lib/admin/auth";
import { getSession } from "@/lib/auth/session";
import { mediaTypeByExtension, readStoredImage } from "@/lib/ai/storage";
import { applyWatermark } from "@/lib/ai/watermark";
import { canRemoveWatermark } from "@/lib/entitlements";

// Serves stored results (private S3 objects, or ./.generated in dev) to
// their owner. Vercel Blob URLs are public and never hit this route. Strictly
// validated: uuid.ext filenames only — no traversal — and only the
// generation's owner (or an admin) may read it.
//
// Results are stored clean. ?variant=watermarked always adds the watermark;
// ?variant=clean requires the entitlement (paid plan, or the run was made
// with purchased credits) and otherwise answers 402. Without a variant the
// best version the viewer is entitled to is served.

const FILE_PATTERN =
  /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.([a-z]{3,4})$/;

/** A just-finished result can lag in object storage — retry briefly. */
const FRESH_MS = 5 * 60 * 1000;
const READ_RETRIES_MS = [400, 900, 1600];

async function readWithRetry(
  file: string,
  fresh: boolean,
): Promise<Uint8Array | null> {
  let bytes = await readStoredImage(file);
  if (bytes || !fresh) return bytes;
  for (const delay of READ_RETRIES_MS) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    bytes = await readStoredImage(file);
    if (bytes) return bytes;
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ file: string }> },
): Promise<Response> {
  const { file } = await params;
  const match = FILE_PATTERN.exec(file);
  const mediaType = match?.[2] ? mediaTypeByExtension[match[2]] : undefined;
  if (!match || !match[1] || !mediaType) {
    return new Response("Not found", { status: 404 });
  }

  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  // Owners see their own results; admins can review any (/admin).
  const admin = isAdminEmail(session.user.email);
  const [row] = await db
    .select({
      userId: generations.userId,
      watermarkFree: generations.watermarkFree,
      createdAt: generations.createdAt,
    })
    .from(generations)
    .where(
      admin
        ? eq(generations.id, match[1])
        : and(
            eq(generations.id, match[1]),
            eq(generations.userId, session.user.id),
          ),
    )
    .limit(1);
  if (!row) {
    return new Response("Not found", { status: 404 });
  }

  const search = new URL(request.url).searchParams;
  const requested = search.get("variant");
  const entitled =
    admin ||
    (await canRemoveWatermark({
      userId: row.userId,
      watermarkFree: row.watermarkFree,
    }));
  if (requested === "clean" && !entitled) {
    return new Response("Upgrade to download without the watermark.", {
      status: 402,
    });
  }
  const watermarked =
    requested === "watermarked" || (requested !== "clean" && !entitled);

  const fresh = Date.now() - row.createdAt.getTime() < FRESH_MS;
  const stored = await readWithRetry(file, fresh);
  if (!stored) {
    return new Response("Not found", { status: 404 });
  }
  const output = watermarked
    ? await applyWatermark(Buffer.from(stored), siteConfig.domain)
    : { bytes: stored, mediaType };

  const download = search.has("download");
  const extension =
    output.mediaType === "image/png"
      ? "png"
      : output.mediaType === "image/jpeg"
        ? "jpg"
        : match[2];
  return new Response(new Uint8Array(output.bytes), {
    headers: {
      "Content-Type": output.mediaType,
      // An explicit variant never changes; the default one does when the
      // viewer upgrades, so it is only briefly cacheable.
      "Cache-Control": requested
        ? "private, max-age=31536000, immutable"
        : "private, max-age=60",
      // Never let a browser sniff a stored file into something executable.
      "X-Content-Type-Options": "nosniff",
      ...(download
        ? {
            "Content-Disposition": `attachment; filename="stylemirror-${match[1]}${watermarked ? "" : "-hd"}.${extension}"`,
          }
        : {}),
    },
  });
}
