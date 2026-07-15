// lib/campaign-generator.ts

export interface StrategyTactic {
  name: string;
  description: string;
  whyRecommended: string;
  impact: "High" | "Medium" | "Low";
  priority: "P1" | "P2" | "P3";
  kpi: string;
}

export interface WorkflowItem {
  objective: string;
  trigger: string;
  executionPlan: string[];
  aiTasks: string[];
  manualTasks: string[];
  deliverables: string[];
  kpi: string;
  successMetrics: string;
}

export interface CampaignStrategyData {
  businessSummary: string;
  marketingStrategy: string;
  recommendedChannels: string[];
  targetAudienceInsights: string;
  customerJourney: string;
  priorityRecommendations: string[];
  
  tactics: StrategyTactic[];
  contentIdeas: {
    blogTopics: string[];
    socialMediaPosts: string[];
    emailCampaigns: string[];
    landingPages: string[];
    caseStudies: string[];
    customerTestimonials: string[];
    seoContent: string[];
    adCopy: string[];
  };
  
  workflows: {
    seoWorkflow: WorkflowItem;
    linkedinWorkflow: WorkflowItem;
    emailWorkflow: WorkflowItem;
    paidAdsWorkflow: WorkflowItem;
  };
}

export function generateCampaignStrategy(businessParams: any): CampaignStrategyData {
  const companyName = businessParams.officialBusinessName || businessParams.companyName || "Our Brand";
  const industry = businessParams.industryVertical || businessParams.industry || "Technology";
  const businessType = (businessParams.businessType || businessParams.businessModel || "B2B").toUpperCase();
  const audience = businessParams.idealCustomerProfile || businessParams.targetAudience || "Enterprise buyers";
  const goals = businessParams.primaryBusinessGoal || businessParams.businessGoals || "Accelerate growth and acquire new clients";
  const channels = businessParams.currentMarketingChannels || businessParams.marketingChannels || ["LinkedIn Outreach", "Cold Email", "Content SEO"];
  const keywords = businessParams.primaryKeywords || "AI workflow, revops efficiency";
  const stage = businessParams.customerJourneyStage || "Consideration";

  // Base strategies
  const businessSummary = `${companyName} is a high-performing ${businessType} brand specializing in ${industry}. We target ${audience} to address core pain points and accelerate outcomes. Our strategic objective is to align target channels and messaging to achieve: ${goals}.`;
  
  const marketingStrategy = `For ${companyName}, we recommend a multi-channel demand capture and acceleration strategy. Given the ${businessType} nature of the business and our target audience of ${audience}, we will focus on building organic search authority for high-intent search terms (using keywords like: ${keywords}) while simultaneously deploying outbound social sequences and targeted paid retargeting to maximize conversion at the ${stage} stage.`;

  const recommendedChannels = businessType === "B2B" 
    ? ["LinkedIn Marketing", "Cold Email Outbound", "Content SEO", "Google Search Ads"]
    : ["Instagram/Facebook Ads", "Influencer Marketing", "Referral Campaigns", "YouTube Content"];

  const targetAudienceInsights = `Our ICP consists of decision-makers matching the ${audience} profile. They are highly active on ${recommendedChannels[0]} and ${recommendedChannels[2]}. Their primary psychographic traits include risk mitigation, preference for rapid time-to-value, and an emphasis on security compliance. They seek solutions that can be easily integrated into their existing technology stacks without disrupting operational continuity.`;

  const customerJourney = `1. Awareness: The customer searches for pain-point terms (e.g. "${keywords.split(',')[0]}"). They discover our thought leadership blog posts or social testimonials.\n2. Consideration: The customer compares us against legacy solutions, looking at Case Studies and ROI calculators to check integration compatibility.\n3. Decision: The customer signs up for a trial or schedules an expert call. A customized onboarding sequence is triggered to ensure rapid adoption and activation.`;

  const priorityRecommendations = [
    "Build high-intent comparison pages targeting legacy competitor keywords.",
    `Launch outreach sequences on ${recommendedChannels[0]} addressing key decision-maker pain points.`,
    "Implement programmatic SEO landing pages to capture search queries relating to regional operations.",
    "Onboard reference customers to build a library of high-impact video testimonials."
  ];

  // Tactics
  const tactics: StrategyTactic[] = businessType === "B2B" ? [
    {
      name: "SEO & Blog Strategy",
      description: "Produce programmatic and thought-leadership content targeting high-intent long-tail keywords to rank on Google search and capture organic demand.",
      whyRecommended: `Captures buyers actively looking to solve challenges relating to ${keywords.split(',')[0]}.`,
      impact: "High",
      priority: "P1",
      kpi: "Monthly organic search visits, keyword ranking positions, blog signup conversions."
    },
    {
      name: "LinkedIn Social Outreach",
      description: "Direct social prospecting and automated outreach targeting high-value VP and Director-level accounts matching our ICP.",
      whyRecommended: `Allows direct line of communication with decision makers in the ${industry} vertical.`,
      impact: "High",
      priority: "P1",
      kpi: "Response rate, meeting booking rate, pipeline value generated."
    },
    {
      name: "Email Nurture Campaigns",
      description: "Automated, segmented email drip sequences that trigger based on customer journey stages to educate prospects and move them closer to booking.",
      whyRecommended: "Keeps our solution top-of-mind and addresses common objections (budget, integration complexity).",
      impact: "Medium",
      priority: "P2",
      kpi: "Open rate (target >25%), click-through rate, demo registrations."
    },
    {
      name: "Paid Search & Retargeting Ads",
      description: "Google search ads targeting competitive hijack keywords, combined with Meta/LinkedIn retargeting for users who visited our landing pages.",
      whyRecommended: "Directly hijacks competitors' demand and ensures high ad recall with warm leads.",
      impact: "Medium",
      priority: "P2",
      kpi: "Cost per acquisition (CPA), conversion rate, click-through rate."
    }
  ] : [
    {
      name: "Social Media & Video Marketing",
      description: "Short-form video content (TikTok, IG Reels) showing key product value, visual user guides, and customer reviews.",
      whyRecommended: "B2C consumers rely heavily on visual social proof and micro-interactions before buying.",
      impact: "High",
      priority: "P1",
      kpi: "Video views, engagement rate, click-through to shop."
    },
    {
      name: "Influencer Marketing",
      description: "Partnering with industry micro-influencers to share genuine reviews and promotional codes.",
      whyRecommended: "Builds instant trust and leverages pre-existing audiences to drive fast conversions.",
      impact: "High",
      priority: "P1",
      kpi: "Promo code redemptions, affiliate revenue, referral traffic."
    },
    {
      name: "Referral & Loyalty Programs",
      description: "Reward-based referral loops encouraging existing buyers to refer peers for credits or cash payouts.",
      whyRecommended: "Lowers Customer Acquisition Cost (CAC) by utilizing organic word-of-mouth loops.",
      impact: "Medium",
      priority: "P2",
      kpi: "Referral rate, lifetime value (LTV) of referred customers."
    },
    {
      name: "Email & SMS Marketing",
      description: "Abandoned cart triggers, seasonal flash sales, and tailored content drops directly to users' phones and inboxes.",
      whyRecommended: "Immediate outreach to interested consumers, maximizing repeat purchase rates.",
      impact: "High",
      priority: "P1",
      kpi: "Add-to-cart recovery rate, revenue per email/SMS."
    }
  ];

  // Content Ideas
  const contentIdeas = {
    blogTopics: [
      `10 Crucial Trends in ${industry} to Watch in 2026`,
      `How to Overcome the Top 3 Challenges in ${industry} Operations`,
      `The Ultimate ROI Framework for ${companyName} Solutions`
    ],
    socialMediaPosts: [
      `🚨 Feeling the pain of manual workflows in ${industry}? You aren't alone. Here is how ${companyName} automates the pipeline...`,
      `Did you know? Teams using AI-driven scoring save up to 15 hours per week on lead filtering. Read our latest case study!`,
      `What if your CRM synced in 3 seconds instead of 30 minutes? Check our integration docs inside. ⚡`
    ],
    emailCampaigns: [
      `Subject: 🛑 Stop losing hours to manual spreadsheet entry\nBody: Hello,\nIf your team is still copy-pasting customer details, you are leaking pipeline velocity...`,
      `Subject: Why legacy systems fail in ${industry}\nBody: We unpack the technology stack mismatch and show how ${companyName} bridges the gap...`
    ],
    landingPages: [
      `Headline: Redefine Your ${industry} Pipeline Efficiency\nSub-headline: Automate data scoring and connect with high-intent buyers in real-time.`,
      `Headline: Legacy CRM vs. ${companyName}\nSub-headline: A detailed comparison guide for modern RevOps leaders.`
    ],
    caseStudies: [
      `How a leading fintech team accelerated pipeline growth by 250% in 30 days.`,
      `Scaling outbound outreach safely: A compliance blueprint study with ${companyName}.`
    ],
    customerTestimonials: [
      `"Our onboarding was completed in less than a week. The time-to-value was practically instant." - VP of Sales`,
      `"DealFlow gave our reps a single source of truth. Response rates jumped by 40%." - CEO, TechStart`
    ],
    seoContent: [
      `Comprehensive pillar page: "Best practices for ${industry} data management in 2026"`,
      `Targeted long-tail comparison page: "${companyName} vs competitor alternatives: ROI and security features"`
    ],
    adCopy: [
      `Google Search: "Outbound Automation Made Secure | Try ${companyName} | Real-time Sync & Compliance"`,
      `LinkedIn Banner Ad: "Stop wasting hours on unqualified leads. Automate with ${companyName}. Book a Demo."`
    ]
  };

  // Workflows
  const workflows = {
    seoWorkflow: {
      objective: "Establish organic search authority and capture high-intent buyers searching for problem terms.",
      trigger: "Publishing of new core product configurations or target keywords selection.",
      executionPlan: [
        "Perform deep search analysis to identify low-competition keywords matching search terms.",
        "Create comprehensive topic clusters and write 3 cornerstone pillar articles.",
        "Generate 10 supporting blog topics targeting long-tail questions.",
        "Submit sitemaps to search engines and optimize schema markup.",
        "Build backlinks from high-domain-authority websites and track ranking changes weekly."
      ],
      aiTasks: [
        "Generate initial list of 50 long-tail keywords based on B2B target market.",
        "Draft detailed outlines for selected pillar topics.",
        "Produce initial drafts of blog posts matching brand tone."
      ],
      manualTasks: [
        "Review and edit AI-generated drafts for product accuracy and technical detail.",
        "Reach out to industry publications and partners for guest post opportunities.",
        "Analyze Google Search Console query metrics to identify optimization targets."
      ],
      deliverables: [
        "3 Core Pillar pages live on website.",
        "10 Supporting blog articles indexed.",
        "Backlink outreach sheet with 15 target publications."
      ],
      kpi: "Monthly organic search impressions, average keyword rank, organic lead signups.",
      successMetrics: "15% increase in organic search traffic within 60 days, with at least 5 target keywords ranking on page 1."
    },
    linkedinWorkflow: {
      objective: "Engage high-value target accounts directly on LinkedIn and secure exploratory pipeline calls.",
      trigger: "Uploading target account contact lists matching our ICP segment.",
      executionPlan: [
        "Define target VP and C-level audience filters on LinkedIn Sales Navigator.",
        "Draft personalized invite and 3-step conversation message sequences.",
        "Create an outreach content calendar featuring shared success stories.",
        "Initiate sequence runs (up to 20 connection requests daily per rep).",
        "Monitor responses, hand off warm prospects to human reps, and optimize based on engagement metrics."
      ],
      aiTasks: [
        "Generate personalized pitch templates addressing VP of Sales pain points.",
        "Synthesize short LinkedIn post updates from existing case studies.",
        "Analyze connection acceptance rates to flag underperforming messaging."
      ],
      manualTasks: [
        "Verify prospect details on Sales Navigator before launching sequences.",
        "Follow up manually within 2 hours of a prospect replying to an outbound message.",
        "Join and participate in relevant B2B group discussions to build authority."
      ],
      deliverables: [
        "LinkedIn Sales Navigator target list containing 200 qualified accounts.",
        "A 3-step outreach sequence template finalized.",
        "Social content calendar with 10 post drafts."
      ],
      kpi: "Connection acceptance rate (target >30%), sequence response rate, qualified meetings booked.",
      successMetrics: "Minimum of 10 qualified exploratory calls scheduled from LinkedIn outreach campaigns per month."
    },
    emailWorkflow: {
      objective: "Nurture cold or warm leads through automated educational email sequences to drive demo requests.",
      trigger: "Prospect downloading a whitepaper, registering for a webinar, or matching cold outbound parameters.",
      executionPlan: [
        "Segment target audience into separate lists based on industry or role.",
        "Draft a 5-part email nurture sequence covering: Introduction, Problem identification, Social proof, Objection handling, and CTA.",
        "Set up campaign triggers and delay rules in HubSpot or Mailchimp.",
        "Run A/B tests on email subject lines to maximize open rates.",
        "Analyze campaign results, clean list of inactive emails, and optimize call-to-actions."
      ],
      aiTasks: [
        "Generate 5-part email copy sequence customized to target customer journey stage.",
        "Draft 3 alternative subject lines for each email to A/B test.",
        "Suggest target audience segmentation tags based on customer profile metadata."
      ],
      manualTasks: [
        "Review email formatting across mobile and desktop clients.",
        "Set up the DNS records (DKIM, SPF, DMARC) for secure email delivery.",
        "Respond to direct email replies and schedule follow-up calls."
      ],
      deliverables: [
        "Nurture campaign built and configured in the ESP.",
        "List of 500 validated contact emails segmented.",
        "Subject line A/B test setup finalized."
      ],
      kpi: "Open rate, click-through rate, unsubscribe rate, demo booking rate.",
      successMetrics: "Average open rate above 28% and a demo registration conversion rate of 2.5% from the email list."
    },
    paidAdsWorkflow: {
      objective: "Drive high-intent traffic to landing pages using paid search ads and capture retargeting conversions.",
      trigger: "Launching a new campaign targeting a competitor's customer base.",
      executionPlan: [
        "Conduct competitive keyword bidding research.",
        "Draft ad copies for Google search ads and design creatives for social retargeting.",
        "Set up tracking pixels and conversion actions on target landing pages.",
        "Launch search campaigns and retargeting display ads to previous website visitors.",
        "Monitor Daily Ad Spend, adjust bid strategies, and optimize low-performing ads weekly."
      ],
      aiTasks: [
        "Generate 10 ad copy headlines and description combinations for responsive search ads.",
        "Draft visual ad layout concepts and copy hooks for social retargeting banners.",
        "Analyze conversion logs to recommend negative keyword additions."
      ],
      manualTasks: [
        "Set daily budget caps and target bidding parameters in ad accounts.",
        "Design visual assets and creative banners for retargeting.",
        "Review tracking pixel compliance and cookie consent standards."
      ],
      deliverables: [
        "Google Ads search campaign live with target ad groups.",
        "Retargeting ads launched on LinkedIn or Meta.",
        "Conversion tracking verified on landing pages."
      ],
      kpi: "Click-through rate (CTR), Cost Per Click (CPC), Cost Per Acquisition (CPA), Return on Ad Spend (ROAS).",
      successMetrics: "Achieve a ROAS of at least 2.5x and keep Cost Per Acquisition (CPA) below $150."
    }
  };

  return {
    businessSummary,
    marketingStrategy,
    recommendedChannels,
    targetAudienceInsights,
    customerJourney,
    priorityRecommendations,
    tactics,
    contentIdeas,
    workflows
  };
}

