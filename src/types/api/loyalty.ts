import type { DateTime, UUID } from './common';

// Customer guide 11: reviews, referrals and the statement of account.

export interface ReviewInput {
  booking_id: UUID;
  overall_rating: number;
  /** Required by the server, although the guide lists it as optional. */
  title: string;
  cleanliness_rating?: number;
  service_rating?: number;
  location_rating?: number;
  value_rating?: number;
  amenities_rating?: number;
  review_text: string;
  pros?: string;
  cons?: string;
  trip_type?: string;
  traveled_with?: string;
  is_anonymous?: boolean;
}

export type ReviewUpdate = Partial<Omit<ReviewInput, 'booking_id'>>;

export interface ReviewImagesAdded { message: string; images: { id: number; image: string; caption: string; order: number; created_at: DateTime }[] }

export type ReferralStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED';

export interface Referral {
  id: number;
  referral_email: string;
  referral_code: string;
  status: ReferralStatus | string;
  reward_awarded: boolean;
  created_at: DateTime;
  completed_at: DateTime | null;
}

export interface ReferralStats { total_referrals: number; completed_referrals: number; pending_referrals: number }

export interface StatementRange { opened_at: DateTime; now: DateTime; currencies: string[] }
