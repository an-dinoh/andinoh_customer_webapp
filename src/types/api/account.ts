import type { DateString, DateTime, Money, UUID } from './common';

// Customer guide 3 (sign-in, sessions, passwords) and 13 (profile and settings).

export type InspectorStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'suspended';

export interface SessionUser {
  id: UUID;
  email: string;
  role?: string;
  full_name?: string;
  /** Only once the customer has applied to inspect hotels (guide 16). */
  inspector_status?: InspectorStatus;
  is_verified?: boolean;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: SessionUser;
}

/** Labels the session in "signed-in devices" (guide 3.1). */
export interface DeviceInfo {
  device_name?: string;
  platform?: 'android' | 'ios' | 'web';
  os_version?: string;
  app_version?: string;
}

export interface LoginRequest extends DeviceInfo {
  email: string;
  password: string;
}

export interface RegisterRequest extends DeviceInfo {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  referral_code?: string;
}

/** GET /auth/profile/: the account basics every role has. */
export interface AccountProfile {
  id: UUID;
  email: string;
  role: string;
  full_name: string;
  phone_number: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: DateTime;
  updated_at: DateTime;
  [key: string]: unknown;
}

export interface DeviceSession {
  id: UUID;
  device_name: string;
  platform: string;
  os_version: string;
  app_version: string;
  ip_address: string;
  last_seen_at: DateTime;
  created_at: DateTime;
}

export type Gender = 'M' | 'F' | 'O' | 'N' | '';
export type MembershipTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

/** GET /customers/profile/: the customer profile on top of the account. */
export interface CustomerProfile {
  profile: UUID;
  username?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name: string;
  phone_number: string;
  date_of_birth: DateString | null;
  gender: Gender;
  profile_picture_url: string | null;
  membership_tier: MembershipTier | string;
  membership_tier_display: string;
  total_points: number;
  available_points: number;
  lifetime_spent: Money;
  email_verified: boolean;
  phone_verified: boolean;
  is_vip: boolean;
  latitude: string | null;
  longitude: string | null;
  location_updated_at: DateTime | null;
  date_joined: DateTime;
  last_login: DateTime | null;
}

export type CustomerProfileUpdate = Partial<Pick<CustomerProfile, 'date_of_birth' | 'gender' | 'full_name' | 'phone_number'>>;

export interface CustomerDashboard {
  customer: CustomerProfile;
  stats: {
    total_bookings: number;
    active_bookings: number;
    completed_bookings: number;
    total_points: number;
    total_reviews: number;
    open_complaints: number;
  };
}

export type AddressType = 'HOME' | 'WORK' | 'OTHER';

export interface Address {
  id: number;
  address_type: AddressType;
  street_address: string;
  apartment_number: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  latitude: string | null;
  longitude: string | null;
  is_primary: boolean;
  created_at: DateTime;
}

export type AddressInput = Partial<Omit<Address, 'id' | 'created_at'>> & { is_default?: boolean };

export type DigestFrequency = 'NEVER' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface NotificationPreferences {
  email_booking_confirmations: boolean;
  email_reminders: boolean;
  email_promotions: boolean;
  email_reviews: boolean;
  email_points: boolean;
  email_complaints: boolean;
  sms_booking_confirmations: boolean;
  sms_reminders: boolean;
  sms_urgent_only: boolean;
  push_booking_confirmations: boolean;
  push_reminders: boolean;
  push_promotions: boolean;
  push_reviews: boolean;
  push_points: boolean;
  app_all_notifications: boolean;
  digest_frequency: DigestFrequency;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  quiet_hours_timezone: string;
  updated_at?: DateTime;
}

export interface Preference {
  id: number;
  preference_type: string;
  key: string;
  value: string;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface LocationSaved {
  status: string;
  message: string;
  latitude: string;
  longitude: string;
}

export type DeviceType = 'android' | 'ios' | 'web';

/** A phone or browser registered for push (guide 12.3). */
export interface PushDevice {
  id: number;
  registration_id: string;
  device_name: string;
  device_type: DeviceType;
  os_version: string;
  app_version: string;
  is_active: boolean;
  created_at: DateTime;
  updated_at: DateTime;
  last_used_at: DateTime;
}

export interface PushDeviceInput {
  registration_id: string;
  device_type: DeviceType;
  device_name: string;
  os_version?: string;
  app_version?: string;
}

/** POST /inspectors/apply/ (guide 16). */
export interface InspectorApplication {
  id: UUID;
  status: InspectorStatus;
  full_name: string;
  phone_number: string;
  email: string;
  email_verified: boolean;
  submitted_at: DateTime | null;
  reviewed_at: DateTime | null;
  rejection_reason: string;
  [key: string]: unknown;
}
