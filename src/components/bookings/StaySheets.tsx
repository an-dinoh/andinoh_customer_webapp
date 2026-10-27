"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { bookingsApi, chatApi, complaintsApi, reviewsApi, tipsApi, uploadsApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import {
  Button, Callout, Checkbox, FormGrid, Input, Modal, MoneyInput, RatingInput, Select, Sheet, Skeleton, Textarea, Toggle, whenOpen,
} from "@/components/ui";
import { CloseCircle, DocumentUpload, Trash } from "@/components/icons";
import { ApiError, errorMessage } from "@/utils/api";
import { addDays, formatDate, formatTime, money, nightsBetween, toApiAmount, isPositiveAmount } from "@/utils/format";
import { refundPreview } from "@/utils/bookings";
import { openCheckout, paymentReturnUrl } from "@/utils/payments";
import type { ComplaintType, ExtendResult, HotelBooking } from "@/types/api";

interface Props { open: boolean; onClose: () => void; booking: HotelBooking; onDone: () => void }

// ---- cancel (9.3) ------------------------------------------------------------------------------------

function CancelBody({ open, onClose, booking, onDone }: Props) {
  const [reason, setReason] = useState("");
  const refund = refundPreview(booking.cancellation_policy, booking.check_in_date, booking.paid_amount);
  const paid = Number(booking.paid_amount) > 0;
  const cancel = useMutation(() => bookingsApi.cancel(booking.id, reason.trim() || undefined), {
    success: r => ("refund_amount" in r && Number(r.refund_amount) > 0 ? `Booking cancelled. ${money(r.refund_amount, booking.currency)} is on its way back to you.` : "Booking cancelled"),
    onSuccess: () => { onClose(); onDone(); },
  });
  return (
    <Modal open={open} onClose={onClose} size="sm" title="Cancel this booking?"
      footer={<><Button variant="outline" onClick={onClose}>Keep booking</Button><Button variant="danger" icon={CloseCircle} loading={cancel.busy} onClick={() => cancel.run()}>Cancel booking</Button></>}>
      <div className="space-y-4">
        {booking.status === "checked_in" ? (
          <Callout tone="warning">You’ve already checked in, so there’s no refund for cancelling now.</Callout>
        ) : !paid ? (
          <Callout tone="info">Nothing has been paid yet, so cancelling just releases the rooms.</Callout>
        ) : (
          <Callout tone={refund.percent ? "success" : "warning"} title={refund.percent ? `You’ll get ${money(refund.amount, booking.currency)} back` : "No refund at this point"}>
            {booking.cancellation_policy?.label ?? "The hotel’s"} policy: {refund.percent}% of what you paid ({money(booking.paid_amount, booking.currency)}), back to how you paid.
          </Callout>
        )}
        <Textarea label="Reason (optional)" rows={2} value={reason} onChange={e => setReason(e.target.value)} placeholder="Change of plans" />
      </div>
    </Modal>
  );
}
export const CancelDialog = whenOpen(CancelBody);

// ---- extend (9.4) ------------------------------------------------------------------------------------

/**
 * Two steps, like the mobile app: pick the new check-out date, then see what the backend priced the
 * extra nights at before paying. Asking for the price holds the nights for 30 minutes (the backend
 * prices and holds in one call); closing without paying just lets the hold lapse. A pay-at-hotel stay
 * is extended at once, so it's asked about up front and the cost shown afterwards.
 */
