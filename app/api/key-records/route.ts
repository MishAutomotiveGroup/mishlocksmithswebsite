import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { keyRecords } from "@/db/schema";
import { getAdminApiSession, requestIsSameOrigin } from "@/lib/admin-auth";
import { parseKeyRecordPayload } from "@/lib/key-record-validation";
import {
  deletePhotos,
  recordToView,
  storePhoto,
} from "@/lib/key-record-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAdminApiSession();
  if (auth.response) return auth.response;

  const records = await getDb()
    .select()
    .from(keyRecords)
    .orderBy(desc(keyRecords.updatedAt));
  return Response.json({ records: records.map(recordToView) });
}

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Invalid request." }, { status: 403 });
  const auth = await getAdminApiSession();
  if (auth.response || !auth.user) return auth.response!;

  const uploaded: string[] = [];
  try {
    const formData = await request.formData();
    const rawPayload = formData.get("payload");
    if (typeof rawPayload !== "string") throw new Error("Record details are missing.");
    const payload = parseKeyRecordPayload(JSON.parse(rawPayload));
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const carPhotoKey = await storePhoto(id, "car", formData.get("carPhoto"));
    if (carPhotoKey) uploaded.push(carPhotoKey);
    const oemKeyPhotoKey = await storePhoto(id, "oem-key", formData.get("oemKeyPhoto"));
    if (oemKeyPhotoKey) uploaded.push(oemKeyPhotoKey);
    const universalKeyPhotoKey = await storePhoto(
      id,
      "universal-key",
      formData.get("universalKeyPhoto"),
    );
    if (universalKeyPhotoKey) uploaded.push(universalKeyPhotoKey);

    const record = {
      id,
      ...payload,
      carPhotoKey,
      oemKeyPhotoKey,
      universalKeyPhotoKey,
      createdBy: auth.user.email,
      updatedBy: auth.user.email,
      createdAt: now,
      updatedAt: now,
    };
    await getDb().insert(keyRecords).values(record);
    return Response.json({ record: recordToView(record) }, { status: 201 });
  } catch (error) {
    await deletePhotos(uploaded);
    const message = error instanceof Error ? error.message : "Unable to save the record.";
    return Response.json({ error: message }, { status: 400 });
  }
}
