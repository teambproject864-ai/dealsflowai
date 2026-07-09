import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { z } from "zod";
import { performDynamicInferenceJSON } from "@/lib/ai-provider-router";
import * as cheerio from "cheerio";

// Zod schemas for tables
const Table1FirmographicEntry = z.object({
  priorityTier: z.string(),
  industryVertical: z.string(),
  companySize: z.string(),
  arrRange: z.string(),
  location: z.string(),
  keyDecisionMakerDemographics: z.string(),
  notes: z.string(),
});

const Table2PainPointEntry = z.object({
  painPoint: z.string(),
  severity: z.string(),
  businessImpact: z.string(),
  rootCause: z.string(),
  dealFlowAISolution: z.string(),
});

const Table3DecisionMakerEntry = z.object({
  role: z.string(),
  influenceScore: z.string(),
  coreDecisionRole: z.string(),
  top3Priorities: z.string(),
  dealFlowAIMessagingFocus: z.string(),
});

const Table4LeadScoringEntry = z.object({
  category: z.string(),
  criterion: z.string(),
  points: z.string(),
});

const Table5ChannelEntry = z.object({
  channel: z.string(),
  icpSegmentsBestFor: z.string(),
  monthlyLeadVolume: z.string(),
  conversionRate: z.string(),
  costPerAcquisition: z.string(),
  ltvToCacRatio: z.string(),
  budgetAllocation: z.string(),
  optimizationRecommendations: z.string(),
});

export const AnalysisState = Annotation.Root({
  companyData: Annotation<any>(),
  websiteContent: Annotation<string>(),
  analysisResult: Annotation<any>(),
  error: Annotation<string>(),
});

