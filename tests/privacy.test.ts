// tests/privacy.test.ts
import assert from "assert";
import { POST as privacyRequestPost } from "../app/api/privacy/request/route";
import { db } from "../lib/firebase-admin";

let mockStore: Record<string, Record<string, any>> = {};

function resetMockStore() {
  mockStore = {
    leads: {},
    user_consent: {},
    privacy_requests: {},
    audit_log: {},
  };
}

function setupMockFirestore() {
  const mockDb = {
    collection: (collectionName: string) => {
      return {
        doc: (docId: string) => {
          return {
            get: async () => ({
              exists: !!mockStore[collectionName]?.[docId],
              data: () => mockStore[collectionName]?.[docId],
            }),
            set: async (data: any, options?: any) => {
              if (!mockStore[collectionName]) mockStore[collectionName] = {};
              if (options?.merge) {
                mockStore[collectionName][docId] = { ...mockStore[collectionName][docId], ...data };
              } else {
                mockStore[collectionName][docId] = data;
              }
            },
            update: async (data: any) => {
              if (!mockStore[collectionName]) mockStore[collectionName] = {};
              mockStore[collectionName][docId] = { ...mockStore[collectionName][docId], ...data };
            },
          };
        },
        add: async (data: any) => {
          const id = "mock_id_" + Math.random().toString(36).substring(7);
          if (!mockStore[collectionName]) mockStore[collectionName] = {};
          mockStore[collectionName][id] = data;
          return { id };
        },
        get: async () => {
          const docs = Object.entries(mockStore[collectionName] || {}).map(([id, data]) => ({
            id,
            data: () => data,
          }));
          return {
            docs,
            size: docs.length,
          };
        },
      } as any;
    }
  };
  (globalThis as any).firestoreMock = mockDb;
}

function restoreFirestore() {
  (globalThis as any).firestoreMock = undefined;
}

async function testPrivacyRequestCCPAOptOut() {
  resetMockStore();
  setupMockFirestore();

  try {
    const payload = {
      name: "Alice Smith",
      email: "alice@example.com",
      requestType: "ccpa-opt-out",
      message: "Opt me out of everything please",
    };

    const req = new Request("http://localhost:3000/api/privacy/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const res = await privacyRequestPost(req);
    assert.strictEqual(res.status, 200, "Response status should be 200");

    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.requestId);

    // Verify privacy request was saved
    const requests = mockStore.privacy_requests;
    assert.strictEqual(Object.keys(requests).length, 1);
    const savedReq = Object.values(requests)[0];
    assert.strictEqual(savedReq.name, "Alice Smith");
    assert.strictEqual(savedReq.email, "alice@example.com");
    assert.strictEqual(savedReq.requestType, "ccpa-opt-out");
    assert.strictEqual(savedReq.status, "pending");

    // Verify user_consent was written
    const consents = mockStore.user_consent;
    assert.strictEqual(Object.keys(consents).length, 1);
    const savedConsent = Object.values(consents)[0];
    assert.strictEqual(savedConsent.email, "alice@example.com");
    assert.strictEqual(savedConsent.doNotSell, true);
    assert.deepEqual(savedConsent.purposes, ["opt-out"]);

    // Verify audit logs were written
    const logs = Object.values(mockStore.audit_log);
    assert.strictEqual(logs.length, 2); // 1 for ccpa opt-out immediate, 1 for privacy request submit
    const ccpaLog = logs.find((l: any) => l.action === "CCPA_OPT_OUT_REQUESTED");
    assert.ok(ccpaLog);
    assert.strictEqual(ccpaLog.email, "alice@example.com");

    console.log("✅ Passed: testPrivacyRequestCCPAOptOut");
  } finally {
    restoreFirestore();
  }
}

export async function runPrivacyTests() {
  await testPrivacyRequestCCPAOptOut();
}
