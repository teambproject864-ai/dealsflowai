import { A2AMessage } from "./types";

export interface RetryPolicy {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export interface RetryQueueItem {
  id: string;
  message: A2AMessage;
  attempt: number;
  lastAttemptTimestamp: number;
  nextRetryTimestamp: number;
  error?: string;
}

const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxRetries: 5,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    "network_error",
    "timeout",
    "agent_offline",
    "service_unavailable",
  ],
};

export class A2ARetryManager {
  private retryQueue: Map<string, RetryQueueItem> = new Map();
  private policy: RetryPolicy;
  private onRetryCallback?: (item: RetryQueueItem) => void;
  private onMaxRetriesCallback?: (item: RetryQueueItem) => void;
  private intervalId?: NodeJS.Timeout;

  constructor(policy?: Partial<RetryPolicy>) {
    this.policy = { ...DEFAULT_RETRY_POLICY, ...policy };
  }

  /**
   * Starts the retry manager
   */
  start(callback: (item: RetryQueueItem) => void, onMaxRetries?: (item: RetryQueueItem) => void): void {
    this.onRetryCallback = callback;
    this.onMaxRetriesCallback = onMaxRetries;
    
    this.intervalId = setInterval(() => {
      this.processRetryQueue();
    }, 500);
  }

  /**
   * Stops the retry manager
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  /**
   * Adds a message to the retry queue
   */
  addToRetryQueue(message: A2AMessage, error?: string): void {
    const item: RetryQueueItem = {
      id: message.id,
      message,
      attempt: 1,
      lastAttemptTimestamp: Date.now(),
      nextRetryTimestamp: Date.now() + this.policy.initialDelayMs,
      error,
    };
    this.retryQueue.set(item.id, item);
  }

  /**
   * Processes the retry queue
   */
  private processRetryQueue(): void {
    const now = Date.now();
    const itemsToProcess: RetryQueueItem[] = [];

    for (const item of this.retryQueue.values()) {
      if (item.nextRetryTimestamp <= now) {
        itemsToProcess.push(item);
      }
    }

    for (const item of itemsToProcess) {
      if (item.attempt > this.policy.maxRetries) {
        // Max retries reached
        this.retryQueue.delete(item.id);
        if (this.onMaxRetriesCallback) {
          this.onMaxRetriesCallback(item);
        }
      } else {
        // Retry the message
        if (this.onRetryCallback) {
          this.onRetryCallback(item);
        }
        
        // Update the item for next attempt
        const delay = Math.min(
          this.policy.initialDelayMs * Math.pow(this.policy.backoffMultiplier, item.attempt),
          this.policy.maxDelayMs
        );
        
        this.retryQueue.set(item.id, {
          ...item,
          attempt: item.attempt + 1,
          lastAttemptTimestamp: now,
          nextRetryTimestamp: now + delay,
        });
      }
    }
  }

  /**
   * Removes an item from the retry queue (successful delivery)
   */
  removeFromRetryQueue(messageId: string): void {
    this.retryQueue.delete(messageId);
  }

  /**
   * Gets all items in the retry queue
   */
  getRetryQueue(): RetryQueueItem[] {
    return Array.from(this.retryQueue.values())
      .sort((a, b) => a.nextRetryTimestamp - b.nextRetryTimestamp);
  }

  /**
   * Clears the retry queue
   */
  clearRetryQueue(): void {
    this.retryQueue.clear();
  }
}
