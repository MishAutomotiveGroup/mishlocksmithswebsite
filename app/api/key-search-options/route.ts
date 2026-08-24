import { vehicleCatalogueOptions } from "@/lib/vehicle-catalogue";

export const dynamic = "force-static";

export async function GET() {
  return Response.json({ records: vehicleCatalogueOptions }, {
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
