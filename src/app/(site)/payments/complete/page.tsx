"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Container } from "@/components/shell/SiteShell";
import { Button, Spinnerish } from "@/components/ui";
import { CheckCircle, Clock, CloseCircle, Refresh } from "@/components/icons";
import { forgetPayment, pendingPayment, startPayment, verifyPayment, type PaymentKind, type VerifyOutcome } from "@/utils/payments";
import { errorMessage } from "@/utils/api";

const KINDS: PaymentKind[] = ["booking", "guest", "tip", "pickup"];
const POLL_EVERY = 10_000;
const POLL_FOR = 120_000;

function backFor(kind: PaymentKind, ref: string): string {
  switch (kind) {
    case "booking": return `/trips/${ref}`;
    case "guest": return `/bookings/manage?code=${encodeURIComponent(ref)}`;
    case "pickup": return `/pickups/${encodeURIComponent(ref)}`;
    default: return "/account/tips";
  }
}

/**
 * Where Flutterwave sends the payer back (guide 8). Only the backend's verify answer counts: paid,
 * still clearing (bank transfer or USSD: checked every 10 s for 2 minutes), or not applied with a reason.
 */
function Complete() {
  const params = useSearchParams();
  const txRef = params.get("tx_ref");
  const saved = pendingPayment(txRef);
  const kind = (KINDS.includes(params.get("kind") as PaymentKind) ? params.get("kind") : saved?.kind) as PaymentKind | undefined;
  const ref = params.get("ref") ?? saved?.ref ?? "";
  const transactionId = params.get("transaction_id");
  const status = params.get("status");
  const back = saved?.back ?? (kind ? backFor(kind, ref) : "/trips");

  // Nothing to verify: no idea what was paid, or the payer closed checkout without paying.
  const early: VerifyOutcome | null = !kind || !ref
    ? { state: "failed", message: "We couldn’t tell which payment this was. Check your trips; if it went through, it shows there within a few minutes." }
    : status === "cancelled" && !transactionId ? { state: "failed", message: "You cancelled the payment, so nothing was charged.", code: "cancelled" } : null;
  const [verified, setVerified] = useState<VerifyOutcome | null>(null);
  const [retried, setRetried] = useState<VerifyOutcome | null>(null);
  const [retrying, setRetrying] = useState(false);
  const outcome = retried ?? early ?? verified;

  useEffect(() => {
    if (early || !kind) return;
    const ids = transactionId ? { transaction_id: transactionId } : txRef ? { tx_ref: txRef } : {};
    const begun = Date.now();
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    // Verifying twice is harmless: the backend applies a payment once.
    const check = async () => {
      const r = await verifyPayment(kind, ref, ids);
      if (stopped) return;
      setVerified(r);
      if (r.state === "processing" && Date.now() - begun < POLL_FOR) timer = setTimeout(check, POLL_EVERY);
      if (r.state === "paid") forgetPayment();
    };
    void check();
    return () => { stopped = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `early` is derived from these
  }, [kind, ref, status, transactionId, txRef]);

  const retry = async () => {
    if (!kind || kind === "tip") return;
    setRetrying(true);
    try {
      const r = await startPayment({ kind, ref, back, label: saved?.label });
      if (r === "already_paid") setRetried({ state: "paid", message: "This was already paid." });
    } catch (e) {
      setRetried({ state: "failed", message: errorMessage(e) });
    } finally {
      setRetrying(false);
    }
  };

  if (!outcome) return <Spinnerish label="Confirming your payment…" />;
  const view = {
    paid: { icon: CheckCircle, tone: "bg-success-50 text-success", title: "Payment received", text: saved?.label ? `You’re all set for ${saved.label}. We’ve emailed your receipt.` : "We’ve emailed your receipt." },
    processing: { icon: Clock, tone: "bg-warning-50 text-warning", title: "Payment processing", text: `${outcome.message} We’ll notify you as soon as it clears; you can leave this page.` },
    failed: { icon: CloseCircle, tone: "bg-danger-50 text-danger", title: outcome.code === "cancelled" ? "Payment cancelled" : "Payment not completed", text: outcome.message },
  }[outcome.state];
  const canRetry = outcome.state === "failed" && kind && kind !== "tip" && !["already_paid", "booking_cancelled", "reference_mismatch", "duplicate_transaction"].includes(outcome.code ?? "");

  return (
    <Container narrow>
      <div className="mx-auto max-w-md rounded-3xl border border-line bg-surface p-8 text-center">
        <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${view.tone}`}><view.icon className="h-8 w-8" /></span>
        <h1 className="mt-5 text-xl font-semibold text-ink">{view.title}</h1>
        <p className="mt-2 text-sm text-muted">{view.text}</p>
        <div className="mt-7 flex flex-col gap-2">
          {canRetry && <Button icon={Refresh} loading={retrying} onClick={retry}>Try again</Button>}
          <Button variant={canRetry ? "outline" : "primary"} href={back}>{outcome.state === "paid" ? "View details" : "Back"}</Button>
        </div>
      </div>
    </Container>
  );
}

export default function Page() {
  return <Suspense fallback={<Spinnerish />}><Complete /></Suspense>;
}
