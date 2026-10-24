import { ApiError } from './api';
import { bookingsApi, guestBookingsApi, tipsApi } from '@/services/api';
import type { AlreadyPaid, PaymentStart, VerifyIds } from '@/types/api';

/**
 * Paying on the web (Customer guide 8). The backend decides the amount and reference; the app sends the
 * person to Flutterwave's hosted checkout (`data.link`) with a return address on this site, and on the
 * way back asks the backend to verify. Only the verify answer says whether the payment counted.
 *
 * The return address names what was paid (`kind`, `ref`), and the same is kept in sessionStorage
 * against the `tx_ref`, so the backend's default return page (FRONTEND_URL/payments/complete) works too.
 */

/** Leaves for checkout (a seam for tests: jsdom can't navigate). */
export const nav = { go: (url: string) => window.location.assign(url) };

export type PaymentKind = 'booking' | 'guest' | 'tip';

export interface PendingPayment {
  kind: PaymentKind;
  /** Booking id, guest confirmation code or tip id. */
  ref: string;
  /** Where "Done" goes afterwards. */
  back: string;
  /** What was paid for, for the result screen ("Palmview Resort & Spa"). */
  label?: string;
  tx_ref?: string;
  /**
   * A guest booking's secret token, needed to pay and to verify. It rides with this one payment (this
   * tab's sessionStorage) and is forgotten once verified; bookings themselves aren't kept on the device.
   */
  token?: string;
}

const KEY = 'andinoh-customer:payment';

export function paymentReturnUrl(p: Pick<PendingPayment, 'kind' | 'ref'>): string {
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  return `${origin}/payments/complete?kind=${p.kind}&ref=${encodeURIComponent(p.ref)}`;
}

export function rememberPayment(p: PendingPayment): void {
  try { sessionStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode: the URL still carries it */ }
}

/** The payment started from this tab, if its reference matches (or none is given). */
export function pendingPayment(tx_ref?: string | null): PendingPayment | null {
  try {
    const p = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as PendingPayment | null;
    if (!p) return null;
    return !tx_ref || !p.tx_ref || p.tx_ref === tx_ref ? p : null;
  } catch {
    return null;
  }
}

export function forgetPayment(): void {
  try { sessionStorage.removeItem(KEY); } catch { /* nothing to forget */ }
}

export const isAlreadyPaid = (r: PaymentStart | AlreadyPaid): r is AlreadyPaid => r.status === 'already_paid';

interface FlutterwaveInline {
  (config: Record<string, unknown> & { callback: (r: { transaction_id?: number | string; tx_ref?: string; status?: string }) => void; onclose: () => void }): void;
}

function loadInlineCheckout(): Promise<FlutterwaveInline> {
  const w = window as unknown as { FlutterwaveCheckout?: FlutterwaveInline };
  if (w.FlutterwaveCheckout) return Promise.resolve(w.FlutterwaveCheckout);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.flutterwave.com/v3.js';
    s.async = true;
    s.onload = () => (w.FlutterwaveCheckout ? resolve(w.FlutterwaveCheckout) : reject(new Error('Payments couldn’t load. Try again.')));
    s.onerror = () => reject(new Error('Payments couldn’t load. Check your connection and try again.'));
    document.head.appendChild(s);
  });
}

/**
 * Opens checkout for a started payment: the hosted page when there's a link, otherwise Flutterwave's
 * inline checkout with the backend's `checkout` config exactly as given. Either way the person lands on
 * /payments/complete, which verifies.
 */
export async function openCheckout(start: PaymentStart, pending: PendingPayment): Promise<void> {
  rememberPayment({ ...pending, tx_ref: start.checkout?.tx_ref ?? start.data?.tx_ref });
  const back = paymentReturnUrl(pending);
  if (start.data?.link) {
    nav.go(start.data.link);
    return;
  }
  const checkout = await loadInlineCheckout();
  const c = start.checkout;
  checkout({
    public_key: c.public_key, tx_ref: c.tx_ref, amount: c.amount, currency: c.currency, payment_options: c.payment_options,
    customer: { email: c.customer.email, name: c.customer.name, phone_number: c.customer.phonenumber },
    customizations: c.customizations, meta: c.meta,
    callback: (r) => {
      const q = new URLSearchParams({ status: r.status ?? '', tx_ref: r.tx_ref ?? c.tx_ref });
      if (r.transaction_id) q.set('transaction_id', String(r.transaction_id));
      nav.go(`${back}&${q}`);
    },
    onclose: () => { /* closing without paying leaves the person where they were */ },
  });
}

export type VerifyState = 'paid' | 'processing' | 'failed';

export interface VerifyOutcome {
  state: VerifyState;
  message: string;
  /** The server's code for a failure (guide 6.4), e.g. amount_mismatch. */
  code?: string;
}

/** What each verify failure means for the person's money (guide 6.4). */
const FAILURES: Record<string, string> = {
  payment_failed: 'The payment didn’t go through and nothing was charged. You can try again.',
  amount_mismatch: 'Less than the amount due was paid. It’s being refunded automatically; please start a new payment.',
  currency_mismatch: 'The payment was in the wrong currency. It’s being refunded automatically.',
  already_paid: 'This was already paid. The second charge is being refunded automatically.',
  booking_cancelled: 'The hold expired before the payment arrived, so the booking was cancelled. Your money is being refunded; please book again.',
  reference_mismatch: 'That payment belongs to something else, so it wasn’t applied here.',
  duplicate_transaction: 'That payment was already used, so it wasn’t applied again.',
  extension_unavailable: 'The extra nights were taken while you paid. Your money is being refunded automatically.',
};

export function failureMessage(err: unknown): { message: string; code?: string } {
  if (err instanceof ApiError) return { message: FAILURES[err.code] ?? err.message, code: err.code };
  return { message: err instanceof Error ? err.message : 'We couldn’t confirm the payment.' };
}

/** Asks the backend whether the payment counted, for any kind of payment. */
export async function verifyPayment(kind: PaymentKind, ref: string, ids: VerifyIds, token?: string): Promise<VerifyOutcome> {
  try {
    let status: string | undefined;
    let message: string | undefined;
    if (kind === 'booking') ({ status, message } = await bookingsApi.verifyPayment(ref, ids));
    else if (kind === 'tip') ({ status, message } = await tipsApi.verifyPayment(ref, ids));
    else {
      if (!token) return { state: 'failed', message: 'Open the link from your booking email to see whether this payment went through.' };
      ({ status, message } = await guestBookingsApi.verifyPayment(ref, token, ids));
    }
    if (status === 'processing') return { state: 'processing', message: message ?? 'Your payment is still clearing.' };
    return { state: 'paid', message: 'Payment received.' };
  } catch (err) {
    return { state: 'failed', ...failureMessage(err) };
  }
}

/**
 * Starts (or restarts) paying for something and sends the person to checkout. Each call is a new attempt
 * with a new reference (guide 6.4). Resolves 'already_paid' when there's nothing left to pay.
 */
export async function startPayment(p: PendingPayment): Promise<'redirected' | 'already_paid'> {
  const back = paymentReturnUrl(p);
  let start: PaymentStart | AlreadyPaid;
  if (p.kind === 'booking') start = await bookingsApi.pay(p.ref, back);
  else if (p.kind === 'guest') {
    if (!p.token) throw new Error('Open the link from your booking email to pay for this booking.');
    start = await guestBookingsApi.pay(p.ref, p.token, back);
  } else throw new Error('Tips are paid when they’re created.');
  if (isAlreadyPaid(start)) return 'already_paid';
  await openCheckout(start, p);
  return 'redirected';
}
