import { and, eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { keyRecords, quoteSearches, type KeyRecord } from "@/db/schema";

export const dynamic = "force-dynamic";

const textPattern = /^[\p{L}\p{N} .&+'#()/-]+$/u;
const makeAliases: Record<string, string[]> = {
  opel: ["Opel", "Vauxhall"],
  vauxhall: ["Vauxhall", "Opel"],
};

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

async function findKeyRecords(year: number, make: string, model: string) {
  const candidates = makeAliases[make.toLowerCase()] ?? [make];

  for (const candidate of candidates) {
    const rows = await getDb()
      .select()
      .from(keyRecords)
      .where(and(
        sql`lower(${keyRecords.make}) = lower(${candidate})`,
        sql`lower(${keyRecords.model}) = lower(${model})`,
        lte(keyRecords.yearFrom, year),
        or(
          gte(keyRecords.yearTo, year),
          and(isNull(keyRecords.yearTo), eq(keyRecords.yearFrom, year)),
        ),
      ));
    if (rows.length > 0) return rows;
  }

  return [];
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
      keyType: "universal" as const,
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
      keyType: "oem" as const,
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

async function recordSearch(input: {
  make: string;
  model: string;
  year: number;
  hasWorkingKey: boolean;
  serviceType: ServiceType;
  resultStatus: ResultStatus;
}) {
  const rows = await getDb()
    .insert(quoteSearches)
    .values({
      createdAt: new Date().toISOString(),
      make: input.make,
      model: input.model,
      year: input.year,
      serviceType: input.serviceType,
      hasWorkingKey: input.hasWorkingKey,
      resultStatus: input.resultStatus,
      sourcePage: "spare-car-key",
    })
    .returning({ id: quoteSearches.id });
  return rows[0]?.id ?? null;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      year?: unknown;
      make?: unknown;
      model?: unknown;
      hasWorkingKey?: unknown;
    };

    const year = Number(payload.year);
    const make = typeof payload.make === "string" ? payload.make.trim() : "";
    const model = typeof payload.model === "string" ? payload.model.trim() : "";
    const hasWorkingKey = payload.hasWorkingKey;
    const latestYear = new Date().getFullYear() + 1;

    if (!Number.isInteger(year) || year < 1950 || year > latestYear) {
      return json({ error: "Enter a valid vehicle year." }, 400);
    }
    if (!make || !model || make.length > 80 || model.length > 100 || !textPattern.test(make) || !textPattern.test(model)) {
      return json({ error: "Choose a valid vehicle make and model." }, 400);
    }
    if (typeof hasWorkingKey !== "boolean") {
      return json({ error: "Tell us whether you have a working key." }, 400);
    }

    const records = await findKeyRecords(year, make, model);
    const serviceType: ServiceType = hasWorkingKey ? "spare_key" : "all_keys_lost";
    const supportedRecords = records.filter((record) => recordSupportsService(record, serviceType));
    const options = supportedRecords.flatMap(keyOptionsForRecord);

    const resultStatus: ResultStatus = records.length === 0
      ? "not_found"
      : supportedRecords.length === 0
        ? "not_supported"
        : options.length === 0
          ? "manual_check"
          : "matched";

    const quoteSearchId = await recordSearch({ make, model, year, hasWorkingKey, serviceType, resultStatus }).catch((error) => {
      console.error("Quote search logging failed", error);
      return null;
    });

    const primaryRecord = supportedRecords[0] ?? records[0] ?? null;
    return json({
      status: resultStatus,
      quoteReference: quoteSearchId === null ? null : `MCK-${String(quoteSearchId).padStart(6, "0")}`,
      serviceType,
      vehicle: primaryRecord ? {
        make: primaryRecord.make,
        model: primaryRecord.model,
        year,
        variant: null,
        workingKeyRequired: serviceType === "spare_key",
      } : { make, model, year, variant: null, workingKeyRequired: null },
      options,
    });
  } catch (error) {
    console.error("Vehicle quote lookup failed", error);
    return json({ error: "We couldn't check this vehicle right now. Please call or WhatsApp us." }, 500);
  }
}
