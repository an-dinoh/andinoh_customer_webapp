import type { DateString, DateTime, Money, PageParams, UUID } from './common';

// Customer guide 5: browsing hotels (feed, search, details, rooms, add-ons, reviews) and ads.

export type HotelType = 'luxury' | 'boutique' | 'business' | 'budget' | 'resort' | 'hostel' | 'motel' | 'bed_breakfast';
export type CancellationType = 'flexible' | 'strict' | 'non_refundable';
export type RoomType = 'standard' | 'deluxe' | 'suite' | 'presidential' | 'family' | 'twin' | 'single' | 'double' | 'triple' | 'quad';
export type BedType = 'single' | 'double' | 'queen' | 'king' | 'twin' | 'sofa_bed';
export type ServiceType = 'AIRPORT_PICKUP' | 'CITY_PICKUP' | 'SPA' | 'DINING' | 'LAUNDRY' | 'TOUR' | 'OTHER';

/** Shared by the feed, the list and search. */
export interface HotelCard {
  id: UUID;
  name: string;
  description: string;
  hotel_type: HotelType | string;
  star_rating: number;
  city_name: string;
  state_name: string;
  country_name: string;
  city: UUID | null;
  state: UUID | null;
  country: UUID | null;
  area: UUID | null;
  phone: string;
  email: string;
  logo: string | null;
  primary_image: string | null;
  is_active: boolean;
  is_verified: boolean;
  /** null until the first review: show "New". */
  average_rating: number | null;
  total_rooms: number;
  total_reviews: number;
  /** Lowest base rate before discounts (legacy number): "From ₦…". */
  starting_price?: number | null;
  /** km, only when latitude and longitude were sent. */
  distance: number | null;
}

export interface HotelFilters extends PageParams {
  search?: string;
  city_id?: UUID;
  area_id?: UUID;
  state_id?: UUID;
  country_id?: UUID;
  hotel_type?: HotelType | string;
  star_rating?: number;
  latitude?: number | string;
  longitude?: number | string;
  radius?: number;
  ordering?: 'star_rating' | '-star_rating' | 'created_at' | '-created_at';
  /** Older filters the list still understands. */
  city?: string;
  min_rating?: number;
}

/** A stay's price for the searched nights (guide 5.4). */
export interface RoomOffer {
  nights: number;
  list_price_per_night: Money;
  price_per_night: Money;
  list_total: Money;
  total: Money;
  discount: Money;
  discount_titles: string[];
}

export interface RoomCard {
  id: UUID;
  hotel: UUID;
  room_type: RoomType | string;
  title: string;
  description: string;
  room_size: number | null;
  bed_type: BedType | string;
  max_occupancy: number;
  base_price: Money;
  current_price: number;
  offer: RoomOffer | null;
  display_price: Money | null;
  is_available: boolean;
  total_rooms: number;
  primary_image: string | null;
  availability_summary: { date: DateString; rooms_available: number; is_available: boolean } | null;
  fully_booked_dates: DateString[];
  /** Free rooms of this type for every searched night; 0 = sold out, null = no dates given. */
  min_availability_for_search: number | null;
}

export interface MediaItem {
  id: UUID | number;
  image?: string;
  image_url?: string;
  video?: string;
  caption?: string;
  title?: string;
  is_primary?: boolean;
  [key: string]: unknown;
}

export interface Amenity {
  id: UUID;
  name: string;
  category?: string;
  description?: string;
  is_free?: boolean;
  [key: string]: unknown;
}

export interface HotelService {
  id: UUID;
  service_type: ServiceType | string;
  name: string;
  description: string;
  price: Money;
  is_active: boolean;
  created_at?: DateTime;
  updated_at?: DateTime;
}

export interface HotelVerification {
  verified: boolean;
  inspected: boolean;
  last_inspected_at: DateTime | null;
  inspection_rating: number | null;
}

export interface HotelDetail extends HotelCard {
  address: string;
  latitude: string | null;
  longitude: string | null;
  website: string;
  check_in_time: string;
  check_out_time: string;
  amenities: Amenity[];
  images: MediaItem[];
  videos: MediaItem[];
  policies: Array<Record<string, unknown> | string>;
  rooms: RoomCard[];
  allows_pay_at_hotel: boolean;
  deposit_required_pct: Money;
  cancellation_type: CancellationType | string;
  services: HotelService[];
  verification: HotelVerification;
}

export interface RoomsQuery extends PageParams {
  check_in_date?: DateString;
  check_out_date?: DateString;
}

export interface RoomDayAvailability { date: DateString; rooms_available: number; is_available: boolean; price: Money }

