export interface CacheEntry<T = unknown> {
  value: T;
  /** Epoch milliseconds when the entry was stored. */
  storedAt: number;
  /** Server version or ETag, for conditional revalidation. */
  version?: string;
}

/**
 * Device-local cache for offline reads. Implementations: memory (tests), IndexedDB (web),
 * SQLite (native), the desktop offline store. Writes made offline are queued by the product,
 * not by this cache.
 */
export interface OfflineCache {
  get<T>(key: string): Promise<CacheEntry<T> | undefined>;
  set<T>(key: string, value: T, version?: string): Promise<void>;
  delete(key: string): Promise<void>;
  /** Remove every key starting with `prefix`, or everything when omitted. */
  clear(prefix?: string): Promise<void>;
  keys(prefix?: string): Promise<string[]>;
}

export function createMemoryCache(now: () => number = Date.now): OfflineCache {
  const entries = new Map<string, CacheEntry>();
  const matching = (prefix?: string) => [...entries.keys()].filter((key) => !prefix || key.startsWith(prefix));
  return {
    async get<T>(key: string) {
      return entries.get(key) as CacheEntry<T> | undefined;
    },
    async set(key, value, version) {
      entries.set(key, version === undefined ? { value, storedAt: now() } : { value, storedAt: now(), version });
    },
    async delete(key) {
      entries.delete(key);
    },
    async clear(prefix) {
      for (const key of matching(prefix)) entries.delete(key);
    },
    async keys(prefix) {
      return matching(prefix);
    },
  };
}
