import "server-only";

type RuntimeEnv = {
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
};

export async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const { env } = await import("cloudflare:workers");
  const runtime = env as unknown as RuntimeEnv;
  const baseUrl = runtime.SUPABASE_URL?.replace(/\/$/, "");
  const apiKey = runtime.SUPABASE_SECRET_KEY;
  if (!baseUrl || !apiKey) throw new Error("Quote database is not configured.");

  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: apiKey,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error("Supabase request failed", response.status, detail.slice(0, 300));
    throw new Error("Quote database request failed.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

