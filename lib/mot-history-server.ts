import "server-only";

type RuntimeEnv = {
  MOT_API_CLIENT_ID?: string;
  MOT_API_CLIENT_SECRET?: string;
  MOT_API_KEY?: string;
  MOT_API_SCOPE?: string;
  MOT_API_TOKEN_URL?: string;
};

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
};

type MotVehicleResponse = {
  registration?: string;
  make?: string;
  model?: string;
  firstUsedDate?: string;
  registrationDate?: string;
  manufactureDate?: string;
};

type CachedToken = {
  value: string;
  expiresAt: number;
};

let cachedToken: CachedToken | null = null;
let tokenRequest: Promise<string> | null = null;

export class MotHistoryLookupError extends Error {
  constructor(public readonly code: "not_found" | "invalid" | "rate_limited" | "not_configured" | "unavailable") {
    super(code);
  }
}

async function runtimeEnv() {
  const { env } = await import("cloudflare:workers");
  return env as unknown as RuntimeEnv;
}

async function accessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;
  if (tokenRequest) return tokenRequest;

  tokenRequest = (async () => {
    const env = await runtimeEnv();
    const clientId = env.MOT_API_CLIENT_ID?.trim();
    const clientSecret = env.MOT_API_CLIENT_SECRET?.trim();
    const scope = env.MOT_API_SCOPE?.trim();
    const tokenUrl = env.MOT_API_TOKEN_URL?.trim();
    if (!clientId || !clientSecret || !scope || !tokenUrl) {
      throw new MotHistoryLookupError("not_configured");
    }

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope,
      }),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("MOT access-token request failed", response.status);
      throw new MotHistoryLookupError(response.status === 429 ? "rate_limited" : "not_configured");
    }

    const token = await response.json() as TokenResponse;
    if (!token.access_token) throw new MotHistoryLookupError("not_configured");
    const lifetimeSeconds = typeof token.expires_in === "number" ? token.expires_in : 1_200;
    cachedToken = {
      value: token.access_token,
      expiresAt: Date.now() + Math.max(lifetimeSeconds - 60, 60) * 1_000,
    };
    return cachedToken.value;
  })().finally(() => {
    tokenRequest = null;
  });

  return tokenRequest;
}

function vehicleYear(vehicle: MotVehicleResponse) {
  const date = vehicle.firstUsedDate || vehicle.registrationDate || vehicle.manufactureDate || "";
  const year = Number(date.slice(0, 4));
  return Number.isInteger(year) && year >= 1900 && year <= new Date().getFullYear() + 1 ? year : null;
}

export async function lookupMotVehicle(registration: string) {
  const env = await runtimeEnv();
  const apiKey = env.MOT_API_KEY?.trim();
  if (!apiKey) throw new MotHistoryLookupError("not_configured");

  const token = await accessToken();
  const response = await fetch(`https://history.mot.api.gov.uk/v1/trade/vehicles/registration/${encodeURIComponent(registration)}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-API-Key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("MOT registration lookup failed", response.status);
    if (response.status === 400) throw new MotHistoryLookupError("invalid");
    if (response.status === 404) throw new MotHistoryLookupError("not_found");
    if (response.status === 429) throw new MotHistoryLookupError("rate_limited");
    if (response.status === 401 || response.status === 403) throw new MotHistoryLookupError("not_configured");
    throw new MotHistoryLookupError("unavailable");
  }

  const body = await response.json() as MotVehicleResponse | MotVehicleResponse[];
  const vehicle = Array.isArray(body) ? body[0] : body;
  if (!vehicle?.make || !vehicle.model) throw new MotHistoryLookupError("unavailable");

  return {
    registration: (vehicle.registration || registration).replace(/\s+/g, "").toUpperCase(),
    make: vehicle.make.trim(),
    model: vehicle.model.trim(),
    year: vehicleYear(vehicle),
  };
}
