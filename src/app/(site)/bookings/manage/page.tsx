"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { bookingsApi, guestBookingsApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import StayDetail, { PayBanner } from "@/components/bookings/StayDetail";
import { Container } from "@/components/shell/SiteShell";
import { Button, Callout, EmptyState, Modal, Skeleton, Spinnerish, Textarea } from "@/components/ui";
import { CheckCircle, CloseCircle, Coin, Import, Lock, UserAdd } from "@/components/icons";
import { ApiError, errorMessage } from "@/utils/api";
import { money } from "@/utils/format";
import { awaitingPayment, refundPreview } from "@/utils/bookings";
import { startPayment } from "@/utils/payments";
import type { GuestBooking } from "@/types/api";

/**
 * A booking reached with its confirmation code and secret token (guide 7.2–7.3), from the link in the
 * booking email (…/bookings/manage?code=&token=). Nothing is saved on the device: the link is the key, so
 * it stays in the address bar for refreshes and coming back from payment.
 */
function Manage() {
  const params = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const code = (params.get("code") ?? "").toUpperCase();
  const token = params.get("token");
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");

  const booking = useQuery(() => guestBookingsApi.get(code, token!), [code, token], { enabled: !!code && !!token });

  // A token that stopped working: a new link was sent, or the booking moved into an account (7.2).
  const gone = booking.error instanceof ApiError && booking.error.status === 404;

  const here = `/bookings/manage?code=${code}&token=${encodeURIComponent(token ?? "")}`;
  const pay = useMutation(() => startPayment({ kind: "guest", ref: code, back: here, label: booking.data?.hotel_name, token: token ?? undefined }));
  const cancel = useMutation(() => guestBookingsApi.cancel(code, token!, reason.trim() || undefined), {
    success: r => (Number(r.refund_amount) > 0 ? `Cancelled. ${money(r.refund_amount)} is on its way back to you.` : "Booking cancelled"),
    onSuccess: r => { setCancelling(false); booking.setData(r.booking); },
  });
  const claim = useMutation(() => bookingsApi.claim(code, token!), {
    success: "Booking added to your account",
    onSuccess: r => router.replace(`/trips/${r.booking_id}`),
  });

  if (!code || !token || gone) {
    return (
      <Container narrow>
        <div className="rounded-2xl border border-line bg-surface">
          <EmptyState icon={Lock} title={gone ? "This link no longer works" : "Open the link from your booking email"}
            description={gone ? "You may have asked for a new link, or added the booking to an account. We can email you a fresh link." : "Your booking email has a link that opens it here. Lost it? We’ll send a new one."}
            action={<Button href="/bookings/find">Find my booking</Button>} />
        </div>
      </Container>
    );
  }
  if (booking.error) return <Container narrow><Callout tone="danger">{errorMessage(booking.error)}</Callout></Container>;
  const b = booking.data;
  if (!b) return <Container className="space-y-4"><Skeleton className="h-60 w-full rounded-3xl" /><Skeleton className="h-40 w-full rounded-2xl" /></Container>;

  const toPay = awaitingPayment(b);
  const canCancel = toPay || b.status === "confirmed" || b.status === "checked_in";
  const refund = refundPreview(b.cancellation_policy, b.check_in_date, b.paid_amount);
  const actions = (
    <>
      {toPay && <Button icon={Coin} loading={pay.busy} onClick={() => pay.run()}>Pay now</Button>}
      {isAuthenticated && <Button variant="secondary" icon={Import} loading={claim.busy} onClick={() => claim.run()}>Add to my account</Button>}
      {canCancel && <Button variant="danger-ghost" icon={CloseCircle} onClick={() => setCancelling(true)}>Cancel booking</Button>}
    </>
  );
  const banner = (
    <>
      {params.has("booked") && b.status === "confirmed" && <Callout tone="success" icon={CheckCircle} title="You’re booked!">We’ve emailed {b.guest_email} your confirmation and a link back to this page.</Callout>}
      {toPay && <PayBanner booking={b} onPay={() => pay.run()} busy={pay.busy} onExpired={() => booking.reload()} />}
      {!isAuthenticated && (
        <Callout tone="gold" icon={UserAdd} title="Create an account to do more"
          action={<Button size="sm" variant="gold" href={`/register?name=${encodeURIComponent(b.guest_name)}&email=${encodeURIComponent(b.guest_email)}&from=${encodeURIComponent("/trips")}`}>Create account</Button>}>
          Chat with the hotel, tip staff, extend your stay and earn points. This booking moves in when you sign up with {b.guest_email}.
        </Callout>
      )}
    </>
  );
  return (
    <Container>
      <StayDetail booking={b as GuestBooking} actions={actions} banner={banner} guest={{ code, token }} />
      <Modal open={cancelling} onClose={() => setCancelling(false)} size="sm" title="Cancel this booking?"
        footer={<><Button variant="outline" onClick={() => setCancelling(false)}>Keep booking</Button><Button variant="danger" loading={cancel.busy} onClick={() => cancel.run()}>Cancel booking</Button></>}>
        <div className="space-y-4">
          <Callout tone={Number(b.paid_amount) > 0 && refund.percent ? "success" : "info"}>
            {Number(b.paid_amount) > 0 ? `You’ll get ${refund.percent}% of what you paid back: ${money(refund.amount, b.currency)}.` : "Nothing has been paid, so cancelling just releases the rooms."}
          </Callout>
          <Textarea label="Reason (optional)" rows={2} value={reason} onChange={e => setReason(e.target.value)} />
        </div>
      </Modal>
    </Container>
  );
}

export default function ManageBookingPage() {
  return <Suspense fallback={<Spinnerish />}><Manage /></Suspense>;
}
