import { getDb } from "@/db";
import { keyRecords, quoteSearches, type KeyRecord } from "@/db/schema";
import { findVehicleCatalogueOption, type VehicleCatalogueOption } from "@/lib/vehicle-catalogue";

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

async function recordSearch(vehicle: VehicleCatalogueOption, input: {
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
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.yearFrom,
        yearTo: vehicle.yearTo,
        generation: vehicle.generation,
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

function normalise(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\bmark\b/g, "mk")
    .replace(/\bmk\s*iv\b/g, "mk4")
    .replace(/\bmk\s*iii\b/g, "mk3")
    .replace(/\bmk\s*ii\b/g, "mk2")
    .replace(/\bmk\s*i\b/g, "mk1")
    .replace(/[^a-z0-9]+/g, "");
}

function normaliseMake(value: string) {
  const normalised = normalise(value);
  if (normalised === "opel" || normalised === "vauxhall") return "vauxhall";
  if (normalised === "kgm" || normalised === "ssangyong") return "kgm";
  if (normalised === "ds" || normalised === "dsautomobiles") return "ds";
  return normalised;
}

function sameYearRange(record: KeyRecord, vehicle: VehicleCatalogueOption) {
  return record.yearFrom === vehicle.yearFrom && (record.yearTo ?? 2026) === vehicle.yearTo;
}

function matchingKeyRecord(records: KeyRecord[], vehicle: VehicleCatalogueOption) {
  return records.find((record) => (
    normaliseMake(record.make) === normaliseMake(vehicle.make)
    && normalise(record.model) === normalise(vehicle.model)
    && (
      normalise(record.generation) === normalise(vehicle.generation)
      || sameYearRange(record, vehicle)
    )
  )) ?? null;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      recordId?: unknown;
      hasWorkingKey?: unknown;
    };
    const recordId = typeof payload.recordId === "string" ? payload.recordId.trim() : "";
    const hasWorkingKey = payload.hasWorkingKey;

    if (!recordId || recordId.length > 300) {
      return json({ error: "Choose a vehicle generation." }, 400);
    }
    if (typeof hasWorkingKey !== "boolean") {
      return json({ error: "Tell us whether you have a working key." }, 400);
    }

    const vehicle = findVehicleCatalogueOption(recordId);
    if (!vehicle) return json({ error: "That vehicle generation is no longer available. Please choose again." }, 404);

    const databaseRecords = await getDb().select().from(keyRecords);
    const record = matchingKeyRecord(databaseRecords, vehicle);

    const serviceType: ServiceType = hasWorkingKey ? "spare_key" : "all_keys_lost";
    const supported = record ? recordSupportsService(record, serviceType) : false;
    const options = record && supported ? keyOptionsForRecord(record) : [];
    const resultStatus: ResultStatus = !record
      ? "not_found"
      : !supported
        ? "not_supported"
        : options.length === 0
          ? "manual_check"
          : "matched";

    const referenceNumber = await recordSearch(vehicle, {
      hasWorkingKey,
      serviceType,
      resultStatus,
    });

    return json({
      status: resultStatus,
      quoteReference: `#${referenceNumber}`,
      serviceType,
      vehicle: {
        make: vehicle.make,
        model: vehicle.model,
        yearFrom: vehicle.yearFrom,
        yearTo: vehicle.yearTo,
        generation: vehicle.generation,
        workingKeyRequired: serviceType === "spare_key",
      },
      options,
    });
  } catch (error) {
    console.error("Vehicle quote lookup failed", error);
    return json({ error: "We couldn't check this vehicle right now. Please call or WhatsApp us." }, 500);
  }
}
