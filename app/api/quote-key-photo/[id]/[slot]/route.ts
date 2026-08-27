import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { keyRecords } from "@/db/schema";
import { getBucket } from "@/lib/key-record-server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string; slot: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id, slot } = await context.params;
  if (slot !== "oem-reference" && slot !== "oem-key" && slot !== "universal-key") {
    return new Response("Not found", { status: 404 });
  }

  const record = await getDb().query.keyRecords.findFirst({
    where: eq(keyRecords.id, id),
  });
  if (!record) return new Response("Not found", { status: 404 });

  const key = slot === "oem-reference"
    ? record.carPhotoKey
    : slot === "oem-key"
      ? record.oemKeyPhotoKey
      : record.universalKeyPhotoKey;
  if (!key) return new Response("Not found", { status: 404 });

  const object = await getBucket().get(key);
  if (!object) return new Response("Not found", { status: 404 });

  return new Response(object.body, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
