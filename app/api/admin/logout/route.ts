import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_MFA_FACTOR_COOKIE,
  ADMIN_MFA_TOKEN_COOKIE,
  deleteAdminSession,
  requestIsSameOrigin,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }
  const cookieStore = await cookies();
  await deleteAdminSession(cookieStore.get(ADMIN_ACCESS_COOKIE)?.value ?? "");
  const response = NextResponse.json({ loggedOut: true });
  response.cookies.set(ADMIN_ACCESS_COOKIE, "", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 0 });
  response.cookies.set(ADMIN_MFA_TOKEN_COOKIE, "", { httpOnly: true, secure: true, sameSite: "strict", path: "/api/admin", maxAge: 0 });
  response.cookies.set(ADMIN_MFA_FACTOR_COOKIE, "", { httpOnly: true, secure: true, sameSite: "strict", path: "/api/admin", maxAge: 0 });
  return response;
}
