"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Clock3, Loader2, MessageCircle, PackageCheck, Phone, Search } from "lucide-react";
import { vehicleCatalogue, type VehicleMake } from "@/content/vehicleCatalogue";
import { siteContent } from "@/content/siteContent";
import { trackCallClick, trackWhatsAppClick } from "@/lib/analytics";

type SearchOption = {
  label: string;
  searchTerms?: string[];
};

type QuoteOption = {
  id: number;
  keyType: "universal" | "oem";
  displayName: string;
  priceMinPence: number | null;
  priceMaxPence: number | null;
  jobMinutesMin: number | null;
  jobMinutesMax: number | null;
  stockStatus: "in_stock" | "order_required" | "check_availability";
  leadBusinessDaysMin: number | null;
  leadBusinessDaysMax: number | null;
  imagePath: string | null;
};

type QuoteResult = {
  status: "matched" | "manual_check" | "not_supported" | "not_found";
  serviceType: "spare_key" | "all_keys_lost";
  vehicle: {
    make: string;
    model: string;
    year: number;
    variant: string | null;
    workingKeyRequired: boolean | null;
  };
  options: QuoteOption[];
};

const earliestYear = 1950;
const latestYear = new Date().getFullYear() + 1;

const normalise = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function editDistance(a: string, b: string) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return matrix[a.length][b.length];
}

function optionScore(option: SearchOption, rawQuery: string) {
  const query = normalise(rawQuery);
  if (!query) return 10;

  const candidates = [option.label, ...(option.searchTerms ?? [])]
    .map(normalise)
    .filter(Boolean);

  let best = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    const words = candidate.split(" ");
    if (candidate === query) best = Math.min(best, 0);
    else if (candidate.startsWith(query)) best = Math.min(best, 1);
    else if (words.some(word => word.startsWith(query))) best = Math.min(best, 2);
    else if (candidate.includes(query)) best = Math.min(best, 3);
    else {
      const threshold = query.length <= 4 ? 1 : query.length <= 8 ? 2 : 3;
      const distances = [candidate, ...words].map(value => editDistance(value, query));
      if (Math.min(...distances) <= threshold) best = Math.min(best, 4);
    }
  }
  return best;
}

function filterOptions(options: SearchOption[], query: string) {
  return options
    .map(option => ({ option, score: optionScore(option, query) }))
    .filter(item => Number.isFinite(item.score))
    .sort((a, b) => a.score - b.score || a.option.label.localeCompare(b.option.label, "en-GB"))
    .map(item => item.option);
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
    const min = option.leadBusinessDaysMin;
    const max = option.leadBusinessDaysMax;
    if (min !== null && max !== null && min !== max) return `Order time: ${min}–${max} business days`;
    if (min !== null || max !== null) return `Order time: ${min ?? max} business days`;
    return "Stock order required";
  }
  return "Availability checked before booking";
}

type SearchSelectProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  options: SearchOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
};

