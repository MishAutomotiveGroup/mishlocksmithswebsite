import { NextResponse } from "next/server";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  getAdminSession,
  requestIsSameOrigin,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Admin login required." }, { status: 401 });

  const response = NextResponse.json({ loggedIn: true });
  response.cookies.set(ADMIN_ACCESS_COOKIE, session.sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return response;
}
