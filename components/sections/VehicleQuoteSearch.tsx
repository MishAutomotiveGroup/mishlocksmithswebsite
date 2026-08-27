"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clock3, Loader2, MapPin, MessageCircle, Phone, ScanSearch } from "lucide-react";
import { siteContent } from "@/content/siteContent";
import { trackCallClick, trackWhatsAppClick } from "@/lib/analytics";
import SearchableSelect from "@/components/vehicle-search/SearchableSelect";

type VehicleRecordOption = {
  id: string;
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number | null;
  generation: string;
};

type QuoteOption = {
  id: string;
  keyType: "universal" | "aftermarket" | "estimated_range";
  priceStatus: "confirmed" | "estimated";
  displayName: string;
  priceMinPence: number | null;
  priceMaxPence: number | null;
  jobMinutesMin: number | null;
  jobMinutesMax: number | null;
  stockStatus: "in_stock" | "order_required" | "check_availability";
  leadTime: string | null;
  imagePath: string | null;
};

type OemKeyChoice = {
  id: string;
  displayName: string;
  imagePath: string | null;
  options: QuoteOption[];
};

type QuoteResult = {
  status: "matched" | "estimated" | "manual_check" | "not_supported" | "not_found";
  quoteReference: string | null;
  serviceType: "spare_key" | "all_keys_lost";
  vehicle: {
    make: string;
    model: string;
    yearFrom: number;
    yearTo: number | null;
    generation: string;
    workingKeyRequired: boolean | null;
  };
  options: QuoteOption[];
  keyChoices: OemKeyChoice[];
  fallbackOption: QuoteOption | null;
};

type RegistrationVehicle = {
  registration: string;
  make: string;
  model: string;
  year: number | null;
};

