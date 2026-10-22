/**
 * The last result of each page query, so a page that's opened again shows it straight away while it
 * refreshes in the background (stale-while-revalidate). Keyed by the API requests the query makes;
 * cleared when someone signs in or out so one account never sees another's data.
 */

const MAX_ENTRIES = 300;
const entries = new Map<string, unknown>();

export const queryCache = {
  get<T>(key: string): T | undefined {
    if (!entries.has(key)) return undefined;
    const value = entries.get(key) as T;
    // Most recently used last, so the oldest entry is the first to go.
    entries.delete(key);
    entries.set(key, value);
    return value;
  },
  set(key: string, value: unknown): void {
    entries.delete(key);
    entries.set(key, value);
    if (entries.size > MAX_ENTRIES) entries.delete(entries.keys().next().value as string);
  },
  clear(): void {
    entries.clear();
  },
  get size(): number {
    return entries.size;
  },
};