function ExtendBody({ open, onClose, booking, onDone }: Props) {
  const [date, setDate] = useState(addDays(booking.check_out_date, 1));
  const [result, setResult] = useState<ExtendResult | null>(null);
  const extra = nightsBetween(booking.check_out_date, date);
  const nights = (n: number) => `${n} extra night${n === 1 ? "" : "s"}`;
  const extend = useMutation(async () => {
    const r = await bookingsApi.extend(booking.id, date, paymentReturnUrl({ kind: "booking", ref: booking.id }));
    setResult(r);
    if (!r.payment_required) onDone();
    return r;
  }, { silentError: true });
  const pay = useMutation(async () => {
    if (!result?.payment) return;
    await openCheckout(result.payment, {
      kind: "booking", ref: booking.id, back: `/trips/${booking.id}`, extension: true,
      label: `${nights(result.additional_nights)} at ${booking.hotel_name}`,
    });
  });
  const conflict = extend.error instanceof ApiError && extend.error.status === 409;
  const cost = result ? money(result.additional_cost, booking.currency) : "";
  const close = () => { onClose(); if (result && !result.payment_required) toast.success(`Stay extended to ${formatDate(result.new_checkout_date)}`); };

  // Extended already (nothing to pay now, or paid at the hotel).
  if (result && !result.payment_required) {
    return (
      <Sheet open={open} onClose={close} title="Your stay is extended" footer={<Button onClick={close}>Done</Button>}>
        <div className="space-y-4">
          <ExtensionSummary from={booking.check_out_date} result={result} currency={booking.currency} />
          <Callout tone="success">{Number(result.additional_cost) > 0 ? `${cost} has been added to your bill, to settle at the hotel.` : "There’s nothing extra to pay."}</Callout>
        </div>
      </Sheet>
    );
  }

  // Priced and held: pay to confirm, or leave it.
  if (result) {
    return (
      <Sheet open={open} onClose={onClose} title="Review your extension" description="Pay to confirm the extra nights."
        footer={<><Button variant="outline" disabled={pay.busy} onClick={() => setResult(null)}>Change date</Button><Button loading={pay.busy} onClick={() => pay.run()}>Pay {cost}</Button></>}>
        <div className="space-y-4">
          <ExtensionSummary from={booking.check_out_date} result={result} currency={booking.currency} />
          <p className="text-sm text-muted">
            Priced like a new booking: that night’s rate, taxes and fee. We’re holding your room until {formatTime(result.hold_expires_at)}; if you don’t pay by then, the nights are released and nothing is charged.
          </p>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onClose={onClose} title="Extend your stay" description={`You’re checking out ${formatDate(booking.check_out_date)}.`}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={extend.busy} disabled={extra < 1} onClick={() => extend.run()}>{booking.pay_at_hotel ? "Extend stay" : "See the price"}</Button></>}>
      <div className="space-y-4">
        <Input label="New check-out date" type="date" value={date} min={addDays(booking.check_out_date, 1)} max={addDays(booking.check_out_date, 30)} onChange={e => setDate(e.target.value)} />
        <p className="text-sm text-muted">
          {extra > 0 ? `${nights(extra)}, ` : ""}priced like a new booking. {booking.pay_at_hotel ? "They’re added to your stay straight away and you settle them at the hotel." : "You’ll see the price before you pay."}
        </p>
        {extend.error && <Callout tone={conflict ? "warning" : "danger"} title={conflict ? "Those nights aren’t free" : undefined}>{conflict ? "Your room isn’t available for those dates. Try fewer nights, or contact the hotel." : errorMessage(extend.error)}</Callout>}
      </div>
    </Sheet>
  );
}

function ExtensionSummary({ from, result, currency }: { from: string; result: ExtendResult; currency: string }) {
  const rows: [string, React.ReactNode][] = [
    ["Check-out", <><span className="text-muted line-through">{formatDate(from)}</span> → {formatDate(result.new_checkout_date)}</>],
    ["Extra nights", result.additional_nights],
  ];
  return (
    <dl className="rounded-2xl border border-line bg-surface-2 p-4 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 py-1.5"><dt className="text-muted">{label}</dt><dd className="text-right text-ink">{value}</dd></div>
      ))}
      <div className="mt-2 flex justify-between gap-4 border-t border-line pt-3 text-base font-semibold text-ink"><dt>Total</dt><dd className="tabular-nums">{money(result.additional_cost, currency)}</dd></div>
    </dl>
  );
}
export const ExtendSheet = whenOpen(ExtendBody);

// ---- tip (10.2) --------------------------------------------------------------------------------------