export interface RoomDetail extends Omit<RoomCard, 'availability_summary' | 'min_availability_for_search' | 'primary_image'> {
  max_adults: number;
  max_children: number;
  currency: string | null;
  weekend_price: Money | null;
  peak_season_price: Money | null;
  has_balcony: boolean;
  has_sea_view: boolean;
  has_city_view: boolean;
  has_garden_view: boolean;
  has_mountain_view: boolean;
  amenities: Amenity[];
  images: MediaItem[];
  physical_instances: Array<{ id: UUID; room_number: string; images: MediaItem[]; [key: string]: unknown }>;
  availability: RoomDayAvailability[];
  pricing_rules: unknown[];
  created_at: DateTime;
  updated_at: DateTime;
}

export type TripType = 'leisure' | 'business' | 'family' | 'romantic' | 'solo' | string;

export interface ReviewMedia { id: number; image?: string; video?: string; thumbnail?: string | null; caption?: string; order?: number; created_at: DateTime }

export interface Review {
  id: number;
  customer: UUID;
  customer_name: string;
  booking: UUID | null;
  review_type: string;
  hotel_id: UUID | null;
  hotel_name: string;
  room_id: UUID | null;
  room_type: string;
  overall_rating: number;
  cleanliness_rating: number | null;
  service_rating: number | null;
  location_rating: number | null;
  value_rating: number | null;
  amenities_rating: number | null;
  title: string;
  review_text: string;
  pros: string;
  cons: string;
  trip_type: TripType;
  traveled_with: string;
  room_stayed: string;
  length_of_stay: number | null;
  is_verified: boolean;
  is_featured: boolean;
  is_anonymous: boolean;
  helpful_votes: number;
  total_votes: number;
  helpfulness_ratio: number;
  hotel_response: string;
  hotel_response_date: DateTime | null;
  points_awarded: number;
  images: ReviewMedia[];
  videos: ReviewMedia[];
  created_at: DateTime;
  updated_at: DateTime;
}

export interface ReviewStats {
  hotel_id: UUID;
  total_reviews: number;
  average_rating: number | null;
  rating_distribution: Record<'5_star' | '4_star' | '3_star' | '2_star' | '1_star', number>;
  category_averages?: Partial<Record<'cleanliness' | 'service' | 'location' | 'value' | 'amenities', number | null>>;
}

export interface RecentSearch {
  id: number;
  label: string;
  query: string;
  city_id: UUID | null;
  area_id: UUID | null;
  state_id: UUID | null;
  searched_at: DateTime;
}

// ---- home feed (guide 5.1) -----------------------------------------------------------------------

export interface PromoSlide {
  id: string;
  image_url: string;
  title: string;
  action_url: string;
  kind: 'promo' | 'ad' | string;
  ad_id?: UUID;
  sponsor?: string;
}

export interface BannerAd {
  ad_id: UUID;
  image_url: string;
  headline: string;
  sponsor: string;
  redirect_url: string;
  action_type: 'external_link' | 'deep_link' | 'detail' | 'video' | string;
  detail_body: string;
  detail_image_url: string | null;
  video_url: string;
  video_file_url: string | null;
  action_button_text: string;
}

export interface FeedSectionBase { key?: string; order: number; title?: string; meta?: Record<string, unknown> }

export type FeedSection =
  | (FeedSectionBase & { type: 'active_bookings'; data: ActiveStay[] })
  | (FeedSectionBase & { type: 'promo_carousel'; data: PromoSlide[] })
  | (FeedSectionBase & { type: 'hotel_horizontal_list'; data: HotelCard[] })
  | (FeedSectionBase & { type: 'ads_banner'; data: BannerAd })
  // New section types appear over time; they're skipped.
  | (FeedSectionBase & { type: string & {}; data: unknown });

/** An active stay in the feed: booking-like; the fields the card needs. */
export interface ActiveStay {
  id: UUID;
  confirmation_code?: string;
  hotel_name?: string;
  hotel_image?: string | null;
  check_in_date?: DateString;
  check_out_date?: DateString;
  status?: string;
  [key: string]: unknown;
}

export interface HomeFeed { sections: FeedSection[] }

/** The older feed (GET /hotels/feed/); the app uses the home feed. */
export interface HotelsFeed {
  personalized_greeting: string;
  sections: Array<{ id: string; title: string; subtitle: string; type: string; items: HotelCard[] }>;
}

export interface Ad {
  id: UUID;
  sponsor: string;
  headline: string;
  image_url: string;
  hotel: UUID | null;
  hotel_name: string;
  redirect_url: string;
  action_type: string;
  detail_body: string;
  detail_image_url: string | null;
  video_url: string;
  video_file_url: string | null;
  action_button_text: string;
  ad_type: 'banner' | 'carousel' | string;
  [key: string]: unknown;
}

export interface AdsResponse {
  status: string;
  error: boolean;
  data: Array<{ id: UUID; image: string; image_url: string; link: string; action_url: string; title: string; date: DateTime }>;
  banners: Ad[];
  promotions: unknown[];
}

export interface AdClick { success: boolean; message: string; current_clicks: number }
