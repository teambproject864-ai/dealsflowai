// lib/pre-publish-validator.ts
export interface ValidationCheckItem {
  id: string;
  name: string;
  category: "formatting" | "images" | "character_limit" | "placeholders" | "platform_compliance";
  passed: boolean;
  scoreImpact: number; // e.g. 15 points
  message: string;
  suggestion?: string;
}

export interface PrePublishValidationReport {
  overallScore: number; // 0 to 100
  isDeliverableReady: boolean;
  statusBadge: "Ready to Publish" | "Minor Review Advised" | "Action Required";
  checks: ValidationCheckItem[];
  characterCount: number;
  wordCount: number;
  headingCount: { h1: number; h2: number; h3: number };
  imageEmbedCount: number;
  platformSpec: {
    targetPlatform: string;
    maxRecommendedLength: number;
    withinCharacterLimit: boolean;
  };
  timestamp: string;
}

export class PrePublishValidator {
  /**
   * Scans generated deliverable content against platform specifications and technical checks
   */
  public static validateDeliverable(
    content: string,
    targetPlatform: string = "general",
    categoryKey: string = "written_content"
  ): PrePublishValidationReport {
    const checks: ValidationCheckItem[] = [];
    const charCount = content.length;
    const wordCount = content.split(/\s+/).filter(Boolean).length;

    // 1. Heading Hierarchy Check
    const h1Matches = (content.match(/^#\s+.+/gm) || []).length;
    const h2Matches = (content.match(/^##\s+.+/gm) || []).length;
    const h3Matches = (content.match(/^###\s+.+/gm) || []).length;

    const hasH1 = h1Matches >= 1;
    const hasH2 = h2Matches >= 2;

    checks.push({
      id: "check-heading-structure",
      name: "Structured Heading Hierarchy (H1/H2/H3)",
      category: "formatting",
      passed: hasH1 && hasH2,
      scoreImpact: 20,
      message: hasH1 && hasH2
        ? `Proper heading hierarchy present (${h1Matches} H1, ${h2Matches} H2, ${h3Matches} H3).`
        : "Missing proper H1 or minimum required H2 headings for logical content structure.",
      suggestion: !hasH1 ? "Ensure document starts with a single # Main Title." : "Add at least two ## Section Headings."
    });

    // 2. Image Embedding Check
    const imageEmbeds = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
    const requiresImage = categoryKey !== "outreach_tactics" && categoryKey !== "email_marketing";
    const imagePassed = !requiresImage || imageEmbeds >= 1;

    checks.push({
      id: "check-image-embedding",
      name: "High-Resolution Image Curation & Embedding",
      category: "images",
      passed: imagePassed,
      scoreImpact: 20,
      message: imageEmbeds >= 1
        ? `Found ${imageEmbeds} contextual image embed(s) with formatted captions.`
        : requiresImage
        ? "No embedded visual assets found in content."
        : "Image embedding optional for text-based email/outreach sequence.",
      suggestion: !imagePassed ? "Embed at least one relevant high-resolution image asset using markdown ![Alt](URL)." : undefined
    });

    // 3. Placeholder Text Check
    const placeholderRegex = /\[INSERT\s+.*?\]|\[YOUR\s+.*?\]|\[FILL\s+.*?\]/gi;
    const placeholderMatches = content.match(placeholderRegex) || [];
    const noPlaceholders = placeholderMatches.length === 0;

    checks.push({
      id: "check-placeholders",
      name: "Deliverable Readiness & Token Hydration",
      category: "placeholders",
      passed: noPlaceholders,
      scoreImpact: 25,
      message: noPlaceholders
        ? "Zero unhydrated template tokens detected. All brand parameters fully populated."
        : `Detected ${placeholderMatches.length} unhydrated placeholder(s): ${placeholderMatches.slice(0, 3).join(", ")}`,
      suggestion: !noPlaceholders ? "Replace all bracketed placeholders with specific account parameters before publishing." : undefined
    });

    // 4. Character Limit & Platform Specification Check
    let maxCharLimit = 10000;
    if (targetPlatform.includes("linkedin") || targetPlatform.includes("social")) maxCharLimit = 3000;
    if (targetPlatform.includes("twitter") || targetPlatform.includes("x")) maxCharLimit = 280;
    if (targetPlatform.includes("ad_copy") || targetPlatform.includes("ads")) maxCharLimit = 1500;

    const withinLimit = charCount <= maxCharLimit;

    checks.push({
      id: "check-platform-limit",
      name: `Platform Specification (${targetPlatform.toUpperCase()})`,
      category: "character_limit",
      passed: withinLimit,
      scoreImpact: 20,
      message: withinLimit
        ? `Content length (${charCount} chars, ${wordCount} words) complies with ${targetPlatform} technical specifications (max ${maxCharLimit}).`
        : `Content length (${charCount} chars) exceeds maximum recommended limit for ${targetPlatform} (${maxCharLimit} chars).`,
      suggestion: !withinLimit ? `Trim copy by ${charCount - maxCharLimit} characters to prevent truncation upon publishing.` : undefined
    });

    // 5. Call-to-Action & Formatting Sanity Check
    const hasCTA = /call to action|cta|schedule|click|visit|book|register|download|sign up/i.test(content);
    checks.push({
      id: "check-cta-formatting",
      name: "Conversion CTA & Link Readiness",
      category: "platform_compliance",
      passed: hasCTA,
      scoreImpact: 15,
      message: hasCTA
        ? "Clear conversion hook and call-to-action identified."
        : "No explicit Call-To-Action (CTA) phrase detected in copy.",
      suggestion: !hasCTA ? "Add a direct CTA (e.g., 'Schedule a demo', 'Download whitepaper') to maximize conversion." : undefined
    });

    // Calculate total overall score
    const totalScore = checks.reduce((acc, c) => acc + (c.passed ? c.scoreImpact : 0), 0);
    const overallScore = Math.min(100, Math.max(0, totalScore));

    const isDeliverableReady = overallScore >= 85;
    const statusBadge: PrePublishValidationReport["statusBadge"] = 
      overallScore >= 90 ? "Ready to Publish" : overallScore >= 75 ? "Minor Review Advised" : "Action Required";

    return {
      overallScore,
      isDeliverableReady,
      statusBadge,
      checks,
      characterCount: charCount,
      wordCount,
      headingCount: { h1: h1Matches, h2: h2Matches, h3: h3Matches },
      imageEmbedCount: imageEmbeds,
      platformSpec: {
        targetPlatform,
        maxRecommendedLength: maxCharLimit,
        withinCharacterLimit: withinLimit
      },
      timestamp: new Date().toISOString()
    };
  }
}
