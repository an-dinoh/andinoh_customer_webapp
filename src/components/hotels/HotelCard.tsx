import Link from "next/link";
import { Img } from "@/components/ui";
import { Location, Star, Verify } from "@/components/icons";
import { money, humanize } from "@/utils/format";
import type { HotelCard as Hotel } from "@/types/api";

/** "4.6" on a tinted pill, or "New" before the first review (guide 5.1). */
export function RatingBadge({ rating, reviews, className = "" }: { rating: number | null | undefined; reviews?: number; className?: string }) {
  if (rating === null || rating === undefined || !reviews && rating === 0) {
    return <span className={`inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary ${className}`}>New</span>;
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-secondary-50 px-2 py-0.5 text-xs font-semibold text-gold-text ring-1 ring-inset ring-gold-ring ${className}`}>
      <Star variant="bold" className="h-3.5 w-3.5" />
      <span className="tabular">{Number(rating).toFixed(1)}</span>
      {!!reviews && <span className="font-normal opacity-80">({reviews})</span>}
    </span>
  );
}

/** Hotel class as small gold stars. */
export function Stars({ count, className = "" }: { count: number; className?: string }) {
  if (!count) return null;
  return (
    <span className={`inline-flex items-center gap-0.5 text-secondary ${className}`} aria-label={`${count}-star hotel`} role="img">
      {Array.from({ length: Math.min(5, count) }).map((_, i) => <Star key={i} variant="bold" className="h-3.5 w-3.5" />)}
    </span>
  );
}

export const placeName = (h: Pick<Hotel, "city_name" | "state_name">) => [h.city_name, h.state_name].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ");

/** A hotel in a list or row: photo first, then the facts a traveller scans for. */
export default function HotelCard({ hotel, query = "", layout = "grid" }: { hotel: Hotel; query?: string; layout?: "grid" | "row" }) {
  const href = `/hotels/${hotel.id}${query ? `?${query}` : ""}`;
  const price = hotel.starting_price ? money(hotel.starting_price, "NGN", { decimals: false }) : null;
  if (layout === "row") {
    return (
      <Link href={href} className="card-lift group flex gap-4 rounded-2xl border border-line bg-surface p-3 hover:border-primary/30">
        <Img src={hotel.primary_image ?? hotel.logo} alt={hotel.name} className="h-28 w-24 shrink-0 rounded-xl object-cover min-[360px]:h-32 min-[360px]:w-36 sm:h-36 sm:w-52" />
        <div className="flex min-w-0 flex-1 flex-col py-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Stars count={hotel.star_rating} />
              <h3 className="mt-1 truncate text-[15px] font-semibold text-ink group-hover:text-primary">{hotel.name}</h3>
              <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted"><Location className="h-4 w-4 shrink-0" />{placeName(hotel)}
                {hotel.distance !== null && hotel.distance !== undefined && <span className="tabular"> · {hotel.distance.toFixed(1)} km</span>}</p>
            </div>
            <RatingBadge rating={hotel.average_rating} reviews={hotel.total_reviews} className="shrink-0" />
          </div>
          {hotel.description && <p className="mt-2 line-clamp-2 hidden text-sm text-muted sm:block">{hotel.description}</p>}
          <div className="mt-auto flex items-end justify-between gap-3 pt-2">
            <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
              {hotel.is_verified && <span className="inline-flex items-center gap-1 font-medium text-success"><Verify className="h-3.5 w-3.5" />Verified</span>}
              <span>{humanize(hotel.hotel_type)}</span>
            </span>
            {price && <span className="text-right text-xs text-muted">From <span className="block text-base font-semibold text-ink tabular">{price}</span></span>}
          </div>
        </div>
      </Link>
    );
  }
  return (
    <Link href={href} className="card-lift group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface hover:border-primary/30">
      <div className="relative">
        <Img src={hotel.primary_image ?? hotel.logo} alt={hotel.name} className="aspect-[4/3] w-full object-cover" />
        {hotel.is_verified && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-surface/95 px-2 py-1 text-[11px] font-semibold text-success shadow-sm">
            <Verify className="h-3.5 w-3.5" />Verified
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <Stars count={hotel.star_rating} />
          <RatingBadge rating={hotel.average_rating} reviews={hotel.total_reviews} />
        </div>
        <h3 className="mt-2 line-clamp-1 text-[15px] font-semibold text-ink group-hover:text-primary">{hotel.name}</h3>
        <p className="mt-0.5 flex items-center gap-1 truncate text-[13px] text-muted">
          <Location className="h-3.5 w-3.5 shrink-0" />{placeName(hotel)}
          {hotel.distance !== null && hotel.distance !== undefined && <span className="tabular"> · {hotel.distance.toFixed(1)} km</span>}
        </p>
        {price && <p className="mt-auto pt-3 text-xs text-muted">From <span className="text-[15px] font-semibold text-ink tabular">{price}</span> a night</p>}
      </div>
    </Link>
  );
}

export function HotelCardSkeleton({ layout = "grid" }: { layout?: "grid" | "row" }) {
  if (layout === "row") {
    return (
      <div className="flex gap-4 rounded-2xl border border-line bg-surface p-3">
        <span className="block h-32 w-36 shrink-0 rounded-xl animate-shimmer sm:h-36 sm:w-52" />
        <div className="flex-1 space-y-2 py-2"><span className="block h-3 w-16 rounded animate-shimmer" /><span className="block h-4 w-2/3 rounded animate-shimmer" /><span className="block h-3 w-1/3 rounded animate-shimmer" /></div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <span className="block aspect-[4/3] w-full animate-shimmer" />
      <div className="space-y-2 p-4"><span className="block h-3 w-16 rounded animate-shimmer" /><span className="block h-4 w-3/4 rounded animate-shimmer" /><span className="block h-3 w-1/2 rounded animate-shimmer" /></div>
    </div>
  );
}
