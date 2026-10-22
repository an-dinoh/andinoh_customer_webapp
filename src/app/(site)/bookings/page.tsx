"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useGuestBookings } from "@/hooks/useGuestBookings";
import { Container } from "@/components/shell/SiteShell";
import { Button, Callout, EmptyState, PageHeader } from "@/components/ui";
import { ArrowRight, Calendar, SearchStatus } from "@/components/icons";
import { formatDate } from "@/utils/format";

/** Bookings made on this device without an account (guide 7.1), and the way to find a lost one. */
export default function GuestBookingsPage() {
  const { isAuthenticated } = useAuth();
  const saved = useGuestBookings();
  return (
    <Container narrow>
      <PageHeader title="Your bookings" description="Bookings made on this device without signing in." actions={<Button variant="outline" icon={SearchStatus} href="/bookings/find">Find a booking</Button>} />
      {isAuthenticated && <div className="mb-5"><Callout tone="info" action={<Button size="sm" href="/trips">My trips</Button>}>You’re signed in: your account’s bookings are in My trips.</Callout></div>}
      {saved.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface">
          <EmptyState icon={Calendar} title="No bookings on this device" description="Booked on another device or lost the link? We can email it to you again."
            action={<Button href="/bookings/find">Find my booking</Button>} />
        </div>
      ) : (
        <ul className="space-y-3">
          {saved.map(b => (
            <li key={b.confirmation_code}>
              <Link href={`/bookings/manage?code=${encodeURIComponent(b.confirmation_code)}`} className="card-lift flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 hover:border-primary/30">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary"><Calendar className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{b.hotel_name ?? "Hotel booking"}</span>
                  <span className="block text-xs text-muted">{b.check_in_date ? `${formatDate(b.check_in_date, { year: undefined })} – ${formatDate(b.check_out_date)}` : ""} · <span className="font-mono">{b.confirmation_code}</span></span>
                </span>
                <ArrowRight className="h-4 w-4 text-subtle" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {!isAuthenticated && (
        <p className="mt-8 text-center text-sm text-muted">
          <Link href="/register" className="font-medium text-primary hover:underline">Create an account</Link> with the same email and these bookings move into it automatically.
        </p>
      )}
    </Container>
  );
}
