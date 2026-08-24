import { NextResponse } from "next/server";
import { ADMIN_ACCESS_COOKIE, requestIsSameOrigin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }
  const response = NextResponse.json({ loggedOut: true });
  response.cookies.set(ADMIN_ACCESS_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}

