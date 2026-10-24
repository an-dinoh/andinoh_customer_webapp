import { parseDate, toNumber, todayISO, nightsBetween } from './format';
import type { AnyBooking, BookingPayment, CancellationPolicy, FlightBooking, HotelBooking, Money } from '@/types/api';
import type { Tone } from '@/components/ui/Display';

/**
 * What a booking's status means to the guest and what they can do with it (Customer guide 9.1), and
 * the refund they'd get for cancelling (9.3).
 */

export const isFlight = (b: AnyBooking): b is FlightBooking => b.booking_type === 'flight';
export const isHotel = (b: AnyBooking): b is HotelBooking => b.booking_type !== 'flight';

const HOTEL_LABELS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Awaiting payment', tone: 'warning' },
  hold: { label: 'Awaiting payment', tone: 'warning' },
  confirmed: { label: 'Confirmed', tone: 'primary' },
  checked_in: { label: 'Checked in', tone: 'success' },
  checked_out: { label: 'Completed', tone: 'neutral' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  no_show: { label: 'No-show', tone: 'danger' },
};

const FLIGHT_LABELS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Awaiting payment', tone: 'warning' },
  confirmed: { label: 'Confirmed', tone: 'primary' },
  failed: { label: 'Failed', tone: 'danger' },
  cancellation_requested: { label: 'Cancellation requested', tone: 'violet' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  completed: { label: 'Completed', tone: 'neutral' },
};

/** The guest-facing label and tone for a booking's status; unknown values show as plain text. */
export function statusInfo(status: string, kind: 'hotel' | 'flight' = 'hotel'): { label: string; tone: Tone } {
  const known = (kind === 'flight' ? FLIGHT_LABELS : HOTEL_LABELS)[status];
  return known ?? { label: status.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()), tone: 'neutral' };
}

/** Pending with a hold that hasn't run out: the guest can still pay. */
export function awaitingPayment(b: Pick<HotelBooking, 'status' | 'hold_expires_at'>, now = Date.now()): boolean {
  if (b.status !== 'pending' && b.status !== 'hold') return false;
  const until = parseDate(b.hold_expires_at)?.getTime();
  return until === undefined || until > now;
}

/** Milliseconds left on the room hold (0 once it has run out). */
export function holdLeft(holdExpiresAt: string | null | undefined, now = Date.now()): number {
  const until = parseDate(holdExpiresAt)?.getTime();
  return until ? Math.max(0, until - now) : 0;
}

/** "29:41" for a countdown. */
export function clock(ms: number): string {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export interface StayActions {
  pay: boolean;
  payBalance: boolean;
  cancel: boolean;
  extend: boolean;
  chat: boolean;
  tip: boolean;
  complaint: boolean;
  review: boolean;
}

/** The actions table in guide 9.1. */
export function stayActions(b: HotelBooking, now = Date.now()): StayActions {
  const s = b.status;
  const balance = toNumber(b.balance_due) > 0;
  return {
    pay: awaitingPayment(b, now),
    payBalance: s === 'confirmed' && balance && !b.pay_at_hotel,
    cancel: s === 'confirmed' || s === 'checked_in' || awaitingPayment(b, now),
    extend: s === 'confirmed' || s === 'checked_in',
    chat: s === 'checked_in' && (b.pay_at_hotel || toNumber(b.paid_amount) > 0),
    tip: s === 'checked_in',
    complaint: s === 'checked_in' || s === 'checked_out',
    review: s === 'checked_out',
  };
}

/** Whole days from today (the guest's calendar) to check-in; negative once it has passed. */
export function daysBeforeCheckIn(checkIn: string, today = todayISO()): number {
  const n = nightsBetween(today, checkIn);
  return checkIn < today ? -nightsBetween(checkIn, today) : n;
}

/**
 * The refund for cancelling now: the first schedule row whose `min_days_before_check_in` is at most the
 * days left gives the percentage of what was actually paid. Nothing matches → no refund.
 */
export function refundPreview(policy: CancellationPolicy | null | undefined, checkIn: string, paid: Money, today = todayISO()): { percent: number; amount: number } {
  const days = daysBeforeCheckIn(checkIn, today);
  const rows = [...(policy?.refund_schedule ?? [])].sort((a, b) => b.min_days_before_check_in - a.min_days_before_check_in);
  const row = days >= 0 ? rows.find(r => r.min_days_before_check_in <= days) : undefined;
  const percent = row ? toNumber(row.refund_percent) : 0;
  return { percent, amount: Math.round(toNumber(paid) * percent) / 100 };
}

/** Payment history shows completed movements only; negative amounts are refunds (guide 9.1). */
export const completedPayments = (payments: BookingPayment[]) => payments.filter(p => p.status === 'completed');

/** "TBD-…" until the hotel assigns a room. */
export const roomNumber = (n: string) => (!n || /^tbd/i.test(n) ? 'Assigned at check-in' : `Room ${n}`);

export type TripGroup = 'upcoming' | 'past' | 'cancelled';

/** Which tab of "My trips" a booking belongs on. */
export function tripGroup(b: AnyBooking, today = todayISO()): TripGroup {
  if (['cancelled', 'failed', 'no_show'].includes(b.status)) return 'cancelled';
  if (isFlight(b)) return b.status === 'completed' || b.departure_datetime.slice(0, 10) < today ? 'past' : 'upcoming';
  if (b.status === 'checked_out') return 'past';
  if ((b.status === 'pending' || b.status === 'hold') && !awaitingPayment(b)) return 'cancelled';
  return 'upcoming';
}

/**
 * Short refund rules for a policy type, for before the guest books (guide 9.3). The hotel endpoint sends only
 * the type; these mirror the backend's REFUND_POLICIES (apps/bookings/payment_service.py). Keep them in step.
 */
export const POLICY_RULES: Record<string, string> = {
  flexible: 'Full refund up to 7 days before check-in, 75% at 3–6 days, 50% at 1–2 days.',
  strict: 'Full refund up to 14 days before check-in, 50% at 7–13 days.',
  non_refundable: 'No refund if you cancel.',
};
