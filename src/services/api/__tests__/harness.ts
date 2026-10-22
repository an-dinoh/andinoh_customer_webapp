import fs from 'node:fs';
import path from 'node:path';
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { apiClient } from '@/utils/api';

/**
 * Contract-test harness: the backend's captured examples ({request, status, body}, synced into
 * test/fixtures/api-examples by `npm run api:examples`) are replayed against the real service code.
 * Each call must send exactly the captured request, and gets the captured response back.
 */

export interface Example {
  request: {
    method: string;
    path: string;
    query?: Record<string, string>;
    body?: unknown;
    multipart?: Record<string, string>;
    /** Values are redacted in the captures; the names must be sent. */
    headers?: Record<string, string>;
  };
  status: number;
  body: unknown;
}

export type App = 'customer-app' | 'shared';

const FIXTURES = path.join(process.cwd(), 'test/fixtures/api-examples');

export function example(name: string, app: App = 'customer-app'): Example {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES, app, `${name}.json`), 'utf8'));
}

export function exampleNames(app: App = 'customer-app'): string[] {
  return fs.readdirSync(path.join(FIXTURES, app)).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).sort();
}

/** The path segment at `index` (0-based, ignoring empty segments), e.g. an id. */
export function seg(ex: Example, index: number): string {
  return ex.request.path.split('/').filter(Boolean)[index];
}

/** Query params the services may add on their own (e.g. a larger page for short lists). */
const ALLOWED_EXTRA_PARAMS = new Set(['page_size']);

export interface Sent {
  method: string;
  path: string;
  params: Record<string, string>;
  body: unknown;
  multipart: Record<string, string> | null;
  responseType?: string;
  headers: Record<string, string>;
}

function describeForm(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  form.forEach((value, key) => {
    out[key] = typeof value === 'string' ? value : `<file ${(value as File).name}>`;
  });
  return out;
}

function sentFrom(config: InternalAxiosRequestConfig): Sent {
  const url = (config.url ?? '').replace(/^\//, '');
  const params = Object.fromEntries(Object.entries(config.params ?? {}).map(([k, v]) => [k, String(v)]));
  const isForm = typeof FormData !== 'undefined' && config.data instanceof FormData;
  let body: unknown = undefined;
  if (!isForm && config.data !== undefined) body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
  return {
    method: (config.method ?? 'get').toUpperCase(),
    path: '/' + url,
    params,
    body,
    multipart: isForm ? describeForm(config.data) : null,
    responseType: config.responseType,
    headers: Object.fromEntries(Object.entries(config.headers?.toJSON?.() ?? config.headers ?? {}).map(([k, v]) => [k.toLowerCase(), String(v)])),
  };
}

/**
 * Replays `ex` for one call: asserts the request matches and resolves with the example's response.
 * Returns what was sent, for extra assertions.
 */
export function replay(ex: Example, extraHeaders: Record<string, string> = {}): { sent: () => Sent } {
  let sent: Sent | null = null;
  const adapter: AxiosAdapter = async (config) => {
    sent = sentFrom(config);
    let data: unknown = ex.body;
    const headers: Record<string, string> = { 'x-request-id': 'test-request-id', ...extraHeaders };
    if (sent.responseType === 'blob') {
      const meta = (ex.body ?? {}) as { content_type?: string; content_disposition?: string; preview?: string };
      if (ex.status < 400) {
        headers['content-type'] = meta.content_type ?? 'application/octet-stream';
        if (meta.content_disposition) headers['content-disposition'] = meta.content_disposition;
        data = new Blob([meta.preview ?? '%PDF-1.4'], { type: headers['content-type'] });
      } else {
        data = new Blob([JSON.stringify(ex.body)], { type: 'application/json' });
      }
    }
    const response = { data, status: ex.status, statusText: String(ex.status), headers, config, request: {} };
    if (ex.status >= 400) {
      const { AxiosError } = await import('axios');
      throw new AxiosError(`Request failed with status code ${ex.status}`, 'ERR_BAD_RESPONSE', config, {}, response);
    }
    return response;
  };
  apiClient.http.defaults.adapter = adapter;
  return { sent: () => { if (!sent) throw new Error('No request was sent'); return sent; } };
}

/** Asserts the recorded request is the example's request. */
export function expectRequestMatches(ex: Example, sent: Sent): void {
  expect(sent.method).toBe(ex.request.method);
  expect(sent.path).toBe(ex.request.path);
  for (const name of Object.keys(ex.request.headers ?? {})) expect([name, Boolean(sent.headers[name.toLowerCase()])]).toEqual([name, true]);

  const expectedQuery = ex.request.query ?? {};
  for (const [k, v] of Object.entries(expectedQuery)) expect([k, sent.params[k]]).toEqual([k, String(v)]);
  for (const k of Object.keys(sent.params)) {
    if (!(k in expectedQuery)) expect(ALLOWED_EXTRA_PARAMS.has(k) ? k : `unexpected param ${k}`).toBe(k);
  }

  if (ex.request.multipart) {
    expect(sent.multipart).toEqual(ex.request.multipart);
  } else if (ex.request.body !== undefined && ex.request.body !== null) {
    expect(sent.body).toEqual(ex.request.body);
  } else if (sent.body !== undefined && ex.request.method !== 'GET') {
    // A body-less example: we may send nothing or an empty object, never data.
    expect(sent.body).toEqual({});
  }
}
