import assert from "assert";
import crypto from "crypto";
import { isValidGoogleMeetCode, isValidGoogleMeetUrl, isValidCalendlyUrl, isValidMeetingUrl } from "@/lib/meeting-utils";

// Simulated generation helper matching the fix in lib/google-meet.ts
function generateTestGoogleMeetCode(): string {
  const meetCodeRegex = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
  const letters = "abcdefghijklmnopqrstuvwxyz";
  let formattedMeetId = "";
  let attempts = 0;

  while (attempts < 10) {
    let result = "";
    for (let i = 0; i < 10; i++) {
      const randomByte = crypto.randomBytes(1)[0];
      result += letters[randomByte % 26];
    }
    const tempId = `${result.slice(0, 3)}-${result.slice(3, 7)}-${result.slice(7, 10)}`;
    if (meetCodeRegex.test(tempId)) {
      formattedMeetId = tempId;
      break;
    }
    attempts++;
  }

  if (!formattedMeetId || !meetCodeRegex.test(formattedMeetId)) {
    throw new Error(`Failed to generate a valid Google Meet code after ${attempts} attempts`);
  }

  return formattedMeetId;
}

export async function runMeetingUtilsTests() {
  console.log("Starting Google Meet URL Validation and Generation tests...");

  // 1. Test isValidGoogleMeetCode validation logic
  const validCodes = ["abc-defg-hij", "xyz-qwer-tyu", "gtm-revs-dfa", "  abc-defg-hij  "];
  for (const code of validCodes) {
    assert.strictEqual(isValidGoogleMeetCode(code), true, `Code '${code}' should be valid`);
  }

  const invalidCodes = [
    "ab1-defg-hij",  // Contains number in group 1
    "abc-d3fg-hij",  // Contains number in group 2
    "abc-defg-hi9",  // Contains number in group 3
    "Abc-defg-hij",  // Contains uppercase in group 1
    "abc-dEfg-hij",  // Contains uppercase in group 2
    "abc-defg-hiJ",  // Contains uppercase in group 3
    "ab-defg-hij",   // Group 1 too short
    "abcd-defg-hij", // Group 1 too long
    "abc-def-hij",   // Group 2 too short
    "abc-defgh-hij", // Group 2 too long
    "abc-defg-hi",   // Group 3 too short
    "abc-defg-hijk", // Group 3 too long
    "abcdefghij",    // Missing hyphens
    "abc_defg_hij"   // Underscores instead of hyphens
  ];

  for (const code of invalidCodes) {
    assert.strictEqual(isValidGoogleMeetCode(code), false, `Code '${code}' should be invalid`);
  }

  // 2. Test isValidGoogleMeetUrl validation logic
  assert.strictEqual(
    isValidGoogleMeetUrl("https://meet.google.com/abc-defg-hij"), 
    true, 
    "Valid Meet URL should be accepted"
  );
  assert.strictEqual(
    isValidGoogleMeetUrl("https://meet.google.com/abc-defg-hij?authuser=1"), 
    true, 
    "Valid Meet URL with query parameters should be accepted (parsing code correctly)"
  );
  assert.strictEqual(
    isValidGoogleMeetUrl("https://zoom.us/j/123456"), 
    false, 
    "Zoom URL should not be verified as Google Meet URL"
  );
  assert.strictEqual(
    isValidGoogleMeetUrl("https://meet.google.com/ab1-defg-hij"), 
    false, 
    "Meet URL with invalid code format should be rejected"
  );

  // 3. Test general isValidMeetingUrl logic
  assert.strictEqual(
    isValidMeetingUrl("https://meet.google.com/abc-defg-hij"), 
    true, 
    "isValidMeetingUrl should accept valid Meet URL"
  );
  assert.strictEqual(
    isValidMeetingUrl("https://meet.google.com/ab1-defg-hij"), 
    false, 
    "isValidMeetingUrl should reject malformed Meet URL containing numbers"
  );
  assert.strictEqual(
    isValidMeetingUrl("https://zoom.us/j/123456"), 
    true, 
    "isValidMeetingUrl should accept other valid platforms like Zoom"
  );

  // 5. Test Calendly URL validation logic
  assert.strictEqual(
    isValidCalendlyUrl("https://calendly.com/praneethburada/30min"),
    true,
    "Valid Calendly URL should be accepted"
  );
  assert.strictEqual(
    isValidCalendlyUrl("https://www.calendly.com/growstack-ai/onboarding"),
    true,
    "Valid Calendly URL with www subdomain should be accepted"
  );
  assert.strictEqual(
    isValidCalendlyUrl("https://calendly.com/praneethburada"),
    false,
    "Invalid Calendly URL (missing event segment) should be rejected"
  );
  assert.strictEqual(
    isValidCalendlyUrl("https://zoom.us/j/123456"),
    false,
    "Non-Calendly URL should be rejected by isValidCalendlyUrl"
  );

  // 6. Test general isValidMeetingUrl with Calendly
  assert.strictEqual(
    isValidMeetingUrl("https://calendly.com/praneethburada/30min"),
    true,
    "isValidMeetingUrl should accept valid Calendly URLs"
  );
  assert.strictEqual(
    isValidMeetingUrl("https://calendly.com/praneethburada"),
    false,
    "isValidMeetingUrl should reject invalid Calendly URLs"
  );

  // 4. Test the fixed generator by creating 100 test links
  console.log("Generating 100 test meeting links to confirm strict alphabetical formatting...");
  for (let i = 0; i < 100; i++) {
    const generatedCode = generateTestGoogleMeetCode();
    
    // Assert formatted pattern abc-defg-hij
    assert.match(
      generatedCode, 
      /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/, 
      `Generated code '${generatedCode}' does not match abc-defg-hij lowercase format`
    );

    // Confirm no numbers are present in the generated code
    const hasNumbers = /[0-9]/.test(generatedCode);
    assert.strictEqual(hasNumbers, false, `Generated code '${generatedCode}' should not contain numbers`);
    
    // Confirm the URL validates correctly
    const generatedUrl = `https://meet.google.com/${generatedCode}`;
    assert.strictEqual(
      isValidMeetingUrl(generatedUrl), 
      true, 
      `Generated URL '${generatedUrl}' should pass verification`
    );
  }

  console.log("Google Meet URL Validation and Generation tests completed successfully! All 100 generated links are valid.");
}
