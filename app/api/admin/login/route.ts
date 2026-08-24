import { NextResponse } from "next/server";
import {
  ADMIN_MFA_FACTOR_COOKIE,
  ADMIN_MFA_MAX_AGE,
  ADMIN_MFA_TOKEN_COOKIE,
  requestIsSameOrigin,
  startAdminLogin,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password || email.length > 254 || password.length > 256) {
      return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
    }
    const result = await startAdminLogin(email, password);
    if (!result) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }
    const response = NextResponse.json({
      stage: result.stage,
      ...(result.stage === "setup"
        ? { qrCode: result.qrCode, secret: result.secret, uri: result.uri }
        : {}),
    });
    response.cookies.set(ADMIN_MFA_TOKEN_COOKIE, result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/admin",
      maxAge: ADMIN_MFA_MAX_AGE,
    });
    response.cookies.set(ADMIN_MFA_FACTOR_COOKIE, result.factorId, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/admin",
      maxAge: ADMIN_MFA_MAX_AGE,
    });
    return response;
  } catch (error) {
    console.error("Admin login failed", error);
    return NextResponse.json({ error: "Login is temporarily unavailable." }, { status: 500 });
  }
}
