import "server-only";

import { cookies } from "next/headers";

export const ADMIN_ACCESS_COOKIE = "mish_admin_access";

type RuntimeEnv = {
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  KEY_DATABASE_ADMIN_EMAIL?: string;
};

type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; name?: string };
};

async function runtimeConfig() {
  const { env } = await import("cloudflare:workers");
  const runtime = env as unknown as RuntimeEnv;
  const baseUrl = runtime.SUPABASE_URL?.replace(/\/$/, "");
  const apiKey = runtime.SUPABASE_SECRET_KEY;
  const adminEmail = runtime.KEY_DATABASE_ADMIN_EMAIL?.trim().toLowerCase();
  if (!baseUrl || !apiKey || !adminEmail) {
    throw new Error("Admin authentication is not configured.");
  }
  return { baseUrl, apiKey, adminEmail };
}

function adminHeaders(apiKey: string) {
  return {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

export async function authenticateAdmin(email: string, password: string) {
  const config = await runtimeConfig();
  if (email.trim().toLowerCase() !== config.adminEmail) return null;

  const response = await fetch(`${config.baseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: config.adminEmail, password }),
  });
  if (!response.ok) return null;
  const result = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    user?: SupabaseUser;
  };
  if (!result.access_token || !result.user?.email) return null;
  if (result.user.email.toLowerCase() !== config.adminEmail) return null;
  return {
    accessToken: result.access_token,
    expiresIn: Math.min(Math.max(result.expires_in ?? 3600, 300), 86_400),
    user: result.user,
  };
}

export async function sendAdminPasswordEmail(email: string, redirectTo: string) {
  const config = await runtimeConfig();
  if (email.trim().toLowerCase() !== config.adminEmail) return;
  const usersResponse = await fetch(`${config.baseUrl}/auth/v1/admin/users?page=1&per_page=1000`, {
    headers: adminHeaders(config.apiKey),
    cache: "no-store",
  });
  if (!usersResponse.ok) throw new Error("Unable to check the admin account.");
  const usersBody = (await usersResponse.json()) as { users?: SupabaseUser[] };
  const exists = (usersBody.users ?? []).some((user) => user.email?.toLowerCase() === config.adminEmail);

  const endpoint = exists ? "recover" : "invite";
  const response = await fetch(
    `${config.baseUrl}/auth/v1/${endpoint}?redirect_to=${encodeURIComponent(redirectTo)}`,
    {
      method: "POST",
      headers: adminHeaders(config.apiKey),
      body: JSON.stringify({ email: config.adminEmail }),
    },
  );
  if (!response.ok) throw new Error("Unable to send the password email.");
}

export async function setAdminPassword(accessToken: string, password: string) {
  const config = await runtimeConfig();
  const userResponse = await fetch(`${config.baseUrl}/auth/v1/user`, {
    headers: {
      apikey: config.apiKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  if (!userResponse.ok) return false;
  const user = (await userResponse.json()) as SupabaseUser;
  if (!user.email || user.email.toLowerCase() !== config.adminEmail) return false;

  const updateResponse = await fetch(`${config.baseUrl}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: config.apiKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });
  return updateResponse.ok;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value;
  if (!accessToken) return null;

  try {
    const config = await runtimeConfig();
    const response = await fetch(`${config.baseUrl}/auth/v1/user`, {
      headers: {
        apikey: config.apiKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const user = (await response.json()) as SupabaseUser;
    if (!user.email || user.email.toLowerCase() !== config.adminEmail) return null;
    return {
      id: user.id,
      email: user.email,
      displayName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email,
    };
  } catch {
    return null;
  }
}

export async function getAdminApiSession() {
  const user = await getAdminSession();
  if (!user) {
    return {
      user: null,
      response: Response.json({ error: "Admin login required." }, { status: 401 }),
    };
  }
  return { user, response: null };
}

export function requestIsSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
