import { humanize, money } from './format';

/**
 * Turns what the server sends (errors, socket events, feed notifications) into wording a traveller
 * understands, and decides where tapping a notification goes (Customer guide 12.1).
 */

export type NoticeTone = 'info' | 'success' | 'warning' | 'danger';

export interface Notice {
  title: string;
  body?: string;
  /** Where clicking the notice goes. */
  href?: string;
  tone: NoticeTone;
}

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
// Code words the backend puts in sentences, and how to say them.
const WORDS: Record<string, string> = {
  checked_in: 'checked in', checked_out: 'checked out', no_show: 'no-show', pay_at_hotel: 'pay at the hotel',
};

/**
 * Makes a server sentence readable: "NGN 10000.00" → "₦10,000.00", internal IDs dropped, code words
 * ("checked_in") in plain words. Leaves ordinary sentences alone.
 */
export function cleanServerText(text: string | null | undefined): string {
  if (!text) return '';
  let s = String(text);
  s = s.replace(/\b(?:NGN|₦)\s?(-?[\d,]+(?:\.\d+)?)/g, (_, n: string) => money(n.replace(/,/g, '')));
  s = s.replace(new RegExp(`\\s*\\b(?:in|for|on|id|ID)?\\s*(?:chat|booking|room|hotel)?\\s*#?${UUID.source}`, 'gi'), '');
  s = s.replace(/\b[a-z]+(?:_[a-z]+)+\b/g, w => WORDS[w] ?? w.replace(/_/g, ' '));
  return s.replace(/\s{2,}/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim();
}

/** An API validation message without the backend's "Validation failed: field: …" wrapper. */
export function readableError(error: string | undefined, errors?: Record<string, string | string[]>): string | undefined {
  if (!error?.startsWith('Validation failed') || !errors) return error;
  const first = (v: string | string[]) => (Array.isArray(v) ? v[0] : v);
  // A general message first, then field messages; values that aren't sentences are skipped.
  const general = ['error', 'non_field_errors', 'detail', 'message', 'conflict'].map(k => errors[k]).find(Boolean);
  if (general) return first(general);
  const isSentence = (m: string) => /[a-z]/i.test(m) && /\s/.test(m);
  const field = Object.entries(errors).find(([, v]) => v && isSentence(String(first(v))));
  if (!field) return 'Some details aren’t right. Check the form and try again.';
  const message = String(first(field[1]));
  // Most messages say what's wrong on their own; generic ones ("This field is required.") need the field's name.
  return /^(this field|this value|ensure this|enter a valid|a valid|invalid|not a valid)/i.test(message) ? `${humanize(field[0])}: ${message}` : message;
}

/** Where a customer notification opens (guide 12.1): the booking or the chat; anything else stays in the list. */
export function notificationHref(n: { reference_type?: string | null; reference_id?: string | null }): string {
  const id = n.reference_id ? encodeURIComponent(n.reference_id) : '';
  switch (n.reference_type) {
    case 'booking': return id ? `/trips/${id}` : '/trips';
    case 'chat': return id ? `/inbox/${id}` : '/inbox';
    default: return '/notifications';
  }
}

const TYPE_TONES: Record<string, NoticeTone> = {
  BOOKING_CONFIRMATION: 'success', PAYMENT_CONFIRMATION: 'success', REFUND_PROCESSED: 'success', POINTS_EARNED: 'success',
  TIER_UPGRADE: 'success', PICKUP_CONFIRMATION: 'success', FLIGHT_CONFIRMATION: 'success', BIRTHDAY_BONUS: 'success',
  BOOKING_CANCELLATION: 'warning', FLIGHT_CANCELLATION: 'warning', PAYMENT_FAILED: 'danger',
};

/** The tone for a notification type, for its icon tile and live toast. */
export const notificationTone = (type: string | null | undefined): NoticeTone => (type && TYPE_TONES[type]) || 'info';

/** A feed notification's title and message, cleaned for display. */
export function notificationText(n: { title?: string | null; message?: string | null; notification_type?: string | null; type?: string | null }): { title: string; message: string } {
  const type = n.notification_type ?? n.type;
  return { title: cleanServerText(n.title) || humanize(type ?? 'Notification'), message: cleanServerText(n.message) };
}

const STAY_STATUS: Record<string, { title: string; tone: NoticeTone }> = {
  confirmed: { title: 'Your booking is confirmed', tone: 'success' },
  checked_in: { title: 'You’re checked in', tone: 'success' },
  checked_out: { title: 'You’ve checked out', tone: 'info' },
  cancelled: { title: 'Your booking was cancelled', tone: 'warning' },
  no_show: { title: 'Marked as a no-show', tone: 'warning' },
};

const STATUS_KEY = 'andinoh-customer:booking-status';

function knownStatuses(): Record<string, string> {
  try { return JSON.parse(sessionStorage.getItem(STATUS_KEY) ?? '{}') as Record<string, string>; } catch { return {}; }
}

/**
 * Notes a booking's status as this tab last saw it. Kept for the tab (sessionStorage) so it survives the
 * round trip to checkout; it's only a status, never the booking.
 */
export function rememberBookingStatus(id: string, status: string): void {
  try { sessionStorage.setItem(STATUS_KEY, JSON.stringify({ ...knownStatuses(), [id]: status })); } catch { /* private mode: toasts may repeat */ }
}

/**
 * Whether a `booking_status_update` is news. The backend sends one whenever a booking is saved, not only
 * when its status changes (pricing an extension or a payment saves it), so an unchanged status is
 * skipped; one this tab hasn't seen counts as news.
 */
export function isNewBookingStatus(id: string, status: string): boolean {
  const news = !id || knownStatuses()[id] !== status;
  if (id) rememberBookingStatus(id, status);
  return news;
}

/** `booking_status_update`: a booking changed (e.g. a bank transfer cleared). */
export function bookingStatusNotice(message: Record<string, unknown>): Notice {
  const status = String(message.status ?? '');
  const id = message.booking_id ? String(message.booking_id) : '';
  const code = message.confirmation_code ? String(message.confirmation_code) : '';
  const known = STAY_STATUS[status];
  return {
    title: known?.title ?? 'Your booking was updated',
    body: code ? `Booking ${code}` : undefined,
    href: id ? `/trips/${id}` : '/trips',
    tone: known?.tone ?? 'info',
  };
}

/** `new_chat_message` from the hotel. */
export function chatNotice(message: Record<string, unknown>): Notice {
  const kind = String(message.message_type ?? 'text');
  const text = kind === 'text' ? cleanServerText(String(message.message ?? '')) : kind === 'image' ? 'Sent a photo' : 'Sent a file';
  return {
    title: `${String(message.sender_name || 'The hotel')} replied`,
    body: text.length > 120 ? `${text.slice(0, 117)}…` : text,
    href: message.chat_id ? `/inbox/${message.chat_id}` : '/inbox',
    tone: 'info',
  };
}
