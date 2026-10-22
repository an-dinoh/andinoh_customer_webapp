"use client";

import { bookingsApi } from "@/services/api";
import { useDebounced, useQuery } from "@/hooks/useApi";
import { Button, Callout, Skeleton, Stepper } from "@/components/ui";
import { ArrowRight, Calendar } from "@/components/icons";
import { addDays, money, nightsBetween, todayISO } from "@/utils/format";
import { LIMITS, datesProblem, guestsLabel, occupancyProblem, stayRequest, type StayPlan } from "@/utils/stay";
import type { RoomCard } from "@/types/api";

/**
 * The reservation box beside the rooms: dates, guests, the rooms picked, and the exact price for them
 * from the quote endpoint (taxes and the service fee included, guide 6.1).
 */
export default function StayPlanner({ hotelId, plan, rooms, onPlan, onReserve }: {
  hotelId: string;
  plan: StayPlan;
  rooms: RoomCard[];
  onPlan: (p: StayPlan) => void;
  onReserve: () => void;
}) {
  const today = todayISO();
  const nights = nightsBetween(plan.checkIn, plan.checkOut);
  const dateProblem = datesProblem(plan.checkIn, plan.checkOut);
  const picked = rooms.filter(r => (plan.rooms[r.id] ?? 0) > 0);
  const fit = occupancyProblem(plan, picked.map(r => ({ max_occupancy: r.max_occupancy, quantity: plan.rooms[r.id] })));
  const request = stayRequest(hotelId, plan);
  const debounced = useDebounced(JSON.stringify(request), 400);
  const quote = useQuery(() => bookingsApi.quote(JSON.parse(debounced)), [debounced], { enabled: picked.length > 0 && !dateProblem });

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <p className="text-[15px] font-semibold text-ink">Your stay</p>
      <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border border-line-strong">
        <label className="border-r border-line-strong px-3 py-2">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-muted">Check in</span>
          <input type="date" value={plan.checkIn} min={today} max={addDays(today, LIMITS.maxDaysAhead)} aria-label="Check-in date"
            onChange={e => { const v = e.target.value; if (v) onPlan({ ...plan, checkIn: v, checkOut: plan.checkOut <= v ? addDays(v, 1) : plan.checkOut }); }}
            className="w-full bg-transparent text-sm font-medium text-ink focus:outline-none" />
        </label>
        <label className="px-3 py-2">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-muted">Check out</span>
          <input type="date" value={plan.checkOut} min={addDays(plan.checkIn, 1)} max={addDays(plan.checkIn, LIMITS.maxNights)} aria-label="Check-out date"
            onChange={e => e.target.value && onPlan({ ...plan, checkOut: e.target.value })} className="w-full bg-transparent text-sm font-medium text-ink focus:outline-none" />
        </label>
      </div>
      <details className="group mt-2 rounded-xl border border-line-strong px-3 py-2">
        <summary className="flex cursor-pointer list-none items-center justify-between">
          <span><span className="block text-[11px] font-medium uppercase tracking-wide text-muted">Guests</span><span className="text-sm font-medium text-ink">{guestsLabel(plan)}</span></span>
          <span className="text-xs font-medium text-primary group-open:hidden">Change</span>
        </summary>
        <div className="mt-2 border-t border-line pt-1">
          <Stepper size="sm" label="Adults" value={plan.adults} min={LIMITS.adults[0]} max={LIMITS.adults[1]} onChange={adults => onPlan({ ...plan, adults })} />
          <Stepper size="sm" label="Children" value={plan.children} max={LIMITS.children[1]} onChange={children => onPlan({ ...plan, children })} />
          <Stepper size="sm" label="Infants" value={plan.infants} max={LIMITS.infants[1]} onChange={infants => onPlan({ ...plan, infants })} />
        </div>
      </details>

      {dateProblem ? <div className="mt-4"><Callout tone="warning">{dateProblem}</Callout></div> : (
        <>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted"><Calendar className="h-4 w-4" />{nights} night{nights === 1 ? "" : "s"}</p>
          {picked.length === 0 ? (
            <p className="mt-3 rounded-xl bg-surface-2 px-3 py-3 text-sm text-muted">Choose a room to see the total for your dates.</p>
          ) : (
            <div className="mt-3 space-y-2 border-t border-line pt-3 text-sm">
              {picked.map(r => {
                const line = quote.data?.rooms.find(q => q.room_id === r.id);
                return (
                  <div key={r.id} className="flex justify-between gap-3">
                    <span className="text-ink-2">{plan.rooms[r.id]} × {r.title}</span>
                    <span className="tabular text-ink">{line ? money(line.total) : <Skeleton className="h-4 w-16" />}</span>
                  </div>
                );
              })}
              {quote.data && (
                <>
                  <div className="flex justify-between gap-3 text-muted"><span>Taxes</span><span className="tabular">{money(quote.data.taxes)}</span></div>
                  <div className="flex justify-between gap-3 text-muted"><span>Service fee</span><span className="tabular">{money(quote.data.service_fee)}</span></div>
                  <div className="flex justify-between gap-3 border-t border-line pt-2 text-base font-semibold text-ink"><span>Total</span><span className="tabular">{money(quote.data.total, quote.data.currency)}</span></div>
                </>
              )}
              {quote.error && <p className="text-xs text-danger">{quote.error.message}</p>}
            </div>
          )}
          {fit && <div className="mt-3"><Callout tone="warning">{fit}</Callout></div>}
        </>
      )}
      <Button size="lg" fullWidth className="mt-4" iconRight={ArrowRight} disabled={!!dateProblem || !picked.length || !!fit || !!quote.error} onClick={onReserve}>Reserve</Button>
      <p className="mt-2 text-center text-xs text-muted">You won’t be charged yet. Add-ons and payment come next.</p>
    </div>
  );
}
