import type { DateString, DateTime, Money, PageParams, UUID } from './common';
import type { CancellationType } from './hotels';
import type { FlightBooking } from './flights';

// Customer guide 6–9: quotes, booking (signed in and as a guest), payments, my bookings, receipts.

export type BookingStatus = 'pending' | 'hold' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
/** `card`/`online` pay now; `cash` pays at the hotel (only if the hotel allows it). */
export type StayPaymentMethod = 'card' | 'online' | 'cash';

export interface StayRequest {
  hotel_id: UUID;
  check_in_date: DateString;
  check_out_date: DateString;
  adults: number;
  children?: number;
  infants?: number;
  rooms: { room_id: UUID; quantity: number }[];
  services?: { offering_id: UUID; quantity: number }[];
  payment_method?: StayPaymentMethod;
  /** Signed in only; 100 points = ₦1. */
  points_to_use?: number;
}

export interface QuoteRoom {
  room_id: UUID;
  room_type: string;
  quantity: number;
  nights: number;
  list_total: Money;
  discount_total: Money;
  total: Money;
  price_per_night: Money;
  list_price_per_night: Money;
  discounts: string[];
}

export interface Quote {
  hotel_id: UUID;
  currency: string;
  nights: number;
  rooms: QuoteRoom[];
  room_charges: Money;
  services: Money;
  taxes: Money;
  service_fee: Money;
  points_discount: Money;
  total: Money;
  pay_at_hotel: boolean;
  due_online_now: Money;
}

export interface BookingExtras {
  special_requests?: string;
  guest_notes?: string;
  early_check_in_requested?: boolean;
  late_check_out_requested?: boolean;
}

export type BookingCreate = StayRequest & BookingExtras;

export interface GuestDetails {
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
}

export interface PriceBreakdown {
  nights: number;
  room_charges: Money;
  discount: Money;
  incidentals: Money;
  taxes_and_fees: Money;
  taxes: Money;
  service_fee: Money;
  points_discount: Money;
  total: Money;
  paid: Money;
  balance_due: Money;
}

export interface BookingRoom {
  id: UUID;
  /** "TBD-…" until the hotel assigns one. */
  room_number: string;
  room_type: string;
  price_per_night: Money;
  num_nights: number;
  list_price_per_night: Money;
  discount_titles: string;
}

export interface BookingServiceLine {
  id: number;
  service_type: string;
  service_name: string;
  description: string;
  price: Money;
  quantity: number;
  service_date: DateString | null;
  notes: string;
}

export interface BookingPayment {
  id: UUID;
  payment_method: string;
  /** Negative for refunds. */
  amount: Money;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | string;
  transaction_id: string | null;
  notes: string;
  created_at: DateTime;
}

export type ReceiptKind = 'booking_payment' | 'booking_refund' | string;

export interface ReceiptSummary {
  id: UUID;
  number: string;
  kind: ReceiptKind;
  kind_display: string;
  issued_at: DateTime;
  amount: Money;
  currency: string;
  payment_method: string;
  transaction_reference: string;
  object_type: string;
  object_id: UUID;
  reference: string;
  recipient_name: string;
  recipient_email: string;
  emailed_at: DateTime | null;
}

export interface ReceiptBookingSnapshot {
  confirmation_code: string;
  status: string;
  hotel: { name: string; address: string; phone: string; email: string; check_in_time: string; check_out_time: string };
  check_in_date: DateString;
  check_out_date: DateString;
  nights: number;
  guests: number;
  rooms: { room_type: string; room_number: string; nights: number; price_per_night: Money; list_price_per_night: Money; discounts: string; total: Money }[];
  services: { name: string; quantity: number; total: Money }[];
  room_charges: Money;
  discount: Money;
  incidentals: Money;
  taxes_and_fees: Money;
  taxes: Money;
  service_fee: Money;
  points_discount: Money;
  total: Money;
  paid: Money;
  balance_due: Money;
  pay_at_hotel: boolean;
  currency: string;
}

export interface Receipt extends ReceiptSummary {
  details: { booking?: ReceiptBookingSnapshot; paid_at?: DateTime; notes?: string; [key: string]: unknown };
}

