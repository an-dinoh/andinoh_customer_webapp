import { apiClient } from '@/utils/api';
import type {
  AnalyticsEvent, AppConfig, Area, Article, ArticleSummary, City, Conversion, Country, Currency, Faq, LegalPage,
  MessageResponse, PageParams, Paginated, PlatformNotification, State, SupportCategory, SupportRequest, UUID,
} from '@/types/api';

// Customer guide 4 (config, FAQs, help, legal, analytics, contact support) and shared guide 6 and 9.

export const appApi = {
  /** Cache it: support contacts and the payment provider. */
  config: () => apiClient.get<AppConfig>('/customers/config/'),
  /** A bare array. */
  faqs: () => apiClient.get<Faq[]>('/customers/faqs/'),
  /** Signed in only. */
  contactSupport: (body: SupportRequest) => apiClient.post<MessageResponse & { ticket_id: string }>('/customers/support/', body),
  track: (event: AnalyticsEvent) => apiClient.post<MessageResponse & { event: string }>('/shared/analytics/track/', event),
};

export const helpApi = {
  categories: () => apiClient.get<Paginated<SupportCategory>>('/support/categories/'),
  articles: (params?: { category?: string } & PageParams) => apiClient.get<Paginated<ArticleSummary>>('/support/articles/', params),
  popular: () => apiClient.get<Paginated<ArticleSummary>>('/support/articles/popular/'),
  /** At least 2 characters. */
  search: (q: string) => apiClient.get<Paginated<ArticleSummary>>('/support/articles/search/', { q }),
  /** Counts as a view. */
  article: (slug: string) => apiClient.get<Article>(`/support/articles/${slug}/`),
  feedback: (slug: string, is_helpful: boolean) => apiClient.post<MessageResponse>(`/support/articles/${slug}/feedback/`, { is_helpful }),
};

export const legalApi = {
  list: () => apiClient.get<Paginated<LegalPage>>('/shared/legal/'),
  page: (slug: 'terms-of-service' | 'privacy-policy' | 'refund-policy' | string) => apiClient.get<LegalPage>(`/shared/legal/${slug}/`),
};

export const locationsApi = {
  countries: () => apiClient.get<Country[]>('/shared/locations/countries/'),
  states: (country?: UUID) => apiClient.get<State[]>('/shared/locations/states/', { country }),
  cities: (state: UUID) => apiClient.get<City[]>('/shared/locations/cities/', { state }),
  /** 2+ letters; up to 200 cities. */
  searchCities: (search: string) => apiClient.get<City[]>('/shared/locations/cities/', { search }),
  areas: (city: UUID) => apiClient.get<Area[]>('/shared/locations/areas/', { city }),
};

export const currencyApi = {
  list: () => apiClient.get<Paginated<Currency>>('/shared/currencies/'),
  convert: (amount: string | number, from: string, to: string) => apiClient.get<Conversion>('/shared/currencies/convert/', { amount, from, to }),
  detect: (country_id: UUID) => apiClient.get<Currency>('/shared/currencies/detect/', { country_id }),
};

/** The platform feed (shared guide 6): inspector application news for customers who applied. */
export const platformNotificationsApi = {
  list: (params?: { unread?: boolean } & PageParams) => apiClient.get<Paginated<PlatformNotification>>('/shared/notifications/', params),
  unreadCount: () => apiClient.get<{ unread: number }>('/shared/notifications/unread-count/'),
  markRead: (id: UUID) => apiClient.post<PlatformNotification>(`/shared/notifications/${id}/read/`),
  markAllRead: () => apiClient.post<{ marked_read: number }>('/shared/notifications/read-all/'),
};
