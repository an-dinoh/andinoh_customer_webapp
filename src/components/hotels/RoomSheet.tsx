"use client";

import { hotelsApi } from "@/services/api";
import { useQuery } from "@/hooks/useApi";
import { Callout, DetailList, ErrorState, Img, Pill, Sheet, Skeleton } from "@/components/ui";
import { formatDate, humanize, money } from "@/utils/format";
import type { RoomDetail } from "@/types/api";

const VIEWS: [keyof RoomDetail, string][] = [
  ["has_sea_view", "Sea view"], ["has_city_view", "City view"], ["has_garden_view", "Garden view"],
  ["has_mountain_view", "Mountain view"], ["has_balcony", "Balcony"],
];

/** Everything about one room type: photos, who it sleeps, what's in it and the next 30 days (guide 5.4). */
export default function RoomSheet({ roomId, checkIn, checkOut, onClose }: { roomId: string | null; checkIn: string; checkOut: string; onClose: () => void }) {
  const room = useQuery(() => hotelsApi.room(roomId!, { check_in_date: checkIn, check_out_date: checkOut }), [roomId, checkIn, checkOut], { enabled: !!roomId });
  const r = room.data;
  const photos = [...(r?.images ?? []), ...(r?.physical_instances ?? []).flatMap(p => p.images ?? [])]
    .map(i => (i.image_url ?? i.image) as string | undefined).filter(Boolean) as string[];
  return (
    <Sheet open={!!roomId} onClose={onClose} title={r?.title ?? "Room"} description={r ? `${humanize(r.room_type)} · ${humanize(r.bed_type)} bed` : undefined} width="lg">
      {room.error ? <ErrorState error={room.error} onRetry={room.reload} /> : !r ? (
        <div className="space-y-4"><Skeleton className="aspect-video w-full rounded-2xl" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-1/2" /></div>
      ) : (
        <div className="space-y-6">
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">{photos.slice(0, 4).map((p, i) => <Img key={p + i} src={p} alt={r.title} className={`${i === 0 ? "col-span-2 aspect-video" : "aspect-[4/3]"} w-full rounded-xl object-cover`} />)}</div>
          ) : <Img src={null} alt={r.title} className="aspect-video w-full rounded-2xl" />}
          {r.description && <p className="text-sm text-ink-2">{r.description}</p>}
          <DetailList cols={3} items={[
            { label: "Sleeps", value: `${r.max_occupancy} guest${r.max_occupancy === 1 ? "" : "s"}` },
            { label: "Adults", value: `Up to ${r.max_adults}` },
            { label: "Children", value: r.max_children ? `Up to ${r.max_children}` : "None" },
            { label: "Size", value: r.room_size ? `${r.room_size} m²` : "—" },
            { label: "Bed", value: humanize(r.bed_type) },
            { label: "From", value: <span className="tabular">{money(r.base_price, "NGN", { decimals: false })} a night</span> },
          ]} />
          {(VIEWS.some(([k]) => r[k]) || r.amenities.length > 0) && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-ink">In the room</h3>
              <div className="flex flex-wrap gap-2">
                {VIEWS.filter(([k]) => r[k]).map(([, label]) => <Pill key={label} tone="primary" dot={false}>{label}</Pill>)}
                {r.amenities.map(a => <Pill key={String(a.id)} dot={false}>{a.name}</Pill>)}
              </div>
            </div>
          )}
          {r.offer && (
            <Callout tone={Number(r.offer.discount) > 0 ? "success" : "info"} title={`${money(r.offer.total)} for ${r.offer.nights} night${r.offer.nights === 1 ? "" : "s"}`}>
              {money(r.offer.price_per_night)} a night on average{Number(r.offer.discount) > 0 && ` · ${r.offer.discount_titles.join(", ")}`}. Taxes and the service fee are added at checkout.
            </Callout>
          )}
          {r.availability.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-ink">Next 30 days</h3>
              <p className="mb-3 text-xs text-muted">Nightly price; greyed-out nights are fully booked.</p>
              <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-7">
                {r.availability.slice(0, 35).map(d => (
                  <div key={d.date} className={`rounded-lg border px-1.5 py-1.5 text-center ${d.is_available ? "border-line bg-surface" : "border-transparent bg-surface-2 opacity-60"}`}
                    title={d.is_available ? `${d.rooms_available} left` : "Fully booked"}>
                    <p className="text-[10px] text-muted">{formatDate(d.date, { day: "numeric", month: "short", year: undefined })}</p>
                    <p className={`text-[11px] font-semibold tabular ${d.is_available ? "text-ink" : "text-subtle line-through"}`}>{Math.round(Number(d.price) / 1000)}k</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
