import { LRUCache } from 'lru-cache';

// Default cache options
const DEFAULT_OPTIONS = {
  max: 500, // Maximum number of items in cache
  ttl: 1000 * 60 * 5, // 5 minutes default TTL
};

// Type for cache keys
export type CacheKey = string | number;

// Create a singleton cache instance
const globalCache = new LRUCache<CacheKey, any>(DEFAULT_OPTIONS);

// Export the cache
export const cache = globalCache;

// Wrapper function for caching async data
export async function cached<T>(
  key: CacheKey,
  fn: () => Promise<T>,
  options?: { ttl?: number }
): Promise<T> {
  // Check if we have the value in cache
  const cachedValue = cache.get(key);
  if (cachedValue !== undefined) {
    console.log(`[Cache HIT] Key: ${key}`);
    return cachedValue;
  }

  // If not, execute the function and store the result
  console.log(`[Cache MISS] Key: ${key}`);
  const value = await fn();
  cache.set(key, value, { ttl: options?.ttl });
  return value;
}

// Function to invalidate a specific key
export function invalidateCache(key: CacheKey) {
  console.log(`[Cache INVALIDATE] Key: ${key}`);
  cache.delete(key);
}

// Function to invalidate keys by prefix
export function invalidateCacheByPrefix(prefix: string) {
  console.log(`[Cache INVALIDATE PREFIX] Prefix: ${prefix}`);
  const keysToDelete: CacheKey[] = [];
  for (const key of cache.keys()) {
    if (typeof key === 'string' && key.startsWith(prefix)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach((key) => cache.delete(key));
}

// Function to clear entire cache
export function clearCache() {
  console.warn('[Cache CLEAR] Entire cache cleared!');
  cache.clear();
}

// Function to get cache stats
export function getCacheStats() {
  return {
    size: cache.size,
    max: cache.max,
  };
}