export function regenerateSection(
  sectionKey: string,
  existingStrategy: CampaignStrategyData,
  feedback: string,
  businessParams: any
): CampaignStrategyData {
  // Clone existing strategy to avoid mutations
  const updated = JSON.parse(JSON.stringify(existingStrategy)) as CampaignStrategyData;
  const companyName = businessParams.officialBusinessName || businessParams.companyName || "Our Brand";
  const primaryGoal = businessParams.primaryBusinessGoal || "accelerate growth";
  const keywords = businessParams.primaryKeywords || "automation";
  const industry = businessParams.industryVertical || businessParams.industry || "B2B/B2C tech";

  // Build feedback qualifiers
  const isShorter = /short|concise|summarize|brief/i.test(feedback);
  const isProfessional = /professional|formal|business|corporate/i.test(feedback);
  const isLonger = /expand|longer|detail|more/i.test(feedback);
  const isB2B = /b2b|enterprise|corporate/i.test(feedback);
  const isB2C = /b2c|consumer|retail/i.test(feedback);
  const hasStrongerCTA = /cta|call to action|convert|conversion/i.test(feedback);
  const hasSeo = /seo|search engine|keyword/i.test(feedback);

  const applyFeedbackModifiers = (baseText: string) => {
    let text = baseText;
    if (isShorter) {
      text = text.split('. ').slice(0, 2).join('. ') + '.';
    }
    if (isLonger) {
      text += ` Additionally, we must monitor operational key metrics to evaluate performance, integrate with standard middleware systems, and align multi-department workflows to ensure seamless adoption.`;
    }
    if (isProfessional) {
      text = text.replace(/help you/g, "enable the enterprise to")
                 .replace(/make money/g, "generate high-margin recurring pipelines")
                 .replace(/good/g, "state-of-the-art and highly optimized");
      text = `[Formal Strategy Blueprint] ${text}`;
    }
    if (isB2B) {
      text += ` This strategy focuses heavily on targeting enterprise procurement processes, VP/C-level stakeholders, and securing high-value annual contracts.`;
    }
    if (isB2C) {
      text += ` Direct-to-consumer digital channels and viral social loops are utilized to maximize immediate online conversions.`;
    }
    if (hasStrongerCTA) {
      text += ` Action Required: Schedule your live ${companyName} Revenue Alignment Audit today to unlock up to 2x pipeline growth!`;
    }
    if (hasSeo) {
      text += ` Optimized with primary focus keywords: ${keywords}.`;
    }
    return text;
  };

  // Perform targeted update based on section key
  switch (sectionKey) {
    case "businessSummary":
      updated.businessSummary = applyFeedbackModifiers(
        `Based on recent inputs, ${companyName} functions as a key industry player. Our refined target focus covers core segments with specific pain point solutions aimed at achieving: ${primaryGoal}.`
      );
      break;
    case "marketingStrategy":
      updated.marketingStrategy = applyFeedbackModifiers(
        `Refined GTM framework for ${companyName}. We are establishing a highly targeted distribution model designed to capture immediate market intent using channels: ${updated.recommendedChannels.join(", ")}.`
      );
      break;
    case "targetAudienceInsights":
      updated.targetAudienceInsights = applyFeedbackModifiers(
        `Refined Audience Analysis: Our prospects prioritize rapid technical activation, integration compatibility, and security. We are adjusting targeting criteria to match high-intent buyers.`
      );
      break;
    case "customerJourney":
      updated.customerJourney = applyFeedbackModifiers(
        `1. Discovery: Leads search for pain points.\n2. Comparison: View case studies and ROI calculations.\n3. Activation: Sign up and trigger onboarding.`
      );
      break;
    case "priorityRecommendations":
      updated.priorityRecommendations = updated.priorityRecommendations.map(rec => 
        isProfessional ? `[Actionable] ${rec}` : rec
      );
      if (hasStrongerCTA) {
        updated.priorityRecommendations.unshift(`Launch high-impact call-to-action landing pages for immediate demo signups.`);
      }
      break;
      
    // Tactic categories
    case "tactic-0":
    case "tactic-1":
    case "tactic-2":
    case "tactic-3":
      const tIdx = parseInt(sectionKey.split("-")[1]);
      if (updated.tactics[tIdx]) {
        updated.tactics[tIdx].description = applyFeedbackModifiers(updated.tactics[tIdx].description);
        updated.tactics[tIdx].whyRecommended = applyFeedbackModifiers(updated.tactics[tIdx].whyRecommended);
        if (isProfessional) {
          updated.tactics[tIdx].priority = "P1";
          updated.tactics[tIdx].kpi = "CPA Reduction, ROAS Index, LTV Growth";
        }
      }
      break;
      
    // Content ideas categories
    case "content-blogTopics":
      updated.contentIdeas.blogTopics = [
        `Refined: How ${companyName} Delivers 2x ROI for ${industry} Teams`,
        `Objection Handling: 5 Myths About ${keywords.split(',')[0]} automation`,
        `Advanced Playbook: Accelerating ${primaryGoal} in 2026`
      ].map(t => applyFeedbackModifiers(t));
      break;
    case "content-socialMediaPosts":
      updated.contentIdeas.socialMediaPosts = [
        `🔥 Refined Outbound Strategy: Outbound campaigns automated securely to stop CRM duplication and manual copy-pasting.⚡`,
        `Objection: "We don't have the budget." Answer: ${companyName} pays for itself in 30 days. Read study.`,
        `VP Sales tip: Align your RevOps parameters today to accelerate outbound response rates.`
      ].map(p => applyFeedbackModifiers(p));
      break;
    case "content-emailCampaigns":
      updated.contentIdeas.emailCampaigns = [
        `Subject: Re: Outbound bottlenecks in ${industry}\nHello,\nWe recently refined our strategy to help you eliminate CRM duplication...`,
        `Subject: Proof of ROI for ${companyName}\nHello,\nHere is the data comparing legacy configurations to our AI engine...`
      ].map(e => applyFeedbackModifiers(e));
      break;
    case "content-landingPages":
      updated.contentIdeas.landingPages = [
        `Headline: Refined Outbound Pipeline Automation for ${industry}\nSub-headline: Set up in under a week and scale with security.`,
        `Headline: Build High-Yield Deal Flows\nSub-headline: Integrate ${companyName} directly with Salesforce or HubSpot.`
      ].map(l => applyFeedbackModifiers(l));
      break;
    case "content-caseStudies":
      updated.contentIdeas.caseStudies = [
        `How a mid-market team saw sales conversion jump from 1.5% to 3.8% using ${companyName}.`,
        `Eliminating CRM administrative bloat: A RevOps strategy study.`
      ].map(c => applyFeedbackModifiers(c));
      break;
    case "content-customerTestimonials":
      updated.contentIdeas.customerTestimonials = [
        `"This integration saved our sales reps 15 hours per week of manual data copying." - Operations Manager`,
        `"Outstanding ROI. The onboarding trigger worked instantly." - Director of Demand Gen`
      ].map(t => applyFeedbackModifiers(t));
      break;
    case "content-seoContent":
      updated.contentIdeas.seoContent = [
        `Pillar page: "The definitive 2026 guide to ${keywords.split(',')[0]} automation"`,
        `Comparison article: "${companyName} vs competitor alternatives: ROI and security features"`
      ].map(s => applyFeedbackModifiers(s));
      break;
    case "content-adCopy":
      updated.contentIdeas.adCopy = [
        `Ad 1: "Automate Outreach Safely | Try ${companyName} | 2x Pipeline Speed"`,
        `Ad 2: "Save 15 Hours/Rep Weekly. Real-time CRM Sync. Free Setup."`
      ].map(a => applyFeedbackModifiers(a));
      break;

    // Workflows
    case "workflow-seo":
      updated.workflows.seoWorkflow.objective = applyFeedbackModifiers(updated.workflows.seoWorkflow.objective);
      updated.workflows.seoWorkflow.successMetrics = applyFeedbackModifiers(updated.workflows.seoWorkflow.successMetrics);
      if (isShorter) {
        updated.workflows.seoWorkflow.executionPlan = updated.workflows.seoWorkflow.executionPlan.slice(0, 3);
      }
      break;
    case "workflow-linkedin":
      updated.workflows.linkedinWorkflow.objective = applyFeedbackModifiers(updated.workflows.linkedinWorkflow.objective);
      updated.workflows.linkedinWorkflow.successMetrics = applyFeedbackModifiers(updated.workflows.linkedinWorkflow.successMetrics);
      if (isShorter) {
        updated.workflows.linkedinWorkflow.executionPlan = updated.workflows.linkedinWorkflow.executionPlan.slice(0, 3);
      }
      break;
    case "workflow-email":
      updated.workflows.emailWorkflow.objective = applyFeedbackModifiers(updated.workflows.emailWorkflow.objective);
      updated.workflows.emailWorkflow.successMetrics = applyFeedbackModifiers(updated.workflows.emailWorkflow.successMetrics);
      if (isShorter) {
        updated.workflows.emailWorkflow.executionPlan = updated.workflows.emailWorkflow.executionPlan.slice(0, 3);
      }
      break;
    case "workflow-paidAds":
      updated.workflows.paidAdsWorkflow.objective = applyFeedbackModifiers(updated.workflows.paidAdsWorkflow.objective);
      updated.workflows.paidAdsWorkflow.successMetrics = applyFeedbackModifiers(updated.workflows.paidAdsWorkflow.successMetrics);
      if (isShorter) {
        updated.workflows.paidAdsWorkflow.executionPlan = updated.workflows.paidAdsWorkflow.executionPlan.slice(0, 3);
      }
      break;

    default:
      console.warn(`Unknown sectionKey for regeneration: ${sectionKey}`);
  }

  return updated;
}
