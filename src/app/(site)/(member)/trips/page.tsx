"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveReload } from "@/contexts/LiveContext";
import { bookingsApi } from "@/services/api";
import { useDebounced, useMutation, useQuery } from "@/hooks/useApi";
import { useGuestBookings } from "@/hooks/useGuestBookings";
import TripCard, { TripCardSkeleton } from "@/components/bookings/TripCard";
import { Container } from "@/components/shell/SiteShell";
import { Button, Callout, EmptyState, ErrorState, PageHeader, SearchBox, StatTile, Tabs } from "@/components/ui";
import { Calendar, Crown, Gift, Hotel, Import } from "@/components/icons";
import { formatDate } from "@/utils/format";
import { isHotel, tripGroup, type TripGroup } from "@/utils/bookings";
import { guestBookings } from "@/utils/guestBookings";
import type { HotelBooking } from "@/types/api";

/** Guest bookings saved in this browser: move them into the account with their link (guide 7.6). */
function DeviceBookings({ onMoved }: { onMoved: () => void }) {
  const saved = useGuestBookings();
  const claim = useMutation(async (code: string, token: string) => {
    try {
      return await bookingsApi.claim(code, token);
    } finally {
      // Moved, or the token no longer works (already moved or a new link was sent): either way it's done here.
      guestBookings.remove(code);
    }
  }, { success: "Booking added to your account", onSuccess: onMoved });
  if (!saved.length) return null;
  return (
    <Callout tone="info" icon={Import} title="Bookings made on this device without signing in">
      <ul className="mt-2 space-y-2">
        {saved.map(b => (
          <li key={b.confirmation_code} className="flex flex-wrap items-center justify-between gap-2">
            <span>{b.hotel_name ?? b.confirmation_code}{b.check_in_date ? ` · ${formatDate(b.check_in_date)}` : ""} <span className="font-mono text-xs opacity-75">{b.confirmation_code}</span></span>
            <Button size="sm" variant="secondary" loading={claim.busy} onClick={() => claim.run(b.confirmation_code, b.access_token)}>Add to my account</Button>
          </li>
        ))}
      </ul>
    </Callout>
  );
}

export default function TripsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const tab = (["upcoming", "past", "cancelled"].includes(params.get("tab") ?? "") ? params.get("tab") : "upcoming") as TripGroup;
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim(), 300);
  const [pages, setPages] = useState(1);

  // Pages of the bookings list, newest first; grouped into tabs here. The list can also hold flights,
  // which this app doesn’t offer, so only hotel stays are shown.
  const list = useQuery(async () => {
    const all: HotelBooking[] = [];
    let count = 0;
    let next = true;
    for (let page = 1; page <= pages && next; page++) {
      const r = await bookingsApi.list({ search: q || undefined, page: page > 1 ? page : undefined });
      all.push(...r.results.filter(isHotel));
      count = r.count;
      next = !!r.next;
    }
    return { all, count, more: next };
  }, [q, pages]);
  const summary = useQuery(() => bookingsApi.summary(), []);
  useLiveReload(["booking_status_update"], list.reload);

  const groups: Record<TripGroup, HotelBooking[]> = { upcoming: [], past: [], cancelled: [] };
  for (const b of list.data?.all ?? []) groups[tripGroup(b)].push(b);
  // Upcoming soonest first; the rest newest first.
  groups.upcoming.sort((a, b) => (((a as { check_in_date: string }).check_in_date < (b as { check_in_date: string }).check_in_date) ? -1 : 1));
  const rows = groups[tab];
  const stats = summary.data?.statistics;

  return (
    <Container>
      <PageHeader title="My trips" description="Your stays, with receipts and everything you can do for each." />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Bookings" icon={Calendar} value={stats?.total_bookings ?? "—"} loading={summary.loading} />
        <StatTile label="Upcoming" icon={Hotel} tone="info" value={summary.data?.upcoming_bookings.length ?? "—"} loading={summary.loading} />
        <StatTile label="Points" icon={Gift} tone="gold" value={(profile?.available_points ?? stats?.loyalty_points ?? 0).toLocaleString()} loading={summary.loading} onClick={() => router.push("/account/rewards")} />
        <StatTile label="Membership" icon={Crown} tone="violet" value={profile?.membership_tier_display ?? stats?.membership_tier ?? "—"} loading={summary.loading} />
      </div>
      <div className="mb-6"><DeviceBookings onMoved={() => void list.reload()} /></div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Tabs value={tab} onChange={v => router.replace(`/trips?tab=${v}`)} items={[
          { value: "upcoming", label: "Upcoming", count: list.data ? groups.upcoming.length : undefined },
          { value: "past", label: "Past", count: list.data ? groups.past.length : undefined },
          { value: "cancelled", label: "Cancelled", count: list.data ? groups.cancelled.length : undefined },
        ]} />
        <SearchBox value={search} onChange={setSearch} placeholder="Search hotel or code" className="sm:w-64" />
      </div>

      <div className="mt-5 space-y-3">
        {list.error ? <div className="rounded-2xl border border-line bg-surface"><ErrorState error={list.error} onRetry={list.reload} /></div>
          : list.loading ? Array.from({ length: 3 }).map((_, i) => <TripCardSkeleton key={i} />)
            : rows.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface">
                <EmptyState icon={Calendar} title={tab === "upcoming" ? "No upcoming trips" : tab === "past" ? "No past trips yet" : "Nothing cancelled"}
                  description={tab === "upcoming" ? "When you book a stay, it shows here." : undefined}
                  action={tab === "upcoming" ? <Button href="/hotels">Find a hotel</Button> : undefined} />
              </div>
            ) : rows.map(b => <TripCard key={b.id} booking={b} />)}
        {list.data?.more && <Button variant="outline" fullWidth loading={list.refreshing} onClick={() => setPages(p => p + 1)}>Load older bookings</Button>}
      </div>
    </Container>
  );
}
