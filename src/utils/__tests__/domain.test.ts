import { awaitingPayment, clock, completedPayments, daysBeforeCheckIn, holdLeft, refundPreview, roomNumber, stayActions, statusInfo, tripGroup } from '@/utils/bookings';
import { LIMITS, datesProblem, defaultPlan, guestsLabel, occupancyProblem, passwordOk, PASSWORD_RULES, planQuery, readPlan, stayRequest } from '@/utils/stay';
import { resolveLink } from '@/utils/links';
import { cleanServerText, notificationHref, readableError } from '@/utils/notify';
import { remainder } from '@/components/bookings/PriceSummary';
import { visibleSections } from '@/components/home/Feed';
import { example } from '@/services/api/__tests__/harness';
import type { CancellationPolicy, FeedSection, HotelBooking } from '@/types/api';

const FLEXIBLE: CancellationPolicy = {
  type: 'flexible', label: 'Flexible', deposit_required_pct: '20.00',
  refund_schedule: [{ min_days_before_check_in: 3, refund_percent: '75.00' }, { min_days_before_check_in: 7, refund_percent: '100.00' }, { min_days_before_check_in: 1, refund_percent: '50.00' }],
};
const booking = (over: Partial<HotelBooking> = {}): HotelBooking => ({ ...(example('booking_detail').body as HotelBooking), ...over });

describe('refund preview (guide 9.3)', () => {
  it('uses the first row whose minimum days fit, whatever order the schedule comes in', () => {
    expect(refundPreview(FLEXIBLE, '2026-11-20', '1000.00', '2026-11-01')).toEqual({ percent: 100, amount: 1000 });
    expect(refundPreview(FLEXIBLE, '2026-11-20', '1000.00', '2026-11-15')).toEqual({ percent: 75, amount: 750 });
    expect(refundPreview(FLEXIBLE, '2026-11-20', '1000.00', '2026-11-18')).toEqual({ percent: 50, amount: 500 });
  });
  it('gives nothing on the day, after check-in, without a policy or for non-refundable', () => {
    expect(refundPreview(FLEXIBLE, '2026-11-20', '1000.00', '2026-11-20').percent).toBe(0);
    expect(refundPreview(FLEXIBLE, '2026-11-20', '1000.00', '2026-11-22').percent).toBe(0);
    expect(refundPreview(null, '2026-11-20', '1000.00', '2026-11-01').percent).toBe(0);
    expect(refundPreview({ ...FLEXIBLE, refund_schedule: [] }, '2026-11-20', '1000.00', '2026-11-01').percent).toBe(0);
  });
  it('refunds a share of what was actually paid, to the kobo', () => {
    expect(refundPreview(FLEXIBLE, '2026-11-20', '52593.75', '2026-11-15').amount).toBe(39445.31);
    expect(refundPreview(FLEXIBLE, '2026-11-20', '0.00', '2026-11-01').amount).toBe(0);
  });
  it('counts calendar days to check-in', () => {
    expect(daysBeforeCheckIn('2026-11-20', '2026-11-13')).toBe(7);
    expect(daysBeforeCheckIn('2026-11-20', '2026-11-22')).toBe(-2);
  });
});

