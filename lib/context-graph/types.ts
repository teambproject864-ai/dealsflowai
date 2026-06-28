export enum MemoryType {
  INTERACTION = "interaction",
  AGENT_STATE = "agent_state",
  TASK_OUTCOME = "task_outcome",
  SHARED_CONTEXT = "shared_context",
  OBSERVATION = "observation",
}

export enum AccessLevel {
  PRIVATE = "private",
  AGENT_ONLY = "agent_only",
  TEAM = "team",
  PUBLIC = "public",
}

export interface MemoryEntry {
  id: string;
  type: MemoryType;
  agentId: string;
  content: Record<string, any>;
  accessLevel: AccessLevel;
  accessList: string[]; // Agent IDs with access
  relevanceScore: number;
  tags: string[];
  version: number;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  metadata: Record<string, any>;
}

export interface AgentContext {
  agentId: string;
  shortTermMemory: MemoryEntry[];
  longTermMemory: MemoryEntry[];
  workingMemory: MemoryEntry[];
  currentTask?: string;
  lastActive: number;
}

export interface MemoryQuery {
  agentId?: string;
  types?: MemoryType[];
  tags?: string[];
  accessLevel?: AccessLevel;
  dateRange?: { start: number; end: number };
  minRelevance?: number;
  limit?: number;
  offset?: number;
}

export interface MemoryUpdate {
  content?: Record<string, any>;
  accessLevel?: AccessLevel;
  accessList?: string[];
  relevanceScore?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface PruningConfig {
  maxEntries: number;
  maxAgeDays: number;
  minRelevanceThreshold: number;
}
