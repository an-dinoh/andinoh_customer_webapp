"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button, Callout, DetailList, Img, Panel, Pill } from "@/components/ui";
import { Call, Calendar, Clock, Copy, Location, Mail, Map, Receipt, ShieldCheck, Wallet } from "@/components/icons";
import { BreakdownSummary } from "./PriceSummary";
import { ReceiptList, type GuestAccess } from "./Receipts";
import { formatDate, formatDateTime, humanize, money, nightsBetween, toNumber } from "@/utils/format";
import { clock, completedPayments, holdLeft, refundPreview, roomNumber, statusInfo } from "@/utils/bookings";
import type { HotelBooking } from "@/types/api";

/** "29:41 left to pay": the room hold counting down (guide 6.3). */
export function HoldCountdown({ until, onExpired }: { until: string | null; onExpired?: () => void }) {
  const [left, setLeft] = useState(() => holdLeft(until));
  useEffect(() => {
    const t = setInterval(() => {
      const l = holdLeft(until);
      setLeft(l);
      if (l <= 0) { clearInterval(t); onExpired?.(); }
    }, 1000);
    return () => clearInterval(t);
  }, [until, onExpired]);
  return <span className="font-semibold tabular">{clock(left)}</span>;
}

function copy(text: string) {
  void navigator.clipboard?.writeText(text).then(() => toast.success("Copied"), () => undefined);
}

/**
 * Everything about one stay: status, dates, rooms, the price from price_breakdown, completed payments
 * (refunds as negatives), receipts, the refund for cancelling now, and how to reach the hotel.
 */
