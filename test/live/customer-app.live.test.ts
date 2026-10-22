/**
 * The customer app's service layer against the real backend, end to end (npm run test:live, with
 * scripts/live-backend/run.sh running). Browsing signed out, booking as a guest, a new traveller's
 * account from sign-up to cancellation, and the seeded traveller's stay (chat, tips, pickups,
 * complaints, reviews), each step using what the earlier ones created, as the app does.
 */
import { ApiError, session } from '@/utils/api';
import {
  adsApi, appApi, authApi, bookingsApi, chatApi, complaintsApi, devicesApi, guestBookingsApi, helpApi, hotelsApi, legalApi,
  locationsApi, notificationsApi, pickupsApi, profileApi, receiptsApi, recentSearchesApi, referralsApi, reviewsApi, statementApi, tipsApi,
} from '@/services/api';
import { refundPreview } from '@/utils/bookings';
import { toNumber } from '@/utils/format';
import type { GuestBookingCreated, HotelBooking, PaymentStart } from '@/types/api';
import { day, expectApiError, latestEmail, paidTransaction, png, seed, signIn, unique, type Seed } from './helpers';

jest.setTimeout(60_000);

let S: Seed;
const run = unique();
const traveller = { email: `kemi.${run}@traveller.test`, password: 'Sunny@Lagos2026', full_name: 'Kemi Lawal' };
const guestEmail = `tunde.${run}@guest.test`;
let guestBooking: GuestBookingCreated;
// Spread test bookings over the calendar so reruns against the same database don't sell rooms out.
const offset = 25 + Math.floor(Math.random() * 45); // inside the seeded 90-day discount

const asTraveller = () => signIn(traveller.email, traveller.password);
const asAda = () => signIn(S.customer_email, S.password);
const stay = (hotel_id: string, room_id: string, inDays: number, nights = 1) => ({
  hotel_id, check_in_date: day(inDays), check_out_date: day(inDays + nights), adults: 2, children: 0, rooms: [{ room_id, quantity: 1 }],
});

beforeAll(() => {
  S = seed();
  session.clear();
});

