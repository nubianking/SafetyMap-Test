// ============================================================================
// ROUTE CACHE — localStorage-backed cache with LRU eviction & offline fallback
// ============================================================================

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;   // epoch ms when stored
  lastAccess: number;   // epoch ms — updated on every read (for LRU)
  key: string;
}

interface CacheMetadata {
  keys: string[];       // ordered oldest → newest by lastAccess
}

const CACHE_PREFIX = 'sm_route_';
const META_KEY = 'sm_route__meta';
const MAX_ENTRIES = 50;

// TTL defaults (ms)
const TTL = {
  directions: 10 * 60 * 1000,       // 10 min
  'distance-matrix': 10 * 60 * 1000, // 10 min
  geocode: 30 * 60 * 1000,          // 30 min
  default: 10 * 60 * 1000,          // 10 min
} as const;

// ---- Hashing ----------------------------------------------------------------

/**
 * Fast deterministic hash for cache keys.
 * Uses djb2 — small, fast, collision-resistant enough for cache keys.
 */
function hashParams(params: Record<string, string | undefined>): string {
  const sorted = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  let hash = 5381;
  for (let i = 0; i < sorted.length; i++) {
    hash = ((hash << 5) + hash + sorted.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

// ---- Metadata helpers -------------------------------------------------------

function getMeta(): CacheMetadata {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : { keys: [] };
  } catch {
    return { keys: [] };
  }
}

function setMeta(meta: CacheMetadata): void {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch { /* quota exceeded — handled by eviction */ }
}

// ---- Core cache class -------------------------------------------------------

class RouteCache {
  /**
   * Build a deterministic cache key from endpoint + params.
   */
  buildKey(endpoint: string, params: Record<string, string | undefined>): string {
    return `${CACHE_PREFIX}${endpoint}_${hashParams(params)}`;
  }

  /**
   * Get a cached entry. Returns `null` on miss or expiry.
   * If `allowStale` is true, returns expired entries (for offline fallback).
   */
  get<T = any>(key: string, allowStale = false): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);
      const endpoint = key.replace(CACHE_PREFIX, '').split('_')[0];
      const ttl = TTL[endpoint as keyof typeof TTL] ?? TTL.default;
      const isExpired = Date.now() - entry.timestamp > ttl;

      if (isExpired && !allowStale) return null;

      // Update lastAccess for LRU tracking
      entry.lastAccess = Date.now();
      localStorage.setItem(key, JSON.stringify(entry));
      this.touchMeta(key);

      return entry.data;
    } catch {
      return null;
    }
  }

  /**
   * Store a value in the cache. Evicts LRU entries if over capacity.
   */
  set<T = any>(key: string, data: T): void {
    // Evict if at capacity
    this.ensureCapacity();

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      lastAccess: Date.now(),
      key,
    };

    try {
      localStorage.setItem(key, JSON.stringify(entry));
      this.addToMeta(key);
    } catch {
      // localStorage quota exceeded — evict more and retry once
      this.evict(10);
      try {
        localStorage.setItem(key, JSON.stringify(entry));
        this.addToMeta(key);
      } catch {
        console.warn('[RouteCache] Unable to store entry — quota exceeded');
      }
    }
  }

  /**
   * Clear all route cache entries.
   */
  clear(): void {
    const meta = getMeta();
    meta.keys.forEach(k => {
      try { localStorage.removeItem(k); } catch {}
    });
    setMeta({ keys: [] });
  }

  /**
   * Get cache statistics for debugging.
   */
  stats(): { entryCount: number; keys: string[] } {
    const meta = getMeta();
    return { entryCount: meta.keys.length, keys: [...meta.keys] };
  }

  // ---- internal helpers -----------------------------------------------------

  private touchMeta(key: string): void {
    const meta = getMeta();
    meta.keys = meta.keys.filter(k => k !== key);
    meta.keys.push(key); // move to end (most recently used)
    setMeta(meta);
  }

  private addToMeta(key: string): void {
    const meta = getMeta();
    if (!meta.keys.includes(key)) {
      meta.keys.push(key);
    }
    setMeta(meta);
  }

  private ensureCapacity(): void {
    const meta = getMeta();
    if (meta.keys.length >= MAX_ENTRIES) {
      this.evict(meta.keys.length - MAX_ENTRIES + 1);
    }
  }

  private evict(count: number): void {
    const meta = getMeta();
    const toRemove = meta.keys.splice(0, count); // remove oldest (LRU)
    toRemove.forEach(k => {
      try { localStorage.removeItem(k); } catch {}
    });
    setMeta(meta);
  }
}

export const routeCache = new RouteCache();
