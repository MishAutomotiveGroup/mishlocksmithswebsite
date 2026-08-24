"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CarFront,
  Check,
  ChevronRight,
  ClipboardList,
  Clock3,
  KeyRound,
  Loader2,
  LogOut,
  PackageCheck,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import {
  emptyKeyRecord,
  formatPrice,
  formatVehicleYears,
  yesNoLabel,
  type KeyRecordPayload,
  type KeyRecordView,
  type PinMethod,
  type PowerSupplyRequirement,
  type YesNoUnknown,
} from "@/lib/key-records";

type Props = {
  adminName: string;
};

type PhotoFiles = {
  carPhoto: File | null;
  oemKeyPhoto: File | null;
  universalKeyPhoto: File | null;
};

type RemovedPhotos = {
  carPhoto: boolean;
  oemKeyPhoto: boolean;
  universalKeyPhoto: boolean;
};

const emptyFiles: PhotoFiles = {
  carPhoto: null,
  oemKeyPhoto: null,
  universalKeyPhoto: null,
};

const emptyRemoved: RemovedPhotos = {
  carPhoto: false,
  oemKeyPhoto: false,
  universalKeyPhoto: false,
};

const pinLabels: Record<Exclude<PinMethod, null>, string> = {
  readable_by_autel: "Readable by Autel",
  purchase_online: "Purchase online",
  not_required: "Not required",
  unobtainable: "Unobtainable",
};

function payloadFromRecord(record: KeyRecordView): KeyRecordPayload {
  const payload = { ...record } as KeyRecordPayload & Partial<KeyRecordView>;
  delete payload.id;
  delete payload.carPhotoUrl;
  delete payload.oemKeyPhotoUrl;
  delete payload.universalKeyPhotoUrl;
  delete payload.createdAt;
  delete payload.updatedAt;
  return payload;
}

async function readApiError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}

