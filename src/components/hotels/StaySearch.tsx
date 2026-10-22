"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { locationsApi, recentSearchesApi } from "@/services/api";
import { useDebounced, useQuery } from "@/hooks/useApi";
import { Calendar, Clock, Gps, Guests, Location, Search, X } from "@/components/icons";
import { Button, Stepper } from "@/components/ui";
import { addDays, todayISO } from "@/utils/format";
import { LIMITS, datesProblem, guestsLabel, type StayPlan } from "@/utils/stay";

/**
 * Where, when and who: the stay search used in the home hero and above results. A place picked from
 * the list searches by its id (and is remembered as a recent search when signed in); free text searches
 * names, cities and areas; "Near me" asks the browser for the location.
 */

export interface Where {
  label: string;
  search?: string;
  city_id?: string;
  area_id?: string;
  state_id?: string;
  near?: { latitude: number; longitude: number };
}

export function whereFromParams(p: { get(name: string): string | null }): Where {
  const lat = Number(p.get("lat"));
  const lng = Number(p.get("lng"));
  return {
    label: p.get("label") ?? p.get("search") ?? (p.get("near") ? "Near me" : ""),
    search: p.get("search") ?? undefined,
    city_id: p.get("city_id") ?? undefined,
    area_id: p.get("area_id") ?? undefined,
    state_id: p.get("state_id") ?? undefined,
    near: p.get("near") && Number.isFinite(lat) && Number.isFinite(lng) ? { latitude: lat, longitude: lng } : undefined,
  };
}

export function searchHref(where: Where, plan: Pick<StayPlan, "checkIn" | "checkOut" | "adults" | "children" | "infants">, extra: Record<string, string> = {}): string {
  const q = new URLSearchParams();
  if (where.city_id || where.area_id || where.state_id) {
    if (where.city_id) q.set("city_id", where.city_id);
    if (where.area_id) q.set("area_id", where.area_id);
    if (where.state_id) q.set("state_id", where.state_id);
    if (where.label) q.set("label", where.label);
  } else if (where.near) {
    q.set("near", "1");
    q.set("lat", String(where.near.latitude));
    q.set("lng", String(where.near.longitude));
  } else if (where.search?.trim()) {
    q.set("search", where.search.trim());
  }
  q.set("in", plan.checkIn);
  q.set("out", plan.checkOut);
  q.set("adults", String(plan.adults));
  if (plan.children) q.set("children", String(plan.children));
  if (plan.infants) q.set("infants", String(plan.infants));
  for (const [k, v] of Object.entries(extra)) if (v) q.set(k, v);
  return `/hotels?${q}`;
}

function useClickAway(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) close(); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, close]);
  return ref;
}

