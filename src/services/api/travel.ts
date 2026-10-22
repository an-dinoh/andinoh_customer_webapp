import { apiClient } from '@/utils/api';
import type {
  Airport, EventAddOn, EventBooking, EventBookingInput, EventQuery, EventQuote, EventSpace, FlightBooking, FlightBookingRequest,
  FlightCancellation, FlightPlace, FlightSearchParams, FlightSearchResult, FlightVerifyResult, PageParams, Paginated, PaymentStart,
  SpaceAvailability, UUID, VerifyIds,
} from '@/types/api';

// Customer guide 14 (flights) and 15 (event venues).

export const flightsApi = {
  /** Paid provider lookups: debounce. */
  places: (keyword: string) => apiClient.get<FlightPlace[]>('/flights/locations/', { keyword }),
  airports: (search: string, params?: PageParams) => apiClient.get<Paginated<Airport>>('/flights/airports/', { search, ...params }),
  /** 30 searches an hour. */
  search: (params: FlightSearchParams) => apiClient.get<FlightSearchResult>('/flights/search/', params),
  details: (offerId: string) => apiClient.get<Record<string, unknown>>(`/flights/${offerId}/details/`),
  /** Re-priced by the server first. Domestic (`source: "travu"`) can't be booked yet. */
  book: (body: FlightBookingRequest) => apiClient.post<FlightBooking>('/customers/bookings/create/', body),
  pay: (bookingId: UUID, redirect_url?: string) =>
    apiClient.post<PaymentStart>(`/flights/bookings/${bookingId}/pay/`, redirect_url ? { redirect_url } : undefined),
  verifyPayment: (bookingId: UUID, ids: VerifyIds) => apiClient.post<FlightVerifyResult>(`/flights/bookings/${bookingId}/verify-payment/`, ids),
  cancellations: (params?: PageParams) => apiClient.get<Paginated<FlightCancellation>>('/flights/cancellations/', params),
  withdrawCancellation: (requestId: UUID) => apiClient.post<FlightCancellation>(`/flights/cancellations/${requestId}/withdraw/`),
};

export const eventsApi = {
  spaces: (query?: EventQuery) => apiClient.get<Paginated<EventSpace>>('/hotels/event-spaces/', query),
  addOns: (query?: EventQuery) => apiClient.get<Paginated<EventAddOn>>('/hotels/event-services/', query),
  /** Booked slots include each booking's set-up and tear-down. */
  availability: (spaceId: UUID, date: string) => apiClient.get<SpaceAvailability>(`/hotels/event-spaces/${spaceId}/availability/`, { date }),
  /** Priced by the server; an overlap is a 400 with `errors.conflict`. */
  book: (body: EventBookingInput) => apiClient.post<EventBooking>('/hotels/event-bookings/', body),
  mine: (params?: PageParams) => apiClient.get<Paginated<EventBooking>>('/hotels/event-bookings/', params),
  update: (bookingId: UUID, body: Partial<EventBookingInput>) => apiClient.patch<EventBooking>(`/hotels/event-bookings/${bookingId}/`, body),
  /** 204; money already paid is returned by the hotel. */
  cancel: (bookingId: UUID) => apiClient.delete<void>(`/hotels/event-bookings/${bookingId}/`),
  quotes: (params?: PageParams) => apiClient.get<Paginated<EventQuote>>('/hotels/event-quotes/', params),
};
