import { queryCache } from './queryCache';
import { readableError } from './notify';
import { needsAccount } from '@/config/routes';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

/**
 * HTTP client for the Andinoh API (Customer guide, sections 1–3; shared guide).
 *
 * - Responses are returned as the API sends them (no envelope to unwrap).
 * - Every failure is an {@link ApiError}: the HTTP status, the server's sentence (`error`), its stable
 *   `code`, field-by-field `errors` and the `request_id` to quote in bug reports.
 * - A 401 refreshes the session once (refresh tokens rotate, so the new pair is always stored) and
 *   retries; when the refresh itself fails the user is signed out (and sent to sign in only from pages
 *   that need an account: browsing and guest checkout keep working).
 * - The chosen display currency goes out as `X-User-Currency` (room prices then carry `display_price`).
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? '/api/v1' : 'https://api.andinoh.com/api/v1');

export const TOKEN_KEY = 'token';
export const REFRESH_KEY = 'refresh_token';
export const USER_KEY = 'user';
export const CURRENCY_KEY = 'andinoh-customer:currency';
const SESSION_COOKIE = 'auth_token';

export interface ApiErrorBody {
  error?: string;
  code?: string;
  request_id?: string;
  errors?: Record<string, string | string[]>;
  message?: string;
  detail?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly fieldErrors: Record<string, string>;
  /** The raw error body, for endpoint-specific extras such as `balance_due` or `conflict`. */
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody, fallback: string) {
    super(ApiError.sentence(status, body, fallback));
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.code = body.code ?? ApiError.codeFor(status);
    this.requestId = body.request_id;
    this.fieldErrors = {};
    for (const [field, value] of Object.entries(body.errors ?? {})) {
      this.fieldErrors[field] = Array.isArray(value) ? value.join(' ') : String(value);
    }
  }

  private static sentence(status: number, body: ApiErrorBody, fallback: string): string {
    if (status === 0) return 'Can’t reach Andinoh. Check your connection and try again.';
    if (status === 429) return ApiError.tooMany(body);
    if (status >= 500 && status !== 502 && status !== 503) {
      return `Something went wrong on our side.${body.request_id ? ` Reference: ${body.request_id}` : ''}`;
    }
    // The backend joins validation errors into "Validation failed: field: …"; show the person's sentence.
    return readableError(body.error, body.errors) || body.message || body.detail || fallback;
  }

  /**
   * Shared guide 3: only `too_many_login_attempts` means sign-in is locked for 15 minutes, which the
   * person needs to know. Any other 429 is our rate limit, retried quietly first (see the client); when
   * it still fails the person is just asked to try again, never told about request limits.
   */
  private static tooMany(body: ApiErrorBody): string {
    const server = body.error || body.message || body.detail || '';
    if (body.code === 'too_many_login_attempts') return server || 'Too many failed sign-ins. Sign-in to this account is locked for 15 minutes.';
    return 'We couldn’t complete that just now. Please try again.';
  }

  private static codeFor(status: number): string {
    if (status === 0) return 'network_error';
    return ({ 400: 'validation_error', 401: 'not_authenticated', 403: 'permission_denied', 404: 'not_found',
      405: 'method_not_allowed', 409: 'conflict', 410: 'expired', 429: 'throttled' } as Record<number, string>)[status]
      ?? (status >= 500 ? 'server_error' : 'error');
  }
}

/** The message to show for any thrown value. */
export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

// ---- session storage -------------------------------------------------------------------------------

export const session = {
  access(): string | null {
    return typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
  },
  refresh(): string | null {
    return typeof window === 'undefined' ? null : localStorage.getItem(REFRESH_KEY);
  },
  store(access: string, refresh?: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    // The middleware only checks that a session exists; the cookie lives as long as the refresh token.
    document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent('andinoh:tokens', { detail: { access } }));
  },
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
    queryCache.clear();
  },
};

function signOutAndRedirect() {
  const hadSession = !!session.refresh() || !!session.access();
  session.clear();
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('andinoh:signed-out'));
  const path = window.location.pathname;
  if (hadSession && needsAccount(path)) {
    window.location.href = `/login?from=${encodeURIComponent(path + window.location.search)}&expired=1`;
  }
}

/** The display currency the person picked (Settings); NGN prices are always shown too. */
export function displayCurrency(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(CURRENCY_KEY); } catch { return null; }
}

/**
 * Whether the API is on another origin. The backend's CORS list allows only standard headers, so the
 * app's own headers (X-Booking-Token, X-User-Currency) can only be sent same-origin, through the
 * /api/v1 proxy that is the default.
 */
