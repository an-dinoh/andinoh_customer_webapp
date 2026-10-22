import type { DateTime, UUID } from './common';

// Customer guide 4 (config, FAQs, help, legal, analytics) and shared guide 6, 8, 9.

export interface AppConfig {
  app_name: string;
  version: string;
  support_email: string;
  support_phone: string;
  support_whatsapp: string;
  currency: string;
  payments: { provider: string; public_key: string; currency: string };
}

export interface Faq {
  id: UUID;
  question: string;
  answer: string;
  category: string;
}

export interface SupportCategory { id: UUID; title: string; slug: string; icon: string; description: string; article_count: number }
export interface ArticleSummary { id: UUID; title: string; slug: string; category_name: string; views_count: number; created_at: DateTime }
export interface Article {
  id: UUID;
  title: string;
  slug: string;
  category: Omit<SupportCategory, 'article_count'>;
  /** Markdown. */
  body: string;
  views_count: number;
  was_helpful_yes: number;
  was_helpful_no: number;
  tags: string;
  created_at: DateTime;
}

export interface SupportRequest {
  subject: string;
  message: string;
  category?: string;
}

export interface LegalPage { id: UUID; slug: string; title: string; content: string; created_at: DateTime; updated_at: DateTime }

export interface AnalyticsEvent {
  event_name: string;
  event_category?: string;
  event_data?: Record<string, unknown>;
  session_id?: string;
}

export interface Currency { id: UUID; code: string; name: string; symbol: string; rate_to_usd: string; is_active: boolean }
export interface Conversion { from: string; to: string; original_amount: string; converted_amount: string }

export interface Country { id: UUID; name: string; code: string; phone_code: string; currency_code: string }
export interface State { id: UUID; name: string; country: UUID }
export interface City { id: UUID; name: string; state: UUID; state_name?: string; is_capital: boolean }
export interface Area { id: UUID; name: string; city: UUID }

/** The platform feed (shared guide 6), used here for inspector applications. */
export interface PlatformNotification {
  id: UUID;
  category: string;
  event: string;
  title: string;
  message: string;
  data: Record<string, string>;
  is_read: boolean;
  read_at: DateTime | null;
  created_at: DateTime;
}
