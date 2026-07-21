/**
 * GTM Playbook Generator
 * Automatically generates a comprehensive Go-to-Market Analysis & Playbook
 * from intake form data using the AI provider router (Kimi → fallback chain).
 *
 * Called automatically when a GTM intake form is submitted.
 * Output is persisted to Firestore `gtm_playbooks` collection.
 */

import { performDynamicInferenceJSON } from "@/lib/ai-provider-router";
import { db } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GTMIntakeData {
  id: string;                          // tracking ID e.g. GTM-ABC123
  companyName: string;
  websiteUrl?: string;
  productName: string;
  productOwnerName: string;
  productOwnerEmail: string;
  targetLaunchDate?: string;
  targetMarketRegion?: string;
  primaryUseCase?: string;
  marketingBudgetAllocation?: number;
  stakeholders?: string[];
  complianceDocuments?: string[];
  // Extended intake fields
  name?: string;
  icpDescription?: string;
  targetIndustries?: string[];
  targetCompanySizes?: string[];
  decisionMakers?: string[];
  buyingTriggers?: string[];
  painPoint?: string;
  offerPromise?: string;
  irresistibleHook?: string;
  riskReversal?: string[];
  primaryCta?: string;
  socialPlatforms?: string[];
  emailSequenceThemes?: string;
  objectionsHandling?: string;
  currentTools?: string[];
  additionalNotes?: string;
  // Linked to an auth user
  customerId?: string;
}

export interface GTMPlaybookSection {
  title: string;
  content: string;
  bullets?: string[];
}

export interface GTMPlaybookStep {
  step: number;
  action: string;
  owner: string;
  timeframe: string;
  channel: string;
  message: string;
}

export interface GTMPlaybook {
  trackingId: string;
  customerId: string | null;
  productName: string;
  companyName: string;
  generatedAt: string;
  status: "generating" | "ready" | "error";

  // Core sections
  executiveSummary: string;
  icpProfile: {
    description: string;
    industries: string[];
    companySizes: string[];
    decisionMakers: string[];
    buyingTriggers: string[];
    painPoints: string[];
  };
  marketAnalysis: {
    targetRegion: string;
    segments: string[];
    competitiveAdvantage: string;
    marketOpportunity: string;
  };
  channelStrategy: {
    priorityChannels: string[];
    messagingFramework: string;
    hooks: string[];
    cta: string;
  };
  launchTimeline: {
    phase1: GTMPlaybookSection;
    phase2: GTMPlaybookSection;
    phase3: GTMPlaybookSection;
    launchDate: string;
  };
  salesEnablement: {
    objectionsAndRebuttals: Array<{ objection: string; rebuttal: string }>;
    emailSequenceThemes: string[];
    callScript: string;
  };
  riskAssessment: Array<{
    risk: string;
    likelihood: "low" | "medium" | "high";
    mitigation: string;
  }>;
  kpis: string[];
  playbookSteps: GTMPlaybookStep[];
  confidence: number;
  rawLLMOutput?: string;   // stored for debugging, not shown in UI by default
}

// ─── Prompt Construction ──────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are an elite Go-to-Market strategist and revenue consultant with 20+ years of B2B SaaS experience. You specialize in building data-driven GTM playbooks that accelerate pipeline and revenue.

Your task is to generate a comprehensive, actionable GTM Analysis & Playbook in strict JSON format based on intake form data provided by the user.

CRITICAL RULES:
1. Respond ONLY with valid, parseable JSON — no markdown, no backticks, no explanations outside the JSON
2. All string fields must be substantive and specific to the company/product described — never generic
3. Provide actionable, specific recommendations — not vague platitudes
4. Base insights on the data provided; where data is missing, make reasonable industry-standard assumptions
5. The playbook steps must be sequential, specific, and immediately actionable`;
}

function buildUserPrompt(intake: GTMIntakeData): string {
  return `Generate a full GTM Analysis & Playbook for this company. Return ONLY valid JSON matching the exact schema below.

