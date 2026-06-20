import { v4 as uuidv4 } from "uuid";
import { encrypt, decrypt, generateKeyFromSecret } from "./encryption";
import { Credential, CredentialSchema, AuditLogEntry } from "./types";

export class CredentialManager {
  private encryptionKey: Buffer;
  private credentials: Map<string, Credential>;
  private auditLogs: AuditLogEntry[];

  constructor(encryptionSecret?: string) {
    const secret =
      encryptionSecret ||
      process.env.LLM_API_KEY_ENCRYPTION_KEY ||
      "default-dev-secret-change-in-production";
    this.encryptionKey = generateKeyFromSecret(secret);
    this.credentials = new Map();
    this.auditLogs = [];
  }

  /**
   * Create a new credential
   */
  async createCredential(options: {
    name: string;
    type: "api_key" | "username_password" | "oauth_token";
    data: Record<string, any>;
    accessRoles: string[];
    createdBy?: string;
    ip?: string;
    userAgent?: string;
  }): Promise<Credential> {
    const now = new Date().toISOString();
    const encryptedData = encrypt(JSON.stringify(options.data), this.encryptionKey);

    const credential: Credential = {
      id: uuidv4(),
      name: options.name,
      type: options.type,
      encryptedData,
      metadata: {
        createdAt: now,
        updatedAt: now,
        createdBy: options.createdBy,
        tags: [],
      },
      accessRoles: options.accessRoles,
    };

    // Validate with Zod
    const validation = CredentialSchema.safeParse(credential);
    if (!validation.success) {
      throw new Error(
        `Invalid credential: ${validation.error.issues.map((i) => i.message).join(", ")}`
      );
    }

    this.credentials.set(credential.id, credential);

    // Add audit log
    this.addAuditLog({
      credentialId: credential.id,
      action: "create",
      actor: options.createdBy || "system",
      success: true,
      ip: options.ip,
      userAgent: options.userAgent,
    });

    return credential;
  }

  /**
   * Get a credential by ID (with RBAC check)
   */
  async getCredential(
    id: string,
    userRoles: string[],
    options?: { actor?: string; ip?: string; userAgent?: string }
  ): Promise<{
    credential: Credential;
    decryptedData: Record<string, any>;
  }> {
    const credential = this.credentials.get(id);
    if (!credential) {
      this.addAuditLog({
        credentialId: id,
        action: "read",
        actor: options?.actor || "unknown",
        success: false,
        ip: options?.ip,
        userAgent: options?.userAgent,
        details: "Credential not found",
      });
      throw new Error("Credential not found");
    }

    // Check RBAC
    const hasAccess = credential.accessRoles.some((role) => userRoles.includes(role));
    if (!hasAccess) {
      this.addAuditLog({
        credentialId: id,
        action: "read",
        actor: options?.actor || "unknown",
        success: false,
        ip: options?.ip,
        userAgent: options?.userAgent,
        details: "Unauthorized access attempt",
      });
      throw new Error("Unauthorized: insufficient permissions");
    }

    // Decrypt data
    const decryptedData = JSON.parse(
      decrypt(credential.encryptedData, this.encryptionKey)
    );

    // Update last used
    credential.metadata.lastUsedAt = new Date().toISOString();
    this.credentials.set(id, credential);

    // Add audit log
    this.addAuditLog({
      credentialId: id,
      action: "read",
      actor: options?.actor || "unknown",
      success: true,
      ip: options?.ip,
      userAgent: options?.userAgent,
    });

    return {
      credential,
      decryptedData,
    };
  }

  /**
   * Rotate a credential
   */
  async rotateCredential(
    id: string,
    newData: Record<string, any>,
    userRoles: string[],
    options?: { actor?: string; ip?: string; userAgent?: string }
  ): Promise<Credential> {
    const existing = this.credentials.get(id);
    if (!existing) {
      throw new Error("Credential not found");
    }

    // Check RBAC
    const hasAccess = existing.accessRoles.some((role) => userRoles.includes(role));
    if (!hasAccess) {
      this.addAuditLog({
        credentialId: id,
        action: "rotate",
        actor: options?.actor || "unknown",
        success: false,
        ip: options?.ip,
        userAgent: options?.userAgent,
        details: "Unauthorized",
      });
      throw new Error("Unauthorized");
    }

    const now = new Date().toISOString();
    const encryptedData = encrypt(JSON.stringify(newData), this.encryptionKey);

    const updated: Credential = {
      ...existing,
      encryptedData,
      metadata: {
        ...existing.metadata,
        updatedAt: now,
      },
    };

    this.credentials.set(id, updated);

    this.addAuditLog({
      credentialId: id,
      action: "rotate",
      actor: options?.actor || "unknown",
      success: true,
      ip: options?.ip,
      userAgent: options?.userAgent,
    });

    return updated;
  }

  /**
   * Delete a credential
   */
  async deleteCredential(
    id: string,
    userRoles: string[],
    options?: { actor?: string; ip?: string; userAgent?: string }
  ): Promise<void> {
    const existing = this.credentials.get(id);
    if (!existing) {
      throw new Error("Credential not found");
    }

    const hasAccess = existing.accessRoles.some((role) => userRoles.includes(role));
    if (!hasAccess) {
      this.addAuditLog({
        credentialId: id,
        action: "delete",
        actor: options?.actor || "unknown",
        success: false,
        ip: options?.ip,
        userAgent: options?.userAgent,
        details: "Unauthorized",
      });
      throw new Error("Unauthorized");
    }

    this.credentials.delete(id);

    this.addAuditLog({
      credentialId: id,
      action: "delete",
      actor: options?.actor || "unknown",
      success: true,
      ip: options?.ip,
      userAgent: options?.userAgent,
    });
  }

  /**
   * Get audit logs
   */
  getAuditLogs(filters?: {
    credentialId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): AuditLogEntry[] {
    let logs = [...this.auditLogs];
    if (filters?.credentialId) {
      logs = logs.filter((l) => l.credentialId === filters.credentialId);
    }
    if (filters?.action) {
      logs = logs.filter((l) => l.action === filters.action);
    }
    if (filters?.startDate) {
      logs = logs.filter((l) => l.timestamp >= filters.startDate!);
    }
    if (filters?.endDate) {
      logs = logs.filter((l) => l.timestamp <= filters.endDate!);
    }
    return logs;
  }

  /**
   * Add an audit log entry
   */
  private addAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): void {
    this.auditLogs.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...entry,
    });
  }
}

// Singleton instance
let credentialManagerInstance: CredentialManager | null = null;

export function getCredentialManager(): CredentialManager {
  if (!credentialManagerInstance) {
    credentialManagerInstance = new CredentialManager();
  }
  return credentialManagerInstance;
}
