import { A2AMessage, A2AMessageType } from "./types";

export interface A2ALogEntry {
  id: string;
  timestamp: number;
  message: A2AMessage;
  direction: "incoming" | "outgoing";
  processed: boolean;
  error?: string;
}

export interface A2AMetrics {
  totalMessages: number;
  messagesByType: Record<string, number>;
  messagesByAgent: Record<string, number>;
  errorCount: number;
  averageLatencyMs: number;
  messagesLastHour: number;
}

export class A2ALogger {
  private logs: Map<string, A2ALogEntry> = new Map();
  private maxEntries: number = 10000;
  private onLogCallback?: (entry: A2ALogEntry) => void;
  private messageTimings: Map<string, number> = new Map();
  private metrics: A2AMetrics = {
    totalMessages: 0,
    messagesByType: {},
    messagesByAgent: {},
    errorCount: 0,
    averageLatencyMs: 0,
    messagesLastHour: 0,
  };
  private latencies: number[] = [];

  constructor(options?: { maxEntries?: number; onLog?: (entry: A2ALogEntry) => void }) {
    if (options?.maxEntries) {
      this.maxEntries = options.maxEntries;
    }
    this.onLogCallback = options?.onLog;
  }

  /**
   * Logs an incoming message
   */
  logIncoming(message: A2AMessage, processed: boolean = true, error?: string): void {
    const entry: A2ALogEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      message,
      direction: "incoming",
      processed,
      error,
    };
    this.addEntry(entry);
  }

  /**
   * Logs an outgoing message
   */
  logOutgoing(message: A2AMessage, processed: boolean = true, error?: string): void {
    const entry: A2ALogEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      message,
      direction: "outgoing",
      processed,
      error,
    };
    this.addEntry(entry);
  }

  /**
   * Starts timing a message
   */
  startTiming(messageId: string): void {
    this.messageTimings.set(messageId, Date.now());
  }

  /**
   * Ends timing a message and returns latency in ms
   */
  endTiming(messageId: string): number | null {
    const start = this.messageTimings.get(messageId);
    if (!start) return null;
    const latency = Date.now() - start;
    this.latencies.push(latency);
    // Keep only last 1000 latencies
    if (this.latencies.length > 1000) {
      this.latencies.shift();
    }
    this.messageTimings.delete(messageId);
    return latency;
  }

  private addEntry(entry: A2ALogEntry): void {
    this.logs.set(entry.id, entry);
    
    // Update metrics
    this.metrics.totalMessages++;
    this.metrics.messagesByType[entry.message.type] =
      (this.metrics.messagesByType[entry.message.type] || 0) + 1;
    this.metrics.messagesByAgent[entry.message.from] =
      (this.metrics.messagesByAgent[entry.message.from] || 0) + 1;
    if (entry.error) {
      this.metrics.errorCount++;
    }

    // Calculate average latency
    if (this.latencies.length > 0) {
      this.metrics.averageLatencyMs =
        this.latencies.reduce((sum, val) => sum + val, 0) / this.latencies.length;
    }

    // Trim if we exceed max entries
    if (this.logs.size > this.maxEntries) {
      const sortedEntries = Array.from(this.logs.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = this.logs.size - this.maxEntries;
      for (let i = 0; i < toRemove; i++) {
        this.logs.delete(sortedEntries[i][0]);
      }
    }

    if (this.onLogCallback) {
      this.onLogCallback(entry);
    }
  }

  /**
   * Gets logs by correlation ID
   */
  getLogsByCorrelationId(correlationId: string): A2ALogEntry[] {
    return Array.from(this.logs.values())
      .filter(entry => entry.message.correlationId === correlationId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Gets logs by agent ID
   */
  getLogsByAgentId(agentId: string): A2ALogEntry[] {
    return Array.from(this.logs.values())
      .filter(entry => entry.message.from === agentId || entry.message.to === agentId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Gets all logs
   */
  getAllLogs(): A2ALogEntry[] {
    return Array.from(this.logs.values())
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Clears all logs
   */
  clearLogs(): void {
    this.logs.clear();
  }

  /**
   * Gets metrics
   */
  getMetrics(): A2AMetrics {
    // Update messagesLastHour
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.metrics.messagesLastHour = Array.from(this.logs.values()).filter(
      (entry) => entry.timestamp > oneHourAgo
    ).length;
    return { ...this.metrics };
  }
}
