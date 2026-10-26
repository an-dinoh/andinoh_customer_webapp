"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adsApi } from "@/services/api";
import HotelCard, { HotelCardSkeleton } from "@/components/hotels/HotelCard";
import { Button, Img, Modal } from "@/components/ui";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Hotel } from "@/components/icons";
import { formatDate } from "@/utils/format";
import { resolveLink } from "@/utils/links";
import type { ActiveStay, BannerAd, FeedSection, HotelCard as HotelT, PromoSlide } from "@/types/api";

/**
 * The home feed (Customer guide 5.1): sections in the server's order, only the types this app knows.
 * Titles are shown as given; `key` tells sections apart.
 */

const KNOWN = new Set(["active_bookings", "promo_carousel", "hotel_horizontal_list", "ads_banner"]);

export function visibleSections(sections: FeedSection[] | undefined): FeedSection[] {
  return [...(sections ?? [])].filter(s => KNOWN.has(s.type)).sort((a, b) => a.order - b.order);
}

/** Counts the tap when signed in, then follows the ad's link. */
function useAdTap() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  return (adId: string | undefined, url: string | null | undefined) => {
    if (adId && isAuthenticated) void adsApi.click(adId).catch(() => undefined);
    const link = resolveLink(url);
    if (!link) return;
    if (link.external) window.open(link.href, "_blank", "noopener,noreferrer");
    else router.push(link.href);
  };
}

