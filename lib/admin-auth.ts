import "server-only";

import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { adminSessions } from "@/db/schema";

export const ADMIN_ACCESS_COOKIE = "mish_admin_session";
export const ADMIN_MFA_TOKEN_COOKIE = "mish_admin_mfa_token";
export const ADMIN_MFA_FACTOR_COOKIE = "mish_admin_mfa_factor";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 400;
export const ADMIN_MFA_MAX_AGE = 60 * 10;
const LEGACY_ADMIN_EMAIL = "bigmishkah@gmail.com";

type RuntimeEnv = {
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  KEY_DATABASE_ADMIN_EMAIL?: string;
};

type SupabaseFactor = {
  id: string;
  factor_type: string;
  status: "verified" | "unverified";
};

type SupabaseUser = {
  id: string;
  email?: string;
  updated_at?: string;
  factors?: SupabaseFactor[];
  user_metadata?: { full_name?: string; name?: string };
};

type SupabaseSession = {
  access_token?: string;
  user?: SupabaseUser;
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

function authHeaders(apiKey: string, accessToken?: string) {
  return {
    apikey: apiKey,
    Authorization: `Bearer ${accessToken ?? apiKey}`,
    "Content-Type": "application/json",
  };
}

async function readAuthError(response: Response) {
  try {
    const body = (await response.json()) as { msg?: string; message?: string; error_description?: string };
    return body.msg ?? body.message ?? body.error_description ?? "Authentication failed.";
  } catch {
    return "Authentication failed.";
  }
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function getAdminUser(userId: string) {
  const config = await runtimeConfig();
  const response = await fetch(`${config.baseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
    headers: authHeaders(config.apiKey),
    cache: "no-store",
  });
  if (!response.ok) return null;
  return (await response.json()) as SupabaseUser;
}

export async function startAdminLogin(email: string, password: string) {
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
  const result = (await response.json()) as SupabaseSession;
  if (!result.access_token || !result.user?.email) return null;
  if (result.user.email.toLowerCase() !== config.adminEmail) return null;

  const verifiedFactor = result.user.factors?.find(
    (factor) => factor.factor_type === "totp" && factor.status === "verified",
  );
  if (verifiedFactor) {
    return {
      stage: "verify" as const,
      accessToken: result.access_token,
      factorId: verifiedFactor.id,
    };
  }

  for (const factor of result.user.factors ?? []) {
    if (factor.factor_type !== "totp" || factor.status !== "unverified") continue;
    await fetch(`${config.baseUrl}/auth/v1/factors/${encodeURIComponent(factor.id)}`, {
      method: "DELETE",
      headers: authHeaders(config.apiKey, result.access_token),
    });
  }

  const enrollResponse = await fetch(`${config.baseUrl}/auth/v1/factors`, {
    method: "POST",
    headers: authHeaders(config.apiKey, result.access_token),
    body: JSON.stringify({
      factor_type: "totp",
      friendly_name: "Microsoft Authenticator",
      issuer: "Mish Auto Locksmiths",
    }),
  });
  if (!enrollResponse.ok) throw new Error(await readAuthError(enrollResponse));
  const enrollment = (await enrollResponse.json()) as {
    id?: string;
    totp?: { qr_code?: string; secret?: string; uri?: string };
  };
  if (!enrollment.id || !enrollment.totp?.qr_code || !enrollment.totp.secret) {
    throw new Error("Authenticator setup could not be started.");
  }
  return {
    stage: "setup" as const,
    accessToken: result.access_token,
    factorId: enrollment.id,
    qrCode: enrollment.totp.qr_code,
    secret: enrollment.totp.secret,
    uri: enrollment.totp.uri ?? "",
  };
}

export async function verifyAdminMfa(accessToken: string, factorId: string, code: string) {
  const config = await runtimeConfig();
  const challengeResponse = await fetch(
    `${config.baseUrl}/auth/v1/factors/${encodeURIComponent(factorId)}/challenge`,
    {
      method: "POST",
      headers: authHeaders(config.apiKey, accessToken),
      body: "{}",
    },
  );
  if (!challengeResponse.ok) throw new Error(await readAuthError(challengeResponse));
  const challenge = (await challengeResponse.json()) as { id?: string };
  if (!challenge.id) throw new Error("Authenticator challenge could not be created.");

  const verifyResponse = await fetch(
    `${config.baseUrl}/auth/v1/factors/${encodeURIComponent(factorId)}/verify`,
    {
      method: "POST",
      headers: authHeaders(config.apiKey, accessToken),
      body: JSON.stringify({ challenge_id: challenge.id, code }),
    },
  );
  if (!verifyResponse.ok) throw new Error("That authenticator code is incorrect or has expired.");
  const verified = (await verifyResponse.json()) as SupabaseSession;
  if (!verified.access_token) throw new Error("Authenticator verification failed.");

  const userResponse = await fetch(`${config.baseUrl}/auth/v1/user`, {
    headers: authHeaders(config.apiKey, verified.access_token),
    cache: "no-store",
  });
  if (!userResponse.ok) throw new Error("Authenticator verification failed.");
  const verifiedUser = (await userResponse.json()) as SupabaseUser;
  if (!verifiedUser.email || verifiedUser.email.toLowerCase() !== config.adminEmail) {
    throw new Error("This account is not authorised.");
  }

  const currentUser = await getAdminUser(verifiedUser.id);
  if (!currentUser?.email || currentUser.email.toLowerCase() !== config.adminEmail) {
    throw new Error("Unable to create the trusted browser session.");
  }
  const sessionToken = randomToken();
  const tokenHash = await hashToken(sessionToken);
  const now = new Date().toISOString();
  await getDb().insert(adminSessions).values({
    tokenHash,
    userId: verifiedUser.id,
    adminEmail: config.adminEmail,
    authUpdatedAt: currentUser.updated_at ?? now,
    createdAt: now,
    lastUsedAt: now,
  });
  return { sessionToken };
}

export async function sendAdminPasswordEmail(email: string, redirectTo: string) {
  const config = await runtimeConfig();
  if (email.trim().toLowerCase() !== config.adminEmail) return;
  const usersResponse = await fetch(`${config.baseUrl}/auth/v1/admin/users?page=1&per_page=1000`, {
    headers: authHeaders(config.apiKey),
    cache: "no-store",
  });
  if (!usersResponse.ok) throw new Error("Unable to check the admin account.");
  const usersBody = (await usersResponse.json()) as { users?: SupabaseUser[] };
  let exists = (usersBody.users ?? []).some((user) => user.email?.toLowerCase() === config.adminEmail);

  // One-time migration from the original personal Gmail address. This keeps
  // the existing password and authenticator factors attached to the account.
  if (!exists) {
    const legacyUser = (usersBody.users ?? []).find(
      (user) => user.email?.toLowerCase() === LEGACY_ADMIN_EMAIL,
    );
    if (legacyUser) {
      const updateEmail = await fetch(
        `${config.baseUrl}/auth/v1/admin/users/${encodeURIComponent(legacyUser.id)}`,
        {
          method: "PUT",
          headers: authHeaders(config.apiKey),
          body: JSON.stringify({ email: config.adminEmail, email_confirm: true }),
        },
      );
      if (!updateEmail.ok) throw new Error("Unable to move the admin account to the new email address.");
      await getDb().delete(adminSessions).where(eq(adminSessions.userId, legacyUser.id));
      exists = true;
    }
  }

  const endpoint = exists ? "recover" : "invite";
  const response = await fetch(
    `${config.baseUrl}/auth/v1/${endpoint}?redirect_to=${encodeURIComponent(redirectTo)}`,
    {
      method: "POST",
      headers: authHeaders(config.apiKey),
      body: JSON.stringify({ email: config.adminEmail }),
    },
  );
  if (!response.ok) throw new Error("Unable to send the password email.");
}

export async function setAdminPassword(accessToken: string, password: string) {
  const config = await runtimeConfig();
  const userResponse = await fetch(`${config.baseUrl}/auth/v1/user`, {
    headers: authHeaders(config.apiKey, accessToken),
    cache: "no-store",
  });
  if (!userResponse.ok) return false;
  const user = (await userResponse.json()) as SupabaseUser;
  if (!user.email || user.email.toLowerCase() !== config.adminEmail) return false;

  // Revoke every trusted browser before changing the credential. If the
  // password update later fails, signing in again is safer than leaving a
  // stale trusted session active.
  await getDb().delete(adminSessions).where(eq(adminSessions.userId, user.id));
  const updateResponse = await fetch(`${config.baseUrl}/auth/v1/user`, {
    method: "PUT",
    headers: authHeaders(config.apiKey, accessToken),
    body: JSON.stringify({ password }),
  });
  if (!updateResponse.ok) return false;
  return true;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value;
  if (!sessionToken) return null;

  try {
    const config = await runtimeConfig();
    const tokenHash = await hashToken(sessionToken);
    const [session] = await getDb()
      .select()
      .from(adminSessions)
      .where(eq(adminSessions.tokenHash, tokenHash))
      .limit(1);
    if (!session || session.adminEmail !== config.adminEmail) return null;

    const user = await getAdminUser(session.userId);
    if (
      !user?.email ||
      user.email.toLowerCase() !== config.adminEmail
    ) {
      await getDb().delete(adminSessions).where(eq(adminSessions.tokenHash, tokenHash));
      return null;
    }
    await getDb()
      .update(adminSessions)
      .set({ lastUsedAt: new Date().toISOString() })
      .where(eq(adminSessions.tokenHash, tokenHash));
    return {
      id: user.id,
      email: user.email,
      displayName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email,
      sessionToken,
    };
  } catch {
    return null;
  }
}

export async function deleteAdminSession(sessionToken: string) {
  if (!sessionToken) return;
  await getDb().delete(adminSessions).where(eq(adminSessions.tokenHash, await hashToken(sessionToken)));
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
