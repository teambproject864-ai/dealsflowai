
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.LLM_API_KEY_ENCRYPTION_KEY;
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

export function encrypt(data: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error("LLM_API_KEY_ENCRYPTION_KEY is required in environment variables");
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error("LLM_API_KEY_ENCRYPTION_KEY is required in environment variables");
  }
  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format");
  }
  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function anonymizeData(data: string): string {
  // Remove PII like emails, phone numbers
  let anonymized = data
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]")
    .replace(/(\+?\d{1,3}[-.\s]?)?(\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/g, "[REDACTED_PHONE]");
  return anonymized;
}

