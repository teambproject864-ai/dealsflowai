#!/usr/bin/env tsx
import crypto from 'crypto';
import { z } from 'zod';

// --- Configuration ---
const SALT_LENGTH = 16; // bytes
const HASH_ITERATIONS = 100000;
const HASH_KEY_LENGTH = 64; // bytes
const HASH_ALGORITHM = 'sha512';

// --- Schemas ---
const HashPasswordArgsSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const VerifyPasswordArgsSchema = z.object({
  password: z.string().min(1),
  hash: z.string().min(1),
  salt: z.string().min(1),
});

// --- Helpers ---
function log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] [HashPassword] ${message}`);
}

/**
 * Hashes a password with a random salt
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const hash = crypto.pbkdf2Sync(
    password,
    salt,
    HASH_ITERATIONS,
    HASH_KEY_LENGTH,
    HASH_ALGORITHM
  ).toString('hex');

  log('Password hashed successfully');
  return { hash, salt };
}

/**
 * Verifies a password against a hash and salt
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computedHash = crypto.pbkdf2Sync(
    password,
    salt,
    HASH_ITERATIONS,
    HASH_KEY_LENGTH,
    HASH_ALGORITHM
  ).toString('hex');

  const isValid = computedHash === hash;
  log(isValid ? 'Password verification succeeded' : 'Password verification failed');
  return isValid;
}

// --- CLI ---
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'hash') {
    const password = args[1];
    const validated = HashPasswordArgsSchema.safeParse({ password });
    if (!validated.success) {
      console.error('Error:', validated.error.format().password?._errors[0] || 'Invalid password');
      process.exit(1);
    }

    const result = hashPassword(validated.data.password);
    console.log('\n=== Password Hashed ===');
    console.log(`Hash: ${result.hash}`);
    console.log(`Salt: ${result.salt}`);
    console.log(`Algorithm: ${HASH_ALGORITHM}`);
    console.log(`Iterations: ${HASH_ITERATIONS}`);
    console.log('\nStore both hash and salt securely!');
  } else if (command === 'verify') {
    const password = args[1];
    const hash = args[2];
    const salt = args[3];

    const validated = VerifyPasswordArgsSchema.safeParse({ password, hash, salt });
    if (!validated.success) {
      console.error('Usage: tsx hash-password.ts verify <password> <hash> <salt>');
      process.exit(1);
    }

    const isValid = verifyPassword(
      validated.data.password,
      validated.data.hash,
      validated.data.salt
    );

    console.log(isValid ? '✅ Password is valid' : '❌ Password is invalid');
    process.exit(isValid ? 0 : 1);
  } else {
    console.log(`
Password Hashing Utility

Usage:
  tsx hash-password.ts hash <password>       - Hash a new password
  tsx hash-password.ts verify <password> <hash> <salt> - Verify a password

Examples:
  tsx hash-password.ts hash mySecurePass123
  tsx hash-password.ts verify mySecurePass123 <hash> <salt>
    `);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default { hashPassword, verifyPassword };
