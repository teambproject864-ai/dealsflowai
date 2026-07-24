// lib/deliverable-builder.ts
import { ImageCurator } from "./image-curator";
import { PrePublishValidator, PrePublishValidationReport } from "./pre-publish-validator";

export interface DeliverableOptions {
  categoryKey: string;
  categoryTitle: string;
  subTypeKey: string;
  subTypeTitle: string;
  badge: string;
  customerName: string;
  formValues: Record<string, string>;
}

export interface GeneratedDeliverable {
  title: string;
  rawMarkdown: string;
  validationReport: PrePublishValidationReport;
  platformMeta: {
    categoryKey: string;
    subTypeKey: string;
    targetPlatform: string;
    formattedHeadline: string;
    hashtags: string[];
    ctaText: string;
  };
}

export class DeliverableBuilder {
  /**
   * Generates a fully polished, deliverable-ready marketing asset with H1/H2/H3 Markdown structure,
   * embedded curated images, platform technical specs, and pre-publishing validation report.
   */
  public static buildDeliverable(options: DeliverableOptions): GeneratedDeliverable {
    const {
      categoryKey,
      categoryTitle,
      subTypeKey,
      subTypeTitle,
      badge,
      customerName,
      formValues
    } = options;

    const brand = customerName || "Our Brand";
    const topic = formValues.primaryKeyword || formValues.targetPersona || formValues.primaryObjective || "B2B SaaS Growth & RevOps";
    const image = ImageCurator.selectImage(categoryKey, topic);
    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    // Resolve Target Platform
    let targetPlatform = "general";
    if (categoryKey === "social_media_content" || subTypeKey.includes("linkedin")) targetPlatform = "linkedin";
    else if (subTypeKey.includes("twitter") || subTypeKey.includes("tweet")) targetPlatform = "twitter";
    else if (categoryKey === "paid_marketing_tactics" || subTypeKey.includes("ad")) targetPlatform = "google_meta_ads";
    else if (categoryKey === "outreach_tactics" || categoryKey === "email_marketing") targetPlatform = "email_campaign";
    else targetPlatform = "seo_blog_cms";

    // Primary Headline & Hook
    const headline = formValues.openingHook || formValues.headline || `Accelerating B2B Deal Flow & Revenue Velocity for ${brand}`;
    const primaryCta = formValues.callToAction || formValues.primaryCta || `Schedule a 15-Minute Strategy Session with ${brand}`;

    // Build Formatted Markdown Body based on SubType
    let markdownBody = "";

    if (targetPlatform === "linkedin") {
      markdownBody = `# 🚀 ${subTypeTitle}: ${headline}

**Published by:** ${brand} Strategy Team | **Date:** ${dateStr} | **Badge:** [${badge}]

${ImageCurator.generateMarkdownEmbed(image)}

## 📌 Executive Summary & Key Takeaways
Are legacy manual workflows slowing down your sales pipeline? Here is how leading teams in the ${formValues.targetPersona || "B2B SaaS"} ecosystem are accelerating deal velocity.

### 💡 Core Industry Insights
${Object.entries(formValues)
  .map(([k, v]) => `- **${k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:** ${v}`)
  .join("\n")}

## 🛠️ Step-by-Step Implementation Framework
1. **Define ICP Intent Signals:** Align target outreach with real-time buying signals.
2. **Automate Multi-Touch Nurturing:** Deliver personalized value across email, social, and direct channels.
3. **Continuous Performance Optimization:** Monitor engagement metrics to refine messaging hooks.

---

### 🎯 Action Required:
👉 **${primaryCta}**

#B2B #RevOps #SalesStrategy #${brand.replace(/\s+/g, '')} #GTMGrowth
`;
    } else if (targetPlatform === "email_campaign") {
      markdownBody = `# 📧 ${subTypeTitle} — ${brand} Campaign Sequence

**Target Audience:** ${formValues.targetPersona || "Decision Makers"}  
**Sequence Type:** High-Converting Multi-Touch Outreach  
**Generation Date:** ${dateStr}

---

## ✉️ Email Subject Line Options (A/B Test Ready)
- **Option A (Benefit Driven):** ${headline}
- **Option B (Curiosity Driven):** Quick question regarding ${topic} at {{Company_Name}}
- **Option C (Direct Pitch):** How ${brand} helps {{Company_Name}} achieve ${formValues.primaryObjective || "faster deal execution"}

---

## 📝 Email Body Copy

**Subject:** ${headline}  
**Preheader Text:** Discover how ${brand} optimizes RevOps and revenue growth.

Hi {{First_Name}},

I noticed that {{Company_Name}} is currently focusing on ${topic}. Many leaders in your space face challenges balancing deal execution speed with accuracy.

${brand} offers a specialized approach to streamline this process:

### Key Highlights for {{Company_Name}}:
- **Proven Impact:** ${formValues.valueProposition || "Accelerate pipeline velocity while eliminating manual bottlenecks."}
- **Rapid Deployment:** Seamlessly integrates with your existing GTM stack in under 24 hours.
- **Measurable ROI:** Achieve up to 40% faster meeting booking rates.

${ImageCurator.generateMarkdownEmbed(image)}

Are you open to a brief 10-minute chat this week to explore if this aligns with your growth priorities for Q3?

Best regards,  
**The ${brand} Revenue Team**  
[${primaryCta}]
`;
    } else if (targetPlatform === "google_meta_ads") {
      markdownBody = `# 📢 ${subTypeTitle}: Paid Campaign Deliverable

**Target Platform:** Google Search & Meta Social Ads  
**Brand Account:** ${brand}  
**Status:** Deliverable Ready

${ImageCurator.generateMarkdownEmbed(image)}

---

## 🎯 Google Search Ad Headlines & Descriptions

### Headlines (Max 30 Chars Each):
1. **Headline 1:** ${headline.substring(0, 30)}
2. **Headline 2:** Boost RevOps Growth Today
3. **Headline 3:** Official ${brand} Solution

### Descriptions (Max 90 Chars Each):
- **Desc 1:** Accelerate deal velocity and streamline GTM workflows. Get a live demo now.
- **Desc 2:** Built for enterprise teams requiring high-precision deal evaluation and ROI.

---

## 📱 Meta / LinkedIn Sponsored Feed Ad Copy

**Primary Copy:**
> ${headline}. Stop letting manual pipeline bottlenecks slow down your revenue growth. Discover how ${brand} empowers teams with automated intelligence and seamless deal flow execution.

**Headline Banner:** ${headline}  
**Call-to-Action Button:** Learn More / ${primaryCta}
`;
    } else {
      // Default SEO Blog Post & Long-Form Article
      markdownBody = `# 📄 ${subTypeTitle}: ${headline}

**Author:** ${brand} Insights Team | **Category:** ${categoryTitle} | **Date:** ${dateStr}

${ImageCurator.generateMarkdownEmbed(image)}

## 📖 Introduction
In today's fast-moving ${formValues.industry || "B2B SaaS"} market, achieving sustainable revenue growth requires continuous strategy alignment and rapid execution. This deliverable breaks down actionable tactics for **${topic}**.

---

## 🔍 Key Strategy Parameters & Setup
${Object.entries(formValues)
  .map(([k, v]) => `- **${k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:** ${v}`)
  .join("\n")}

---

## 🚀 In-Depth Execution Framework

### 1. Market Positioning & Audience Alignment
Targeting ${formValues.targetPersona || "high-intent decision makers"} requires messaging that addresses core operational pain points while providing clear evidence of value.

### 2. Campaign Delivery & Tactical Execution
Deploying ${subTypeTitle} allows ${brand} to establish category authority, drive qualified traffic, and convert interest into active deal opportunities.

### 3. Analytics & KPI Tracking
Track key performance metrics including conversion rates, engagement latency, and overall pipeline velocity to continuously optimize campaign performance.

---

## 💡 Conclusion & Next Steps
By implementing this structured deliverable for **${subTypeTitle}**, ${brand} is positioned to capture high-intent demand and accelerate revenue performance.

👉 **Ready to transform your strategy? [${primaryCta}]**
`;
    }

    // Run Pre-Publishing Validation
    const validationReport = PrePublishValidator.validateDeliverable(
      markdownBody,
      targetPlatform,
      categoryKey
    );

    return {
      title: headline,
      rawMarkdown: markdownBody,
      validationReport,
      platformMeta: {
        categoryKey,
        subTypeKey,
        targetPlatform,
        formattedHeadline: headline,
        hashtags: ["#B2B", "#RevOps", `#${brand.replace(/\s+/g, '')}`, "#GrowthStrategy"],
        ctaText: primaryCta
      }
    };
  }
}
