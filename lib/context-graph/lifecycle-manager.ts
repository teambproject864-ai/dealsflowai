import { MemoryEntry, PruningConfig } from "./types";

const DEFAULT_PRUNING_CONFIG: PruningConfig = {
  maxEntries: 10000,
  maxAgeDays: 90,
  minRelevanceThreshold: 0.1,
};

export class LifecycleManager {
  private config: PruningConfig;

  constructor(config?: Partial<PruningConfig>) {
    this.config = { ...DEFAULT_PRUNING_CONFIG, ...config };
  }

  /**
   * Prunes expired or low-relevance entries
   */
  pruneEntries(entries: MemoryEntry[]): { pruned: MemoryEntry[]; kept: MemoryEntry[] } {
    const now = Date.now();
    const maxAgeMs = this.config.maxAgeDays * 24 * 60 * 60 * 1000;

    const pruned: MemoryEntry[] = [];
    const kept: MemoryEntry[] = [];

    for (const entry of entries) {
      // Check if expired
      if (entry.expiresAt && entry.expiresAt < now) {
        pruned.push(entry);
        continue;
      }

      // Check age
      const age = now - entry.createdAt;
      if (age > maxAgeMs && entry.relevanceScore < this.config.minRelevanceThreshold) {
        pruned.push(entry);
        continue;
      }

      kept.push(entry);
    }

    // If we still have too many entries, remove lowest relevance
    if (kept.length > this.config.maxEntries) {
      kept.sort((a, b) => b.relevanceScore - a.relevanceScore);
      const toPrune = kept.splice(this.config.maxEntries);
      pruned.push(...toPrune);
    }

    return { pruned, kept };
  }

  /**
   * Updates relevance score based on access
   */
  updateRelevanceOnAccess(entry: MemoryEntry, decayFactor: number = 0.95): MemoryEntry {
    const boost = 0.1;
    const newScore = Math.min(1.0, entry.relevanceScore * decayFactor + boost);
    
    return {
      ...entry,
      relevanceScore: newScore,
      updatedAt: Date.now(),
    };
  }

  /**
   * Decays relevance scores over time
   */
  decayRelevance(entries: MemoryEntry[], halfLifeDays: number = 7): MemoryEntry[] {
    const now = Date.now();
    const halfLifeMs = halfLifeDays * 24 * 60 * 60 * 1000;

    return entries.map(entry => {
      const age = now - entry.updatedAt;
      const decayFactor = Math.pow(0.5, age / halfLifeMs);
      const newScore = entry.relevanceScore * decayFactor;

      return {
        ...entry,
        relevanceScore: newScore,
      };
    });
  }

  /**
   * Sets an expiration time for an entry
   */
  setExpiration(entry: MemoryEntry, ttlMs: number): MemoryEntry {
    return {
      ...entry,
      expiresAt: Date.now() + ttlMs,
      updatedAt: Date.now(),
    };
  }
}
