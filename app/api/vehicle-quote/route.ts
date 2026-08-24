type RuntimeEnv = {
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
};

type VehicleRow = {
  id: number;
  make: string;
  model: string;
  year_from: number;
  year_to: number;
  variant: string | null;
  spare_key_supported: boolean;
  all_keys_lost_supported: boolean;
  working_key_required: boolean;
};

type KeyOptionRow = {
  id: number;
  vehicle_id: number;
  key_type: "universal" | "oem";
  display_name: string;
  price_min_pence: number | null;
  price_max_pence: number | null;
  job_minutes_min: number | null;
  job_minutes_max: number | null;
  stock_status: "in_stock" | "order_required" | "check_availability";
  lead_business_days_min: number | null;
  lead_business_days_max: number | null;
  image_path: string | null;
};

const textPattern = /^[\p{L}\p{N} .&+'#()/-]+$/u;
const makeAliases: Record<string, string[]> = {
  opel: ["Opel", "Vauxhall"],
  vauxhall: ["Vauxhall", "Opel"],
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

async function getConfig() {
  const { env } = await import("cloudflare:workers");
  const runtime = env as unknown as RuntimeEnv;
  const baseUrl = runtime.SUPABASE_URL?.replace(/\/$/, "");
  const apiKey = runtime.SUPABASE_SECRET_KEY;
  if (!baseUrl || !apiKey) throw new Error("Database connection is not configured");
  return { baseUrl, apiKey };
}

async function publicImagePath(path: string | null) {
  if (!path) return null;
  if (/^\/images\/[a-zA-Z0-9/_().-]+$/.test(path)) return path;
  try {
    const { baseUrl } = await getConfig();
    const imageUrl = new URL(path);
    if (
      imageUrl.origin === new URL(baseUrl).origin
      && imageUrl.pathname.startsWith("/storage/v1/object/public/")
    ) return imageUrl.toString();
  } catch {
    return null;
  }
  return null;
}

async function databaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const { baseUrl, apiKey } = await getConfig();
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: apiKey,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Supabase request failed", response.status, detail.slice(0, 300));
    throw new Error("Database request failed");
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function findVehicles(year: number, make: string, model: string) {
  const candidates = makeAliases[make.toLowerCase()] ?? [make];

  for (const candidate of candidates) {
    const params = new URLSearchParams({
      select: "id,make,model,year_from,year_to,variant,spare_key_supported,all_keys_lost_supported,working_key_required",
      active: "eq.true",
      year_from: `lte.${year}`,
      year_to: `gte.${year}`,
      make: `ilike.${candidate}`,
      model: `ilike.${model}`,
      order: "year_from.desc",
      limit: "10",
    });
    const rows = await databaseRequest<VehicleRow[]>(`vehicles?${params.toString()}`);
    if (rows.length > 0) return rows;
  }

  return [];
}

async function findKeyOptions(vehicleIds: number[], serviceType: "spare_key" | "all_keys_lost") {
  if (vehicleIds.length === 0) return [];
  const params = new URLSearchParams({
    select: "id,vehicle_id,key_type,display_name,price_min_pence,price_max_pence,job_minutes_min,job_minutes_max,stock_status,lead_business_days_min,lead_business_days_max,image_path",
    vehicle_id: `in.(${vehicleIds.join(",")})`,
    service_type: `eq.${serviceType}`,
    supported: "eq.true",
    active: "eq.true",
    order: "price_min_pence.asc.nullslast",
  });
  return databaseRequest<KeyOptionRow[]>(`key_options?${params.toString()}`);
}

async function recordSearch(input: {
  make: string;
  model: string;
  year: number;
  hasWorkingKey: boolean;
  serviceType: "spare_key" | "all_keys_lost";
  resultStatus: "matched" | "manual_check" | "not_supported" | "not_found";
}) {
  const rows = await databaseRequest<Array<{ id: number }>>("quote_searches?select=id", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      lookup_method: "manual",
      make: input.make,
      model: input.model,
      year: input.year,
      service_type: input.serviceType,
      has_working_key: input.hasWorkingKey,
      vehicle_confirmed: true,
      result_status: input.resultStatus,
      source_page: "spare-car-key",
    }),
  });
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

    const vehicles = await findVehicles(year, make, model);
    const serviceType = hasWorkingKey ? "spare_key" : "all_keys_lost";
    const supportedVehicles = vehicles.filter(vehicle => (
      hasWorkingKey ? vehicle.spare_key_supported : vehicle.all_keys_lost_supported
    ));
    const options = await findKeyOptions(supportedVehicles.map(vehicle => vehicle.id), serviceType);

    const resultStatus = vehicles.length === 0
      ? "not_found"
      : supportedVehicles.length === 0
        ? "not_supported"
        : options.length === 0
          ? "manual_check"
          : "matched";

    const quoteSearchId = await recordSearch({ make, model, year, hasWorkingKey, serviceType, resultStatus }).catch(error => {
      console.error("Quote search logging failed", error);
      return null;
    });

    const primaryVehicle = supportedVehicles[0] ?? vehicles[0] ?? null;
    return json({
      status: resultStatus,
      quoteReference: quoteSearchId === null ? null : `MCK-${String(quoteSearchId).padStart(6, "0")}`,
      serviceType,
      vehicle: primaryVehicle ? {
        make: primaryVehicle.make,
        model: primaryVehicle.model,
        year,
        variant: primaryVehicle.variant,
        workingKeyRequired: primaryVehicle.working_key_required,
      } : { make, model, year, variant: null, workingKeyRequired: null },
      options: await Promise.all(options.map(async option => ({
        id: option.id,
        keyType: option.key_type,
        displayName: option.display_name,
        priceMinPence: option.price_min_pence,
        priceMaxPence: option.price_max_pence,
        jobMinutesMin: option.job_minutes_min,
        jobMinutesMax: option.job_minutes_max,
        stockStatus: option.stock_status,
        leadBusinessDaysMin: option.lead_business_days_min,
        leadBusinessDaysMax: option.lead_business_days_max,
        imagePath: await publicImagePath(option.image_path),
      }))),
    });
  } catch (error) {
    console.error("Vehicle quote lookup failed", error);
    return json({ error: "We couldn't check this vehicle right now. Please try again or contact us." }, 500);
  }
}