export default function KeyDatabaseAdmin({ adminName }: Props) {
  const [records, setRecords] = useState<KeyRecordView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<KeyRecordView | null | "new">(null);
  const [activeTab, setActiveTab] = useState<"database" | "quotes">("database");

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/key-records", { cache: "no-store" });
      if (!response.ok) throw new Error(await readApiError(response));
      const body = (await response.json()) as { records: KeyRecordView[] };
      setRecords(body.records);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load the database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/session", { method: "POST" }).then((response) => {
      if (response.status === 401) window.location.assign("/admin-login");
    });
    fetch("/api/key-records", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(await readApiError(response));
        return response.json() as Promise<{ records: KeyRecordView[] }>;
      })
      .then((body) => {
        if (active) setRecords(body.records);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load the database.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;
    return records.filter((record) =>
      [
        record.make,
        record.model,
        record.keyBlankCode,
        record.compatibleUniversalKeys,
        String(record.yearFrom),
        String(record.yearTo ?? ""),
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [records, search]);

  function recordSaved(record: KeyRecordView) {
    setRecords((current) => {
      const without = current.filter((item) => item.id !== record.id);
      return [record, ...without];
    });
    setEditing(null);
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin-login");
  }

  if (editing) {
    return (
      <RecordEditor
        record={editing === "new" ? null : editing}
        onCancel={() => setEditing(null)}
        onSaved={recordSaved}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F6F8] text-[#171C22]">
      <header className="border-b border-slate-800 bg-[#171C22] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" aria-label="Return to website" className="shrink-0">
              <img src="/logo-on-dark.svg" alt="Mish Auto Locksmiths" className="h-8 w-auto sm:h-9" />
            </Link>
            <div className="hidden h-8 w-px bg-slate-700 sm:block" />
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold">Key database</p>
              <p className="truncate text-xs text-slate-400">Private admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-48 truncate text-xs text-slate-400 lg:block">{adminName}</span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-700 px-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button type="button" onClick={() => setActiveTab("database")} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${activeTab === "database" ? "bg-[#171C22] text-white" : "text-slate-500 hover:text-slate-900"}`}>
            <KeyRound className="h-4 w-4" /> Key database
          </button>
          <button type="button" onClick={() => setActiveTab("quotes")} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${activeTab === "quotes" ? "bg-[#171C22] text-white" : "text-slate-500 hover:text-slate-900"}`}>
            <ClipboardList className="h-4 w-4" /> Quote log
          </button>
        </div>

        {activeTab === "quotes" ? <QuoteSearchLog /> : <>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1677FF]">Internal tools</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Vehicle key database</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Check programming capability, equipment, stock, suppliers, lead times and prices before accepting a job.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1677FF] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0D63DA]"
          >
            <Plus className="h-5 w-5" /> Add key record
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard icon={KeyRound} label="Key records" value={String(records.length)} />
          <SummaryCard
            icon={ShieldCheck}
            label="AKL confirmed"
            value={String(records.filter((record) => record.aklCompatible === true).length)}
          />
          <SummaryCard
            icon={PackageCheck}
            label="Universal keys in stock"
            value={String(records.filter((record) => record.universalKeyInStock === true).length)}
          />
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search make, model, year or key blank…"
                className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <p className="text-sm text-slate-500">
              {filteredRecords.length} {filteredRecords.length === 1 ? "record" : "records"}
            </p>
          </div>

          {error ? (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
              <button type="button" onClick={() => void loadRecords()} className="ml-2 font-bold underline">
                Try again
              </button>
            </div>
          ) : null}

          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-[#1677FF]" /> Loading database…
            </div>
          ) : filteredRecords.length === 0 ? (
            <EmptyState hasSearch={Boolean(search.trim())} onAdd={() => setEditing("new")} />
          ) : (
            <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-2">
              {filteredRecords.map((record) => (
                <RecordCard
                  key={record.id}
                  record={record}
                  onEdit={() => setEditing(record)}
                />
              ))}
            </div>
          )}
        </div>
        </>}
      </section>
    </main>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof KeyRound; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1677FF]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-extrabold">{value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ hasSearch, onAdd }: { hasSearch: boolean; onAdd: () => void }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#1677FF]">
        {hasSearch ? <Search className="h-7 w-7" /> : <KeyRound className="h-7 w-7" />}
      </div>
      <h2 className="mt-5 text-xl font-bold">{hasSearch ? "No matching records" : "Your database is ready"}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasSearch
          ? "Try another make, model, year or key blank code."
          : "It is empty as requested. Add the first vehicle and key application when you are ready."}
      </p>
      {!hasSearch ? (
        <button
          type="button"
          onClick={onAdd}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1677FF] px-5 py-3 text-sm font-bold text-white hover:bg-[#0D63DA]"
        >
          <Plus className="h-4 w-4" /> Add first record
        </button>
      ) : null}
    </div>
  );
}

function RecordCard({
  record,
  onEdit,
}: {
  record: KeyRecordView;
  onEdit: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-blue-200 hover:shadow-md">
      <div className="grid grid-cols-[7.5rem_1fr] sm:grid-cols-[10rem_1fr]">
        <div className="min-h-44 bg-slate-100">
          {record.carPhotoUrl ? (
            <img src={record.carPhotoUrl} alt={`${record.make} ${record.model}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-44 items-center justify-center text-slate-300">
              <CarFront className="h-10 w-10" />
            </div>
          )}
        </div>
        <div className="min-w-0 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1677FF]">
                {formatVehicleYears(record.yearFrom, record.yearTo)}
              </p>
              <h3 className="mt-1 truncate text-xl font-extrabold">{record.make} {record.model}</h3>
            </div>
            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-300" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill label="AKL" value={record.aklCompatible} />
            <StatusPill label="Add key" value={record.addKeyCompatible} />
            <StatusPill label="Clone" value={record.keyCloning} />
          </div>
          <div className="mt-4 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
            <p><span className="font-semibold text-slate-700">Blank:</span> {record.keyBlankCode || "Not set"}</p>
            <p><span className="font-semibold text-slate-700">Lead:</span> {record.leadTime || "Not set"}</p>
            <p><span className="font-semibold text-slate-700">OEM:</span> {formatPrice(record.oemPricePence)}</p>
            <p><span className="font-semibold text-slate-700">Universal:</span> {formatPrice(record.universalPricePence)}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-slate-100 px-4 py-3">
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-2 rounded-lg bg-[#171C22] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700">
          <ChevronRight className="h-4 w-4" /> View details
        </button>
      </div>
    </article>
  );
}

function StatusPill({ label, value }: { label: string; value: YesNoUnknown }) {
  const style = value === true
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : value === false
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-slate-200 bg-slate-50 text-slate-500";
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${style}`}>{label}: {yesNoLabel(value)}</span>;
}

type QuoteSearchView = {
  id: number;
  reference: string;
  createdAt: string;
  make: string;
  model: string;
  year: number;
  serviceType: "spare_key" | "all_keys_lost";
  hasWorkingKey: boolean;
  resultStatus: "matched" | "manual_check" | "not_supported" | "not_found";
};

function QuoteSearchLog() {
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
    manual_check: "Manual check",
    not_supported: "Not supported",
    not_found: "Vehicle not found",
  })[status];

  return (
    <div>
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
                    <td className="px-5 py-4"><p className="font-bold text-slate-900">{item.year} {item.make} {item.model}</p></td>
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
    </div>
  );
}

function RecordEditor({
  record,
  onCancel,
  onSaved,
}: {
  record: KeyRecordView | null;
  onCancel: () => void;
  onSaved: (record: KeyRecordView) => void;
}) {
  const [form, setForm] = useState<KeyRecordPayload>(() => record ? payloadFromRecord(record) : { ...emptyKeyRecord });
  const [yearTo, setYearTo] = useState(record?.yearTo ? String(record.yearTo) : "");
  const [oemPrice, setOemPrice] = useState(record?.oemPricePence !== null && record?.oemPricePence !== undefined ? (record.oemPricePence / 100).toFixed(2) : "");
  const [universalPrice, setUniversalPrice] = useState(record?.universalPricePence !== null && record?.universalPricePence !== undefined ? (record.universalPricePence / 100).toFixed(2) : "");
  const [files, setFiles] = useState<PhotoFiles>(emptyFiles);
  const [removed, setRemoved] = useState<RemovedPhotos>(emptyRemoved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(!record);

  function update<K extends keyof KeyRecordPayload>(field: K, value: KeyRecordPayload[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const priceToPence = (value: string) => {
        if (!value.trim()) return null;
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 0) throw new Error("Prices must be valid positive amounts.");
        return Math.round(parsed * 100);
      };
      const payload: KeyRecordPayload = {
        ...form,
        yearFrom: Number(form.yearFrom),
        yearTo: yearTo.trim() ? Number(yearTo) : null,
        oemPricePence: priceToPence(oemPrice),
        universalPricePence: priceToPence(universalPrice),
      };
      const body = new FormData();
      body.set("payload", JSON.stringify(payload));
      if (files.carPhoto) body.set("carPhoto", files.carPhoto);
      if (files.oemKeyPhoto) body.set("oemKeyPhoto", files.oemKeyPhoto);
      if (files.universalKeyPhoto) body.set("universalKeyPhoto", files.universalKeyPhoto);
      body.set("removeCarPhoto", String(removed.carPhoto));
      body.set("removeOemKeyPhoto", String(removed.oemKeyPhoto));
      body.set("removeUniversalKeyPhoto", String(removed.universalKeyPhoto));

      const response = await fetch(record ? `/api/key-records/${record.id}` : "/api/key-records", {
        method: record ? "PUT" : "POST",
        body,
      });
      if (!response.ok) throw new Error(await readApiError(response));
      const result = (await response.json()) as { record: KeyRecordView };
      onSaved(result.record);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save the record.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F6F8] text-[#171C22]">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#171C22] text-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white">
            <ArrowLeft className="h-5 w-5" /> Back to database
          </button>
          {record && !editMode ? (
            <button type="button" onClick={() => setEditMode(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#1677FF] px-4 py-2 text-sm font-bold text-white hover:bg-[#0D63DA]">
              <Pencil className="h-4 w-4" /> Edit record
            </button>
          ) : <p className="hidden text-sm font-semibold sm:block">{record ? "Editing key record" : "New key record"}</p>}
        </div>
      </header>

      <form onSubmit={submit} className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1677FF]">{record ? editMode ? "Editing record" : "Read-only record" : "Add record"}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{record ? `${record.make} ${record.model}` : "Vehicle and key details"}</h1>
          <p className="mt-2 text-sm text-slate-600">Leave anything you have not verified as “Not checked.”</p>
        </div>

        {error ? <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div> : null}

        <fieldset disabled={!editMode} className="space-y-5 disabled:[&_input]:cursor-default disabled:[&_input]:bg-slate-50 disabled:[&_select]:cursor-default disabled:[&_select]:bg-slate-50 disabled:[&_textarea]:cursor-default disabled:[&_textarea]:bg-slate-50">
          <FormSection title="Vehicle application" description="The make, model and production years this key setup applies to." icon={CarFront}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Make" required value={form.make} onChange={(value) => update("make", value)} placeholder="e.g. Ford" />
              <TextField label="Model" required value={form.model} onChange={(value) => update("model", value)} placeholder="e.g. Focus" />
              <NumberField label="Start year" required value={String(form.yearFrom)} onChange={(value) => update("yearFrom", Number(value))} placeholder="2015" />
              <NumberField label="End year" value={yearTo} onChange={setYearTo} placeholder="Leave blank for one year" />
            </div>
          </FormSection>

          <FormSection title="Reference photos" description="Upload a vehicle, AFM / OEM-style key and compatible universal key photo." icon={Upload}>
            <div className="grid gap-4 md:grid-cols-3">
              <PhotoField
                label="Car photo"
                existingUrl={record?.carPhotoUrl ?? null}
                file={files.carPhoto}
                removed={removed.carPhoto}
                onFile={(file) => { setFiles((value) => ({ ...value, carPhoto: file })); setRemoved((value) => ({ ...value, carPhoto: false })); }}
                onRemove={() => { setFiles((value) => ({ ...value, carPhoto: null })); setRemoved((value) => ({ ...value, carPhoto: true })); }}
              />
              <PhotoField
                label="AFM / OEM-style key photo"
                existingUrl={record?.oemKeyPhotoUrl ?? null}
                file={files.oemKeyPhoto}
                removed={removed.oemKeyPhoto}
                onFile={(file) => { setFiles((value) => ({ ...value, oemKeyPhoto: file })); setRemoved((value) => ({ ...value, oemKeyPhoto: false })); }}
                onRemove={() => { setFiles((value) => ({ ...value, oemKeyPhoto: null })); setRemoved((value) => ({ ...value, oemKeyPhoto: true })); }}
              />
              <PhotoField
                label="Universal key photo"
                existingUrl={record?.universalKeyPhotoUrl ?? null}
                file={files.universalKeyPhoto}
                removed={removed.universalKeyPhoto}
                onFile={(file) => { setFiles((value) => ({ ...value, universalKeyPhoto: file })); setRemoved((value) => ({ ...value, universalKeyPhoto: false })); }}
                onRemove={() => { setFiles((value) => ({ ...value, universalKeyPhoto: null })); setRemoved((value) => ({ ...value, universalKeyPhoto: true })); }}
              />
            </div>
          </FormSection>

          <FormSection title="Programming compatibility" description="Confirm what can be done with the equipment and process currently available." icon={ShieldCheck}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <TriStateField label="Transponder clonable?" value={form.transponderClonable} onChange={(value) => update("transponderClonable", value)} />
              <PowerSupplyField value={form.powerSupplyRequirement} onChange={(value) => update("powerSupplyRequirement", value)} />
              <TriStateField label="AKL compatible?" value={form.aklCompatible} onChange={(value) => update("aklCompatible", value)} />
              <TriStateField label="Add key compatible?" value={form.addKeyCompatible} onChange={(value) => update("addKeyCompatible", value)} />
              <TriStateField label="Key cloning?" value={form.keyCloning} onChange={(value) => update("keyCloning", value)} />
              <TriStateField label="Universal key compatible?" value={form.universalKeyCompatible} onChange={(value) => update("universalKeyCompatible", value)} />
            </div>
            {form.universalKeyCompatible === true ? <div className="mt-4">
              <TextField label="Compatible universal key(s)" value={form.compatibleUniversalKeys} onChange={(value) => update("compatibleUniversalKeys", value)} placeholder="Enter model names or codes" />
            </div> : null}
          </FormSection>

          <FormSection title="PIN codes and blade" description="Record how each PIN is obtained and the blade code needed." icon={KeyRound}>
            <div className="grid gap-4 sm:grid-cols-2">
              <PinMethodField label="PIN code for AKL" value={form.aklPinMethod} supplier={form.aklPinSupplier} onMethod={(value) => update("aklPinMethod", value)} onSupplier={(value) => update("aklPinSupplier", value)} />
              <PinMethodField label="PIN code for add key" value={form.addKeyPinMethod} supplier={form.addKeyPinSupplier} onMethod={(value) => update("addKeyPinMethod", value)} onSupplier={(value) => update("addKeyPinSupplier", value)} />
              <TextField label="Key blank code" value={form.keyBlankCode} onChange={(value) => update("keyBlankCode", value)} placeholder="e.g. HU101" />
              <TriStateField label="Lishi in stock?" value={form.lishiInStock} onChange={(value) => update("lishiInStock", value)} />
            </div>
          </FormSection>

          <FormSection title="Stock and suppliers" description="Track whether parts are ready now and where to order them if not." icon={PackageCheck}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TriStateField label="Key blanks in stock?" value={form.keyBlanksInStock} onChange={(value) => update("keyBlanksInStock", value)} />
              <div className="hidden sm:block" />
              <TriStateField label="Universal key in stock?" value={form.universalKeyInStock} onChange={(value) => update("universalKeyInStock", value)} />
              {form.universalKeyInStock === false ? <TextField label="Universal key supplier" value={form.universalKeySupplier} onChange={(value) => update("universalKeySupplier", value)} placeholder="Enter supplier" /> : <div />}
              <TriStateField label="AFM / OEM-style key in stock?" value={form.oemKeyInStock} onChange={(value) => update("oemKeyInStock", value)} />
              {form.oemKeyInStock === false ? <TextField label="AFM / OEM-style key supplier" value={form.oemKeySupplier} onChange={(value) => update("oemKeySupplier", value)} placeholder="Enter supplier" /> : <div />}
            </div>
          </FormSection>

          <FormSection title="Lead time and prices" description="Use current stock and supplier shipping times to estimate availability." icon={Clock3}>
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField label="Lead time" value={form.leadTime} onChange={(value) => update("leadTime", value)} placeholder="e.g. Same day / 2–3 days" />
              <MoneyField label="OEM / AFM key price" value={oemPrice} onChange={setOemPrice} />
              <MoneyField label="Universal key price" value={universalPrice} onChange={setUniversalPrice} />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700">
                Notes
                <textarea
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  rows={4}
                  placeholder="Equipment, procedure, restrictions or anything else needed before booking"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100"
                />
              </label>
            </div>
          </FormSection>
        </fieldset>

        {editMode ? <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:-mx-6 sm:px-6">
          <div className="mx-auto flex max-w-5xl justify-end gap-3">
            <button type="button" onClick={onCancel} disabled={saving} className="min-h-11 rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1677FF] px-6 py-3 text-sm font-bold text-white hover:bg-[#0D63DA] disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "Saving…" : record ? "Save changes" : "Create record"}
            </button>
          </div>
        </div> : null}
      </form>
    </main>
  );
}

function FormSection({ title, description, icon: Icon, children }: { title: string; description: string; icon: typeof KeyRound; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex gap-3 border-b border-slate-100 p-5 sm:p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1677FF]"><Icon className="h-5 w-5" /></div>
        <div><h2 className="text-lg font-bold">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">{description}</p></div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function TextField({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">{label}{required ? <span className="text-red-500"> *</span> : null}
      <input required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100" />
    </label>
  );
}

function NumberField({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">{label}{required ? <span className="text-red-500"> *</span> : null}
      <input type="number" min="1900" max={new Date().getFullYear() + 3} required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100" />
    </label>
  );
}

function MoneyField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">{label}
      <div className="relative mt-2"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">£</span><input type="number" min="0" step="0.01" value={value} onChange={(event) => onChange(event.target.value)} placeholder="0.00" className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-7 pr-3 text-sm font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100" /></div>
    </label>
  );
}

function TriStateField({ label, value, onChange }: { label: string; value: YesNoUnknown; onChange: (value: YesNoUnknown) => void }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">{label}
      <select value={value === null ? "unknown" : String(value)} onChange={(event) => onChange(event.target.value === "unknown" ? null : event.target.value === "true")} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100">
        <option value="unknown">Not checked</option><option value="true">Yes</option><option value="false">No</option>
      </select>
    </label>
  );
}

function PowerSupplyField({ value, onChange }: { value: PowerSupplyRequirement; onChange: (value: PowerSupplyRequirement) => void }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">Power supply required?
      <select value={value ?? "unknown"} onChange={(event) => onChange(event.target.value === "unknown" ? null : event.target.value as PowerSupplyRequirement)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100">
        <option value="unknown">Not selected</option><option value="required">Required</option><option value="not_required">Not required</option><option value="optional">Optional</option>
      </select>
    </label>
  );
}

function PinMethodField({ label, value, supplier, onMethod, onSupplier }: { label: string; value: PinMethod; supplier: string; onMethod: (value: PinMethod) => void; onSupplier: (value: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700">{label}
        <select value={value ?? "unknown"} onChange={(event) => onMethod(event.target.value === "unknown" ? null : event.target.value as PinMethod)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100">
          <option value="unknown">Not checked</option>
          {Object.entries(pinLabels).map(([key, text]) => <option key={key} value={key}>{text}</option>)}
        </select>
      </label>
      {value === "purchase_online" ? <div className="mt-3"><TextField label="Online source" value={supplier} onChange={onSupplier} placeholder="Optional supplier or website" /></div> : null}
    </div>
  );
}

function PhotoField({ label, existingUrl, file, removed, onFile, onRemove }: { label: string; existingUrl: string | null; file: File | null; removed: boolean; onFile: (file: File) => void; onRemove: () => void }) {
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) return;
    let active = true;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (active && typeof reader.result === "string") setLocalUrl(reader.result);
    });
    reader.readAsDataURL(file);
    return () => {
      active = false;
      reader.abort();
    };
  }, [file]);
  const preview = file ? localUrl : (!removed ? existingUrl : null);
  return (
    <div>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <div className="relative mt-2 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
        {preview ? <img src={preview} alt={label} className="h-full w-full object-cover" /> : <div className="text-center text-slate-400"><Upload className="mx-auto h-6 w-6" /><p className="mt-2 text-xs">No photo</p></div>}
        {preview ? <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"><X className="h-4 w-4" /></button> : null}
      </div>
      <label className="mt-2 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50">
        <Upload className="h-4 w-4" /> {preview ? "Replace photo" : "Upload photo"}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => { const next = event.target.files?.[0]; if (next) onFile(next); event.target.value = ""; }} />
      </label>
    </div>
  );
}
