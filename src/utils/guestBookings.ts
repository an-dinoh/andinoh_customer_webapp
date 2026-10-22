/**
 * "My guest bookings" (Customer guide 7.1): bookings made without an account are reached with their
 * confirmation code and a secret token that's shown once. They're kept in this browser so the guest can
 * come back to them; the same link is emailed.
 */

export interface SavedGuestBooking {
  confirmation_code: string;
  access_token: string;
  hotel_name?: string;
  check_in_date?: string;
  check_out_date?: string;
  guest_name?: string;
  guest_email?: string;
  saved_at: string;
}

const KEY = 'andinoh-customer:guest-bookings';
const listeners = new Set<() => void>();
let snapshot: SavedGuestBooking[] | null = null;

function read(): SavedGuestBooking[] {
  if (snapshot) return snapshot;
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    snapshot = Array.isArray(v) ? v : [];
  } catch {
    snapshot = [];
  }
  return snapshot;
}

function write(list: SavedGuestBooking[]): void {
  snapshot = list;
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* private mode: kept for this visit */ }
  listeners.forEach(l => l());
}

const EMPTY: SavedGuestBooking[] = [];

export const guestBookings = {
  list: (): SavedGuestBooking[] => (typeof window === 'undefined' ? EMPTY : read()),
  get: (code: string): SavedGuestBooking | undefined => guestBookings.list().find(b => b.confirmation_code === code),
  /** Adds or refreshes one (newest first). */
  save: (b: Omit<SavedGuestBooking, 'saved_at'>): void => {
    const rest = read().filter(x => x.confirmation_code !== b.confirmation_code);
    const old = read().find(x => x.confirmation_code === b.confirmation_code);
    write([{ ...old, ...b, saved_at: new Date().toISOString() }, ...rest]);
  },
  /** A token stopped working, or the booking moved into an account. */
  remove: (code: string): void => write(read().filter(b => b.confirmation_code !== code)),
  subscribe: (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; },
  /** For tests. */
  reset: (): void => { snapshot = null; },
};
