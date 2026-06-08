import { SecurityEvent } from './types';
import { getHermes } from '../hermes';

export class AuditLogger {
  private logs: SecurityEvent[];
  private maxLogs: number;

  constructor(maxLogs: number = 10000) {
    this.logs = [];
    this.maxLogs = maxLogs;
  }

  log(event: SecurityEvent): void {
    this.logs.push(event);
    
    // Trim if exceeds max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to Hermes for persistent storage
    this.logToHermes(event).catch(err => {
      console.error('[Clawpatrol] Failed to log to Hermes:', err);
    });
  }

  private async logToHermes(event: SecurityEvent): Promise<void> {
    const hermes = getHermes();
    await hermes.storeMemory({
      content: JSON.stringify(event),
      category: 'security_audit',
      tier: 'long-term',
      keywords: [event.type, event.severity, event.agentId],
      importance: event.severity === 'critical' ? 10 : event.severity === 'high' ? 8 : 5,
      permissions: [],
      metadata: {
        eventId: event.id,
        agentId: event.agentId,
        eventType: event.type,
        severity: event.severity,
      },
    });
  }

  getLogs(options?: {
    agentId?: string;
    type?: string;
    severity?: string;
    limit?: number;
  }): SecurityEvent[] {
    let filtered = [...this.logs];

    if (options?.agentId) {
      filtered = filtered.filter(e => e.agentId === options.agentId);
    }
    if (options?.type) {
      filtered = filtered.filter(e => e.type === options.type);
    }
    if (options?.severity) {
      filtered = filtered.filter(e => e.severity === options.severity);
    }

    return filtered.slice(-(options?.limit || 100));
  }

  clearLogs(): void {
    this.logs = [];
  }
}
