import assert from "assert";
import { POST as gtmIntakePost } from "../app/api/gtm-intake/route";
import { db } from "../lib/firebase-admin";

let mockStore: Record<string, Record<string, any>> = {};

function resetMockStore() {
  mockStore = {
    gtm_intakes: {},
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

async function testGtmIntakeSuccess() {
  resetMockStore();
  setupMockFirestore();

  try {
    const payload = {
      companyName: "Acme Corp",
      websiteUrl: "https://acme.com",
      productName: "Neural Outreach Bot",
      productOwnerName: "Sarah Jenkins",
      productOwnerEmail: "sarah@acme.com",
      targetLaunchDate: "2026-09-01",
      targetMarketRegion: "Europe",
      primaryUseCase: "Automate outbound prospecting emails",
      marketingBudgetAllocation: 75000,
      stakeholders: ["John (Product)", "Helen (Legal)"],
      complianceDocuments: ["SOC2-Report.pdf", "Privacy-Policy.pdf"],
    };

    const req = new Request("http://localhost:3000/api/gtm-intake", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const res = await gtmIntakePost(req);
    assert.strictEqual(res.status, 200, "Response status should be 200");

    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.trackingId);
    assert.ok(data.trackingId.startsWith("GTM-"));

    // Verify stored content in the mock database
    const intakes = mockStore.gtm_intakes;
    assert.strictEqual(Object.keys(intakes).length, 1);
    const saved = Object.values(intakes)[0];
    assert.strictEqual(saved.productName, "Neural Outreach Bot");
    assert.strictEqual(saved.productOwnerEmail, "sarah@acme.com");
    assert.strictEqual(saved.marketingBudgetAllocation, 75000);
    assert.deepEqual(saved.stakeholders, ["John (Product)", "Helen (Legal)"]);

    console.log("✅ Passed: testGtmIntakeSuccess");
  } finally {
    restoreFirestore();
  }
}

async function testGtmIntakeValidationFailure() {
  resetMockStore();
  setupMockFirestore();

  try {
    // Missing required productName and invalid email format
    const payload = {
      companyName: "Acme Corp",
      websiteUrl: "https://acme.com",
      productName: "",
      productOwnerName: "Sarah Jenkins",
      productOwnerEmail: "sarah-invalid-email",
      targetLaunchDate: "2026-09-01",
      targetMarketRegion: "Europe",
      primaryUseCase: "Automate outbound prospecting emails",
      marketingBudgetAllocation: -500, // Invalid: negative number
      stakeholders: [],
      complianceDocuments: [],
    };

    const req = new Request("http://localhost:3000/api/gtm-intake", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const res = await gtmIntakePost(req);
    assert.strictEqual(res.status, 400, "Response status should be 400");

    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error.includes("Validation failed"));

    console.log("✅ Passed: testGtmIntakeValidationFailure");
  } finally {
    restoreFirestore();
  }
}

export async function runGtmIntakeTests() {
  await testGtmIntakeSuccess();
  await testGtmIntakeValidationFailure();
}
