"use client";

import { Minus, Plus, Star } from "@/components/icons";

/** A number chosen with − and + (guests, rooms, bags). */
export function Stepper({ value, onChange, min = 0, max = 99, label, description, size = "md" }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; label?: React.ReactNode; description?: React.ReactNode; size?: "sm" | "md";
}) {
  const btn = `flex ${size === "sm" ? "h-8 w-8" : "h-9 w-9"} items-center justify-center rounded-full border border-line-strong text-ink-2 transition-colors hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-line-strong disabled:hover:text-ink-2`;
  const control = (
    <div className="flex items-center gap-3">
      <button type="button" className={btn} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Fewer${typeof label === "string" ? ` ${label.toLowerCase()}` : ""}`}>
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-6 text-center text-sm font-semibold text-ink tabular" aria-live="polite">{value}</span>
      <button type="button" className={btn} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} aria-label={`More${typeof label === "string" ? ` ${label.toLowerCase()}` : ""}`}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
  if (!label) return control;
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
      {control}
    </div>
  );
}

/** 1–5 stars to tap, for reviews and ratings. */
export function RatingInput({ value, onChange, label, size = "md" }: { value: number; onChange: (v: number) => void; label?: string; size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-5 w-5" : "h-7 w-7";
  return (
    <div className="flex items-center justify-between gap-3">
      {label && <span className="text-sm text-ink-2">{label}</span>}
      <div role="radiogroup" aria-label={label ?? "Rating"} className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n === 1 ? "" : "s"}`} onClick={() => onChange(n)}
            className={`rounded-md transition-transform hover:scale-110 ${n <= value ? "text-secondary" : "text-line-strong"}`}>
            <Star variant={n <= value ? "bold" : "linear"} className={s} />
          </button>
        ))}
      </div>
    </div>
  );
}
