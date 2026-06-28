import { A2AMessage, A2AMessageType, A2AAgentInfo } from "./types";
import { A2AValidator } from "./validator";
import { A2ALogger } from "./logger";
import { A2ARetryManager } from "./retry";

type MessageHandler = (message: A2AMessage) => Promise<void> | void;

export class A2AMessageBus {
  private subscribers: Map<string, Set<MessageHandler>> = new Map();
  private broadcastSubscribers: Set<MessageHandler> = new Set();
  private agents: Map<string, A2AAgentInfo> = new Map();
  private logger: A2ALogger;
  private retryManager: A2ARetryManager;
  private messageHandlers: Map<string, MessageHandler> = new Map();

  constructor(options?: {
    logger?: A2ALogger;
    retryManager?: A2ARetryManager;
  }) {
    this.logger = options?.logger || new A2ALogger();
    this.retryManager = options?.retryManager || new A2ARetryManager();
    
    // Start retry manager
    this.retryManager.start(
      (item) => this.sendMessage(item.message),
      (item) => console.error(`Max retries reached for message ${item.id}`, item.error)
    );
  }

  /**
   * Registers an agent with the message bus
   */
  registerAgent(agentInfo: A2AAgentInfo): void {
    this.agents.set(agentInfo.id, agentInfo);
  }

  /**
   * Unregisters an agent from the message bus
   */
  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
  }

  /**
   * Gets a registered agent by ID
   */
  getAgent(agentId: string): A2AAgentInfo | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Gets all registered agents
   */
  getAllAgents(): A2AAgentInfo[] {
    return Array.from(this.agents.values());
  }

  /**
   * Subscribes to messages for a specific agent
   */
  subscribe(agentId: string, handler: MessageHandler): () => void {
    if (!this.subscribers.has(agentId)) {
      this.subscribers.set(agentId, new Set());
    }
    this.subscribers.get(agentId)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.subscribers.get(agentId);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.subscribers.delete(agentId);
        }
      }
    };
  }

  /**
   * Subscribes to broadcast messages
   */
  subscribeBroadcast(handler: MessageHandler): () => void {
    this.broadcastSubscribers.add(handler);

    return () => {
      this.broadcastSubscribers.delete(handler);
    };
  }

  /**
   * Sends a message
   */
  async sendMessage(message: A2AMessage): Promise<void> {
    // Validate message
    const validation = A2AValidator.validateMessage(message);
    if (!validation.valid) {
      this.logger.logOutgoing(message, false, validation.error);
      throw new Error(validation.error);
    }

    this.logger.logOutgoing(validation.message);

    try {
      if (message.to === "broadcast") {
        // Broadcast message
        for (const handler of this.broadcastSubscribers) {
          await this.callHandler(handler, validation.message);
        }
      } else {
        // Direct message
        const handlers = this.subscribers.get(message.to);
        if (handlers && handlers.size > 0) {
          for (const handler of handlers) {
            await this.callHandler(handler, validation.message);
          }
          this.retryManager.removeFromRetryQueue(message.id);
        } else {
          // No subscribers, add to retry queue
          this.retryManager.addToRetryQueue(message, `No subscribers for agent ${message.to}`);
        }
      }
    } catch (error) {
      this.logger.logOutgoing(message, false, error instanceof Error ? error.message : "Unknown error");
      this.retryManager.addToRetryQueue(message, error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  }

  /**
   * Creates and sends a message
   */
  async createAndSendMessage(
    from: string,
    to: string | "broadcast",
    type: A2AMessageType,
    payload: Record<string, any>,
    options?: {
      correlationId?: string;
      priority?: "low" | "medium" | "high" | "critical";
      ttl?: number;
    }
  ): Promise<void> {
    const message: A2AMessage = {
      id: crypto.randomUUID(),
      from,
      to,
      type,
      payload,
      timestamp: Date.now(),
      version: "1.0.0",
      correlationId: options?.correlationId,
      priority: options?.priority || "medium",
      ttl: options?.ttl,
    };
    await this.sendMessage(message);
  }

  private async callHandler(handler: MessageHandler, message: A2AMessage): Promise<void> {
    try {
      await handler(message);
      this.logger.logIncoming(message);
    } catch (error) {
      this.logger.logIncoming(message, false, error instanceof Error ? error.message : "Handler error");
      throw error;
    }
  }

  /**
   * Gets the logger
   */
  getLogger(): A2ALogger {
    return this.logger;
  }

  /**
   * Gets the retry manager
   */
  getRetryManager(): A2ARetryManager {
    return this.retryManager;
  }

  /**
   * Shuts down the message bus
   */
  shutdown(): void {
    this.retryManager.stop();
  }
}
