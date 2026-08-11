import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const OPEN_DISPLAY  = "10:00 am";
const CLOSE_DISPLAY = "10:00 pm";

function getUKState(): { available: boolean; todayName: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    weekday: "long",
  }).formatToParts(new Date());
  const hour     = parseInt(parts.find(p => p.type === "hour")?.value    ?? "0", 10);
  const minute   = parseInt(parts.find(p => p.type === "minute")?.value  ?? "0", 10);
  const todayName = parts.find(p => p.type === "weekday")?.value ?? "";
  const total = hour * 60 + minute;
  return { available: total >= 630 && total < 1320, todayName };
}

export default function AvailabilityIndicator() {
  const [state,   setState]   = useState(getUKState);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const modalRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setState(getUKState()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => () => { document.body.style.overflow = ""; }, []);

  const openModal = useCallback(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const closeModal = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setMounted(false);
      document.body.style.overflow = "";
      triggerRef.current?.focus();
    }, 210);
  }, []);

  // Escape key
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mounted, closeModal]);

  // Focus trap + initial focus
  useEffect(() => {
    if (!mounted || !modalRef.current) return;
    const modal = modalRef.current;
    const getFocusable = () =>
      Array.from(modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ));
    const t = setTimeout(() => getFocusable()[0]?.focus(), 20);
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = getFocusable();
      if (!els.length) return;
      const first = els[0];
      const last  = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => { clearTimeout(t); document.removeEventListener("keydown", trap); };
  }, [mounted]);

  const { available, todayName } = state;

  return (
    <>
      {/* ── Trigger badge ─────────────────────────────────────────────── */}
      <div className="inline-flex flex-col items-center gap-1">
        <button
          ref={triggerRef}
          onClick={openModal}
          aria-expanded={mounted}
          aria-controls="hours-modal"
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 cursor-pointer transition-colors ${
            available
              ? "border border-[#2a4a2a] bg-[#1a1a1a] hover:bg-[#222]"
              : "border border-[#303030] bg-[#1a1a1a] hover:bg-[#222]"
          }`}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${available ? "bg-[#4a9a4a] animate-pulse" : "bg-[#888]"}`} />
          <span className={`font-semibold text-[11px] leading-tight whitespace-nowrap ${available ? "text-[#6ab86a]" : "text-white/45"}`}>
            {available
              ? `Open now • Today: ${OPEN_DISPLAY}–${CLOSE_DISPLAY}`
              : `Currently closed • Opens at ${OPEN_DISPLAY}`}
          </span>
        </button>
        <button
          onClick={openModal}
          className="text-white/30 text-[10px] hover:text-white/50 transition-colors"
          aria-label="View full opening hours"
        >
          View full opening hours
        </button>
      </div>

      {/* ── Modal overlay ─────────────────────────────────────────────── */}
      {mounted && (
        <div
          id="hours-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Opening hours"
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          style={{ padding: "20px 20px 88px" }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black transition-opacity duration-200"
            style={{ opacity: visible ? 0.45 : 0 }}
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Card */}
          <div
            ref={modalRef}
            className="relative z-10 bg-[#1e1e1e] border border-white/20 rounded-xl shadow-2xl p-5 w-full max-w-[320px]"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "scale(1)" : "scale(0.96)",
              transition: "opacity 200ms ease, transform 200ms ease",
              maxHeight: "calc(100vh - 120px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <p className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">Opening hours</p>
              <button
                onClick={closeModal}
                aria-label="Close opening hours"
                className="text-white/40 hover:text-white transition-colors rounded p-1 -mr-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {/* Schedule — scrollable if needed */}
            <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
              {DAYS.map(day => {
                const isToday = day === todayName;
                return (
                  <div key={day} className={`flex justify-between text-[12px] rounded px-1.5 py-1 ${isToday ? "bg-white/[0.09]" : ""}`}>
                    <span className={isToday ? "text-white font-semibold" : "text-white/55"}>{day}</span>
                    <span className={isToday ? "text-white font-semibold" : "text-white/80 font-medium"}>
                      {OPEN_DISPLAY} – {CLOSE_DISPLAY}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Status footer */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1.5 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${available ? "bg-[#4a9a4a] animate-pulse" : "bg-[#888]"}`} />
              <span className={`text-[11px] font-medium ${available ? "text-[#6ab86a]" : "text-white/45"}`}>
                {available ? "Open now" : "Currently closed"}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