function TipBody({ open, onClose, booking, onDone }: Props) {
  const staff = useQuery(() => tipsApi.staff(booking.id), [booking.id]);
  const [form, setForm] = useState({ staff_id: "", amount: "", message: "", charge_to_room: false });
  const tip = useMutation(async () => {
    const r = await tipsApi.create({
      booking_id: booking.id, staff_id: form.staff_id, amount: toApiAmount(form.amount), ...(form.message.trim() ? { message: form.message.trim() } : {}),
      ...(form.charge_to_room ? { charge_to_room: true } : { redirect_url: `${window.location.origin}/payments/complete?kind=tip` }),
    });
    if (r.payment) {
      // The return address can't name the tip (it didn't exist yet); the return page reads it from this tab.
      await openCheckout(r.payment, { kind: "tip", ref: r.tip.id, back: `/trips/${booking.id}`, label: `your tip for ${r.tip.staff_name}` });
      return;
    }
    toast.success(r.message ?? "Tip added to your bill");
    onClose();
    onDone();
  });
  const list = staff.data?.staff ?? [];
  return (
    <Sheet open={open} onClose={onClose} title="Thank someone with a tip" description="Tips go to the person you choose."
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={tip.busy} disabled={!form.staff_id || !isPositiveAmount(form.amount)} onClick={() => tip.run()}>{form.charge_to_room ? "Add to my bill" : `Pay ${form.amount ? `₦${form.amount}` : ""}`}</Button></>}>
      {staff.loading ? <Skeleton className="h-24 w-full" /> : list.length === 0 ? <Callout tone="info">The hotel hasn’t listed staff for tips yet.</Callout> : (
        <div className="space-y-4">
          <Select label="Who" placeholder="Choose a person" value={form.staff_id} onChange={e => setForm(f => ({ ...f, staff_id: e.target.value }))}
            options={list.map(s => ({ value: s.id, label: `${s.full_name} · ${s.role || s.department}` }))} error={tip.fieldErrors.staff_id} />
          <div className="flex flex-wrap gap-2">{["1000", "2000", "5000", "10000"].map(a => (
            <button key={a} type="button" onClick={() => setForm(f => ({ ...f, amount: a }))} className={`rounded-full border px-3 py-1.5 text-sm ${toApiAmount(form.amount) === toApiAmount(a) ? "border-primary bg-primary-50 text-primary" : "border-line-strong text-ink-2"}`}>{money(a, "NGN", { decimals: false })}</button>
          ))}</div>
          <MoneyInput label="Amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} error={tip.fieldErrors.amount} />
          <Textarea label="Message (optional)" rows={2} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Thank you for the warm welcome!" />
          <Toggle label="Add to my room bill" description="Settle it with the rest of your bill instead of paying now." checked={form.charge_to_room} onChange={v => setForm(f => ({ ...f, charge_to_room: v }))} />
        </div>
      )}
    </Sheet>
  );
}
export const TipSheet = whenOpen(TipBody);

// ---- start a chat (10.1) -----------------------------------------------------------------------------

function ChatBody({ open, onClose, booking }: Props) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const start = useMutation(() => chatApi.start({ booking_id: booking.id, ...(subject.trim() ? { subject: subject.trim() } : {}), initial_message: message.trim() }), {
    silentError: true, onSuccess: r => router.push(`/inbox/${r.id}`),
  });
  // One active chat per booking: the 400 names the existing one in its field errors.
  const existing = start.error?.fieldErrors.chat_id || undefined;
  return (
    <Modal open={open} onClose={onClose} title={`Message ${booking.hotel_name}`} description="The front desk usually replies within minutes."
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button>{existing
        ? <Button onClick={() => router.push(`/inbox/${existing}`)}>Open the conversation</Button>
        : <Button loading={start.busy} disabled={message.trim().length < 5} onClick={() => start.run()}>Send</Button>}</>}>
      <div className="space-y-4">
        <Input label="Subject (optional)" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Towels, room service, late check-out…" />
        <Textarea label="Message" rows={4} value={message} onChange={e => setMessage(e.target.value)} error={start.fieldErrors.initial_message} hint="At least 5 characters." />
        {start.error && <Callout tone={existing ? "info" : "danger"}>{existing ? "You already have a conversation open for this booking." : start.error.message}</Callout>}
      </div>
    </Modal>
  );
}
export const ChatStartModal = whenOpen(ChatBody);

// ---- complaint (10.4) --------------------------------------------------------------------------------

