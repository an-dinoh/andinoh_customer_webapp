"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { bookingsApi, pickupsApi } from "@/services/api";
import { useDebounced, useMutation, useQuery } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { Button, Callout, FormGrid, Input, PageHeader, Panel, Segmented, Select, Skeleton, Stepper, Textarea } from "@/components/ui";
import { Airplane, Car, Location } from "@/components/icons";
import { money, todayISO } from "@/utils/format";
import { isHotel } from "@/utils/bookings";
import { startPayment } from "@/utils/payments";
import type { HotelBooking, PickupInput, VehicleType } from "@/types/api";

const VEHICLES: { value: VehicleType; label: string; seats: string }[] = [
  { value: "SEDAN", label: "Sedan", seats: "Up to 3 people" }, { value: "SUV", label: "SUV", seats: "Up to 5, more bags" },
  { value: "VAN", label: "Van", seats: "Up to 7" }, { value: "BUS", label: "Bus", seats: "Groups" }, { value: "LUXURY", label: "Luxury", seats: "Executive car" },
];

/** Book a ride (guide 10.3): the estimate is the exact price of creating it with the same details. */
export default function NewPickupPage() {
  const params = useSearchParams();
  const bookingId = params.get("booking") ?? undefined;
  const booking = useQuery(() => bookingsApi.get(bookingId!), [bookingId], { enabled: !!bookingId });
  if (bookingId && booking.loading) return <Container><Skeleton className="h-80 w-full rounded-2xl" /></Container>;
  // A ride for a stay starts with the hotel as the destination, on the check-in day.
  const b = booking.data && isHotel(booking.data) ? booking.data : null;
  return <PickupForm bookingId={b ? bookingId : undefined} booking={b} />;
}