export interface RefundRule { min_days_before_check_in: number; refund_percent: Money }

export interface CancellationPolicy {
  type: CancellationType | string;
  label: string;
  deposit_required_pct: Money;
  refund_schedule: RefundRule[];
}

export interface HotelBooking {
  id: UUID;
  booking_type: 'hotel';
  customer: UUID | null;
  hotel: UUID;
  confirmation_code: string;
  check_in_date: DateString;
  check_out_date: DateString;
  num_guests: number;
  status: BookingStatus | string;
  currency: string;
  total_amount: Money;
  paid_amount: Money;
  balance_due: Money;
  pay_at_hotel: boolean;
  price_breakdown: PriceBreakdown;
  rooms: BookingRoom[];
  services: BookingServiceLine[];
  payments: BookingPayment[];
  receipts: ReceiptSummary[];
  folio: unknown;
  hotel_name: string;
  hotel_image: string | null;
  hotel_city: string;
  hotel_address: string;
  hotel_phone: string;
  hotel_email: string;
  check_in_time: string;
  check_out_time: string;
  cancellation_policy: CancellationPolicy | null;
  special_requests: string;
  guest_notes: string;
  hold_expires_at: DateTime | null;
  cancelled_at: DateTime | null;
  created_at: DateTime;
  updated_at: DateTime;
}

/** A booking reached with its confirmation code and secret token (guide 7). */
export interface GuestBooking extends HotelBooking {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
}

/** GET /customers/bookings/ mixes hotel and flight bookings; tell them apart by booking_type. */
export type AnyBooking = HotelBooking | FlightBooking;

export interface BookingFilters extends PageParams {
  status?: BookingStatus | string;
  date_from?: DateString;
  date_to?: DateString;
  search?: string;
}

export interface BookingBrief {
  id: UUID;
  confirmation_code: string;
  check_in_date: DateString;
  check_out_date: DateString;
  total_amount: Money;
  status: string;
  created_at: DateTime;
}

export interface BookingsSummary {
  statistics: {
    total_bookings: number;
    total_spent: number;
    completed_bookings: number;
    cancelled_bookings: number;
    average_rating: number;
    membership_tier: string;
    loyalty_points: number;
  };
  recent_bookings: BookingBrief[];
  upcoming_bookings: BookingBrief[];
}

export interface BookedForFriend { message: string; booking: HotelBooking; note: string }

export interface GuestBookingCreated {
  booking: GuestBooking;
  /** Shown once: keep it with the confirmation code. */
  access_token: string;
  manage_url: string;
  payment_required: boolean;
  message: string;
}

export interface CancelResult<B = HotelBooking> { message: string; refund_amount: Money; booking: B }

export interface ExtendResult {
  message: string;
  booking_id: UUID;
  extension_id: UUID;
  new_checkout_date: DateString;
  additional_nights: number;
  additional_cost: number;
  hold_expires_at: DateTime;
  payment_required: boolean;
  payment: PaymentStart | null;
}

// ---- payments (guide 8) ----------------------------------------------------------------------------

export interface Checkout {
  public_key: string;
  tx_ref: string;
  amount: Money;
  currency: string;
  payment_options: string;
  customer: { email: string; name: string; phonenumber?: string };
  customizations: { title: string; description: string; logo: string };
  meta: Record<string, string>;
  redirect_url: string;
}

/** Every "pay" endpoint. `data.link` is hosted checkout for the web (it can be null). */
export interface PaymentStart {
  status: 'success' | string;
  message: string;
  data: { link: string | null; tx_ref: string };
  checkout: Checkout;
}

export interface AlreadyPaid {
  status: 'already_paid';
  booking: { id: UUID; status: string; rooms: unknown[] };
}

export interface VerifyIds { transaction_id?: string; tx_ref?: string }

/** 200 confirmed; 202 still clearing (`status: "processing"`). Failures throw ApiError (400 with `code`). */
export interface StayVerifyResult {
  status: 'success' | 'processing' | string;
  message?: string;
  transaction_id?: string;
  booking?: { id: UUID; status: string; rooms: unknown[] };
}
