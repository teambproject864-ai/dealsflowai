import {
  ClawpatrolConfig,
  SecurityEvent,
  SecurityEventType,
  SecuritySeverity,
  AgentIdentity,
  SecurityPolicy,
  AnomalyScore,
} from './types';
import { PromptInjectionDetector } from './prompt-injection-detector';
import { AuditLogger } from './audit-logger';

const DEFAULT_CONFIG: ClawpatrolConfig = {
  enablePromptInjectionDetection: true,
  enableDataExfiltrationPrevention: true,
  enableAnomalyDetection: true,
  defaultPolicySeverity: SecuritySeverity.MEDIUM,
  alertThresholds: {
    low: 10,
    medium: 5,
    high: 2,
    critical: 1,
  },
  siemIntegrationEnabled: true,
  auditLogRetentionDays: 90,
};

export class ClawpatrolFirewall {
  private config: ClawpatrolConfig;
  private promptInjectionDetector: PromptInjectionDetector;
  private auditLogger: AuditLogger;
  private agentIdentities: Map<string, AgentIdentity>;
  private policies: SecurityPolicy[];
  private anomalyScores: Map<string, AnomalyScore>;
  private requestCounts: Map<string, number>;

  constructor(config: Partial<ClawpatrolConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.promptInjectionDetector = new PromptInjectionDetector();
    this.auditLogger = new AuditLogger();
    this.agentIdentities = new Map();
    this.policies = this.getDefaultPolicies();
    this.anomalyScores = new Map();
    this.requestCounts = new Map();
  }

  /**
   * Register an agent identity
   */
  registerAgent(identity: AgentIdentity): void {
    this.agentIdentities.set(identity.agentId, identity);
  }

  /**
   * Authenticate an agent
   */
  authenticateAgent(agentId: string, credentials: any): boolean {
    const identity = this.agentIdentities.get(agentId);
    if (!identity) {
      this.logEvent({
        type: SecurityEventType.UNAUTHORIZED_ACCESS,
        agentId,
        severity: SecuritySeverity.HIGH,
        description: `Unknown agent attempted access: ${agentId}`,
        context: { credentials },
        blocked: true,
      });
      return false;
    }

    // Update last authenticated timestamp
    identity.lastAuthenticatedAt = new Date().toISOString();
    return true;
  }

  /**
   * Inspect incoming prompt
   */
  inspectInbound(
    agentId: string,
    prompt: string,
    context: Record<string, any> = {}
  ): {
    allowed: boolean;
    blockedReason?: string;
    events: SecurityEvent[];
  } {
    const events: SecurityEvent[] = [];
    let allowed = true;
    let blockedReason: string | undefined;

    // 1. Prompt injection detection
    if (this.config.enablePromptInjectionDetection) {
      const detection = this.promptInjectionDetector.detect(prompt);
      if (detection.isSuspicious) {
        const event = this.logEvent({
          type: SecurityEventType.PROMPT_INJECTION,
          agentId,
          severity: detection.severity,
          description: `Prompt injection detected: ${detection.matchedPatterns.join(', ')}`,
          context: { ...context, matchedPatterns: detection.matchedPatterns },
          blocked: detection.severity >= SecuritySeverity.HIGH,
        });
        events.push(event);

        if (event.blocked) {
          allowed = false;
          blockedReason = 'Prompt injection detected';
        }
      }
    }

    // 2. Anomaly detection
    if (this.config.enableAnomalyDetection) {
      const anomaly = this.analyzeBehavior(agentId);
      if (anomaly.score > 70) {
        const event = this.logEvent({
          type: SecurityEventType.ANOMALOUS_BEHAVIOR,
          agentId,
          severity: anomaly.score > 90 ? SecuritySeverity.CRITICAL : SecuritySeverity.HIGH,
          description: `Anomalous behavior detected with score: ${anomaly.score}`,
          context: { ...context, anomaly },
          blocked: anomaly.score > 90,
        });
        events.push(event);

        if (event.blocked) {
          allowed = false;
          blockedReason = 'Anomalous behavior detected';
        }
      }
    }

    // 3. Policy enforcement
    for (const policy of this.policies.filter(p => p.enabled)) {
      const violation = this.checkPolicy(policy, agentId, prompt, context);
      if (violation) {
        const event = this.logEvent({
          type: SecurityEventType.POLICY_VIOLATION,
          agentId,
          severity: policy.severity,
          description: `Policy violation: ${policy.name}`,
          context: { ...context, policyId: policy.id },
          blocked: policy.actions.some(a => a.type === 'block'),
        });
        events.push(event);

        if (event.blocked) {
          allowed = false;
          blockedReason = `Policy violation: ${policy.name}`;
        }
      }
    }

    return { allowed, blockedReason, events };
  }

