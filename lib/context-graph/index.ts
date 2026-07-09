import { ContextGraphStore } from "./memory-store";
import { AccessController } from "./access-control";
import { LifecycleManager } from "./lifecycle-manager";
import { MemoryType, AccessLevel, MemoryEntry } from "./types";

export class ContextGraphLayer {
  private store: ContextGraphStore;

  constructor(options?: {
    store?: ContextGraphStore;
  }) {
    this.store = options?.store || new ContextGraphStore();
  }

  /**
   * Stores an interaction memory
   */
  storeInteraction(
    agentId: string,
    content: Record<string, any>,
    options?: {
      accessLevel?: AccessLevel;
      tags?: string[];
      metadata?: Record<string, any>;
      ttl?: number;
    }
  ): MemoryEntry {
    return this.store.storeMemory({
      type: MemoryType.INTERACTION,
      agentId,
      content,
      accessLevel: options?.accessLevel || AccessLevel.AGENT_ONLY,
      accessList: [],
      relevanceScore: 0.8,
      tags: options?.tags || ["interaction"],
      metadata: options?.metadata || {},
      expiresAt: options?.ttl ? Date.now() + options.ttl : undefined,
    });
  }

  /**
   * Stores an agent state
   */
  storeAgentState(
    agentId: string,
    state: Record<string, any>,
    options?: {
      metadata?: Record<string, any>;
    }
  ): MemoryEntry {
    return this.store.storeMemory({
      type: MemoryType.AGENT_STATE,
      agentId,
      content: state,
      accessLevel: AccessLevel.PRIVATE,
      accessList: [],
      relevanceScore: 0.9,
      tags: ["state"],
      metadata: options?.metadata || {},
    });
  }

  /**
   * Stores a task outcome
   */
  storeTaskOutcome(
    agentId: string,
    taskId: string,
    outcome: Record<string, any>,
    options?: {
      accessLevel?: AccessLevel;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): MemoryEntry {
    return this.store.storeMemory({
      type: MemoryType.TASK_OUTCOME,
      agentId,
      content: { taskId, ...outcome },
      accessLevel: options?.accessLevel || AccessLevel.TEAM,
      accessList: [],
      relevanceScore: 0.7,
      tags: ["task", ...(options?.tags || [])],
      metadata: options?.metadata || {},
    });
  }

  /**
   * Stores shared context
   */
  storeSharedContext(
    agentId: string,
    context: Record<string, any>,
    accessList: string[],
    options?: {
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): MemoryEntry {
    return this.store.storeMemory({
      type: MemoryType.SHARED_CONTEXT,
      agentId,
      content: context,
      accessLevel: AccessLevel.TEAM,
      accessList,
      relevanceScore: 0.85,
      tags: ["shared", ...(options?.tags || [])],
      metadata: options?.metadata || {},
    });
  }

  /**
   * Gets the memory store
   */
  getStore(): ContextGraphStore {
    return this.store;
  }

  /**
   * Gets the access controller
   */
  getAccessController(): AccessController {
    return this.store.getAccessController();
  }

  /**
   * Gets the lifecycle manager
   */
  getLifecycleManager(): LifecycleManager {
    return this.store.getLifecycleManager();
  }
}

export * from "./types";
export * from "./access-control";
export * from "./lifecycle-manager";
export * from "./memory-store";
