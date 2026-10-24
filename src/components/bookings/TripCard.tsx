import Link from "next/link";
import { Img, Pill } from "@/components/ui";
import { Calendar, Location } from "@/components/icons";
import { formatDate, money, nightsBetween } from "@/utils/format";
import { awaitingPayment, statusInfo } from "@/utils/bookings";
import type { HotelBooking } from "@/types/api";

/** One stay in "My trips": photo, hotel, dates, status and total. */
export default function TripCard({ booking }: { booking: HotelBooking }) {
  const s = statusInfo(booking.status);
  const nights = nightsBetween(booking.check_in_date, booking.check_out_date);
  const toPay = awaitingPayment(booking);
  return (
    <Link href={`/trips/${booking.id}`} className="card-lift flex gap-4 rounded-2xl border border-line bg-surface p-3 hover:border-primary/30">
      <Img src={booking.hotel_image} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover sm:h-28 sm:w-36" />
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">{booking.hotel_name}</p>
          <Pill tone={s.tone} className="shrink-0">{s.label}</Pill>
        </div>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted"><Location className="h-3.5 w-3.5 shrink-0" />{booking.hotel_city}</p>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink-2"><Calendar className="h-4 w-4 text-muted" />{formatDate(booking.check_in_date, { year: undefined })} – {formatDate(booking.check_out_date)} · {nights} night{nights === 1 ? "" : "s"}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <span className="font-mono text-xs text-subtle">{booking.confirmation_code}</span>
          <span className="text-right">
            {toPay && <span className="mr-2 text-xs font-medium text-warning">Pay to confirm</span>}
            <span className="text-sm font-semibold text-ink tabular">{money(booking.total_amount, booking.currency)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export function TripCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-2xl border border-line bg-surface p-3">
      <span className="block h-24 w-24 shrink-0 rounded-xl animate-shimmer sm:h-28 sm:w-36" />
      <div className="flex-1 space-y-2 py-1"><span className="block h-4 w-1/2 rounded animate-shimmer" /><span className="block h-3 w-1/3 rounded animate-shimmer" /><span className="block h-3 w-2/3 rounded animate-shimmer" /></div>
    </div>
  );
}
