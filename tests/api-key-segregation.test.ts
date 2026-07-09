import {
  getDecryptedKey,
  encryptRawKey,
  AccessDeniedError,
  RateLimitExceededError,
  API_KEY_PERMISSIONS,
  AuditLogEntry
} from '../lib/secure-api-keys';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

// Set up Master Decryption Key in env for testing
process.env.API_KEY_MASTER_DECRYPTION_KEY = 'test-suite-master-key-dealflow-ai-2026';

const AUDIT_LOG_DIR = path.join('C:', 'Users', 'Praneeth Burada', '.gemini', 'antigravity-ide', 'brain', '31b214e4-784b-4e2c-add4-28b6a7b6f289', 'scratch');
const AUDIT_LOG_FILE = path.join(AUDIT_LOG_DIR, 'api_keys_audit.json');

async function runTests() {
  console.log('=========================================');
  console.log(' SECURE API KEY SEGREGATION TEST SUITE   ');
  console.log('=========================================');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ Passed: ${testName}`);
      passed++;
    } else {
      console.error(`❌ Failed: ${testName}`);
      failed++;
    }
  }

  // Helper to clear existing audit logs
  if (fs.existsSync(AUDIT_LOG_FILE)) {
    fs.unlinkSync(AUDIT_LOG_FILE);
  }

  // --- Test 1: Successful Access Under Valid Context ---
  try {
    const rawKeyVal = 'super-secret-hf-key-12345';
    // Encrypt the key and store in env
    const encrypted = encryptRawKey(rawKeyVal);
    process.env.ENC_HF_KEY_AUTO_PERS = encrypted;

    const retrieved = getDecryptedKey(
      'automated_personalization_hf',
      'ai_automated_content',
      'automated_personalization'
    );

    assert(retrieved === rawKeyVal, 'Test 1: Valid permission access & decryption');
  } catch (error: any) {
    console.error('Test 1 failed with error:', error);
    assert(false, 'Test 1: Valid permission access & decryption');
  }

  // --- Test 2: Access Denied for Invalid Pillar Context ---
  try {
    getDecryptedKey(
      'automated_personalization_hf',
      'written_content', // unauthorized pillar
      'automated_personalization'
    );
    assert(false, 'Test 2: Access Denied for invalid pillar (Should throw AccessDeniedError)');
  } catch (error: any) {
    assert(error instanceof AccessDeniedError, 'Test 2: Access Denied for invalid pillar');
  }

  // --- Test 3: Access Denied for Mismatching Sub-Option Context ---
  try {
    getDecryptedKey(
      'automated_personalization_hf',
      'ai_automated_content',
      'faq_auto_bots' // mismatching sub-option
    );
    assert(false, 'Test 3: Access Denied for mismatching sub-option (Should throw AccessDeniedError)');
  } catch (error: any) {
    assert(error instanceof AccessDeniedError, 'Test 3: Access Denied for mismatching sub-option');
  }

  // --- Test 4: Rate Limiting Enforcement ---
  try {
    // We already made 3 calls. Let's make 3 more (total 6).
    // The 5th request is allowed, the 6th should exceed the limit of 5 requests per window.
    for (let i = 0; i < 4; i++) {
      try {
        getDecryptedKey(
          'automated_personalization_hf',
          'ai_automated_content',
          'automated_personalization'
        );
      } catch (err) {
        if (err instanceof RateLimitExceededError) {
          // Success: caught rate limit
          break;
        }
        throw err;
      }
    }
    // Try one more that definitely must throw
    getDecryptedKey(
      'automated_personalization_hf',
      'ai_automated_content',
      'automated_personalization'
    );
    assert(false, 'Test 4: Rate limiting enforcement (Should throw RateLimitExceededError)');
  } catch (error: any) {
    assert(error instanceof RateLimitExceededError, 'Test 4: Rate limiting enforcement');
  }

  // --- Test 5: Audit Log Integrity Verification ---
  try {
    assert(fs.existsSync(AUDIT_LOG_FILE), 'Test 5: Audit log file exists');
    const content = fs.readFileSync(AUDIT_LOG_FILE, 'utf8');
    const logs = JSON.parse(content) as AuditLogEntry[];
    
    assert(logs.length >= 5, 'Test 5: Logs recorded multiple events');

    let chainValid = true;
    for (let i = 0; i < logs.length; i++) {
      const entry = logs[i];
      
      // Verify previousHash linking
      if (i > 0) {
        if (entry.previousHash !== logs[i - 1].hash) {
          console.error(`Hash chain link broken at index ${i}`);
          chainValid = false;
        }
      } else {
        if (entry.previousHash !== 'GENESIS_HASH') {
          console.error(`First entry previousHash is not GENESIS_HASH`);
          chainValid = false;
        }
      }

      // Recompute and verify hash
      const payload = {
        id: entry.id,
        timestamp: entry.timestamp,
        keyId: entry.keyId,
        provider: entry.provider,
        callerPillarId: entry.callerPillarId,
        callerSubOptionId: entry.callerSubOptionId,
        status: entry.status,
        estimatedTokens: entry.estimatedTokens || 0,
        previousHash: entry.previousHash
      };
      const computedHash = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
      if (computedHash !== entry.hash) {
        console.error(`Hash mismatch at index ${i}: computed '${computedHash}', logged '${entry.hash}'`);
        chainValid = false;
      }
    }

    assert(chainValid, 'Test 5: Audit log cryptographic hash chain validation');
  } catch (error: any) {
    console.error('Test 5 failed with error:', error);
    assert(false, 'Test 5: Audit log cryptographic hash chain validation');
  }

  console.log('=========================================');
  console.log(` Tests Completed. Passed: ${passed}, Failed: ${failed}`);
  console.log('=========================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
