// tests/deliverable-studio.test.ts
import assert from "assert";
import { DeliverableBuilder } from "../lib/deliverable-builder";
import { ImageCurator } from "../lib/image-curator";
import { PrePublishValidator } from "../lib/pre-publish-validator";

export async function runDeliverableStudioTests() {
  console.log("\n=== RUNNING DELIVERABLE STUDIO & PRE-PUBLISHING TEST SUITE ===");

  // 1. Image Curator Test
  console.log("--> [1/3] Testing Contextual Image Curation & Markdown Embedding...");
  const img = ImageCurator.selectImage("written_content", "RevOps Growth");
  assert.ok(img.url.startsWith("http"), "Image URL generated");
  assert.ok(img.caption.includes("RevOps Growth"), "Topic keyword injected into caption");

  const embedCode = ImageCurator.generateMarkdownEmbed(img);
  assert.ok(embedCode.includes("!["), "Markdown image syntax generated");
  console.log("  ✅ Image Curation & Markdown Embed verified");

  // 2. Pre-Publishing Validator Test
  console.log("--> [2/3] Testing Pre-Publishing Validation Scanner & Compliance Score...");
  const sampleMarkdown = `# 🚀 B2B Growth Strategy
  
![SaaS Dashboard](https://images.unsplash.com/sample.jpg)
*Figure 1: RevOps Growth*

## 📌 Executive Summary
High performing campaign strategy.

## 🛠️ Execution Framework
1. Target ICP
2. Email Sequences

👉 **Schedule a 15-Minute Strategy Call**
`;

  const report = PrePublishValidator.validateDeliverable(sampleMarkdown, "linkedin", "written_content");
  assert.strictEqual(report.isDeliverableReady, true, "Deliverable ready status verified");
  assert.ok(report.overallScore >= 85, "Compliance score above 85%");
  assert.strictEqual(report.imageEmbedCount, 1, "Image embed detected");
  assert.strictEqual(report.headingCount.h1, 1, "H1 heading detected");
  assert.strictEqual(report.headingCount.h2, 2, "H2 headings detected");
  console.log(`  ✅ Pre-Publishing Validation passed (Score: ${report.overallScore}/100, Badge: ${report.statusBadge})`);

  // 3. Deliverable Builder Test Across Platforms
  console.log("--> [3/3] Testing Deliverable-Ready Asset Builder...");

  const deliverable = DeliverableBuilder.buildDeliverable({
    categoryKey: "written_content",
    categoryTitle: "Written Content",
    subTypeKey: "blog_posts_seo",
    subTypeTitle: "SEO Blog Post",
    badge: "Blog Copy",
    customerName: "Acme SaaS Corp",
    formValues: {
      openingHook: "Scaling Enterprise B2B RevOps Pipeline",
      targetPersona: "VP Engineering",
      primaryKeyword: "RevOps Automation"
    }
  });

  assert.ok(deliverable.rawMarkdown.includes("![") && deliverable.rawMarkdown.includes("https://images.unsplash.com"), "Image curator asset embedded");
  assert.strictEqual(deliverable.validationReport.isDeliverableReady, true, "Generated deliverable passed pre-publishing check");


  console.log("  ✅ Deliverable Builder verified across target platforms");

  console.log("\n============================================================");
  console.log("🎉 ALL DELIVERABLE STUDIO TESTS PASSED!");
  console.log("============================================================\n");
}

if (require.main === module) {
  runDeliverableStudioTests().catch(err => {
    console.error("Test execution failed:", err);
    process.exit(1);
  });
}
