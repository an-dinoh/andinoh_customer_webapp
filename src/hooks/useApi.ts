'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ApiError, errorMessage, recordRequests, WRITE_REQUEST } from '@/utils/api';
import { queryCache } from '@/utils/queryCache';

export interface Query<T> {
  data: T | undefined;
  error: ApiError | Error | null;
  /** True only while there's nothing to show yet; refreshes behind cached data don't set it. */
  loading: boolean;
  /** True while a request is in flight, including background refreshes. */
  refreshing: boolean;
  /** Re-runs the request, keeping the current data on screen meanwhile. */
  reload: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | undefined>>;
}

/** The cache key for a fetcher: the GET requests it makes, or null when it can't be cached. */
function cacheKey(fetcher: () => unknown): string | null {
  const requests = recordRequests(fetcher);
  return requests.length && !requests.includes(WRITE_REQUEST) ? requests.join(' | ') : null;
}

/**
 * Loads `fetcher()` and re-loads whenever `deps` change. Pass `enabled: false` to wait (e.g. until a
 * permission is known). Stale responses from an earlier run are dropped.
 *
 * Stale-while-revalidate: a query that has run before (same requests) shows its last result at once
 * and refreshes in the background, so revisiting a page doesn't flash a loader. `loading` is only true
 * when there's nothing to show yet.
 */
export function useQuery<T>(fetcher: () => Promise<T>, deps: unknown[] = [], opts: { enabled?: boolean } = {}): Query<T> {
  const enabled = opts.enabled ?? true;
  const fetcherRef = useRef(fetcher);
  // A cached result to show on the first render, and the request it came from.
  const [initial] = useState(() => {
    if (!enabled) return { data: undefined, key: null };
    const key = cacheKey(fetcher);
    const cached = key ? queryCache.get<T>(key) : undefined;
    return { data: cached, key: cached !== undefined ? key : null };
  });
  // What's on screen, and the request it came from.
  const shownKey = useRef<string | null>(initial.key);
  const [data, setDataState] = useState<T | undefined>(initial.data);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [loading, setLoading] = useState(enabled && data === undefined);
  const [refreshing, setRefreshing] = useState(false);
  const run = useRef(0);
  const dataRef = useRef(data);
  // The latest fetcher and data, for load() (declared before the effect that runs it, so it's current).
  useEffect(() => {
    fetcherRef.current = fetcher;
    dataRef.current = data;
  });

  const load = useCallback(async () => {
    const id = ++run.current;
    const key = cacheKey(fetcherRef.current);
    const cached = key ? queryCache.get<T>(key) : undefined;
    const showingThis = key !== null && shownKey.current === key && dataRef.current !== undefined;
    if (!showingThis && cached !== undefined) {
      // Seen before: show it now, refresh behind it.
      setDataState(cached);
      shownKey.current = key;
    }
    const haveSomething = showingThis || cached !== undefined;
    setLoading(!haveSomething);
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (id === run.current) {
        setDataState(result);
        shownKey.current = key;
        if (key) queryCache.set(key, result);
      }
    } catch (err) {
      // Behind cached data a failed refresh stays quiet; with nothing to show, the page shows the error.
      if (id === run.current && !haveSomething) setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (id === run.current) { setLoading(false); setRefreshing(false); }
    }
  }, []);

  // Local edits (optimistic updates) also update the cache, so the next visit shows them.
  const setData = useCallback<React.Dispatch<React.SetStateAction<T | undefined>>>((next) => {
    setDataState(prev => {
      const value = typeof next === 'function' ? (next as (p: T | undefined) => T | undefined)(prev) : next;
      if (shownKey.current && value !== undefined) queryCache.set(shownKey.current, value);
      return value;
    });
  }, []);

  useEffect(() => {
    if (enabled) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return { data, error, loading: enabled && loading, refreshing, reload: load, setData };
}

export interface Mutation<A extends unknown[], R> {
  run: (...args: A) => Promise<R | undefined>;
  busy: boolean;
  error: ApiError | null;
  /** Field-by-field messages from a 400, to mark inputs. */
  fieldErrors: Record<string, string>;
  reset: () => void;
}

/**
 * Wraps an action that changes something: tracks busy state, shows the server's own sentence on
 * failure (toast), and optionally a success toast.
 */
export function useMutation<A extends unknown[], R>(
  action: (...args: A) => Promise<R>,
  opts: { success?: string | ((result: R) => string); onSuccess?: (result: R) => void; silentError?: boolean } = {},
): Mutation<A, R> {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const actionRef = useRef(action);
  const optsRef = useRef(opts);
  useEffect(() => {
    actionRef.current = action;
    optsRef.current = opts;
  });

  const run = useCallback(async (...args: A) => {
    setBusy(true);
    setError(null);
    try {
      const result = await actionRef.current(...args);
      const { success, onSuccess } = optsRef.current;
      if (success) toast.success(typeof success === 'function' ? success(result) : success);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      setError(apiErr);
      if (!optsRef.current.silentError) toast.error(errorMessage(err));
      return undefined;
    } finally {
      setBusy(false);
    }
  }, []);

  return { run, busy, error, fieldErrors: error?.fieldErrors ?? {}, reset: () => setError(null) };
}

/** A value that only changes after `delay` ms without updates (search boxes). */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