function crossOrigin(): boolean {
  if (typeof window === 'undefined' || !/^https?:\/\//.test(API_BASE_URL)) return false;
  return new URL(API_BASE_URL).origin !== window.location.origin;
}

/**
 * A guest booking's secret token (Customer guide 7.2): the X-Booking-Token header, which keeps it out of
 * URLs and logs; across origins, the `token` query parameter every guest endpoint also accepts.
 */
export const bookingToken = (token: string): AxiosRequestConfig =>
  crossOrigin() ? { params: { token } } : { headers: { 'X-Booking-Token': token } };

// ---- request recording -----------------------------------------------------------------------------

/** Set while recordRequests runs: requests are noted here instead of being sent. */
let recording: string[] | null = null;
const NEVER = new Promise<never>(() => {});
/** Marks a recorded call that would change something; such a query isn't cached. */
export const WRITE_REQUEST = '!write';

/**
 * Runs `fn` without touching the network and returns the requests it makes straight away
 * ("GET path {params}"). useQuery uses this as its cache key, so the key is always the real request.
 */
export function recordRequests(fn: () => unknown): string[] {
  const outer = recording;
  const mine: string[] = [];
  recording = mine;
  try {
    const result = fn();
    // The never-settling promises are dropped; silence any rejection from fetchers that throw early.
    if (result instanceof Promise) result.catch(() => undefined);
  } catch {
    mine.push(WRITE_REQUEST); // can't tell what it needs: don't cache
  } finally {
    recording = outer;
  }
  return mine;
}

function recorded(entry: string): Promise<never> | null {
  if (!recording) return null;
  recording.push(entry);
  return NEVER;
}

// ---- client ----------------------------------------------------------------------------------------

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean; _throttled?: number };

let refreshing: Promise<string> | null = null;

/** Rate-limited requests are retried this many times before the person sees an error. */
export const THROTTLE_RETRIES = 3;
/** The longest Retry-After worth waiting for behind a spinner, in seconds. */
const MAX_THROTTLE_WAIT = 15;
export const throttleTiming = { sleep: (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)) };

/**
 * How long to wait before retrying a rate-limited request, in ms: the server's Retry-After when it's
 * short enough, else 1s, 2s, 4s. Null when it shouldn't be retried: a sign-in lockout, or a wait too long.
 */
function throttleWait(error: AxiosError<ApiErrorBody>, attempt: number): number | null {
  if (error.response?.status !== 429 || attempt >= THROTTLE_RETRIES) return null;
  const body = error.response.data;
  if (body && typeof body === 'object' && body.code === 'too_many_login_attempts') return null;
  const header = Number(error.response.headers?.['retry-after']);
  if (Number.isFinite(header) && header > 0) return header <= MAX_THROTTLE_WAIT ? header * 1000 : null;
  return 1000 * 2 ** attempt;
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = session.refresh();
  if (!refreshToken) throw new Error('No refresh token');
  // A bare axios call, so this request never goes through the 401 interceptor below.
  const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh_token: refreshToken }, { timeout: 15000 });
  session.store(data.access_token, data.refresh_token);
  return data.access_token as string;
}

function toApiError(error: AxiosError<ApiErrorBody>): ApiError {
  if (!error.response) {
    const timeout = error.code === 'ECONNABORTED';
    return new ApiError(0, { error: timeout ? 'The request timed out. Please try again.' : undefined }, error.message);
  }
  const data: unknown = error.response.data;
  const headerId = error.response.headers?.['x-request-id'];
  // File requests get their error body as a Blob; keep it so download() can read the message.
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    return new ApiError(error.response.status, { request_id: headerId, blob: data }, error.message);
  }
  const body = (data && typeof data === 'object') ? data as ApiErrorBody : {};
  const retryAfter = error.response.headers?.['retry-after'];
  return new ApiError(error.response.status, { request_id: headerId, ...(retryAfter ? { retry_after: retryAfter } : {}), ...body }, error.message);
}

export interface Download {
  blob: Blob;
  filename: string | null;
  contentType: string;
  headers: Record<string, string>;
}

function filenameFrom(disposition?: string): string | null {
  if (!disposition) return null;
  const star = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (star) return decodeURIComponent(star[1]);
  const plain = disposition.match(/filename="?([^";]+)"?/i);
  return plain ? plain[1] : null;
}

class ApiClient {
  readonly http: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.http = axios.create({ baseURL, timeout: 30000, headers: { Accept: 'application/json' } });

    this.http.interceptors.request.use((config) => {
      const token = session.access();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      const currency = displayCurrency();
      if (currency && currency !== 'NGN' && !crossOrigin()) config.headers['X-User-Currency'] = currency;
      // Paths are written as in the guide ("/hotels/…"); keep them relative to the base URL.
      if (config.url?.startsWith('/')) config.url = config.url.slice(1);
      return config;
    });

