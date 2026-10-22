import { apiClient } from '@/utils/api';
import type {
  AdClick, AdsResponse, HomeFeed, HotelCard, HotelDetail, HotelFilters, HotelService, HotelsFeed, Paginated, RecentSearch,
  Review, ReviewStats, RoomCard, RoomDetail, RoomsQuery, UUID,
} from '@/types/api';

// Customer guide 5: browsing hotels. All of it works signed out; signed in, some answers are personalised.

export const hotelsApi = {
  /** Sections in `order`; unknown section types are skipped by the page. */
  homeFeed: (location?: { latitude: number | string; longitude: number | string }) =>
    apiClient.get<HomeFeed>('/customers/home-feed/', location),
  /** The older, simpler feed. */
  feed: () => apiClient.get<HotelsFeed>('/hotels/feed/'),

  /** Paginated HotelCards. No date filter: availability is per room type (rooms()). */
  search: (filters?: HotelFilters) => apiClient.get<Paginated<HotelCard>>('/hotels/', filters),
  get: (hotelId: UUID) => apiClient.get<HotelDetail>(`/hotels/${hotelId}/`),
  /** Always pass the dates once picked: prices change by night. */
  rooms: (hotelId: UUID, query?: RoomsQuery) => apiClient.get<Paginated<RoomCard>>(`/hotels/${hotelId}/rooms/`, query),
  room: (roomId: UUID, query?: RoomsQuery) => apiClient.get<RoomDetail>(`/hotels/public/rooms/${roomId}/`, query),

  /** Add-ons a booking can include (bare array). */
  services: (hotelId: UUID) => apiClient.get<HotelService[]>(`/customers/hotels/${hotelId}/services/`),
  reviews: (hotelId: UUID, params?: { page?: number }) => apiClient.get<Paginated<Review>>(`/customers/hotels/${hotelId}/reviews/`, params),
  reviewStats: (hotelId: UUID) => apiClient.get<ReviewStats>(`/customers/hotels/${hotelId}/reviews/stats/`),
};

/** Remembered while signed in: the latest 10 place or word searches. */
export const recentSearchesApi = {
  list: () => apiClient.get<RecentSearch[]>('/customers/recent-searches/'),
  forget: (id: number) => apiClient.delete<void>(`/customers/recent-searches/${id}/`),
  clear: () => apiClient.delete<void>('/customers/recent-searches/'),
};

export const adsApi = {
  list: () => apiClient.get<AdsResponse>('/customers/ads/'),
  /** Signed in: count the tap, then follow the ad's link. */
  click: (adId: UUID) => apiClient.post<AdClick>(`/customers/ads/${adId}/click/`),
};