function WhereField({ value, onChange, onLocate, locating }: { value: Where; onChange: (w: Where) => void; onLocate: () => void; locating: boolean }) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useClickAway(open, () => setOpen(false));
  const listId = useId();
  const typed = value.city_id || value.area_id || value.state_id || value.near ? "" : (value.search ?? "");
  const debounced = useDebounced(typed.trim(), 250);
  const cities = useQuery(() => locationsApi.searchCities(debounced), [debounced], { enabled: open && debounced.length >= 2 });
  const recent = useQuery(() => recentSearchesApi.list(), [], { enabled: open && isAuthenticated });
  const pick = (w: Where) => { onChange(w); setOpen(false); };
  return (
    <div ref={ref} className="relative min-w-0 flex-1">
      <label className="flex h-full items-center gap-3 px-4 py-2.5">
        <Location className="h-5 w-5 shrink-0 text-primary" />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-muted">Where</span>
          <input
            value={value.label}
            onChange={e => onChange({ label: e.target.value, search: e.target.value })}
            onFocus={() => setOpen(true)}
            placeholder="City, area or hotel name"
            role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list"
            className="w-full truncate bg-transparent text-[15px] font-medium text-ink placeholder:font-normal placeholder:text-subtle focus:outline-none"
          />
        </span>
        {value.label && (
          <button type="button" onClick={() => onChange({ label: "" })} aria-label="Clear destination" className="rounded-full p-1 text-subtle hover:text-ink"><X className="h-4 w-4" /></button>
        )}
      </label>
      {open && (
        <div id={listId} role="listbox" className="animate-pop absolute left-0 right-0 top-full z-40 mt-2 max-h-80 min-w-[280px] overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 shadow-xl">
          <button type="button" role="option" aria-selected={false} onClick={() => { setOpen(false); onLocate(); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-surface-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary"><Gps className="h-[18px] w-[18px]" /></span>
            <span><span className="block font-medium text-ink">{locating ? "Finding you…" : "Hotels near me"}</span><span className="block text-xs text-muted">Uses your browser’s location</span></span>
          </button>
          {typed.trim().length >= 2 && (
            <button type="button" role="option" aria-selected={false} onClick={() => pick({ label: typed.trim(), search: typed.trim() })}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-surface-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-ink-2"><Search className="h-[18px] w-[18px]" /></span>
              <span className="text-ink">Search for “{typed.trim()}”</span>
            </button>
          )}
          {debounced.length >= 2 && (cities.data ?? []).slice(0, 6).map(c => (
            <button key={c.id} type="button" role="option" aria-selected={false} onClick={() => pick({ label: [c.name, c.state_name].filter(Boolean).join(", "), city_id: c.id })}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-surface-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-ink-2"><Location className="h-[18px] w-[18px]" /></span>
              <span><span className="block font-medium text-ink">{c.name}</span>{c.state_name && <span className="block text-xs text-muted">{c.state_name}</span>}</span>
            </button>
          ))}
          {!typed && (recent.data ?? []).length > 0 && (
            <>
              <p className="px-3 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wide text-muted">Recent searches</p>
              {(recent.data ?? []).slice(0, 5).map(r => (
                <button key={r.id} type="button" role="option" aria-selected={false}
                  onClick={() => pick({ label: r.label, search: r.city_id || r.area_id || r.state_id ? undefined : r.query, city_id: r.city_id ?? undefined, area_id: r.area_id ?? undefined, state_id: r.state_id ?? undefined })}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-surface-2">
                  <Clock className="h-4 w-4 text-subtle" /><span className="truncate text-ink-2">{r.label}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function GuestsField({ plan, onChange }: { plan: Pick<StayPlan, "adults" | "children" | "infants">; onChange: (p: Partial<StayPlan>) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useClickAway(open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className="flex h-full w-full items-center gap-3 px-4 py-2.5 text-left">
        <Guests className="h-5 w-5 shrink-0 text-primary" />
        <span className="min-w-0">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-muted">Guests</span>
          <span className="block truncate text-[15px] font-medium text-ink">{guestsLabel(plan)}</span>
        </span>
      </button>
      {open && (
        <div className="animate-pop absolute right-0 top-full z-40 mt-2 w-80 rounded-2xl border border-line bg-surface p-4 shadow-xl">
          <Stepper label="Adults" description="13 and over" value={plan.adults} min={LIMITS.adults[0]} max={LIMITS.adults[1]} onChange={adults => onChange({ adults })} />
          <Stepper label="Children" description="2 to 12" value={plan.children} min={0} max={LIMITS.children[1]} onChange={children => onChange({ children })} />
          <Stepper label="Infants" description="Under 2" value={plan.infants} min={0} max={LIMITS.infants[1]} onChange={infants => onChange({ infants })} />
          <Button variant="secondary" fullWidth className="mt-3" onClick={() => setOpen(false)}>Done</Button>
        </div>
      )}
    </div>
  );
}

export default function StaySearch({ initialWhere, initialPlan, variant = "hero", extra }: {
  initialWhere?: Where;
  initialPlan: Pick<StayPlan, "checkIn" | "checkOut" | "adults" | "children" | "infants">;
  variant?: "hero" | "bar";
  /** Filters to keep when searching again (star rating, sort). */
  extra?: Record<string, string>;
}) {
  const router = useRouter();
  const [where, setWhere] = useState<Where>(initialWhere ?? { label: "" });
  const [plan, setPlan] = useState(initialPlan);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = todayISO();

  const locate = async () => {
    setLocating(true);
    const { currentLocation } = await import("@/utils/device");
    const at = await currentLocation();
    setLocating(false);
    if (!at) { setError("We couldn’t get your location. Allow location in your browser, or type a place."); return; }
    setError(null);
    setWhere({ label: "Near me", near: at });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = datesProblem(plan.checkIn, plan.checkOut);
    if (problem) { setError(problem); return; }
    setError(null);
    router.push(searchHref(where, plan, extra));
  };

  const hero = variant === "hero";
  const dateCls = "w-full bg-transparent text-[15px] font-medium text-ink focus:outline-none [color-scheme:inherit]";
  return (
    <form onSubmit={submit} className="w-full">
      <div className={`flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface md:flex-row md:items-stretch md:divide-x md:divide-y-0 ${hero ? "shadow-2xl md:rounded-full md:p-1.5" : "md:rounded-full md:p-1"}`}>
        <WhereField value={where} onChange={setWhere} onLocate={locate} locating={locating} />
        <div className="grid grid-cols-2 divide-x divide-line md:flex md:w-[380px] md:shrink-0">
          <label className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5">
            <Calendar className="hidden h-5 w-5 shrink-0 text-primary sm:block" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-medium uppercase tracking-wide text-muted">Check in</span>
              <input type="date" value={plan.checkIn} min={today} max={addDays(today, LIMITS.maxDaysAhead)} aria-label="Check-in date"
                onChange={e => { const v = e.target.value; setPlan(p => ({ ...p, checkIn: v, checkOut: p.checkOut <= v ? addDays(v, 1) : p.checkOut })); }} className={dateCls} />
            </span>
          </label>
          <label className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5">
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-medium uppercase tracking-wide text-muted">Check out</span>
              <input type="date" value={plan.checkOut} min={addDays(plan.checkIn || today, 1)} max={addDays(plan.checkIn || today, LIMITS.maxNights)} aria-label="Check-out date"
                onChange={e => setPlan(p => ({ ...p, checkOut: e.target.value }))} className={dateCls} />
            </span>
          </label>
        </div>
        <div className="flex items-stretch md:w-[270px] md:shrink-0">
          <div className="min-w-0 flex-1"><GuestsField plan={plan} onChange={p => setPlan(x => ({ ...x, ...p }))} /></div>
          <div className="hidden items-center pr-1 md:flex">
            <Button type="submit" size={hero ? "lg" : "md"} className="rounded-full" icon={Search} aria-label="Search hotels">{hero ? "Search" : undefined}</Button>
          </div>
        </div>
        <div className="p-2 md:hidden"><Button type="submit" size="lg" fullWidth icon={Search}>Search hotels</Button></div>
      </div>
      {error && <p role="alert" className={`mt-2 text-sm ${hero ? "rounded-xl bg-danger-50 px-3 py-2 text-danger-fg" : "text-danger"}`}>{error}</p>}
    </form>
  );
}