function SectionHeader({ title, href, hint }: { title: string; href?: string; hint?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">{title}</h2>
        {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
      </div>
      {href && <Link href={href} className="-my-2 inline-flex shrink-0 items-center gap-1 py-2 text-sm font-medium text-primary hover:underline">See all<ArrowRight className="h-4 w-4" /></Link>}
    </div>
  );
}

/** A row that scrolls sideways, with arrows on wide screens. */
function Rail({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  return (
    <div className="group relative">
      <div ref={ref} role="list" aria-label={label} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 scrollbar-hide sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {children}
      </div>
      <button type="button" onClick={() => scroll(-1)} aria-label="Scroll back" className="absolute -left-4 top-1/3 hidden h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-md transition-opacity group-hover:flex lg:opacity-90">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button type="button" onClick={() => scroll(1)} aria-label="Scroll forward" className="absolute -right-4 top-1/3 hidden h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-md transition-opacity group-hover:flex lg:opacity-90">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

function hotelsSeeAll(section: FeedSection): string | undefined {
  const meta = (section.meta ?? {}) as Record<string, unknown>;
  if (section.key === "recent_search") {
    const q = new URLSearchParams();
    for (const k of ["city_id", "area_id", "state_id"]) if (meta[k]) q.set(k, String(meta[k]));
    if (!q.toString() && meta.query) q.set("search", String(meta.query));
    if (meta.label) q.set("label", String(meta.label));
    return `/hotels?${q}`;
  }
  if (section.key === "for_your_trip" && meta.city_id) return `/hotels?city_id=${meta.city_id}&label=${encodeURIComponent(String(meta.city ?? ""))}`;
  if (section.key === "luxury") return "/hotels?hotel_type=luxury";
  if (section.key === "deals" || section.key === "for_you") return "/hotels";
  return undefined;
}

function hotelsHint(section: FeedSection): string | undefined {
  const meta = (section.meta ?? {}) as Record<string, unknown>;
  if (section.key === "around_you") {
    const r = meta.radius_km ? `Within ${meta.radius_km} km` : "";
    return meta.location === "saved" ? `Near your last location${r ? ` · ${r.toLowerCase()}` : ""}` : r || undefined;
  }
  if (section.key === "for_your_trip" && meta.hotel_name) return `Close to ${meta.hotel_name}, from ${formatDate(String(meta.check_in_date ?? ""))}`;
  return undefined;
}

function HotelsRow({ section }: { section: FeedSection & { data: HotelT[] } }) {
  if (!section.data.length) return null;
  return (
    <section>
      <SectionHeader title={section.title ?? "Hotels"} href={hotelsSeeAll(section)} hint={hotelsHint(section)} />
      <Rail label={section.title ?? "Hotels"}>
        {section.data.map(h => (
          <div key={h.id} role="listitem" className="w-[260px] shrink-0 snap-start sm:w-[280px]"><HotelCard hotel={h} /></div>
        ))}
      </Rail>
    </section>
  );
}

function ActiveStays({ section }: { section: FeedSection & { data: ActiveStay[] } }) {
  if (!section.data.length) return null;
  return (
    <section>
      <SectionHeader title={section.title ?? "Your active stays"} href="/trips" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {section.data.map(b => (
          <Link key={b.id} href={`/trips/${b.id}`} className="card-lift flex items-center gap-4 rounded-2xl border border-line bg-surface p-3 hover:border-primary/30">
            <Img src={(b.hotel_image as string | null) ?? null} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{String(b.hotel_name ?? "Your stay")}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted"><Calendar className="h-3.5 w-3.5" />{formatDate(b.check_in_date, { year: undefined })} – {formatDate(b.check_out_date)}</p>
              {b.confirmation_code && <p className="mt-0.5 font-mono text-xs text-subtle">{b.confirmation_code}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Promos({ section }: { section: FeedSection & { data: PromoSlide[] } }) {
  const tap = useAdTap();
  if (!section.data.length) return null;
  return (
    <section>
      {section.title && <SectionHeader title={section.title} />}
      <Rail label="Offers">
        {section.data.map(p => (
          <button key={p.id} type="button" role="listitem" onClick={() => tap(p.kind === "ad" ? p.ad_id : undefined, p.action_url)}
            className="card-lift relative w-[85%] shrink-0 snap-start overflow-hidden rounded-2xl text-left sm:w-[460px]">
            <Img src={p.image_url} alt="" className="aspect-[16/7] w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-4">
              {p.kind === "ad" && <span className="mb-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">Sponsored{p.sponsor ? ` · ${p.sponsor}` : ""}</span>}
              <span className="block text-base font-semibold text-white">{p.title}</span>
            </span>
          </button>
        ))}
      </Rail>
    </section>
  );
}

function Banner({ ad }: { ad: BannerAd }) {
  const tap = useAdTap();
  const [detail, setDetail] = useState(false);
  const showsDetail = ad.action_type === "detail" || ad.action_type === "video" || (!ad.redirect_url && (ad.detail_body || ad.video_url || ad.video_file_url));
  const open = () => {
    if (showsDetail) {
      if (ad.ad_id) tap(ad.ad_id, null);
      setDetail(true);
    } else tap(ad.ad_id, ad.redirect_url);
  };
  const video = ad.video_file_url || ad.video_url;
  return (
    <section>
      <button type="button" onClick={open} className="card-lift group flex w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface text-left sm:flex-row">
        <Img src={ad.image_url} alt="" className="aspect-[16/8] w-full object-cover sm:aspect-auto sm:h-auto sm:w-2/5" />
        <span className="flex flex-1 flex-col justify-center gap-2 p-5 sm:p-7">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted">Sponsored · {ad.sponsor}</span>
          <span className="text-xl font-semibold tracking-tight text-ink">{ad.headline}</span>
          {ad.detail_body && <span className="line-clamp-2 text-sm text-muted">{ad.detail_body}</span>}
          <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary">{ad.action_button_text || "Learn more"}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
        </span>
      </button>
      <Modal open={detail} onClose={() => setDetail(false)} title={ad.headline} description={`Sponsored by ${ad.sponsor}`} size="lg"
        footer={ad.redirect_url ? <Button onClick={() => { setDetail(false); tap(undefined, ad.redirect_url); }}>{ad.action_button_text || "Open"}</Button> : undefined}>
        {video && /\.(mp4|webm|mov)(\?|$)/i.test(video)
          ? <video src={video} controls className="mb-4 w-full rounded-xl" />
          : <Img src={ad.detail_image_url ?? ad.image_url} alt="" className="mb-4 aspect-video w-full rounded-xl object-cover" />}
        {ad.detail_body && <p className="whitespace-pre-line text-sm text-ink-2">{ad.detail_body}</p>}
        {video && !/\.(mp4|webm|mov)(\?|$)/i.test(video) && <a href={video} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-medium text-primary">Watch the video</a>}
      </Modal>
    </section>
  );
}

export function FeedSections({ sections }: { sections: FeedSection[] }) {
  return (
    <div className="space-y-12">
      {visibleSections(sections).map((s, i) => {
        const key = s.key ?? `${s.type}-${i}`;
        switch (s.type) {
          case "active_bookings": return <ActiveStays key={key} section={s as FeedSection & { data: ActiveStay[] }} />;
          case "promo_carousel": return <Promos key={key} section={s as FeedSection & { data: PromoSlide[] }} />;
          case "hotel_horizontal_list": return <HotelsRow key={key} section={s as FeedSection & { data: HotelT[] }} />;
          case "ads_banner": return s.data ? <Banner key={key} ad={s.data as BannerAd} /> : null;
          default: return null;
        }
      })}
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-12">
      {[0, 1].map(r => (
        <div key={r}>
          <span className="mb-4 block h-6 w-48 rounded animate-shimmer" />
          <div className="flex gap-4 overflow-hidden">{[0, 1, 2, 3].map(i => <div key={i} className="w-[260px] shrink-0"><HotelCardSkeleton /></div>)}</div>
        </div>
      ))}
    </div>
  );
}

export function EmptyFeed() {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-surface p-10 text-center">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary"><Hotel className="h-7 w-7" /></span>
      <p className="font-semibold text-ink">Start with a search</p>
      <p className="mt-1 text-sm text-muted">Tell us where you’re going, or browse every verified hotel.</p>
      <Button className="mt-5" href="/hotels" variant="secondary">Browse hotels</Button>
    </div>
  );
}
