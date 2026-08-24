import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { keyRecords, quoteSearches, type KeyRecord } from "@/db/schema";

export const dynamic = "force-dynamic";

type ServiceType = "spare_key" | "all_keys_lost";
type ResultStatus = "matched" | "manual_check" | "not_supported" | "not_found";
type QuoteOption = {
  id: string;
  keyType: "universal" | "oem";
  displayName: string;
  priceMinPence: number | null;
  priceMaxPence: number | null;
  jobMinutesMin: number | null;
  jobMinutesMax: number | null;
  stockStatus: "in_stock" | "order_required" | "check_availability";
  leadTime: string | null;
  imagePath: string | null;
};

function json(payload: unknown, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function recordSupportsService(record: KeyRecord, serviceType: ServiceType) {
  if (serviceType === "all_keys_lost") return record.aklCompatible === true;
  return record.addKeyCompatible === true || record.keyCloning === true;
}

function stockStatus(value: boolean | null) {
  if (value === true) return "in_stock" as const;
  if (value === false) return "order_required" as const;
  return "check_availability" as const;
}

function publicPhotoPath(record: KeyRecord, slot: "oem-key" | "universal-key") {
  const key = slot === "oem-key" ? record.oemKeyPhotoKey : record.universalKeyPhotoKey;
  if (!key) return null;
  return `/api/quote-key-photo/${encodeURIComponent(record.id)}/${slot}?v=${encodeURIComponent(record.updatedAt)}`;
}

function keyOptionsForRecord(record: KeyRecord) {
  const options: QuoteOption[] = [];

  if (record.universalKeyCompatible === true) {
    options.push({
      id: `${record.id}:universal`,
      keyType: "universal",
      displayName: record.compatibleUniversalKeys?.trim() || "Compatible universal key",
      priceMinPence: record.universalPricePence,
      priceMaxPence: record.universalPricePence,
      jobMinutesMin: null,
      jobMinutesMax: null,
      stockStatus: stockStatus(record.universalKeyInStock),
      leadTime: record.leadTime || null,
      imagePath: publicPhotoPath(record, "universal-key"),
    });
  }

  const hasOemOption = record.oemPricePence !== null
    || record.oemKeyInStock !== null
    || Boolean(record.oemKeySupplier?.trim())
    || Boolean(record.oemKeyPhotoKey);
  if (hasOemOption) {
    options.push({
      id: `${record.id}:oem`,
      keyType: "oem",
      displayName: "OEM / AFM key",
      priceMinPence: record.oemPricePence,
      priceMaxPence: record.oemPricePence,
      jobMinutesMin: null,
      jobMinutesMax: null,
      stockStatus: stockStatus(record.oemKeyInStock),
      leadTime: record.leadTime || null,
      imagePath: publicPhotoPath(record, "oem-key"),
    });
  }

  return options;
}

function randomAvailableReference(used: Set<number>) {
  const availableCount = 9_000 - used.size;
  if (availableCount <= 0) throw new Error("All quote reference numbers have been used.");

  const randomValue = crypto.getRandomValues(new Uint32Array(1))[0];
  let target = randomValue % availableCount;
  for (let number = 1_000; number <= 9_999; number += 1) {
    if (used.has(number)) continue;
    if (target === 0) return number;
    target -= 1;
  }
  throw new Error("Unable to allocate a quote reference.");
}

async function recordSearch(record: KeyRecord, input: {
  hasWorkingKey: boolean;
  serviceType: ServiceType;
  resultStatus: ResultStatus;
}) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existing = await getDb()
      .select({ referenceNumber: quoteSearches.referenceNumber })
      .from(quoteSearches);
    const used = new Set(existing.flatMap((row) => (
      typeof row.referenceNumber === "number" ? [row.referenceNumber] : []
    )));
    const referenceNumber = randomAvailableReference(used);

    try {
      await getDb().insert(quoteSearches).values({
        createdAt: new Date().toISOString(),
        make: record.make,
        model: record.model,
        year: record.yearFrom,
        yearTo: record.yearTo,
        generation: record.generation,
        serviceType: input.serviceType,
        hasWorkingKey: input.hasWorkingKey,
        resultStatus: input.resultStatus,
        sourcePage: "spare-car-key",
        referenceNumber,
      });
      return referenceNumber;
    } catch (error) {
      if (attempt === 4) throw error;
    }
  }

  throw new Error("Unable to allocate a quote reference.");
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      recordId?: unknown;
      hasWorkingKey?: unknown;
    };
    const recordId = typeof payload.recordId === "string" ? payload.recordId.trim() : "";
    const hasWorkingKey = payload.hasWorkingKey;

    if (!recordId || recordId.length > 100) {
      return json({ error: "Choose a vehicle generation." }, 400);
    }
    if (typeof hasWorkingKey !== "boolean") {
      return json({ error: "Tell us whether you have a working key." }, 400);
    }

    const record = await getDb().query.keyRecords.findFirst({
      where: eq(keyRecords.id, recordId),
    });
    if (!record) return json({ error: "That vehicle generation is no longer available. Please choose again." }, 404);

    const serviceType: ServiceType = hasWorkingKey ? "spare_key" : "all_keys_lost";
    const supported = recordSupportsService(record, serviceType);
    const options = supported ? keyOptionsForRecord(record) : [];
    const resultStatus: ResultStatus = !supported
      ? "not_supported"
      : options.length === 0
        ? "manual_check"
        : "matched";

    const referenceNumber = await recordSearch(record, {
      hasWorkingKey,
      serviceType,
      resultStatus,
    });

    return json({
      status: resultStatus,
      quoteReference: `#${referenceNumber}`,
      serviceType,
      vehicle: {
        make: record.make,
        model: record.model,
        yearFrom: record.yearFrom,
        yearTo: record.yearTo,
        generation: record.generation,
        workingKeyRequired: serviceType === "spare_key",
      },
      options,
    });
  } catch (error) {
    console.error("Vehicle quote lookup failed", error);
    return json({ error: "We couldn't check this vehicle right now. Please call or WhatsApp us." }, 500);
  }
}
