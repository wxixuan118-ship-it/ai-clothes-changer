import { listPresetPreviews } from "@/lib/ai/storage";

// Which curated hairstyles have a preview image: { id: version }. Public;
// the generate form fetches it once to show thumbnails.

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const previews = await listPresetPreviews("hair").catch(() => ({}));
  return Response.json(
    { hair: previews },
    // Server-side cached (storage.ts); browsers always ask again so a new
    // preview shows up on the next page load.
    { headers: { "Cache-Control": "no-cache" } },
  );
}
