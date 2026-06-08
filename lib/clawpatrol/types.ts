export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SecurityEventType {
  PROMPT_INJECTION = 'prompt_injection',
  DATA_EXFILTRATION = 'data_exfiltration',
  ANOMALOUS_BEHAVIOR = 'anomalous_behavior',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  POLICY_VIOLATION = 'policy_violation',
}

export interface AgentIdentity {
  agentId: string;
  agentType: string;
  permissions: string[];
  lastAuthenticatedAt: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: number;
  agentId: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  description: string;
  context: Record<string, any>;
  blocked: boolean;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  enabled: boolean;
  severity: SecuritySeverity;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
}

export interface PolicyCondition {
  type: 'pattern_match' | 'behavior_threshold' | 'permission_check' | 'rate_limit';
  config: Record<string, any>;
}

export interface PolicyAction {
  type: 'block' | 'log' | 'alert' | 'rate_limit' | 'quarantine';
  config: Record<string, any>;
}

export interface TrafficFilter {
  id: string;
  direction: 'inbound' | 'outbound';
  protocol: string;
  allowed: boolean;
  rules: TrafficRule[];
}

export interface TrafficRule {
  pattern: string;
  allowed: boolean;
}

export interface AnomalyScore {
  agentId: string;
  score: number; // 0-100
  factors: Array<{ factor: string; weight: number; value: number }>;
  timestamp: number;
}

export interface ClawpatrolConfig {
  enablePromptInjectionDetection: boolean;
  enableDataExfiltrationPrevention: boolean;
  enableAnomalyDetection: boolean;
  defaultPolicySeverity: SecuritySeverity;
  alertThresholds: Record<SecuritySeverity, number>;
  siemIntegrationEnabled: boolean;
  auditLogRetentionDays: number;
}
