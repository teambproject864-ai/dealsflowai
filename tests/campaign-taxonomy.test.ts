// tests/campaign-taxonomy.test.ts
import { 
  COMPLETE_CAMPAIGN_SCHEMA, 
  getOptionById, 
  getOptionsByGroup, 
  getTaxonomyMetrics 
} from "../lib/campaign-options-schema";

export async function runCampaignTaxonomyTests() {
  console.log("=== Running Campaign Taxonomy & Hierarchy Tests ===");

  const metrics = getTaxonomyMetrics();
  console.log(`[Metrics] Total Categories: ${metrics.totalCategories}`);
  console.log(`[Metrics] Total Options: ${metrics.totalOptions}`);
  console.log(`[Metrics] Content Types Options: ${metrics.contentTypesCount}`);
  console.log(`[Metrics] Marketing Tactics Options: ${metrics.marketingTacticsCount}`);

  if (metrics.totalCategories !== 20) {
    throw new Error(`Expected 20 categories, got ${metrics.totalCategories}`);
  }

  if (metrics.totalOptions < 180) {
    throw new Error(`Expected at least 180 options, got ${metrics.totalOptions}`);
  }

  // 1. Validate Category Mappings
  for (const cat of COMPLETE_CAMPAIGN_SCHEMA) {
    if (!cat.id || !cat.title || !cat.typeGroup || !cat.subTypes) {
      throw new Error(`Invalid category structure for ${cat.id}`);
    }

    if (cat.subTypes.length === 0) {
      throw new Error(`Category ${cat.title} has no subTypes options`);
    }

    // 2. Validate Option SubTypes
    for (const sub of cat.subTypes) {
      if (!sub.id || !sub.title || !sub.badge || !sub.description || !sub.fields) {
        throw new Error(`Invalid option structure for ${sub.id} in ${cat.title}`);
      }

      if (sub.fields.length === 0) {
        throw new Error(`Option ${sub.title} has no defined fields`);
      }

      // Check fields structure
      for (const field of sub.fields) {
        if (!field.id || !field.label || !field.type) {
          throw new Error(`Invalid field structure in option ${sub.title}`);
        }
      }
    }
  }
  console.log("✅ Passed: Taxonomy completeness and field mapping integrity verified");

  // 3. Test Lookup Functionality
  const testBlog = getOptionById("blog_posts_seo");
  if (!testBlog || testBlog.subType.title !== "Blog posts (Educational/SEO)") {
    throw new Error("Failed to lookup 'blog_posts_seo' option");
  }

  const testColdEmail = getOptionById("tactic_cold_email");
  if (!testColdEmail || testColdEmail.subType.title !== "Cold email outreach") {
    throw new Error("Failed to lookup 'tactic_cold_email' option");
  }
  console.log("✅ Passed: Option lookup by ID (getOptionById)");

  // 4. Test Group Filtering
  const contentTypesCats = getOptionsByGroup("content_types");
  if (contentTypesCats.length !== 7) {
    throw new Error(`Expected 7 Content Types categories, got ${contentTypesCats.length}`);
  }

  const marketingTacticsCats = getOptionsByGroup("marketing_tactics");
  if (marketingTacticsCats.length !== 13) {
    throw new Error(`Expected 13 Marketing Tactics categories, got ${marketingTacticsCats.length}`);
  }
  console.log("✅ Passed: Group filtering by content_types and marketing_tactics");

  console.log("🎉 All Campaign Taxonomy Tests Passed Successfully!\n");
}

if (require.main === module) {
  runCampaignTaxonomyTests().catch(err => {
    console.error("❌ Test Failed:", err);
    process.exit(1);
  });
}
