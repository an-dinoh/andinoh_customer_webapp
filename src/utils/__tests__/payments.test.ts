import { ApiError } from '@/utils/api';
import { bookingsApi, guestBookingsApi, pickupsApi, tipsApi } from '@/services/api';
import { failureMessage, forgetPayment, nav, openCheckout, paymentReturnUrl, pendingPayment, rememberPayment, startPayment, verifyPayment } from '@/utils/payments';
import { guestBookings } from '@/utils/guestBookings';
import { example } from '@/services/api/__tests__/harness';
import type { PaymentStart } from '@/types/api';

jest.mock('@/services/api', () => ({
  bookingsApi: { pay: jest.fn(), verifyPayment: jest.fn() },
  guestBookingsApi: { pay: jest.fn(), verifyPayment: jest.fn() },
  pickupsApi: { pay: jest.fn(), verifyPayment: jest.fn() },
  tipsApi: { verifyPayment: jest.fn() },
}));

const start = example('booking_pay').body as PaymentStart;
const origin = window.location.origin;
let assign: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  assign = jest.spyOn(nav, 'go').mockImplementation(() => undefined);
  sessionStorage.clear();
  localStorage.clear();
  guestBookings.reset();
});

describe('starting a payment', () => {
  it('asks the backend for a payment with a return address naming what is paid, then opens hosted checkout', async () => {
    (bookingsApi.pay as jest.Mock).mockResolvedValue(start);
    await expect(startPayment({ kind: 'booking', ref: 'b-1', back: '/trips/b-1', label: 'Palmview' })).resolves.toBe('redirected');
    expect(bookingsApi.pay).toHaveBeenCalledWith('b-1', `${origin}/payments/complete?kind=booking&ref=b-1`);
    expect(assign).toHaveBeenCalledWith(start.data.link);
    expect(pendingPayment(start.checkout.tx_ref)).toMatchObject({ kind: 'booking', ref: 'b-1', back: '/trips/b-1', tx_ref: start.checkout.tx_ref });
  });
  it('treats "already paid" as done without opening checkout', async () => {
    (bookingsApi.pay as jest.Mock).mockResolvedValue(example('booking_pay_already_paid').body);
    await expect(startPayment({ kind: 'booking', ref: 'b-1', back: '/x' })).resolves.toBe('already_paid');
    expect(assign).not.toHaveBeenCalled();
  });
  it('pays a pickup by its code and a guest booking with its saved token', async () => {
    (pickupsApi.pay as jest.Mock).mockResolvedValue(start);
    await startPayment({ kind: 'pickup', ref: 'PU1', back: '/pickups/PU1' });
    expect(pickupsApi.pay).toHaveBeenCalledWith('PU1', `${origin}/payments/complete?kind=pickup&ref=PU1`);

    await expect(startPayment({ kind: 'guest', ref: 'LER6', back: '/' })).rejects.toThrow(/booking email/);
    guestBookings.save({ confirmation_code: 'LER6', access_token: 'secret' });
    (guestBookingsApi.pay as jest.Mock).mockResolvedValue(start);
    await startPayment({ kind: 'guest', ref: 'LER6', back: '/' });
    expect(guestBookingsApi.pay).toHaveBeenCalledWith('LER6', 'secret', `${origin}/payments/complete?kind=guest&ref=LER6`);
  });
  it('remembers only the payment that matches the reference coming back', () => {
    rememberPayment({ kind: 'tip', ref: 't-1', back: '/trips', tx_ref: 'REF-1' });
    expect(pendingPayment('REF-1')?.ref).toBe('t-1');
    expect(pendingPayment('REF-2')).toBeNull();
    forgetPayment();
    expect(pendingPayment()).toBeNull();
    expect(paymentReturnUrl({ kind: 'guest', ref: 'A B' })).toBe(`${origin}/payments/complete?kind=guest&ref=A%20B`);
  });
  it('falls back to inline checkout when there is no hosted link', async () => {
    const inline = jest.fn();
    (window as unknown as { FlutterwaveCheckout: unknown }).FlutterwaveCheckout = inline;
    await openCheckout({ ...start, data: { link: null, tx_ref: start.data.tx_ref } }, { kind: 'booking', ref: 'b-1', back: '/' });
    expect(inline).toHaveBeenCalledWith(expect.objectContaining({ public_key: start.checkout.public_key, tx_ref: start.checkout.tx_ref, amount: start.checkout.amount }));
    inline.mock.calls[0][0].callback({ transaction_id: 77, tx_ref: start.checkout.tx_ref, status: 'successful' });
    expect(assign).toHaveBeenCalledWith(expect.stringMatching(/kind=booking&ref=b-1&status=successful&tx_ref=.+&transaction_id=77$/));
  });
});

