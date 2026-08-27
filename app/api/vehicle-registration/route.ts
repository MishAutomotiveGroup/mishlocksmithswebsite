import { lookupMotVehicle, MotHistoryLookupError } from "@/lib/mot-history-server";

export const dynamic = "force-dynamic";

function json(payload: unknown, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { registration?: unknown };
    const registration = typeof payload.registration === "string"
      ? payload.registration.toUpperCase().replace(/[^A-Z0-9]/g, "")
      : "";
    if (!/^[A-Z0-9]{2,8}$/.test(registration)) {
      return json({ error: "Enter a valid registration number." }, 400);
    }

    const vehicle = await lookupMotVehicle(registration);
    return json({ vehicle });
  } catch (error) {
    if (error instanceof MotHistoryLookupError) {
      if (error.code === "invalid") return json({ error: "Enter a valid registration number." }, 400);
      if (error.code === "not_found") return json({ error: "We couldn't find a vehicle with that registration." }, 404);
      if (error.code === "rate_limited") return json({ error: "Registration search is busy. Please wait a moment and try again." }, 429);
      if (error.code === "not_configured") return json({ error: "Registration search is temporarily unavailable." }, 503);
    }
    console.error("Vehicle registration search failed", error);
    return json({ error: "We couldn't check that registration right now. Please use the manual vehicle search." }, 502);
  }
}