INTAKE DATA:
- Company: ${intake.companyName}
- Website: ${intake.websiteUrl || "Not provided"}
- Product: ${intake.productName}
- Product Owner: ${intake.productOwnerName} (${intake.productOwnerEmail})
- Target Launch Date: ${intake.targetLaunchDate || "TBD"}
- Target Market Region: ${intake.targetMarketRegion || "Global"}
- Primary Use Case: ${intake.primaryUseCase || "Not specified"}
- Marketing Budget: $${intake.marketingBudgetAllocation?.toLocaleString() || "Not specified"}
- Stakeholders: ${intake.stakeholders?.join(", ") || "Not specified"}
- ICP Description: ${intake.icpDescription || "Not specified"}
- Target Industries: ${intake.targetIndustries?.join(", ") || "Not specified"}
- Target Company Sizes: ${intake.targetCompanySizes?.join(", ") || "Not specified"}
- Decision Makers: ${intake.decisionMakers?.join(", ") || "Not specified"}
- Buying Triggers: ${intake.buyingTriggers?.join(", ") || "Not specified"}
- Pain Point: ${intake.painPoint || "Not specified"}
- Offer/Promise: ${intake.offerPromise || "Not specified"}
- Irresistible Hook: ${intake.irresistibleHook || "Not specified"}
- Risk Reversal: ${intake.riskReversal?.join(", ") || "Not specified"}
- Primary CTA: ${intake.primaryCta || "Not specified"}
- Social Platforms: ${intake.socialPlatforms?.join(", ") || "Not specified"}
- Email Sequence Themes: ${intake.emailSequenceThemes || "Not specified"}
- Objection Handling Notes: ${intake.objectionsHandling || "Not specified"}
- Current Tools: ${intake.currentTools?.join(", ") || "Not specified"}
- Additional Notes: ${intake.additionalNotes || "None"}