export const COMPLAINT_TYPES: { value: ComplaintType; label: string }[] = [
  { value: "ROOM", label: "Room problem" }, { value: "CLEANLINESS", label: "Cleanliness" }, { value: "NOISE", label: "Noise" },
  { value: "SERVICE", label: "Service" }, { value: "STAFF", label: "Staff" }, { value: "AMENITIES", label: "Amenities" },
  { value: "BILLING", label: "Billing" }, { value: "REFUND", label: "Refund" }, { value: "BOOKING", label: "Booking" },
  { value: "WEBSITE", label: "Website or app" }, { value: "OTHER", label: "Something else" },
];

function ComplaintBody({ open, onClose, booking, onDone }: { open: boolean; onClose: () => void; booking?: HotelBooking; onDone?: (complaintId: string) => void }) {
  const [form, setForm] = useState({ complaint_type: (booking ? "ROOM" : "OTHER") as ComplaintType, subject: "", description: "", priority: "MEDIUM", incident_date: "", incident_location: "" });
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const upload = useMutation(async (file: File) => {
    const r = await uploadsApi.upload(file, "complaint");
    setFiles(f => [...f, { name: r.name, url: r.url }]);
  });
  const send = useMutation(() => complaintsApi.create({
    ...(booking ? { booking_id: booking.id } : {}), complaint_type: form.complaint_type, subject: form.subject.trim(), description: form.description.trim(),
    priority: form.priority as "MEDIUM", ...(form.incident_date ? { incident_date: form.incident_date } : {}),
    ...(form.incident_location.trim() ? { incident_location: form.incident_location.trim() } : {}), ...(files.length ? { attachments: files.map(f => f.url) } : {}),
  }), { success: "We’ve got it. We’ll keep you posted.", onSuccess: r => { onClose(); onDone?.(r.complaint_id); } });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <Sheet open={open} onClose={onClose} title="Report a problem" description={booking ? `About your stay at ${booking.hotel_name}.` : "Tell us what went wrong."}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={send.busy} disabled={!form.subject.trim() || !form.description.trim()} onClick={() => send.run()}>Send</Button></>}>
      <div className="space-y-4">
        <FormGrid>
          <Select label="What’s it about?" value={form.complaint_type} onChange={set("complaint_type")} options={COMPLAINT_TYPES} />
          <Select label="How urgent?" value={form.priority} onChange={set("priority")} options={[{ value: "LOW", label: "Not urgent" }, { value: "MEDIUM", label: "Soon" }, { value: "HIGH", label: "Urgent" }, { value: "URGENT", label: "Right now" }]} />
        </FormGrid>
        <Input label="Subject" required value={form.subject} onChange={set("subject")} error={send.fieldErrors.subject} placeholder="Air conditioning not cooling" />
        <Textarea label="What happened?" required rows={4} value={form.description} onChange={set("description")} error={send.fieldErrors.description} />
        <FormGrid>
          <Input label="When (optional)" type="date" value={form.incident_date} onChange={set("incident_date")} />
          <Input label="Where (optional)" value={form.incident_location} onChange={set("incident_location")} placeholder="Room 102" />
        </FormGrid>
        <div>
          <p className="text-[13px] font-medium text-ink-2">Photos or files (optional)</p>
          <ul className="mt-2 space-y-1">{files.map(f => (
            <li key={f.url} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-1.5 text-sm text-ink-2">{f.name}
              <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles(x => x.filter(y => y.url !== f.url))} className="text-subtle hover:text-danger"><Trash className="h-4 w-4" /></button></li>
          ))}</ul>
          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line-strong px-3 py-2 text-sm text-ink-2 hover:bg-surface-2">
            <DocumentUpload className="h-4 w-4" />{upload.busy ? "Uploading…" : "Add a file"}
            <input type="file" className="sr-only" accept="image/*,application/pdf" onChange={e => { const f = e.target.files?.[0]; if (f) void upload.run(f); e.target.value = ""; }} />
          </label>
        </div>
      </div>
    </Sheet>
  );
}
export const ComplaintSheet = whenOpen(ComplaintBody);

// ---- review (11.1) -----------------------------------------------------------------------------------

// Free text on the server; these are the mobile app's choices (andinoh_mobile review_draft.dart), so both apps send the same words.
const TRIP_TYPES = ["leisure", "business", "family", "romantic"];
const COMPANIONS = ["solo", "partner", "family", "friends", "colleagues"];

