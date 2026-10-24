"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { hotelsApi } from "@/services/api";
import { useQuery } from "@/hooks/useApi";
import Gallery from "@/components/hotels/Gallery";
import { RatingBadge, Stars, placeName } from "@/components/hotels/HotelCard";
import Reviews from "@/components/hotels/Reviews";
import RoomSheet from "@/components/hotels/RoomSheet";
import StayPlanner from "@/components/hotels/StayPlanner";
import { Container } from "@/components/shell/SiteShell";
import { Button, Callout, EmptyState, ErrorState, Img, Pill, Skeleton, Spinnerish, Stepper } from "@/components/ui";
import { Award, Clock, Guests, Key as Bed, Location, Map, ShieldCheck, Verify, Wallet } from "@/components/icons";
import { formatDate, humanize, money, toNumber } from "@/utils/format";
import { LIMITS, planQuery, readPlan, type StayPlan } from "@/utils/stay";
import { POLICY_RULES } from "@/utils/bookings";
import type { HotelDetail, MediaItem, RoomCard } from "@/types/api";

const photoUrl = (m: MediaItem) => (m.image_url ?? m.image) as string | undefined;
const hhmm = (t: string | null | undefined) => (t ? t.slice(0, 5) : "—");

function Section({ id, title, children, description }: { id?: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-line pt-8">
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function RoomRow({ room, quantity, onQuantity, onOpen, datesChosen }: { room: RoomCard; quantity: number; onQuantity: (n: number) => void; onOpen: () => void; datesChosen: boolean }) {
  const o = room.offer;
  const left = room.min_availability_for_search;
  const soldOut = left === 0 || !room.is_available;
  const max = Math.min(LIMITS.perRoom, left ?? LIMITS.perRoom);
  const discounted = o && toNumber(o.discount) > 0;
  return (
    <div className={`flex flex-col gap-4 rounded-2xl border bg-surface p-3 sm:flex-row ${quantity ? "border-primary ring-1 ring-primary/20" : "border-line"}`}>
      <button type="button" onClick={onOpen} className="shrink-0">
        <Img src={room.primary_image} alt={room.title} className="aspect-[16/9] w-full rounded-xl object-cover sm:aspect-auto sm:h-32 sm:w-44" />
      </button>
      <div className="flex min-w-0 flex-1 flex-col">
        <button type="button" onClick={onOpen} className="text-left text-[15px] font-semibold text-ink hover:text-primary">{room.title}</button>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{humanize(room.bed_type)} bed</span>
          <span className="inline-flex items-center gap-1"><Guests className="h-3.5 w-3.5" />Sleeps {room.max_occupancy}</span>
          {room.room_size ? <span>{room.room_size} m²</span> : null}
        </p>
        {room.description && <p className="mt-2 line-clamp-2 text-sm text-ink-2">{room.description}</p>}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {discounted && o!.discount_titles.map(t => <Pill key={t} tone="success" dot={false}>{t}</Pill>)}
          {!soldOut && left !== null && left <= 2 && <Pill tone="warning">Only {left} left</Pill>}
          {soldOut && <Pill tone="danger">Sold out for your dates</Pill>}
        </div>
        <button type="button" onClick={onOpen} className="mt-auto pt-2 text-left text-xs font-medium text-primary hover:underline">Room details</button>
      </div>
      <div className="flex shrink-0 flex-row items-end justify-between gap-3 border-t border-line pt-3 sm:w-48 sm:flex-col sm:border-0 sm:pt-0">
        {o ? (
          <div className="sm:text-right">
            {discounted && <p className="text-xs text-subtle line-through tabular">{money(o.list_price_per_night, "NGN", { decimals: false })}</p>}
            <p className="text-lg font-semibold text-ink tabular">{money(o.price_per_night, "NGN", { decimals: false })}<span className="text-xs font-normal text-muted"> /night</span></p>
            <p className="text-xs text-muted">{datesChosen ? <>{money(o.total, "NGN", { decimals: false })} for {o.nights} night{o.nights === 1 ? "" : "s"}</> : "Tonight’s price"} + taxes & fees</p>
            {room.display_price && <p className="text-xs text-muted">≈ {String(room.display_price)}</p>}
          </div>
        ) : <p className="text-lg font-semibold text-ink tabular">{money(room.base_price, "NGN", { decimals: false })}</p>}
        {soldOut ? <Button size="sm" variant="outline" disabled>Unavailable</Button>
          : quantity ? <Stepper size="sm" value={quantity} min={0} max={max} onChange={onQuantity} label={undefined} />
            : <Button size="sm" onClick={() => onQuantity(1)}>Select</Button>}
      </div>
    </div>
  );
}

function Policies({ hotel }: { hotel: HotelDetail }) {
  const items: { icon: typeof Clock; title: string; text: React.ReactNode }[] = [
    { icon: Clock, title: "Check-in and check-out", text: <>Check in from {hhmm(hotel.check_in_time)}, check out by {hhmm(hotel.check_out_time)}.</> },
    { icon: ShieldCheck, title: `${humanize(hotel.cancellation_type)} cancellation`, text: POLICY_RULES[hotel.cancellation_type] ?? "The hotel’s refund rules are shown at checkout." },
    {
      icon: Wallet, title: hotel.allows_pay_at_hotel ? "Pay at the hotel available" : "Pay online",
      text: hotel.allows_pay_at_hotel
        ? <>Pay a {toNumber(hotel.deposit_required_pct) ? `${toNumber(hotel.deposit_required_pct)}% deposit` : "small fee"} online now and the rest at the property.</>
        : "Pay in full online by card, bank transfer or USSD when you book.",
    },
  ];
  const extra = (hotel.policies ?? []).map(p => (typeof p === "string" ? p : String((p as Record<string, unknown>).description ?? (p as Record<string, unknown>).title ?? ""))).filter(Boolean);
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map(i => (
        <div key={i.title} className="rounded-2xl border border-line bg-surface p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary"><i.icon className="h-[18px] w-[18px]" /></span>
          <p className="mt-3 text-sm font-semibold text-ink">{i.title}</p>
          <p className="mt-1 text-sm text-muted">{i.text}</p>
        </div>
      ))}
      {extra.length > 0 && <ul className="list-disc space-y-1 pl-5 text-sm text-ink-2 sm:col-span-3">{extra.map((t, i) => <li key={i}>{t}</li>)}</ul>}
    </div>
  );
}

