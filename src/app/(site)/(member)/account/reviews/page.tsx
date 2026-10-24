"use client";

import Link from "next/link";
import { useState } from "react";
import { reviewsApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { Button, ConfirmDialog, EmptyState, ErrorState, Img, Input, PageHeader, RatingInput, Sheet, Skeleton, Textarea, whenOpen } from "@/components/ui";
import { Edit, MessageText, Star, Trash } from "@/components/icons";
import { formatDate } from "@/utils/format";
import type { Review } from "@/types/api";

function EditBody({ open, review, onClose, onSaved }: { open: boolean; review: Review; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ overall_rating: review.overall_rating, title: review.title, review_text: review.review_text });
  const save = useMutation(() => reviewsApi.update(review.id, form), { success: "Review updated", onSuccess: () => { onClose(); onSaved(); } });
  return (
    <Sheet open={open} onClose={onClose} title={`Edit your review of ${review.hotel_name}`}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={save.busy} disabled={form.review_text.trim().length < 10} onClick={() => save.run()}>Save</Button></>}>
      <div className="space-y-4">
        <RatingInput label="Overall" value={form.overall_rating} onChange={v => setForm(f => ({ ...f, overall_rating: v }))} />
        <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <Textarea label="Review" rows={6} value={form.review_text} onChange={e => setForm(f => ({ ...f, review_text: e.target.value }))} error={save.fieldErrors.review_text} />
      </div>
    </Sheet>
  );
}
const EditSheet = whenOpen(EditBody);

/** The reviews I've written (guide 11.1): edit the words and ratings, or remove one. */
export default function MyReviewsPage() {
  const list = useQuery(() => reviewsApi.mine(), []);
  const [editing, setEditing] = useState<Review | null>(null);
  const [removing, setRemoving] = useState<Review | null>(null);
  const remove = useMutation((id: number) => reviewsApi.remove(id), { success: "Review removed", onSuccess: () => { setRemoving(null); void list.reload(); } });
  const rows = list.data?.results ?? [];
  return (
    <Container narrow>
      <PageHeader crumbs={[{ label: "Account", href: "/account" }, { label: "Reviews" }]} title="My reviews" description="Review a stay from its booking after you check out." />
      {list.error ? <ErrorState error={list.error} onRetry={list.reload} /> : list.loading ? <Skeleton className="h-32 w-full rounded-2xl" /> : rows.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface"><EmptyState icon={Star} title="No reviews yet" description="After a stay, open it in My trips and tap “Write a review”." action={<Button variant="secondary" href="/trips?tab=past">Past trips</Button>} /></div>
      ) : (
        <ul className="space-y-3">{rows.map(r => (
          <li key={r.id} className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                {r.hotel_id ? <Link href={`/hotels/${r.hotel_id}`} className="text-sm font-semibold text-ink hover:text-primary">{r.hotel_name}</Link> : <p className="text-sm font-semibold text-ink">{r.hotel_name}</p>}
                <p className="text-xs text-muted">{formatDate(r.created_at)}{r.points_awarded ? ` · ${r.points_awarded} points earned` : ""}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary-50 px-2 py-0.5 text-xs font-semibold text-gold-text"><Star variant="bold" className="h-3.5 w-3.5" />{r.overall_rating}</span>
            </div>
            {r.title && <p className="mt-3 text-sm font-semibold text-ink">{r.title}</p>}
            <p className="mt-1 text-sm text-ink-2">{r.review_text}</p>
            {r.images.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{r.images.map(i => <Img key={i.id} src={i.image} className="h-16 w-20 rounded-lg object-cover" />)}</div>}
            {r.hotel_response && <div className="mt-3 rounded-xl bg-surface-2 p-3 text-sm"><p className="flex items-center gap-1.5 text-xs font-semibold text-ink"><MessageText className="h-4 w-4 text-primary" />The hotel replied</p><p className="mt-1 text-ink-2">{r.hotel_response}</p></div>}
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" icon={Edit} onClick={() => setEditing(r)}>Edit</Button>
              <Button size="sm" variant="danger-ghost" icon={Trash} onClick={() => setRemoving(r)}>Remove</Button>
            </div>
          </li>
        ))}</ul>
      )}
      {editing && <EditSheet open review={editing} onClose={() => setEditing(null)} onSaved={list.reload} />}
      <ConfirmDialog open={!!removing} onClose={() => setRemoving(null)} title="Remove this review?" description="It disappears from the hotel’s page." confirmLabel="Remove" busy={remove.busy} onConfirm={() => removing && remove.run(removing.id)} />
    </Container>
  );
}