describe('verifying (guide 6.4)', () => {
  it('paid, processing and failed', async () => {
    (bookingsApi.verifyPayment as jest.Mock).mockResolvedValueOnce(example('booking_verify_success').body);
    await expect(verifyPayment('booking', 'b-1', { transaction_id: '1' })).resolves.toMatchObject({ state: 'paid' });
    (bookingsApi.verifyPayment as jest.Mock).mockResolvedValueOnce(example('booking_verify_pending').body);
    await expect(verifyPayment('booking', 'b-1', { transaction_id: '1' })).resolves.toMatchObject({ state: 'processing' });
    (bookingsApi.verifyPayment as jest.Mock).mockRejectedValueOnce(new ApiError(400, example("err_booking_verify_underpaid").body as Record<string, string>, ''));
    const failed = await verifyPayment('booking', 'b-1', { transaction_id: '1' });
    expect(failed).toMatchObject({ state: 'failed', code: 'amount_mismatch' });
    expect(failed.message).toMatch(/refunded automatically/);
  });
  it('verifies tips and pickups with their own endpoints, and guest bookings with the token', async () => {
    (tipsApi.verifyPayment as jest.Mock).mockResolvedValue(example('tip_verify').body);
    await expect(verifyPayment('tip', 't-1', { tx_ref: 'R' })).resolves.toMatchObject({ state: 'paid' });
    expect(tipsApi.verifyPayment).toHaveBeenCalledWith('t-1', { tx_ref: 'R' });
    (pickupsApi.verifyPayment as jest.Mock).mockResolvedValue(example('pickup_verify').body);
    await expect(verifyPayment('pickup', 'PU1', { transaction_id: '9' })).resolves.toMatchObject({ state: 'paid' });
    await expect(verifyPayment('guest', 'NOPE', {})).resolves.toMatchObject({ state: 'failed' });
  });
  it('explains each failure code in plain words', () => {
    for (const code of ['payment_failed', 'currency_mismatch', 'already_paid', 'booking_cancelled', 'reference_mismatch', 'duplicate_transaction', 'extension_unavailable']) {
      expect(failureMessage(new ApiError(400, { error: 'x', code }, '')).message).not.toBe('x');
    }
    expect(failureMessage(new ApiError(400, { error: 'Server says no', code: 'new_code' }, '')).message).toBe('Server says no');
  });
});

describe('guest bookings on this device (guide 7.1)', () => {
  it('saves newest first, refreshes in place, removes and tells listeners', () => {
    const heard = jest.fn();
    const off = guestBookings.subscribe(heard);
    guestBookings.save({ confirmation_code: 'A', access_token: 't1', hotel_name: 'One' });
    guestBookings.save({ confirmation_code: 'B', access_token: 't2' });
    guestBookings.save({ confirmation_code: 'A', access_token: 't3' });
    expect(guestBookings.list().map(b => [b.confirmation_code, b.access_token, b.hotel_name])).toEqual([['A', 't3', 'One'], ['B', 't2', undefined]]);
    guestBookings.remove('B');
    expect(guestBookings.get('B')).toBeUndefined();
    expect(heard).toHaveBeenCalledTimes(4);
    off();
    guestBookings.reset();
    expect(guestBookings.list()).toHaveLength(1); // kept in localStorage
  });
});
