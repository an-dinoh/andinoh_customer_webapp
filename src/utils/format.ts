import type { Money } from '@/types/api';

/** Andinoh's clock, used until the hotel's own time zone is known (Hotel guide 2: blank `timezone`). */
export const DEFAULT_TZ = 'Africa/Lagos';
let hotelTz = DEFAULT_TZ;

/** The hotel's clock (business days, shifts, check-in times). */
export const hotelTimeZone = () => hotelTz;

/** Use the hotel's IANA zone from now on; blank or unknown names keep Andinoh's. */
export function setHotelTimeZone(tz: string | null | undefined): void {
  if (!tz) { hotelTz = DEFAULT_TZ; return; }
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: tz });
    hotelTz = tz;
  } catch {
    hotelTz = DEFAULT_TZ;
  }
}

/** The browser's IANA zone, sent on clock-in (undefined if the browser won't say). */
export function deviceTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

/** Every IANA zone the browser knows, for pickers (a short list on old browsers). */
export function timeZoneNames(): string[] {
  const supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
  try {
    if (supported) return supported('timeZone');
  } catch { /* fall through */ }
  return ['Africa/Lagos', 'Africa/Accra', 'Africa/Nairobi', 'Africa/Johannesburg', 'Africa/Cairo', 'Europe/London', 'America/New_York', 'Asia/Dubai'];
}

/** Minutes `tz` is ahead of UTC at `at`. */
function zoneOffsetMinutes(at: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return Math.round((asUtc - Math.floor(at.getTime() / 1000) * 1000) / 60_000);
}

/** A timestamp as a datetime-local value ("YYYY-MM-DDTHH:mm") on the hotel's clock. */
export function toHotelLocal(iso: string | null | undefined, tz = hotelTz): string {
  const d = parseDate(iso);
  if (!d) return '';
  return new Date(d.getTime() + zoneOffsetMinutes(d, tz) * 60_000).toISOString().slice(0, 16);
}

/** A datetime-local value ("YYYY-MM-DDTHH:mm") on the hotel's clock, as an ISO timestamp. */
export function fromHotelLocal(local: string, tz = hotelTz): string {
  const naive = Date.parse(`${local.length === 16 ? `${local}:00` : local}Z`);
  // Two passes settle the offset across a daylight-saving change.
  let t = naive - zoneOffsetMinutes(new Date(naive), tz) * 60_000;
  t = naive - zoneOffsetMinutes(new Date(t), tz) * 60_000;
  return new Date(t).toISOString();
}

const SYMBOLS: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', GHS: 'GH₵', KES: 'KSh', ZAR: 'R' };

