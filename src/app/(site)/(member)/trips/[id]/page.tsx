"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLiveReload } from "@/contexts/LiveContext";
import { webSocketService } from "@/services/websocket.service";
import { bookingsApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import StayDetail, { PayBanner } from "@/components/bookings/StayDetail";
import { CancelDialog, ChatStartModal, ComplaintSheet, ExtendSheet, ReviewSheet, TipSheet } from "@/components/bookings/StaySheets";
import { Container } from "@/components/shell/SiteShell";
import { Button, Callout, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { CalendarAdd, Car, CheckCircle, CloseCircle, Coin, Messages, Star, Warning } from "@/components/icons";
import { errorMessage } from "@/utils/api";
import { formatDate, money } from "@/utils/format";
import { isFlight, stayActions } from "@/utils/bookings";
import { startPayment } from "@/utils/payments";
import type { HotelBooking } from "@/types/api";

type Open = "cancel" | "extend" | "tip" | "chat" | "complaint" | "review" | null;

function Stay({ booking, reload }: { booking: HotelBooking; reload: () => void }) {
  const params = useSearchParams();
  const [open, setOpen] = useState<Open>(null);
  const a = stayActions(booking);
  const pay = useMutation(async () => {
    const r = await startPayment({ kind: "booking", ref: booking.id, back: `/trips/${booking.id}`, label: booking.hotel_name });
    if (r === "already_paid") reload();
  });
  const close = () => setOpen(null);

  const actions = (
    <>
      {a.pay && <Button icon={Coin} loading={pay.busy} onClick={() => pay.run()}>Pay now</Button>}
      {a.payBalance && <Button icon={Coin} loading={pay.busy} onClick={() => pay.run()}>Pay balance · {money(booking.balance_due, booking.currency)}</Button>}
      {a.chat && <Button variant="secondary" icon={Messages} onClick={() => setOpen("chat")}>Message the hotel</Button>}
      {a.extend && <Button variant="outline" icon={CalendarAdd} onClick={() => setOpen("extend")}>Extend stay</Button>}
      {a.pickup && <Button variant="outline" icon={Car} href={`/pickups/new?booking=${booking.id}`}>Book a pickup</Button>}
      {a.tip && <Button variant="outline" icon={Coin} onClick={() => setOpen("tip")}>Tip staff</Button>}
      {a.review && <Button icon={Star} onClick={() => setOpen("review")}>Write a review</Button>}
      {a.complaint && <Button variant="ghost" icon={Warning} onClick={() => setOpen("complaint")}>Report a problem</Button>}
      {a.cancel && <Button variant="danger-ghost" icon={CloseCircle} onClick={() => setOpen("cancel")}>Cancel booking</Button>}
    </>
  );
  const banner = (
    <>
      {params.has("booked") && booking.status === "confirmed" && <Callout tone="success" icon={CheckCircle} title="You’re booked!">We’ve emailed your confirmation and receipt. See you on {formatDate(booking.check_in_date)}.</Callout>}
      {a.pay && <PayBanner booking={booking} onPay={() => pay.run()} busy={pay.busy} onExpired={reload} />}
      {pay.error && <Callout tone="danger">{errorMessage(pay.error)}</Callout>}
    </>
  );
  return (
    <>
      <StayDetail booking={booking} actions={actions} banner={banner} />
      <CancelDialog open={open === "cancel"} onClose={close} booking={booking} onDone={reload} />
      <ExtendSheet open={open === "extend"} onClose={close} booking={booking} onDone={reload} />
      <TipSheet open={open === "tip"} onClose={close} booking={booking} onDone={reload} />
      <ChatStartModal open={open === "chat"} onClose={close} booking={booking} onDone={reload} />
      <ComplaintSheet open={open === "complaint"} onClose={close} booking={booking} onDone={() => reload()} />
      <ReviewSheet open={open === "review"} onClose={close} booking={booking} onDone={reload} />
    </>
  );
}

export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const trip = useQuery(() => bookingsApi.get(id), [id]);
  // Live: a bank transfer clearing, a check-in, a cancellation by the hotel (guide 12.4).
  useEffect(() => {
    webSocketService.subscribe("subscribe_booking", id);
    return () => webSocketService.unsubscribe("subscribe_booking", id);
  }, [id]);
  useLiveReload(["booking_status_update"], trip.reload, e => e.message.booking_id === id);

  return (
    <Container>
      <nav className="mb-4 text-xs text-muted"><Link href="/trips" className="hover:text-primary">← My trips</Link></nav>
      {trip.error ? <div className="rounded-2xl border border-line bg-surface"><ErrorState error={trip.error} onRetry={trip.reload} /></div>
        : !trip.data ? <div className="space-y-4"><Skeleton className="h-60 w-full rounded-3xl" /><Skeleton className="h-40 w-full rounded-2xl" /></div>
          : isFlight(trip.data) ? <div className="rounded-2xl border border-line bg-surface"><EmptyState title="This booking isn’t a hotel stay" description="Only hotel stays can be managed here." action={<Button href="/trips">My trips</Button>} /></div>
            : <Stay booking={trip.data} reload={trip.reload} />}
    </Container>
  );
}
