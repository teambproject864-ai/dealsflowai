import { MemoryEntry } from './types';

export class MemoryCache {
  private cache: Map<string, { entry: MemoryEntry; expires: number }>;
  private maxSize: number;
  private ttlMs: number;

  constructor(maxSize: number = 1000, ttlMs: number = 60000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  get(key: string): MemoryEntry | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.entry;
  }

  set(key: string, entry: MemoryEntry): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey!);
    }
    
    this.cache.set(key, {
      entry,
      expires: Date.now() + this.ttlMs
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
