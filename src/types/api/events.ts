import type { DateString, DateTime, Money, PageParams, UUID } from './common';

// Customer guide 15: event venues.

export type SetupStyle = 'theatre' | 'banquet' | 'classroom' | 'boardroom' | 'u_shape' | 'cocktail' | 'cabaret' | string;
export type BillingType = 'per_person' | 'flat_rate' | 'per_hour' | 'per_item';
export type EventStatus = 'draft' | 'confirmed' | 'cancelled' | 'completed';

export interface EventSpace {
  id: UUID;
  hotel: UUID;
  name: string;
  description: string;
  supported_setups: { style: SetupStyle; max_capacity: number }[];
  base_price_per_hour: Money | null;
  base_price_per_day: Money | null;
  images: unknown[];
  virtual_tour_url: string | null;
}

export interface EventAddOn {
  id: UUID;
  hotel: UUID;
  name: string;
  description: string;
  price: Money;
  billing_type: BillingType | string;
}

export interface SpaceAvailability {
  space_id: UUID;
  date: DateString;
  booked_slots: { booking_id: UUID; start_time: DateTime; end_time: DateTime; status: string }[];
}

export interface EventBookingInput {
  space: UUID;
  event_title: string;
  event_type: string;
  setup_style: SetupStyle;
  estimated_guests: number;
  start_time: DateTime;
  end_time: DateTime;
  /** "HH:MM:SS"; "00:00:00" for none. */
  setup_duration: string;
  teardown_duration: string;
  service_ids?: UUID[];
}

export interface EventBooking {
  id: UUID;
  space: UUID;
  customer_id: UUID | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  created_by: UUID | null;
  event_title: string;
  event_type: string;
  setup_style: SetupStyle;
  estimated_guests: number;
  start_time: DateTime;
  end_time: DateTime;
  setup_duration: string;
  teardown_duration: string;
  services: EventAddOn[];
  venue_rate: Money;
  add_ons_total: Money;
  total_amount: Money;
  deposit_paid: boolean;
  amount_paid: Money;
  balance_due: Money;
  status: EventStatus | string;
}

export interface EventQuote {
  id: UUID;
  booking_details: EventBooking;
  expires_at: DateTime;
  status: string;
  contract_document: string | null;
}

export interface EventQuery extends PageParams { hotel_id?: UUID }