    this.http.interceptors.response.use(undefined, async (error: AxiosError<ApiErrorBody>) => {
      const config = error.config as RetriableConfig | undefined;
      const isAuthCall = ['auth/login', 'auth/refresh', 'auth/register', 'auth/google'].some(p => config?.url?.startsWith(p));
      // A 429 means the request wasn't handled, so sending it again is safe, even for a payment.
      const wait = config ? throttleWait(error, config._throttled ?? 0) : null;
      if (config && wait !== null) {
        config._throttled = (config._throttled ?? 0) + 1;
        await throttleTiming.sleep(wait);
        return this.http(config);
      }
      if (error.response?.status === 401 && config && !config._retried && !isAuthCall && session.refresh()) {
        config._retried = true;
        try {
          refreshing ??= refreshAccessToken().finally(() => { refreshing = null; });
          const token = await refreshing;
          config.headers.Authorization = `Bearer ${token}`;
          return this.http(config);
        } catch {
          signOutAndRedirect();
        }
      } else if (error.response?.status === 401 && !isAuthCall && typeof window !== 'undefined' && !session.refresh()) {
        signOutAndRedirect();
      }
      return Promise.reject(toApiError(error));
    });
  }

  get<T>(path: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
    return recorded(`GET ${path} ${JSON.stringify(clean(params) ?? {})}`) ?? this.send<T>(path, params, config);
  }

  /** GETs already on their way, so several parts of a page asking for the same thing share one request. */
  private inFlight = new Map<string, Promise<unknown>>();

  private send<T>(path: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
    const merged = clean({ ...config?.params, ...params });
    // Only plain requests are shared: custom headers (a guest's booking token) or options keep their own.
    const key = config && Object.keys(config).some(k => k !== 'params') ? null : `${session.access() ?? ''} ${path} ${JSON.stringify(merged ?? {})}`;
    const pending = key ? this.inFlight.get(key) : undefined;
    if (pending) return pending as Promise<T>;
    const request = this.http.get<T>(path, { ...config, params: merged }).then(r => r.data);
    if (key) {
      this.inFlight.set(key, request);
      const done = () => { this.inFlight.delete(key); };
      request.then(done, done);
    }
    return request;
  }

  async post<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const r = recorded(WRITE_REQUEST);
    if (r) return r;
    return (await this.http.post<T>(path, body ?? {}, config)).data;
  }

  async put<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const r = recorded(WRITE_REQUEST);
    if (r) return r;
    return (await this.http.put<T>(path, body, config)).data;
  }

  async patch<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const r = recorded(WRITE_REQUEST);
    if (r) return r;
    return (await this.http.patch<T>(path, body, config)).data;
  }

  /** DELETE, optionally with a JSON body (account deletion sends the password this way). */
  async delete<T = void>(path: string, body?: unknown): Promise<T> {
    const r = recorded(WRITE_REQUEST);
    if (r) return r;
    return (await this.http.delete<T>(path, body === undefined ? undefined : { data: body })).data;
  }

  /**
   * multipart/form-data upload. Plain objects are converted; booleans become "true"/"false". Big files
   * (chat videos up to 100 MB) get 10 minutes; `onProgress` gets 0–1 as the file goes up.
   */
  async upload<T>(path: string, data: FormData | Record<string, unknown>, method: 'post' | 'patch' = 'post', onProgress?: (fraction: number) => void): Promise<T> {
    const r = recorded(WRITE_REQUEST);
    if (r) return r;
    const form = data instanceof FormData ? data : toFormData(data);
    return (await this.http.request<T>({
      url: path, method, data: form, timeout: 600_000,
      onUploadProgress: onProgress ? e => { if (e.total) onProgress(e.loaded / e.total); } : undefined,
    })).data;
  }

  /** A file response (PDF statement, CSV report) with the server's file name. */
  async download(path: string, params?: object, config?: AxiosRequestConfig): Promise<Download> {
    const r = recorded(WRITE_REQUEST);
    if (r) return r;
    try {
      const res = await this.http.get<Blob>(path, { ...config, params: clean({ ...config?.params, ...params }), responseType: 'blob' });
      const headers = Object.fromEntries(Object.entries(res.headers).map(([k, v]) => [k.toLowerCase(), String(v)]));
      return { blob: res.data, filename: filenameFrom(headers['content-disposition']), contentType: headers['content-type'] ?? '', headers };
    } catch (err) {
      const raw = err instanceof ApiError ? err.body.blob : undefined;
      if (err instanceof ApiError && typeof Blob !== 'undefined' && raw instanceof Blob) {
        let parsed: ApiErrorBody | null = null;
        try { parsed = JSON.parse(await blobText(raw)); } catch { /* not JSON: keep the generic error */ }
        if (parsed) throw new ApiError(err.status, { request_id: err.requestId, ...parsed }, err.message);
      }
      throw err;
    }
  }
}

/** A Blob's text; FileReader where Blob.text() is missing (older Safari, jsdom). */
function blobText(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') return blob.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

/** Drop undefined, null and empty-string params so filters can be passed as they are. */
function clean(params?: object): Record<string, unknown> | undefined {
  if (!params) return undefined;
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));
}

export function toFormData(data: Record<string, unknown>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (value instanceof Blob) form.append(key, value);
    else if (Array.isArray(value)) value.forEach(v => form.append(key, String(v)));
    else form.append(key, String(value));
  }
  return form;
}

/** Save a downloaded file in the browser. */
export function saveDownload({ blob, filename }: Download, fallbackName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const apiClient = new ApiClient();
