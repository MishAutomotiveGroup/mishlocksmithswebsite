import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_MFA_FACTOR_COOKIE,
  ADMIN_MFA_TOKEN_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  requestIsSameOrigin,
  verifyAdminMfa,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }
  try {
    const body = (await request.json()) as { code?: unknown };
    const code = typeof body.code === "string" ? body.code.replace(/\D/g, "") : "";
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Enter the six-digit code from Microsoft Authenticator." }, { status: 400 });
    }
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ADMIN_MFA_TOKEN_COOKIE)?.value ?? "";
    const factorId = cookieStore.get(ADMIN_MFA_FACTOR_COOKIE)?.value ?? "";
    if (!accessToken || !factorId) {
      return NextResponse.json({ error: "This sign-in has expired. Enter your email and password again." }, { status: 401 });
    }

    const result = await verifyAdminMfa(accessToken, factorId, code);
    const response = NextResponse.json({ loggedIn: true });
    response.cookies.set(ADMIN_ACCESS_COOKIE, result.sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });
    for (const name of [ADMIN_MFA_TOKEN_COOKIE, ADMIN_MFA_FACTOR_COOKIE]) {
      response.cookies.set(name, "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/api/admin",
        maxAge: 0,
      });
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify the authenticator code.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
