interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

interface CacheOptions {
  ttl?: number;
  staleTtl?: number;
}

export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = 60, staleTtl = 300 } = options;
  const now = Date.now();
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  if (entry) {
    const age = (now - entry.timestamp) / 1000;

    // Fresh: return cached data
    if (age < ttl) {
      return entry.data;
    }

    // Stale but within staleTtl: return stale data and trigger background refresh
    if (age < staleTtl) {
      // Background refresh - don't await
      fn().then((data) => {
        cache.set(key, { data, timestamp: Date.now() });
      }).catch(() => {
        // Silently fail on background refresh
      });
      return entry.data;
    }
  }

  // Cache miss or expired: await fresh data
  const data = await fn();

  // Evict oldest entries if cache exceeds max size
  if (cache.size >= 1000) {
    const entries = [...cache.entries()].sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    );
    for (let i = 0; i < 200; i++) {
      cache.delete(entries[i][0]);
    }
  }

  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