async function scrapeWebsiteNode(state: typeof AnalysisState.State) {
  const scrapeStartTime = Date.now();
  try {
    console.log("[analysisGraph] Starting website scraping...");
    const url = state.companyData?.websiteUrl;
    if (!url) {
      console.log("[analysisGraph] No website provided, skipping scrape");
      return { websiteContent: "No website provided." };
    }

    let fullUrl = url.startsWith("http") ? url : `https://${url}`;

    // Try with https first, then http if that fails
    let response: Response | undefined;
    let lastError: Error | undefined;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for scraping

    try {
      response = await fetch(fullUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5"
        },
        signal: controller.signal,
      });
    } catch (error) {
      lastError = error as Error;
      // If https failed and we didn't start with http, try http
      if (fullUrl.startsWith("https://")) {
        fullUrl = fullUrl.replace("https://", "http://");
        console.log(`[analysisGraph] HTTPS failed, trying HTTP: ${fullUrl}`);
        try {
          const httpController = new AbortController();
          const httpTimeoutId = setTimeout(() => httpController.abort(), 15000);
          response = await fetch(fullUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            signal: httpController.signal,
          });
          clearTimeout(httpTimeoutId);
        } catch (httpError) {
          lastError = httpError as Error;
        }
      }
    }
    clearTimeout(timeoutId);

    if (!response || !response.ok) {
      const status = response?.status || "unknown";
      const statusText = response?.statusText || lastError?.message || "Unknown error";
      const errorMsg = `Failed to scrape website: HTTP ${status} - ${statusText}`;
      console.warn(`[analysisGraph] ${errorMsg}`);
      return { websiteContent: errorMsg };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Only keep relevant content
    $("script, style, noscript, iframe, img, svg, header, footer, nav, aside").remove();

    // Extract text from main content areas
    const selectors = ["main", "article", "section", "div[role='main']", "#content", ".content", "body"];
    let text = "";
    for (const selector of selectors) {
      const el = $(selector).first();
      if (el.length > 0) {
        text = el.text();
        break;
      }
    }
    
    // Fallback to body if no main content found
    if (!text) {
      text = $("body").text();
    }
    
    // Clean up whitespace
    text = text.replace(/\s+/g, " ").trim();

    // Truncate to a reasonable length
    const MAX_CONTENT_LENGTH = 6000;
    const truncatedText = text.length > MAX_CONTENT_LENGTH ? text.substring(0, MAX_CONTENT_LENGTH) + " [content truncated]" : text;

    console.log(`[analysisGraph] Scraping complete. Extracted ${truncatedText.length} characters in ${Date.now() - scrapeStartTime}ms`);
    return { websiteContent: truncatedText };
  } catch (error) {
    console.error("[analysisGraph] Scraping error:", error);
    return {
      websiteContent: `Failed to scrape website: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// Define individual section tasks
interface SectionTask {
  id: string;
  schema: z.ZodType<any>;
  systemPrompt: string;
  userPrompt: (ctx: any) => string;
}

function formatCompanyIntakeData(companyData: any): string {
  if (!companyData) return "No intake form data provided.";
  
  const parts: string[] = [];
  
  const addField = (label: string, value: any) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      if (value.length === 0) return;
      parts.push(`${label}: ${value.join(", ")}`);
    } else if (typeof value === "string") {
      if (value.trim() === "") return;
      parts.push(`${label}: ${value.trim()}`);
    } else {
      parts.push(`${label}: ${value}`);
    }
  };

  // Contact Info
  addField("Company Name", companyData.companyName);
  addField("Website URL", companyData.websiteUrl || companyData.website);
  addField("Contact Name", companyData.name || companyData.contactName);
  addField("Primary Email", companyData.emailPersonal || companyData.contactEmail);
  addField("Job Title", companyData.jobTitle);
  if (companyData.headquartersCity || companyData.headquartersCountry) {
    addField("Headquarters", `${companyData.headquartersCity || ""}, ${companyData.headquartersCountry || ""}`.trim().replace(/^,|,$/, ""));
  }
  
  // Overview & Offer
  addField("Company Description", companyData.companyDescription);
  addField("Products/Services Offered", companyData.productsServices);
  addField("Primary Outcome", companyData.primaryOutcome);
  addField("Key Challenges", companyData.keyChallenges);
  addField("Unique Value Proposition", companyData.uniqueValueProp);
  
  // Proof & Credibility
  addField("Success Stories", companyData.successStories);
  addField("Customer Testimonials", companyData.customerTestimonials);
  addField("Credibility Factors", companyData.credibilityFactors);
  addField("Certifications", companyData.certifications);
  addField("Other Certifications", companyData.certificationsOther);
  
  // Brand Presence
  addField("Brand Presence Channels", companyData.brandChannels);
  addField("Other Brand Channels", companyData.brandChannelsOther);
  addField("Content Types Published", companyData.contentTypes);
  addField("Other Content Types", companyData.contentTypesOther);
  addField("Publishing Frequency", companyData.publishingFrequency);
  addField("Content and Posting Details", companyData.contentAndPosting);
  
  // Offer Structure
  addField("Offer Promise", companyData.offerPromise);
  addField("Target Pain Point", companyData.painPoint);
  addField("Risk Reductions/Reversals", companyData.riskReductions || companyData.riskReversal);
  addField("Other Risk Reductions", companyData.riskReductionsOther || companyData.riskReversalOther);
  addField("Time to Value", companyData.timeToValue || companyData.timeToStart);
  addField("Primary CTA", companyData.primaryCta);
  addField("Other CTA", companyData.primaryCtaOther);
  addField("Available Outreach Assets", companyData.outreachAssets || companyData.minimumAsset);
  addField("Other Outreach Assets", companyData.outreachAssetsOther || companyData.minimumAssetOther);
  addField("Gift Card Offer", companyData.giftCardOffer || companyData.giftCard);
  
  // Ideal Customer Profile (ICP)
  addField("ICP Description", companyData.icpDescription);
  addField("Target Industries", companyData.targetIndustries);
  addField("Other Target Industries", companyData.targetIndustriesOther);
  addField("Target Company Sizes", companyData.targetCompanySizes);
  addField("Target Revenues", companyData.targetRevenues);
  addField("Target Geographic Markets", companyData.targetGeographics || companyData.targetRegions);
  addField("Target Geographic Regions", companyData.targetGeographicRegionsText);
  addField("Preferred Languages", companyData.preferredLanguages);
  addField("Do Not Target", companyData.doNotTarget);
  
  // Decision Makers & Buying Committee
  addField("Buying Committee Roles", companyData.buyingRoles || companyData.decisionMakers);
  addField("Other Buying Roles", companyData.buyingRolesOther || companyData.decisionMakersOther);
  addField("Budget Holding Departments", companyData.budgetDepartments);
  addField("Target Seniorities", companyData.targetSeniorities);
  
  // Buying Signals & Market Intelligence
  addField("Buying Signals/Triggers", companyData.buyingSignals || companyData.keyBuyingTriggers || companyData.buyingTriggers);
  addField("Other Buying Signals", companyData.buyingSignalsOther || companyData.keyBuyingTriggersOther || companyData.buyingTriggersOther);
  addField("Prospect Tech Stack/Technologies", companyData.prospectTechnologies || companyData.currentTools);
  
  // Sales & Marketing Tech Stack
  addField("CRM Systems", companyData.crmSystems);
  addField("Other CRM Systems", companyData.crmSystemsOther);
  addField("Outreach Tools", companyData.outreachTools);
  addField("Other Outreach Tools", companyData.outreachToolsOther);
  addField("Marketing Automation Tools", companyData.marketingAutomationTools);
  addField("Other Marketing Automation", companyData.marketingAutomationToolsOther);
  
  // Messaging & Strategy
  addField("Common Objections", companyData.commonObjections || companyData.objectionsHandling);
  addField("How We Overcome Objections", companyData.overcomeObjections);
  addField("Messaging Themes", companyData.messagingThemes);
  addField("Cold Email Sequence Themes", companyData.coldEmailSequence || companyData.emailSequenceThemes);
  addField("Additional Notes", companyData.additionalNotes);
  
  return parts.join("\n");
}

const SECTION_TASKS: SectionTask[] = [
  {
    id: "executiveSummary",
    schema: z.unknown().transform((val) => {
      if (typeof val === "string") return val;
      if (val && typeof val === "object") {
        const obj = val as any;
        if (typeof obj.executiveSummary === "string") return obj.executiveSummary;
        if (typeof obj.summary === "string") return obj.summary;
        if (typeof obj.text === "string") return obj.text;
        for (const key of Object.keys(obj)) {
          if (typeof obj[key] === "string") {
            return obj[key];
          }
        }
        return JSON.stringify(val);
      }
      return String(val);
    }),
    systemPrompt: "You are DealFlow AI's senior GTM strategist, an expert in B2B SaaS GTM analysis. Generate a concise, high-quality executive summary tailored to the provided company.",
    userPrompt: (ctx) => `
Company Name: ${ctx.companyName}
Website URL: ${ctx.websiteUrl}

=== INTAKE FORM DATA ===
${ctx.intakeData}

${ctx.feedback ? `=== USER FEEDBACK TO INCORPORATE ===\n${ctx.feedback}\n\nIMPORTANT: Modify the analysis according to this feedback.` : ""}

Generate a concise, DealFlow AI-specific executive summary (~150 words) based on the company-specific info and intake data provided above. If the intake data is sparse or missing details, use your general knowledge of the company to infer reasonable details. Incorporate user feedback if specified. Format strictly as a valid JSON string.`
  },
  {
    id: "icpDefinition",
    schema: z.object({ inclusionCriteria: z.array(z.string()), exclusionCriteria: z.array(z.string()) }),
    systemPrompt: "You are DealFlow AI's senior GTM strategist, an expert in B2B SaaS GTM analysis. Generate ICP (Ideal Customer Profile) criteria for the provided company.",
    userPrompt: (ctx) => `
Company Name: ${ctx.companyName}
Website URL: ${ctx.websiteUrl}

=== INTAKE FORM DATA ===
${ctx.intakeData}

${ctx.feedback ? `=== USER FEEDBACK TO INCORPORATE ===\n${ctx.feedback}\n\nIMPORTANT: Modify the analysis according to this feedback.` : ""}

Generate ICP definition with inclusion and exclusion criteria based on the company-specific info and intake data provided above. If the intake data is sparse or missing details, use your general knowledge of the company to infer reasonable criteria. Incorporate user feedback if specified. Format strictly as valid JSON.`
  },
  {
    id: "table1FirmographicDemographic",
    schema: z.array(Table1FirmographicEntry),
    systemPrompt: "You are DealFlow AI's senior GTM strategist, an expert in B2B SaaS GTM analysis. Generate firmographic and demographic segmentation data.",
    userPrompt: (ctx) => `
Company Name: ${ctx.companyName}
Website URL: ${ctx.websiteUrl}

=== INTAKE FORM DATA ===
${ctx.intakeData}

${ctx.feedback ? `=== USER FEEDBACK TO INCORPORATE ===\n${ctx.feedback}\n\nIMPORTANT: Modify the analysis according to this feedback.` : ""}

Generate firmographic/demographic table (array of objects matching Table1FirmographicEntry) based on the company-specific info and intake data provided above. You MUST fill out all fields in the Table1FirmographicEntry schema (priorityTier, industryVertical, companySize, arrRange, location, keyDecisionMakerDemographics, notes). 
Important: All values in the object must be flat strings. For example, "keyDecisionMakerDemographics" must be a single flat descriptive string (e.g., "Mid-to-senior level decision makers in IT and operations"), NOT a nested JSON object or array. 
If the intake data is sparse or missing details, use your general knowledge of the company to infer reasonable values for these fields. Incorporate user feedback if specified. Format strictly as valid JSON.`
  },
  {
    id: "behavioralPsychographicTraits",
    schema: z.object({
      observableBehavioralPatterns: z.array(z.string()),
      corePsychographicAttributes: z.array(z.string())
    }),
    systemPrompt: "You are DealFlow AI's senior GTM strategist, an expert in B2B SaaS GTM analysis. Generate behavioral and psychographic traits.",
    userPrompt: (ctx) => `
Company Name: ${ctx.companyName}
Website URL: ${ctx.websiteUrl}

=== INTAKE FORM DATA ===
${ctx.intakeData}

${ctx.feedback ? `=== USER FEEDBACK TO INCORPORATE ===\n${ctx.feedback}\n\nIMPORTANT: Modify the analysis according to this feedback.` : ""}

Generate behavioral and psychographic traits based on the company-specific info and intake data provided above. If the intake data is sparse or missing details, use your general knowledge of the company to infer reasonable traits. Incorporate user feedback if specified. Format strictly as valid JSON.`
  },
  {
    id: "table2PainPointAnalysis",
    schema: z.array(Table2PainPointEntry),
    systemPrompt: "You are DealFlow AI's senior GTM strategist, an expert in B2B SaaS GTM analysis. Generate pain point analysis.",
    userPrompt: (ctx) => `
Company Name: ${ctx.companyName}
Website URL: ${ctx.websiteUrl}

=== INTAKE FORM DATA ===
${ctx.intakeData}

${ctx.feedback ? `=== USER FEEDBACK TO INCORPORATE ===\n${ctx.feedback}\n\nIMPORTANT: Modify the analysis according to this feedback.` : ""}

Generate pain point analysis table (array of objects matching Table2PainPointEntry) based on the company-specific info and intake data provided above. You MUST fill out all fields in the Table2PainPointEntry schema (painPoint, severity, businessImpact, rootCause, dealFlowAISolution). If the intake data is sparse or missing details, use your general knowledge of the company to infer reasonable pain points and solutions. Incorporate user feedback if specified. Format strictly as valid JSON.`
  },
  {
    id: "table3DecisionMakerInfluence",
    schema: z.array(Table3DecisionMakerEntry),
    systemPrompt: "You are DealFlow AI's senior GTM strategist, an expert in B2B SaaS GTM analysis. Generate decision-maker influence data.",
    userPrompt: (ctx) => `
Company Name: ${ctx.companyName}
Website URL: ${ctx.websiteUrl}

=== INTAKE FORM DATA ===
${ctx.intakeData}

${ctx.feedback ? `=== USER FEEDBACK TO INCORPORATE ===\n${ctx.feedback}\n\nIMPORTANT: Modify the analysis according to this feedback.` : ""}

Generate decision-maker influence table (array of objects matching Table3DecisionMakerEntry) based on the company-specific info and intake data provided above. You MUST fill out all fields in the Table3DecisionMakerEntry schema (role, influenceScore, coreDecisionRole, top3Priorities, dealFlowAIMessagingFocus). If the intake data is sparse or missing details, use your general knowledge of the company to infer reasonable decision maker profiles. Incorporate user feedback if specified. Format strictly as valid JSON.`
  },
  {
    id: "purchasingJourneyMapping",
    schema: z.array(z.object({
      stage: z.string(),
      duration: z.string(),
      customerActions: z.string(),
      customerNeedsQuestions: z.string(),
      channelPreferences: z.string(),
      dealFlowAIAssetsEngagement: z.string()
    })),
    systemPrompt: "You are DealFlow AI's senior GTM strategist, an expert in B2B SaaS GTM analysis. Generate purchasing journey mapping.",
    userPrompt: (ctx) => `
Company Name: ${ctx.companyName}
Website URL: ${ctx.websiteUrl}

=== INTAKE FORM DATA ===
${ctx.intakeData}

${ctx.feedback ? `=== USER FEEDBACK TO INCORPORATE ===\n${ctx.feedback}\n\nIMPORTANT: Modify the analysis according to this feedback.` : ""}

Generate purchasing journey mapping (array of objects) based on the company-specific info and intake data provided above. If the intake data is sparse or missing details, use your general knowledge of the company to infer a reasonable journey mapping. Incorporate user feedback if specified. Format strictly as valid JSON.`
  },
  {
    id: "table4LeadScoringFramework",
    schema: z.object({
      criteria: z.array(Table4LeadScoringEntry),
      qualificationThresholds: z.object({
        mql: z.string(),
        sql: z.string(),
        sal: z.string()
      })
    }),
    systemPrompt: "You are DealFlow AI's senior GTM strategist, an expert in B2B SaaS GTM analysis. Generate lead scoring framework.",
    userPrompt: (ctx) => `
Company Name: ${ctx.companyName}
Website URL: ${ctx.websiteUrl}

=== INTAKE FORM DATA ===
${ctx.intakeData}

${ctx.feedback ? `=== USER FEEDBACK TO INCORPORATE ===\n${ctx.feedback}\n\nIMPORTANT: Modify the analysis according to this feedback.` : ""}

Generate lead scoring framework based on the company-specific info and intake data provided above. If the intake data is sparse or missing details, use your general knowledge of the company to infer a reasonable scoring framework. Incorporate user feedback if specified. Format strictly as valid JSON.`
  },
  {
    id: "table5ChannelEffectiveness",
    schema: z.array(Table5ChannelEntry),
    systemPrompt: "You are DealFlow AI's senior GTM strategist, an expert in B2B SaaS GTM analysis. Generate channel effectiveness analysis.",
    userPrompt: (ctx) => `
Company Name: ${ctx.companyName}
Website URL: ${ctx.websiteUrl}

=== INTAKE FORM DATA ===
${ctx.intakeData}

${ctx.feedback ? `=== USER FEEDBACK TO INCORPORATE ===\n${ctx.feedback}\n\nIMPORTANT: Modify the analysis according to this feedback.` : ""}

Generate channel effectiveness table (array of objects matching Table5ChannelEntry) based on the company-specific info and intake data provided above. You MUST fill out all fields in the Table5ChannelEntry schema (channel, icpSegmentsBestFor, monthlyLeadVolume, conversionRate, costPerAcquisition, ltvToCacRatio, budgetAllocation, optimizationRecommendations). If the intake data is sparse or missing details, use your general knowledge of the company to infer reasonable values. Incorporate user feedback if specified. Format strictly as valid JSON.`
  },
  {
    id: "crossTeamAlignmentGuidelines",
    schema: z.object({
      raciFramework: z.array(z.any()),
      communicationCadenceSlas: z.array(z.any()),
      sharedSLAs: z.array(z.string())
    }),
    systemPrompt: "You are DealFlow AI's senior GTM strategist, an expert in B2B SaaS GTM analysis. Generate cross-team alignment guidelines.",
    userPrompt: (ctx) => `
Company Name: ${ctx.companyName}
Website URL: ${ctx.websiteUrl}

=== INTAKE FORM DATA ===
${ctx.intakeData}

${ctx.feedback ? `=== USER FEEDBACK TO INCORPORATE ===\n${ctx.feedback}\n\nIMPORTANT: Modify the analysis according to this feedback.` : ""}

Generate cross-team alignment guidelines based on the company-specific info and intake data provided above. If the intake data is sparse or missing details, use your general knowledge of the company to infer reasonable guidelines. Incorporate user feedback if specified. Format strictly as valid JSON.`
  },
  {
    id: "icpValidationChecklist",
    schema: z.object({
      preQualificationChecklist: z.array(z.string()),
      quarterlyValidationReview: z.array(z.string()),
      dataSourcesForValidation: z.array(z.string()),
      icpUpdateTriggers: z.array(z.string())
    }),
    systemPrompt: "You are DealFlow AI's senior GTM strategist, an expert in B2B SaaS GTM analysis. Generate ICP validation checklist.",
    userPrompt: (ctx) => `
Company Name: ${ctx.companyName}
Website URL: ${ctx.websiteUrl}

=== INTAKE FORM DATA ===
${ctx.intakeData}

${ctx.feedback ? `=== USER FEEDBACK TO INCORPORATE ===\n${ctx.feedback}\n\nIMPORTANT: Modify the analysis according to this feedback.` : ""}

Generate ICP validation checklist based on the company-specific info and intake data provided above. If the intake data is sparse or missing details, use your general knowledge of the company to infer a reasonable checklist. Incorporate user feedback if specified. Format strictly as valid JSON.`
  }
];

function getFallbackForSection(sectionId: string, companyName: string): any {
  switch (sectionId) {
    case "executiveSummary":
      return `Go-To-Market analysis and strategic execution plan for ${companyName}.`;
    case "icpDefinition":
      return {
        inclusionCriteria: ["B2B Tech companies", "Enterprise & Mid-Market segments", "Budget holder in Sales/Ops/Marketing"],
        exclusionCriteria: ["B2C companies", "Small businesses with < 10 employees", "Low digital maturity companies"]
      };
    case "table1FirmographicDemographic":
      return [
        {
          priorityTier: "Tier 1",
          industryVertical: "SaaS / B2B Technology",
          companySize: "100-1000 employees",
          arrRange: "$10M - $100M ARR",
          location: "North America & Europe",
          keyDecisionMakerDemographics: "VP of Sales, CRO, Head of RevOps",
          notes: "High budget availability, rapid decision-making cycle."
        }
      ];
    case "behavioralPsychographicTraits":
      return {
        observableBehavioralPatterns: ["Adopting modern RevOps tools", "Active on LinkedIn", "Increasing sales team headcount"],
        corePsychographicAttributes: ["Growth-oriented", "Technology early adopters", "Efficiency-driven"]
      };
    case "table2PainPointAnalysis":
      return [
        {
          painPoint: "High customer acquisition costs (CAC)",
          severity: "High",
          businessImpact: "Reduced profitability and slower growth",
          rootCause: "Inefficient manual sales outreach",
          dealFlowAISolution: "Automate outbound sequences using DealFlow AI SDR agents"
        }
      ];
    case "table3DecisionMakerInfluence":
      return [
        {
          role: "Chief Revenue Officer (CRO)",
          influenceScore: "9/10",
          coreDecisionRole: "Economic Buyer / Sign-off",
          top3Priorities: "Pipeline predictability, revenue growth, cost efficiency",
          dealFlowAIMessagingFocus: "Show cost savings and scale of automated lead generation"
        }
      ];
    case "purchasingJourneyMapping":
      return [
        {
          stage: "Awareness",
          duration: "2-4 weeks",
          customerActions: "Researching automated sales outreach tools",
          customerNeedsQuestions: "How can we scale our outbound without adding headcount?",
          channelPreferences: "LinkedIn, Search, Tech Blogs",
          dealFlowAIAssetsEngagement: "Introductory demo video & ICP report"
        }
      ];
    case "table4LeadScoringFramework":
      return {
        criteria: [
          { category: "Firmographics", criterion: "Target industry & > 100 employees", points: "25" },
          { category: "Behavioral", criterion: "Visits pricing page or downloads whitepaper", points: "20" }
        ],
        qualificationThresholds: {
          mql: "Score >= 30",
          sql: "Score >= 50",
          sal: "Score >= 70"
        }
      };
    case "table5ChannelEffectiveness":
      return [
        {
          channel: "LinkedIn Sales Navigator + InMail",
          icpSegmentsBestFor: "Tier 1 Enterprise",
          monthlyLeadVolume: "15-20 qualified leads",
          conversionRate: "4.5%",
          costPerAcquisition: "$450",
          ltvToCacRatio: "6:1",
          budgetAllocation: "40%",
          optimizationRecommendations: "Use hyper-personalized voice notes and video intros"
        }
      ];
    case "crossTeamAlignmentGuidelines":
      return {
        raciFramework: [
          { role: "SDR Team", action: "Outreach & Booking", level: "Responsible" },
          { role: "Account Executive", action: "Demo & Closing", level: "Accountable" }
        ],
        communicationCadenceSlas: [
          { event: "New lead booked", timing: "Sync to CRM within 5 minutes" },
          { event: "Post-demo update", timing: "Update opportunity stage within 24 hours" }
        ],
        sharedSLAs: [
          "SDR to AE handoff notes must contain ICP validation checklist",
          "All inbound leads followed up within 15 minutes"
        ]
      };
    case "icpValidationChecklist":
      return {
        preQualificationChecklist: [
          "Confirm target company size aligns with Tier 1/2 criteria",
          "Identify at least 2 stakeholders in the buying committee"
        ],
        quarterlyValidationReview: [
          "Compare closed-won deal attributes against current ICP profile",
          "Interview AEs on lead quality and conversion feedback"
        ],
        dataSourcesForValidation: [
          "CRM closed-won data",
          "LinkedIn Sales Navigator",
          "Clearbit / Apollo data enrichment"
        ],
        icpUpdateTriggers: [
          "AE win rate for a specific segment drops below 15%",
          "Launch of a new product module targeting a different vertical"
        ]
      };
    default:
      return {};
  }
}

async function analyzeCompany(state: typeof AnalysisState.State) {
  const analyzeStartTime = Date.now();
  try {
    console.log("[analysisGraph] Starting AI GTM analysis (parallel processing)...");
    const companyName = state.companyData?.companyName || "Unknown Company";
    const websiteUrl = state.companyData?.websiteUrl || "";
    const additionalLeadDetails = state.companyData?.additionalDetails || "";
    const websiteContent = state.websiteContent;
    const analysisId = state.companyData?.analysisId || undefined; // Pass analysisId if available
    const intakeData = formatCompanyIntakeData(state.companyData);
    const feedback = state.companyData?.feedback || "";

    const ctx = { companyName, websiteUrl, additionalLeadDetails, websiteContent, intakeData, feedback };

    // Process all sections in parallel using Promise.all
    const sectionPromises = SECTION_TASKS.map(async (task) => {
      try {
        const jsonSystemPrompt = `${task.systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON, NO EXPLANATIONS, NO MARKDOWN, NO TEXT OUTSIDE OF JSON. Ensure no trailing commas.`;
        const rawResult = await performDynamicInferenceJSON(task.userPrompt(ctx), jsonSystemPrompt, { requestType: analysisId ? `gtm-analysis-${analysisId}` : "gtm-analysis" });
        const validated = task.schema.parse(rawResult);
        console.log(`[analysisGraph] Successfully processed section: ${task.id}`);
        return { [task.id]: validated };
      } catch (error) {
        console.error(`[analysisGraph] Failed to process section ${task.id}:`, error);
        console.warn(`[analysisGraph] Falling back to pre-defined strategic data for section: ${task.id}`);
        const fallback = getFallbackForSection(task.id, companyName);
        try {
          const validated = task.schema.parse(fallback);
          return { [task.id]: validated };
        } catch (valError) {
          console.error(`[analysisGraph] Critical: Fallback failed validation for ${task.id}:`, valError);
          throw valError;
        }
      }
    });

    const sectionResults = await Promise.all(sectionPromises);
    const combinedResults: any = Object.assign({}, ...sectionResults);

    // Validate the final combined result
    const finalSchema = z.object({
      executiveSummary: z.string(),
      icpDefinition: z.object({
        inclusionCriteria: z.array(z.string()),
        exclusionCriteria: z.array(z.string()),
      }),
      table1FirmographicDemographic: z.array(Table1FirmographicEntry),
      behavioralPsychographicTraits: z.object({
        observableBehavioralPatterns: z.array(z.string()),
        corePsychographicAttributes: z.array(z.string()),
      }),
      table2PainPointAnalysis: z.array(Table2PainPointEntry),
      table3DecisionMakerInfluence: z.array(Table3DecisionMakerEntry),
      purchasingJourneyMapping: z.array(z.object({
        stage: z.string(),
        duration: z.string(),
        customerActions: z.string(),
        customerNeedsQuestions: z.string(),
        channelPreferences: z.string(),
        dealFlowAIAssetsEngagement: z.string(),
      })),
      table4LeadScoringFramework: z.object({
        criteria: z.array(Table4LeadScoringEntry),
        qualificationThresholds: z.object({
          mql: z.string(),
          sql: z.string(),
          sal: z.string(),
        }),
      }),
      table5ChannelEffectiveness: z.array(Table5ChannelEntry),
      crossTeamAlignmentGuidelines: z.object({
        raciFramework: z.array(z.any()),
        communicationCadenceSlas: z.array(z.any()),
        sharedSLAs: z.array(z.string()),
      }),
      icpValidationChecklist: z.object({
        preQualificationChecklist: z.array(z.string()),
        quarterlyValidationReview: z.array(z.string()),
        dataSourcesForValidation: z.array(z.string()),
        icpUpdateTriggers: z.array(z.string()),
      }),
    });

    const validatedResult = finalSchema.parse(combinedResults);

    console.log(`[analysisGraph] Complete GTM analysis (parallel) done in ${Date.now() - analyzeStartTime}ms`);
    return { analysisResult: validatedResult };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to generate GTM analysis";
    console.error("[analysisGraph] Node execution error:", error);
    return { error: errorMessage };
  }
}

const builder = new StateGraph(AnalysisState)
  .addNode("scraper", scrapeWebsiteNode)
  .addNode("analyzer", analyzeCompany)
  .addEdge(START, "scraper")
  .addEdge("scraper", "analyzer")
  .addEdge("analyzer", END);

export const analysisGraph = builder.compile();
