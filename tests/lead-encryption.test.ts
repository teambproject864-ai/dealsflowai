// tests/lead-encryption.test.ts
import assert from "assert";
import { encryptLead, decryptLead } from "../lib/security";

async function testLeadEncryptionRoundTrip() {
  const originalLead = {
    id: "lead_123",
    companyName: "Acme Corp",
    contactName: "John Doe",
    contactEmail: "john@acme.com",
    contactPhone: "+15550199999",
    createdAt: new Date().toISOString(),
  };

  const encrypted = encryptLead(originalLead);

  // Assert email and phone are encrypted and do not match original text
  assert.notEqual(encrypted.contactEmail, originalLead.contactEmail);
  assert.notEqual(encrypted.contactPhone, originalLead.contactPhone);
  
  // Assert they contain ":" (the AES-GCM output delimiter)
  assert.ok(encrypted.contactEmail.includes(":"));
  assert.ok(encrypted.contactPhone.includes(":"));

  // Assert non-PII fields are untouched
  assert.strictEqual(encrypted.id, originalLead.id);
  assert.strictEqual(encrypted.companyName, originalLead.companyName);
  assert.strictEqual(encrypted.contactName, originalLead.contactName);
  assert.strictEqual(encrypted.createdAt, originalLead.createdAt);

  const decrypted = decryptLead(encrypted);

  // Assert decryption restores original PII values
  assert.strictEqual(decrypted.contactEmail, originalLead.contactEmail);
  assert.strictEqual(decrypted.contactPhone, originalLead.contactPhone);
  assert.strictEqual(decrypted.id, originalLead.id);

  console.log("✅ Passed: testLeadEncryptionRoundTrip");
}

testLeadEncryptionRoundTrip().catch((err) => {
  console.error(err);
  process.exit(1);
});