REQUIRED JSON SCHEMA (return ONLY this, no extra fields outside the schema):
{
  "executiveSummary": "3-4 sentence strategic overview specific to this company and product",
  "icpProfile": {
    "description": "Detailed ICP narrative",
    "industries": ["industry1", "industry2"],
    "companySizes": ["10-50", "50-200"],
    "decisionMakers": ["CTO", "VP Sales"],
    "buyingTriggers": ["trigger1", "trigger2"],
    "painPoints": ["pain1", "pain2", "pain3"]
  },
  "marketAnalysis": {
    "targetRegion": "Region name",
    "segments": ["segment1", "segment2", "segment3"],
    "competitiveAdvantage": "Specific competitive differentiation for this product",
    "marketOpportunity": "Specific market size/opportunity statement"
  },
  "channelStrategy": {
    "priorityChannels": ["LinkedIn Outbound", "Cold Email", "Content Marketing"],
    "messagingFramework": "Core value prop messaging framework 2-3 sentences",
    "hooks": ["Hook line 1", "Hook line 2", "Hook line 3"],
    "cta": "Primary call to action"
  },
  "launchTimeline": {
    "phase1": {
      "title": "Phase 1: Foundation (Weeks 1-4)",
      "content": "What happens in this phase",
      "bullets": ["activity1", "activity2", "activity3"]
    },
    "phase2": {
      "title": "Phase 2: Activation (Weeks 5-8)",
      "content": "What happens in this phase",
      "bullets": ["activity1", "activity2", "activity3"]
    },
    "phase3": {
      "title": "Phase 3: Scale (Weeks 9-12)",
      "content": "What happens in this phase",
      "bullets": ["activity1", "activity2", "activity3"]
    },
    "launchDate": "${intake.targetLaunchDate || "TBD"}"
  },
  "salesEnablement": {
    "objectionsAndRebuttals": [
      { "objection": "Specific objection 1", "rebuttal": "Specific rebuttal" },
      { "objection": "Specific objection 2", "rebuttal": "Specific rebuttal" },
      { "objection": "Specific objection 3", "rebuttal": "Specific rebuttal" }
    ],
    "emailSequenceThemes": ["theme1", "theme2", "theme3", "theme4", "theme5"],
    "callScript": "Opening line and key talking points for sales calls - 3-4 sentences"
  },
  "riskAssessment": [
    { "risk": "Specific risk 1", "likelihood": "medium", "mitigation": "Specific mitigation action" },
    { "risk": "Specific risk 2", "likelihood": "low", "mitigation": "Specific mitigation action" },
    { "risk": "Specific risk 3", "likelihood": "high", "mitigation": "Specific mitigation action" }
  ],
  "kpis": ["KPI 1", "KPI 2", "KPI 3", "KPI 4", "KPI 5"],
  "playbookSteps": [
    { "step": 1, "action": "Specific action", "owner": "Role", "timeframe": "Week 1", "channel": "LinkedIn", "message": "Exact outreach message template" },
    { "step": 2, "action": "Specific action", "owner": "Role", "timeframe": "Week 1", "channel": "Email", "message": "Exact outreach message template" },
    { "step": 3, "action": "Specific action", "owner": "Role", "timeframe": "Week 2", "channel": "Phone", "message": "Call script opening" },
    { "step": 4, "action": "Specific action", "owner": "Role", "timeframe": "Week 2", "channel": "Email", "message": "Follow-up template" },
    { "step": 5, "action": "Specific action", "owner": "Role", "timeframe": "Week 3", "channel": "LinkedIn", "message": "Connection message" },
    { "step": 6, "action": "Specific action", "owner": "Role", "timeframe": "Week 4", "channel": "Demo", "message": "Demo invite message" },
    { "step": 7, "action": "Specific action", "owner": "Role", "timeframe": "Week 5", "channel": "Content", "message": "Content distribution note" }
  ],
  "confidence": 82
}`;
}

// ─── Main Generator Function ──────────────────────────────────────────────────

/**
 * Generates a GTM playbook from intake data and persists it to Firestore.
 * This is called asynchronously after intake form submission.
 */
export async function generateAndPersistPlaybook(
  intake: GTMIntakeData
): Promise<GTMPlaybook> {
  const trackingId = intake.id;
  const customerId = intake.customerId || null;

  logger.info(`[gtm-playbook-generator] Starting playbook generation for ${trackingId}`);

  // Write a "generating" placeholder immediately so portals can show a loading state
  const placeholder: GTMPlaybook = {
    trackingId,
    customerId,
    productName: intake.productName,
    companyName: intake.companyName,
    generatedAt: new Date().toISOString(),
    status: "generating",
    executiveSummary: "",
    icpProfile: { description: "", industries: [], companySizes: [], decisionMakers: [], buyingTriggers: [], painPoints: [] },
    marketAnalysis: { targetRegion: "", segments: [], competitiveAdvantage: "", marketOpportunity: "" },
    channelStrategy: { priorityChannels: [], messagingFramework: "", hooks: [], cta: "" },
    launchTimeline: {
      phase1: { title: "", content: "", bullets: [] },
      phase2: { title: "", content: "", bullets: [] },
      phase3: { title: "", content: "", bullets: [] },
      launchDate: intake.targetLaunchDate || "TBD",
    },
    salesEnablement: { objectionsAndRebuttals: [], emailSequenceThemes: [], callScript: "" },
    riskAssessment: [],
    kpis: [],
    playbookSteps: [],
    confidence: 0,
  };

  if (db) {
    await db.collection("gtm_playbooks").doc(trackingId).set(placeholder);
  }

  try {
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(intake);

    // Use the AI provider router — tries Kimi first, falls back through chain
    const rawJSON = await performDynamicInferenceJSON(
      userPrompt,
      systemPrompt,
      { requestType: "analysis" }
    );

    const playbook: GTMPlaybook = {
      trackingId,
      customerId,
      productName: intake.productName,
      companyName: intake.companyName,
      generatedAt: new Date().toISOString(),
      status: "ready",
      executiveSummary: rawJSON.executiveSummary || "",
      icpProfile: rawJSON.icpProfile || placeholder.icpProfile,
      marketAnalysis: rawJSON.marketAnalysis || placeholder.marketAnalysis,
      channelStrategy: rawJSON.channelStrategy || placeholder.channelStrategy,
      launchTimeline: rawJSON.launchTimeline || placeholder.launchTimeline,
      salesEnablement: rawJSON.salesEnablement || placeholder.salesEnablement,
      riskAssessment: rawJSON.riskAssessment || [],
      kpis: rawJSON.kpis || [],
      playbookSteps: rawJSON.playbookSteps || [],
      confidence: rawJSON.confidence || 75,
    };

    if (db) {
      await db.collection("gtm_playbooks").doc(trackingId).set(playbook);
      // Also update the intake record with a reference back
      await db.collection("gtm_intakes").doc(trackingId).update({
        playbookStatus: "ready",
        playbookGeneratedAt: playbook.generatedAt,
      }).catch(() => {}); // non-critical
    }

    logger.info(`[gtm-playbook-generator] ✓ Playbook generated for ${trackingId} (confidence: ${playbook.confidence}%)`);
    return playbook;

  } catch (error) {
    logger.error(`[gtm-playbook-generator] ✗ Failed to generate playbook for ${trackingId}:`, error);

    // Fall back to a deterministic, structured playbook so the user always gets something
    const fallback = buildFallbackPlaybook(intake, trackingId, customerId);

    if (db) {
      await db.collection("gtm_playbooks").doc(trackingId).set(fallback);
    }

    return fallback;
  }
}

// ─── Fallback Playbook (Rule-Based) ──────────────────────────────────────────

function buildFallbackPlaybook(
  intake: GTMIntakeData,
  trackingId: string,
  customerId: string | null
): GTMPlaybook {
  const region = intake.targetMarketRegion || "Global";
  const budget = intake.marketingBudgetAllocation || 10000;
  const channels = budget > 50000
    ? ["LinkedIn Ads", "Google Ads", "Cold Email Sequences", "Content Marketing", "SDR Outbound"]
    : budget > 10000
    ? ["Cold Email", "LinkedIn Outbound", "Content Marketing", "Webinars"]
    : ["Content Marketing", "Social Media", "Community Building", "SEO"];

  return {
    trackingId,
    customerId,
    productName: intake.productName,
    companyName: intake.companyName,
    generatedAt: new Date().toISOString(),
    status: "ready",
    confidence: 60,
    executiveSummary: `${intake.companyName} is launching ${intake.productName} targeting ${region}. Based on the submitted intake data, a structured go-to-market approach has been generated covering ICP targeting, channel strategy, and a 12-week activation timeline. The product's primary use case — ${intake.primaryUseCase || "as described"} — positions it well for the identified market segments. Execution of this playbook should be reviewed with the assigned agent.`,
    icpProfile: {
      description: intake.icpDescription || `Ideal customers for ${intake.productName} are organizations that experience ${intake.painPoint || "operational friction"} and are actively seeking solutions.`,
      industries: intake.targetIndustries || ["SaaS", "Technology", "Professional Services"],
      companySizes: intake.targetCompanySizes || ["11-50", "51-200", "201-500"],
      decisionMakers: intake.decisionMakers || ["CEO", "VP Sales", "Head of Marketing"],
      buyingTriggers: intake.buyingTriggers || ["Rapid growth", "Scaling challenges", "Competitive pressure"],
      painPoints: [intake.painPoint || "Operational inefficiency", "Manual processes slowing growth", "Inability to scale outreach"],
    },
    marketAnalysis: {
      targetRegion: region,
      segments: intake.targetIndustries?.slice(0, 3) || ["Mid-Market SaaS", "Enterprise Tech", "Professional Services"],
      competitiveAdvantage: intake.offerPromise || `${intake.productName} delivers measurable ROI faster than alternatives through automation and AI-driven insights.`,
      marketOpportunity: `The ${region} market for this category represents a significant growth opportunity. Focus on under-served segments where existing solutions are overpriced or underpowered.`,
    },
    channelStrategy: {
      priorityChannels: channels,
      messagingFramework: `Lead with ${intake.painPoint ? `the pain of "${intake.painPoint}"` : "measurable business outcomes"}. Bridge to ${intake.productName} as the solution. Close on ${intake.primaryCta || "a quick discovery call"}.`,
      hooks: [
        intake.irresistibleHook || `What if you could ${intake.offerPromise || "solve this problem"} in under 30 days?`,
        `Most ${intake.targetCompanySizes?.[0] || "mid-market"} companies are still doing this manually — here's a better way.`,
        `Join ${intake.companyName}'s early access program and get results before your competition does.`,
      ],
      cta: intake.primaryCta || "Book a 15-minute discovery call",
    },
    launchTimeline: {
      launchDate: intake.targetLaunchDate || "TBD",
      phase1: {
        title: "Phase 1: Foundation (Weeks 1-4)",
        content: "Build the infrastructure for outreach, align the team, and prepare all assets.",
        bullets: [
          "Finalize ICP list and build initial prospect database (target: 500 qualified contacts)",
          "Set up CRM sequences and email infrastructure with domain warming",
          "Produce core content: landing page, one-pager, demo video",
          `Train ${intake.stakeholders?.[0] || "sales team"} on product positioning and objection handling`,
        ],
      },
      phase2: {
        title: "Phase 2: Activation (Weeks 5-8)",
        content: "Launch outbound sequences, activate paid channels, and begin generating pipeline.",
        bullets: [
          "Launch first cold email sequence (target: 15% open rate, 3% reply rate)",
          "Activate LinkedIn outbound — 50 personalized connection requests/week per SDR",
          `Start paid campaigns on ${channels[0] || "LinkedIn"} with ${Math.round(budget * 0.3).toLocaleString()} budget`,
          "Run first webinar/demo day to generate top-of-funnel leads",
        ],
      },
      phase3: {
        title: "Phase 3: Scale (Weeks 9-12)",
        content: "Optimize what's working, double down on top channels, and close first customers.",
        bullets: [
          "Analyze channel performance — kill underperformers, 2× budget on winners",
          "Launch referral program for first customers",
          "Produce customer success story from early adopters",
          "Set up retargeting campaigns for website visitors",
        ],
      },
    },
    salesEnablement: {
      objectionsAndRebuttals: [
        {
          objection: "We already have a solution for this",
          rebuttal: `Most teams say that until they see how much time they lose to manual workarounds. ${intake.productName} integrates with your existing stack and typically delivers ROI within 60 days. Would you be open to a quick comparison?`,
        },
        {
          objection: "We don't have budget right now",
          rebuttal: `Completely fair. Most of our customers actually found the ROI justified the spend — they recovered the cost within the first quarter. What would make this a priority?`,
        },
        {
          objection: "We need to involve more stakeholders",
          rebuttal: `Absolutely, we'd expect that. We can set up a tailored demo for your full team and provide a business case template that's made it easy for other ${intake.targetCompanySizes?.[0] || "companies"} to get buy-in quickly.`,
        },
      ],
      emailSequenceThemes: intake.emailSequenceThemes?.split(",").map(t => t.trim()) || [
        "Pain-point hook + social proof",
        "ROI & business case",
        "Competitor comparison",
        "Customer success story",
        "Final call to action + risk reversal",
      ],
      callScript: `Open with: "Hi [Name], I'm reaching out because we work with [similar company] and helped them [outcome]. I wanted to see if ${intake.painPoint ? `the challenge of ${intake.painPoint}` : "a similar challenge"} is something your team is also dealing with." Spend 70% of the call listening. Close with: "${intake.primaryCta || "Can we set up a short demo for next week?"}"`,
    },
    riskAssessment: [
      { risk: "Low initial outreach response rates", likelihood: "medium", mitigation: "A/B test subject lines and personalization; iterate sequence cadence based on first 2 weeks of data" },
      { risk: "Budget overrun on paid channels before sufficient data", likelihood: "medium", mitigation: "Cap daily spends, run 2-week test cycles before scaling, track CAC weekly" },
      { risk: "Launch date slippage due to stakeholder alignment delays", likelihood: "low", mitigation: "Use the stakeholder RACI matrix; hold weekly cross-functional standups; set non-negotiable milestone dates" },
    ],
    kpis: intake.stakeholders?.includes("Marketing")
      ? ["MQLs Generated per Month", "Email Open Rate >15%", "LinkedIn Connection Rate >25%", "CAC < $500", "Pipeline Velocity (Days to First Demo)", "Demo-to-Close Rate"]
      : ["Pipeline Generated ($)", "Meetings Booked per Week", "Email Reply Rate", "CAC vs LTV Ratio", "Time to First Revenue"],
    playbookSteps: [
      { step: 1, action: "ICP List Build", owner: intake.stakeholders?.[0] || "Marketing", timeframe: "Week 1", channel: "Research", message: "Use Apollo/LinkedIn Sales Navigator to build 500-contact ICP list with verified emails and phone numbers" },
      { step: 2, action: "Launch Cold Email Sequence #1", owner: "SDR", timeframe: "Week 2", channel: "Email", message: `Subject: Quick question about ${intake.painPoint || "your pipeline"}\n\nHi {{first_name}}, noticed ${intake.companyName} is scaling fast. We help companies like yours ${intake.offerPromise || "solve this challenge"}.\n\nWorth a 15-min call? ${intake.primaryCta || "Book here: [link]"}` },
      { step: 3, action: "LinkedIn Connection Campaign", owner: "SDR", timeframe: "Week 2", channel: "LinkedIn", message: `Hi {{first_name}}, ${intake.irresistibleHook || "I'd love to connect — we're doing interesting work in your space."} Would be great to add you to my network.` },
      { step: 4, action: "Follow-up Email #2", owner: "SDR", timeframe: "Week 3", channel: "Email", message: "Subject: [Case Study] How [Similar Company] achieved [Result]\n\nHi {{first_name}}, sharing this brief case study — directly relevant to what you're working on. Happy to walk through it together. [Link]" },
      { step: 5, action: "Phone Outreach", owner: "AE", timeframe: "Week 3", channel: "Phone", message: `Intro: "Hi {{first_name}}, this is [Name] from ${intake.companyName}. I sent you an email last week about ${intake.productName}. Do you have 2 minutes?" Goal: book demo.` },
      { step: 6, action: "Discovery Call / Demo", owner: "AE", timeframe: "Week 4", channel: "Video Call", message: "Run 30-min demo. Focus 50% on their pain, 50% on our solution. Send follow-up summary + proposal within 24 hours." },
      { step: 7, action: "Content Amplification", owner: intake.stakeholders?.includes("Marketing") ? "Marketing" : "Founder", timeframe: "Week 4-6", channel: "LinkedIn / Blog", message: "Publish thought leadership content aligned to ICP pain points. Repurpose demo recording into short clips for LinkedIn." },
    ],
  };
}