/** Parse an API amount (decimal string, or a number from hand-built responses). */
export function toNumber(value: Money | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** "₦55,000.00" — amounts are shown exactly as the server sent them, never recomputed. */
export function money(value: Money | null | undefined, currency = 'NGN', opts: { decimals?: boolean; sign?: boolean } = {}): string {
  const n = toNumber(value);
  const decimals = opts.decimals ?? true;
  const body = Math.abs(n).toLocaleString('en-NG', { minimumFractionDigits: decimals ? 2 : 0, maximumFractionDigits: decimals ? 2 : 0 });
  const symbol = SYMBOLS[currency] ?? `${currency} `;
  const sign = n < 0 ? '−' : opts.sign && n > 0 ? '+' : '';
  return `${sign}${symbol}${body}`;
}

/** "₦1.2M", "₦850K" for tight spaces (charts, tiles). */
export function compactMoney(value: Money | null | undefined, currency = 'NGN'): string {
  const n = toNumber(value);
  const symbol = SYMBOLS[currency] ?? `${currency} `;
  const abs = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (abs >= 1e9) return `${sign}${symbol}${(abs / 1e9).toFixed(1).replace(/\.0$/, '')}B`;
  if (abs >= 1e6) return `${sign}${symbol}${(abs / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1e3) return `${sign}${symbol}${(abs / 1e3).toFixed(abs >= 1e4 ? 0 : 1).replace(/\.0$/, '')}K`;
  return `${sign}${symbol}${abs.toFixed(0)}`;
}

/** An amount typed by a person → the 2-decimal string the API expects ("1,500" → "1500.00"). */
export function toApiAmount(input: string | number): string {
  const n = typeof input === 'number' ? input : Number(String(input).replace(/[,\s₦]/g, ''));
  return Number.isFinite(n) ? n.toFixed(2) : '';
}

/**
 * What a money box shows while someone types: digits grouped in thousands, one decimal point, at most two
 * decimals ("150000.5" → "150,000.5"). Anything else is dropped. toApiAmount strips the commas again.
 */
export function formatAmountInput(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  const raw = String(input).replace(/[^\d.]/g, '');
  if (!raw) return '';
  const dot = raw.indexOf('.');
  let whole = dot === -1 ? raw : raw.slice(0, dot);
  const fraction = dot === -1 ? null : raw.slice(dot + 1).replace(/\./g, '').slice(0, 2);
  whole = whole.replace(/^0+(?=\d)/, '');
  if (whole === '' && fraction !== null) whole = '0';
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction === null ? grouped : `${grouped}.${fraction}`;
}

export function isPositiveAmount(input: string): boolean {
  const n = Number(String(input).replace(/[,\s₦]/g, ''));
  return Number.isFinite(n) && n > 0;
}

/** Timestamps sometimes use a space instead of "T" (booking timeline); parse leniently. */
export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const v = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value.replace(' ', 'T');
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "13 Oct 2026" — plain dates (YYYY-MM-DD) are calendar dates, shown as written. */
export function formatDate(value: string | null | undefined, opts: Intl.DateTimeFormatOptions = {}): string {
  if (!value) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC', ...opts });
  }
  const d = parseDate(value);
  return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: hotelTz, ...opts }) : '—';
}

/** "13 Oct 2026, 14:05" in the hotel's time. */
export function formatDateTime(value: string | null | undefined): string {
  const d = parseDate(value);
  if (!d) return '—';
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: hotelTz });
}

export function formatTime(value: string | null | undefined): string {
  const d = parseDate(value);
  return d ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: hotelTz }) : '—';
}

/** "5 min ago", "yesterday", then a date. */
export function timeAgo(value: string | null | undefined): string {
  const d = parseDate(value);
  if (!d) return '—';
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.round(h / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(value);
}

/** Today's date in the hotel's time zone, YYYY-MM-DD. */
export function todayISO(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: hotelTz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

/** Calendar nights between two YYYY-MM-DD dates. */
export function nightsBetween(start: string, end: string): number {
  const a = Date.parse(`${start}T00:00:00Z`);
  const b = Date.parse(`${end}T00:00:00Z`);
  return Number.isFinite(a) && Number.isFinite(b) ? Math.max(0, Math.round((b - a) / 86_400_000)) : 0;
}

/** The Monday of the week containing `iso`. */
export function mondayOf(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dow = (date.getUTCDay() + 6) % 7;
  return addDays(iso, -dow);
}

export function startOfMonthISO(): string {
  return `${todayISO().slice(0, 8)}01`;
}

/** "front_office" → "Front office" */
export function humanize(value: string | null | undefined): string {
  if (!value) return '—';
  const s = value.replace(/[_-]+/g, ' ').toLowerCase().trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}

export function minutesToHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`;
}

export function pluralize(n: number, one: string, many = `${one}s`): string {
  return `${n.toLocaleString()} ${n === 1 ? one : many}`;
}

/**
 * Uploaded files (photos, chat media) come back as paths on the API host. With an absolute API URL they
 * load from that host; otherwise from this site, which proxies /media/ to the API (next.config.ts).
 */
export function apiAsset(path: string | null | undefined): string {
  if (!path) return "";
  if (/^(https?:|blob:|data:)/.test(path)) return path;
  const api = process.env.NEXT_PUBLIC_API_URL;
  const origin = api && /^https?:\/\//.test(api) ? new URL(api).origin : "";
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}
