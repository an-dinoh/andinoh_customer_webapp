import { apiClient, bookingToken } from '@/utils/api';
import type {
  AlreadyPaid, AnyBooking, BookedForFriend, BookingCreate, BookingFilters, BookingsSummary, CancelResult, ExtendResult,
  FlightCancelReview, GuestBooking, GuestBookingCreated, GuestDetails, HotelBooking, MessageResponse, Paginated,
  PaymentStart, Quote, Receipt, ReceiptSummary, StayRequest, StayVerifyResult, UUID, VerifyIds,
} from '@/types/api';

// Customer guide 6 (book signed in), 8 (pay), 9 (my bookings, receipts, cancel, extend).

const redirect = (redirect_url?: string) => (redirect_url ? { redirect_url } : undefined);

export const bookingsApi = {
  /** The exact price for this input; holds and saves nothing. Works signed in or out. */
  quote: (body: StayRequest) => apiClient.post<Quote>('/bookings/quote/', body),
  /** Holds the rooms for 30 minutes (`hold_expires_at`); go straight to payment. */
  create: (body: BookingCreate) => apiClient.post<HotelBooking>('/customers/bookings/create/', body),
  /** The booking stays in the payer's account; the friend gets the confirmation email. */
  bookForFriend: (body: BookingCreate & GuestDetails) => apiClient.post<BookedForFriend>('/customers/bookings/book-for-friend/', body),

  /** Starts a new payment attempt (an extension's too); `already_paid` counts as success. */
  pay: (bookingId: UUID, redirect_url?: string) =>
    apiClient.post<PaymentStart | AlreadyPaid>(`/bookings/${bookingId}/pay/`, redirect(redirect_url)),
  /** 200 confirmed · 202 processing · 400 ApiError with a `code` (guide 6.4). */
  verifyPayment: (bookingId: UUID, ids: VerifyIds) => apiClient.post<StayVerifyResult>(`/bookings/${bookingId}/verify-payment/`, ids),

  /** Hotel and flight bookings, newest first. */
  list: (filters?: BookingFilters) => apiClient.get<Paginated<AnyBooking>>('/customers/bookings/', filters),
  get: (bookingId: UUID) => apiClient.get<AnyBooking>(`/customers/bookings/${bookingId}/`),
  summary: () => apiClient.get<BookingsSummary>('/customers/bookings/summary/'),

  /** Hotel: 200 with the refund. A ticketed flight: 202 with a cancellation request our team reviews. */
  cancel: (bookingId: UUID, cancellation_reason?: string) =>
    apiClient.post<CancelResult<AnyBooking> | FlightCancelReview>(`/customers/bookings/${bookingId}/cancel/`, cancellation_reason ? { cancellation_reason } : {}),
  /** Confirmed or checked-in stays, up to 30 nights at a time; pay to confirm unless `payment_required` is false. */
  extend: (bookingId: UUID, new_checkout_date: string, redirect_url?: string) =>
    apiClient.post<ExtendResult>(`/customers/bookings/${bookingId}/extend/`, { new_checkout_date, ...redirect(redirect_url) }),

  /** Moves a guest booking into this account with its emailed link (7.6). */
  claim: (confirmation_code: string, token: string) =>
    apiClient.post<MessageResponse & { booking_id: UUID }>('/customers/bookings/claim/', { confirmation_code, token }),
};

export const receiptsApi = {
  list: (params?: { booking_id?: UUID; page?: number }) => apiClient.get<Paginated<ReceiptSummary>>('/customers/receipts/', params),
  get: (receiptId: UUID) => apiClient.get<Receipt>(`/customers/receipts/${receiptId}/`),
  resend: (receiptId: UUID) => apiClient.post<MessageResponse>(`/customers/receipts/${receiptId}/resend/`),
  /** A locked PDF: andinoh-receipt-<number>.pdf. */
  pdf: (receiptId: UUID) => apiClient.download(`/customers/receipts/${receiptId}/pdf/`),
};

/** Booking without an account (guide 7): the confirmation code plus the secret token. */
export const guestBookingsApi = {
  create: (body: StayRequest & BookingCreate & GuestDetails) => apiClient.post<GuestBookingCreated>('/bookings/guest/', body),
  /** Always 200; a new link is emailed and the old one stops working. */
  lookup: (confirmation_code: string, email: string) =>
    apiClient.post<MessageResponse>('/bookings/guest/lookup/', { confirmation_code, email }),

  get: (code: string, token: string) => apiClient.get<GuestBooking>(`/bookings/guest/${code}/`, undefined, bookingToken(token)),
  pay: (code: string, token: string, redirect_url?: string) =>
    apiClient.post<PaymentStart | AlreadyPaid>(`/bookings/guest/${code}/pay/`, redirect(redirect_url), bookingToken(token)),
  verifyPayment: (code: string, token: string, ids: VerifyIds) =>
    apiClient.post<StayVerifyResult>(`/bookings/guest/${code}/verify-payment/`, ids, bookingToken(token)),
  cancel: (code: string, token: string, cancellation_reason?: string) =>
    apiClient.post<CancelResult<GuestBooking>>(`/bookings/guest/${code}/cancel/`, cancellation_reason ? { cancellation_reason } : {}, bookingToken(token)),
  receipt: (code: string, token: string, receiptId: UUID) =>
    apiClient.get<Receipt>(`/bookings/guest/${code}/receipts/${receiptId}/`, undefined, bookingToken(token)),
  receiptPdf: (code: string, token: string, receiptId: UUID) =>
    apiClient.download(`/bookings/guest/${code}/receipts/${receiptId}/pdf/`, undefined, bookingToken(token)),
};
