// tests/headers.test.ts
import assert from "assert";
import nextConfig from "../next.config.mjs";

async function testConfigHeaders() {
  assert.strictEqual(nextConfig.reactStrictMode, true, "reactStrictMode should be enabled");
  
  if (typeof nextConfig.headers === "function") {
    const headersList = await nextConfig.headers();
    
    // Find the catch-all route headers
    const catchAllRoute = headersList.find((h: any) => h.source === "/(.*)");
    assert.ok(catchAllRoute, "Catch-all headers route should be defined");

    const permissionsPolicy = catchAllRoute.headers.find((h: any) => h.key === "Permissions-Policy");
    assert.ok(permissionsPolicy, "Permissions-Policy header should exist");
    assert.ok(permissionsPolicy.value.includes("microphone=(self)"), "Microphone policy should be (self)");

    const csp = catchAllRoute.headers.find((h: any) => h.key === "Content-Security-Policy");
    assert.ok(csp, "Content-Security-Policy header should exist");
    assert.ok(csp.value.includes("https://api.elevenlabs.io"), "ElevenLabs should be in connect-src");
    assert.ok(csp.value.includes("https://*.twilio.com"), "Twilio should be in connect-src");
  }

  console.log("✅ Passed: testConfigHeaders");
}

export async function runHeaderTests() {
  await testConfigHeaders();
}