describe('what a guest can do with a stay (guide 9.1)', () => {
  const now = Date.parse('2026-10-13T00:00:00Z');
  it('pending with time left: pay or cancel', () => {
    const a = stayActions(booking({ status: 'pending', hold_expires_at: '2026-10-13T00:20:00Z', paid_amount: '0.00' }), now);
    expect(a).toMatchObject({ pay: true, cancel: true, extend: false, chat: false, review: false });
  });
  it('pending after the hold ran out: nothing (the server cancels it)', () => {
    const b = booking({ status: 'pending', hold_expires_at: '2026-10-12T23:00:00Z' });
    expect(stayActions(b, now)).toMatchObject({ pay: false, cancel: false });
    expect(awaitingPayment(b, now)).toBe(false);
  });
  it('confirmed: cancel, extend, pickup; balance only when something is owed and not paid at the hotel', () => {
    expect(stayActions(booking({ status: 'confirmed' }), now)).toMatchObject({ cancel: true, extend: true, pickup: true, payBalance: false, chat: false });
    expect(stayActions(booking({ status: 'confirmed', balance_due: '100.00' }), now).payBalance).toBe(true);
    expect(stayActions(booking({ status: 'confirmed', balance_due: '100.00', pay_at_hotel: true }), now).payBalance).toBe(false);
  });
  it('checked in: chat (once paid or pay at hotel), tip, extend, complaint', () => {
    expect(stayActions(booking({ status: 'checked_in' }), now)).toMatchObject({ chat: true, tip: true, extend: true, complaint: true, review: false });
    expect(stayActions(booking({ status: 'checked_in', paid_amount: '0.00', pay_at_hotel: false }), now).chat).toBe(false);
    expect(stayActions(booking({ status: 'checked_in', paid_amount: '0.00', pay_at_hotel: true }), now).chat).toBe(true);
  });
  it('checked out: review and complaint only', () => {
    expect(stayActions(booking({ status: 'checked_out' }), now)).toMatchObject({ review: true, complaint: true, cancel: false, extend: false, tip: false });
  });
  it('labels statuses for guests and keeps unknown ones readable', () => {
    expect(statusInfo('checked_out')).toEqual({ label: 'Completed', tone: 'neutral' });
    expect(statusInfo('hold').label).toBe('Awaiting payment');
    expect(statusInfo('on_the_moon')).toEqual({ label: 'On the moon', tone: 'neutral' });
  });
  it('groups trips into tabs', () => {
    expect(tripGroup(booking({ status: 'confirmed' }))).toBe('upcoming');
    expect(tripGroup(booking({ status: 'checked_out' }))).toBe('past');
    expect(tripGroup(booking({ status: 'no_show' }))).toBe('cancelled');
    expect(tripGroup(booking({ status: 'pending', hold_expires_at: '2020-01-01T00:00:00Z' }))).toBe('cancelled');
  });
  it('shows completed payments only and an unassigned room in words', () => {
    const b = example('booking_detail').body as HotelBooking;
    expect(completedPayments(b.payments).every(p => p.status === 'completed')).toBe(true);
    expect(roomNumber('TBD-1234')).toBe('Assigned at check-in');
    expect(roomNumber('101')).toBe('Room 101');
  });
  it('counts the hold down', () => {
    expect(holdLeft('2026-10-13T00:20:00Z', now)).toBe(20 * 60_000);
    expect(holdLeft('2026-10-12T00:00:00Z', now)).toBe(0);
    expect(clock(29 * 60_000 + 41_000)).toBe('29:41');
  });
});

describe('planning a stay (guide 6.1)', () => {
  it('round-trips dates, guests and rooms through the URL', () => {
    const plan = { checkIn: '2026-11-01', checkOut: '2026-11-03', adults: 2, children: 1, infants: 0, rooms: { 'room-a': 2, 'room-b': 1, gone: 0 } };
    const back = readPlan(new URLSearchParams(planQuery(plan)));
    expect(back).toEqual({ ...plan, rooms: { 'room-a': 2, 'room-b': 1 } });
  });
  it('falls back to safe values for nonsense in the URL', () => {
    const p = readPlan(new URLSearchParams('in=tomorrow&out=x&adults=99&rooms=a:9,b:-1'));
    expect(p.checkIn).toBe(defaultPlan().checkIn);
    expect(p.adults).toBe(2);
    expect(p.rooms).toEqual({ a: LIMITS.perRoom });
  });
  it('builds the quote body the server expects', () => {
    const body = stayRequest('h1', { checkIn: '2026-11-01', checkOut: '2026-11-03', adults: 2, children: 0, infants: 0, rooms: { r1: 1 } });
    expect(body).toEqual({ hotel_id: 'h1', check_in_date: '2026-11-01', check_out_date: '2026-11-03', adults: 2, children: 0, rooms: [{ room_id: 'r1', quantity: 1 }] });
  });
  it('checks dates like the server does', () => {
    const today = '2026-10-13';
    expect(datesProblem('2026-10-14', '2026-10-15', today)).toBeNull();
    expect(datesProblem('2026-10-12', '2026-10-15', today)).toMatch(/past/);
    expect(datesProblem('2026-10-15', '2026-10-15', today)).toMatch(/after check-in/);
    expect(datesProblem('2026-10-14', '2026-11-20', today)).toMatch(/30 nights/);
    expect(datesProblem('2027-12-01', '2027-12-02', today)).toMatch(/year ahead/);
  });
  it('checks occupancy, which the server leaves to the app (guide 5.4)', () => {
    expect(occupancyProblem({ adults: 2, children: 1 }, [{ max_occupancy: 3, quantity: 1 }])).toBeNull();
    expect(occupancyProblem({ adults: 4, children: 0 }, [{ max_occupancy: 3, quantity: 1 }])).toMatch(/at most 3 adults/);
    expect(occupancyProblem({ adults: 2, children: 2 }, [{ max_occupancy: 3, quantity: 1 }])).toMatch(/at most 3 guests/);
    expect(occupancyProblem({ adults: 4, children: 2 }, [{ max_occupancy: 3, quantity: 2 }])).toBeNull();
    expect(guestsLabel({ adults: 1, children: 2, infants: 1 })).toBe('1 adult · 2 children · 1 infant');
  });
  it('applies the server’s password rules (a hyphen isn’t special)', () => {
    expect(passwordOk('Sunny@Lagos2026')).toBe(true);
    expect(passwordOk('Sunny-Lagos2026')).toBe(false);
    expect(PASSWORD_RULES.filter(r => !r.test('password')).map(r => r.label)).toEqual(['An uppercase letter', 'A number', 'A special character, like ! @ # $ %']);
  });
});

