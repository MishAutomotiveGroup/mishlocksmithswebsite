import { getAdminApiSession } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type QuoteSearchRow = {
  id: number;
  created_at: string;
  make: string;
  model: string;
  year: number;
  service_type: "spare_key" | "all_keys_lost";
  has_working_key: boolean;
  result_status: "matched" | "manual_check" | "not_supported" | "not_found";
  source_page: string | null;
};

export async function GET() {
  const auth = await getAdminApiSession();
  if (auth.response) return auth.response;
  try {
    const params = new URLSearchParams({
      select: "id,created_at,make,model,year,service_type,has_working_key,result_status,source_page",
      order: "created_at.desc",
      limit: "250",
    });
    const rows = await supabaseRequest<QuoteSearchRow[]>(`quote_searches?${params}`);
    return Response.json({
      searches: rows.map((row) => ({
        id: row.id,
        reference: `MCK-${String(row.id).padStart(6, "0")}`,
        createdAt: row.created_at,
        make: row.make,
        model: row.model,
        year: row.year,
        serviceType: row.service_type,
        hasWorkingKey: row.has_working_key,
        resultStatus: row.result_status,
        sourcePage: row.source_page,
      })),
    });
  } catch (error) {
    console.error("Admin quote log failed", error);
    return Response.json({ error: "Unable to load quote searches." }, { status: 500 });
  }
}