export default function StayDetail({ booking: b, actions, banner, guest }: {
  booking: HotelBooking & { guest_name?: string; guest_email?: string };
  /** The buttons for what this guest can do now. */
  actions?: React.ReactNode;
  banner?: React.ReactNode;
  guest?: GuestAccess;
}) {
  const s = statusInfo(b.status);
  const nights = nightsBetween(b.check_in_date, b.check_out_date);
  const payments = completedPayments(b.payments);
  const refund = refundPreview(b.cancellation_policy, b.check_in_date, b.paid_amount);
  const mapUrl = b.hotel_address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.hotel_name}, ${b.hotel_address}, ${b.hotel_city}`)}` : null;
  const upcoming = ["pending", "hold", "confirmed"].includes(b.status);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="relative">
          <Img src={b.hotel_image} alt="" className="h-52 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5">
            <div>
              <Pill tone={s.tone} className="mb-2">{s.label}</Pill>
              <h1 className="text-2xl font-semibold tracking-tight text-white">{b.hotel_name}</h1>
              <p className="flex items-center gap-1 text-sm text-white/80"><Location className="h-4 w-4" />{b.hotel_city}</p>
            </div>
            <button type="button" onClick={() => copy(b.confirmation_code)} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-mono text-sm text-white backdrop-blur hover:bg-white/25" aria-label="Copy confirmation code">
              {b.confirmation_code}<Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-line border-b border-line sm:grid-cols-3">
          <div className="p-4"><p className="text-xs text-muted">Check in</p><p className="mt-0.5 font-semibold text-ink">{formatDate(b.check_in_date, { weekday: "short" })}</p><p className="text-xs text-muted">from {b.check_in_time?.slice(0, 5)}</p></div>
          <div className="p-4"><p className="text-xs text-muted">Check out</p><p className="mt-0.5 font-semibold text-ink">{formatDate(b.check_out_date, { weekday: "short" })}</p><p className="text-xs text-muted">by {b.check_out_time?.slice(0, 5)}</p></div>
          <div className="col-span-2 border-t border-line p-4 sm:col-span-1 sm:border-t-0"><p className="text-xs text-muted">Stay</p><p className="mt-0.5 font-semibold text-ink">{nights} night{nights === 1 ? "" : "s"} · {b.num_guests} guest{b.num_guests === 1 ? "" : "s"}</p>
            <p className="text-xs text-muted">{b.rooms.length} room{b.rooms.length === 1 ? "" : "s"}</p></div>
        </div>
        {actions && <div className="flex flex-wrap gap-2 p-4">{actions}</div>}
      </div>

      {banner}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <Panel title="Rooms" icon={Calendar}>
            <ul className="divide-y divide-line">
              {b.rooms.map(r => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div><p className="text-sm font-medium text-ink">{humanize(r.room_type)}</p><p className="text-xs text-muted">{roomNumber(r.room_number)}{r.discount_titles && ` · ${r.discount_titles}`}</p></div>
                  <p className="text-right text-sm tabular"><span className="font-semibold text-ink">{money(r.price_per_night, b.currency)}</span><span className="text-xs text-muted"> /night × {r.num_nights}</span></p>
                </li>
              ))}
            </ul>
            {(b.special_requests || b.guest_notes || b.guest_name) && (
              <div className="mt-4 border-t border-line pt-4">
                <DetailList items={[
                  { label: "Guest", value: b.guest_name ? `${b.guest_name}${b.guest_email ? ` · ${b.guest_email}` : ""}` : null, hidden: !b.guest_name },
                  { label: "Your requests", value: b.special_requests, hidden: !b.special_requests },
                  { label: "Notes", value: b.guest_notes, hidden: !b.guest_notes },
                ]} />
              </div>
            )}
          </Panel>

          <Panel title="Payments" icon={Wallet} description={b.pay_at_hotel ? "Pay at the hotel: the rest is settled at the property." : undefined}>
            {payments.length === 0 ? <p className="text-sm text-muted">No payments yet.</p> : (
              <ul className="divide-y divide-line">
                {payments.map(p => {
                  const refundRow = toNumber(p.amount) < 0;
                  return (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0 text-sm">
                      <span><span className="font-medium text-ink">{refundRow ? "Refund" : humanize(p.payment_method === "cash" ? "At the hotel" : p.payment_method === "online" ? "Paid online" : p.payment_method)}</span>
                        <span className="block text-xs text-muted">{formatDateTime(p.created_at)}</span></span>
                      <span className={`font-semibold tabular ${refundRow ? "text-success" : "text-ink"}`}>{money(p.amount, b.currency)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel title="Receipts" icon={Receipt}><ReceiptList receipts={b.receipts} guest={guest} /></Panel>
        </div>

        <aside className="space-y-6">
          <Panel title="Price"><BreakdownSummary breakdown={b.price_breakdown} currency={b.currency} services={b.services} /></Panel>
          {b.cancellation_policy && (
            <Panel title={`${b.cancellation_policy.label} cancellation`} icon={ShieldCheck}>
              <ul className="space-y-1.5 text-sm text-ink-2">
                {[...b.cancellation_policy.refund_schedule].sort((x, y) => y.min_days_before_check_in - x.min_days_before_check_in).map(r => (
                  <li key={r.min_days_before_check_in} className="flex justify-between gap-3"><span>{r.min_days_before_check_in}+ days before check-in</span><span className="font-medium tabular">{toNumber(r.refund_percent)}%</span></li>
                ))}
                {!b.cancellation_policy.refund_schedule.length && <li>No refunds.</li>}
              </ul>
              {upcoming && toNumber(b.paid_amount) > 0 && (
                <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-xs text-muted">Cancelling today refunds <span className="font-semibold text-ink">{refund.percent}%</span> of what you paid: {money(refund.amount, b.currency)}.</p>
              )}
            </Panel>
          )}
          <Panel title="The hotel">
            <ul className="space-y-2.5 text-sm">
              {b.hotel_address && <li className="flex gap-2 text-ink-2"><Location className="mt-0.5 h-4 w-4 shrink-0 text-muted" />{b.hotel_address}</li>}
              {b.hotel_phone && <li><a href={`tel:${b.hotel_phone}`} className="flex gap-2 text-primary hover:underline"><Call className="h-4 w-4" />{b.hotel_phone}</a></li>}
              {b.hotel_email && <li><a href={`mailto:${b.hotel_email}`} className="flex gap-2 text-primary hover:underline"><Mail className="h-4 w-4" />{b.hotel_email}</a></li>}
              {mapUrl && <li><a href={mapUrl} target="_blank" rel="noreferrer" className="flex gap-2 text-primary hover:underline"><Map className="h-4 w-4" />Directions</a></li>}
              <li className="flex gap-2 text-muted"><Clock className="h-4 w-4" />Booked {formatDateTime(b.created_at)}</li>
            </ul>
            <Button variant="outline" size="sm" className="mt-4" href={`/hotels/${b.hotel}`}>View hotel</Button>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

/** "Pay within 29:41 to keep these rooms" for a pending booking. */
export function PayBanner({ booking, onPay, busy, onExpired }: { booking: HotelBooking; onPay: () => void; busy?: boolean; onExpired?: () => void }) {
  return (
    <Callout tone="warning" icon={Clock} title="Pay to confirm your booking"
      action={<Button loading={busy} onClick={onPay}>Pay {money(booking.price_breakdown.balance_due ?? booking.balance_due, booking.currency)}</Button>}>
      Your rooms are held for <HoldCountdown until={booking.hold_expires_at} onExpired={onExpired} />. After that the booking is cancelled and the rooms released.
    </Callout>
  );
}
