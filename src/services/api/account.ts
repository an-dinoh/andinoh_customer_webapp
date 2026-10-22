import { apiClient } from '@/utils/api';
import type {
  Address, AddressInput, CustomerDashboard, CustomerNotification, CustomerProfile, CustomerProfileUpdate, InspectorApplication,
  LocationSaved, MessageResponse, NotificationPreferences, NotificationQuery, Paginated, Preference, PushDevice, PushDeviceInput,
  Referral, ReferralStats, Review, ReviewImagesAdded, ReviewInput, ReviewUpdate, StatementRange, PageParams,
} from '@/types/api';

// Customer guide 11 (reviews, referrals, statement), 12 (notifications, push) and 13 (profile and settings).

export const profileApi = {
  get: () => apiClient.get<CustomerProfile>('/customers/profile/'),
  update: (body: CustomerProfileUpdate) => apiClient.patch<CustomerProfile>('/customers/profile/', body),
  setPhoto: (profile_picture: File | Blob) => apiClient.upload<CustomerProfile>('/customers/profile/', { profile_picture }, 'patch'),
  dashboard: () => apiClient.get<CustomerDashboard>('/customers/profile/dashboard/'),
  /** Remembered for "hotels near you" when a request has no location. */
  saveLocation: (latitude: string, longitude: string) =>
    apiClient.patch<LocationSaved>('/customers/profile/location/', { latitude, longitude }),

  addresses: () => apiClient.get<Paginated<Address>>('/customers/profile/addresses/'),
  address: (id: number) => apiClient.get<Address>(`/customers/profile/addresses/${id}/`),
  addAddress: (body: AddressInput) => apiClient.post<Address>('/customers/profile/addresses/', body),
  updateAddress: (id: number, body: AddressInput) => apiClient.patch<Address>(`/customers/profile/addresses/${id}/`, body),
  removeAddress: (id: number) => apiClient.delete<void>(`/customers/profile/addresses/${id}/`),

  notificationPreferences: () => apiClient.get<NotificationPreferences>('/customers/profile/notification-preferences/'),
  updateNotificationPreferences: (body: Partial<NotificationPreferences>) =>
    apiClient.patch<NotificationPreferences>('/customers/profile/notification-preferences/', body),
  preferences: () => apiClient.get<Preference | Preference[] | Paginated<Preference>>('/customers/profile/preferences/'),
  setPreference: (body: { preference_type: string; key: string; value: string }) =>
    apiClient.patch<Preference>('/customers/profile/preferences/', body),

  /** Refused (400) while there are active bookings; data kept 30 days. */
  deleteAccount: (password: string) =>
    apiClient.delete<MessageResponse & { note: string }>('/customers/profile/delete/', { password }),

  /** Apply to inspect hotels; the account stays a customer account (guide 16). */
  applyToInspect: () => apiClient.post<InspectorApplication>('/inspectors/apply/'),
};

export const notificationsApi = {
  list: (query?: NotificationQuery) => apiClient.get<Paginated<CustomerNotification>>('/customers/profile/notifications/', query),
  unreadCount: () => apiClient.get<{ unread: number }>('/customers/profile/notifications/unread-count/'),
  markRead: (id: number) => apiClient.post<MessageResponse>(`/customers/profile/notifications/${id}/read/`),
  markAllRead: () => apiClient.post<MessageResponse>('/customers/profile/notifications/read-all/'),
};

/** Push registrations (guide 12.3). Sending the same token again updates that device. */
export const devicesApi = {
  list: () => apiClient.get<Paginated<PushDevice>>('/customers/devices/'),
  register: (body: PushDeviceInput) => apiClient.post<PushDevice>('/customers/devices/', body),
  unregister: (id: number) => apiClient.delete<void>(`/customers/devices/${id}/`),
};

export const reviewsApi = {
  /** Once per checked-out booking; earns points. The hotel comes from the booking. */
  create: (body: ReviewInput) => apiClient.post<Review>('/customers/reviews/', body),
  mine: (params?: PageParams) => apiClient.get<Paginated<Review>>('/customers/reviews/', params),
  get: (id: number) => apiClient.get<Review>(`/customers/reviews/${id}/`),
  update: (id: number, body: ReviewUpdate) => apiClient.patch<Review>(`/customers/reviews/${id}/`, body),
  remove: (id: number) => apiClient.delete<void>(`/customers/reviews/${id}/`),
  addImages: (id: number, images: (File | Blob)[]) => {
    const form = new FormData();
    images.forEach(image => form.append('images', image));
    return apiClient.upload<ReviewImagesAdded>(`/customers/reviews/${id}/images/`, form);
  },
  addVideo: (id: number, video: File | Blob, thumbnail?: File | Blob) =>
    apiClient.upload<MessageResponse>(`/customers/reviews/${id}/videos/`, { video, thumbnail }),
  /** On someone else's review. */
  vote: (id: number, is_helpful = true) => apiClient.post<MessageResponse>(`/customers/reviews/${id}/helpful/`, { is_helpful }),
};

export const referralsApi = {
  invite: (referral_email: string) => apiClient.post<{ referral_email: string; referral_code?: string }>('/customers/referrals/', { referral_email }),
  list: (params?: PageParams) => apiClient.get<Paginated<Referral>>('/customers/referrals/', params),
  stats: () => apiClient.get<ReferralStats>('/customers/referrals/stats/'),
};

export const statementApi = {
  /** The earliest start (account opened), now, and the currencies used: for the date picker. */
  range: () => apiClient.get<StatementRange>('/customers/statement/range/'),
  /** A locked PDF for the period; `x-statement-number` holds its number. */
  pdf: (start: string, end: string, currency?: string) => apiClient.download('/customers/statement/', { start, end, currency }),
};
