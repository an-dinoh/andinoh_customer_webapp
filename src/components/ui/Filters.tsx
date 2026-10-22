"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, Calendar, X } from "@/components/icons";
import { addDays, startOfMonthISO, todayISO } from "@/utils/format";

/** A rounded search box (FIIXCONN/Velarius-like). */
export function SearchBox({ value, onChange, placeholder = "Search", className = "" }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
      <input type="search" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder}
        className="h-10 w-full rounded-full border border-line bg-surface pl-9 pr-8 text-sm text-ink placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10" />
      {value && (
        <button type="button" onClick={() => onChange("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-subtle hover:text-ink" aria-label="Clear search">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/** "Status: All ▾" pill that opens a short menu. */
export function FilterSelect<V extends string>({ label, value, options, onChange, allLabel = "All" }: {
  label: string; value: V | ""; options: { value: V; label: string }[]; onChange: (v: V | "") => void; allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const current = options.find(o => o.value === value)?.label ?? allLabel;
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open}
        className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors ${value ? "border-primary/40 bg-primary-50 text-primary" : "border-line bg-surface text-ink-2 hover:bg-surface-2"}`}>
        <span className="text-muted">{label}:</span>
        <span className="font-medium">{current}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <ul role="listbox" className="animate-pop absolute left-0 z-30 mt-1.5 max-h-72 min-w-[180px] overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-lg">
          {[{ value: "" as V | "", label: allLabel }, ...options].map(o => (
            <li key={o.value || "__all"}>
              <button type="button" role="option" aria-selected={o.value === value}
                onClick={() => { onChange(o.value as V | ""); setOpen(false); }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${o.value === value ? "bg-primary-50 text-primary" : "text-ink-2 hover:bg-surface-2"}`}>
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export interface Range { start: string; end: string }

const PRESETS: { key: string; label: string; range: () => Range }[] = [
  { key: "today", label: "Today", range: () => ({ start: todayISO(), end: todayISO() }) },
  { key: "7d", label: "Last 7 days", range: () => ({ start: todayISO(-6), end: todayISO() }) },
  { key: "30d", label: "Last 30 days", range: () => ({ start: todayISO(-29), end: todayISO() }) },
  { key: "month", label: "This month", range: () => ({ start: startOfMonthISO(), end: todayISO() }) },
  { key: "90d", label: "Last 90 days", range: () => ({ start: todayISO(-89), end: todayISO() }) },
];

export const thisMonth = (): Range => ({ start: startOfMonthISO(), end: todayISO() });

/** Date range with quick picks; the hotel's calendar. */
export function DateRangePicker({ value, onChange, max = todayISO(), placeholder = "Any date", onClear }: {
  value: Range | null; onChange: (r: Range) => void; max?: string; placeholder?: string; onClear?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const preset = value ? PRESETS.find(p => { const r = p.range(); return r.start === value.start && r.end === value.end; }) : undefined;
  const current = value ?? { start: todayISO(), end: todayISO() };
  const fmt = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-sm text-ink-2 hover:bg-surface-2">
        <Calendar className="h-4 w-4 text-muted" />
        <span className="font-medium">{!value ? placeholder : preset ? preset.label : `${fmt(value.start)} – ${fmt(value.end)}`}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </button>
      {open && (
        <div className="animate-pop absolute right-0 z-30 mt-1.5 w-72 rounded-xl border border-line bg-surface p-3 shadow-lg">
          <div className="grid grid-cols-2 gap-1.5">
            {PRESETS.map(p => (
              <button key={p.key} type="button" onClick={() => { onChange(p.range()); setOpen(false); }}
                className={`rounded-lg px-2.5 py-2 text-left text-xs font-medium ${preset?.key === p.key ? "bg-primary-50 text-primary" : "text-ink-2 hover:bg-surface-2"}`}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
            <label className="text-xs text-muted">From
              <input type="date" value={current.start} max={current.end} onChange={e => e.target.value && onChange({ ...current, start: e.target.value })}
                className="mt-1 h-9 w-full rounded-lg border border-line-strong px-2 text-sm text-ink" />
            </label>
            <label className="text-xs text-muted">To
              <input type="date" value={current.end} min={current.start} max={max} onChange={e => e.target.value && onChange({ ...current, end: e.target.value })}
                className="mt-1 h-9 w-full rounded-lg border border-line-strong px-2 text-sm text-ink" />
            </label>
          </div>
          {onClear && value && (
            <button type="button" onClick={() => { onClear(); setOpen(false); }} className="mt-3 w-full rounded-lg px-2.5 py-2 text-xs font-medium text-muted hover:bg-surface-2">Clear dates</button>
          )}
        </div>
      )}
    </div>
  );
}

/** Lays out search and filter pills; wraps on small screens. */
export function Toolbar({ children, right }: { children?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-line px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}

export const rangeDays = (r: Range) => Math.round((Date.parse(r.end) - Date.parse(r.start)) / 86_400_000) + 1;
export const shiftRange = (r: Range, days: number): Range => ({ start: addDays(r.start, days), end: addDays(r.end, days) });
