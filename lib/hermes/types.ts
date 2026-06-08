export type MemoryTier = 'working' | 'short-term' | 'long-term' | 'archival';

export interface MemoryPermission {
  agentId: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface MemoryEntry {
  id: string;
  content: string;
  tier: MemoryTier;
  category: string;
  leadId?: string;
  sessionId?: string;
  agentId?: string;
  embedding?: number[];
  keywords: string[];
  importance: number; // 0-10
  accessCount: number;
  createdAt: string;
  lastAccessed: string;
  expiresAt?: string;
  permissions: MemoryPermission[];
  isEncrypted: boolean;
  metadata: Record<string, any>;
}

export interface MemoryIngestionEvent {
  id: string;
  timestamp: number;
  memoryId: string;
  status: 'pending' | 'processed' | 'failed';
}

export interface MemoryConsolidationJob {
  id: string;
  sourceTier: MemoryTier;
  targetTier: MemoryTier;
  criteria: {
    minImportance?: number;
    minAccessCount?: number;
    ageDays?: number;
  };
}

export interface MemoryMetrics {
  totalMemories: number;
  byTier: Record<MemoryTier, number>;
  averageRetrievalLatencyMs: number;
  totalStorageBytes: number;
  retrievalSuccessRate: number;
}

export interface HermesConfig {
  defaultTier: MemoryTier;
  consolidationIntervalMs: number;
  archivalThresholdDays: number;
  defaultTtlDays?: number;
  enableEncryption: boolean;
  cacheMaxSize: number;
  cacheTtlMs: number;
}
