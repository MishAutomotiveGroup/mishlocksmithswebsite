"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export type SearchableSelectOption = {
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

export default function SearchableSelect({
  label,
  value,
  options,
  placeholder,
  disabled = false,
  variant = "dark",
  onChange,
}: {
  label: string;
  value: string;
  options: SearchableSelectOption[];
  placeholder: string;
  disabled?: boolean;
  variant?: "dark" | "light";
  onChange: (value: string) => void;
}) {
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? "";
  const isLight = variant === "light";

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
      <label
        htmlFor={inputId}
        className={isLight ? "block text-xs font-semibold text-slate-600" : "block text-xs font-semibold text-white/75"}
      >
        {label}
      </label>
      <div className="relative mt-1.5">
        <Search
          size={17}
          aria-hidden="true"
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${
            disabled ? (isLight ? "text-slate-300" : "text-white/25") : "text-[#171C22]/45"
          }`}
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
          className={
            isLight
              ? "h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-10 text-sm font-semibold text-[#171C22] outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:placeholder:text-slate-400"
              : "h-12 w-full rounded-lg border border-white/20 bg-white py-2 pl-10 pr-10 text-base font-semibold text-[#171C22] outline-none transition placeholder:text-[#171C22]/45 focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/30 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35 disabled:placeholder:text-white/30"
          }
        />
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition ${
            disabled ? (isLight ? "text-slate-300" : "text-white/25") : "text-[#171C22]/45"
          } ${open ? "rotate-180" : ""}`}
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
              className={`flex min-h-11 w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold transition ${
                highlightedIndex === index ? "bg-[#EAF3FF] text-[#0D63DA]" : "hover:bg-[#F4F6F8]"
              }`}
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
