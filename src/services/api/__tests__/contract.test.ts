/**
 * Every endpoint in the Customer App guide, replayed from the backend's captured examples: the service
 * must send the captured request (method, path, query, body, headers) and hand back the captured
 * response, and error examples must surface as an ApiError carrying the server's message.
 */
import { ApiError, apiClient } from '@/utils/api';
import { readableError } from '@/utils/notify';
import {
  adsApi, appApi, authApi, bookingsApi, chatApi, complaintsApi, currencyApi, devicesApi, eventsApi, flightsApi, guestBookingsApi,
  helpApi, hotelsApi, legalApi, locationsApi, notificationsApi, pickupsApi, platformNotificationsApi, profileApi, receiptsApi,
  referralsApi, reviewsApi, statementApi, tipsApi, uploadsApi,
} from '@/services/api';
import { example, exampleNames, expectRequestMatches, replay, seg, type App, type Example } from './harness';

type Call = (ex: Example) => Promise<unknown>;
const body = (ex: Example) => ex.request.body as any;
const q = (ex: Example) => (ex.request.query ?? {}) as any;
const file = (name: string, type = 'image/png') => new File(['x'], name, { type });
const TOKEN = 'guest-secret-token';

const CUSTOMER: Record<string, Call> = {
  // 3 · session and authentication
  auth_register: ex => authApi.register(body(ex)),
  err_register_weak_password: ex => authApi.register(body(ex)),
  auth_login: ex => authApi.login(body(ex)),
  auth_login_after_applying: ex => authApi.login(body(ex)),
  err_login_bad: ex => authApi.login(body(ex)),
  auth_refresh: ex => authApi_refresh(body(ex).refresh_token),
  auth_logout: ex => authApi.logout(body(ex).refresh_token),
  auth_sessions: () => authApi.sessions(),
  auth_email_verify_request: () => authApi.requestEmailCode(),
  auth_email_verify_confirm: ex => authApi.confirmEmail(body(ex).otp),
  err_email_verify_bad: ex => authApi.confirmEmail(body(ex).otp),
  auth_pw_reset_request: ex => authApi.requestPasswordReset(body(ex).email),
  auth_pw_reset_verify: ex => authApi.verifyResetCode(body(ex).email, body(ex).otp),
  auth_profile_get: () => authApi.profile(),
  auth_profile_patch: ex => authApi.updateProfile(body(ex)),
  profile_delete: ex => profileApi.deleteAccount(body(ex).password),
  err_401: () => bookingsApi.list(),

  // 4 · app start, help, legal
  config: () => appApi.config(),
  faqs: () => appApi.faqs(),
  support_categories: () => helpApi.categories(),
  support_submit: ex => appApi.contactSupport(body(ex)),
  legal_list: () => legalApi.list(),
  analytics_track: ex => appApi.track(body(ex)),
  currencies: () => currencyApi.list(),

  // 5 · browsing hotels
  home_feed: () => hotelsApi.homeFeed(),
  home_feed_signed_in: () => hotelsApi.homeFeed(),
  hotels_feed: () => hotelsApi.feed(),
  hotels_list: ex => hotelsApi.search(q(ex)),
  hotel_detail: ex => hotelsApi.get(seg(ex, 1)),
  hotel_rooms: ex => hotelsApi.rooms(seg(ex, 1), q(ex)),
  room_detail: ex => hotelsApi.room(seg(ex, 3)),
  hotel_services: ex => hotelsApi.services(seg(ex, 2)),
  hotel_reviews: ex => hotelsApi.reviews(seg(ex, 2)),
  hotel_review_stats: ex => hotelsApi.reviewStats(seg(ex, 2)),
  ads: () => adsApi.list(),
  ad_click: ex => adsApi.click(seg(ex, 2)),

  // 6 · booking a stay
  quote: ex => bookingsApi.quote(body(ex)),
  quote_pay_at_hotel: ex => bookingsApi.quote(body(ex)),
  err_quote_bad_dates: ex => bookingsApi.quote(body(ex)),
  err_quote_bad_quantity: ex => bookingsApi.quote(body(ex)),
  booking_create: ex => bookingsApi.create(body(ex)),
  booking_for_friend: ex => bookingsApi.bookForFriend(body(ex)),
  booking_pay: ex => bookingsApi.pay(seg(ex, 1)),
  booking_pay_already_paid: ex => bookingsApi.pay(seg(ex, 1)),
  booking_verify_success: ex => bookingsApi.verifyPayment(seg(ex, 1), body(ex)),
  booking_verify_pending: ex => bookingsApi.verifyPayment(seg(ex, 1), body(ex)),
  err_booking_verify_underpaid: ex => bookingsApi.verifyPayment(seg(ex, 1), body(ex)),

  // 7 · guest checkout
  guest_create: ex => guestBookingsApi.create(body(ex)),
  err_guest_missing_details: ex => guestBookingsApi.create(body(ex)),
  guest_detail: ex => guestBookingsApi.get(seg(ex, 2), TOKEN),
  err_guest_bad_token: ex => guestBookingsApi.get(seg(ex, 2), TOKEN),
  guest_pay: ex => guestBookingsApi.pay(seg(ex, 2), TOKEN),
  guest_verify: ex => guestBookingsApi.verifyPayment(seg(ex, 2), TOKEN, body(ex)),
  guest_cancel: ex => guestBookingsApi.cancel(seg(ex, 2), TOKEN, body(ex).cancellation_reason),
  guest_receipt: ex => guestBookingsApi.receipt(seg(ex, 2), TOKEN, seg(ex, 4)),
  guest_lookup: ex => guestBookingsApi.lookup(body(ex).confirmation_code, body(ex).email),
  guest_claim: ex => bookingsApi.claim(body(ex).confirmation_code, body(ex).token),

  // 9 · my bookings, receipts, cancel, extend
  bookings_list: () => bookingsApi.list(),
  bookings_summary: () => bookingsApi.summary(),
  booking_detail: ex => bookingsApi.get(seg(ex, 2)),
  err_booking_404: ex => bookingsApi.get(seg(ex, 2)),
  booking_cancel: ex => bookingsApi.cancel(seg(ex, 2), body(ex).cancellation_reason),
  booking_extend: ex => bookingsApi.extend(seg(ex, 2), body(ex).new_checkout_date),
  receipts_list: () => receiptsApi.list(),
  receipt_detail: ex => receiptsApi.get(seg(ex, 2)),
  receipt_resend: ex => receiptsApi.resend(seg(ex, 2)),

  // 10 · chat, tips, pickups, complaints
  chat_create: ex => chatApi.start(body(ex)),
  chat_list: () => chatApi.list(),
  chat_detail: ex => chatApi.get(seg(ex, 2)),
  chat_messages: ex => chatApi.messages(seg(ex, 2)),
  chat_send: ex => chatApi.send(seg(ex, 2), body(ex)),
  err_chat_system_type: ex => chatApi.send(seg(ex, 2), body(ex)),
  chat_read: ex => chatApi.markRead(seg(ex, 2)),
  chat_close: ex => chatApi.close(seg(ex, 2)),
  upload: () => uploadsApi.upload(file('towel.png'), 'chat'),
  tips_staff: ex => tipsApi.staff(q(ex).booking_id),
  tip_create_online: ex => tipsApi.create(body(ex)),
  tip_create_room: ex => tipsApi.create(body(ex)),
  tip_verify: ex => tipsApi.verifyPayment(seg(ex, 2), body(ex)),
  tips_list: () => tipsApi.list(),
  tips_stats: () => tipsApi.stats(),
  pickup_locations: ex => pickupsApi.locations(q(ex)),
  pickup_estimate: ex => pickupsApi.estimate(q(ex)),
  pickup_create: ex => pickupsApi.create(body(ex)),
  pickup_pay: ex => pickupsApi.pay(seg(ex, 2)),
  pickup_verify: ex => pickupsApi.verifyPayment(seg(ex, 2), body(ex)),
  pickups_list: () => pickupsApi.list(),
  pickup_detail: ex => pickupsApi.get(seg(ex, 2)),
  pickup_summary: () => pickupsApi.summary(),
  pickup_update: ex => pickupsApi.update(seg(ex, 2), body(ex)),
  pickup_cancel: ex => pickupsApi.cancel(seg(ex, 2), body(ex).cancellation_reason),
  complaint_create: ex => complaintsApi.create(body(ex)),
  complaints_list: () => complaintsApi.list(),
  complaints_stats: () => complaintsApi.stats(),
  complaint_detail: ex => complaintsApi.get(seg(ex, 2)),
  complaint_response: ex => complaintsApi.respond(seg(ex, 2), body(ex).message),
  complaint_resolve: ex => complaintsApi.resolve(seg(ex, 2)),
  complaint_rate: ex => complaintsApi.rate(seg(ex, 2), body(ex)),
  complaint_rate_too_early: ex => complaintsApi.rate(seg(ex, 2), body(ex)),

  // 11 · reviews, referrals, statement
  review_create: ex => reviewsApi.create(body(ex)),
  review_images: ex => reviewsApi.addImages(Number(seg(ex, 2)), [file('view.png')]),
  review_update: ex => reviewsApi.update(Number(seg(ex, 2)), body(ex)),
  reviews_mine: () => reviewsApi.mine(),
  referrals_create: ex => referralsApi.invite(body(ex).referral_email),
  referrals: () => referralsApi.list(),
  referral_stats: () => referralsApi.stats(),
  statement_range: () => statementApi.range(),
  statement: ex => statementApi.pdf(q(ex).start, q(ex).end),
  statement_dates_missing: () => statementApiRaw(),
  statement_before_opening: ex => statementApi.pdf(q(ex).start, q(ex).end),
  statement_future_end: ex => statementApi.pdf(q(ex).start, q(ex).end),

  // 12 · notifications and push
  notifications: () => notificationsApi.list(),
  notifications_unread: () => notificationsApi.unreadCount(),
  notification_read: ex => notificationsApi.markRead(Number(seg(ex, 3))),
  notifications_read_all: () => notificationsApi.markAllRead(),
  device_register: ex => devicesApi.register(body(ex)),
  device_register_again: ex => devicesApi.register(body(ex)),
  devices: () => devicesApi.list(),
  device_unregister: ex => devicesApi.unregister(Number(seg(ex, 2))),

  // 13 · profile and settings
  cust_profile_get: () => profileApi.get(),
  cust_profile_patch: ex => profileApi.update(body(ex)),
  cust_profile_picture: () => profileApi.setPhoto(file('me.png')),
  cust_dashboard: () => profileApi.dashboard(),
  cust_location: ex => profileApi.saveLocation(body(ex).latitude, body(ex).longitude),
  cust_addresses: () => profileApi.addresses(),
  cust_address_create: ex => profileApi.addAddress(body(ex)),
  cust_notif_prefs: ex => profileApi.updateNotificationPreferences(body(ex)),
  cust_preferences: ex => profileApi.setPreference(body(ex)),

  // 14 · flights
  flight_locations: ex => flightsApi.places(q(ex).keyword),
  flight_search: ex => flightsApi.search(q(ex)),
  flight_booking_create: ex => flightsApi.book(body(ex)),
  flight_pay: ex => flightsApi.pay(seg(ex, 2)),
  flight_verify: ex => flightsApi.verifyPayment(seg(ex, 2), body(ex)),
  flight_cancel_ticketed: ex => bookingsApi.cancel(seg(ex, 2), body(ex).cancellation_reason),
  flight_cancellations: () => flightsApi.cancellations(),
  flight_cancellation_withdraw: ex => flightsApi.withdrawCancellation(seg(ex, 2)),

  // 15 · event venues
  event_spaces: ex => eventsApi.spaces(q(ex)),
  event_services: ex => eventsApi.addOns(q(ex)),
  event_space_availability: ex => eventsApi.availability(seg(ex, 2), q(ex).date),
  event_booking_create: ex => eventsApi.book(body(ex)),
  event_booking_conflict: ex => eventsApi.book(body(ex)),
  event_bookings_mine: () => eventsApi.mine(),
  event_booking_update: ex => eventsApi.update(seg(ex, 2), body(ex)),
  event_booking_cancel: ex => eventsApi.cancel(seg(ex, 2)),
  event_quotes_mine: () => eventsApi.quotes(),

  // 16 · becoming an inspector
  inspector_apply: () => profileApi.applyToInspect(),
};

