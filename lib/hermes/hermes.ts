import {
  MemoryTier,
  MemoryEntry,
  MemoryPermission,
  MemoryMetrics,
  HermesConfig,
  MemoryConsolidationJob,
} from './types';
import { MemoryCache } from './memory-cache';
import { HermesEncryption } from './encryption';
import { hfEmbed } from '../huggingface';

const DEFAULT_CONFIG: HermesConfig = {
  defaultTier: 'short-term',
  consolidationIntervalMs: 3600000, // 1 hour
  archivalThresholdDays: 90,
  enableEncryption: true,
  cacheMaxSize: 1000,
  cacheTtlMs: 300000, // 5 minutes
};

export class HermesMemoryOS {
  private config: HermesConfig;
  private cache: MemoryCache;
  private memories: Map<string, MemoryEntry>;
  private metrics: MemoryMetrics;
  private consolidationTimer: NodeJS.Timeout | null;

  constructor(config: Partial<HermesConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new MemoryCache(this.config.cacheMaxSize, this.config.cacheTtlMs);
    this.memories = new Map();
    this.metrics = {
      totalMemories: 0,
      byTier: { working: 0, 'short-term': 0, 'long-term': 0, archival: 0 },
      averageRetrievalLatencyMs: 0,
      totalStorageBytes: 0,
      retrievalSuccessRate: 1,
    };
    this.consolidationTimer = null;

    // Start automatic consolidation
    this.startConsolidationProcess();
  }