describe('money left for the hotel', () => {
  it('subtracts in kobo', () => {
    const q = example('quote_pay_at_hotel').body as { total: string; due_online_now: string };
    expect(remainder(q.total, q.due_online_now)).toBe(100410);
    expect(remainder('0.30', '0.10')).toBe(0.2);
  });
});

describe('links, notifications and errors', () => {
  it('maps app deep links and same-site URLs to pages', () => {
    expect(resolveLink('app://hotels/detail/6d5e551c-e520-42ed-bb07-ee8add772705')).toEqual({ href: '/hotels/6d5e551c-e520-42ed-bb07-ee8add772705', external: false });
    expect(resolveLink('andinoh://bookings/hotel/6d5e551c-e520-42ed-bb07-ee8add772705')?.href).toBe('/trips/6d5e551c-e520-42ed-bb07-ee8add772705');
    expect(resolveLink('https://example.com/x')).toEqual({ href: 'https://example.com/x', external: true });
    expect(resolveLink(`${window.location.origin}/hotels?x=1`)).toEqual({ href: '/hotels?x=1', external: false });
    expect(resolveLink('')).toBeNull();
  });
  it('opens what a notification is about (guide 12.1)', () => {
    expect(notificationHref({ reference_type: 'booking', reference_id: 'b1' })).toBe('/trips/b1');
    expect(notificationHref({ reference_type: 'chat', reference_id: 'c1' })).toBe('/inbox/c1');
    expect(notificationHref({ reference_type: 'pickup', reference_id: 'PU-1' })).toBe('/pickups/PU-1');
    expect(notificationHref({ reference_type: 'other' })).toBe('/notifications');
  });
  it('turns server sentences into readable ones', () => {
    expect(cleanServerText('Refund of NGN 168750.00 for booking 3685ffe8-1111-2222-3333-444455556666 is checked_in.')).toBe('Refund of ₦168,750.00 is checked in.');
    const err = example('err_quote_bad_quantity').body as { error: string; errors: Record<string, string[]> };
    expect(readableError(err.error, err.errors)).toBe('Room quantity must be between 1 and 5');
  });
});

describe('home feed (guide 5.1)', () => {
  it('keeps known section types in the server’s order and skips new ones', () => {
    const sections = [
      { type: 'hotel_horizontal_list', order: 5, data: [] }, { type: 'brand_new_thing', order: 1, data: {} },
      { type: 'ads_banner', order: 3, data: {} }, { type: 'active_bookings', order: 0, data: [] },
    ] as FeedSection[];
    expect(visibleSections(sections).map(s => s.type)).toEqual(['active_bookings', 'ads_banner', 'hotel_horizontal_list']);
    expect(visibleSections(undefined)).toEqual([]);
  });
});
