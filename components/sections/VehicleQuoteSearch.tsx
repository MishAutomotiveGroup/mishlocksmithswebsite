"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, MessageCircle, Phone, Search } from "lucide-react";
import { vehicleCatalogue, type VehicleMake } from "@/content/vehicleCatalogue";
import { siteContent } from "@/content/siteContent";
import { trackCallClick, trackWhatsAppClick } from "@/lib/analytics";

type SearchOption = {
  label: string;
  searchTerms?: string[];
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
  const [submitted, setSubmitted] = useState(false);

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
  const canSubmit = yearIsValid && Boolean(selectedMake) && matchedModel;

  const vehicleMessage = [
    "Hi, I'd like a spare car key quote.",
    "",
    `Vehicle: ${year} ${make} ${model}`,
    "",
    "Do you have a working original key? Yes / No",
    "Postcode / area:",
  ].join("\n");
  const whatsappUrl = `https://wa.me/${siteContent.business.whatsappNumber}?text=${encodeURIComponent(vehicleMessage)}`;

  return (
    <div className="mb-5 rounded-xl border border-white/15 bg-[#10151A]/95 p-4 shadow-xl sm:p-5" data-testid="vehicle-quote-search">
      <div className="mb-4">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1677FF]">Instant vehicle check</p>
        <h2 className="text-xl font-bold text-white">Find your spare-key options</h2>
        <p className="mt-1 text-xs leading-relaxed text-white/55">Enter the year, then search for the make and model.</p>
      </div>

      <form
        onSubmit={event => {
          event.preventDefault();
          if (canSubmit) setSubmitted(true);
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
              setSubmitted(false);
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
            setSubmitted(false);
          }}
          onSelect={value => {
            const nextMake = vehicleCatalogue.find(item => item.name === value) ?? null;
            setMake(value);
            setSelectedMake(nextMake);
            setModel("");
            setSubmitted(false);
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
            setSubmitted(false);
          }}
          onSelect={value => {
            setModel(value);
            setSubmitted(false);
          }}
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#1677FF] px-5 py-3 text-sm font-bold text-[#171C22] transition hover:bg-[#0D63DA] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
        >
          Check key options
        </button>
      </form>

      {submitted && (
        <div className="mt-4 rounded-lg border border-[#1677FF]/35 bg-[#EAF3FF] p-4 text-[#171C22]" role="status">
          <p className="text-xs font-bold uppercase tracking-wider text-[#1677FF]">Vehicle selected</p>
          <p className="mt-1 font-bold">{year} {make} {model}</p>
          <p className="mt-2 text-xs leading-relaxed text-[#171C22]/65">
            An instant price is not listed for this vehicle yet. You can still send these details or call for a compatibility check.
          </p>
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
