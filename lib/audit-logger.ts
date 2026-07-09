// lib/audit-logger.ts
import { getDb } from "./firebase-admin";
import { hashIp, generateAuditHash } from "./security";

export interface AuditRecord {
  route: string;
  userId: string;
  action: string;
  ipHash: string;
  timestamp: string;
  complianceHash: string;
  details?: Record<string, any>;
}

/**
 * Write a structured, compliance-hashed audit log to Firestore.
 */
export async function logAuditEvent(
  req: Request,
  userId: string,
  action: string,
  details?: Record<string, any>
): Promise<boolean> {
  try {
    const db = getDb();
    if (!db) {
      console.warn("[AuditLogger] Database not configured, skipping audit log.");
      return false;
    }

    const route = new URL(req.url).pathname;
    const ipRaw = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const ipHash = hashIp(ipRaw);
    const timestamp = new Date().toISOString();

    const payload = {
      route,
      userId,
      action,
      ipHash,
      timestamp,
      details: details ?? {},
    };

    const complianceHash = generateAuditHash(payload);

    const record: AuditRecord = {
      ...payload,
      complianceHash,
    };

    // Save to both collections for backwards compatibility
    await db.collection("audit_logs").add(record);
    await db.collection("audit_log").add(record);
    return true;
  } catch (err) {
    console.error("[AuditLogger] Failed to write audit log:", err);
    return false;
  }
}
