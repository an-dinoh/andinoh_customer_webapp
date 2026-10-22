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
import { addDays, formatDate, money, nightsBetween, toApiAmount, isPositiveAmount } from "@/utils/format";
import { refundPreview } from "@/utils/bookings";
import { openCheckout } from "@/utils/payments";
import type { ComplaintType, HotelBooking } from "@/types/api";

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

function ExtendBody({ open, onClose, booking, onDone }: Props) {
  const [date, setDate] = useState(addDays(booking.check_out_date, 1));
  const extra = nightsBetween(booking.check_out_date, date);
  const extend = useMutation(async () => {
    const r = await bookingsApi.extend(booking.id, date, `${window.location.origin}/payments/complete?kind=booking&ref=${booking.id}`);
    if (r.payment_required && r.payment) {
      await openCheckout(r.payment, { kind: "booking", ref: booking.id, back: `/trips/${booking.id}`, label: booking.hotel_name });
      return;
    }
    toast.success(`Stay extended to ${formatDate(r.new_checkout_date)}`);
    onClose();
    onDone();
  }, { silentError: true });
  const conflict = extend.error instanceof ApiError && extend.error.status === 409;
  return (
    <Sheet open={open} onClose={onClose} title="Extend your stay" description={`Currently checking out ${formatDate(booking.check_out_date)}.`}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={extend.busy} disabled={extra < 1} onClick={() => extend.run()}>Continue</Button></>}>
      <div className="space-y-4">
        <Input label="New check-out date" type="date" value={date} min={addDays(booking.check_out_date, 1)} max={addDays(booking.check_out_date, 30)} onChange={e => setDate(e.target.value)} />
        <p className="text-sm text-muted">{extra} extra night{extra === 1 ? "" : "s"}, priced like a new booking (that night’s rate, taxes and fee). {booking.pay_at_hotel ? "You’ll settle it at the hotel." : "You’ll pay to confirm them; unpaid extensions lapse after 30 minutes."}</p>
        {extend.error && <Callout tone={conflict ? "warning" : "danger"} title={conflict ? "Those nights aren’t free" : undefined}>{conflict ? "Your room isn’t available for those dates. Try fewer nights, or contact the hotel." : errorMessage(extend.error)}</Callout>}
      </div>
    </Sheet>
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
  { value: "PICKUP", label: "Pickup" }, { value: "WEBSITE", label: "Website or app" }, { value: "OTHER", label: "Something else" },
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
          <Select label="Trip" value={form.trip_type} onChange={e => setForm(f => ({ ...f, trip_type: e.target.value }))} options={[{ value: "leisure", label: "Leisure" }, { value: "business", label: "Business" }, { value: "family", label: "Family" }, { value: "romantic", label: "Romantic" }, { value: "solo", label: "Solo" }]} />
          <Select label="Travelled with" placeholder="—" value={form.traveled_with} onChange={e => setForm(f => ({ ...f, traveled_with: e.target.value }))} options={[{ value: "partner", label: "Partner" }, { value: "family", label: "Family" }, { value: "friends", label: "Friends" }, { value: "colleagues", label: "Colleagues" }, { value: "alone", label: "Alone" }]} />
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