function SearchSelect({
  id,
  label,
  placeholder,
  value,
  options,
  disabled = false,
  onChange,
  onSelect,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const filtered = useMemo(() => filterOptions(options, value), [options, value]);
  const visibleOptions = filtered.slice(0, 80);

  const choose = (nextValue: string) => {
    onSelect(nextValue);
    setOpen(false);
    setActiveIndex(0);
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-white/75">
        {label}
      </label>
      <div className="relative">
        <Search size={17} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#171C22]/45" />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-options`}
          autoComplete="off"
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={event => {
            onChange(event.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={event => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex(index => Math.min(index + 1, Math.max(visibleOptions.length - 1, 0)));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex(index => Math.max(index - 1, 0));
            } else if (event.key === "Enter" && open && visibleOptions[activeIndex]) {
              event.preventDefault();
              choose(visibleOptions[activeIndex].label);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          className="h-12 w-full rounded-lg border border-white/20 bg-white pl-10 pr-10 text-base font-medium text-[#171C22] outline-none transition focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/30 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30 disabled:placeholder:text-white/25"
        />
        <ChevronDown size={18} className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${disabled ? "text-white/25" : "text-[#171C22]/45"} ${open ? "rotate-180" : ""}`} />
      </div>

      {open && !disabled && (
        <div
          id={`${id}-options`}
          role="listbox"
          className="absolute z-40 mt-1.5 max-h-64 w-full overflow-y-auto rounded-lg border border-[#171C22]/15 bg-white p-1.5 shadow-2xl"
        >
          {visibleOptions.length > 0 ? visibleOptions.map((option, index) => (
            <button
              key={option.label}
              type="button"
              role="option"
              aria-selected={option.label === value}
              onMouseDown={event => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(option.label)}
              className={`flex min-h-11 w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium text-[#171C22] ${index === activeIndex ? "bg-[#EAF3FF]" : "hover:bg-[#F4F6F8]"}`}
            >
              <span>{option.label}</span>
              {option.label === value && <Check size={16} className="text-[#1677FF]" />}
            </button>
          )) : (
            <p className="px-3 py-4 text-sm text-[#171C22]/60">
              No close match. Check the spelling or type the full name.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function VehicleQuoteSearch() {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null);
  const [workingKey, setWorkingKey] = useState<"" | "yes" | "no">("");
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const numericYear = Number(year);
  const yearIsValid = /^\d{4}$/.test(year) && numericYear >= earliestYear && numericYear <= latestYear;

  const makeOptions = useMemo<SearchOption[]>(
    () => vehicleCatalogue.map(item => ({ label: item.name, searchTerms: item.aliases })),
    [],
  );

  const modelOptions = useMemo<SearchOption[]>(() => {
    if (!selectedMake) return [];
    return [...selectedMake.models]
      .sort((a, b) => a.localeCompare(b, "en-GB", { numeric: true }))
      .map(label => ({
        label,
        searchTerms: label === "C4 Cactus" ? ["Cactus", "C1 Cactus"] : undefined,
      }));
  }, [selectedMake]);

  const matchedModel = modelOptions.some(option => option.label === model);
  const canSubmit = yearIsValid && Boolean(selectedMake) && matchedModel && workingKey !== "";
  const selectedOption = quoteResult?.options.find(option => option.id === selectedOptionId) ?? null;

  const vehicleMessage = [
    workingKey === "no"
      ? "Hi, I'd like an all-keys-lost replacement quote."
      : "Hi, I'd like a spare car key quote.",
    "",
    `Vehicle: ${year} ${make} ${model}`,
    "",
    `Working key: ${workingKey === "yes" ? "Yes" : workingKey === "no" ? "No" : "Not answered"}`,
    ...(selectedOption ? [`Selected key: ${selectedOption.displayName} (${selectedOption.keyType === "oem" ? "OEM" : "Universal"})`] : []),
    "Postcode / area:",
  ].join("\n");
  const whatsappUrl = `https://wa.me/${siteContent.business.whatsappNumber}?text=${encodeURIComponent(vehicleMessage)}`;

  return (
    <div className="mb-5 rounded-xl border border-white/15 bg-[#10151A]/95 p-4 shadow-xl sm:p-5" data-testid="vehicle-quote-search">
      <div className="mb-4">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1677FF]">Spare car key pricing</p>
        <h2 className="text-xl font-bold text-white">Get an instant quote</h2>
        <p className="mt-1 text-xs leading-relaxed text-white/55">Enter the year, then search for the make and model.</p>
      </div>

      <form
        onSubmit={async event => {
          event.preventDefault();
          if (!canSubmit || loading) return;
          setLoading(true);
          setError("");
          setQuoteResult(null);
          setSelectedOptionId(null);
          try {
            const response = await fetch("/api/vehicle-quote", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ year: numericYear, make, model, hasWorkingKey: workingKey === "yes" }),
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
        <div>
          <label htmlFor="vehicle-year" className="mb-1.5 block text-xs font-semibold text-white/75">1. Year</label>
          <input
            id="vehicle-year"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={year}
            placeholder="For example, 2018"
            onChange={event => {
              const nextYear = event.target.value.replace(/\D/g, "").slice(0, 4);
              setYear(nextYear);
              setMake("");
              setModel("");
              setSelectedMake(null);
              setWorkingKey("");
              setQuoteResult(null);
              setSelectedOptionId(null);
              setError("");
            }}
            aria-describedby="vehicle-year-help"
            className="h-12 w-full rounded-lg border border-white/20 bg-white px-3 text-base font-medium text-[#171C22] outline-none transition placeholder:text-[#171C22]/40 focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/30"
          />
          <p id="vehicle-year-help" className={`mt-1 text-[10px] ${year && !yearIsValid ? "text-amber-300" : "text-white/35"}`}>
            {year && !yearIsValid ? `Enter a year between ${earliestYear} and ${latestYear}.` : "Use the year shown on the V5C logbook."}
          </p>
        </div>

        <SearchSelect
          id="vehicle-make"
          label="2. Make"
          placeholder={yearIsValid ? "Search or choose a make" : "Enter the year first"}
          value={make}
          options={makeOptions}
          disabled={!yearIsValid}
          onChange={value => {
            setMake(value);
            setModel("");
            setSelectedMake(null);
            setWorkingKey("");
            setQuoteResult(null);
            setSelectedOptionId(null);
            setError("");
          }}
          onSelect={value => {
            const nextMake = vehicleCatalogue.find(item => item.name === value) ?? null;
            setMake(value);
            setSelectedMake(nextMake);
            setModel("");
            setWorkingKey("");
            setQuoteResult(null);
            setSelectedOptionId(null);
            setError("");
          }}
        />

        <SearchSelect
          id="vehicle-model"
          label="3. Model"
          placeholder={selectedMake ? "Search or choose a model" : "Choose the make first"}
          value={model}
          options={modelOptions}
          disabled={!selectedMake}
          onChange={value => {
            setModel(value);
            setQuoteResult(null);
            setSelectedOptionId(null);
            setError("");
          }}
          onSelect={value => {
            setModel(value);
            setQuoteResult(null);
            setSelectedOptionId(null);
            setError("");
          }}
        />

        <fieldset>
          <legend className="mb-1.5 block text-xs font-semibold text-white/75">4. Do you have at least one working key?</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["yes", "no"] as const).map(answer => (
              <button
                key={answer}
                type="button"
                aria-pressed={workingKey === answer}
                disabled={!matchedModel}
                onClick={() => {
                  setWorkingKey(answer);
                  setQuoteResult(null);
                  setSelectedOptionId(null);
                  setError("");
                }}
                className={`min-h-12 rounded-lg border px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/25 ${workingKey === answer ? "border-[#1677FF] bg-[#1677FF] text-[#171C22]" : "border-white/20 bg-white/5 text-white hover:border-white/45"}`}
              >
                {answer === "yes" ? "Yes, I have one" : "No, all keys are lost"}
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

      {error && (
        <div className="mt-4 rounded-lg border border-amber-300/50 bg-amber-50 p-4 text-sm text-[#171C22]" role="alert">
          {error}
        </div>
      )}

      {quoteResult && (
        <div className="mt-4 rounded-lg border border-[#1677FF]/35 bg-[#EAF3FF] p-4 text-[#171C22]" role="status">
          <p className="text-xs font-bold uppercase tracking-wider text-[#1677FF]">
            {quoteResult.status === "matched" ? "Instant quote" : "Vehicle check"}
          </p>
          <p className="mt-1 font-bold">
            {quoteResult.vehicle.year} {quoteResult.vehicle.make} {quoteResult.vehicle.model}
            {quoteResult.vehicle.variant ? ` — ${quoteResult.vehicle.variant}` : ""}
          </p>

          {quoteResult.status === "matched" ? (
            <div className="mt-3 space-y-3">
              <p className="text-xs font-semibold text-[#171C22]/75">
                {quoteResult.options.length > 1
                  ? "Select the key that looks like yours."
                  : "This is the matching key option for your vehicle."}
              </p>
              {quoteResult.options.map(option => {
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
              {quoteResult.serviceType === "spare_key" && quoteResult.vehicle.workingKeyRequired && (
                <p className="text-xs leading-relaxed text-[#171C22]/65">This quote requires the working key to be present at the appointment.</p>
              )}
            </div>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-[#171C22]/65">
              {quoteResult.status === "not_supported"
                ? workingKey === "no"
                  ? "We cannot currently offer an all-keys-lost replacement for this vehicle."
                  : "We cannot currently offer a spare key for this vehicle."
                : quoteResult.status === "manual_check"
                  ? "This vehicle needs a manual compatibility or stock check before we can confirm a price."
                  : "This vehicle is not in our instant-price database yet. Contact us and we can check it manually."}
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
