"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Clock3, Loader2, MessageCircle, PackageCheck, Phone, Search } from "lucide-react";
import { siteContent } from "@/content/siteContent";
import { trackCallClick, trackWhatsAppClick } from "@/lib/analytics";

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
  keyType: "universal" | "oem";
  displayName: string;
  priceMinPence: number | null;
  priceMaxPence: number | null;
  jobMinutesMin: number | null;
  jobMinutesMax: number | null;
  stockStatus: "in_stock" | "order_required" | "check_availability";
  leadTime: string | null;
  imagePath: string | null;
};

type QuoteResult = {
  status: "matched" | "manual_check" | "not_supported" | "not_found";
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
};

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

function formatMinutes(min: number | null, max: number | null) {
  if (min === null && max === null) return "Time confirmed before booking";
  if (min === max || max === null) return `About ${min} minutes`;
  if (min === null) return `Up to ${max} minutes`;
  return `${min}–${max} minutes`;
}

function formatStock(option: QuoteOption) {
  if (option.stockStatus === "in_stock") return "Normally in stock";
  if (option.stockStatus === "order_required") {
    return option.leadTime ? `Order time: ${option.leadTime}` : "Stock order required";
  }
  return option.leadTime || "Availability checked before booking";
}

type SearchableSelectOption = {
  value: string;
  label: string;
};