const SHARED: Record<string, Call> = {
  auth_email_verify_request: () => authApi.requestEmailCode(),
  auth_email_verify_confirm: ex => authApi.confirmEmail(body(ex).otp),
  auth_logout: ex => authApi.logout(body(ex).refresh_token),
  auth_password_change: ex => authApi.changePassword(body(ex).current_password, body(ex).new_password),
  auth_password_reset_request: ex => authApi.requestPasswordReset(body(ex).email),
  auth_password_reset_request_staff: ex => authApi.requestPasswordReset(body(ex).email),
  auth_password_reset_verify_otp: ex => authApi.verifyResetCode(body(ex).email, body(ex).otp),
  auth_password_reset_confirm: ex => authApi.resetPassword(body(ex).reset_token, body(ex).new_password),
  auth_password_reset_confirm_one_step: ex => authApi.resetPasswordWithCode(body(ex).email, body(ex).otp, body(ex).new_password),
  auth_profile: () => authApi.profile(),
  auth_profile_update: ex => authApi.updateProfile(body(ex)),
  auth_refresh: ex => authApi_refresh(body(ex).refresh_token),
  auth_sessions: () => authApi.sessions(),
  auth_sessions_sign_out_others: ex => authApi.signOutOthers(body(ex).refresh_token),
  auth_sessions_sign_out_all: () => authApi.signOutEverywhere(),
  currencies: () => currencyApi.list(),
  currency_convert: ex => currencyApi.convert(q(ex).amount, q(ex).from, q(ex).to),
  currency_detect: ex => currencyApi.detect(q(ex).country_id),
  legal_page: ex => legalApi.page(seg(ex, 2)),
  legal_pages: () => legalApi.list(),
  locations_countries: () => locationsApi.countries(),
  locations_states: ex => locationsApi.states(q(ex).country),
  locations_cities: ex => locationsApi.cities(q(ex).state),
  locations_cities_search: ex => locationsApi.searchCities(q(ex).search),
  locations_cities_no_filter: () => apiClient.get('/shared/locations/cities/'),
  locations_areas: ex => locationsApi.areas(q(ex).city),
  notifications_list: () => platformNotificationsApi.list(),
  notifications_unread_count: () => platformNotificationsApi.unreadCount(),
  notification_read: ex => platformNotificationsApi.markRead(seg(ex, 2)),
  notifications_read_all: () => platformNotificationsApi.markAllRead(),
  support_categories: () => helpApi.categories(),
  support_articles: () => helpApi.articles(),
  support_articles_popular: () => helpApi.popular(),
  support_article_search: ex => helpApi.search(q(ex).q),
  support_article: ex => helpApi.article(seg(ex, 2)),
  support_article_feedback: ex => helpApi.feedback(seg(ex, 2), body(ex).is_helpful),
};

