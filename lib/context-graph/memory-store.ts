import { MemoryEntry, MemoryType, MemoryQuery, MemoryUpdate, AgentContext } from "./types";
import { AccessController } from "./access-control";
import { LifecycleManager } from "./lifecycle-manager";

export class ContextGraphStore {
  private memories: Map<string, MemoryEntry> = new Map();
  private agentContexts: Map<string, AgentContext> = new Map();
  private accessController: AccessController;
  private lifecycleManager: LifecycleManager;
  
  // Indexes for faster queries
  private agentIndex: Map<string, Set<string>> = new Map(); // agentId -> memoryIds
  private typeIndex: Map<MemoryType, Set<string>> = new Map(); // type -> memoryIds
  private tagIndex: Map<string, Set<string>> = new Map(); // tag -> memoryIds

  constructor(options?: {
    accessController?: AccessController;
    lifecycleManager?: LifecycleManager;
  }) {
    this.accessController = options?.accessController || new AccessController();
    this.lifecycleManager = options?.lifecycleManager || new LifecycleManager();
  }

  /**
   * Stores a new memory entry
   */
  storeMemory(
    memory: Omit<MemoryEntry, "id" | "version" | "createdAt" | "updatedAt">
  ): MemoryEntry {
    const id = crypto.randomUUID();
    const now = Date.now();
    
    const entry: MemoryEntry = {
      ...memory,
      id,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.memories.set(id, entry);
    this.updateIndexes(entry);
    this.updateAgentContext(entry.agentId, entry);

    return entry;
  }

  /**
   * Gets a memory entry by ID
   */
  getMemory(id: string, agentId?: string): MemoryEntry | undefined {
    const entry = this.memories.get(id);
    if (!entry) return undefined;
    
    // Check access if agentId is provided
    if (agentId && !this.accessController.hasAccess(agentId, entry)) {
      return undefined;
    }

    // Update relevance on access
    const updatedEntry = this.lifecycleManager.updateRelevanceOnAccess(entry);
    this.memories.set(id, updatedEntry);

    return updatedEntry;
  }

  /**
   * Updates a memory entry
   */
  updateMemory(id: string, update: MemoryUpdate): MemoryEntry | undefined {
    const entry = this.memories.get(id);
    if (!entry) return undefined;

    const updatedEntry: MemoryEntry = {
      ...entry,
      ...update,
      version: entry.version + 1,
      updatedAt: Date.now(),
    };

    // Handle tag changes
    if (update.tags) {
      this.removeFromTagIndex(entry);
    }

    this.memories.set(id, updatedEntry);
    
    if (update.tags) {
      this.addToTagIndex(updatedEntry);
    }

    return updatedEntry;
  }

  /**
   * Deletes a memory entry
   */
  deleteMemory(id: string): boolean {
    const entry = this.memories.get(id);
    if (!entry) return false;

    this.removeFromIndexes(entry);
    this.memories.delete(id);
    return true;
  }

  /**
   * Queries memory entries
   */
  queryMemories(query: MemoryQuery, requestingAgentId?: string): MemoryEntry[] {
    let results: MemoryEntry[] = [];
    let candidateIds = new Set<string>(this.memories.keys());

    // Apply filters
    if (query.agentId) {
      const agentIds = this.agentIndex.get(query.agentId);
      if (agentIds) {
        candidateIds = new Set([...candidateIds].filter(id => agentIds.has(id)));
      } else {
        candidateIds = new Set();
      }
    }

    if (query.types && query.types.length > 0) {
      const typeIds = query.types.flatMap(type => Array.from(this.typeIndex.get(type) || []));
      candidateIds = new Set([...candidateIds].filter(id => typeIds.includes(id)));
    }

    if (query.tags && query.tags.length > 0) {
      const tagIds = query.tags.flatMap(tag => Array.from(this.tagIndex.get(tag) || []));
      candidateIds = new Set([...candidateIds].filter(id => tagIds.includes(id)));
    }

    // Get candidate entries
    results = Array.from(candidateIds)
      .map(id => this.memories.get(id))
      .filter((e): e is MemoryEntry => e !== undefined);

    // Filter by date range
    if (query.dateRange) {
      const { start, end } = query.dateRange;
      results = results.filter(e => e.createdAt >= start && e.createdAt <= end);
    }

    // Filter by min relevance
    if (query.minRelevance !== undefined) {
      results = results.filter(e => e.relevanceScore >= (query.minRelevance || 0));
    }

    // Filter by access
    if (requestingAgentId) {
      results = this.accessController.filterAccessibleEntries(requestingAgentId, results);
    }

    // Sort by relevance and updated time
    results.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return b.updatedAt - a.updatedAt;
    });

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    results = results.slice(offset, offset + limit);

