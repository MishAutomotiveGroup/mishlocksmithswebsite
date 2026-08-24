import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { quoteSearches } from "@/db/schema";
import { getAdminApiSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAdminApiSession();
  if (auth.response) return auth.response;

  try {
    const rows = await getDb()
      .select()
      .from(quoteSearches)
      .orderBy(desc(quoteSearches.createdAt))
      .limit(250);

    return Response.json({
      searches: rows.map((row) => ({
        id: row.id,
        reference: row.referenceNumber ? `#${row.referenceNumber}` : `#${1_000 + row.id}`,
        createdAt: row.createdAt,
        make: row.make,
        model: row.model,
        year: row.year,
        yearTo: row.yearTo,
        generation: row.generation,
        serviceType: row.serviceType,
        hasWorkingKey: row.hasWorkingKey,
        resultStatus: row.resultStatus,
        sourcePage: row.sourcePage,
      })),
    });
  } catch (error) {
    console.error("Admin quote log failed", error);
    return Response.json({ error: "Unable to load quote searches." }, { status: 500 });
  }
}
