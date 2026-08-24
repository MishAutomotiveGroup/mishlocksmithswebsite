import { requestIsSameOrigin, sendAdminPasswordEmail } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) {
    return Response.json({ error: "Invalid request." }, { status: 403 });
  }
  try {
    const body = (await request.json()) as { email?: unknown };
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!email || email.length > 254) {
      return Response.json({ error: "Enter your admin email address." }, { status: 400 });
    }
    await sendAdminPasswordEmail(email, `${new URL(request.url).origin}/admin-login`);
    return Response.json({ sent: true });
  } catch (error) {
    console.error("Admin password email failed", error);
    return Response.json({ error: "Unable to send the password email right now." }, { status: 500 });
  }
}

