import { addDays, nightsBetween, todayISO } from './format';
import type { StayRequest } from '@/types/api';

/**
 * A stay being planned: dates, guests and rooms, carried in the URL from the hotel page to checkout so
 * a link (or a refresh) brings back the same choice. The limits are the server's (Customer guide 6.1),
 * checked here too for faster feedback.
 */

export interface StayPlan {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants: number;
  /** room type id → how many */
  rooms: Record<string, number>;
}

export const LIMITS = { maxNights: 30, maxDaysAhead: 365, adults: [1, 10], children: [0, 10], infants: [0, 5], roomTypes: 5, perRoom: 5, service: 20 } as const;

const int = (v: string | null, fallback: number, [min, max]: readonly [number, number]) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
};

export function defaultPlan(): StayPlan {
  return { checkIn: todayISO(1), checkOut: todayISO(2), adults: 2, children: 0, infants: 0, rooms: {} };
}

/** Reads ?in=&out=&adults=&children=&infants=&rooms=id:2,id:1 (anything missing falls back to defaults). */
export function readPlan(params: URLSearchParams | { get(name: string): string | null }): StayPlan {
  const d = defaultPlan();
  const checkIn = params.get('in') ?? '';
  const checkOut = params.get('out') ?? '';
  const rooms: Record<string, number> = {};
  for (const part of (params.get('rooms') ?? '').split(',').filter(Boolean)) {
    const [id, qty] = part.split(':');
    const n = Number(qty ?? 1);
    if (id && Number.isInteger(n) && n > 0) rooms[id] = Math.min(n, LIMITS.perRoom);
  }
  const datesOk = /^\d{4}-\d{2}-\d{2}$/.test(checkIn) && /^\d{4}-\d{2}-\d{2}$/.test(checkOut);
  return {
    checkIn: datesOk ? checkIn : d.checkIn,
    checkOut: datesOk ? checkOut : d.checkOut,
    adults: int(params.get('adults'), d.adults, LIMITS.adults),
    children: int(params.get('children'), 0, LIMITS.children),
    infants: int(params.get('infants'), 0, LIMITS.infants),
    rooms,
  };
}

export function planQuery(plan: StayPlan, extra: Record<string, string> = {}): string {
  const q = new URLSearchParams({ in: plan.checkIn, out: plan.checkOut, adults: String(plan.adults) });
  if (plan.children) q.set('children', String(plan.children));
  if (plan.infants) q.set('infants', String(plan.infants));
  const rooms = Object.entries(plan.rooms).filter(([, n]) => n > 0).map(([id, n]) => `${id}:${n}`).join(',');
  if (rooms) q.set('rooms', rooms);
  for (const [k, v] of Object.entries(extra)) q.set(k, v);
  return q.toString();
}

/** What's wrong with the dates, in the person's words; null when they're fine. */
export function datesProblem(checkIn: string, checkOut: string, today = todayISO()): string | null {
  if (!checkIn || !checkOut) return 'Choose your check-in and check-out dates.';
  if (checkIn < today) return 'Check-in can’t be in the past.';
  if (checkIn > addDays(today, LIMITS.maxDaysAhead)) return 'You can book up to a year ahead.';
  if (checkOut <= checkIn) return 'Check-out must be after check-in.';
  if (nightsBetween(checkIn, checkOut) > LIMITS.maxNights) return `Stays can be at most ${LIMITS.maxNights} nights. Extend later if you need more.`;
  return null;
}

/** The guest limits per room (guide 5.4): the server doesn't check occupancy, so the app must. */
export function occupancyProblem(plan: Pick<StayPlan, 'adults' | 'children'>, rooms: { max_adults?: number; max_occupancy: number; quantity: number }[]): string | null {
  if (!rooms.length) return null;
  const adultsRoom = rooms.reduce((n, r) => n + (r.max_adults ?? r.max_occupancy) * r.quantity, 0);
  const everyone = rooms.reduce((n, r) => n + r.max_occupancy * r.quantity, 0);
  if (plan.adults > adultsRoom) return `These rooms sleep at most ${adultsRoom} adult${adultsRoom === 1 ? '' : 's'}. Add a room or choose a bigger one.`;
  if (plan.adults + plan.children > everyone) return `These rooms sleep at most ${everyone} guests. Add a room or choose a bigger one.`;
  return null;
}

export function stayRequest(hotelId: string, plan: StayPlan): StayRequest {
  return {
    hotel_id: hotelId,
    check_in_date: plan.checkIn,
    check_out_date: plan.checkOut,
    adults: plan.adults,
    children: plan.children,
    ...(plan.infants ? { infants: plan.infants } : {}),
    rooms: Object.entries(plan.rooms).filter(([, n]) => n > 0).map(([room_id, quantity]) => ({ room_id, quantity })),
  };
}

export const guestsLabel = (p: Pick<StayPlan, 'adults' | 'children' | 'infants'>) =>
  [`${p.adults} adult${p.adults === 1 ? '' : 's'}`, p.children ? `${p.children} child${p.children === 1 ? '' : 'ren'}` : '', p.infants ? `${p.infants} infant${p.infants === 1 ? '' : 's'}` : '']
    .filter(Boolean).join(' · ');

/** Password rules from guide 3.1; every failure is shown at once. A hyphen isn't a special character. */
export const PASSWORD_RULES: { label: string; test: (p: string) => boolean }[] = [
  { label: 'At least 8 characters', test: p => p.length >= 8 },
  { label: 'An uppercase letter', test: p => /[A-Z]/.test(p) },
  { label: 'A lowercase letter', test: p => /[a-z]/.test(p) },
  { label: 'A number', test: p => /\d/.test(p) },
  { label: 'A special character, like ! @ # $ %', test: p => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export const passwordOk = (p: string) => PASSWORD_RULES.every(r => r.test(p));