describe('5 · browsing signed out', () => {
  it('reads the home feed, searches and opens a hotel with prices for the dates', async () => {
    const feed = await hotelsApi.homeFeed({ latitude: 6.44, longitude: 3.47 });
    expect(feed.sections.some(s => s.type === 'hotel_horizontal_list')).toBe(true);
    const near = feed.sections.find(s => s.key === 'around_you');
    expect(near?.meta?.location).toBe('current');

    const lekki = await hotelsApi.search({ city_id: S.lekki_city_id });
    expect(lekki.results.map(h => h.id)).toEqual([S.palmview_id]);
    const words = await hotelsApi.search({ search: 'Aso' });
    expect(words.results[0].id).toBe(S.aso_id);
    const fiveStar = await hotelsApi.search({ star_rating: 5 });
    expect(fiveStar.results.every(h => h.star_rating === 5)).toBe(true);
    const cities = await locationsApi.searchCities('lek');
    expect(cities.map(c => c.id)).toContain(S.lekki_city_id);

    const hotel = await hotelsApi.get(S.palmview_id);
    expect(hotel.verification.verified).toBe(true);
    expect(hotel.allows_pay_at_hotel).toBe(true);
    expect(hotel.images.length).toBeGreaterThan(0); // the detail has photos, not primary_image

    const rooms = await hotelsApi.rooms(S.palmview_id, { check_in_date: day(offset), check_out_date: day(offset + 2) });
    const deluxe = rooms.results.find(r => r.id === S.deluxe_id)!;
    expect(deluxe.offer?.nights).toBe(2);
    expect(toNumber(deluxe.offer?.discount)).toBeGreaterThan(0); // the hotel's 15% discount
    expect(deluxe.min_availability_for_search).toBeGreaterThan(0);

    const room = await hotelsApi.room(S.deluxe_id);
    expect(room.max_adults).toBe(2);
    expect(room.availability.length).toBeGreaterThanOrEqual(30);
    expect((await hotelsApi.services(S.palmview_id)).map(s => s.id)).toContain(S.spa_id);
    expect((await hotelsApi.reviews(S.palmview_id)).count).toBeGreaterThan(0);
    expect((await hotelsApi.reviewStats(S.palmview_id)).average_rating).toBe(5);
  });

  it('quotes exactly, and explains bad input', async () => {
    const q = await bookingsApi.quote({ ...stay(S.palmview_id, S.deluxe_id, offset, 2), services: [{ offering_id: S.spa_id, quantity: 1 }], payment_method: 'card' });
    expect(q.nights).toBe(2);
    expect(toNumber(q.services)).toBe(25000);
    expect(q.due_online_now).toBe(q.total);
    const atHotel = await bookingsApi.quote({ ...stay(S.palmview_id, S.deluxe_id, offset, 2), payment_method: 'cash' });
    expect(atHotel.pay_at_hotel).toBe(true);
    expect(toNumber(atHotel.due_online_now)).toBeLessThan(toNumber(atHotel.total));

    const bad = await expectApiError(bookingsApi.quote({ ...stay(S.palmview_id, S.deluxe_id, offset, 2), check_out_date: day(offset - 1) }), 400);
    expect(Object.keys(bad.fieldErrors)).toContain('check_out_date');
  });

  it('reads help, FAQs, legal pages and the app config', async () => {
    const config = await appApi.config();
    expect(config.payments.provider).toBe('flutterwave');
    expect((await appApi.faqs()).length).toBeGreaterThan(0);
    const cats = await helpApi.categories();
    expect(cats.results.map(c => c.slug)).toContain('bookings-payments');
    const found = await helpApi.search('refund');
    expect(found.results[0].slug).toBe('how-do-refunds-work');
    const article = await helpApi.article('how-do-refunds-work');
    expect(article.body).toMatch(/Flexible/);
    await helpApi.feedback('how-do-refunds-work', true);
    expect((await legalApi.page('privacy-policy')).title).toBe('Privacy Policy');
    expect((await adsApi.list()).status).toBe('success');
  });
});

describe('7 · booking without an account', () => {
  it('books, pays with the secret token and gets a receipt', async () => {
    guestBooking = await guestBookingsApi.create({
      ...stay(S.eko_id, S.eko_room_id, offset + 3), payment_method: 'online', guest_name: 'Tunde Bakare', guest_email: guestEmail, guest_phone: '+2348090001111',
    });
    const code = guestBooking.booking.confirmation_code;
    const token = guestBooking.access_token;
    expect(guestBooking.payment_required).toBe(true);
    expect(guestBooking.manage_url).toContain(code);

    expect((await guestBookingsApi.get(code, token)).status).toBe('pending');
    await expectApiError(guestBookingsApi.get(code, 'not-the-token'), 404);

    const pay = await guestBookingsApi.pay(code, token, 'http://localhost:3000/payments/complete?kind=guest&ref=' + code) as PaymentStart;
    expect(pay.checkout.customer.email).toBe(guestEmail);
    const verified = await guestBookingsApi.verifyPayment(code, token, { transaction_id: paidTransaction(pay.data.link) });
    expect(verified.status).toBe('success');

    const paid = await guestBookingsApi.get(code, token);
    expect(paid.status).toBe('confirmed');
    expect(paid.receipts).toHaveLength(1);
    const receipt = await guestBookingsApi.receipt(code, token, paid.receipts[0].id);
    expect(receipt.details.booking?.confirmation_code).toBe(code);
    const pdf = await guestBookingsApi.receiptPdf(code, token, receipt.id);
    expect(pdf.contentType).toBe('application/pdf');
  });

  it('refuses guest bookings without details, and cancels an unpaid one', async () => {
    const err = await expectApiError(guestBookingsApi.create({ ...stay(S.eko_id, S.eko_room_id, offset + 5), payment_method: 'online' } as never), 400);
    expect(Object.keys(err.fieldErrors)).toEqual(expect.arrayContaining(['guest_name', 'guest_email']));
    const unpaid = await guestBookingsApi.create({ ...stay(S.eko_id, S.eko_room_id, offset + 5), payment_method: 'online', guest_name: 'Tunde', guest_email: guestEmail });
    const cancelled = await guestBookingsApi.cancel(unpaid.booking.confirmation_code, unpaid.access_token, 'Plans changed');
    expect(cancelled.booking.status).toBe('cancelled');
    expect(toNumber(cancelled.refund_amount)).toBe(0);
  });

  it('emails a new link when the guest lost theirs', async () => {
    const r = await guestBookingsApi.lookup(guestBooking.booking.confirmation_code, guestEmail);
    expect(r.message).toMatch(/emailed/);
    // The old token stops working once a new link is sent (guide 7.4).
    await expectApiError(guestBookingsApi.get(guestBooking.booking.confirmation_code, guestBooking.access_token), 404);
    const mail = latestEmail(guestEmail, new RegExp(guestBooking.booking.confirmation_code));
    const fresh = /token=([A-Za-z0-9_-]+)/.exec(mail)?.[1];
    expect(fresh).toBeTruthy();
    guestBooking = { ...guestBooking, access_token: fresh! };
    expect((await guestBookingsApi.get(guestBooking.booking.confirmation_code, fresh!)).status).toBe('confirmed');
  });
});