  /**
   * Inspect outgoing response
   */
  inspectOutbound(
    agentId: string,
    response: string,
    context: Record<string, any> = {}
  ): {
    allowed: boolean;
    blockedReason?: string;
    sanitizedResponse?: string;
    events: SecurityEvent[];
  } {
    const events: SecurityEvent[] = [];
    let allowed = true;
    let blockedReason: string | undefined;
    let sanitizedResponse = response;

    // Data exfiltration prevention
    if (this.config.enableDataExfiltrationPrevention) {
      const sensitivePatterns = [
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi, // Emails
        /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/gi, // Phone numbers
        /\b(?:\d{4}[-. ]?){4}\b/gi, // Credit card-like
        /\b(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?\b/gi, // Base64
      ];

      let hasSensitive = false;
      for (const pattern of sensitivePatterns) {
        if (pattern.test(response)) {
          hasSensitive = true;
          sanitizedResponse = sanitizedResponse.replace(pattern, '[REDACTED]');
        }
      }

      if (hasSensitive) {
        const event = this.logEvent({
          type: SecurityEventType.DATA_EXFILTRATION,
          agentId,
          severity: SecuritySeverity.HIGH,
          description: 'Potential data exfiltration detected and sanitized',
          context,
          blocked: false,
        });
        events.push(event);
      }
    }

    return { allowed, blockedReason, sanitizedResponse, events };
  }

  /**
   * Get audit logs
   */
  getAuditLogs(options?: {
    agentId?: string;
    type?: string;
    severity?: string;
    limit?: number;
  }): SecurityEvent[] {
    return this.auditLogger.getLogs(options);
  }

  /**
   * Get anomaly scores
   */
  getAnomalyScores(): Map<string, AnomalyScore> {
    return new Map(this.anomalyScores);
  }

  // Private methods

  private getDefaultPolicies(): SecurityPolicy[] {
    return [
      {
        id: 'rate-limit',
        name: 'Rate Limiting',
        enabled: true,
        severity: SecuritySeverity.MEDIUM,
        conditions: [
          { type: 'rate_limit', config: { maxRequests: 100, windowMs: 60000 } },
        ],
        actions: [{ type: 'rate_limit', config: { durationMs: 60000 } }],
      },
      {
        id: 'content-filter',
        name: 'Content Filter',
        enabled: true,
        severity: SecuritySeverity.HIGH,
        conditions: [
          { type: 'pattern_match', config: { patterns: ['malicious', 'exploit'] } },
        ],
        actions: [{ type: 'block', config: {} }],
      },
    ];
  }

  private logEvent(partial: Omit<SecurityEvent, 'id' | 'timestamp'>): SecurityEvent {
    const event: SecurityEvent = {
      ...partial,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    this.auditLogger.log(event);
    return event;
  }

  private analyzeBehavior(agentId: string): AnomalyScore {
    const now = Date.now();
    const currentCount = (this.requestCounts.get(agentId) || 0) + 1;
    this.requestCounts.set(agentId, currentCount);

    // Reset counter every minute
    setTimeout(() => {
      this.requestCounts.set(agentId, 0);
    }, 60000);

    const factors = [
      { factor: 'request_rate', weight: 40, value: Math.min(currentCount / 100, 1) * 100 },
    ];

    const score = factors.reduce((sum, f) => sum + f.value * (f.weight / 100), 0);

    const anomalyScore: AnomalyScore = {
      agentId,
      score,
      factors,
      timestamp: now,
    };

    this.anomalyScores.set(agentId, anomalyScore);
    return anomalyScore;
  }

  private checkPolicy(
    policy: SecurityPolicy,
    agentId: string,
    prompt: string,
    context: Record<string, any>
  ): boolean {
    for (const condition of policy.conditions) {
      if (condition.type === 'pattern_match') {
        const patterns = condition.config.patterns || [];
        for (const pattern of patterns) {
          if (prompt.toLowerCase().includes(pattern.toLowerCase())) {
            return true;
          }
        }
      } else if (condition.type === 'rate_limit') {
        const count = this.requestCounts.get(agentId) || 0;
        const maxRequests = condition.config.maxRequests || 100;
        if (count > maxRequests) {
          return true;
        }
      }
    }
    return false;
  }
}

// Singleton instance
let clawpatrolInstance: ClawpatrolFirewall | null = null;

export function getClawpatrol(): ClawpatrolFirewall {
  if (!clawpatrolInstance) {
    clawpatrolInstance = new ClawpatrolFirewall();
  }
  return clawpatrolInstance;
}
