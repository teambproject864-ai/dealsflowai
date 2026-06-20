import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Encrypt data using AES-256-GCM
 */
export function encrypt(
  plaintext: string,
  key: Buffer
): {
  iv: string;
  ciphertext: string;
  authTag: string;
} {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let ciphertext = cipher.update(plaintext, "utf8", "base64");
  ciphertext += cipher.final("base64");
  const authTag = cipher.getAuthTag().toString("base64");
  return {
    iv: iv.toString("base64"),
    ciphertext,
    authTag,
  };
}

/**
 * Decrypt data using AES-256-GCM
 */
export function decrypt(
  encrypted: { iv: string; ciphertext: string; authTag: string },
  key: Buffer
): string {
  const iv = Buffer.from(encrypted.iv, "base64");
  const authTag = Buffer.from(encrypted.authTag, "base64");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let plaintext = decipher.update(encrypted.ciphertext, "base64", "utf8");
  plaintext += decipher.final("utf8");
  return plaintext;
}

/**
 * Generate a 32-byte (256-bit) encryption key from a secret
 */
export function generateKeyFromSecret(secret: string): Buffer {
  return crypto.createHash("sha256").update(secret).digest();
}
