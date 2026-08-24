import "server-only";

import { env } from "cloudflare:workers";
import type { KeyRecord } from "@/db/schema";
import type { KeyRecordView } from "@/lib/key-records";

type StorageEnv = {
  BUCKET: R2Bucket;
};

export const photoSlots = [
  "car",
  "oem-key",
  "universal-key",
] as const;

export type PhotoSlot = (typeof photoSlots)[number];

export function getBucket() {
  const bucket = (env as unknown as StorageEnv).BUCKET;
  if (!bucket) throw new Error("Photo storage is unavailable.");
  return bucket;
}

export function photoKeyForSlot(record: KeyRecord, slot: PhotoSlot) {
  if (slot === "car") return record.carPhotoKey;
  if (slot === "oem-key") return record.oemKeyPhotoKey;
  return record.universalKeyPhotoKey;
}

export function recordToView(record: KeyRecord): KeyRecordView {
  const version = encodeURIComponent(record.updatedAt);
  const base = `/api/key-records/${encodeURIComponent(record.id)}/photos`;
  return {
    id: record.id,
    make: record.make,
    model: record.model,
    yearFrom: record.yearFrom,
    yearTo: record.yearTo,
    transponderClonable: record.transponderClonable,
    powerSupplyRequired: record.powerSupplyRequired,
    aklCompatible: record.aklCompatible,
    addKeyCompatible: record.addKeyCompatible,
    aklPinMethod: record.aklPinMethod as KeyRecordView["aklPinMethod"],
    aklPinSupplier: record.aklPinSupplier ?? "",
    addKeyPinMethod: record.addKeyPinMethod as KeyRecordView["addKeyPinMethod"],
    addKeyPinSupplier: record.addKeyPinSupplier ?? "",
    keyCloning: record.keyCloning,
    keyBlankCode: record.keyBlankCode ?? "",
    lishiInStock: record.lishiInStock,
    keyBlanksInStock: record.keyBlanksInStock,
    universalKeyCompatible: record.universalKeyCompatible,
    compatibleUniversalKeys: record.compatibleUniversalKeys ?? "",
    universalKeyInStock: record.universalKeyInStock,
    universalKeySupplier: record.universalKeySupplier ?? "",
    oemKeyInStock: record.oemKeyInStock,
    oemKeySupplier: record.oemKeySupplier ?? "",
    leadTime: record.leadTime ?? "",
    oemPricePence: record.oemPricePence,
    universalPricePence: record.universalPricePence,
    notes: record.notes ?? "",
    carPhotoUrl: record.carPhotoKey ? `${base}/car?v=${version}` : null,
    oemKeyPhotoUrl: record.oemKeyPhotoKey
      ? `${base}/oem-key?v=${version}`
      : null,
    universalKeyPhotoUrl: record.universalKeyPhotoKey
      ? `${base}/universal-key?v=${version}`
      : null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

const imageTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function validImageFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) return null;
  const extension = imageTypes[value.type];
  if (!extension) throw new Error("Photos must be JPG, PNG, WebP or GIF files.");
  if (value.size > 8 * 1024 * 1024) {
    throw new Error("Each photo must be 8 MB or smaller.");
  }
  return { file: value, extension };
}

export async function storePhoto(
  recordId: string,
  slot: PhotoSlot,
  value: FormDataEntryValue | null,
) {
  const image = validImageFile(value);
  if (!image) return null;
  const key = `key-records/${recordId}/${slot}-${crypto.randomUUID()}.${image.extension}`;
  await getBucket().put(key, image.file.stream(), {
    httpMetadata: { contentType: image.file.type },
  });
  return key;
}

export async function deletePhotos(keys: Array<string | null | undefined>) {
  const present = keys.filter((key): key is string => Boolean(key));
  if (present.length) await getBucket().delete(present);
}

