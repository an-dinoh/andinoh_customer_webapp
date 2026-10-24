"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { bookingsApi, guestBookingsApi, hotelsApi } from "@/services/api";
import { useDebounced, useMutation, useQuery } from "@/hooks/useApi";
import { QuoteSummary } from "@/components/bookings/PriceSummary";
import { Container } from "@/components/shell/SiteShell";
import {
  Button, Callout, Checkbox, ErrorState, FormGrid, Img, Input, Panel, Segmented, Skeleton, Spinnerish, Stepper, Textarea, Toggle,
} from "@/components/ui";
import { Calendar, Gift, Lock, ShieldCheck, Sms, User, Wallet } from "@/components/icons";
import { ApiError, errorMessage } from "@/utils/api";
import { formatDate, money, toNumber } from "@/utils/format";
import { LIMITS, datesProblem, guestsLabel, planQuery, readPlan, stayRequest } from "@/utils/stay";
import { POLICY_RULES } from "@/utils/bookings";
import { guestBookings } from "@/utils/guestBookings";
import { startPayment } from "@/utils/payments";
import type { HotelBooking, StayPaymentMethod } from "@/types/api";

type Who = "me" | "friend";

function Checkout() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, profile, user } = useAuth();
  const plan = readPlan(params);
  const dateProblem = datesProblem(plan.checkIn, plan.checkOut);

  const hotel = useQuery(() => hotelsApi.get(hotelId), [hotelId]);
  const rooms = useQuery(() => hotelsApi.rooms(hotelId, { check_in_date: plan.checkIn, check_out_date: plan.checkOut, page_size: 50 }), [hotelId, plan.checkIn, plan.checkOut]);
  const services = useQuery(() => hotelsApi.services(hotelId), [hotelId]);

  const [addOns, setAddOns] = useState<Record<string, number>>({});
  const [method, setMethod] = useState<StayPaymentMethod>("online");
  const [usePoints, setUsePoints] = useState(false);
  const [points, setPoints] = useState("");
  const [who, setWho] = useState<Who>("me");
  const [guest, setGuest] = useState({ guest_name: "", guest_email: "", guest_phone: "" });
  const [extras, setExtras] = useState({ special_requests: "", early_check_in_requested: false, late_check_out_requested: false });
  const [agreed, setAgreed] = useState(false);

  const available = profile?.available_points ?? 0;
  const pointsToUse = isAuthenticated && usePoints ? Math.min(available, Math.max(0, Math.floor(Number(points) || 0))) : 0;
  const body = {
    ...stayRequest(hotelId, plan),
    services: Object.entries(addOns).filter(([, n]) => n > 0).map(([offering_id, quantity]) => ({ offering_id, quantity })),
    payment_method: method,
    ...(pointsToUse ? { points_to_use: pointsToUse } : {}),
  };
  const debounced = useDebounced(JSON.stringify(body), 350);
  const quote = useQuery(() => bookingsApi.quote(JSON.parse(debounced)), [debounced], { enabled: !dateProblem && body.rooms.length > 0 });

  const h = hotel.data;
  const asGuest = !isAuthenticated;
  const needsGuestDetails = asGuest || who === "friend";

  const book = useMutation(async () => {
    const request = { ...body, ...(extras.special_requests.trim() ? { special_requests: extras.special_requests.trim() } : {}),
      ...(extras.early_check_in_requested ? { early_check_in_requested: true } : {}), ...(extras.late_check_out_requested ? { late_check_out_requested: true } : {}) };
    const details = { guest_name: guest.guest_name.trim(), guest_email: guest.guest_email.trim(), ...(guest.guest_phone.trim() ? { guest_phone: guest.guest_phone.trim() } : {}) };
    if (asGuest) {
      const { points_to_use: _drop, ...noPoints } = request as typeof request & { points_to_use?: number };
      const created = await guestBookingsApi.create({ ...noPoints, ...details });
      const b = created.booking;
      guestBookings.save({ confirmation_code: b.confirmation_code, access_token: created.access_token, hotel_name: b.hotel_name,
        check_in_date: b.check_in_date, check_out_date: b.check_out_date, guest_name: b.guest_name, guest_email: b.guest_email });
      if (!created.payment_required || b.status === "confirmed") { router.push(`/bookings/manage?code=${b.confirmation_code}&booked=1`); return; }
      const r = await startPayment({ kind: "guest", ref: b.confirmation_code, back: `/bookings/manage?code=${b.confirmation_code}`, label: b.hotel_name });
      if (r === "already_paid") router.push(`/bookings/manage?code=${b.confirmation_code}&booked=1`);
      return;
    }
    let booking: HotelBooking;
    if (who === "friend") booking = (await bookingsApi.bookForFriend({ ...request, ...details })).booking;
    else booking = await bookingsApi.create(request);
    if (booking.status === "confirmed") { router.push(`/trips/${booking.id}?booked=1`); return; }
    const r = await startPayment({ kind: "booking", ref: booking.id, back: `/trips/${booking.id}`, label: booking.hotel_name });
    if (r === "already_paid") router.push(`/trips/${booking.id}?booked=1`);
  }, { silentError: true });

  const err = book.error;
  const fieldErr = (k: string) => book.fieldErrors[k];
  const notVerified = err instanceof ApiError && err.code === "email_not_verified";

  if (hotel.error) return <Container><div className="rounded-2xl border border-line bg-surface"><ErrorState error={hotel.error} onRetry={hotel.reload} /></div></Container>;
  if (!h || authLoading) return <Container className="space-y-4"><Skeleton className="h-8 w-60" /><Skeleton className="h-64 w-full rounded-2xl" /></Container>;

  const picked = (rooms.data?.results ?? h.rooms).filter(r => plan.rooms[r.id]);
  const back = `/hotels/${hotelId}?${planQuery(plan)}`;
  if (!body.rooms.length || dateProblem) {
    return (
      <Container narrow>
        <Callout tone="warning" title={dateProblem ?? "Choose a room first"} action={<Button size="sm" href={back}>Back to {h.name}</Button>}>
          Pick your dates and rooms on the hotel page, then come back here to book.
        </Callout>
      </Container>
    );
  }

  const canSubmit = quote.data && !quote.error && (!needsGuestDetails || (guest.guest_name.trim() && guest.guest_email.trim())) && agreed;
  const payNow = quote.data ? toNumber(quote.data.due_online_now) : 0;

  return (
    <Container>
      <nav className="mb-3 text-xs text-muted"><Link href={back} className="hover:text-primary">← Back to {h.name}</Link></nav>
      <h1 className="text-[22px] font-semibold tracking-tight text-ink sm:text-2xl">Confirm and pay</h1>
      <p className="mt-1 text-sm text-muted">Rooms are held for 30 minutes while you pay.</p>

      <form className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]" onSubmit={e => { e.preventDefault(); if (canSubmit) void book.run(); }}>
        <div className="min-w-0 space-y-6">
          {asGuest && (
            <Callout tone="info" title="Booking without an account" icon={User}
              action={<Button size="sm" variant="outline" href={`/login?from=${encodeURIComponent(`${pathname}?${params}`)}`}>Sign in</Button>}>
              We’ll email your booking link. Sign in to earn points, chat with the hotel and manage everything in one place.
            </Callout>
          )}

          {!asGuest && (
            <Panel title="Who’s staying?">
              <Segmented value={who} onChange={setWho} options={[{ value: "me", label: "I am" }, { value: "friend", label: "Someone else" }]} />
              {who === "friend" && <p className="mt-3 text-sm text-muted">The booking stays in your account; we’ll send the confirmation to your guest.</p>}
            </Panel>
          )}

          {needsGuestDetails && (
            <Panel title={asGuest ? "Your details" : "Guest details"} icon={User}>
              <FormGrid>
                <Input label="Full name" required value={guest.guest_name} onChange={e => setGuest(g => ({ ...g, guest_name: e.target.value }))} error={fieldErr("guest_name")} autoComplete={asGuest ? "name" : "off"} />
                <Input label="Email" type="email" required value={guest.guest_email} onChange={e => setGuest(g => ({ ...g, guest_email: e.target.value }))} error={fieldErr("guest_email")} hint="The booking and its link go here." autoComplete={asGuest ? "email" : "off"} />
                <Input label="Phone" type="tel" value={guest.guest_phone} onChange={e => setGuest(g => ({ ...g, guest_phone: e.target.value }))} error={fieldErr("guest_phone")} placeholder="+234…" autoComplete={asGuest ? "tel" : "off"} />
              </FormGrid>
            </Panel>
          )}

          {(services.data ?? []).filter(s => s.is_active).length > 0 && (
            <Panel title="Add to your stay" description="Optional extras the hotel offers.">
              <div className="divide-y divide-line">
                {services.data!.filter(s => s.is_active).map(s => (
                  <Stepper key={s.id} label={s.name} description={<><span className="font-medium text-ink-2 tabular">{money(s.price, "NGN", { decimals: false })}</span>{s.description ? ` · ${s.description}` : ""}</>}
                    value={addOns[s.id] ?? 0} max={LIMITS.service} onChange={n => setAddOns(a => ({ ...a, [s.id]: n }))} />
                ))}
              </div>
            </Panel>
          )}

          <Panel title="Requests" description="The hotel will do its best; requests aren’t guaranteed.">
            <Textarea label="Anything the hotel should know?" maxLength={1000} value={extras.special_requests} onChange={e => setExtras(x => ({ ...x, special_requests: e.target.value }))}
              placeholder="A high floor, a cot for the baby, arriving late…" error={fieldErr("special_requests")} />
            <div className="mt-3 space-y-1">
              <Toggle label="Early check-in" checked={extras.early_check_in_requested} onChange={v => setExtras(x => ({ ...x, early_check_in_requested: v }))} />
              <Toggle label="Late check-out" checked={extras.late_check_out_requested} onChange={v => setExtras(x => ({ ...x, late_check_out_requested: v }))} />
            </div>
          </Panel>

          <Panel title="How do you want to pay?" icon={Wallet}>
            {h.allows_pay_at_hotel ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {([["online", "Pay now", "Card, bank transfer or USSD"], ["cash", "Pay at the hotel", `${toNumber(h.deposit_required_pct) ? `A ${toNumber(h.deposit_required_pct)}% deposit` : "The service fee"} now, the rest on arrival`]] as const).map(([v, title, text]) => (
                  <label key={v} className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${method === v ? "border-primary bg-primary-50/50 ring-1 ring-primary/20" : "border-line-strong"}`}>
                    <input type="radio" name="method" className="mt-1 accent-primary" checked={method === v} onChange={() => setMethod(v)} />
                    <span><span className="block text-sm font-semibold text-ink">{title}</span><span className="block text-xs text-muted">{text}</span></span>
                  </label>
                ))}
              </div>
            ) : <p className="text-sm text-ink-2">You’ll pay securely online with Flutterwave: card, bank transfer or USSD.</p>}
            {fieldErr("payment_method") && <p className="mt-2 text-xs text-danger">{fieldErr("payment_method")}</p>}
            {isAuthenticated && available > 0 && (
              <div className="mt-4 rounded-xl border border-line p-4">
                <Toggle label={<span className="inline-flex items-center gap-1.5"><Gift className="h-4 w-4 text-gold-text" />Use loyalty points</span>}
                  description={`You have ${available.toLocaleString()} points. 100 points = ₦1.`} checked={usePoints} onChange={setUsePoints} />
                {usePoints && (
                  <div className="mt-2 flex items-end gap-2">
                    <Input label="Points to use" inputMode="numeric" value={points} onChange={e => setPoints(e.target.value.replace(/\D/g, ""))} className="flex-1"
                      hint={pointsToUse ? `Saves ${money(pointsToUse / 100)}` : undefined} error={fieldErr("points_to_use")} />
                    <Button variant="secondary" onClick={() => setPoints(String(available))}>Use all</Button>
                  </div>
                )}
              </div>
            )}
          </Panel>

          <Panel title="Cancellation" icon={ShieldCheck}>
            <p className="text-sm text-ink-2">{POLICY_RULES[h.cancellation_type] ?? "The hotel’s refund rules apply."} Refunds go back to how you paid.</p>
            <div className="mt-3"><Checkbox checked={agreed} onChange={setAgreed} label={<>I agree to the hotel’s rules and Andinoh’s <Link href="/legal/terms-of-service" target="_blank" className="text-primary underline">terms</Link>.</>} /></div>
          </Panel>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
            <div className="flex gap-3 border-b border-line p-4">
              <Img src={h.primary_image ?? (h.images[0]?.image_url ?? h.images[0]?.image) as string | undefined} alt="" className="h-16 w-20 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{h.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted"><Calendar className="h-3.5 w-3.5" />{formatDate(plan.checkIn, { year: undefined })} – {formatDate(plan.checkOut)}</p>
                <p className="text-xs text-muted">{guestsLabel(plan)}</p>
              </div>
            </div>
            <div className="space-y-1 border-b border-line p-4 text-sm text-ink-2">
              {picked.map(r => <p key={r.id}>{plan.rooms[r.id]} × {r.title}</p>)}
            </div>
            <div className="p-4">
              {quote.error ? <Callout tone="danger">{quote.error.message}</Callout> : quote.data ? <QuoteSummary quote={quote.data} /> : <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-6 w-full" /></div>}
              {err && !notVerified && <div className="mt-4"><Callout tone="danger">{errorMessage(err)}{err.requestId && <span className="mt-1 block text-xs opacity-75">Reference {err.requestId}</span>}</Callout></div>}
              {notVerified && (
                <div className="mt-4"><Callout tone="warning" title="Verify your email first" icon={Sms}
                  action={<Button size="sm" href={`/account/verify-email?from=${encodeURIComponent(`${pathname}?${params}`)}`}>Verify</Button>}>
                  We need to confirm {user?.email} before you book.</Callout></div>
              )}
              {book.error && !err && <p className="mt-2 text-xs text-danger">{errorMessage(book.error)}</p>}
              <Button type="submit" size="lg" fullWidth className="mt-4" icon={Lock} loading={book.busy} disabled={!canSubmit}>
                {quote.data && payNow > 0 ? `Pay ${money(quote.data.due_online_now, quote.data.currency)}` : "Confirm booking"}
              </Button>
              {!agreed && <p className="mt-2 text-center text-xs text-muted">Agree to the cancellation rules to continue.</p>}
              <p className="mt-3 text-center text-[11px] text-subtle">Payments are processed by Flutterwave. Andinoh never sees your card.</p>
            </div>
          </div>
        </aside>
      </form>
    </Container>
  );
}

export default function Page() {
  return <Suspense fallback={<Spinnerish />}><Checkout /></Suspense>;
}
