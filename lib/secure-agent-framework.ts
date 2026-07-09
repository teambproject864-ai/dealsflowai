import { z } from 'zod';
import { INFRA_CONFIG } from './infrastructure-config';
import crypto from 'crypto';

// --- Interfaces ---
export interface AgentPolicy {
  id: string;
  userId: string;
  allowedModels: string[];
  rateLimit: number; // requests per minute
  expiresAt: string;
  createdAt: string;
}

export interface AgentAction {
  id: string;
  type: 'text_generation' | 'image_generation' | 'tool_call';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  agentId?: string;
  action: string;
  status: 'success' | 'failure' | 'warning';
  timestamp: string;
  metadata?: Record<string, any>;
  integrityHash: string;
}

// --- Validation Schemas ---
const AgentPolicySchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  allowedModels: z.array(z.string().min(1)),
  rateLimit: z.number().int().positive(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});

// --- Logging Utility ---
function log(message: string, level: 'info' | 'warn' | 'error' | 'debug' = 'info') {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] [SecureAgentFramework] [${level.toUpperCase()}] ${message}`);
}

// --- Cryptography Helpers ---
function generateIntegrityHash(data: string | object): string {
  const stringData = typeof data === 'object' ? JSON.stringify(data) : data;
  return crypto.createHash('sha256').update(stringData).digest('hex');
}

/**
 * Orchestrator for Secure Personal AI Agents
 * Handles identity integration, policy enforcement, and sandbox execution.
 */
export class SecureAgentOrchestrator {
  private policyStore: Map<string, AgentPolicy> = new Map();
  private auditLog: AuditLogEntry[] = [];
  private rateLimitStore: Map<string, { count: number; windowStart: number }> = new Map();
  private initialized: boolean = false;

  /**
   * Initializes the secure agent stack with FIPS-compliant encryption.
   */
  async initializeStack(): Promise<void> {
    if (this.initialized) {
      log('Stack already initialized', 'warn');
      return;
    }

    log('Initializing secure agent stack...');
    log(`Encryption algorithm: ${INFRA_CONFIG.security.encryption}`);
    log(`mTLS enabled: ${INFRA_CONFIG.security.mTLS}`);
    log(`Auth protocol: ${INFRA_CONFIG.security.authProtocol}`);

    // In a real implementation, you would:
    // 1. Set up mTLS certificates
    // 2. Initialize encryption keys
    // 3. Connect to audit log storage
    // 4. Set up policy database connection

    this.initialized = true;
    log('Secure agent stack initialized successfully');
  }

  /**
   * Creates a new agent policy for a user
   */
  createPolicy(params: {
    userId: string;
    allowedModels: string[];
    rateLimit: number;
    expiresInDays: number;
  }): AgentPolicy {
    const policyId = `policy-${crypto.randomUUID()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + params.expiresInDays * 24 * 60 * 60 * 1000);

    const policy: AgentPolicy = {
      id: policyId,
      userId: params.userId,
      allowedModels: params.allowedModels,
      rateLimit: params.rateLimit,
      expiresAt: expiresAt.toISOString(),
      createdAt: now.toISOString(),
    };

    const validated = AgentPolicySchema.parse(policy);
    this.policyStore.set(policyId, validated);
    log(`Created policy ${policyId} for user ${params.userId}`);

    this.logAuditEvent({
      userId: params.userId,
      action: 'policy_created',
      status: 'success',
      metadata: { policyId },
    });

    return validated;
  }

  /**
   * Retrieves a policy by ID
   */
  getPolicy(policyId: string): AgentPolicy | undefined {
    return this.policyStore.get(policyId);
  }

  /**
   * Validates an agent action against policy
   */
  validateAction(policyId: string, action: AgentAction): { valid: boolean; reason?: string } {
    const policy = this.policyStore.get(policyId);
    if (!policy) {
      return { valid: false, reason: 'Policy not found' };
    }

    // Check if policy expired
    if (new Date(policy.expiresAt) < new Date()) {
      return { valid: false, reason: 'Policy expired' };
    }

    // Check rate limit
    const rateLimitKey = `${policyId}-${action.type}`;
    const now = Date.now();
    const windowSize = 60 * 1000; // 1 minute
    let rateData = this.rateLimitStore.get(rateLimitKey);

    if (!rateData || now - rateData.windowStart > windowSize) {
      rateData = { count: 0, windowStart: now };
    }

    rateData.count++;
    this.rateLimitStore.set(rateLimitKey, rateData);

    if (rateData.count > policy.rateLimit) {
      return { valid: false, reason: 'Rate limit exceeded' };
    }

    log(`Action validated for policy ${policyId}`);
    return { valid: true };
  }

  /**
   * Issues a short-lived, scoped access token for model interaction.
   */
  async issueScopedToken(userId: string, modelId: string): Promise<string> {
    // Find policy for user
    const userPolicies = Array.from(this.policyStore.values()).filter(p => p.userId === userId);
    const validPolicy = userPolicies.find(p => 
      p.allowedModels.includes(modelId) && new Date(p.expiresAt) > new Date()
    );

    if (!validPolicy) {
      throw new Error('Unauthorized model access - no valid policy found');
    }

    log(`Issuing scoped token for user ${userId} to access model ${modelId}`);

    this.logAuditEvent({
      userId,
      action: 'token_issued',
      status: 'success',
      metadata: { modelId },
    });

    // In a real implementation, you would sign this token with a private key
    const tokenPayload = {
      userId,
      modelId,
      policyId: validPolicy.id,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour
    };

    return Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
  }

  /**
   * Logs an audited action to the immutable storage.
   */
  async logAuditEvent(event: Omit<AuditLogEntry, 'id' | 'timestamp' | 'integrityHash'>): Promise<void> {
    const auditEntry: AuditLogEntry = {
      id: `audit-${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      integrityHash: '',
      ...event,
    };

    auditEntry.integrityHash = generateIntegrityHash(auditEntry);
    this.auditLog.push(auditEntry);

    log(`Audit event logged: ${auditEntry.id} - ${auditEntry.action}`);

    // In production, you would write this to an immutable database or ledger
  }

  /**
   * Retrieves audit log entries for a user
   */
  getAuditLog(userId: string): AuditLogEntry[] {
    return this.auditLog.filter(entry => entry.userId === userId);
  }

  /**
   * Verifies the integrity of the audit log
   */
  verifyAuditLogIntegrity(): boolean {
    for (let i = 0; i < this.auditLog.length; i++) {
      const entry = this.auditLog[i];
      const { integrityHash, ...entryData } = entry;
      const computedHash = generateIntegrityHash(entryData);

      if (computedHash !== integrityHash) {
        log(`Audit log integrity check failed at entry ${entry.id}`, 'error');
        return false;
      }
    }
    log('Audit log integrity verified');
    return true;
  }
}

export default SecureAgentOrchestrator;