function normaliseSearch(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function SearchableSelect({
  label,
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}: {
  label: string;
  value: string;
  options: SearchableSelectOption[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? "";

  const filteredOptions = useMemo(() => {
    const search = normaliseSearch(query);
    if (!search) return options;
    const terms = search.split(" ");
    return options.filter((option) => {
      const searchableLabel = normaliseSearch(option.label);
      return terms.every((term) => searchableLabel.includes(term));
    });
  }, [options, query]);

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  function openList() {
    if (disabled) return;
    setQuery("");
    setHighlightedIndex(0);
    setOpen(true);
  }

  function chooseOption(option: SearchableSelectOption) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={inputId} className="block text-xs font-semibold text-white/75">
        {label}
      </label>
      <div className="relative mt-1.5">
        <Search
          size={17}
          aria-hidden="true"
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${disabled ? "text-white/25" : "text-[#171C22]/45"}`}
        />
        <input
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={open && filteredOptions[highlightedIndex] ? `${inputId}-option-${highlightedIndex}` : undefined}
          value={open ? query : selectedLabel}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={openList}
          onClick={() => {
            if (!open) openList();
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlightedIndex(0);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              if (!open) openList();
              else setHighlightedIndex((index) => Math.min(index + 1, Math.max(filteredOptions.length - 1, 0)));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlightedIndex((index) => Math.max(index - 1, 0));
            } else if (event.key === "Enter" && open && filteredOptions[highlightedIndex]) {
              event.preventDefault();
              chooseOption(filteredOptions[highlightedIndex]);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          className="h-12 w-full rounded-lg border border-white/20 bg-white py-2 pl-10 pr-10 text-base font-semibold text-[#171C22] outline-none transition placeholder:text-[#171C22]/45 focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/30 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35 disabled:placeholder:text-white/30"
        />
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition ${disabled ? "text-white/25" : "text-[#171C22]/45"} ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-[#171C22]/15 bg-white p-1 text-[#171C22] shadow-2xl"
        >
          {filteredOptions.length > 0 ? filteredOptions.map((option, index) => (
            <button
              id={`${inputId}-option-${index}`}
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onPointerEnter={() => setHighlightedIndex(index)}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => chooseOption(option)}
              className={`flex min-h-11 w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold transition ${highlightedIndex === index ? "bg-[#EAF3FF] text-[#0D63DA]" : "hover:bg-[#F4F6F8]"}`}
            >
              <span>{option.label}</span>
              {option.value === value && <Check size={16} aria-hidden="true" className="shrink-0 text-[#1677FF]" />}
            </button>
          )) : (
            <p className="px-3 py-4 text-sm text-[#171C22]/60">No matching options found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function VehicleQuoteSearch() {
  const [records, setRecords] = useState<VehicleRecordOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [recordId, setRecordId] = useState("");
  const [workingKey, setWorkingKey] = useState<"" | "yes" | "no">("");
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
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
  const makeOptions = useMemo(() => makes.map((item) => ({ value: item, label: item })), [makes]);
  const modelOptions = useMemo(() => models.map((item) => ({ value: item, label: item })), [models]);
  const generationOptions = useMemo(() => generations.map((record) => ({
    value: record.id,
    label: generationLabel(record),
  })), [generations]);

  const selectedRecord = records.find((record) => record.id === recordId) ?? null;
  const selectedOption = quoteResult?.options.find((option) => option.id === selectedOptionId) ?? null;
  const canSubmit = Boolean(selectedRecord) && workingKey !== "";

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
    ...(selectedOption ? [`Selected key: ${selectedOption.displayName} (${selectedOption.keyType === "oem" ? "OEM" : "Universal"})`] : []),
    "Postcode / area:",
  ].join("\n");
  const whatsappUrl = `https://wa.me/${siteContent.business.whatsappNumber}?text=${encodeURIComponent(vehicleMessage)}`;

  function resetResult() {
    setQuoteResult(null);
    setSelectedOptionId(null);
    setError("");
  }

  return (
    <div className="mb-5 rounded-xl border border-white/15 bg-[#10151A]/95 p-4 shadow-xl sm:p-5" data-testid="vehicle-quote-search">
      <div className="mb-4">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1677FF]">Spare car key pricing</p>
        <h2 className="text-xl font-bold text-white">Get an instant quote</h2>
        <p className="mt-1 text-xs leading-relaxed text-white/55">Type to search, or choose the make, model and vehicle generation from each list.</p>
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
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (!canSubmit || loading) return;
            setLoading(true);
            resetResult();
            try {
              const response = await fetch("/api/vehicle-quote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recordId, hasWorkingKey: workingKey === "yes" }),
              });
              const result = await response.json() as QuoteResult & { error?: string };
              if (!response.ok) throw new Error(result.error || "Quote lookup failed");
              setQuoteResult(result);
              setSelectedOptionId(result.status === "matched" && result.options.length === 1 ? result.options[0].id : null);
            } catch (lookupError) {
              setError(lookupError instanceof Error ? lookupError.message : "We couldn't check this vehicle right now.");
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-3"
        >
          <SearchableSelect
            label="1. Make"
            value={make}
            options={makeOptions}
            placeholder="Search or select make"
            onChange={(nextMake) => {
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

          <fieldset disabled={!recordId}>
            <legend className="mb-1.5 text-xs font-semibold text-white/75">Do you have a working key?</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["yes", "no"] as const).map((answer) => (
                <button
                  key={answer}
                  type="button"
                  onClick={() => { setWorkingKey(answer); resetResult(); }}
                  className={`min-h-12 rounded-lg border px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/25 ${workingKey === answer ? "border-[#1677FF] bg-[#1677FF] text-[#171C22]" : "border-white/20 bg-white/5 text-white hover:border-white/45"}`}
                >
                  {answer === "yes" ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#1677FF] px-5 py-3 text-sm font-bold text-[#171C22] transition hover:bg-[#0D63DA] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
          >
            {loading ? <><Loader2 size={17} className="mr-2 animate-spin" /> Checking your vehicle…</> : "Check key options"}
          </button>
        </form>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-amber-300/50 bg-amber-50 p-4 text-sm text-[#171C22]" role="alert">{error}</div>
      )}

      {quoteResult && (
        <div className="mt-4 rounded-lg border border-[#1677FF]/35 bg-[#EAF3FF] p-4 text-[#171C22]" role="status">
          <p className="text-xs font-bold uppercase tracking-wider text-[#1677FF]">
            {quoteResult.status === "matched" ? "Instant quote" : "Vehicle check"}
          </p>
          <p className="mt-1 font-bold">
            {quoteResult.vehicle.make} {quoteResult.vehicle.model} — {generationLabel(quoteResult.vehicle)}
          </p>

          {quoteResult.quoteReference ? (
            <div className="my-4 rounded-xl border-2 border-[#1677FF] bg-[#171C22] px-4 py-4 text-center text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1677FF]">Your quote reference</p>
              <p className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{quoteResult.quoteReference}</p>
              <p className="mt-2 text-sm font-semibold text-white">Use this reference number for your phone call.</p>
            </div>
          ) : null}

          {quoteResult.status === "matched" ? (
            <div className="mt-3 space-y-3">
              <p className="text-xs font-semibold text-[#171C22]/75">
                {quoteResult.options.length > 1 ? "Select the key that looks like yours." : "This is the matching key option for your vehicle."}
              </p>
              {quoteResult.options.map((option) => {
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
                      <img src={option.imagePath} alt={`${option.displayName} car key`} className="h-40 w-full bg-[#F4F6F8] object-contain p-3" loading="lazy" />
                    ) : (
                      <div className="flex h-28 items-center justify-center bg-[#F4F6F8] px-4 text-center text-xs font-medium text-[#171C22]/45">Key photograph being added</div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1677FF]">{option.keyType === "oem" ? "OEM key" : "Universal key"}</span>
                          <h3 className="font-bold text-[#171C22]">{option.displayName}</h3>
                        </div>
                        <div className="flex items-start gap-2">
                          <p className="shrink-0 text-xl font-bold text-[#171C22]">{formatPrice(option.priceMinPence, option.priceMaxPence)}</p>
                          <span className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${selected ? "border-[#1677FF] bg-[#1677FF] text-white" : "border-[#171C22]/25"}`}>
                            {selected && <Check size={13} />}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-[#171C22]/65">
                        <span className="flex items-center gap-2"><Clock3 size={14} className="text-[#1677FF]" /> {formatMinutes(option.jobMinutesMin, option.jobMinutesMax)}</span>
                        <span className="flex items-center gap-2"><PackageCheck size={14} className="text-[#1677FF]" /> {formatStock(option)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
              {quoteResult.options.length > 0 && !selectedOption && (
                <p className="text-center text-xs font-medium text-[#171C22]/60">Choose a key above to continue with that option.</p>
              )}
            </div>
          ) : (
            <p className={`mt-3 leading-relaxed ${quoteResult.status === "not_found" ? "text-base font-semibold text-[#171C22]" : "text-xs text-[#171C22]/65"}`}>
              {quoteResult.status === "not_supported"
                ? workingKey === "no"
                  ? "We cannot currently offer an all-keys-lost replacement for this vehicle."
                  : "We cannot currently offer a spare key for this vehicle."
                : quoteResult.status === "not_found"
                  ? "This vehicle is not currently included in our key database. Call us with the reference above and we’ll check it manually."
                  : "This vehicle needs a manual compatibility or stock check before we can confirm a price."}
            </p>
          )}

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <a
              href={`tel:${siteContent.business.phoneE164}`}
              onClick={() => trackCallClick("vehicle-search-result")}
              className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#1677FF] px-3 py-2.5 text-sm font-bold text-[#171C22] hover:bg-[#0D63DA]"
            >
              <Phone size={16} /> Call now
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
          </div>
        </div>
      )}
    </div>
  );
}