function HotelPage() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const datesChosen = params.has("in") && params.has("out");
  const plan = readPlan(params);
  const [roomOpen, setRoomOpen] = useState<string | null>(null);

  const hotel = useQuery(() => hotelsApi.get(id), [id]);
  const rooms = useQuery(() => hotelsApi.rooms(id, { check_in_date: plan.checkIn, check_out_date: plan.checkOut, page_size: 50 }), [id, plan.checkIn, plan.checkOut]);

  // The native History API updates the URL (and useSearchParams) at once, with no server round trip;
  // router.replace would make one, and a "Reserve" tapped meanwhile was lost.
  const setPlan = (p: StayPlan) => window.history.replaceState(null, "", `/hotels/${id}?${planQuery(p)}`);
  const setQuantity = (roomId: string, n: number) => {
    const next = { ...plan.rooms, [roomId]: n };
    if (!n) delete next[roomId];
    if (Object.keys(next).length > LIMITS.roomTypes) return;
    setPlan({ ...plan, rooms: next });
  };

  if (hotel.error) return <Container><div className="rounded-2xl border border-line bg-surface"><ErrorState error={hotel.error} onRetry={hotel.reload} /></div></Container>;
  const h = hotel.data;
  if (!h) {
    return (
      <Container className="space-y-6">
        <Skeleton className="h-6 w-64" /><Skeleton className="h-[320px] w-full rounded-2xl" /><Skeleton className="h-4 w-1/2" />
      </Container>
    );
  }

  const photos = [...h.images.map(photoUrl), h.primary_image].filter((u, i, a): u is string => !!u && a.indexOf(u) === i).map(url => ({ url }));
  const roomList = rooms.data?.results ?? h.rooms;
  const mapUrl = h.latitude && h.longitude ? `https://www.google.com/maps/search/?api=1&query=${h.latitude},${h.longitude}` : null;
  const v = h.verification;

  return (
    <Container className="pb-24 lg:pb-0">
      <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted">
        <Link href="/" className="hover:text-primary">Home</Link><span>/</span>
        <Link href={`/hotels?city_id=${h.city ?? ""}&label=${encodeURIComponent(placeName(h))}&${planQuery({ ...plan, rooms: {} })}`} className="hover:text-primary">{h.city_name || "Hotels"}</Link><span>/</span>
        <span className="text-ink-2">{h.name}</span>
      </nav>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Stars count={h.star_rating} />
          <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink sm:text-3xl">{h.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
            <RatingBadge rating={h.average_rating} reviews={h.total_reviews} />
            <span className="inline-flex items-center gap-1"><Location className="h-4 w-4" />{h.address ? `${h.address}, ` : ""}{placeName(h)}</span>
            {mapUrl && <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline"><Map className="h-4 w-4" />Map</a>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {v?.verified && <Pill tone="success"><Verify className="h-3.5 w-3.5" />Verified by Andinoh</Pill>}
          {v?.inspected && <Pill tone="gold" dot={false}><Award className="h-3.5 w-3.5" />Inspected{v.inspection_rating ? ` · ${v.inspection_rating}/5` : ""}{v.last_inspected_at ? ` · ${formatDate(v.last_inspected_at, { year: undefined })}` : ""}</Pill>}
        </div>
      </div>

      <Gallery photos={photos} name={h.name} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-8">
          {h.description && <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{h.description}</p>}
          {h.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">{h.amenities.map(a => <Pill key={String(a.id)} dot={false}>{a.name}</Pill>)}</div>
          )}

          <Section id="rooms" title="Choose your room" description={datesChosen ? "Prices for your dates, per night on average. Taxes and the service fee are added at checkout." : "Pick dates to see the price for your stay."}>
            {rooms.error ? <ErrorState compact error={rooms.error} onRetry={rooms.reload} /> : rooms.loading && !roomList.length ? (
              <div className="space-y-3"><Skeleton className="h-36 w-full rounded-2xl" /><Skeleton className="h-36 w-full rounded-2xl" /></div>
            ) : roomList.length === 0 ? (
              <EmptyState compact icon={Bed} title="No rooms listed yet" description="This hotel hasn’t added rooms you can book online." />
            ) : (
              <div className="space-y-3">
                {roomList.map(r => <RoomRow key={r.id} room={r} quantity={plan.rooms[r.id] ?? 0} datesChosen={datesChosen} onQuantity={n => setQuantity(r.id, n)} onOpen={() => setRoomOpen(r.id)} />)}
              </div>
            )}
          </Section>

          {h.services.length > 0 && (
            <Section title="Add to your stay" description="Choose these at checkout.">
              <div className="grid gap-3 sm:grid-cols-2">
                {h.services.filter(s => s.is_active).map(s => (
                  <div key={s.id} className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
                    <div><p className="text-sm font-semibold text-ink">{s.name}</p><p className="mt-0.5 text-xs text-muted">{s.description || humanize(s.service_type)}</p></div>
                    <span className="shrink-0 text-sm font-semibold text-ink tabular">{money(s.price, "NGN", { decimals: false })}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="Good to know"><Policies hotel={h} /></Section>

          <Section id="reviews" title="Guest reviews"><Reviews hotelId={h.id} /></Section>
        </div>

        <aside className="order-first lg:order-none lg:sticky lg:top-24 lg:self-start">
          <StayPlanner hotelId={h.id} plan={plan} rooms={roomList} onPlan={setPlan} onReserve={() => router.push(`/checkout/${h.id}?${planQuery(plan)}`)} />
          {h.verification && !h.verification.verified && <div className="mt-3"><Callout tone="warning">This hotel hasn’t finished Andinoh’s checks yet.</Callout></div>}
        </aside>
      </div>
      <RoomSheet roomId={roomOpen} checkIn={plan.checkIn} checkOut={plan.checkOut} onClose={() => setRoomOpen(null)} />
    </Container>
  );
}

export default function Page() {
  return <Suspense fallback={<Spinnerish />}><HotelPage /></Suspense>;
}
