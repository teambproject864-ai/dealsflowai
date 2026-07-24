// tests/model-selection.test.ts
import assert from "assert";
import { 
  SUPPORTED_MODELS, 
  getModelsForRole, 
  isModelAllowedForRole, 
  getModelById, 
  getDefaultModelForRole 
} from "../lib/model-registry";
import { POST as handleContentGenerate } from "../app/api/content/generate/route";
import { NextRequest } from "next/server";

export async function runModelSelectionTests() {
  console.log("=== Running AI Model Selection & Role Authorization Tests ===");

  if (!process.env.HUGGINGFACE_API_KEY || !process.env.HUGGINGFACE_API_KEY.startsWith("hf_")) {
    process.env.HUGGINGFACE_API_KEY = "hf_mock_e2e_key_9999999999";
  }

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (url: any, init: any) => {
    if (typeof url === 'string' && (url.includes("huggingface") || url.includes("api-inference"))) {
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => ({
          id: "chatcmpl-mock-123",
          object: "chat.completion",
          created: Date.now(),
          model: "mistralai/Mistral-7B-Instruct-v0.3",
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: "Dealflow AI: Content generated successfully using requested AI model."
              },
              finish_reason: "stop"
            }
          ],
          usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 }
        }),
        text: async () => "Dealflow AI response",
      } as any;
    }
    if (originalFetch) {
      return originalFetch(url, init);
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({}),
    } as any;
  }) as any;


  // 1. Test Model Registry Definitions & Metadata Completeness
  console.log("--> Testing Model Registry Metadata Completeness...");
  assert.ok(SUPPORTED_MODELS.length >= 6, "Must define at least 6 supported AI models");

  for (const model of SUPPORTED_MODELS) {
    assert.ok(model.id, `Model missing ID`);
    assert.ok(model.name, `Model ${model.id} missing name`);
    assert.ok(model.provider, `Model ${model.id} missing provider`);
    assert.ok(model.description && model.description.length > 10, `Model ${model.id} missing description`);
    assert.ok(Array.isArray(model.useCases) && model.useCases.length >= 1, `Model ${model.id} missing use cases`);
    assert.ok(Array.isArray(model.allowedRoles) && model.allowedRoles.length >= 1, `Model ${model.id} missing allowed roles`);
    assert.ok(model.performanceProfile.latencyMs > 0, `Model ${model.id} invalid latency`);
    assert.ok(model.performanceProfile.tokensPerSecond > 0, `Model ${model.id} invalid throughput`);
    assert.ok(model.performanceProfile.contextWindow > 0, `Model ${model.id} invalid context window`);
  }
  console.log(`✅ Passed: All ${SUPPORTED_MODELS.length} models contain complete capabilities and performance profiles`);

  // 2. Test Role-Based Model Filtering Logic
  console.log("--> Testing Role-Based Model Filtering (Customer vs Agent/Admin)...");
  
  const customerModels = getModelsForRole("customer");
  const agentModels = getModelsForRole("agent");
  const adminModels = getModelsForRole("admin");

  assert.ok(customerModels.length > 0, "Customer role must have available models");
  assert.ok(agentModels.length > customerModels.length, "Agent role must have access to more/advanced models than Customer");
  assert.strictEqual(agentModels.length, adminModels.length, "Admin and Agent should have full model access");

  // Customer should only see Standard/Fastest models
  for (const m of customerModels) {
    assert.ok(m.allowedRoles.includes("customer"), `Customer model list contains unpermitted model ${m.id}`);
  }

  console.log(`✅ Passed: Customer role filtered to ${customerModels.length} models, Agent role unlocked all ${agentModels.length} models`);

  // 3. Test Model Permission Validator (isModelAllowedForRole)
  console.log("--> Testing Model Access Control Validation...");
  
  const standardModel = "meta-llama/llama-3.1-8b-instruct";
  const proModel = "meta-llama/llama-3.1-70b-instruct";
  const enterpriseModel = "deepseek-ai/deepseek-v4-pro";

  // Standard model allowed for everyone
  assert.strictEqual(isModelAllowedForRole(standardModel, "customer"), true, "Standard model must be allowed for Customer");
  assert.strictEqual(isModelAllowedForRole(standardModel, "agent"), true, "Standard model must be allowed for Agent");

  // Pro & Enterprise models restricted for Customer
  assert.strictEqual(isModelAllowedForRole(proModel, "customer"), false, "Pro 70B model MUST be blocked for Customer role");
  assert.strictEqual(isModelAllowedForRole(enterpriseModel, "customer"), false, "Enterprise DeepSeek model MUST be blocked for Customer role");

  // Pro & Enterprise models permitted for Agent & Admin
  assert.strictEqual(isModelAllowedForRole(proModel, "agent"), true, "Pro 70B model MUST be allowed for Agent role");
  assert.strictEqual(isModelAllowedForRole(enterpriseModel, "agent"), true, "Enterprise model MUST be allowed for Agent role");
  assert.strictEqual(isModelAllowedForRole(proModel, "admin"), true, "Pro 70B model MUST be allowed for Admin role");

  console.log("✅ Passed: Role-based model access control validation rules enforced");

  // 4. Test API Endpoint Authorization & Model Parameter Propagation
  console.log("--> Testing Content Generation API Role Validation & Model Propagation...");

  // Scenario 4a: Customer selects authorized model (llama-3.1-8b)
  const custAllowedReq = new NextRequest("http://localhost:3000/api/content/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-user-role": "customer"
    },
    body: JSON.stringify({
      prompt: "Draft an outbound campaign summary for B2B SaaS prospect",
      modelId: standardModel
    })
  });

  const custAllowedRes = await handleContentGenerate(custAllowedReq);
  const custAllowedJson = await custAllowedRes.json();
  assert.strictEqual(custAllowedRes.status, 200, "Customer request with authorized model should return 200 OK");
  assert.strictEqual(custAllowedJson.success, true);
  assert.strictEqual(custAllowedJson.model.id, standardModel, "API must return response using chosen model ID");
  assert.ok(custAllowedJson.telemetry.latencyMs >= 0, "API must include telemetry latency");
  console.log("  ✅ Customer authorized model selection API test passed");

  // Scenario 4b: Customer selects unauthorized model (llama-3.1-70b) -> Expect 403 Forbidden
  const custBlockedReq = new NextRequest("http://localhost:3000/api/content/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-user-role": "customer"
    },
    body: JSON.stringify({
      prompt: "Execute deep financial valuation audit",
      modelId: proModel
    })
  });

  const custBlockedRes = await handleContentGenerate(custBlockedReq);
  const custBlockedJson = await custBlockedRes.json();
  assert.strictEqual(custBlockedRes.status, 403, "Customer selecting Pro model MUST return 403 Forbidden");
  assert.strictEqual(custBlockedJson.success, false);
  assert.ok(custBlockedJson.error.includes("not authorized"), "Error response must state unauthorized model error");
  console.log("  ✅ Customer unauthorized model selection rejection (403 Forbidden) test passed");

  // Scenario 4c: Agent selects Pro model (llama-3.1-70b) -> Expect 200 OK
  const agentAllowedReq = new NextRequest("http://localhost:3000/api/content/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-user-role": "agent"
    },
    body: JSON.stringify({
      prompt: "Generate enterprise M&A due diligence report",
      modelId: proModel
    })
  });

  const agentAllowedRes = await handleContentGenerate(agentAllowedReq);
  const agentAllowedJson = await agentAllowedRes.json();
  assert.strictEqual(agentAllowedRes.status, 200, "Agent selecting Pro model should return 200 OK");
  assert.strictEqual(agentAllowedJson.success, true);
  assert.strictEqual(agentAllowedJson.model.id, proModel);
  console.log("  ✅ Agent Pro model selection API test passed");

  console.log("🎉 All AI Model Selection & Role Authorization Tests Passed Successfully!\n");
}

if (require.main === module) {
  runModelSelectionTests().catch(err => {
    console.error("❌ Model Selection Test Failed:", err);
    process.exit(1);
  });
}
