"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CarFront,
  Check,
  ChevronRight,
  KeyRound,
  Loader2,
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
import AdminHeader from "@/components/key-database/AdminHeader";
import SearchableSelect from "@/components/vehicle-search/SearchableSelect";
import type { VehicleCatalogueOption } from "@/lib/vehicle-catalogue";

type Props = {
  adminName: string;
  initialVehicleId?: string;
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

function vehicleGenerationLabel(record: Pick<VehicleCatalogueOption, "yearFrom" | "yearTo" | "generation">) {
  const years = formatVehicleYears(record.yearFrom, record.yearTo);
  return record.generation ? `${years} (${record.generation})` : years;
}

function recordMatchesVehicle(record: KeyRecordView, vehicle: VehicleCatalogueOption) {
  return record.make === vehicle.make
    && record.model === vehicle.model
    && record.yearFrom === vehicle.yearFrom
    && (record.yearTo ?? null) === (vehicle.yearTo ?? null)
    && record.generation.trim().toLowerCase() === vehicle.generation.trim().toLowerCase();
}

export default function KeyDatabaseAdmin({ adminName, initialVehicleId = "" }: Props) {
  const [records, setRecords] = useState<KeyRecordView[]>([]);
  const [catalogue, setCatalogue] = useState<VehicleCatalogueOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogueLoading, setCatalogueLoading] = useState(true);
  const [error, setError] = useState("");
  const [catalogueError, setCatalogueError] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicleId);
  const [editing, setEditing] = useState<KeyRecordView | null | "new">(null);
  const [newVehicle, setNewVehicle] = useState<VehicleCatalogueOption | null>(null);

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

  useEffect(() => {
    let active = true;
    fetch("/api/key-search-options", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load the vehicle catalogue.");
        return response.json() as Promise<{ records: VehicleCatalogueOption[] }>;
      })
      .then((body) => {
        if (active) setCatalogue(body.records);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setCatalogueError(loadError instanceof Error ? loadError.message : "Unable to load the vehicle catalogue.");
        }
      })
      .finally(() => {
        if (active) setCatalogueLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const makes = useMemo(() => (
    [...new Set(catalogue.map((vehicle) => vehicle.make))]
      .sort((a, b) => a.localeCompare(b, "en-GB"))
  ), [catalogue]);
  const models = useMemo(() => (
    [...new Set(catalogue.filter((vehicle) => vehicle.make === make).map((vehicle) => vehicle.model))]
      .sort((a, b) => a.localeCompare(b, "en-GB", { numeric: true }))
  ), [catalogue, make]);
  const generations = useMemo(() => (
    catalogue
      .filter((vehicle) => vehicle.make === make && vehicle.model === model)
      .sort((a, b) => b.yearFrom - a.yearFrom)
  ), [catalogue, make, model]);
  const makeOptions = useMemo(() => makes.map((item) => ({ value: item, label: item })), [makes]);
  const modelOptions = useMemo(() => models.map((item) => ({ value: item, label: item })), [models]);
  const generationOptions = useMemo(() => generations.map((vehicle) => ({
    value: vehicle.id,
    label: vehicleGenerationLabel(vehicle),
  })), [generations]);
  const selectedVehicle = selectedVehicleId
    ? catalogue.find((vehicle) => vehicle.id === selectedVehicleId) ?? null
    : null;
  const selectedVehicleRecords = selectedVehicle
    ? records.filter((record) => recordMatchesVehicle(record, selectedVehicle))
    : [];
  const hasVehicleFilter = Boolean(make || model || selectedVehicleId);
  const supplierOptions = useMemo(() => (
    [...new Set([
      "3D Group",
      ...records.flatMap((record) => [
        record.aklPinSupplier,
        record.addKeyPinSupplier,
        record.universalKeySupplier,
        record.oemKeySupplier,
      ]).map((value) => value.trim()).filter(Boolean),
    ])].sort((a, b) => a.localeCompare(b, "en-GB"))
  ), [records]);
  const keyBlankOptions = useMemo(() => (
    [...new Set([
      "HU101",
      ...records.map((record) => record.keyBlankCode.trim()).filter(Boolean),
    ])].sort((a, b) => a.localeCompare(b, "en-GB", { numeric: true }))
  ), [records]);

  useEffect(() => {
    if (!selectedVehicle) return;
    setMake(selectedVehicle.make);
    setModel(selectedVehicle.model);
  }, [selectedVehicle]);

  function clearVehicleFilters() {
    setMake("");
    setModel("");
    setSelectedVehicleId("");
    window.history.replaceState(null, "", "/key-database");
  }

  function startNewRecord(vehicle: VehicleCatalogueOption | null = null) {
    setNewVehicle(vehicle);
    setEditing("new");
  }

  function recordSaved(record: KeyRecordView) {
    setRecords((current) => {
      const without = current.filter((item) => item.id !== record.id);
      return [record, ...without];
    });
    setEditing(null);
  }

  if (editing) {
    return (
      <RecordEditor
        record={editing === "new" ? null : editing}
        initialVehicle={editing === "new" ? newVehicle : null}
        catalogue={catalogue}
        catalogueLoading={catalogueLoading}
        catalogueError={catalogueError}
        supplierOptions={supplierOptions}
        keyBlankOptions={keyBlankOptions}
        onCancel={() => setEditing(null)}
        onSaved={recordSaved}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F6F8] text-[#171C22]">
      <AdminHeader adminName={adminName} sectionTitle="Key database" />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
            onClick={() => startNewRecord()}
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
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Find a vehicle record</h2>
                <p className="mt-1 text-sm text-slate-500">Search or select the make, model, then vehicle generation.</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <p className="text-sm text-slate-500">
                  {catalogue.length} generations listed
                </p>
                {hasVehicleFilter ? (
                  <button
                    type="button"
                    onClick={clearVehicleFilters}
                    className="text-sm font-bold text-[#1677FF] transition hover:text-[#0D63DA]"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            </div>
            {catalogueError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{catalogueError}</div>
            ) : catalogueLoading ? (
              <div className="flex min-h-24 items-center justify-center gap-3 text-sm text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-[#1677FF]" /> Loading makes, models and generations…
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-3">
                <SearchableSelect
                  label="1. Make"
                  value={make}
                  options={makeOptions}
                  placeholder="Search or select make"
                  variant="light"
                  onChange={(nextMake) => {
                    setMake(nextMake);
                    setModel("");
                    setSelectedVehicleId("");
                    window.history.replaceState(null, "", "/key-database");
                  }}
                />
                <SearchableSelect
                  label="2. Model"
                  value={model}
                  options={modelOptions}
                  placeholder={make ? "Search or select model" : "Select a make first"}
                  disabled={!make}
                  variant="light"
                  onChange={(nextModel) => {
                    setModel(nextModel);
                    setSelectedVehicleId("");
                    window.history.replaceState(null, "", "/key-database");
                  }}
                />
                <SearchableSelect
                  label="3. Year and generation"
                  value={selectedVehicleId}
                  options={generationOptions}
                  placeholder={model ? "Search or select year/generation" : "Select a model first"}
                  disabled={!model}
                  variant="light"
                  onChange={(vehicleId) => {
                    setSelectedVehicleId(vehicleId);
                    window.history.replaceState(null, "", `/key-database?vehicle=${encodeURIComponent(vehicleId)}`);
                  }}
                />
              </div>
            )}
          </div>

          {selectedVehicle ? (
            <InlineGenerationKeys
              vehicle={selectedVehicle}
              records={selectedVehicleRecords}
              loading={loading}
              error={error}
              onRetry={() => void loadRecords()}
              onAdd={() => startNewRecord(selectedVehicle)}
              onEdit={(record) => setEditing(record)}
            />
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#1677FF]">
                <Search className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-xl font-bold">Select a vehicle generation</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Choose the make, model and generation above. Its possible keys will appear here without leaving this page.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function InlineGenerationKeys({
  vehicle,
  records,
  loading,
  error,
  onRetry,
  onAdd,
  onEdit,
}: {
  vehicle: VehicleCatalogueOption;
  records: KeyRecordView[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onAdd: () => void;
  onEdit: (record: KeyRecordView) => void;
}) {
  return (
    <div>
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1677FF]">Selected generation</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900">{vehicle.make} {vehicle.model}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-600">{vehicleGenerationLabel(vehicle)}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-slate-500">{records.length} {records.length === 1 ? "possible key" : "possible keys"}</p>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#1677FF] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0D63DA]"
          >
            <Plus className="h-4 w-4" /> Add possible key
          </button>
        </div>
      </div>

      {error ? (
        <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button type="button" onClick={onRetry} className="ml-2 font-bold underline">Try again</button>
        </div>
      ) : null}
      {loading ? (
        <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#1677FF]" /> Loading possible keys…
        </div>
      ) : null}
      {!loading && !error && records.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#1677FF]">
            <KeyRound className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-xl font-bold">No possible keys saved yet</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Add the first verified key configuration for this generation.
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1677FF] px-5 py-3 text-sm font-bold text-white hover:bg-[#0D63DA]"
          >
            <Plus className="h-4 w-4" /> Add first possible key
          </button>
        </div>
      ) : null}
      {!loading && !error && records.length > 0 ? (
        <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-2">
          {records.map((record) => (
            <RecordCard key={record.id} record={record} onEdit={() => onEdit(record)} />
          ))}
        </div>
      ) : null}
    </div>
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
            <img src={record.carPhotoUrl} alt={`OEM key for ${record.make} ${record.model}`} className="h-full w-full bg-slate-50 object-contain p-2" />
          ) : (
            <div className="flex h-full min-h-44 items-center justify-center text-slate-300">
              <KeyRound className="h-10 w-10" />
            </div>
          )}
        </div>
        <div className="min-w-0 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1677FF]">
                {formatVehicleYears(record.yearFrom, record.yearTo)}{record.generation ? ` (${record.generation})` : ""}
              </p>
              <h3 className="mt-1 truncate text-xl font-extrabold">{record.profileName || "Unnamed OEM key profile"}</h3>
              <p className="mt-1 truncate text-xs font-semibold text-slate-500">{record.make} {record.model}</p>
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
            <p><span className="font-semibold text-slate-700">Universal lead:</span> {record.universalLeadTime || "Not set"}</p>
            <p><span className="font-semibold text-slate-700">Aftermarket lead:</span> {record.aftermarketLeadTime || "Not set"}</p>
            <p><span className="font-semibold text-slate-700">Aftermarket:</span> {formatPrice(record.oemPricePence)}</p>
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

function RecordEditor({
  record,
  initialVehicle,
  catalogue,
  catalogueLoading,
  catalogueError,
  supplierOptions,
  keyBlankOptions,
  onCancel,
  onSaved,
}: {
  record: KeyRecordView | null;
  initialVehicle: VehicleCatalogueOption | null;
  catalogue: VehicleCatalogueOption[];
  catalogueLoading: boolean;
  catalogueError: string;
  supplierOptions: string[];
  keyBlankOptions: string[];
  onCancel: () => void;
  onSaved: (record: KeyRecordView) => void;
}) {
  const [form, setForm] = useState<KeyRecordPayload>(() => {
    if (record) return payloadFromRecord(record);
    if (!initialVehicle) return { ...emptyKeyRecord };
    return {
      ...emptyKeyRecord,
      make: initialVehicle.make,
      model: initialVehicle.model,
      yearFrom: initialVehicle.yearFrom,
      yearTo: initialVehicle.yearTo,
      generation: initialVehicle.generation,
    };
  });
  const [yearTo, setYearTo] = useState(
    record?.yearTo
      ? String(record.yearTo)
      : initialVehicle?.yearTo
        ? String(initialVehicle.yearTo)
        : "",
  );
  const [oemPrice, setOemPrice] = useState(record?.oemPricePence !== null && record?.oemPricePence !== undefined ? (record.oemPricePence / 100).toFixed(2) : "");
  const [universalPrice, setUniversalPrice] = useState(record?.universalPricePence !== null && record?.universalPricePence !== undefined ? (record.universalPricePence / 100).toFixed(2) : "");
  const [files, setFiles] = useState<PhotoFiles>(emptyFiles);
  const [removed, setRemoved] = useState<RemovedPhotos>(emptyRemoved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(!record);
  const [vehicleMake, setVehicleMake] = useState(initialVehicle?.make ?? "");
  const [vehicleModel, setVehicleModel] = useState(initialVehicle?.model ?? "");
  const [vehicleId, setVehicleId] = useState(initialVehicle?.id ?? "");

  const editorMakes = useMemo(() => (
    [...new Set(catalogue.map((vehicle) => vehicle.make))]
      .sort((a, b) => a.localeCompare(b, "en-GB"))
  ), [catalogue]);
  const editorModels = useMemo(() => (
    [...new Set(catalogue.filter((vehicle) => vehicle.make === vehicleMake).map((vehicle) => vehicle.model))]
      .sort((a, b) => a.localeCompare(b, "en-GB", { numeric: true }))
  ), [catalogue, vehicleMake]);
  const editorGenerations = useMemo(() => (
    catalogue
      .filter((vehicle) => vehicle.make === vehicleMake && vehicle.model === vehicleModel)
      .sort((a, b) => b.yearFrom - a.yearFrom)
  ), [catalogue, vehicleMake, vehicleModel]);
  const editorMakeOptions = useMemo(() => editorMakes.map((item) => ({ value: item, label: item })), [editorMakes]);
  const editorModelOptions = useMemo(() => editorModels.map((item) => ({ value: item, label: item })), [editorModels]);
  const editorGenerationOptions = useMemo(() => editorGenerations.map((vehicle) => ({
    value: vehicle.id,
    label: vehicleGenerationLabel(vehicle),
  })), [editorGenerations]);
  const selectedEditorVehicle = vehicleId
    ? catalogue.find((vehicle) => vehicle.id === vehicleId) ?? null
    : null;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  function update<K extends keyof KeyRecordPayload>(field: K, value: KeyRecordPayload[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (!record && !selectedEditorVehicle) {
        throw new Error("Select the make, model and year/generation before saving this key file.");
      }
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
            <ArrowLeft className="h-5 w-5" /> {initialVehicle ? "Back to possible keys" : "Back to database"}
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
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1677FF]">{record ? editMode ? "Editing key file" : "Key file" : "New key file"}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
            {record ? `${record.make} ${record.model}` : selectedEditorVehicle ? `Add a key for ${selectedEditorVehicle.make} ${selectedEditorVehicle.model}` : "Add a key file"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {record
              ? "Complete what you know and leave anything unverified as “Not checked”."
              : "First select the make, model and year/generation, then complete the key details below."}
          </p>
        </div>

        {error ? <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div> : null}

        <fieldset disabled={!editMode} className="space-y-5 disabled:[&_input]:cursor-default disabled:[&_input]:bg-slate-50 disabled:[&_select]:cursor-default disabled:[&_select]:bg-slate-50 disabled:[&_textarea]:cursor-default disabled:[&_textarea]:bg-slate-50">
          {!record ? (
            <FormSection title="Vehicle" description="Search or select the make, model, then vehicle year and generation." icon={CarFront}>
              {catalogueError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{catalogueError}</div>
              ) : catalogueLoading ? (
                <div className="flex min-h-24 items-center justify-center gap-3 text-sm text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin text-[#1677FF]" /> Loading makes, models and generations…
                </div>
              ) : (
                <div className="grid gap-3 lg:grid-cols-3">
                  <SearchableSelect
                    label="1. Make"
                    value={vehicleMake}
                    options={editorMakeOptions}
                    placeholder="Search or select make"
                    variant="light"
                    onChange={(nextMake) => {
                      setVehicleMake(nextMake);
                      setVehicleModel("");
                      setVehicleId("");
                      setYearTo("");
                      setForm((current) => ({ ...current, make: nextMake, model: "", generation: "", yearFrom: 0, yearTo: null }));
                    }}
                  />
                  <SearchableSelect
                    label="2. Model"
                    value={vehicleModel}
                    options={editorModelOptions}
                    placeholder={vehicleMake ? "Search or select model" : "Select a make first"}
                    disabled={!vehicleMake}
                    variant="light"
                    onChange={(nextModel) => {
                      setVehicleModel(nextModel);
                      setVehicleId("");
                      setYearTo("");
                      setForm((current) => ({ ...current, model: nextModel, generation: "", yearFrom: 0, yearTo: null }));
                    }}
                  />
                  <SearchableSelect
                    label="3. Year and generation"
                    value={vehicleId}
                    options={editorGenerationOptions}
                    placeholder={vehicleModel ? "Search or select year/generation" : "Select a model first"}
                    disabled={!vehicleModel}
                    variant="light"
                    onChange={(nextVehicleId) => {
                      const vehicle = catalogue.find((item) => item.id === nextVehicleId);
                      if (!vehicle) return;
                      setVehicleId(nextVehicleId);
                      setYearTo(vehicle.yearTo ? String(vehicle.yearTo) : "");
                      setForm((current) => ({
                        ...current,
                        make: vehicle.make,
                        model: vehicle.model,
                        generation: vehicle.generation,
                        yearFrom: vehicle.yearFrom,
                        yearTo: vehicle.yearTo,
                      }));
                    }}
                  />
                </div>
              )}
            </FormSection>
          ) : (
            <FormSection title="Vehicle" description="The generation this key file applies to." icon={CarFront}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <TextField label="Make" required value={form.make} onChange={(value) => update("make", value)} placeholder="e.g. Ford" />
                <TextField label="Model" required value={form.model} onChange={(value) => update("model", value)} placeholder="e.g. Focus" />
                <TextField label="Generation" required value={form.generation} onChange={(value) => update("generation", value)} placeholder="e.g. MK3" />
                <NumberField label="Start year" required value={String(form.yearFrom)} onChange={(value) => update("yearFrom", Number(value))} placeholder="2015" />
                <NumberField label="End year" value={yearTo} onChange={setYearTo} placeholder="Leave blank for one year" />
              </div>
            </FormSection>
          )}

          <FormSection title="Key essentials" description="Enter the key identity, compatibility, lead time and prices in one pass." icon={KeyRound}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ProfileNameField value={form.profileName} onChange={(value) => update("profileName", value)} />
              <ReusableOptionField label="Key blank code" value={form.keyBlankCode} options={keyBlankOptions} selectLabel="Select key blank" addLabel="Add new key blank" customPlaceholder="Enter the new key blank code" onChange={(value) => update("keyBlankCode", value)} />
              <LeadTimeField label="Universal remote lead time" value={form.universalLeadTime} onChange={(value) => update("universalLeadTime", value)} />
              <MoneyField label="Universal key price" value={universalPrice} onChange={setUniversalPrice} />
              <LeadTimeField label="Aftermarket remote lead time" value={form.aftermarketLeadTime} onChange={(value) => update("aftermarketLeadTime", value)} />
              <MoneyField label="Aftermarket key price" value={oemPrice} onChange={setOemPrice} />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <TriStateField label="Transponder clonable?" value={form.transponderClonable} onChange={(value) => update("transponderClonable", value)} />
              <TriStateField label="AKL compatible?" value={form.aklCompatible} onChange={(value) => update("aklCompatible", value)} />
              <TriStateField label="Add key compatible?" value={form.addKeyCompatible} onChange={(value) => update("addKeyCompatible", value)} />
              <TriStateField label="Remote button cloning" value={form.keyCloning} onChange={(value) => update("keyCloning", value)} />
              <TriStateField label="Universal key compatible?" value={form.universalKeyCompatible} onChange={(value) => update("universalKeyCompatible", value)} />
              <PowerSupplyField value={form.powerSupplyRequirement} onChange={(value) => update("powerSupplyRequirement", value)} />
            </div>
            {form.universalKeyCompatible === true ? (
              <div className="mt-4">
                <TextField label="Compatible universal key(s)" value={form.compatibleUniversalKeys} onChange={(value) => update("compatibleUniversalKeys", value)} placeholder="Enter model names or codes" />
              </div>
            ) : null}
          </FormSection>

          <FormSection title="PIN, stock and suppliers" description="Finish the operational details without moving between separate sections." icon={PackageCheck}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <PinMethodField label="PIN code for AKL" value={form.aklPinMethod} supplier={form.aklPinSupplier} supplierOptions={supplierOptions} onMethod={(value) => update("aklPinMethod", value)} onSupplier={(value) => update("aklPinSupplier", value)} />
              <PinMethodField label="PIN code for add key" value={form.addKeyPinMethod} supplier={form.addKeyPinSupplier} supplierOptions={supplierOptions} onMethod={(value) => update("addKeyPinMethod", value)} onSupplier={(value) => update("addKeyPinSupplier", value)} />
              <TriStateField label="Lishi in stock?" value={form.lishiInStock} onChange={(value) => update("lishiInStock", value)} />
              <TriStateField label="Key blanks in stock?" value={form.keyBlanksInStock} onChange={(value) => update("keyBlanksInStock", value)} />
              <TriStateField label="Universal key in stock?" value={form.universalKeyInStock} onChange={(value) => update("universalKeyInStock", value)} />
              <TriStateField label="Aftermarket key in stock?" value={form.oemKeyInStock} onChange={(value) => update("oemKeyInStock", value)} />
              {form.universalKeyInStock === false ? <ReusableOptionField label="Universal key supplier" value={form.universalKeySupplier} options={supplierOptions} selectLabel="Select supplier" addLabel="Add new supplier" customPlaceholder="Enter the new supplier name" onChange={(value) => update("universalKeySupplier", value)} /> : null}
              {form.oemKeyInStock === false ? <ReusableOptionField label="Aftermarket key supplier" value={form.oemKeySupplier} options={supplierOptions} selectLabel="Select supplier" addLabel="Add new supplier" customPlaceholder="Enter the new supplier name" onChange={(value) => update("oemKeySupplier", value)} /> : null}
            </div>
            <label className="mt-5 block text-sm font-semibold text-slate-700">
              Notes
              <textarea
                value={form.notes}
                onChange={(event) => update("notes", event.target.value)}
                rows={3}
                placeholder="Equipment, procedure, restrictions or anything else needed before booking"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </FormSection>

          <FormSection title="Photos" description="The OEM key photo is shown first so customers can identify their original key. Choose, drag and drop, or paste each image." icon={Upload}>
            <div className="grid gap-4 md:grid-cols-3">
              <PhotoField disabled={!editMode} label="OEM key photo (main)" existingUrl={record?.carPhotoUrl ?? null} file={files.carPhoto} removed={removed.carPhoto} onFile={(file) => { setFiles((value) => ({ ...value, carPhoto: file })); setRemoved((value) => ({ ...value, carPhoto: false })); }} onRemove={() => { setFiles((value) => ({ ...value, carPhoto: null })); setRemoved((value) => ({ ...value, carPhoto: true })); }} />
              <PhotoField disabled={!editMode} label="Aftermarket key photo" existingUrl={record?.oemKeyPhotoUrl ?? null} file={files.oemKeyPhoto} removed={removed.oemKeyPhoto} onFile={(file) => { setFiles((value) => ({ ...value, oemKeyPhoto: file })); setRemoved((value) => ({ ...value, oemKeyPhoto: false })); }} onRemove={() => { setFiles((value) => ({ ...value, oemKeyPhoto: null })); setRemoved((value) => ({ ...value, oemKeyPhoto: true })); }} />
              <PhotoField disabled={!editMode} label="Universal key photo" existingUrl={record?.universalKeyPhotoUrl ?? null} file={files.universalKeyPhoto} removed={removed.universalKeyPhoto} onFile={(file) => { setFiles((value) => ({ ...value, universalKeyPhoto: file })); setRemoved((value) => ({ ...value, universalKeyPhoto: false })); }} onRemove={() => { setFiles((value) => ({ ...value, universalKeyPhoto: null })); setRemoved((value) => ({ ...value, universalKeyPhoto: true })); }} />
            </div>
          </FormSection>
        </fieldset>

        {editMode ? <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:-mx-6 sm:px-6">
          <div className="mx-auto flex max-w-5xl justify-end gap-3">
            <button type="button" onClick={onCancel} disabled={saving} className="min-h-11 rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1677FF] px-6 py-3 text-sm font-bold text-white hover:bg-[#0D63DA] disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "Saving…" : record ? "Save changes" : "Create key file"}
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

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">{label}{required ? <span className="text-red-500"> *</span> : null}
      <input required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100" />
    </label>
  );
}

function ReusableOptionField({
  label,
  value,
  options,
  selectLabel,
  addLabel,
  customPlaceholder,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  selectLabel: string;
  addLabel: string;
  customPlaceholder: string;
  onChange: (value: string) => void;
}) {
  const isSavedOption = options.includes(value);
  const [customMode, setCustomMode] = useState(Boolean(value) && !isSavedOption);
  const mode = customMode ? "__new__" : isSavedOption ? value : "";

  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <select
        value={mode}
        onChange={(event) => {
          const nextValue = event.target.value;
          const addingNew = nextValue === "__new__";
          setCustomMode(addingNew);
          onChange(addingNew ? "" : nextValue);
        }}
        className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100"
      >
        <option value="">{selectLabel}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
        <option value="__new__">+ {addLabel}</option>
      </select>
      {customMode ? (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={customPlaceholder}
          className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100"
        />
      ) : null}
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

const OEM_KEY_PROFILE_NAMES = [
  "OEM Flip Key",
  "OEM Smart Key",
  "OEM Smart Proximity Key",
  "OEM Remote Head Key",
  "OEM Fixed-Blade Remote Key",
  "OEM Non-Remote Transponder Key",
  "OEM Key Card",
  "OEM FOBIK Key",
  "OEM Valet Key",
  "OEM Mechanical Key",
] as const;

function ProfileNameField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const isPreset = (OEM_KEY_PROFILE_NAMES as readonly string[]).includes(value);
  const [customMode, setCustomMode] = useState(Boolean(value) && !isPreset);
  const mode = customMode ? "custom" : isPreset ? value : "";

  return (
    <label className="block text-sm font-semibold text-slate-700">
      OEM key profile name <span className="text-red-500">*</span>
      <select
        required
        value={mode}
        onChange={(event) => {
          const nextMode = event.target.value;
          const custom = nextMode === "custom";
          setCustomMode(custom);
          onChange(custom ? "" : nextMode);
        }}
        className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100"
      >
        <option value="">Select the OEM key type</option>
        {OEM_KEY_PROFILE_NAMES.map((name) => <option key={name} value={name}>{name}</option>)}
        <option value="custom">Custom</option>
      </select>
      {customMode ? (
        <input
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter the OEM key profile name"
          className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100"
        />
      ) : null}
    </label>
  );
}

const SAME_DAY = "Same Day";
const LEGACY_SAME_DAY_BOOKING = "Same Day Booking Available";
const LEGACY_NEXT_BUSINESS_DAY = "Next Business Day. Book Before 3pm. Excludes Bookings for Sunday.";
const NEXT_BUSINESS_DAY_330 = "Next Business Day (before 3:30pm)";
const NEXT_BUSINESS_DAY_11 = "Next Business Day (before 11am)";
const TWO_BUSINESS_DAYS = "2 Business Days";

function LeadTimeField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const isPreset = value === SAME_DAY
    || value === LEGACY_SAME_DAY_BOOKING
    || value === LEGACY_NEXT_BUSINESS_DAY
    || value === NEXT_BUSINESS_DAY_330
    || value === NEXT_BUSINESS_DAY_11
    || value === TWO_BUSINESS_DAYS;
  const [customMode, setCustomMode] = useState(Boolean(value) && !isPreset);
  const mode = customMode
    ? "custom"
    : value === SAME_DAY || value === LEGACY_SAME_DAY_BOOKING
      ? "same"
      : value === LEGACY_NEXT_BUSINESS_DAY || value === NEXT_BUSINESS_DAY_330
        ? "next-330"
        : value === NEXT_BUSINESS_DAY_11
          ? "next-11"
          : value === TWO_BUSINESS_DAYS
            ? "two"
            : "";

  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <select
        value={mode}
        onChange={(event) => {
          const nextMode = event.target.value;
          setCustomMode(nextMode === "custom");
          if (nextMode === "same") onChange(SAME_DAY);
          else if (nextMode === "next-330") onChange(NEXT_BUSINESS_DAY_330);
          else if (nextMode === "next-11") onChange(NEXT_BUSINESS_DAY_11);
          else if (nextMode === "two") onChange(TWO_BUSINESS_DAYS);
          else onChange("");
        }}
        className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100"
      >
        <option value="">Select lead time</option>
        <option value="same">Same Day</option>
        <option value="next-330">Next business day (before 3:30pm)</option>
        <option value="next-11">Next business day (before 11am)</option>
        <option value="two">2 business days</option>
        <option value="custom">Custom</option>
      </select>
      {customMode ? (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter the customer-facing lead time"
          className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100"
        />
      ) : null}
    </label>
  );
}

function TriStateField({ label, value, onChange }: { label: string; value: YesNoUnknown; onChange: (value: YesNoUnknown) => void }) {
  const choices: Array<{ label: string; value: YesNoUnknown }> = [
    { label: "Not checked", value: null },
    { label: "Yes", value: true },
    { label: "No", value: false },
  ];
  return (
    <div>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <div className="mt-2 grid h-11 grid-cols-3 overflow-hidden rounded-xl border border-slate-300 bg-white" role="group" aria-label={label}>
        {choices.map((choice) => {
          const selected = choice.value === value;
          return (
            <button
              key={choice.label}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(choice.value)}
              className={`border-r border-slate-200 px-2 text-xs font-bold transition last:border-r-0 disabled:cursor-default ${
                selected
                  ? choice.value === true
                    ? "bg-emerald-50 text-emerald-700"
                    : choice.value === false
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-100 text-slate-700"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {choice.label}
            </button>
          );
        })}
      </div>
    </div>
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

function PinMethodField({ label, value, supplier, supplierOptions, onMethod, onSupplier }: { label: string; value: PinMethod; supplier: string; supplierOptions: string[]; onMethod: (value: PinMethod) => void; onSupplier: (value: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700">{label}
        <select value={value ?? "unknown"} onChange={(event) => onMethod(event.target.value === "unknown" ? null : event.target.value as PinMethod)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100">
          <option value="unknown">Not checked</option>
          {Object.entries(pinLabels).map(([key, text]) => <option key={key} value={key}>{text}</option>)}
        </select>
      </label>
      {value === "purchase_online" ? <div className="mt-3"><ReusableOptionField label="Online source" value={supplier} options={supplierOptions} selectLabel="Select supplier" addLabel="Add new supplier" customPlaceholder="Enter the new supplier name or website" onChange={onSupplier} /></div> : null}
    </div>
  );
}

function PhotoField({ label, existingUrl, file, removed, disabled, onFile, onRemove }: { label: string; existingUrl: string | null; file: File | null; removed: boolean; disabled: boolean; onFile: (file: File) => void; onRemove: () => void }) {
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState("");

  function acceptFile(next: File | null | undefined) {
    if (disabled || !next) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(next.type)) {
      setFileError("Use a JPG, PNG, WebP or GIF image.");
      return;
    }
    if (next.size > 8 * 1024 * 1024) {
      setFileError("Photo must be 8 MB or smaller.");
      return;
    }
    setFileError("");
    onFile(next);
  }

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
      <div
        className={`relative mt-2 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-slate-50 outline-none transition ${
          dragActive ? "border-[#1677FF] bg-blue-50 ring-4 ring-blue-100" : "border-slate-300 focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100"
        } ${disabled ? "cursor-default opacity-70" : "cursor-copy"}`}
        tabIndex={disabled ? -1 : 0}
        aria-label={`${label}. Drop or paste an image here.`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          acceptFile(Array.from(event.dataTransfer.files).find((item) => item.type.startsWith("image/")) ?? event.dataTransfer.files[0]);
        }}
        onPaste={(event) => {
          const pastedImage = Array.from(event.clipboardData.items)
            .find((item) => item.kind === "file" && item.type.startsWith("image/"))
            ?.getAsFile();
          if (pastedImage) {
            event.preventDefault();
            acceptFile(pastedImage);
          }
        }}
      >
        {preview ? <img src={preview} alt={label} className="h-full w-full object-cover" /> : <div className="px-4 text-center text-slate-400"><Upload className="mx-auto h-6 w-6" /><p className="mt-2 text-xs font-semibold">Drop or paste photo here</p></div>}
        {preview && !disabled ? <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2 text-center text-[11px] font-semibold text-white">Drop or paste to replace</div> : null}
        {preview ? <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"><X className="h-4 w-4" /></button> : null}
      </div>
      <label className="mt-2 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50">
        <Upload className="h-4 w-4" /> {preview ? "Replace photo" : "Upload photo"}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => { acceptFile(event.target.files?.[0]); event.target.value = ""; }} />
      </label>
      {fileError ? <p className="mt-2 text-xs font-medium text-red-600">{fileError}</p> : null}
    </div>
  );
}