describe('3, 6, 9 · a new traveller', () => {
  let booking: HotelBooking;

  it('registers, verifies the email and fills in the profile', async () => {
    const weak = await expectApiError(authApi.register({ ...traveller, password: 'password' }), 400);
    expect(weak.fieldErrors.password).toBeTruthy();
    const reg = await authApi.register({ ...traveller, phone_number: '+2348030000001', platform: 'web', device_name: 'Chrome on macOS' });
    session.store(reg.access_token, reg.refresh_token);
    expect(reg.user.role).toBe('customer');

    await authApi.requestEmailCode();
    const otp = /\b(\d{6})\b/.exec(latestEmail(traveller.email, /\b\d{6}\b/))![1];
    expect((await authApi.confirmEmail(otp)).is_verified).toBe(true);

    const profile = await profileApi.update({ date_of_birth: '1995-03-04', gender: 'F' });
    expect(profile.gender).toBe('F');
    expect(profile.email_verified).toBe(true);
    const photo = await profileApi.setPhoto(png('me.png'));
    expect(photo.profile_picture_url).toBeTruthy();
    expect((await authApi.sessions()).some(s => s.device_name === 'Chrome on macOS')).toBe(true);
  });

  it('books with an add-on, pays, and gets the receipt and points', async () => {
    booking = await bookingsApi.create({ ...stay(S.palmview_id, S.deluxe_id, offset + 10, 2), services: [{ offering_id: S.breakfast_id, quantity: 2 }], payment_method: 'online', special_requests: 'High floor please' });
    expect(booking.status).toBe('pending');
    expect(booking.hold_expires_at).toBeTruthy();
    expect(booking.special_requests).toBe('High floor please');

    const pay = await bookingsApi.pay(booking.id, `http://localhost:3000/payments/complete?kind=booking&ref=${booking.id}`) as PaymentStart;
    expect(pay.checkout.amount).toBe(booking.total_amount);
    expect(pay.checkout.redirect_url).toContain('/payments/complete');
    // The wrong transaction is refused; the right one confirms.
    await expectApiError(bookingsApi.verifyPayment(booking.id, { transaction_id: '1' }), 400);
    const ok = await bookingsApi.verifyPayment(booking.id, { transaction_id: paidTransaction(pay.data.link) });
    expect(ok.status).toBe('success');
    expect((await bookingsApi.pay(booking.id)).status).toBe('already_paid');

    booking = await bookingsApi.get(booking.id) as HotelBooking;
    expect(booking.status).toBe('confirmed');
    expect(booking.balance_due).toBe('0.00');
    const receipts = await receiptsApi.list({ booking_id: booking.id });
    expect(receipts.count).toBe(1);
    expect((await receiptsApi.get(receipts.results[0].id)).details.booking?.services).toHaveLength(1);
    await receiptsApi.resend(receipts.results[0].id);
    expect((await receiptsApi.pdf(receipts.results[0].id)).filename).toMatch(/^andinoh-receipt-/);

    expect((await profileApi.get()).available_points).toBeGreaterThan(0);
    const list = await bookingsApi.list({ search: 'Palmview' });
    expect(list.results.map(b => b.id)).toContain(booking.id);
    expect((await bookingsApi.summary()).statistics.total_bookings).toBeGreaterThanOrEqual(1);
    expect((await notificationsApi.unreadCount()).unread).toBeGreaterThan(0);
  });

  it('pays at the hotel: only the deposit and fee online', async () => {
    const b = await bookingsApi.create({ ...stay(S.aso_id, S.garden_id, offset + 20), payment_method: 'cash' });
    expect(b.pay_at_hotel).toBe(true);
    const pay = await bookingsApi.pay(b.id) as PaymentStart;
    expect(toNumber(pay.checkout.amount)).toBeLessThan(toNumber(b.total_amount));
    await bookingsApi.verifyPayment(b.id, { transaction_id: paidTransaction(pay.data.link) });
    const after = await bookingsApi.get(b.id) as HotelBooking;
    expect(after.status).toBe('confirmed');
    expect(toNumber(after.balance_due)).toBeGreaterThan(0);
  });

  it('extends the stay by a night after paying for it', async () => {
    const ext = await bookingsApi.extend(booking.id, day(offset + 13));
    expect(ext.additional_nights).toBe(1);
    expect(ext.payment_required).toBe(true);
    await bookingsApi.verifyPayment(booking.id, { transaction_id: paidTransaction(ext.payment!.data.link) });
    booking = await bookingsApi.get(booking.id) as HotelBooking;
    expect(booking.check_out_date).toBe(day(offset + 13));
  });

  it('cancels with the refund the policy promised', async () => {
    const expected = refundPreview(booking.cancellation_policy, booking.check_in_date, booking.paid_amount);
    expect(expected.percent).toBe(100);
    const r = await bookingsApi.cancel(booking.id, 'Change of plans');
    expect('refund_amount' in r && toNumber(r.refund_amount)).toBe(expected.amount);
    await expectApiError(bookingsApi.cancel(booking.id), 400);
  });

  it('moves a guest booking into the account with its link', async () => {
    const r = await bookingsApi.claim(guestBooking.booking.confirmation_code, guestBooking.access_token);
    expect(r.booking_id).toBe(guestBooking.booking.id);
    await expectApiError(guestBookingsApi.get(guestBooking.booking.confirmation_code, guestBooking.access_token), 404);
  });

  it('remembers searches, then forgets them', async () => {
    await hotelsApi.search({ city_id: S.abuja_city_id });
    await hotelsApi.search({ search: 'lagoon' });
    const recent = await recentSearchesApi.list();
    expect(recent.map(r => r.query || r.city_id)).toEqual(expect.arrayContaining(['lagoon', S.abuja_city_id]));
    await recentSearchesApi.forget(recent[0].id);
    await recentSearchesApi.clear();
    expect(await recentSearchesApi.list()).toEqual([]);
  });

  it('manages addresses, notification settings, devices and referrals', async () => {
    const a = await profileApi.addAddress({ address_type: 'HOME', street_address: '14 Adeola Odeku Street', city: 'Lagos', state_province: 'Lagos', postal_code: '101241', country: 'Nigeria', is_primary: true });
    expect((await profileApi.updateAddress(a.id, { apartment_number: 'Flat 3' })).apartment_number).toBe('Flat 3');
    expect((await profileApi.addresses()).count).toBe(1);
    await profileApi.removeAddress(a.id);
    expect((await profileApi.addresses()).count).toBe(0);

    const prefs = await profileApi.updateNotificationPreferences({ push_promotions: false, digest_frequency: 'WEEKLY' });
    expect(prefs).toMatchObject({ push_promotions: false, digest_frequency: 'WEEKLY' });

    const device = await devicesApi.register({ registration_id: `web-${run}`, device_type: 'web', device_name: 'Chrome on macOS' });
    expect((await devicesApi.list()).results.map(d => d.id)).toContain(device.id);
    await devicesApi.unregister(device.id);

    await referralsApi.invite(`friend.${run}@example.test`);
    const refs = await referralsApi.list();
    expect(refs.results[0].referral_code).toMatch(/^[A-Z0-9]{6,}$/);
    expect((await referralsApi.stats()).pending_referrals).toBe(1);
  });

  it('downloads a statement for a period, and refuses one that ends in the future', async () => {
    const range = await statementApi.range();
    const pdf = await statementApi.pdf(range.opened_at.slice(0, 10), day(0));
    expect(pdf.contentType).toBe('application/pdf');
    expect(pdf.headers['x-statement-number']).toBeTruthy();
    const err = await expectApiError(statementApi.pdf(day(0), day(3)), 400);
    expect(err.fieldErrors.end).toBeTruthy();
  });

  it('can’t delete the account while a stay is booked; changes the password', async () => {
    const refused = await expectApiError(profileApi.deleteAccount(traveller.password), 400);
    expect(refused.message).toMatch(/active booking/);
    const changed = await authApi.changePassword(traveller.password, 'Sunny@Lagos2027');
    session.store(changed.access_token, changed.refresh_token);
    traveller.password = 'Sunny@Lagos2027';
    await expectApiError(authApi.login({ email: traveller.email, password: 'Sunny@Lagos2026' }), 401);
    await asTraveller();
    const out = await authApi.logout(session.refresh()!);
    expect(out.message).toMatch(/logged out/i);
  });
});

