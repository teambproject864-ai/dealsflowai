import { analysisGraph } from "../lib/agents/analysisGraph";
import * as fs from "fs";
import * as path from "path";

try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split(/\r?\n/).forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) return;
      const index = trimmedLine.indexOf("=");
      if (index !== -1) {
        const key = trimmedLine.substring(0, index).trim();
        let value = trimmedLine.substring(index + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error("Failed to load .env.local file:", e);
}

async function testGTMAnalysisEndToEnd() {
  console.log("=========================================");
  console.log(" GTM AI Analysis Module E2E Test");
  console.log("=========================================");

  const companyData = {
    companyName: "Vercel",
    websiteUrl: "vercel.com",
  };

  console.log("\n1. Invoking GTM AI Analysis Graph Pipeline...");
  const startTime = Date.now();

  try {
    const graphState = await analysisGraph.invoke({ companyData });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Pipeline finished in ${duration} seconds.`);

    if (graphState.error) {
      console.error("\n❌ E2E GTM Analysis pipeline failed with error:", graphState.error);
      process.exit(1);
    }

    const result = graphState.analysisResult;
    console.log("\n✅ E2E GTM Analysis pipeline completed successfully!");
    console.log("\n================ Analysis Result Preview ================");
    console.log(`Health Score: ${result.healthScore}/100`);
    console.log(`GTM Plan: ${result.gtmPlan?.substring(0, 120)}...`);
    console.log(`Brand Overview: ${result.comprehensiveBrandOverview?.substring(0, 100)}...`);
    console.log(`ICPs: ${result.idealCustomerProfiles?.length}`);
    console.log(`Differentiation Triggers: ${result.marketDifferentiationTriggers?.length}`);
    console.log(`Journey Stages: ${result.customerJourneyPipeline?.length}`);
    console.log("=========================================================");
  } catch (err) {
    console.error("\n❌ Unexpected exception:", err);
    process.exit(1);
  }
}

testGTMAnalysisEndToEnd();
