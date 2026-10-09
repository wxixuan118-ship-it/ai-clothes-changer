import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { generations } from "@/db/schema";
import { isAdminEmail } from "@/lib/admin/auth";
import { getSession } from "@/lib/auth/session";
import { mediaTypeByExtension, readStoredImage } from "@/lib/ai/storage";

// Serves stored results (private S3 objects, or ./.generated in dev) to
// their owner. Vercel Blob URLs are public and never hit this route. Strictly validated: uuid.ext filenames only — no
// traversal — and only the generation's owner may read it.

const FILE_PATTERN =
  /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.([a-z]{3,4})$/;

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
  const [owned] = await db
    .select({ id: generations.id })
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
  if (!owned) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = await readStoredImage(file);
  if (!bytes) {
    return new Response("Not found", { status: 404 });
  }
  const download = new URL(request.url).searchParams.has("download");
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": mediaType,
      "Cache-Control": "private, max-age=31536000, immutable",
      // Never let a browser sniff a stored file into something executable.
      "X-Content-Type-Options": "nosniff",
      ...(download
        ? {
            "Content-Disposition": `attachment; filename="ai-clothes-changer-${match[1]}.${match[2]}"`,
          }
        : {}),
    },
  });
}
