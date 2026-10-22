"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { complaintsApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { Avatar, Button, Callout, Checkbox, DetailList, ErrorState, Img, Modal, PageHeader, Panel, RatingInput, Skeleton, StatusPill, Textarea } from "@/components/ui";
import { CheckCircle, Send, Star } from "@/components/icons";
import { formatDate, formatDateTime, money } from "@/utils/format";

/** One complaint: the replies, a way to answer, "it's sorted" and rating the resolution (guide 10.4). */
export default function ComplaintPage() {
  const { id } = useParams<{ id: string }>();
  const complaint = useQuery(() => complaintsApi.get(id), [id]);
  const [reply, setReply] = useState("");
  const [rating, setRating] = useState({ open: false, rating: 0, is_satisfied: true, feedback: "" });
  const respond = useMutation(() => complaintsApi.respond(id, reply.trim()), { onSuccess: () => { setReply(""); void complaint.reload(); } });
  const resolve = useMutation(() => complaintsApi.resolve(id), { success: "Marked as resolved", onSuccess: () => void complaint.reload() });
  const rate = useMutation(() => complaintsApi.rate(id, { rating: rating.rating, is_satisfied: rating.is_satisfied, ...(rating.feedback.trim() ? { feedback: rating.feedback.trim() } : {}) }), {
    success: "Thanks for the feedback", onSuccess: () => { setRating(r => ({ ...r, open: false })); void complaint.reload(); },
  });
  const c = complaint.data;
  if (complaint.error) return <Container narrow><ErrorState error={complaint.error} onRetry={complaint.reload} /></Container>;
  if (!c) return <Container narrow><Skeleton className="h-48 w-full rounded-2xl" /></Container>;
  const closed = c.status === "CLOSED";
  return (
    <Container narrow>
      <PageHeader crumbs={[{ label: "Complaints", href: "/account/complaints" }, { label: c.complaint_id }]} title={c.subject}
        meta={<><StatusPill status={c.status} label={c.status_display} /><span className="text-xs text-muted">{c.complaint_type_display} · reported {formatDate(c.created_at)}</span></>}
        actions={<>
          {!["RESOLVED", "CLOSED"].includes(c.status) && <Button variant="outline" icon={CheckCircle} loading={resolve.busy} onClick={() => resolve.run()}>It’s sorted</Button>}
          {c.status === "RESOLVED" && <Button icon={Star} onClick={() => setRating(r => ({ ...r, open: true }))}>Rate the resolution</Button>}
        </>} />
      <div className="space-y-6">
        <Panel title="What happened">
          <p className="whitespace-pre-line text-sm text-ink-2">{c.description}</p>
          <div className="mt-4"><DetailList cols={3} items={[
            { label: "When", value: c.incident_date ? formatDate(c.incident_date) : "—" },
            { label: "Where", value: c.incident_location || "—" },
            { label: "Hotel", value: c.hotel_name || "—" },
          ]} /></div>
          {c.attachments.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{c.attachments.map(a => <a key={a} href={a} target="_blank" rel="noreferrer"><Img src={a} className="h-20 w-24 rounded-lg object-cover" /></a>)}</div>}
        </Panel>
        {(c.resolution_description || c.compensation_offered) && (
          <Callout tone="success" title="How it was resolved">
            {c.resolution_description}{c.compensation_offered && ` Compensation: ${c.compensation_offered}${c.compensation_amount ? ` (${money(c.compensation_amount)})` : ""}.`}
          </Callout>
        )}
        {c.customer_rating && <Callout tone="info">You rated the resolution {c.customer_rating}/5{c.customer_feedback ? `: “${c.customer_feedback}”` : "."}</Callout>}
        <Panel title="Conversation" description={c.responses.length ? undefined : "Replies from Andinoh and the hotel show here."}>
          <ul className="space-y-4">{c.responses.filter(r => !r.is_internal_note).map(r => (
            <li key={r.id} className="flex gap-3">
              <Avatar name={r.responder_name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm"><span className="font-semibold text-ink">{r.responder_name}</span> <span className="text-xs text-muted">· {r.responder_role} · {formatDateTime(r.created_at)}</span></p>
                <p className="mt-0.5 whitespace-pre-line text-sm text-ink-2">{r.message}</p>
              </div>
            </li>
          ))}</ul>
          {!closed && (
            <form className="mt-5 flex items-end gap-2 border-t border-line pt-4" onSubmit={e => { e.preventDefault(); if (reply.trim()) void respond.run(); }}>
              <Textarea className="flex-1" rows={2} placeholder="Add more detail or reply…" value={reply} onChange={e => setReply(e.target.value)} aria-label="Reply" />
              <Button type="submit" icon={Send} loading={respond.busy} disabled={!reply.trim()}>Send</Button>
            </form>
          )}
        </Panel>
      </div>
      <Modal open={rating.open} onClose={() => setRating(r => ({ ...r, open: false }))} title="How did we do?" size="sm"
        footer={<><Button variant="outline" onClick={() => setRating(r => ({ ...r, open: false }))}>Cancel</Button><Button loading={rate.busy} disabled={!rating.rating} onClick={() => rate.run()}>Send rating</Button></>}>
        <div className="space-y-4">
          <RatingInput label="The resolution" value={rating.rating} onChange={v => setRating(r => ({ ...r, rating: v }))} />
          <Checkbox checked={rating.is_satisfied} onChange={v => setRating(r => ({ ...r, is_satisfied: v }))} label="I’m happy with how it was handled" />
          <Textarea label="Anything to add? (optional)" rows={2} value={rating.feedback} onChange={e => setRating(r => ({ ...r, feedback: e.target.value }))} />
          {rate.error && <Callout tone="danger">{rate.error.message}</Callout>}
        </div>
      </Modal>
    </Container>
  );
}
