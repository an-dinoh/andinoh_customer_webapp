import { AxiosError, type AxiosAdapter } from 'axios';
import { ApiError, apiClient, THROTTLE_RETRIES, throttleTiming } from '@/utils/api';

/** Answers each request with the next canned response; returns how many requests were sent. */
function respond(...responses: { status: number; data?: unknown; headers?: Record<string, string> }[]) {
  let calls = 0;
  const adapter: AxiosAdapter = async (config) => {
    const r = responses[Math.min(calls, responses.length - 1)];
    calls++;
    const response = { data: r.data ?? {}, status: r.status, statusText: String(r.status), headers: r.headers ?? {}, config, request: {} };
    if (r.status >= 400) throw new AxiosError(`Request failed with status code ${r.status}`, 'ERR_BAD_RESPONSE', config, {}, response);
    return response;
  };
  apiClient.http.defaults.adapter = adapter;
  return () => calls;
}

/** The error a request fails with. */
const failure = (request: Promise<unknown>) => request.then(() => { throw new Error('expected the request to fail'); }, (e: ApiError) => e);

const waits: number[] = [];
beforeEach(() => {
  waits.length = 0;
  jest.spyOn(throttleTiming, 'sleep').mockImplementation(async ms => { waits.push(ms); });
});
afterEach(() => jest.restoreAllMocks());

const throttled = { status: 429, data: { error: 'Request was throttled. Expected available in 3 seconds.', code: 'throttled' } };

describe('rate limits', () => {
  it('retries quietly and hands back the answer', async () => {
    const calls = respond(throttled, throttled, { status: 200, data: { ok: true } });
    await expect(apiClient.get('/customers/config/')).resolves.toEqual({ ok: true });
    expect(calls()).toBe(3);
    expect(waits).toEqual([1000, 2000]);
  });

  it('waits as long as Retry-After asks when that is short', async () => {
    respond({ ...throttled, headers: { 'retry-after': '5' } }, { status: 201, data: { id: 1 } });
    await expect(apiClient.post('/support/tickets/', {})).resolves.toEqual({ id: 1 });
    expect(waits).toEqual([5000]);
  });

  it('never tells the person about request limits when retries run out', async () => {
    const calls = respond(throttled);
    const err = await failure(apiClient.get('/hotels/'));
    expect(calls()).toBe(THROTTLE_RETRIES + 1);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe('We couldn’t complete that just now. Please try again.');
    expect(err.message).not.toMatch(/too many|requests|throttl/i);
  });

  it('doesn’t wait out a long Retry-After behind a spinner', async () => {
    const calls = respond({ ...throttled, headers: { 'retry-after': '600' } });
    const err = await failure(apiClient.get('/hotels/'));
    expect(calls()).toBe(1);
    expect(err.message).not.toMatch(/too many/i);
  });

  it('still explains a locked sign-in, without retrying it', async () => {
    const message = 'Too many failed sign-ins. Sign-in to this account is locked for 15 minutes.';
    const calls = respond({ status: 429, data: { error: message, code: 'too_many_login_attempts' } });
    const err = await failure(apiClient.post('/auth/login/', {}));
    expect(calls()).toBe(1);
    expect(err.message).toBe(message);
  });
});

describe('shared requests', () => {
  it('sends one request when the same thing is asked for twice at once', async () => {
    const calls = respond({ status: 200, data: { name: 'Andinoh' } });
    const [a, b] = await Promise.all([apiClient.get('/customers/config/'), apiClient.get('/customers/config/')]);
    expect(a).toEqual(b);
    expect(calls()).toBe(1);
    await apiClient.get('/customers/config/');
    expect(calls()).toBe(2);
  });
});
