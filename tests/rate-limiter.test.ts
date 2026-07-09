// tests/rate-limiter.test.ts
import assert from "assert";
import { checkRateLimitSensitive } from "../lib/rate-limiter-middleware";

async function testRateLimiterSensitive() {
  const req = new Request("http://localhost:3000/api/leads/save", {
    headers: {
      "x-forwarded-for": "192.168.1.50",
    },
  });

  // Call 20 times - should be allowed (returns null)
  for (let i = 0; i < 20; i++) {
    const res = await checkRateLimitSensitive(req);
    assert.strictEqual(res, null, `Request ${i + 1} should be allowed`);
  }

  // Call 21st time - should be blocked (returns 429 response)
  const resBlock = await checkRateLimitSensitive(req);
  assert.ok(resBlock !== null, "21st request should be blocked");
  assert.strictEqual(resBlock.status, 429, "Response status should be 429");
  
  const body = await resBlock.json();
  assert.strictEqual(body.success, false);
  assert.strictEqual(body.error, "Too many requests, please try again later");

  const retryAfter = resBlock.headers.get("Retry-After");
  assert.ok(retryAfter !== null, "Retry-After header should be present");
  assert.ok(parseInt(retryAfter) >= 0, "Retry-After should be a valid number");

  console.log("✅ Passed: testRateLimiterSensitive");
}

testRateLimiterSensitive().catch((err) => {
  console.error(err);
  process.exit(1);
});
