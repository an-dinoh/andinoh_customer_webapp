"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { appApi, hotelsApi, recentSearchesApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import HotelCard, { HotelCardSkeleton } from "@/components/hotels/HotelCard";
import StaySearch, { whereFromParams } from "@/components/hotels/StaySearch";
import { Container } from "@/components/shell/SiteShell";
import { EmptyState, ErrorState, FilterSelect, Pagination, Segmented, Spinnerish } from "@/components/ui";
import { Clock, Hotel, Star, X } from "@/components/icons";
import { readPlan, planQuery } from "@/utils/stay";
import type { HotelFilters } from "@/types/api";

const TYPES = [
  { value: "luxury", label: "Luxury" }, { value: "boutique", label: "Boutique" }, { value: "business", label: "Business" },
  { value: "resort", label: "Resort" }, { value: "budget", label: "Budget" }, { value: "hostel", label: "Hostel" },
  { value: "motel", label: "Motel" }, { value: "bed_breakfast", label: "Bed & breakfast" },
];
const SORTS = [
  { value: "-star_rating", label: "Most stars" }, { value: "star_rating", label: "Fewest stars" }, { value: "-created_at", label: "Newest on Andinoh" },
];
const RADII = [{ value: "10", label: "10 km" }, { value: "20", label: "20 km" }, { value: "50", label: "50 km" }, { value: "100", label: "100 km" }];
const PAGE_SIZE = 20;

