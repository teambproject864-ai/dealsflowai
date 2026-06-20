import { getLLMRouter } from "./llm-router";

async function testLLMRouter() {
  console.log("Testing LLM Router...");
  
  const router = getLLMRouter();
  
  // Test cost priority
  const costModel = router.selectBestModel({ priority: "cost" });
  console.log("Cost priority selected model:", costModel?.name);
  
  // Test speed priority
  const speedModel = router.selectBestModel({ priority: "speed" });
  console.log("Speed priority selected model:", speedModel?.name);
  
  // Test quality priority
  const qualityModel = router.selectBestModel({ priority: "quality" });
  console.log("Quality priority selected model:", qualityModel?.name);
  
  // Test specific capability requirement
  const embeddingModel = router.selectBestModel({ priority: "balanced", requiredCapabilities: { embeddings: true } });
  console.log("Embedding capability required model:", embeddingModel?.name);
  
  // Test max tokens
  const longContextModel = router.selectBestModel({ priority: "quality", maxTokens: 100000 });
  console.log("Long context (≥100k) selected model:", longContextModel?.name);
  
  console.log("All tests passed!");
}

testLLMRouter().catch(console.error);
