import { A2AMessage } from "./types";

export interface A2ALogEntry {
  id: string;
  timestamp: number;
  message: A2AMessage;
  direction: "incoming" | "outgoing";
  processed: boolean;
  error?: string;
}

export class A2ALogger {
  private logs: Map<string, A2ALogEntry> = new Map();
  private maxEntries: number = 10000;
  private onLogCallback?: (entry: A2ALogEntry) => void;

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

  private addEntry(entry: A2ALogEntry): void {
    this.logs.set(entry.id, entry);
    
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
}
