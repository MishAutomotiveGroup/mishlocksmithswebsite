"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Loader2, Search } from "lucide-react";
import AdminHeader from "@/components/key-database/AdminHeader";

type QuoteSearchView = {
  id: number;
  reference: string;
  createdAt: string;
  make: string;
  model: string;
  year: number;
  yearTo: number | null;
  generation: string | null;
  serviceType: "spare_key" | "all_keys_lost";
  hasWorkingKey: boolean;
  resultStatus: "matched" | "estimated" | "manual_check" | "not_supported" | "not_found";
};

async function readApiError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}

export default function QuoteSearchLog({ adminName }: { adminName: string }) {
  const [searches, setSearches] = useState<QuoteSearchView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    let requestInFlight = false;

    const loadSearches = async (initialLoad = false) => {
      if (requestInFlight) return;
      requestInFlight = true;

      try {
        const response = await fetch("/api/admin/quote-searches", { cache: "no-store" });
        if (response.status === 401) {
          window.location.assign("/admin-login");
          return;
        }
        if (!response.ok) throw new Error(await readApiError(response));
        const body = await response.json() as { searches: QuoteSearchView[] };
        if (active) {
          setSearches(body.searches);
          setError("");
        }
      } catch (loadError: unknown) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load quote searches.");
      } finally {
        requestInFlight = false;
        if (active && initialLoad) setLoading(false);
      }
    };

    void loadSearches(true);
    const refreshTimer = window.setInterval(() => void loadSearches(), 1_000);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return searches;
    return searches.filter((item) => [item.reference, item.make, item.model, String(item.year), item.resultStatus].some((value) => value.toLowerCase().includes(needle)));
  }, [query, searches]);

  const statusLabel = (status: QuoteSearchView["resultStatus"]) => ({
    matched: "Quote matched",
    estimated: "Automated estimate",
    manual_check: "Manual check",
    not_supported: "Not supported",
    not_found: "Vehicle not found",
  })[status];

  return (
    <main className="min-h-screen bg-[#F4F6F8] text-[#171C22]">
      <AdminHeader adminName={adminName} sectionTitle="Quote log" />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1677FF]">Customer activity</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Quote search log</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Every saved key-page search, its quote reference and the vehicle details entered.</p>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reference, vehicle, year or status…" className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100" />
            </div>
            <p className="text-sm text-slate-500">{filtered.length} searches</p>
          </div>

          {loading ? <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin text-[#1677FF]" /> Loading quote log…</div> : null}
          {error ? <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div> : null}
          {!loading && !error && filtered.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center"><ClipboardList className="h-9 w-9 text-slate-300" /><h2 className="mt-4 text-lg font-bold">No quote searches yet</h2><p className="mt-2 text-sm text-slate-500">New searches from the key page will appear here.</p></div> : null}

          {!loading && !error && filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="px-5 py-3">Reference</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Vehicle</th><th className="px-5 py-3">Request</th><th className="px-5 py-3">Working key</th><th className="px-5 py-3">Result</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 font-bold text-[#1677FF]">{item.reference}</td>
                      <td className="px-5 py-4 text-slate-600">{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{item.make} {item.model}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.yearTo && item.yearTo !== item.year ? `${item.year}–${item.yearTo}` : item.year}{item.generation ? ` (${item.generation})` : ""}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{item.serviceType === "spare_key" ? "Spare key" : "All keys lost"}</td>
                      <td className="px-5 py-4 text-slate-600">{item.hasWorkingKey ? "Yes" : "No"}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.resultStatus === "matched" ? "bg-emerald-50 text-emerald-700" : item.resultStatus === "not_supported" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{statusLabel(item.resultStatus)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
