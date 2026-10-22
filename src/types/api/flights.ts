import type { DateString, DateTime, Money, UUID } from './common';

// Customer guide 14: flights.

export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
export type FlightBookingStatus = 'pending' | 'confirmed' | 'failed' | 'cancellation_requested' | 'cancelled' | 'completed';

export interface FlightPlace {
  iata_code: string;
  name: string;
  detailed_name: string;
  city: string;
  country: string;
  type: 'AIRPORT' | 'CITY' | string;
  latitude: number | null;
  longitude: number | null;
}

export interface Airport {
  id: number | UUID;
  name: string;
  iata_code: string;
  city: string;
  country: string;
  latitude: number | string | null;
  longitude: number | string | null;
  is_major: boolean;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departure_date: DateString;
  return_date?: DateString;
  adults?: number;
  children?: number;
  cabin_class?: CabinClass;
}

export interface FlightOffer {
  id: string;
  airline: string;
  airline_code: string;
  airline_logo?: string;
  origin: string;
  destination: string;
  departure_datetime: string;
  arrival_datetime: string;
  /** ISO 8601 duration, e.g. PT6H25M. */
  duration: string;
  price: Money;
  currency: string;
  available_seats: number | null;
  cabin_class: CabinClass | string;
  is_refundable: boolean;
  stops: number;
  segments?: unknown[];
  validating_airline?: string;
  /** `travu` (domestic) can't be booked yet. */
  source: 'amadeus' | 'travu' | string;
  converted_prices?: unknown[];
  return_flight?: FlightOffer | null;
  raw: Record<string, unknown>;
}

export interface FlightSearchResult {
  flights: FlightOffer[];
  count: number;
  source: string;
  message?: string;
}

export interface Passenger {
  first_name: string;
  last_name: string;
  title?: 'MR' | 'MRS' | 'MS' | 'MISS' | 'DR' | string;
  email?: string;
  phone_number?: string;
  date_of_birth?: DateString;
  gender?: 'M' | 'F' | string;
  passport_number?: string;
  passport_expiry?: DateString;
  passport_country_of_issue?: string;
  nationality?: string;
}

export interface FlightBookingRequest {
  flight_offer: Omit<FlightOffer, 'converted_prices' | 'segments' | 'validating_airline' | 'return_flight' | 'airline_logo'> & Partial<FlightOffer>;
  passengers: Passenger[];
}

export interface PassengerDetail {
  id: UUID;
  passenger_type: string;
  first_name: string;
  last_name: string;
  date_of_birth: DateString | null;
  nationality: string;
  passport_number: string;
  passport_expiry: DateString | null;
  passport_country_of_issue: string;
  seat_number: string;
  meal_preference: string;
  baggage_allowance_kg: number | null;
  special_assistance: string;
  ticket_number: string;
}

export interface FlightBooking {
  id: UUID;
  booking_type: 'flight';
  customer: UUID;
  flight_id: string;
  airline: string;
  origin: string;
  destination: string;
  departure_datetime: string;
  arrival_datetime: string;
  price: Money;
  total_price: Money;
  currency: string;
  status: FlightBookingStatus | string;
  num_passengers: number;
  booking_reference: string;
  confirmation_code: string;
  passenger_details: PassengerDetail[];
  created_at: DateTime;
}

export interface FlightVerifyResult {
  status: 'success' | 'processing' | string;
  message?: string;
  transaction_id?: string;
  booking_id?: UUID;
  confirmation_code?: string;
}

export interface FlightCancellation {
  id: UUID;
  flight_booking_id: UUID;
  confirmation_code: string;
  route: string;
  departure_datetime: DateTime;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn' | string;
  status_display: string;
  ticket_issued: boolean;
  paid_amount: Money;
  refund_amount: Money | null;
  currency: string;
  airline_cancelled: boolean;
  review_notes: string;
  reviewed_at: DateTime | null;
  created_at: DateTime;
  updated_at: DateTime;
}

/** 202 from cancelling a ticketed flight: our team reviews it. */
export interface FlightCancelReview { message: string; cancellation_request: FlightCancellation }