  /**
   * Store a memory with proper tiering and encryption
   */
  async storeMemory({
    content,
    category,
    tier = this.config.defaultTier,
    leadId,
    sessionId,
    agentId,
    keywords,
    importance = 5,
    permissions = [],
    metadata = {},
  }: Omit<MemoryEntry, 'id' | 'embedding' | 'accessCount' | 'createdAt' | 'lastAccessed' | 'expiresAt' | 'isEncrypted' | 'permissions' | 'tier' | 'importance'> & {
    permissions?: MemoryPermission[];
    tier?: MemoryTier;
    importance?: number;
  }): Promise<MemoryEntry> {
    const startTime = Date.now();

    // Generate embedding
    const embedding = await hfEmbed(content);

    // Apply encryption if enabled
    let storedContent = content;
    let isEncrypted = false;
    if (this.config.enableEncryption) {
      storedContent = HermesEncryption.encrypt(content);
      isEncrypted = true;
    }

    const memoryId = crypto.randomUUID();
    const now = new Date().toISOString();

    const entry: MemoryEntry = {
      id: memoryId,
      content: storedContent,
      category,
      tier,
      leadId,
      sessionId,
      agentId,
      embedding,
      keywords,
      importance,
      accessCount: 0,
      createdAt: now,
      lastAccessed: now,
      permissions,
      isEncrypted,
      metadata,
    };

    // Set expiration if configured
    if (this.config.defaultTtlDays) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.config.defaultTtlDays);
      entry.expiresAt = expiresAt.toISOString();
    }

    // Store in memory
    this.memories.set(memoryId, entry);
    
    // Update cache
    this.cache.set(memoryId, entry);
    
    // Update metrics
    this.updateMetricsAfterStore(entry);

    const latency = Date.now() - startTime;
    this.updateRetrievalLatency(latency);

    return entry;
  }

  /**
   * Retrieve a memory by ID with permission check
   */
  async retrieveMemory(memoryId: string, agentId?: string): Promise<MemoryEntry | null> {
    const startTime = Date.now();

    // Check cache first
    let entry = this.cache.get(memoryId);
    if (!entry) {
      // Fetch from storage
      entry = this.memories.get(memoryId) || null;
      if (entry) {
        this.cache.set(memoryId, entry);
      }
    }

    if (!entry) {
      this.updateRetrievalSuccess(false);
      this.updateRetrievalLatency(Date.now() - startTime);
      return null;
    }

    // Check permissions
    if (agentId && !this.checkPermission(entry, agentId, 'read')) {
      this.updateRetrievalSuccess(false);
      this.updateRetrievalLatency(Date.now() - startTime);
      return null;
    }

    // Decrypt if needed
    if (entry.isEncrypted) {
      entry = { ...entry, content: HermesEncryption.decrypt(entry.content) };
    }

    // Update access stats
    this.updateAccessStats(memoryId);
    this.updateRetrievalSuccess(true);
    this.updateRetrievalLatency(Date.now() - startTime);

    return entry;
  }

  /**
   * Semantic search across memories
   */
  async searchMemories({
    query,
    leadId,
    sessionId,
    agentId,
    tier,
    limit = 10,
  }: {
    query: string;
    leadId?: string;
    sessionId?: string;
    agentId?: string;
    tier?: MemoryTier;
    limit?: number;
  }): Promise<MemoryEntry[]> {
    const queryEmbedding = await hfEmbed(query);
    
    const results: Array<{ entry: MemoryEntry; similarity: number }> = [];
    
    for (const entry of this.memories.values()) {
      // Filter by criteria
      if (leadId && entry.leadId !== leadId && entry.leadId !== 'global') continue;
      if (sessionId && entry.sessionId !== sessionId) continue;
      if (tier && entry.tier !== tier) continue;
      if (agentId && !this.checkPermission(entry, agentId, 'read')) continue;
      
      // Calculate similarity (dot product)
      const similarity = this.calculateCosineSimilarity(queryEmbedding, entry.embedding || []);
      
      results.push({ entry, similarity });
    }
    
    // Sort by similarity and return top results
    results.sort((a, b) => b.similarity - a.similarity);
    
    return results.slice(0, limit).map(({ entry }) => ({
      ...entry,
      content: entry.isEncrypted ? HermesEncryption.decrypt(entry.content) : entry.content,
    }));
  }

  /**
   * Consolidate memories across tiers
   */
  async consolidateMemories(job: MemoryConsolidationJob): Promise<number> {
    let consolidatedCount = 0;
    
    for (const [id, entry] of this.memories) {
      if (entry.tier !== job.sourceTier) continue;
      
      // Check consolidation criteria
      if (job.criteria.minImportance && entry.importance < job.criteria.minImportance) continue;
      if (job.criteria.minAccessCount && entry.accessCount < job.criteria.minAccessCount) continue;
      
      // Move to target tier
      entry.tier = job.targetTier;
      consolidatedCount++;
    }
    
    // Update metrics
    this.recalculateMetrics();
    
    return consolidatedCount;
  }

  /**
   * Archive old memories
   */
  async archiveOldMemories(): Promise<number> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - this.config.archivalThresholdDays);
    
    let archivedCount = 0;
    for (const [id, entry] of this.memories) {
      if (entry.tier === 'archival') continue;
      
      const lastAccessed = new Date(entry.lastAccessed);
      if (lastAccessed < thresholdDate) {
        entry.tier = 'archival';
        archivedCount++;
      }
    }
    
    this.recalculateMetrics();
    return archivedCount;
  }

  /**
   * Get current metrics
   */
  getMetrics(): MemoryMetrics {
    return { ...this.metrics };
  }

  /**
   * Stop the consolidation process
   */
  stopConsolidationProcess(): void {
    if (this.consolidationTimer) {
      clearTimeout(this.consolidationTimer);
      this.consolidationTimer = null;
    }
  }

  // Private methods

  private startConsolidationProcess(): void {
    const runConsolidation = async () => {
      try {
        await this.archiveOldMemories();
        await this.consolidateMemories({
          id: 'auto-consolidation',
          sourceTier: 'short-term',
          targetTier: 'long-term',
          criteria: { minImportance: 7, minAccessCount: 3 },
        });
      } catch (error) {
        console.error('[Hermes] Consolidation failed:', error);
      } finally {
        // Schedule next run
        this.consolidationTimer = setTimeout(runConsolidation, this.config.consolidationIntervalMs);
      }
    };
    
    // Start first run
    this.consolidationTimer = setTimeout(runConsolidation, 60000); // Start after 1 minute
  }

  private checkPermission(entry: MemoryEntry, agentId: string, action: 'read' | 'write' | 'delete'): boolean {
    if (entry.permissions.length === 0) return true;
    
    const permission = entry.permissions.find(p => p.agentId === agentId);
    return permission ? permission[action] : false;
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i]! * b[i]!;
      normA += Math.pow(a[i]!, 2);
      normB += Math.pow(b[i]!, 2);
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private updateAccessStats(memoryId: string): void {
    const entry = this.memories.get(memoryId);
    if (entry) {
      entry.accessCount++;
      entry.lastAccessed = new Date().toISOString();
      this.cache.set(memoryId, entry);
    }
  }

  private updateMetricsAfterStore(entry: MemoryEntry): void {
    this.metrics.totalMemories++;
    this.metrics.byTier[entry.tier]++;
    this.metrics.totalStorageBytes += entry.content.length * 2; // Approximate UTF-16 bytes
  }

  private recalculateMetrics(): void {
    this.metrics.totalMemories = this.memories.size;
    this.metrics.byTier = { working: 0, 'short-term': 0, 'long-term': 0, archival: 0 };
    this.metrics.totalStorageBytes = 0;
    
    for (const entry of this.memories.values()) {
      this.metrics.byTier[entry.tier]++;
      this.metrics.totalStorageBytes += entry.content.length * 2;
    }
  }

  private updateRetrievalLatency(latency: number): void {
    const current = this.metrics.averageRetrievalLatencyMs;
    this.metrics.averageRetrievalLatencyMs = (current * 0.9) + (latency * 0.1);
  }

  private updateRetrievalSuccess(success: boolean): void {
    const rate = this.metrics.retrievalSuccessRate;
    this.metrics.retrievalSuccessRate = (rate * 0.99) + (success ? 0.01 : 0);
  }
}

// Singleton instance
let hermesInstance: HermesMemoryOS | null = null;

export function getHermes(): HermesMemoryOS {
  if (!hermesInstance) {
    hermesInstance = new HermesMemoryOS();
  }
  return hermesInstance;
}