/** Shared examples for other apps: support tickets are for hotel and inspector accounts (customers use /customers/support/). */
const SHARED_NOT_FOR_CUSTOMERS = new Set(['support_ticket_create', 'support_ticket_detail', 'support_ticket_reply', 'support_tickets']);

const DOWNLOADS = new Set(['statement']);

// Calls without a service method of their own: token refresh lives in the HTTP client, and two examples
// check that requests the app never sends (no dates, no city filter) still fail cleanly.
function authApi_refresh(refresh_token: string) { return apiClient.post('/auth/refresh/', { refresh_token }); }
function statementApiRaw() { return apiClient.download('/customers/statement/'); }

async function check(ex: Example, call: Call, name: string) {
  const recorder = replay(ex, name === 'statement' ? { 'x-statement-number': 'ST-0001' } : {});
  if (ex.status >= 400) {
    const err = await call(ex).then(() => null, e => e);
    expectRequestMatches(ex, recorder.sent());
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(ex.status);
    const sentence = (ex.body as { error?: string }).error;
    const fields = (ex.body as { errors?: Record<string, unknown> }).errors;
    if (sentence && ex.status !== 401 && ex.status < 500) {
      // People see the server's sentence, minus its "Validation failed: field: …" wrapper.
      expect(err.message).toBe(readableError(sentence, fields as Record<string, string | string[]> | undefined));
      expect(err.message).not.toMatch(/^Validation failed/);
    }
    if (fields) expect(Object.keys(err.fieldErrors).sort()).toEqual(Object.keys(fields).sort());
    if ((ex.body as { code?: string }).code) expect(err.code).toBe((ex.body as { code: string }).code);
    return;
  }
  const result = await call(ex);
  expectRequestMatches(ex, recorder.sent());
  if (DOWNLOADS.has(name)) {
    const meta = ex.body as { content_disposition: string; content_type: string };
    const download = result as { filename: string; contentType: string; blob: Blob; headers: Record<string, string> };
    expect(download.blob).toBeInstanceOf(Blob);
    expect(download.contentType).toBe(meta.content_type);
    expect(meta.content_disposition).toContain(download.filename);
    expect(download.headers['x-statement-number']).toBe('ST-0001');
    return;
  }
  expect(result ?? null).toEqual(ex.body);
}

function suite(app: App, calls: Record<string, Call>, skip: Set<string> = new Set()) {
  describe(app, () => {
    it('covers every captured example', () => {
      const missing = exampleNames(app).filter(n => !(n in calls) && !skip.has(n));
      expect(missing).toEqual([]);
      const stale = Object.keys(calls).filter(n => !exampleNames(app).includes(n));
      expect(stale).toEqual([]);
    });
    for (const name of Object.keys(calls)) {
      it(name, async () => { await check(example(name, app), calls[name], name); });
    }
  });
}

suite('customer-app', CUSTOMER);
suite('shared', SHARED, SHARED_NOT_FOR_CUSTOMERS);
