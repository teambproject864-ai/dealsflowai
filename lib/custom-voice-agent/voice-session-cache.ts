// lib/custom-voice-agent/voice-session-cache.ts

export interface CachedSession {
  agentName: string;
  callFramework: string;
  transcript: Array<{ role: "agent" | "customer"; text: string; timestamp?: string }>;
  repromptCount: number;
  callStartedAt: string;
  status: "initiated" | "ringing" | "in-progress" | "completed" | "failed";
  lastAccess: number;
}

class SessionCache {
  private cache = new Map<string, CachedSession>();
  private readonly ttl = 30 * 60 * 1000; // 30 minutes in ms
  private readonly maxEntries = 500; // avoid memory leaks

  constructor() {
    // Periodically clean up expired entries
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 5 * 60 * 1000).unref?.();
    }
  }

  get(sessionId: string): CachedSession | null {
    const entry = this.cache.get(sessionId);
    if (!entry) return null;

    if (Date.now() - entry.lastAccess > this.ttl) {
      this.cache.delete(sessionId);
      return null;
    }

    entry.lastAccess = Date.now();
    return entry;
  }

  set(sessionId: string, session: Omit<CachedSession, 'lastAccess'>): void {
    if (this.cache.size >= this.maxEntries) {
      // Evict the least recently used entry
      let oldestKey: string | null = null;
      let oldestTime = Infinity;
      for (const [key, value] of this.cache.entries()) {
        if (value.lastAccess < oldestTime) {
          oldestTime = value.lastAccess;
          oldestKey = key;
        }
      }
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(sessionId, {
      ...session,
      lastAccess: Date.now(),
    });
  }

  update(sessionId: string, updates: Partial<Omit<CachedSession, 'lastAccess'>>): void {
    const entry = this.get(sessionId);
    if (entry) {
      this.cache.set(sessionId, {
        ...entry,
        ...updates,
        lastAccess: Date.now(),
      });
    }
  }

  delete(sessionId: string): void {
    this.cache.delete(sessionId);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.lastAccess > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global singleton instance
export const voiceSessionCache = new SessionCache();
