import "server-only";

import { env } from "cloudflare:workers";
import { getChatGPTUser, type ChatGPTUser } from "@/app/chatgpt-auth";

type KeyDatabaseEnv = {
  KEY_DATABASE_ADMIN_EMAIL?: string;
};

function configuredAdminEmails() {
  const value = (env as unknown as KeyDatabaseEnv).KEY_DATABASE_ADMIN_EMAIL;
  return new Set(
    (value ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isKeyDatabaseAdmin(user: ChatGPTUser) {
  return configuredAdminEmails().has(user.email.toLowerCase());
}

export async function getKeyDatabaseApiUser() {
  const user = await getChatGPTUser();
  if (!user) {
    return { user: null, response: Response.json({ error: "Sign in required" }, { status: 401 }) };
  }
  if (!isKeyDatabaseAdmin(user)) {
    return { user: null, response: Response.json({ error: "Access denied" }, { status: 403 }) };
  }
  return { user, response: null };
}

