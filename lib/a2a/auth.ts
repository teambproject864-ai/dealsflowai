import { createHmac, randomBytes } from "crypto";
import { A2AAuth } from "./types";
import { logger } from "../logger";

// Get shared secret from environment variables
function getA2ASharedSecret(): string {
  const secret = process.env.A2A_SHARED_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("A2A_SHARED_SECRET is required in production!");
    }
    return "development-shared-secret-2025";
  }
  return secret;
}

// Time window for validating timestamps (5 minutes)
const TIMESTAMP_WINDOW_MS = 5 * 60 * 1000;

// Nonce storage to prevent replay attacks
const usedNonces = new Set<string>();

export function generateA2ANonce(): string {
  return randomBytes(16).toString("hex");
}

export function signA2AMessage(agentId: string, payload: Record<string, any>, timestamp: number, nonce: string): string {
  const secret = getA2ASharedSecret();
  const dataToSign = `${agentId}:${JSON.stringify(payload)}:${timestamp}:${nonce}`;
  return createHmac("sha256", secret).update(dataToSign).digest("hex");
}

export function validateA2AAuth(auth: A2AAuth | undefined, payload: Record<string, any>): { valid: boolean; error?: string } {
  if (!auth) {
    return { valid: false, error: "Missing authentication" };
  }

  // Validate timestamp is recent
  const now = Date.now();
  if (Math.abs(now - auth.timestamp) > TIMESTAMP_WINDOW_MS) {
    return { valid: false, error: "Timestamp out of window" };
  }

  // Validate nonce is not reused
  if (usedNonces.has(auth.nonce)) {
    return { valid: false, error: "Nonce already used" };
  }
  usedNonces.add(auth.nonce);

  // Clean up old nonces periodically (keep last 1000)
  if (usedNonces.size > 1000) {
    const firstKeys = Array.from(usedNonces).slice(0, 100);
    firstKeys.forEach((key) => usedNonces.delete(key));
  }

  // Validate signature
  const expectedSignature = signA2AMessage(auth.agentId, payload, auth.timestamp, auth.nonce);
  if (auth.signature !== expectedSignature) {
    logger.warn(`[A2A Auth] Invalid signature from ${auth.agentId}`);
    return { valid: false, error: "Invalid signature" };
  }

  return { valid: true };
}
