import { requestIsSameOrigin, setAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) {
    return Response.json({ error: "Invalid request." }, { status: 403 });
  }
  try {
    const body = (await request.json()) as { accessToken?: unknown; password?: unknown };
    const accessToken = typeof body.accessToken === "string" ? body.accessToken : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!accessToken || password.length < 10 || password.length > 256) {
      return Response.json({ error: "Use a password with at least 10 characters." }, { status: 400 });
    }
    const updated = await setAdminPassword(accessToken, password);
    if (!updated) return Response.json({ error: "This password link is invalid or has expired." }, { status: 401 });
    return Response.json({ updated: true });
  } catch (error) {
    console.error("Admin password update failed", error);
    return Response.json({ error: "Unable to update the password." }, { status: 500 });
  }
}

