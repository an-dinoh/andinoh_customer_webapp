"use client";

import { useState } from "react";
import { guestBookingsApi, receiptsApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import { Button, DetailList, ErrorState, Sheet, Skeleton } from "@/components/ui";
import { DocumentDownload, Receipt as ReceiptIcon, Send } from "@/components/icons";
import { Line } from "./PriceSummary";
import { saveDownload } from "@/utils/api";
import { formatDate, formatDateTime, humanize, money } from "@/utils/format";
import type { Receipt, ReceiptSummary } from "@/types/api";

/** For a guest booking: its code and secret token (guide 7.2). */
export interface GuestAccess { code: string; token: string }

function ReceiptBody({ receipt }: { receipt: Receipt }) {
  const b = receipt.details?.booking;
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-surface-2 p-5 text-center">
        <p className="text-xs text-muted">{receipt.kind_display || humanize(receipt.kind)}</p>
        <p className={`mt-1 text-3xl font-semibold tracking-tight tabular ${receipt.kind === "booking_refund" ? "text-success" : "text-ink"}`}>{money(receipt.amount, receipt.currency)}</p>
        <p className="mt-1 text-xs text-muted">{formatDateTime(receipt.issued_at)}</p>
      </div>
      <DetailList items={[
        { label: "Receipt number", value: <span className="font-mono">{receipt.number}</span> },
        { label: "Booking", value: <span className="font-mono">{receipt.reference}</span> },
        { label: "Paid by", value: humanize(receipt.payment_method) },
        { label: "Transaction", value: receipt.transaction_reference || "—" },
        { label: "Issued to", value: receipt.recipient_name },
        { label: "Emailed", value: receipt.emailed_at ? formatDateTime(receipt.emailed_at) : "Not yet" },
      ]} />
      {b && (
        <div className="rounded-2xl border border-line p-4">
          <p className="text-sm font-semibold text-ink">{b.hotel.name}</p>
          <p className="text-xs text-muted">{b.hotel.address}</p>
          <p className="mt-2 text-sm text-ink-2">{formatDate(b.check_in_date)} – {formatDate(b.check_out_date)} · {b.nights} night{b.nights === 1 ? "" : "s"} · {b.guests} guest{b.guests === 1 ? "" : "s"}</p>
          <dl className="mt-4 space-y-2 border-t border-line pt-3">
            {b.rooms.map((r, i) => <Line key={i} label={`${r.room_type}${r.room_number && !/^tbd/i.test(r.room_number) ? ` · ${r.room_number}` : ""} · ${r.nights} night${r.nights === 1 ? "" : "s"}`} value={r.total} currency={b.currency} />)}
            {b.services.map((s, i) => <Line key={`s${i}`} label={`${s.name}${s.quantity > 1 ? ` × ${s.quantity}` : ""}`} value={s.total} currency={b.currency} />)}
            <Line label="Extras" value={b.incidentals} currency={b.currency} hideZero />
            <Line label="Taxes" value={b.taxes} currency={b.currency} muted />
            <Line label="Service fee" value={b.service_fee} currency={b.currency} muted />
            <Line label="Points" value={b.points_discount} currency={b.currency} negative hideZero />
            <div className="border-t border-line pt-2"><Line label="Total" value={b.total} currency={b.currency} strong /></div>
            <Line label="Paid" value={b.paid} currency={b.currency} />
            <Line label="Balance due" value={b.balance_due} currency={b.currency} hideZero />
          </dl>
        </div>
      )}
    </div>
  );
}

/** One receipt in a sheet, with the locked PDF and (signed in) "email it again". */
export function ReceiptSheet({ id, guest, onClose }: { id: string | null; guest?: GuestAccess; onClose: () => void }) {
  const receipt = useQuery(() => (guest ? guestBookingsApi.receipt(guest.code, guest.token, id!) : receiptsApi.get(id!)), [id, guest?.code], { enabled: !!id });
  const pdf = useMutation(async () => {
    const r = receipt.data!;
    saveDownload(guest ? await guestBookingsApi.receiptPdf(guest.code, guest.token, r.id) : await receiptsApi.pdf(r.id), `andinoh-receipt-${r.number}.pdf`);
  });
  const resend = useMutation(() => receiptsApi.resend(id!), { success: "Receipt emailed again" });
  return (
    <Sheet open={!!id} onClose={onClose} title="Receipt" description={receipt.data?.number}
      footer={receipt.data && <>
        {!guest && <Button variant="outline" icon={Send} loading={resend.busy} onClick={() => resend.run()}>Email it to me</Button>}
        <Button icon={DocumentDownload} loading={pdf.busy} onClick={() => pdf.run()}>Download PDF</Button>
      </>}>
      {receipt.error ? <ErrorState error={receipt.error} onRetry={receipt.reload} /> : receipt.data ? <ReceiptBody receipt={receipt.data} /> : <div className="space-y-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-40 w-full" /></div>}
    </Sheet>
  );
}

/** The receipts on a booking: one per online payment and refund. */
export function ReceiptList({ receipts, guest }: { receipts: ReceiptSummary[]; guest?: GuestAccess }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!receipts.length) return <p className="text-sm text-muted">Receipts appear here after each online payment or refund.</p>;
  return (
    <>
      <ul className="divide-y divide-line">
        {receipts.map(r => (
          <li key={r.id}>
            <button type="button" onClick={() => setOpen(r.id)} className="flex w-full items-center gap-3 py-3 text-left hover:text-primary">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${r.kind === "booking_refund" ? "bg-success-50 text-success" : "bg-primary-50 text-primary"}`}><ReceiptIcon className="h-[18px] w-[18px]" /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-ink">{r.kind_display || humanize(r.kind)}</span><span className="block font-mono text-xs text-muted">{r.number} · {formatDate(r.issued_at)}</span></span>
              <span className="text-sm font-semibold text-ink tabular">{money(r.amount, r.currency)}</span>
            </button>
          </li>
        ))}
      </ul>
      <ReceiptSheet id={open} guest={guest} onClose={() => setOpen(null)} />
    </>
  );
}
