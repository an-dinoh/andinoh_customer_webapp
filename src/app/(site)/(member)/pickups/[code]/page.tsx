"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { pickupsApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { Button, Callout, ConfirmDialog, DetailList, ErrorState, Modal, PageHeader, Panel, RatingInput, Skeleton, StatusPill, Stepper, Textarea } from "@/components/ui";
import { Call, Car, CheckCircle, CloseCircle, Coin, Edit, Star } from "@/components/icons";
import { formatDate, formatDateTime, money, toNumber } from "@/utils/format";
import { startPayment } from "@/utils/payments";

const STEPS = ["PENDING", "CONFIRMED", "DRIVER_ASSIGNED", "EN_ROUTE", "ARRIVED", "PICKED_UP", "COMPLETED"];
const LABELS: Record<string, string> = { PENDING: "Requested", CONFIRMED: "Confirmed", DRIVER_ASSIGNED: "Driver assigned", EN_ROUTE: "On the way", ARRIVED: "Arrived", PICKED_UP: "Picked up", COMPLETED: "Completed" };

/** The cancellation fee by time to pickup (guide 10.3). */
function cancelFee(date: string, time: string): number {
  const hours = (Date.parse(`${date}T${time.length === 5 ? `${time}:00` : time}`) - Date.now()) / 3_600_000;
  return hours >= 24 ? 0 : hours >= 6 ? 25 : hours >= 2 ? 50 : 75;
}

