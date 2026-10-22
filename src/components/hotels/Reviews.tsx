"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { hotelsApi, reviewsApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import { Avatar, Button, EmptyState, Img, Skeleton } from "@/components/ui";
import { Like, MessageText, Star } from "@/components/icons";
import { formatDate, humanize } from "@/utils/format";
import type { Review } from "@/types/api";

const CATEGORIES = ["cleanliness", "service", "location", "value", "amenities"] as const;

function ReviewItem({ review }: { review: Review }) {
  const { isAuthenticated, user } = useAuth();
  const [voted, setVoted] = useState(false);
  const vote = useMutation(() => reviewsApi.vote(review.id, true), { success: "Thanks for the feedback", onSuccess: () => setVoted(true) });
  const name = review.is_anonymous ? "Anonymous" : review.customer_name || "Guest";
  const mine = user && review.customer === user.id;
  return (
    <article className="border-b border-line py-5 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={name} />
          <div>
            <p className="text-sm font-semibold text-ink">{name}</p>
            <p className="text-xs text-muted">{formatDate(review.created_at)}{review.trip_type && ` · ${humanize(review.trip_type)}`}{review.traveled_with && ` with ${review.traveled_with}`}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary-50 px-2 py-0.5 text-xs font-semibold text-gold-text"><Star variant="bold" className="h-3.5 w-3.5" />{review.overall_rating}</span>
      </div>
      {review.title && <h4 className="mt-3 text-sm font-semibold text-ink">{review.title}</h4>}
      <p className="mt-1 whitespace-pre-line text-sm text-ink-2">{review.review_text}</p>
      {(review.pros || review.cons) && (
        <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
          {review.pros && <p className="text-success"><span className="font-medium">Liked:</span> <span className="text-ink-2">{review.pros}</span></p>}
          {review.cons && <p className="text-warning"><span className="font-medium">Could be better:</span> <span className="text-ink-2">{review.cons}</span></p>}
        </div>
      )}
      {review.images.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">{review.images.map(i => <Img key={i.id} src={i.image} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" />)}</div>
      )}
      {review.hotel_response && (
        <div className="mt-3 rounded-xl bg-surface-2 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink"><MessageText className="h-4 w-4 text-primary" />The hotel replied{review.hotel_response_date && <span className="font-normal text-muted"> · {formatDate(review.hotel_response_date)}</span>}</p>
          <p className="mt-1 text-sm text-ink-2">{review.hotel_response}</p>
        </div>
      )}
      {isAuthenticated && !mine && (
        <button type="button" disabled={voted || vote.busy} onClick={() => vote.run()}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-primary disabled:text-success">
          <Like className="h-4 w-4" />{voted ? "Marked helpful" : `Helpful${review.helpful_votes ? ` (${review.helpful_votes})` : ""}`}
        </button>
      )}
    </article>
  );
}

/** Ratings summary and the approved reviews, newest first (guide 5.5). */
export default function Reviews({ hotelId }: { hotelId: string }) {
  const stats = useQuery(() => hotelsApi.reviewStats(hotelId), [hotelId]);
  const first = useQuery(() => hotelsApi.reviews(hotelId), [hotelId]);
  const [more, setMore] = useState<{ reviews: Review[]; next: number; hasMore: boolean } | null>(null);
  const loadMore = useMutation(async () => {
    const page = more?.next ?? 2;
    const r = await hotelsApi.reviews(hotelId, { page });
    setMore(m => ({ reviews: [...(m?.reviews ?? []), ...r.results], next: page + 1, hasMore: !!r.next }));
  });
  const shown = [...(first.data?.results ?? []), ...(more?.reviews ?? [])];
  const canLoadMore = more ? more.hasMore : !!first.data?.next;
  const s = stats.data;
  const total = s?.total_reviews ?? 0;

  if (stats.loading && first.loading) return <div className="space-y-3"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>;
  if (!total && !shown.length) return <EmptyState compact icon={Star} title="No reviews yet" description="Guests can review after they check out." />;

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <div>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-semibold tracking-tight text-ink tabular">{s?.average_rating ? s.average_rating.toFixed(1) : "—"}</span>
          <span className="pb-1 text-sm text-muted">out of 5 · {total} review{total === 1 ? "" : "s"}</span>
        </div>
        <div className="mt-4 space-y-1.5">
          {[5, 4, 3, 2, 1].map(n => {
            const c = s?.rating_distribution?.[`${n}_star` as keyof NonNullable<typeof s>["rating_distribution"]] ?? 0;
            return (
              <div key={n} className="flex items-center gap-2 text-xs text-muted">
                <span className="w-3 tabular">{n}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"><span className="block h-full rounded-full bg-secondary" style={{ width: total ? `${(c / total) * 100}%` : 0 }} /></span>
                <span className="w-6 text-right tabular">{c}</span>
              </div>
            );
          })}
        </div>
        {s?.category_averages && (
          <dl className="mt-5 space-y-2">
            {CATEGORIES.filter(c => s.category_averages?.[c] != null).map(c => (
              <div key={c} className="flex items-center justify-between text-sm"><dt className="text-ink-2">{humanize(c)}</dt><dd className="font-semibold text-ink tabular">{Number(s.category_averages![c]).toFixed(1)}</dd></div>
            ))}
          </dl>
        )}
      </div>
      <div>
        {shown.map(r => <ReviewItem key={r.id} review={r} />)}
        {canLoadMore && <Button variant="outline" loading={loadMore.busy} onClick={() => loadMore.run()}>Show more reviews</Button>}
      </div>
    </div>
  );
}