    return results;
  }

  /**
   * Gets agent context
   */
  getAgentContext(agentId: string): AgentContext {
    let context = this.agentContexts.get(agentId);
    
    if (!context) {
      context = {
        agentId,
        shortTermMemory: [],
        longTermMemory: [],
        workingMemory: [],
        lastActive: Date.now(),
      };
      this.agentContexts.set(agentId, context);
    }

    return context;
  }

  /**
   * Gets all memories for an agent
   */
  getAgentMemories(agentId: string): MemoryEntry[] {
    const memoryIds = this.agentIndex.get(agentId) || new Set();
    return Array.from(memoryIds)
      .map(id => this.memories.get(id))
      .filter((e): e is MemoryEntry => e !== undefined);
  }

  /**
   * Runs pruning
   */
  prune(): { pruned: number } {
    const allEntries = Array.from(this.memories.values());
    const { pruned, kept } = this.lifecycleManager.pruneEntries(allEntries);

    for (const entry of pruned) {
      this.deleteMemory(entry.id);
    }

    // Decay relevance for kept entries
    const decayed = this.lifecycleManager.decayRelevance(kept);
    for (const entry of decayed) {
      this.memories.set(entry.id, entry);
    }

    return { pruned: pruned.length };
  }

  /**
   * Gets access controller
   */
  getAccessController(): AccessController {
    return this.accessController;
  }

  /**
   * Gets lifecycle manager
   */
  getLifecycleManager(): LifecycleManager {
    return this.lifecycleManager;
  }

  // Index management
  private updateIndexes(entry: MemoryEntry): void {
    this.addToAgentIndex(entry);
    this.addToTypeIndex(entry);
    this.addToTagIndex(entry);
  }

  private removeFromIndexes(entry: MemoryEntry): void {
    this.removeFromAgentIndex(entry);
    this.removeFromTypeIndex(entry);
    this.removeFromTagIndex(entry);
  }

  private addToAgentIndex(entry: MemoryEntry): void {
    if (!this.agentIndex.has(entry.agentId)) {
      this.agentIndex.set(entry.agentId, new Set());
    }
    this.agentIndex.get(entry.agentId)!.add(entry.id);
  }

  private removeFromAgentIndex(entry: MemoryEntry): void {
    const ids = this.agentIndex.get(entry.agentId);
    if (ids) {
      ids.delete(entry.id);
      if (ids.size === 0) {
        this.agentIndex.delete(entry.agentId);
      }
    }
  }

  private addToTypeIndex(entry: MemoryEntry): void {
    if (!this.typeIndex.has(entry.type)) {
      this.typeIndex.set(entry.type, new Set());
    }
    this.typeIndex.get(entry.type)!.add(entry.id);
  }

  private removeFromTypeIndex(entry: MemoryEntry): void {
    const ids = this.typeIndex.get(entry.type);
    if (ids) {
      ids.delete(entry.id);
      if (ids.size === 0) {
        this.typeIndex.delete(entry.type);
      }
    }
  }

  private addToTagIndex(entry: MemoryEntry): void {
    for (const tag of entry.tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(entry.id);
    }
  }

  private removeFromTagIndex(entry: MemoryEntry): void {
    for (const tag of entry.tags) {
      const ids = this.tagIndex.get(tag);
      if (ids) {
        ids.delete(entry.id);
        if (ids.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    }
  }

  private updateAgentContext(agentId: string, entry: MemoryEntry): void {
    const context = this.getAgentContext(agentId);
    
    // Add to short term memory
    context.shortTermMemory.unshift(entry);
    if (context.shortTermMemory.length > 50) {
      const moved = context.shortTermMemory.pop();
      if (moved) {
        context.longTermMemory.push(moved);
      }
    }

    context.lastActive = Date.now();
    this.agentContexts.set(agentId, context);
  }
}
