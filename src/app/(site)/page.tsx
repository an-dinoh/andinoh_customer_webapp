"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { hotelsApi, profileApi } from "@/services/api";
import { useQuery } from "@/hooks/useApi";
import StaySearch from "@/components/hotels/StaySearch";
import { EmptyFeed, FeedSections, FeedSkeleton, visibleSections } from "@/components/home/Feed";
import { Container } from "@/components/shell/SiteShell";
import { Button, Callout } from "@/components/ui";
import { ArrowRight, Car, Gps, MessageQuestion, SearchStatus, ShieldCheck, Verify, Wallet, type Icon } from "@/components/icons";
import { defaultPlan } from "@/utils/stay";
import { currentLocation } from "@/utils/device";
import { useGuestBookings } from "@/hooks/useGuestBookings";
import { formatDate } from "@/utils/format";

type Coords = { latitude: number; longitude: number };

/** Uses the location without asking only when the person has already allowed it. */
function useKnownLocation(): [Coords | null, () => Promise<boolean>] {
  const [coords, setCoords] = useState<Coords | null>(null);
  useEffect(() => {
    let cancelled = false;
    navigator.permissions?.query({ name: "geolocation" as PermissionName }).then(p => {
      if (p.state === "granted") void currentLocation().then(c => { if (!cancelled && c) setCoords(c); });
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, []);
  const ask = async () => {
    const c = await currentLocation();
    if (c) setCoords(c);
    return !!c;
  };
  return [coords, ask];
}

const SHORTCUTS: { href: string; title: string; text: string; icon: Icon; tone: string }[] = [
  { href: "/pickups/new", title: "Airport pickups", text: "A driver waiting when you land", icon: Car, tone: "bg-success-50 text-success" },
  { href: "/bookings/find", title: "Find a booking", text: "Booked without an account? Get your link", icon: SearchStatus, tone: "bg-info-50 text-info" },
  { href: "/help", title: "Help centre", text: "Payments, refunds and your stay", icon: MessageQuestion, tone: "bg-violet-50 text-violet" },
];

const PROMISES: { icon: Icon; title: string; text: string }[] = [
  { icon: Verify, title: "Verified hotels", text: "Andinoh checks every hotel’s documents, and inspectors visit in person." },
  { icon: Wallet, title: "Pay your way", text: "Pay online by card, transfer or USSD, or pay at the hotel where it’s offered." },
  { icon: ShieldCheck, title: "Clear refunds", text: "Every hotel’s cancellation rules are shown before you book." },
];

export default function HomePage() {
  const { isAuthenticated, profile } = useAuth();
  const [coords, askLocation] = useKnownLocation();
  const [locationDenied, setLocationDenied] = useState(false);
  const feed = useQuery(() => hotelsApi.homeFeed(coords ?? undefined), [coords?.latitude, coords?.longitude, isAuthenticated]);
  const saved = useGuestBookings();
  const plan = defaultPlan();

  // Signed in: remember where they are for "hotels around you" (guide 5.1).
  useEffect(() => {
    if (isAuthenticated && coords) void profileApi.saveLocation(String(coords.latitude), String(coords.longitude)).catch(() => undefined);
  }, [isAuthenticated, coords]);

  const sections = visibleSections(feed.data?.sections);
  const hasNearby = sections.some(s => s.key === "around_you");
  const firstName = profile?.full_name?.split(" ")[0];

  return (
    <>
      <section className="relative isolate overflow-visible">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image src="/hero.jpg" alt="" fill priority className="object-cover" sizes="100vw" />
          <div className="hero-scrim absolute inset-0" />
        </div>
        <div className="mx-auto max-w-[1240px] px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">
          <p className="text-sm font-medium text-secondary">{firstName ? `Welcome back, ${firstName}` : "Hotels across Nigeria"}</p>
          <h1 className="mt-2 max-w-2xl text-[32px] font-semibold leading-tight tracking-tight text-white sm:text-5xl">Find a stay you’ll want to come back to.</h1>
          <p className="mt-3 max-w-xl text-base text-white/80">Verified hotels, honest prices for your dates, and every trip in one place.</p>
          <div className="mt-8 max-w-5xl"><StaySearch initialPlan={plan} /></div>
        </div>
      </section>

      <Container className="space-y-12">
        <div className="grid gap-3 sm:grid-cols-3">
          {SHORTCUTS.map(s => (
            <Link key={s.href} href={s.href} className="card-lift group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 hover:border-primary/30">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.tone}`}><s.icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">{s.title}</span>
                <span className="block truncate text-xs text-muted">{s.text}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>

        {!isAuthenticated && saved.length > 0 && (
          <Callout tone="info" title={`You have ${saved.length === 1 ? "a booking" : `${saved.length} bookings`} on this device`}
            action={<Button size="sm" variant="secondary" href="/bookings">View</Button>}>
            {saved[0].hotel_name ?? saved[0].confirmation_code}{saved[0].check_in_date ? `, from ${formatDate(saved[0].check_in_date)}` : ""}
          </Callout>
        )}

        {!hasNearby && !coords && !feed.loading && (
          <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary"><Gps className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-semibold text-ink">Hotels around you</p>
                <p className="text-xs text-muted">{locationDenied ? "Location is off for this site. Turn it on in your browser to see nearby hotels." : "Share your location to see verified hotels nearby, nearest first."}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" icon={Gps} onClick={async () => setLocationDenied(!(await askLocation()))}>Use my location</Button>
          </div>
        )}

        {feed.loading ? <FeedSkeleton /> : sections.length ? <FeedSections sections={sections} /> : <EmptyFeed />}

        <section className="grid gap-4 rounded-3xl border border-line bg-surface p-6 sm:grid-cols-3 sm:p-8">
          {PROMISES.map(p => (
            <div key={p.title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary"><p.icon className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-semibold text-ink">{p.title}</p>
                <p className="mt-1 text-sm text-muted">{p.text}</p>
              </div>
            </div>
          ))}
        </section>
      </Container>
    </>
  );
}