function ReviewBody({ open, onClose, booking, onDone }: Props) {
  const [r, setR] = useState({ overall_rating: 0, cleanliness_rating: 0, service_rating: 0, location_rating: 0, value_rating: 0, amenities_rating: 0 });
  const [form, setForm] = useState({ title: "", review_text: "", pros: "", cons: "", trip_type: "leisure", traveled_with: "", is_anonymous: false });
  const [photos, setPhotos] = useState<File[]>([]);
  const send = useMutation(async () => {
    const ratings = Object.fromEntries(Object.entries(r).filter(([, v]) => v > 0));
    const review = await reviewsApi.create({
      booking_id: booking.id, ...ratings, overall_rating: r.overall_rating, title: form.title.trim(), review_text: form.review_text.trim(),
      ...Object.fromEntries(Object.entries({ pros: form.pros, cons: form.cons, trip_type: form.trip_type, traveled_with: form.traveled_with }).filter(([, v]) => v.trim())),
      ...(form.is_anonymous ? { is_anonymous: true } : {}),
    });
    if (photos.length) await reviewsApi.addImages(review.id, photos).catch(e => toast.error(`Review saved, but the photos didn’t upload: ${errorMessage(e)}`));
    return review;
  }, { success: rv => `Thanks for your review! You earned ${rv.points_awarded || 50} points.`, onSuccess: () => { onClose(); onDone(); } });
  const short = form.review_text.trim().length < 10;
  return (
    <Sheet open={open} onClose={onClose} title={`Review ${booking.hotel_name}`} description="Your review helps other travellers and the hotel. It goes live straight away." width="lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={send.busy} disabled={!r.overall_rating || short || !form.title.trim()} onClick={() => send.run()}>Post review</Button></>}>
      <div className="space-y-5">
        <div className="rounded-2xl border border-line p-4">
          <RatingInput label="Overall" value={r.overall_rating} onChange={v => setR(x => ({ ...x, overall_rating: v }))} />
          <div className="mt-3 space-y-2 border-t border-line pt-3">
            {(["cleanliness", "service", "location", "value", "amenities"] as const).map(k => (
              <RatingInput key={k} size="sm" label={k[0].toUpperCase() + k.slice(1)} value={r[`${k}_rating`]} onChange={v => setR(x => ({ ...x, [`${k}_rating`]: v }))} />
            ))}
          </div>
        </div>
        <Input label="Title" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Lovely stay" error={send.fieldErrors.title} />
        <Textarea label="Your review" required rows={5} value={form.review_text} onChange={e => setForm(f => ({ ...f, review_text: e.target.value }))} error={send.fieldErrors.review_text}
          hint={`${form.review_text.trim().length} characters · at least 10; over 200 earns 25 extra points.`} />
        <FormGrid>
          <Input label="What you liked" value={form.pros} onChange={e => setForm(f => ({ ...f, pros: e.target.value }))} />
          <Input label="What could be better" value={form.cons} onChange={e => setForm(f => ({ ...f, cons: e.target.value }))} />
          <Select label="Trip" value={form.trip_type} onChange={e => setForm(f => ({ ...f, trip_type: e.target.value }))} options={TRIP_TYPES.map(v => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))} />
          <Select label="Travelled with" placeholder="—" value={form.traveled_with} onChange={e => setForm(f => ({ ...f, traveled_with: e.target.value }))} options={COMPANIONS.map(v => ({ value: v, label: v === "solo" ? "On my own" : v[0].toUpperCase() + v.slice(1) }))} />
        </FormGrid>
        <div>
          <p className="text-[13px] font-medium text-ink-2">Photos (optional, +20 points)</p>
          <input type="file" accept="image/*" multiple className="mt-2 block text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary"
            onChange={e => setPhotos(Array.from(e.target.files ?? []).slice(0, 10))} />
        </div>
        <Checkbox checked={form.is_anonymous} onChange={v => setForm(f => ({ ...f, is_anonymous: v }))} label="Post as “Anonymous”" />
      </div>
    </Sheet>
  );
}
export const ReviewSheet = whenOpen(ReviewBody);
