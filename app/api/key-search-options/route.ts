import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { keyRecords } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const records = await getDb()
      .select({
        id: keyRecords.id,
        make: keyRecords.make,
        model: keyRecords.model,
        yearFrom: keyRecords.yearFrom,
        yearTo: keyRecords.yearTo,
        generation: keyRecords.generation,
      })
      .from(keyRecords)
      .orderBy(
        asc(keyRecords.make),
        asc(keyRecords.model),
        asc(keyRecords.yearFrom),
      );

    return Response.json({ records }, {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Key search options failed", error);
    return Response.json({ error: "Vehicle options are temporarily unavailable." }, { status: 500 });
  }
}