function PickupForm({ bookingId, booking: b }: { bookingId?: string; booking: HotelBooking | null }) {
  const router = useRouter();
  const locations = useQuery(() => pickupsApi.locations({ page_size: 100 }), []);
  const [from, setFrom] = useState<"location" | "custom">("location");
  const [form, setForm] = useState({
    pickup_location_id: "", custom_pickup_address: "", destination_address: b ? `${b.hotel_name}, ${b.hotel_address}` : "",
    pickup_date: b && b.check_in_date >= todayISO() ? b.check_in_date : todayISO(1), pickup_time: "12:00",
    passenger_count: b ? Math.min(b.num_guests, 7) : 1, luggage_count: 1, vehicle_type: "SEDAN" as VehicleType, flight_number: "", airline: "", special_requirements: "",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const estimateQuery = {
    ...(from === "location" && form.pickup_location_id ? { pickup_location_id: Number(form.pickup_location_id) } : {}),
    destination_address: form.destination_address.trim(), vehicle_type: form.vehicle_type, luggage_count: form.luggage_count,
    passenger_count: form.passenger_count, ...(form.special_requirements.trim() ? { special_requirements: form.special_requirements.trim() } : {}),
    ...(bookingId ? { booking_id: bookingId } : {}),
  };
  const debounced = useDebounced(JSON.stringify(estimateQuery), 400);
  const estimate = useQuery(() => pickupsApi.estimate(JSON.parse(debounced)), [debounced], { enabled: estimateQuery.destination_address.length > 3 && (from === "custom" || !!form.pickup_location_id) });

  const create = useMutation(async () => {
    const body: PickupInput = {
      ...(from === "location" ? { pickup_location_id: Number(form.pickup_location_id) } : { custom_pickup_address: form.custom_pickup_address.trim() }),
      destination_address: form.destination_address.trim(), pickup_date: form.pickup_date, pickup_time: form.pickup_time,
      passenger_count: form.passenger_count, luggage_count: form.luggage_count, vehicle_type: form.vehicle_type,
      ...(form.flight_number.trim() ? { flight_number: form.flight_number.trim() } : {}), ...(form.airline.trim() ? { airline: form.airline.trim() } : {}),
      ...(form.special_requirements.trim() ? { special_requirements: form.special_requirements.trim() } : {}), ...(bookingId ? { booking_id: bookingId } : {}),
    };
    const { pickup_request: p } = await pickupsApi.create(body);
    if (Number(p.total_fare) > 0) {
      const r = await startPayment({ kind: "pickup", ref: p.confirmation_code, back: `/pickups/${p.confirmation_code}`, label: "your pickup" });
      if (r === "redirected") return;
    }
    router.push(`/pickups/${p.confirmation_code}`);
  }, { silentError: true });
  const fe = create.fieldErrors;
  const e = estimate.data;

  return (
    <Container>
      <PageHeader crumbs={[{ label: "Pickups", href: "/pickups" }, { label: "Book" }]} title="Book a pickup" description={b ? `For your stay at ${b.hotel_name}.` : "From the airport, a station or anywhere in town."} />
      <form className="grid gap-6 lg:grid-cols-[1fr_360px]" onSubmit={ev => { ev.preventDefault(); void create.run(); }}>
        <div className="space-y-6">
          <Panel title="Where from and to" icon={Location}>
            <div className="space-y-4">
              <Segmented value={from} onChange={setFrom} options={[{ value: "location", label: "Airport or station" }, { value: "custom", label: "Another address" }]} />
              {from === "location" ? (
                locations.loading ? <Skeleton className="h-11 w-full" /> :
                  <Select label="Pick me up at" required placeholder="Choose a place" value={form.pickup_location_id} onChange={set("pickup_location_id")} error={fe.pickup_location_id}
                    options={(locations.data?.results ?? []).filter(l => l.is_active).map(l => ({ value: String(l.id), label: `${l.name}${l.terminal ? ` · ${l.terminal}` : ""}` }))} />
              ) : <Input label="Pick me up at" required value={form.custom_pickup_address} onChange={set("custom_pickup_address")} error={fe.custom_pickup_address} />}
              <Input label="Take me to" required value={form.destination_address} onChange={set("destination_address")} error={fe.destination_address} placeholder="Hotel name and address" />
            </div>
          </Panel>
          <Panel title="When" icon={Airplane}>
            <FormGrid>
              <Input label="Date" type="date" required min={todayISO()} value={form.pickup_date} onChange={set("pickup_date")} error={fe.pickup_date} />
              <Input label="Time" type="time" required value={form.pickup_time} onChange={set("pickup_time")} error={fe.pickup_time} hint="At least 1 hour from now." />
              <Input label="Flight number (optional)" value={form.flight_number} onChange={set("flight_number")} placeholder="BA75" />
              <Input label="Airline (optional)" value={form.airline} onChange={set("airline")} />
            </FormGrid>
            {fe.non_field_errors && <p className="mt-2 text-xs text-danger">{fe.non_field_errors}</p>}
          </Panel>
          <Panel title="Car and passengers" icon={Car}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {VEHICLES.map(v => (
                <button key={v.value} type="button" onClick={() => setForm(f => ({ ...f, vehicle_type: v.value }))}
                  className={`rounded-xl border p-3 text-left ${form.vehicle_type === v.value ? "border-primary bg-primary-50 ring-1 ring-primary/20" : "border-line-strong hover:bg-surface-2"}`}>
                  <span className="block text-sm font-semibold text-ink">{v.label}</span><span className="block text-xs text-muted">{v.seats}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 divide-y divide-line">
              <Stepper label="Passengers" value={form.passenger_count} min={1} max={20} onChange={n => setForm(f => ({ ...f, passenger_count: n }))} />
              <Stepper label="Bags" description="₦500 for each bag over 2" value={form.luggage_count} max={20} onChange={n => setForm(f => ({ ...f, luggage_count: n }))} />
            </div>
            <Textarea className="mt-3" label="Special requirements (optional)" rows={2} value={form.special_requirements} onChange={set("special_requirements")} hint="A child seat, wheelchair space… (₦2,000)" />
          </Panel>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Panel title="Fare">
            {!e ? <p className="text-sm text-muted">{estimate.loading ? "Working out the fare…" : estimate.error ? estimate.error.message : "Fill in where from and to for a price."}</p> : (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-ink-2">Base fare</dt><dd className="tabular">{money(e.estimated_base_fare)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-2">Extras</dt><dd className="tabular">{money(e.estimated_additional_charges)}</dd></div>
                <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-ink"><dt>Total</dt><dd className="tabular">{money(e.estimated_total_fare)}</dd></div>
                <p className="pt-1 text-xs text-muted">{[e.distance_km && `${e.distance_km} km`, e.estimated_duration_minutes && `about ${e.estimated_duration_minutes} min`].filter(Boolean).join(" · ")}{!e.is_precise && " · minimum fare (exact distance unknown)"}</p>
                {e.note && <p className="text-xs text-muted">{e.note}</p>}
              </dl>
            )}
            {create.error && !Object.keys(fe).length && <div className="mt-3"><Callout tone="danger">{create.error.message}</Callout></div>}
            <Button type="submit" fullWidth size="lg" className="mt-4" loading={create.busy} disabled={!e || !form.destination_address.trim()}>{e ? `Book and pay ${money(e.estimated_total_fare)}` : "Book pickup"}</Button>
            <p className="mt-2 text-center text-xs text-muted">Free cancellation up to 24 hours before pickup.</p>
          </Panel>
        </aside>
      </form>
    </Container>
  );
}