function Results() {
  const params = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const where = whereFromParams(params);
  const plan = readPlan(params);
  const page = Math.max(1, Number(params.get("page")) || 1);
  const stars = params.get("star_rating") ?? "";
  const type = params.get("hotel_type") ?? "";
  const ordering = params.get("ordering") ?? "";
  const radius = params.get("radius") ?? "";
  const view = params.get("view") === "grid" ? "grid" : "list";

  const filters: HotelFilters = {
    search: where.search, city_id: where.city_id, area_id: where.area_id, state_id: where.state_id,
    latitude: where.near?.latitude, longitude: where.near?.longitude, radius: where.near && radius ? Number(radius) : undefined,
    star_rating: stars ? Number(stars) : undefined, hotel_type: type || undefined,
    ordering: (ordering || undefined) as HotelFilters["ordering"], page,
  };
  const key = JSON.stringify(filters);
  const results = useQuery(() => hotelsApi.search(filters), [key]);
  const recent = useQuery(() => recentSearchesApi.list(), [isAuthenticated, key], { enabled: isAuthenticated });
  const forget = useMutation((id: number | null) => (id === null ? recentSearchesApi.clear() : recentSearchesApi.forget(id)), { onSuccess: () => void recent.reload() });

  // Usage analytics (guide 4): what people filter by; no personal data.
  useEffect(() => {
    if (!stars && !type && !ordering) return;
    void appApi.track({ event_name: "search_filters_applied", event_category: "search", event_data: { star_rating: stars || null, hotel_type: type || null, ordering: ordering || null } }).catch(() => undefined);
  }, [stars, type, ordering]);

  const set = (changes: Record<string, string>) => {
    const q = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) { if (v) q.set(k, v); else q.delete(k); }
    if (!("page" in changes)) q.delete("page");
    router.push(`/hotels?${q}`, { scroll: "page" in changes });
  };

  const stayQuery = planQuery({ ...plan, rooms: {} });
  const extra = Object.fromEntries(Object.entries({ star_rating: stars, hotel_type: type, ordering }).filter(([, v]) => v));
  const heading = where.near ? "Hotels near you" : where.label ? `Hotels in ${where.label}` : where.search ? `Results for “${where.search}”` : "All hotels";
  const count = results.data?.count ?? 0;

  return (
    <>
      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 lg:px-8">
          <StaySearch key={params.toString()} variant="bar" initialWhere={where} initialPlan={plan} extra={extra} />
        </div>
      </div>
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-ink sm:text-2xl">{heading}</h1>
            <p className="mt-1 text-sm text-muted">
              {results.loading ? "Searching…" : `${count.toLocaleString()} ${count === 1 ? "hotel" : "hotels"}`}
              {" · "}Prices for your dates show on each hotel.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect label="Stars" value={stars} allLabel="Any" onChange={v => set({ star_rating: v })}
              options={[5, 4, 3, 2, 1].map(n => ({ value: String(n), label: `${n} star${n === 1 ? "" : "s"}` }))} />
            <FilterSelect label="Type" value={type} allLabel="Any" onChange={v => set({ hotel_type: v })} options={TYPES} />
            {where.near && <FilterSelect label="Within" value={radius} allLabel="50 km" onChange={v => set({ radius: v })} options={RADII} />}
            <FilterSelect label="Sort" value={ordering} allLabel={where.near ? "Nearest" : "Recommended"} onChange={v => set({ ordering: v })} options={SORTS} />
            <div className="hidden sm:block">
              <Segmented size="sm" value={view} onChange={v => set({ view: v === "grid" ? "grid" : "" })} options={[{ value: "list", label: "List" }, { value: "grid", label: "Grid" }]} />
            </div>
          </div>
        </div>

        {isAuthenticated && (recent.data?.length ?? 0) > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted"><Clock className="h-3.5 w-3.5" />Recent</span>
            {recent.data!.slice(0, 6).map(r => {
              const q = new URLSearchParams(stayQuery);
              if (r.city_id || r.area_id || r.state_id) {
                if (r.city_id) q.set("city_id", r.city_id);
                if (r.area_id) q.set("area_id", r.area_id);
                if (r.state_id) q.set("state_id", r.state_id);
                q.set("label", r.label);
              } else q.set("search", r.query);
              return (
                <span key={r.id} className="inline-flex h-8 items-center gap-1 rounded-full border border-line bg-surface pl-3 pr-1 text-xs text-ink-2">
                  <button type="button" onClick={() => router.push(`/hotels?${q}`)} className="hover:text-primary">{r.label}</button>
                  <button type="button" onClick={() => forget.run(r.id)} aria-label={`Forget ${r.label}`} className="rounded-full p-1 text-subtle hover:bg-surface-2 hover:text-ink"><X className="h-3 w-3" /></button>
                </span>
              );
            })}
            <button type="button" onClick={() => forget.run(null)} className="text-xs font-medium text-muted hover:text-danger">Clear</button>
          </div>
        )}

        <div className="mt-6">
          {results.error ? <div className="rounded-2xl border border-line bg-surface"><ErrorState error={results.error} onRetry={results.reload} /></div>
            : results.loading ? (
              <div className={view === "grid" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                {Array.from({ length: 6 }).map((_, i) => <HotelCardSkeleton key={i} layout={view === "grid" ? "grid" : "row"} />)}
              </div>
            ) : count === 0 ? (
              <div className="rounded-2xl border border-line bg-surface">
                <EmptyState icon={Hotel} title="No hotels match this search"
                  description={stars || type ? "Try removing a filter, or search a nearby city." : "Try another city or area, or browse every verified hotel."}
                  action={<button type="button" className="text-sm font-medium text-primary" onClick={() => router.push(`/hotels?${stayQuery}`)}>See all hotels</button>} />
              </div>
            ) : (
              <>
                <div className={view === "grid" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                  {results.data!.results.map(h => <HotelCard key={h.id} hotel={h} query={stayQuery} layout={view === "grid" ? "grid" : "row"} />)}
                </div>
                <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
                  <Pagination page={page} pageSize={PAGE_SIZE} count={count} onPage={p => set({ page: String(p) })} />
                </div>
              </>
            )}
        </div>
        {stars && (
          <p className="mt-4 flex items-center gap-1 text-xs text-muted"><Star className="h-3.5 w-3.5" />Showing {stars}-star hotels only.</p>
        )}
      </Container>
    </>
  );
}

export default function HotelsPage() {
  return <Suspense fallback={<Spinnerish />}><Results /></Suspense>;
}