describe('10 · during the seeded stay', () => {
  beforeAll(() => asAda());

  it('chats with the hotel: send, reply, edit, delete, read', async () => {
    const chats = await chatApi.list();
    expect(chats.results.map(c => c.id)).toContain(S.chat_id);
    const chat = await chatApi.get(S.chat_id);
    const staffMsg = chat.messages.find(m => m.sender_type === 'staff')!;
    expect(staffMsg).toBeTruthy();
    await chatApi.markRead(S.chat_id);

    await chatApi.send(S.chat_id, { message: `Thank you! ${run}`, reply_to_id: staffMsg.id });
    let mine = (await chatApi.get(S.chat_id)).messages.find(m => m.message === `Thank you! ${run}`)!;
    expect(mine.reply_to?.id).toBe(staffMsg.id);
    expect((await chatApi.edit(S.chat_id, mine.id, `Thanks a lot! ${run}`)).is_edited).toBe(true);
    mine = await chatApi.remove(S.chat_id, mine.id);
    expect(mine.is_deleted).toBe(true);
    const sent = await chatApi.sendFile(S.chat_id, { file: png('towel.png'), message: 'This one' });
    expect(sent.message_type).toBe('image');

    // One active chat per booking: the refusal names the open one.
    const dup = await expectApiError(chatApi.start({ booking_id: S.in_house_booking_id, initial_message: 'Hello again' }), 400);
    expect(dup.fieldErrors.chat_id).toBe(S.chat_id);
  });

  it('tips a staff member: onto the room bill, and paid online', async () => {
    const staff = await tipsApi.staff(S.in_house_booking_id);
    expect(staff.staff.map(s => s.id)).toContain(S.staff_id);
    const room = await tipsApi.create({ booking_id: S.in_house_booking_id, staff_id: S.staff_id, amount: '2000.00', charge_to_room: true });
    expect(room.payment).toBeNull();
    expect(room.tip.charged_to_room).toBe(true);
    const online = await tipsApi.create({ booking_id: S.in_house_booking_id, staff_id: S.staff_id, amount: '5000.00', message: 'Thank you!' });
    const v = await tipsApi.verifyPayment(online.tip.id, { transaction_id: paidTransaction(online.payment!.data.link) });
    expect(v.tip?.payment_status).toBe('completed');
    expect((await tipsApi.stats()).total_tips).toBeGreaterThanOrEqual(1);
  });

  it('books, pays for, edits and cancels an airport pickup', async () => {
    const q = { pickup_location_id: S.airport_id, destination_address: 'Palmview Resort & Spa, Lekki', vehicle_type: 'SUV' as const, luggage_count: 3, booking_id: S.upcoming_booking_id };
    const est = await pickupsApi.estimate(q);
    expect(est.is_precise).toBe(true);
    const { pickup_request: p } = await pickupsApi.create({ ...q, pickup_date: day(2), pickup_time: '14:30', passenger_count: 2, flight_number: 'BA75', airline: 'British Airways' });
    expect(p.total_fare).toBe(est.estimated_total_fare);
    const pay = await pickupsApi.pay(p.confirmation_code);
    await pickupsApi.verifyPayment(p.confirmation_code, { transaction_id: paidTransaction(pay.data.link) });
    expect((await pickupsApi.get(p.confirmation_code)).payment_status).toBe('paid');
    expect((await pickupsApi.update(p.confirmation_code, { luggage_count: 4 })).pickup_request.luggage_count).toBe(4);
    const cancelled = await pickupsApi.cancel(p.confirmation_code, 'Taking a taxi instead');
    expect(cancelled.pickup_request.status).toBe('CANCELLED');
    expect(toNumber(cancelled.pickup_request.cancellation_fee)).toBe(0); // more than 24 h ahead
    expect((await pickupsApi.summary()).statistics.total_requests).toBeGreaterThanOrEqual(1);
  });

  it('reports a problem, replies, and rates the resolution once resolved', async () => {
    const c = await complaintsApi.create({ booking_id: S.in_house_booking_id, complaint_type: 'ROOM', subject: `AC not cooling ${run}`, description: 'Warm air since last night.', priority: 'MEDIUM' });
    await expectApiError(complaintsApi.rate(c.complaint_id, { rating: 4, is_satisfied: true }), 400);
    await complaintsApi.respond(c.complaint_id, 'Still warm this morning.');
    expect((await complaintsApi.get(c.complaint_id)).responses).toHaveLength(1);
    await complaintsApi.resolve(c.complaint_id);
    expect((await complaintsApi.rate(c.complaint_id, { rating: 4, is_satisfied: true, feedback: 'Fixed.' })).status).toBe('CLOSED');
  });

  it('reviews the finished stay with a photo, then edits it', async () => {
    const mine = await reviewsApi.mine();
    let review = mine.results.find(r => r.booking === S.finished_booking_id);
    if (!review) {
      review = await reviewsApi.create({ booking_id: S.finished_booking_id, overall_rating: 4, service_rating: 5, title: 'Good for work', review_text: 'Quiet room and a great desk for work.', trip_type: 'business' });
      expect(review.points_awarded).toBeGreaterThan(0);
      await expectApiError(reviewsApi.create({ booking_id: S.finished_booking_id, overall_rating: 4, title: 'Again', review_text: 'Second review attempt' }), 400);
    }
    const added = await reviewsApi.addImages(review.id, [png('view.png')]);
    expect(added.images.length).toBeGreaterThan(0);
    expect((await reviewsApi.update(review.id, { overall_rating: 5 })).overall_rating).toBe(5);
  });

  it('reads and clears notifications', async () => {
    const list = await notificationsApi.list({ ordering: '-created_at' });
    expect(list.count).toBeGreaterThan(0);
    await notificationsApi.markRead(list.results[0].id);
    await notificationsApi.markAllRead();
    expect((await notificationsApi.unreadCount()).unread).toBe(0);
  });

  it('can’t chat on a booking that isn’t checked in', async () => {
    const err = await chatApi.start({ booking_id: S.upcoming_booking_id, initial_message: 'Is early check-in possible?' }).then(() => null, e => e);
    expect(err).toBeInstanceOf(ApiError);
  });
});