function normaliseWords(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normaliseMake(value: string) {
  const normalised = normaliseWords(value).replace(/\s+/g, "");
  if (normalised === "opel" || normalised === "vauxhall") return "vauxhall";
  if (normalised === "kgm" || normalised === "ssangyong") return "kgm";
  if (normalised === "ds" || normalised === "dsautomobiles") return "ds";
  return normalised;
}

function modelMatches(apiModel: string, catalogueModel: string) {
  const api = normaliseWords(apiModel);
  const catalogue = normaliseWords(catalogueModel);
  return api === catalogue || api.startsWith(`${catalogue} `) || catalogue.startsWith(`${api} `);
}

function generationLabel(record: Pick<VehicleRecordOption, "yearFrom" | "yearTo" | "generation">) {
  const years = record.yearTo && record.yearTo !== record.yearFrom
    ? `${record.yearFrom}–${record.yearTo}`
    : String(record.yearFrom);
  return record.generation ? `${years} (${record.generation})` : years;
}

function formatPrice(minPence: number | null, maxPence: number | null) {
  if (minPence === null && maxPence === null) return "Price confirmed before booking";
  const min = minPence === null ? maxPence : minPence;
  const max = maxPence === null ? minPence : maxPence;
  if (min === null || max === null) return "Price confirmed before booking";
  if (min === max) return `£${(min / 100).toFixed(min % 100 === 0 ? 0 : 2)}`;
  return `£${(min / 100).toFixed(min % 100 === 0 ? 0 : 2)}–£${(max / 100).toFixed(max % 100 === 0 ? 0 : 2)}`;
}

function formatStock(option: QuoteOption) {
  const leadTime = option.leadTime === "Same Day Booking Available"
    ? "Same Day"
    : option.leadTime === "Next Business Day (before 3:30pm)"
      || option.leadTime === "Next Business Day. Book Before 3pm. Excludes Bookings for Sunday."
      ? "Next Business Day. Book before 3pm"
      : option.leadTime === "Next Business Day (before 11am)"
        ? "Next Business Day. Book before 11am"
        : option.leadTime;
  if (leadTime) return `Earliest booking: ${leadTime}`;
  if (option.stockStatus === "in_stock") return "Normally in stock";
  if (option.stockStatus === "order_required") return "Stock order required";
  return "Availability checked before booking";
}

export default function VehicleQuoteSearch() {
  const [records, setRecords] = useState<VehicleRecordOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [searchMode, setSearchMode] = useState<"registration" | "manual">("registration");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [recordId, setRecordId] = useState("");
  const [registration, setRegistration] = useState("");
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [registrationVehicle, setRegistrationVehicle] = useState<RegistrationVehicle | null>(null);
  const [registrationConfirmed, setRegistrationConfirmed] = useState<boolean | null>(null);
  const [registrationCandidateIds, setRegistrationCandidateIds] = useState<string[] | null>(null);
  const [workingKey, setWorkingKey] = useState<"" | "yes" | "no">("");
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [selectedKeyChoiceId, setSelectedKeyChoiceId] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/key-search-options", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Vehicle options are temporarily unavailable.");
        return response.json() as Promise<{ records: VehicleRecordOption[] }>;
      })
      .then((body) => {
        if (active) setRecords(body.records);
      })
      .catch((loadError: unknown) => {
        if (active) setOptionsError(loadError instanceof Error ? loadError.message : "Vehicle options are temporarily unavailable.");
      })
      .finally(() => {
        if (active) setOptionsLoading(false);
      });
    return () => { active = false; };
  }, []);

  const makes = useMemo(() => (
    [...new Set(records.map((record) => record.make))].sort((a, b) => a.localeCompare(b, "en-GB"))
  ), [records]);
  const models = useMemo(() => (
    [...new Set(records.filter((record) => record.make === make).map((record) => record.model))]
      .sort((a, b) => a.localeCompare(b, "en-GB", { numeric: true }))
  ), [make, records]);
  const generations = useMemo(() => (
    records
      .filter((record) => record.make === make && record.model === model)
      .sort((a, b) => b.yearFrom - a.yearFrom)
  ), [make, model, records]);
  const visibleGenerations = useMemo(() => (
    registrationCandidateIds
      ? generations.filter((record) => registrationCandidateIds.includes(record.id))
      : generations
  ), [generations, registrationCandidateIds]);
  const makeOptions = useMemo(() => makes.map((item) => ({ value: item, label: item })), [makes]);
  const modelOptions = useMemo(() => models.map((item) => ({ value: item, label: item })), [models]);
  const generationOptions = useMemo(() => visibleGenerations.map((record) => ({
    value: record.id,
    label: generationLabel(record),
  })), [visibleGenerations]);

  const selectedRecord = records.find((record) => record.id === recordId) ?? null;
  const selectedKeyChoice = quoteResult?.keyChoices.find((choice) => choice.id === selectedKeyChoiceId) ?? null;
  const customerNeedsManualKeyCheck = selectedKeyChoiceId === "none";
  const activeOptions = customerNeedsManualKeyCheck
    ? quoteResult?.fallbackOption ? [quoteResult.fallbackOption] : []
    : selectedKeyChoice?.options ?? quoteResult?.options ?? [];
  const selectedOption = activeOptions.find((option) => option.id === selectedOptionId) ?? null;
  const hasPricedOptions = Boolean(quoteResult && (quoteResult.status === "matched" || quoteResult.status === "estimated") && activeOptions.length > 0);
  const allPricesConfirmed = Boolean(activeOptions.length && activeOptions.every((option) => option.priceStatus === "confirmed"));
  const showWorkingKeyQuestion = Boolean(selectedRecord)
    && (searchMode === "manual" || registrationConfirmed === true);

  const vehicleMessage = [
    workingKey === "no"
      ? "Hi, I'd like an all-keys-lost replacement quote."
      : "Hi, I'd like a spare car key quote.",
    "",
    selectedRecord ? `Vehicle: ${selectedRecord.make} ${selectedRecord.model}` : "Vehicle:",
    selectedRecord ? `Generation: ${generationLabel(selectedRecord)}` : "Generation:",
    "",
    `Working key: ${workingKey === "yes" ? "Yes" : workingKey === "no" ? "No" : "Not answered"}`,
    ...(quoteResult?.quoteReference ? [`Quote reference: ${quoteResult.quoteReference}`] : []),
    ...(selectedKeyChoice ? [`Original key selected: ${selectedKeyChoice.displayName}`] : []),
    ...(customerNeedsManualKeyCheck ? ["Original key: Did not match the pictured options"] : []),
    ...(selectedOption ? [`Selected key: ${selectedOption.displayName} (${selectedOption.keyType === "aftermarket" ? "Aftermarket" : selectedOption.keyType === "universal" ? "Universal" : "Estimated range"})`] : []),
    "Postcode / area:",
  ].join("\n");
  const whatsappUrl = `https://wa.me/${siteContent.business.whatsappNumber}?text=${encodeURIComponent(vehicleMessage)}`;

  function resetResult() {
    setQuoteResult(null);
    setSelectedKeyChoiceId(null);
    setSelectedOptionId(null);
    setError("");
  }

  function switchToManualSearch() {
    if (searchMode === "manual") return;
    setSearchMode("manual");
    setRegistrationVehicle(null);
    setRegistrationConfirmed(null);
    setRegistrationCandidateIds(null);
    resetResult();
  }

  function switchToRegistrationSearch() {
    if (searchMode === "registration") return;
    setSearchMode("registration");
    setMake("");
    setModel("");
    setRecordId("");
    setWorkingKey("");
    setRegistrationVehicle(null);
    setRegistrationConfirmed(null);
    setRegistrationCandidateIds(null);
    resetResult();
  }

  async function checkKeyOptions(answer: "yes" | "no") {
    if (!recordId || loading) return;
    setWorkingKey(answer);
    setLoading(true);
    resetResult();
    try {
      const response = await fetch("/api/vehicle-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId, hasWorkingKey: answer === "yes" }),
      });
      const result = await response.json() as QuoteResult & { error?: string };
      if (!response.ok) throw new Error(result.error || "Quote lookup failed");
      setQuoteResult(result);
      setSelectedKeyChoiceId(null);
      setSelectedOptionId(result.status === "estimated" && result.options.length === 1 ? result.options[0].id : null);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "We couldn't check this vehicle right now.");
    } finally {
      setLoading(false);
    }
  }

  async function lookupRegistration() {
    const cleanedRegistration = registration.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleanedRegistration.length < 2 || registrationLoading) {
      setRegistrationError("Enter a valid registration number.");
      return;
    }

    setRegistrationLoading(true);
    setRegistrationError("");
    setRegistrationVehicle(null);
    setRegistrationConfirmed(null);
    setRegistrationCandidateIds(null);
    setMake("");
    setModel("");
    setRecordId("");
    setWorkingKey("");
    resetResult();
    try {
      const response = await fetch("/api/vehicle-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration: cleanedRegistration }),
      });
      const body = await response.json() as { vehicle?: RegistrationVehicle; error?: string };
      if (!response.ok || !body.vehicle) throw new Error(body.error || "Registration search failed.");

      const vehicle = body.vehicle;
      setRegistration(vehicle.registration);
      setRegistrationVehicle(vehicle);
      setRegistrationConfirmed(null);
      setWorkingKey("");

      const matchedMake = makes.find((item) => normaliseMake(item) === normaliseMake(vehicle.make)) ?? "";
      const matchedModels = matchedMake
        ? [...new Set(records.filter((record) => record.make === matchedMake).map((record) => record.model))]
        : [];
      const matchedModel = matchedModels.find((item) => modelMatches(vehicle.model, item)) ?? "";
      const candidates = matchedMake && matchedModel
        ? records.filter((record) => (
            record.make === matchedMake
            && record.model === matchedModel
            && (vehicle.year === null || (record.yearFrom <= vehicle.year && (record.yearTo ?? new Date().getFullYear() + 1) >= vehicle.year))
          ))
        : [];

      setMake(matchedMake);
      setModel(matchedModel);
      setRegistrationCandidateIds(candidates.length > 0 ? candidates.map((record) => record.id) : null);
      setRecordId(candidates.length === 1 ? candidates[0].id : "");
    } catch (lookupError) {
      setRegistrationError(lookupError instanceof Error ? lookupError.message : "We couldn't check that registration right now.");
    } finally {
      setRegistrationLoading(false);
    }
  }

  return (
    <div className="mb-5 rounded-xl border border-white/15 bg-[#10151A]/95 p-4 shadow-xl sm:p-5" data-testid="vehicle-quote-search">
      <div className="mb-4">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1677FF]">Spare car key pricing</p>
        <h2 className="text-xl font-bold text-white">Get an instant quote</h2>
        <p className="mt-1 text-xs leading-relaxed text-white/55">Find your vehicle, confirm it, then answer one question to see the available keys.</p>
      </div>

      {optionsLoading ? (
        <div className="flex min-h-28 items-center justify-center gap-2 text-sm text-white/60">
          <Loader2 size={18} className="animate-spin text-[#1677FF]" /> Loading vehicles…
        </div>
      ) : optionsError ? (
        <div className="rounded-lg border border-amber-300/40 bg-amber-50 p-4 text-sm text-[#171C22]" role="alert">{optionsError}</div>
      ) : records.length === 0 ? (
        <div className="rounded-lg border border-white/15 bg-white/5 p-4 text-sm leading-6 text-white/65">
          Vehicle choices are temporarily unavailable. Please call or WhatsApp us for a quote.
        </div>
      ) : (
        <form onSubmit={(event) => event.preventDefault()} className="space-y-3">
          <div className="grid grid-cols-2 rounded-lg border border-white/15 bg-white/5 p-1">
            <button
              type="button"
              aria-pressed={searchMode === "registration"}
              onClick={switchToRegistrationSearch}
              className={`min-h-10 rounded-md px-3 text-xs font-bold transition ${searchMode === "registration" ? "bg-white text-[#171C22] shadow-sm" : "text-white/65 hover:text-white"}`}
            >
              Registration
            </button>
            <button
              type="button"
              aria-pressed={searchMode === "manual"}
              onClick={switchToManualSearch}
              className={`min-h-10 rounded-md px-3 text-xs font-bold transition ${searchMode === "manual" ? "bg-white text-[#171C22] shadow-sm" : "text-white/65 hover:text-white"}`}
            >
              Make and model
            </button>
          </div>

          {searchMode === "registration" ? <div className="rounded-lg border border-white/15 bg-white/5 p-3.5">
            <label htmlFor="vehicle-registration" className="block text-xs font-semibold text-white/75">Search by registration</label>
            <div className="mt-1.5 flex gap-2">
              <input
                id="vehicle-registration"
                value={registration}
                onChange={(event) => {
                  setRegistration(event.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 9));
                  setRegistrationError("");
                  setRegistrationVehicle(null);
                  setRegistrationConfirmed(null);
                  setRegistrationCandidateIds(null);
                  setMake("");
                  setModel("");
                  setRecordId("");
                  setWorkingKey("");
                  resetResult();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void lookupRegistration();
                  }
                }}
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="e.g. AB12 CDE"
                className="h-12 min-w-0 flex-1 rounded-lg border border-white/20 bg-white px-4 text-center text-base font-black uppercase tracking-[0.12em] text-[#171C22] outline-none transition placeholder:font-semibold placeholder:tracking-normal placeholder:text-[#171C22]/40 focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/30"
              />
              <button
                type="button"
                onClick={() => void lookupRegistration()}
                disabled={registrationLoading || registration.trim().length < 2}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1677FF] px-4 text-sm font-bold text-[#171C22] transition hover:bg-[#0D63DA] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
              >
                {registrationLoading ? <Loader2 size={17} className="animate-spin" /> : <ScanSearch size={17} />}
                <span className="hidden sm:inline">Find vehicle</span>
                <span className="sm:hidden">Find</span>
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-white/50">Fastest option. We use the registration only to identify your vehicle.</p>

            {registrationError ? <div className="mt-3 rounded-lg border border-amber-300/40 bg-amber-50 p-3 text-xs font-medium text-[#171C22]" role="alert">{registrationError}</div> : null}
            {registrationVehicle ? (
              <div className="mt-3 rounded-lg border border-emerald-300/35 bg-emerald-50 p-3 text-[#171C22]" role="status">
                <p className="text-xs font-bold text-emerald-700">Vehicle found</p>
                <p className="mt-1 text-sm font-extrabold">{registrationVehicle.make} {registrationVehicle.model}{registrationVehicle.year ? ` · ${registrationVehicle.year}` : ""}</p>
                {registrationConfirmed === null ? <>
                  <p className="mt-2 text-xs font-bold text-[#171C22]/75">Is this your vehicle?</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationConfirmed(true);
                        setWorkingKey("");
                        resetResult();
                      }}
                      className="min-h-10 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white transition hover:bg-emerald-700"
                    >
                      Yes, correct
                    </button>
                    <button
                      type="button"
                      onClick={switchToManualSearch}
                      className="min-h-10 rounded-lg border border-[#171C22]/20 bg-white px-3 text-xs font-bold text-[#171C22] transition hover:bg-slate-50"
                    >
                      No, choose manually
                    </button>
                  </div>
                </> : <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700"><Check size={14} /> Vehicle confirmed</p>}

                {registrationConfirmed && registrationCandidateIds && registrationCandidateIds.length > 1 ? (
                  <div className="mt-3 border-t border-emerald-200 pt-3">
                    <SearchableSelect
                      label="Choose the exact year and generation"
                      value={recordId}
                      options={generationOptions}
                      placeholder="Select year and generation"
                      variant="light"
                      onChange={(nextRecordId) => {
                        setRecordId(nextRecordId);
                        setWorkingKey("");
                        resetResult();
                      }}
                    />
                  </div>
                ) : null}

                {registrationConfirmed && !registrationCandidateIds ? (
                  <div className="mt-3 border-t border-emerald-200 pt-3">
                    <p className="text-xs leading-5 text-[#171C22]/70">We found the vehicle, but could not safely match its exact generation.</p>
                    <button type="button" onClick={switchToManualSearch} className="mt-2 text-xs font-bold text-[#1677FF] hover:underline">Choose the vehicle manually</button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div> : null}

          {searchMode === "manual" ? <>
          <SearchableSelect
            label="1. Make"
            value={make}
            options={makeOptions}
            placeholder="Search or select make"
              onChange={(nextMake) => {
                setRegistrationVehicle(null);
                setRegistrationCandidateIds(null);
                setMake(nextMake);
                setModel("");
                setRecordId("");
                setWorkingKey("");
                resetResult();
            }}
          />

          <SearchableSelect
            label="2. Model"
            value={model}
            options={modelOptions}
            placeholder={make ? "Search or select model" : "Select a make first"}
            disabled={!make}
              onChange={(nextModel) => {
                setRegistrationVehicle(null);
                setRegistrationCandidateIds(null);
                setModel(nextModel);
                setRecordId("");
                setWorkingKey("");
                resetResult();
            }}
          />

          <SearchableSelect
            label="3. Year and generation"
            value={recordId}
            options={generationOptions}
            placeholder={model ? "Search or select year/generation" : "Select a model first"}
            disabled={!model}
            onChange={(nextRecordId) => {
                setRecordId(nextRecordId);
                setWorkingKey("");
                resetResult();
            }}
          />
          </> : null}

          {showWorkingKeyQuestion ? <fieldset disabled={loading}>
            <legend className="mb-1.5 text-xs font-semibold text-white/75">Do you have a working key?</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["yes", "no"] as const).map((answer) => (
                <button
                  key={answer}
                  type="button"
                  disabled={loading}
                  onClick={() => void checkKeyOptions(answer)}
                  className={`min-h-12 rounded-lg border px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/25 ${workingKey === answer ? "border-[#1677FF] bg-[#1677FF] text-[#171C22]" : "border-white/20 bg-white/5 text-white hover:border-white/45"}`}
                >
                  {answer === "yes" ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </fieldset> : null}

          {loading ? <div className="flex min-h-12 items-center justify-center rounded-lg border border-[#1677FF]/35 bg-[#1677FF]/10 text-sm font-bold text-white"><Loader2 size={17} className="mr-2 animate-spin text-[#1677FF]" /> Finding available keys…</div> : null}
        </form>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-amber-300/50 bg-amber-50 p-4 text-sm text-[#171C22]" role="alert">{error}</div>
      )}

      {quoteResult && (
        <div className="mt-4 rounded-lg border border-[#1677FF]/35 bg-[#EAF3FF] p-4 text-[#171C22]" role="status">
          <p className="text-xs font-bold uppercase tracking-wider text-[#1677FF]">
            {quoteResult.status === "matched" && selectedKeyChoiceId === null ? "OEM key check" : quoteResult.status === "estimated" || customerNeedsManualKeyCheck ? "Vehicle estimate" : hasPricedOptions ? "Key options found" : "Vehicle found"}
          </p>
          <p className="mt-1 font-bold">
            {quoteResult.vehicle.make} {quoteResult.vehicle.model} — {generationLabel(quoteResult.vehicle)}
          </p>
          {quoteResult.status === "matched" && selectedKeyChoiceId !== null ? (
            <button
              type="button"
              onClick={() => {
                setSelectedKeyChoiceId(null);
                setSelectedOptionId(null);
              }}
              className="mt-2 text-xs font-bold text-[#1677FF] hover:underline"
            >
              ← Choose a different OEM key
            </button>
          ) : null}

          {quoteResult.status === "matched" && selectedKeyChoiceId === null ? (
            <div className="mt-4 space-y-3">
              <p className="text-base font-extrabold text-[#171C22]">Choose the closest visual match to your key.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {quoteResult.keyChoices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => {
                      setSelectedKeyChoiceId(choice.id);
                      setSelectedOptionId(choice.options.length === 1 ? choice.options[0].id : null);
                    }}
                    className="overflow-hidden rounded-lg border border-[#171C22]/15 bg-white text-left transition hover:border-[#1677FF] hover:ring-2 hover:ring-[#1677FF]/20"
                  >
                    {choice.imagePath ? (
                      <img src={choice.imagePath} alt={choice.displayName} className="h-40 w-full bg-white object-contain p-3" loading="lazy" />
                    ) : (
                      <div className="flex h-32 items-center justify-center bg-[#F4F6F8] px-4 text-center text-xs font-medium text-[#171C22]/45">OEM key photograph being added</div>
                    )}
                    <div className="flex items-center justify-between gap-3 bg-[#F1F3F5] p-3">
                      <span className="text-sm font-bold text-[#171C22]">{choice.displayName}</span>
                      <span className="text-xs font-bold text-[#1677FF]">This one</span>
                    </div>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedKeyChoiceId("none");
                  setSelectedOptionId(quoteResult.fallbackOption?.id ?? null);
                }}
                className="w-full rounded-lg border border-[#171C22]/20 bg-white px-4 py-3 text-sm font-bold text-[#171C22] transition hover:border-[#1677FF] hover:bg-blue-50"
              >
                My key doesn’t look like any of these / unsure
              </button>
            </div>
          ) : hasPricedOptions && (quoteResult.status === "estimated" || customerNeedsManualKeyCheck) ? (
            <div className="mt-4 rounded-xl border border-[#1677FF]/30 bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1677FF]">Estimated price</p>
              <p className="mt-1 text-3xl font-black tracking-tight text-[#171C22]">
                {formatPrice(activeOptions[0].priceMinPence, activeOptions[0].priceMaxPence)}
              </p>
              <p className="mt-4 text-base font-extrabold text-[#171C22]">Quick key check needed</p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#171C22]/70">
                {customerNeedsManualKeyCheck
                  ? "Your key did not match the pictured options. Call and we’ll confirm the correct key type before booking."
                  : "Call to confirm the key type required for your vehicle."}
              </p>
            </div>
          ) : hasPricedOptions ? (
            <div className="mt-3 space-y-3">
              <p className="text-xs font-semibold text-[#171C22]/75">
                {activeOptions.length > 1 ? "Choose the key you prefer." : "This is the matching key option for your vehicle."}
              </p>
              {activeOptions.map((option) => {
                const selected = selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedOptionId(option.id)}
                    className={`w-full overflow-hidden rounded-lg border bg-white text-left transition ${selected ? "border-[#1677FF] ring-2 ring-[#1677FF]/25" : "border-[#171C22]/15 hover:border-[#1677FF]/55"}`}
                  >
                    {option.imagePath ? (
                      <img src={option.imagePath} alt={`${option.displayName} car key`} className="h-40 w-full bg-white object-contain p-3" loading="lazy" />
                    ) : option.priceStatus === "confirmed" ? (
                      <div className="flex h-28 items-center justify-center bg-[#F4F6F8] px-4 text-center text-xs font-medium text-[#171C22]/45">Key photograph being added</div>
                    ) : null}
                    <div className="bg-[#F1F3F5] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="whitespace-nowrap font-bold text-[#171C22]">
                          {option.keyType === "aftermarket" ? "Aftermarket key" : "Universal key"}
                        </h3>
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-[#1677FF] bg-[#1677FF] text-white" : "border-[#171C22]/25"}`}>
                          {selected && <Check size={13} />}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="shrink-0 text-xl font-bold text-[#171C22]">{formatPrice(option.priceMinPence, option.priceMaxPence)}</p>
                        <p className="max-w-[12rem] text-right text-[10px] font-semibold leading-4 text-[#171C22]/70">
                          (price includes cutting and programming at your location)
                        </p>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-[#171C22]/65">
                        <span className="flex items-center gap-2"><Clock3 size={14} className="text-[#1677FF]" /> {formatStock(option)}</span>
                        <span className="flex items-center gap-2"><MapPin size={14} className="text-[#1677FF]" /> All inclusive price - mobile service</span>
                      </div>
                    </div>
                  </button>
                );
              })}
              {activeOptions.length > 0 && !selectedOption && (
                <p className="text-center text-xs font-medium text-[#171C22]/60">Choose a key above to continue with that option.</p>
              )}
            </div>
          ) : quoteResult.status === "not_supported" ? (
            <div className="mt-4 rounded-xl border border-[#171C22]/15 bg-white p-4 text-center">
              <p className="text-base font-extrabold text-[#171C22]">This service isn’t currently confirmed for your vehicle</p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#171C22]/70">
                Call with reference <strong className="text-[#171C22]">{quoteResult.quoteReference}</strong> and we’ll check whether another key option is available.
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-[#1677FF]/30 bg-white p-4 text-center">
              <p className="text-base font-extrabold text-[#171C22]">Quick key check needed</p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#171C22]/70">
                Call with reference <strong className="text-[#171C22]">{quoteResult.quoteReference}</strong> and we’ll confirm the available key and price.
              </p>
            </div>
          )}

          {hasPricedOptions && quoteResult.quoteReference ? (
            <p className="mt-3 text-center text-sm font-semibold text-[#171C22]/65">
              Quote reference <strong className="ml-1 text-lg font-extrabold text-[#171C22]">{quoteResult.quoteReference}</strong>
            </p>
          ) : null}

          {(quoteResult.status !== "matched" || selectedKeyChoiceId !== null) ? <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <a
              href={`tel:${siteContent.business.phoneE164}`}
              onClick={() => trackCallClick("vehicle-search-result")}
              className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#1677FF] px-3 py-2.5 text-sm font-bold text-[#171C22] hover:bg-[#0D63DA]"
            >
              <Phone size={16} /> {allPricesConfirmed ? "Call to book" : hasPricedOptions ? "Call to confirm & book" : "Call us"}
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick("vehicle-search-result")}
              className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#171C22]/20 px-3 py-2.5 text-sm font-bold text-[#171C22] hover:bg-white"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div> : null}
        </div>
      )}
    </div>
  );
}