export default function PickupPage() {
  const { code } = useParams<{ code: string }>();
  const pickup = useQuery(() => pickupsApi.get(code), [code]);
  const [cancelling, setCancelling] = useState(false);
  const [editing, setEditing] = useState<{ passenger_count: number; luggage_count: number; special_requirements: string } | null>(null);
  const [rating, setRating] = useState<{ stars: number; text: string } | null>(null);
  const pay = useMutation(() => startPayment({ kind: "pickup", ref: code, back: `/pickups/${code}`, label: "your pickup" }), { onSuccess: r => { if (r === "already_paid") void pickup.reload(); } });
  const cancel = useMutation((reason: string) => pickupsApi.cancel(code, reason || "No longer needed"), { success: "Pickup cancelled", onSuccess: r => { setCancelling(false); pickup.setData(r.pickup_request); } });
  const update = useMutation(() => pickupsApi.update(code, editing!), { success: "Pickup updated", onSuccess: r => { setEditing(null); pickup.setData(r.pickup_request); } });
  const rate = useMutation(() => pickupsApi.rate(code, rating!.stars, rating!.text.trim() || undefined), { success: "Thanks for rating your ride", onSuccess: () => { setRating(null); void pickup.reload(); } });

  if (pickup.error) return <Container narrow><ErrorState error={pickup.error} onRetry={pickup.reload} /></Container>;
  const p = pickup.data;
  if (!p) return <Container narrow><Skeleton className="h-60 w-full rounded-2xl" /></Container>;
  const step = STEPS.indexOf(p.status);
  const ended = ["CANCELLED", "NO_SHOW", "COMPLETED"].includes(p.status);
  const unpaid = ["unpaid", "pending"].includes(p.payment_status) && !ended;
  const editable = ["PENDING", "CONFIRMED"].includes(p.status);
  const fee = cancelFee(p.pickup_date, p.pickup_time);

  return (
    <Container narrow>
      <PageHeader crumbs={[{ label: "Pickups", href: "/pickups" }, { label: p.confirmation_code }]} title={`${p.pickup_location_name || p.custom_pickup_address} → ${p.destination_address}`}
        meta={<><StatusPill status={p.status} label={p.status_display} /><StatusPill status={p.payment_status} /></>}
        actions={<>
          {unpaid && <Button icon={Coin} loading={pay.busy} onClick={() => pay.run()}>Pay {money(p.total_fare, p.currency)}</Button>}
          {editable && <Button variant="outline" icon={Edit} onClick={() => setEditing({ passenger_count: p.passenger_count, luggage_count: p.luggage_count, special_requirements: p.special_requirements })}>Edit</Button>}
          {p.status === "COMPLETED" && !p.customer_rating && <Button icon={Star} onClick={() => setRating({ stars: 0, text: "" })}>Rate your ride</Button>}
          {!ended && <Button variant="danger-ghost" icon={CloseCircle} onClick={() => setCancelling(true)}>Cancel</Button>}
        </>} />
      <div className="space-y-6">
        {step >= 0 && (
          <Panel>
            <ol className="flex flex-wrap gap-x-2 gap-y-3">
              {STEPS.map((s, i) => (
                <li key={s} className="flex items-center gap-2 text-xs">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full ${i < step ? "bg-success-50 text-success" : i === step ? "bg-primary text-white ring-4 ring-primary/20" : "bg-surface-2 text-subtle"}`}>
                    {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className={i === step ? "font-semibold text-ink" : "text-muted"}>{LABELS[s]}</span>
                  {i < STEPS.length - 1 && <span className={`hidden h-px w-6 sm:block ${i < step ? "bg-success" : "bg-line"}`} />}
                </li>
              ))}
            </ol>
          </Panel>
        )}
        {p.driver_name && (
          <Callout tone="info" icon={Car} title={`${p.driver_name} is your driver`} action={p.driver_phone ? <Button size="sm" variant="outline" icon={Call} href={`tel:${p.driver_phone}`}>Call</Button> : undefined}>
            {[p.vehicle_details, p.license_plate].filter(Boolean).join(" · ")}
          </Callout>
        )}
        {p.status === "CANCELLED" && <Callout tone="warning" title="Cancelled">{p.cancellation_reason}{toNumber(p.cancellation_fee) > 0 ? ` A ${money(p.cancellation_fee)} fee applied.` : ""}{toNumber(p.refunded_amount) > 0 ? ` ${money(p.refunded_amount)} refunded.` : p.payment_status === "refund_pending" ? " Your refund is on its way." : ""}</Callout>}
        <Panel title="Ride">
          <DetailList items={[
            { label: "Pickup", value: `${formatDate(p.pickup_date)}, ${p.pickup_time.slice(0, 5)}` },
            { label: "Car", value: p.vehicle_type_display },
            { label: "Passengers", value: p.passenger_count },
            { label: "Bags", value: p.luggage_count },
            { label: "Flight", value: [p.airline, p.flight_number].filter(Boolean).join(" ") || "—" },
            { label: "About", value: p.estimated_duration ? `${p.estimated_duration} min` : "—" },
            { label: "Requests", value: p.special_requirements || "—" },
            { label: "Booked", value: formatDateTime(p.created_at) },
          ]} />
        </Panel>
        <Panel title="Fare">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-ink-2">Base fare</dt><dd className="tabular">{money(p.base_fare, p.currency)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-2">Extras</dt><dd className="tabular">{money(p.additional_charges, p.currency)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 font-semibold text-ink"><dt>Total</dt><dd className="tabular">{money(p.total_fare, p.currency)}</dd></div>
            <div className="flex justify-between text-muted"><dt>Paid</dt><dd className="tabular">{money(p.amount_paid, p.currency)}{p.paid_at ? ` · ${formatDate(p.paid_at)}` : ""}</dd></div>
          </dl>
        </Panel>
        {p.customer_rating && <Callout tone="success" icon={Star}>You rated this ride {p.customer_rating}/5.</Callout>}
      </div>
      <ConfirmDialog open={cancelling} onClose={() => setCancelling(false)} title="Cancel this pickup?" confirmLabel="Cancel pickup" busy={cancel.busy}
        description={fee ? `It’s less than ${fee === 25 ? "24" : fee === 50 ? "6" : "2"} hours away, so a ${fee}% fee applies. The rest of what you paid is refunded.` : "It’s more than 24 hours away, so there’s no fee. Anything paid is refunded."}
        ask={{ kind: "reason", label: "Why are you cancelling?", required: true }} onConfirm={reason => cancel.run(reason)} />
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit pickup" size="sm"
        footer={<><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button loading={update.busy} onClick={() => update.run()}>Save</Button></>}>
        {editing && (
          <div className="space-y-2">
            <Stepper label="Passengers" value={editing.passenger_count} min={1} max={20} onChange={n => setEditing(x => x && ({ ...x, passenger_count: n }))} />
            <Stepper label="Bags" value={editing.luggage_count} max={20} onChange={n => setEditing(x => x && ({ ...x, luggage_count: n }))} />
            <Textarea label="Special requirements" rows={2} value={editing.special_requirements} onChange={e => setEditing(x => x && ({ ...x, special_requirements: e.target.value }))} />
          </div>
        )}
      </Modal>
      <Modal open={!!rating} onClose={() => setRating(null)} title="Rate your ride" size="sm"
        footer={<><Button variant="outline" onClick={() => setRating(null)}>Cancel</Button><Button loading={rate.busy} disabled={!rating?.stars} onClick={() => rate.run()}>Send</Button></>}>
        {rating && <div className="space-y-4"><RatingInput value={rating.stars} onChange={stars => setRating(r => r && ({ ...r, stars }))} /><Textarea label="Comments (optional)" rows={2} value={rating.text} onChange={e => setRating(r => r && ({ ...r, text: e.target.value }))} /></div>}
      </Modal>
    </Container>
  );
}
