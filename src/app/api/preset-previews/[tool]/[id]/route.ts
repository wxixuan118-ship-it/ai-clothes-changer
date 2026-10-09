import { getHairPreset } from "@/config/hairstyles";
import { readPresetPreview } from "@/lib/ai/storage";

// Serves one preset preview JPEG. Public marketing asset; only known preset
// ids are accepted, so the route can't be used to read anything else.
// Clients add ?v=<version> (last-modified), so responses can be cached hard.

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tool: string; id: string }> },
): Promise<Response> {
  const { tool, id } = await params;
  if (tool !== "hair" || !getHairPreset(id)) {
    return new Response("Not found", { status: 404 });
  }
  const bytes = await readPresetPreview("hair", id);
  if (!bytes) return new Response("Not found", { status: 404 });
  const versioned = new URL(request.url).searchParams.has("v");
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": versioned
        ? "public, max-age=31536000, immutable"
        : "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
