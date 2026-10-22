import { money, toNumber } from "@/utils/format";
import type { BookingServiceLine, Money, PriceBreakdown, Quote } from "@/types/api";

export function Line({ label, value, currency = "NGN", strong, muted, negative, hideZero }: {
  label: React.ReactNode; value: Money | null | undefined; currency?: string; strong?: boolean; muted?: boolean; negative?: boolean; hideZero?: boolean;
}) {
  if (hideZero && !toNumber(value)) return null;
  return (
    <div className={`flex items-baseline justify-between gap-3 ${strong ? "text-base font-semibold text-ink" : muted ? "text-sm text-muted" : "text-sm text-ink-2"}`}>
      <dt>{label}</dt>
      <dd className={`tabular ${negative ? "text-success" : ""}`}>{negative && toNumber(value) ? "−" : ""}{money(Math.abs(toNumber(value)), currency)}</dd>
    </div>
  );
}

/** Difference of two API amounts in kobo, for "the rest at the hotel" (display only). */
export function remainder(total: Money, paidNow: Money): number {
  return (Math.round(toNumber(total) * 100) - Math.round(toNumber(paidNow) * 100)) / 100;
}

/** The checkout summary, shown exactly as the quote returns it (guide 6.1). */
export function QuoteSummary({ quote }: { quote: Quote }) {
  const atHotel = remainder(quote.total, quote.due_online_now);
  return (
    <dl className="space-y-2">
      <Line label={`Rooms · ${quote.nights} night${quote.nights === 1 ? "" : "s"}`} value={quote.room_charges} currency={quote.currency} />
      <Line label="Add-ons" value={quote.services} currency={quote.currency} hideZero />
      <Line label="Taxes" value={quote.taxes} currency={quote.currency} muted />
      <Line label="Service fee" value={quote.service_fee} currency={quote.currency} muted />
      <Line label="Points" value={quote.points_discount} currency={quote.currency} negative hideZero />
      <div className="border-t border-line pt-2"><Line label="Total" value={quote.total} currency={quote.currency} strong /></div>
      {quote.pay_at_hotel || atHotel > 0 ? (
        <div className="space-y-1 rounded-xl bg-primary-50 p-3">
          <Line label={<span className="font-medium text-primary">Pay now</span>} value={quote.due_online_now} currency={quote.currency} />
          <Line label="At the hotel" value={atHotel} currency={quote.currency} muted />
        </div>
      ) : null}
    </dl>
  );
}

/**
 * A booking's price summary from its price_breakdown (guide 9.1). `room_charges` is already after the
 * discount (shown as a saving), and add-ons aren't in the breakdown, so they're listed from the booking.
 */
export function BreakdownSummary({ breakdown, currency, services = [] }: { breakdown: PriceBreakdown; currency: string; services?: BookingServiceLine[] }) {
  return (
    <dl className="space-y-2">
      <Line label={`Rooms · ${breakdown.nights} night${breakdown.nights === 1 ? "" : "s"}`} value={breakdown.room_charges} currency={currency} />
      {toNumber(breakdown.discount) > 0 && <p className="-mt-1 text-xs text-success">Includes {money(breakdown.discount, currency)} off</p>}
      {services.map(s => (
        <Line key={s.id} label={`${s.service_name}${s.quantity > 1 ? ` × ${s.quantity}` : ""}`} value={(Math.round(toNumber(s.price) * 100) * s.quantity) / 100} currency={currency} />
      ))}
      <Line label="Extras during your stay" value={breakdown.incidentals} currency={currency} hideZero />
      <Line label="Taxes" value={breakdown.taxes} currency={currency} muted />
      <Line label="Service fee" value={breakdown.service_fee} currency={currency} muted />
      <Line label="Points" value={breakdown.points_discount} currency={currency} negative hideZero />
      <div className="border-t border-line pt-2"><Line label="Total" value={breakdown.total} currency={currency} strong /></div>
      <Line label="Paid" value={breakdown.paid} currency={currency} />
      {toNumber(breakdown.balance_due) > 0 && <Line label={<span className="font-medium text-warning">Balance due</span>} value={breakdown.balance_due} currency={currency} />}
    </dl>
  );
}
