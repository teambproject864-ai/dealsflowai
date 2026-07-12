import { initializeIntegratedSystem } from "./integrated-system";
import { logger } from "./logger";
import { A2AMessageType } from "./a2a/types";

export interface SyncableEntity {
  id: string;
  type: string;
  data: Record<string, any>;
  version: number;
  lastUpdated: number;
}

export interface SyncOperation {
  type: "create" | "update" | "delete";
  entity: SyncableEntity;
}

export class CrossSystemSyncManager {
  private static instance: CrossSystemSyncManager;
  private syncQueue: SyncOperation[] = [];
  private isProcessing: boolean = false;
  private subscriptions: Map<string, Set<(op: SyncOperation) => void>> = new Map();

  private constructor() {
    logger.info("[CrossSystemSyncManager] Initialized");
  }

  static getInstance(): CrossSystemSyncManager {
    if (!CrossSystemSyncManager.instance) {
      CrossSystemSyncManager.instance = new CrossSystemSyncManager();
    }
    return CrossSystemSyncManager.instance;
  }

  async publishSync(op: SyncOperation): Promise<void> {
    logger.info(`[CrossSystemSyncManager] Publishing sync operation: ${op.type} ${op.entity.type}:${op.entity.id}`);
    this.syncQueue.push(op);
    await this.processQueue();
    await this.notifySubscribers(op);
  }

  subscribe(entityType: string, callback: (op: SyncOperation) => void): () => void {
    if (!this.subscriptions.has(entityType)) {
      this.subscriptions.set(entityType, new Set());
    }
    this.subscriptions.get(entityType)!.add(callback);
    return () => {
      this.subscriptions.get(entityType)?.delete(callback);
    };
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.syncQueue.length > 0) {
        const op = this.syncQueue.shift();
        if (op) {
          await this.broadcastSync(op);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async broadcastSync(op: SyncOperation): Promise<void> {
    try {
      const { messageBus } = initializeIntegratedSystem();
      await messageBus.createAndSendMessage(
        "sync-manager",
        "broadcast",
        A2AMessageType.STATE_SYNC,
        {
          stateType: op.entity.type,
          stateData: {
            operation: op.type,
            entity: op.entity,
          },
          version: op.entity.version,
          timestamp: op.entity.lastUpdated,
        }
      );
    } catch (error) {
      logger.error("[CrossSystemSyncManager] Failed to broadcast sync", error);
    }
  }

  private async notifySubscribers(op: SyncOperation): Promise<void> {
    const callbacks = this.subscriptions.get(op.entity.type) || new Set();
    for (const callback of callbacks) {
      try {
        await callback(op);
      } catch (error) {
        logger.error("[CrossSystemSyncManager] Subscriber callback failed", error);
      }
    }
  }

  getSyncQueue(): SyncOperation[] {
    return [...this.syncQueue];
  }
}

export const crossSystemSync = CrossSystemSyncManager.getInstance();
