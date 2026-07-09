// tests/audit-logger.test.ts
import assert from "assert";
import { logAuditEvent } from "../lib/audit-logger";

let mockStore: Record<string, Record<string, any>> = {};

function resetMockStore() {
  mockStore = {
    audit_logs: {},
    audit_log: {},
  };
}

function setupMockFirestore() {
  const mockDb = {
    collection: (collectionName: string) => {
      return {
        add: async (data: any) => {
          const id = "mock_id_" + Math.random().toString(36).substring(7);
          if (!mockStore[collectionName]) mockStore[collectionName] = {};
          mockStore[collectionName][id] = data;
          return { id };
        },
      } as any;
    }
  };
  (globalThis as any).firestoreMock = mockDb;
}

function restoreFirestore() {
  (globalThis as any).firestoreMock = undefined;
}

async function testAuditLogger() {
  resetMockStore();
  setupMockFirestore();

  try {
    const req = new Request("http://localhost:3000/api/leads/save", {
      headers: {
        "x-forwarded-for": "192.168.1.99",
      },
    });

    const success = await logAuditEvent(req, "user_123", "TEST_ACTION", { foo: "bar" });
    assert.strictEqual(success, true);

    const logs = Object.values(mockStore.audit_logs);
    assert.strictEqual(logs.length, 1, "Should write exactly one log to audit_logs");
    
    const record: any = logs[0];
    assert.strictEqual(record.route, "/api/leads/save");
    assert.strictEqual(record.userId, "user_123");
    assert.strictEqual(record.action, "TEST_ACTION");
    assert.deepEqual(record.details, { foo: "bar" });
    
    // Hash format check
    assert.ok(record.ipHash);
    assert.strictEqual(record.ipHash.length, 64, "ipHash should be SHA-256 (64 hex chars)");
    assert.ok(record.complianceHash);
    assert.strictEqual(record.complianceHash.length, 64, "complianceHash should be SHA-256 (64 hex chars)");

    console.log("✅ Passed: testAuditLogger");
  } finally {
    restoreFirestore();
  }
}

export async function runAuditLoggerTests() {
  await testAuditLogger();
}

// Support direct execution too
if (require.main === module) {
  testAuditLogger().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
