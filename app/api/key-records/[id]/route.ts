import { eq } from "drizzle-orm";
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

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Invalid request." }, { status: 403 });
  const auth = await getAdminApiSession();
  if (auth.response || !auth.user) return auth.response!;

  const { id } = await context.params;
  const db = getDb();
  const existing = await db.query.keyRecords.findFirst({
    where: eq(keyRecords.id, id),
  });
  if (!existing) return Response.json({ error: "Record not found." }, { status: 404 });

  const uploaded: string[] = [];
  try {
    const formData = await request.formData();
    const rawPayload = formData.get("payload");
    if (typeof rawPayload !== "string") throw new Error("Record details are missing.");
    const payload = parseKeyRecordPayload(JSON.parse(rawPayload));

    const newCarPhoto = await storePhoto(id, "car", formData.get("carPhoto"));
    if (newCarPhoto) uploaded.push(newCarPhoto);
    const newOemPhoto = await storePhoto(id, "oem-key", formData.get("oemKeyPhoto"));
    if (newOemPhoto) uploaded.push(newOemPhoto);
    const newUniversalPhoto = await storePhoto(
      id,
      "universal-key",
      formData.get("universalKeyPhoto"),
    );
    if (newUniversalPhoto) uploaded.push(newUniversalPhoto);

    const removeCar = formData.get("removeCarPhoto") === "true";
    const removeOem = formData.get("removeOemKeyPhoto") === "true";
    const removeUniversal = formData.get("removeUniversalKeyPhoto") === "true";
    const carPhotoKey = newCarPhoto ?? (removeCar ? null : existing.carPhotoKey);
    const oemKeyPhotoKey = newOemPhoto ?? (removeOem ? null : existing.oemKeyPhotoKey);
    const universalKeyPhotoKey =
      newUniversalPhoto ?? (removeUniversal ? null : existing.universalKeyPhotoKey);
    const now = new Date().toISOString();

    await db
      .update(keyRecords)
      .set({
        ...payload,
        carPhotoKey,
        oemKeyPhotoKey,
        universalKeyPhotoKey,
        updatedBy: auth.user.email,
        updatedAt: now,
      })
      .where(eq(keyRecords.id, id));

    await deletePhotos([
      existing.carPhotoKey !== carPhotoKey ? existing.carPhotoKey : null,
      existing.oemKeyPhotoKey !== oemKeyPhotoKey ? existing.oemKeyPhotoKey : null,
      existing.universalKeyPhotoKey !== universalKeyPhotoKey
        ? existing.universalKeyPhotoKey
        : null,
    ]);

    return Response.json({
      record: recordToView({
        ...existing,
        ...payload,
        carPhotoKey,
        oemKeyPhotoKey,
        universalKeyPhotoKey,
        updatedBy: auth.user.email,
        updatedAt: now,
      }),
    });
  } catch (error) {
    await deletePhotos(uploaded);
    const message = error instanceof Error ? error.message : "Unable to update the record.";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Invalid request." }, { status: 403 });
  const auth = await getAdminApiSession();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const db = getDb();
  const existing = await db.query.keyRecords.findFirst({
    where: eq(keyRecords.id, id),
  });
  if (!existing) return Response.json({ error: "Record not found." }, { status: 404 });

  await db.delete(keyRecords).where(eq(keyRecords.id, id));
  await deletePhotos([
    existing.carPhotoKey,
    existing.oemKeyPhotoKey,
    existing.universalKeyPhotoKey,
  ]);
  return Response.json({ deleted: true });
}
