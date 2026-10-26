"use client";

import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff, ChevronDown } from "@/components/icons";
import { formatAmountInput } from "@/utils/format";

/**
 * Form fields: label above, hint or error below. `error` takes the server's field message
 * (ApiError.fieldErrors[name]) so validation is shown where it belongs.
 */

const control =
  "w-full rounded-xl border bg-surface px-3.5 text-sm text-ink placeholder:text-subtle transition-colors " +
  "focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary disabled:bg-surface-2 disabled:text-muted";

function ring(error?: string) {
  return error ? "border-danger focus:border-danger focus:ring-danger/10" : "border-line-strong";
}

interface Shell {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
}

export function FieldShell({ id, label, hint, error, required, className = "", children }: Shell & { id: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-ink-2">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = Shell & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> & {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, required, className, prefix, suffix, id, type = "text", ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <FieldShell id={fid} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative flex items-center">
        {prefix && <span className="pointer-events-none absolute left-3.5 text-sm text-muted">{prefix}</span>}
        <input
          ref={ref}
          id={fid}
          type={isPassword && show ? "text" : type}
          required={required}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${fid}-error` : undefined}
          className={`${control} ${ring(error)} h-11 ${prefix ? "pl-8" : ""} ${suffix || isPassword ? "pr-11" : ""}`}
          {...rest}
        />
        {isPassword ? (
          <button type="button" onClick={() => setShow(s => !s)} className="absolute right-1.5 rounded-lg p-1.5 text-muted hover:text-ink" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        ) : suffix ? (
          <span className="pointer-events-none absolute right-3.5 text-sm text-muted">{suffix}</span>
        ) : null}
      </div>
    </FieldShell>
  );
});

/**
 * An amount in naira, grouped as it's typed ("₦150,000.50"). `value` may be a raw API amount ("55000.00")
 * or what the box last reported; onChange reports the formatted text, and the caller converts it with
 * toApiAmount, which drops the commas.
 */
export const MoneyInput = forwardRef<HTMLInputElement, InputProps & { currency?: string }>(function MoneyInput(
  { currency = "NGN", value, onChange, ...rest },
  ref,
) {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const caret = el.selectionStart ?? el.value.length;
    // Keep the caret after the same digit once commas move around it.
    const kept = el.value.slice(0, caret).replace(/[^\d.]/g, "").length;
    const next = formatAmountInput(el.value);
    el.value = next;
    let pos = 0;
    for (let seen = 0; pos < next.length && seen < kept; pos++) if (/[\d.]/.test(next[pos])) seen++;
    requestAnimationFrame(() => { if (document.activeElement === el) el.setSelectionRange(pos, pos); });
    onChange?.(e);
  };
  return <Input ref={ref} inputMode="decimal" autoComplete="off" prefix={currency === "NGN" ? "₦" : currency} placeholder="0.00"
    value={formatAmountInput(value as string | number | undefined)} onChange={handle} {...rest} />;
});

type TextareaProps = Shell & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className">;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required, className, id, rows = 3, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea ref={ref} id={fid} rows={rows} required={required} aria-invalid={!!error || undefined}
        className={`${control} ${ring(error)} py-2.5 leading-relaxed resize-y`} {...rest} />
    </FieldShell>
  );
});

type SelectProps = Shell & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
  options: { value: string; label: string }[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, required, className, id, options, placeholder, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        <select ref={ref} id={fid} required={required} aria-invalid={!!error || undefined}
          className={`${control} ${ring(error)} h-11 appearance-none pr-10`} {...rest}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
      </div>
    </FieldShell>
  );
});

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

/** A labelled switch row, for yes/no settings. */
export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  const id = useId();
  return (
    <label htmlFor={id} className={`flex items-start justify-between gap-4 py-2 ${disabled ? "opacity-60" : "cursor-pointer"}`}>
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="block text-xs text-muted mt-0.5">{description}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input id={id} type="checkbox" role="switch" className="peer sr-only" checked={checked} disabled={disabled}
          onChange={e => onChange(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-line-strong transition-colors peer-checked:bg-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export function Checkbox({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: React.ReactNode; disabled?: boolean }) {
  return (
    <label className={`inline-flex items-start gap-2.5 text-sm text-ink-2 ${disabled ? "opacity-60" : "cursor-pointer"}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={e => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong text-primary accent-primary focus:ring-primary/20" />
      {/* One span, so a label with a link wraps as a sentence instead of splitting into flex items. */}
      <span>{label}</span>
    </label>
  );
}

/** A row of choices shown as segments (e.g. payment method). */
export function Segmented<V extends string>({ value, onChange, options, label, size = "md" }: {
  value: V; onChange: (v: V) => void; options: { value: V; label: string }[]; label?: string; size?: "sm" | "md";
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-[13px] font-medium text-ink-2">{label}</span>}
      <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl border border-line bg-surface-2 p-1">
        {options.map(o => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
            className={`flex-1 whitespace-nowrap rounded-lg ${size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-1.5 text-sm"} font-medium transition-colors ${value === o.value ? "bg-raised text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FormGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 }) {
  const c = cols === 1 ? "" : cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return <div className={`grid grid-cols-1 gap-4 ${c}`}>{children}</div>;
}
