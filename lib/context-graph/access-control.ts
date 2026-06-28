import { MemoryEntry, AccessLevel } from "./types";

export class AccessController {
  /**
   * Checks if an agent has access to a memory entry
   */
  hasAccess(agentId: string, memory: MemoryEntry): boolean {
    // Owner always has access
    if (memory.agentId === agentId) {
      return true;
    }

    // Check access level
    switch (memory.accessLevel) {
      case AccessLevel.PRIVATE:
        return false; // Only owner
      case AccessLevel.AGENT_ONLY:
        return false; // Only owner
      case AccessLevel.TEAM:
        return memory.accessList.includes(agentId);
      case AccessLevel.PUBLIC:
        return true;
      default:
        return false;
    }
  }

  /**
   * Filters memory entries that an agent has access to
   */
  filterAccessibleEntries(agentId: string, entries: MemoryEntry[]): MemoryEntry[] {
    return entries.filter(entry => this.hasAccess(agentId, entry));
  }

  /**
   * Grants access to an agent
   */
  grantAccess(memory: MemoryEntry, agentId: string): MemoryEntry {
    if (!memory.accessList.includes(agentId)) {
      return {
        ...memory,
        accessList: [...memory.accessList, agentId],
        updatedAt: Date.now(),
      };
    }
    return memory;
  }

  /**
   * Revokes access from an agent
   */
  revokeAccess(memory: MemoryEntry, agentId: string): MemoryEntry {
    return {
      ...memory,
      accessList: memory.accessList.filter(id => id !== agentId),
      updatedAt: Date.now(),
    };
  }

  /**
   * Changes access level
   */
  setAccessLevel(memory: MemoryEntry, accessLevel: AccessLevel): MemoryEntry {
    return {
      ...memory,
      accessLevel,
      updatedAt: Date.now(),
    };
  }
}
