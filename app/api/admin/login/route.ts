import { NextResponse } from "next/server";
import {
  ADMIN_ACCESS_COOKIE,
  authenticateAdmin,
  requestIsSameOrigin,
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
    const result = await authenticateAdmin(email, password);
    if (!result) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }
    const response = NextResponse.json({ loggedIn: true });
    response.cookies.set(ADMIN_ACCESS_COOKIE, result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: result.expiresIn,
    });
    return response;
  } catch (error) {
    console.error("Admin login failed", error);
    return NextResponse.json({ error: "Login is temporarily unavailable." }, { status: 500 });
  }
}

