
import { AnalysisResult } from "./types";

export function generateMockCompleteGTM(companyName: string, formData?: any): AnalysisResult {
  // Extract all relevant fields from form data
  const targetIndustries = formData?.targetIndustries ? formData.targetIndustries.join(", ") : "SalesTech/MarTech";
  const targetGeographies = formData?.targetGeographics ? formData.targetGeographics.join(", ") : "United States (West/Northeast)";
  const targetCompanySizes = formData?.targetCompanySizes ? formData.targetCompanySizes.join(", ") : "25-100 employees";
  const icpDescription = formData?.icpDescription || "B2B SaaS companies with existing outbound sales motion";
  const companyDescription = formData?.companyDescription || `${companyName} is a B2B SaaS company.`;
  const keyChallenges = formData?.keyChallenges || "Manual lead qualification, pipeline visibility issues, long sales cycles.";
  const primaryOutcome = formData?.primaryOutcome || "Accelerate pipeline and increase close rates";
  const commonObjections = formData?.commonObjections || "No budget, too risky, not a priority right now";
  
  return {
    executiveSummary: `${companyName} has strong growth potential as a ${targetIndustries} company. ${companyDescription} This analysis identifies key segments, channels, and messaging strategies to achieve ${primaryOutcome}. Key challenges include ${keyChallenges} - we'll address these with targeted outreach, content, and sales process optimization.`,
    icpDefinition: {
      inclusionCriteria: [
        `${icpDescription}`,
        `Industry: ${targetIndustries}`,
        `Company size: ${targetCompanySizes}`,
        `Geography: ${targetGeographies}`,
        "Uses Salesforce or HubSpot CRM (or similar)",
        "Has existing outbound or inbound motion"
      ],
      exclusionCriteria: [
        "B2C companies",
        "Early-stage pre-revenue startups",
        "Enterprise companies >1000 employees requiring custom onboarding",
        "Already running a mature, analytics-driven solution in this category",
        "Single small operation with negligible spend or scale",
        "No operational authority to make or influence purchasing decisions"
      ]
    },
    table1FirmographicDemographic: [
      { 
        priorityTier: "Tier 1", 
        industryVertical: targetIndustries, 
        companySize: targetCompanySizes, 
        arrRange: "$2M-$20M", 
        location: targetGeographies, 
        keyDecisionMakerDemographics: formData?.targetSeniorities ? formData.targetSeniorities.join(", ") : "VP Sales, CRO, 35-50yo, data-driven", 
        notes: "Highest conversion, fastest sales cycles", 
        primaryCostDriver: "Tooling", 
        currentSolutionStatus: "Basic", 
        numberOfSitesTeamsLocations: "2-5", 
        sustainabilityEsgComplianceCommitment: "Yes" 
      },
      { 
        priorityTier: "Tier 2", 
        industryVertical: targetIndustries, 
        companySize: targetCompanySizes, 
        arrRange: "$5M-$50M", 
        location: targetGeographies, 
        keyDecisionMakerDemographics: formData?.targetSeniorities ? formData.targetSeniorities.join(", ") : "CRO/Director of Sales", 
        notes: "High ACV, higher retention", 
        primaryCostDriver: "Headcount", 
        currentSolutionStatus: "None", 
        numberOfSitesTeamsLocations: "5-10", 
        sustainabilityEsgComplianceCommitment: "In Progress" 
      }
    ],
    behavioralPsychographicTraits: {
      observableBehavioralPatterns: ["Downloads sales automation content", "Attends GTM webinars", "Active on LinkedIn Sales", "Uses multiple SaaS tools"],
      corePsychographicAttributes: ["Data-driven decision making", "Risk-tolerant for ROI-positive tools", "Innovation-focused"]
    },
    table2PainPointAnalysis: [
      { painPoint: "Manual lead qualification takes too long", severity: "Critical", businessImpact: "30% wasted sales time, $40k/year cost per rep", rootCause: "No AI-assisted scoring", dealFlowAISolution: "AI Lead Analysis + ICP Matching", frequencyOfPain: "Daily", howPainIsCurrentlyDiscovered: "Manual audit", competitorCurrentSolutionInUse: "None" },
      { painPoint: "No visibility into meeting quality", severity: "High", businessImpact: "10% lower close rate", rootCause: "No systematic call analysis", dealFlowAISolution: "Meeting Summaries + Sentiment Analysis", frequencyOfPain: "Weekly", howPainIsCurrentlyDiscovered: "Complaint", competitorCurrentSolutionInUse: "Gong (basic)" }
    ],
    table3DecisionMakerInfluence: [
      { role: "VP Sales / CRO", influenceScore: "10", coreDecisionRole: "Economic Buyer", top3Priorities: "Hit quota, increase pipeline, prove ROI", dealFlowAIMessagingFocus: "ROI case studies, enterprise pricing", preferredContactChannel: "LinkedIn", primaryObjectionType: "No budget", contentFormatPreference: "ROI calc" },
      { role: "Sales Ops Manager", influenceScore: "8", coreDecisionRole: "Gatekeeper + Champion", top3Priorities: "Process efficiency, adoption metrics", dealFlowAIMessagingFocus: "Implementation guides, integration docs", preferredContactChannel: "Email", primaryObjectionType: "Too risky / need a pilot first", contentFormatPreference: "Demo" },
      { role: "Operations Lead", influenceScore: "7", coreDecisionRole: "Champion", top3Priorities: "Process gaps, implementation risk", dealFlowAIMessagingFocus: "Implementation ease, process automation", preferredContactChannel: "Email", primaryObjectionType: "Already have an existing solution", contentFormatPreference: "Case study" },
      { role: "Technical Lead", influenceScore: "6", coreDecisionRole: "Champion", top3Priorities: "Integrations, system performance", dealFlowAIMessagingFocus: "API docs, integration guides", preferredContactChannel: "Phone", primaryObjectionType: "Need board or leadership approval", contentFormatPreference: "1-pager" }
    ],
    purchasingJourneyMapping: [
      { stage: "Awareness", duration: "Week 1-2", customerActions: "Reads content, attends webinars", customerNeedsQuestions: "What problems can AI solve?", channelPreferences: "LinkedIn, Google Search", dealFlowAIAssetsEngagement: "SEO content, thought leadership" },
      { stage: "Consideration", duration: "Week 2-4", customerActions: "Downloads assets, requests demo", customerNeedsQuestions: "Does this integrate with my stack?", channelPreferences: "Website, G2/Capterra", dealFlowAIAssetsEngagement: "Personalized demo, case studies" },
      { stage: "Decision", duration: "Week 4-6", customerActions: "Vendor comparison, internal approval, pilot scoping", customerNeedsQuestions: "What's the ROI and implementation timeline?", channelPreferences: "1:1 calls, proposal reviews", dealFlowAIAssetsEngagement: "Custom proposals, ROI calculators" },
      { stage: "Closed-Won", duration: "Week 6-8", customerActions: "Onboarding trigger, handoff SOP, success criteria set", customerNeedsQuestions: "How do we get up and running quickly?", channelPreferences: "CS onboarding calls", dealFlowAIAssetsEngagement: "Onboarding playbooks, success plan" },
      { stage: "Retention", duration: "Month 2-6", customerActions: "QBR cadence, expansion signals, upsell trigger", customerNeedsQuestions: "How can we get more value?", channelPreferences: "CS check-ins", dealFlowAIAssetsEngagement: "QBR templates, upsell playbooks" },
      { stage: "Expansion", duration: "Ongoing", customerActions: "Second-site or second-team rollout, land-and-expand path", customerNeedsQuestions: "How do we scale this across teams?", channelPreferences: "Account management", dealFlowAIAssetsEngagement: "Expansion playbooks, multi-team pricing" }
    ],
    table4LeadScoringFramework: {
      criteria: [
        { category: "Firmographics", criterion: "B2B SaaS Industry", points: "15" },
        { category: "Firmographics", criterion: "Uses Salesforce/HubSpot", points: "10" },
        { category: "Trigger Events", criterion: "Trigger event detected (expo, expansion, tariff hike)", points: "8" },
        { category: "Behavioral", criterion: "LinkedIn activity (engaged with industry-relevant content)", points: "5" },
        { category: "Firmographics", criterion: "Multi-site operations confirmed", points: "5" },
        { category: "Firmographics", criterion: "No existing solution or analytics layer confirmed", points: "5" },
        { category: "Decision Making", criterion: "Budget authority confirmed", points: "7" }
      ],
      qualificationThresholds: { mql: "40 points", sql: "70 points", sal: "80+ points" }
    },
    table5ChannelEffectiveness: [
      { channel: "LinkedIn Outbound", icpSegmentsBestFor: "All Tiers", monthlyLeadVolume: "120", conversionRate: "8.5%", costPerAcquisition: "$1,200", ltvToCacRatio: "12:1", budgetAllocation: "35%", optimizationRecommendations: "Focus on VP Sales roles" },
      { channel: "Paid Search", icpSegmentsBestFor: "Tiers 1-3", monthlyLeadVolume: "80", conversionRate: "5.2%", costPerAcquisition: "$1,800", ltvToCacRatio: "8:1", budgetAllocation: "25%", optimizationRecommendations: "High-intent keywords only" },
      { channel: "Cold Email Outbound", icpSegmentsBestFor: "Tiers 1-2", monthlyLeadVolume: "150", conversionRate: "6.0%", costPerAcquisition: "$900", ltvToCacRatio: "15:1", budgetAllocation: "20%", optimizationRecommendations: "Personalize to pain points" },
      { channel: "Industry Events / Expos", icpSegmentsBestFor: "Tier 1", monthlyLeadVolume: "30", conversionRate: "12.0%", costPerAcquisition: "$2,500", ltvToCacRatio: "10:1", budgetAllocation: "10%", optimizationRecommendations: "Sponsor speaking slots" },
      { channel: "Content / SEO", icpSegmentsBestFor: "All Tiers", monthlyLeadVolume: "60", conversionRate: "4.5%", costPerAcquisition: "$600", ltvToCacRatio: "20:1", budgetAllocation: "10%", optimizationRecommendations: "Focus on problem-focused content" }
    ],
    crossTeamAlignmentGuidelines: {
      raciFramework: [],
      communicationCadenceSlas: [],
      sharedSLAs: [
        { sla: "MQL to SDR assignment: <24h", owner: "SDR Manager", escalationPath: "Head of Sales" },
        { sla: "Hot lead follow-up: <15m", owner: "SDR on duty", escalationPath: "Sales Ops Lead" }
      ],
      weeklyReviewMeeting: { cadence: "Every Monday at 10am ET", owner: "Head of Sales Ops" },
      hotLeadCriteria: "ICP match + budget confirmed + trigger event"
    },
    icpValidationChecklist: {
      preQualificationChecklist: ["B2B SaaS?", "10-250 employees?", "CRM in use?"],
      quarterlyValidationReview: ["Review ICP performance", "Collect team feedback", "Check market shifts"],
      dataSourcesForValidation: ["CRM data", "Product analytics", "Win/loss interviews"],
      icpUpdateTriggers: ["Close rate drops", "Market shifts", "Product launches"],
      quarterlyReviewOwner: "Head of GTM",
      scoringThresholdForRevision: "Close rate <15%",
      reviewChecklist: ["Win/loss ratio", "Close rate by tier", "Churn signals"]
    },
    sectionACompetitiveLandscape: [
      { competitorName: "Apollo.io", coreOffering: "Sales intelligence platform", keyWeakness: "Limited AI analysis capabilities", companyDifferentiator: "Full GTM AI playbooks with lead scoring and meeting analysis", positioningStatement: `${companyName} doesn't just find leads; it turns them into closed deals with AI-powered GTM strategy.` },
      { competitorName: "Gong", coreOffering: "Conversation intelligence", keyWeakness: "No proactive lead scoring or ICP matching", companyDifferentiator: "End-to-end GTM platform from lead gen to close", positioningStatement: `While Gong analyzes calls, ${companyName} orchestrates your entire GTM motion.` }
    ],
    sectionBMessagingAndPositioning: [
      { painPoint: "Manual lead qualification takes too long", valuePillar: "Efficiency", hookLine: "Stop wasting 30% of your sales team's time on bad leads.", supportingProofPoint: "Customers reduce lead qualification time by 70% in 30 days.", cta: "Start your free audit", personaMessaging: [
        { persona: "VP Sales", messaging: "Hit your quota faster by focusing only on high-conversion leads." },
        { persona: "Sales Ops Manager", messaging: "Automate your lead routing and scoring to reduce manual work." }
      ] }
    ],
    sectionCObjectionHandlingMatrix: [
      { objection: "No budget", personaMostLikelyToRaiseIt: "VP Sales / CRO", responseFramework: "Highlight ROI and cost savings from efficiency gains.", supportingAsset: "ROI Calculator" },
      { objection: "Already have an existing solution", personaMostLikelyToRaiseIt: "Operations Lead", responseFramework: "Show how we complement and enhance their current stack.", supportingAsset: "Integration Guide" },
      { objection: "Not a priority right now", personaMostLikelyToRaiseIt: "VP Sales / CRO", responseFramework: "Highlight pain points and cost of inaction.", supportingAsset: "Pain Point Deck" },
      { objection: "Too risky / need a pilot first", personaMostLikelyToRaiseIt: "Sales Ops Manager / Technical Lead", responseFramework: "Offer a low-risk pilot with clear success metrics.", supportingAsset: "Pilot Agreement Template" },
      { objection: "Need board or leadership approval", personaMostLikelyToRaiseIt: "All", responseFramework: "Provide a clear business case with ROI projections.", supportingAsset: "Board Deck Template" }
    ],
    sectionDTamSamSom: {
      tam: "20,000 B2B SaaS companies in target markets",
      sam: "4,000 companies actively experiencing primary pain points",
      som: "200 companies (5% of SAM) in first 12 months"
    },
    sectionEPartnerAndChannelStrategy: {
      referralPartners: ["Sales consultants", "CRM implementation firms", "GTM agencies"],
      partnerIncentiveModel: "10% referral commission for closed deals",
      coMarketingOpportunities: ["Industry expos", "GTM summits", "Trade publications"]
    },
    sectionFRiskRegister: [
      { risk: "Competitive displacement", likelihood: "Medium", impact: "High", mitigation: "Focus on customer success and land-and-expand strategies." },
      { risk: "Low outreach reply rates", likelihood: "High", impact: "Medium", mitigation: "A/B test messaging and continuously optimize." },
      { risk: "Proof / case study gap", likelihood: "Medium", impact: "Medium", mitigation: "Offer free pilots in exchange for case studies." },
      { risk: "Long or stalled sales cycles", likelihood: "Medium", impact: "High", mitigation: "Implement clear milestones and checkpoints." },
      { risk: "Key person dependency", likelihood: "Low", impact: "High", mitigation: "Document processes and train the team." }
    ],
    campaignSuccessMetrics: {
      pipelineGeneratedTargetByTier: [
        { tier: "Tier 1", target: "$2M" },
        { tier: "Tier 2", target: "$1M" },
        { tier: "Tier 3", target: "$500k" }
      ],
      mqlToSqlConversionRateTarget: "25%",
      cacTargetByChannel: [
        { channel: "LinkedIn Outbound", target: "$1,200" },
        { channel: "Paid Search", target: "$1,800" },
        { channel: "Cold Email Outbound", target: "$900" }
      ],
      dealVelocityBenchmarkByTier: [
        { tier: "Tier 1", days: "45" },
        { tier: "Tier 2", days: "60" },
        { tier: "Tier 3", days: "90" }
      ]
    }
  };
}

export function generateMockPlaybook(companyName: string) {
  return {
    sectionACompetitiveLandscape: [
      { competitorName: "Apollo.io", coreOffering: "Sales intelligence platform", keyWeakness: "Limited AI analysis capabilities", companyDifferentiator: "Full GTM AI playbooks with lead scoring and meeting analysis", positioningStatement: `${companyName} doesn't just find leads; it turns them into closed deals with AI-powered GTM strategy.` },
      { competitorName: "Gong", coreOffering: "Conversation intelligence", keyWeakness: "No proactive lead scoring or ICP matching", companyDifferentiator: "End-to-end GTM platform from lead gen to close", positioningStatement: `While Gong analyzes calls, ${companyName} orchestrates your entire GTM motion.` }
    ],
    sectionBMessagingAndPositioning: [
      { painPoint: "Manual lead qualification takes too long", valuePillar: "Efficiency", hookLine: "Stop wasting 30% of your sales team's time on bad leads.", supportingProofPoint: "Customers reduce lead qualification time by 70% in 30 days.", cta: "Start your free audit", personaMessaging: [
        { persona: "VP Sales", messaging: "Hit your quota faster by focusing only on high-conversion leads." },
        { persona: "Sales Ops Manager", messaging: "Automate your lead routing and scoring to reduce manual work." }
      ] }
    ],
    sectionCObjectionHandlingMatrix: [
      { objection: "No budget", personaMostLikelyToRaiseIt: "VP Sales / CRO", responseFramework: "Highlight ROI and cost savings from efficiency gains.", supportingAsset: "ROI Calculator" },
      { objection: "Already have an existing solution", personaMostLikelyToRaiseIt: "Operations Lead", responseFramework: "Show how we complement and enhance their current stack.", supportingAsset: "Integration Guide" },
      { objection: "Not a priority right now", personaMostLikelyToRaiseIt: "VP Sales / CRO", responseFramework: "Highlight pain points and cost of inaction.", supportingAsset: "Pain Point Deck" },
      { objection: "Too risky / need a pilot first", personaMostLikelyToRaiseIt: "Sales Ops Manager / Technical Lead", responseFramework: "Offer a low-risk pilot with clear success metrics.", supportingAsset: "Pilot Agreement Template" },
      { objection: "Need board or leadership approval", personaMostLikelyToRaiseIt: "All", responseFramework: "Provide a clear business case with ROI projections.", supportingAsset: "Board Deck Template" }
    ],
    sectionDTamSamSom: {
      tam: "20,000 B2B SaaS companies in target markets",
      sam: "4,000 companies actively experiencing primary pain points",
      som: "200 companies (5% of SAM) in first 12 months"
    },
    sectionEPartnerAndChannelStrategy: {
      referralPartners: ["Sales consultants", "CRM implementation firms", "GTM agencies"],
      partnerIncentiveModel: "10% referral commission for closed deals",
      coMarketingOpportunities: ["Industry expos", "GTM summits", "Trade publications"]
    },
    sectionFRiskRegister: [
      { risk: "Competitive displacement", likelihood: "Medium", impact: "High", mitigation: "Focus on customer success and land-and-expand strategies." },
      { risk: "Low outreach reply rates", likelihood: "High", impact: "Medium", mitigation: "A/B test messaging and continuously optimize." },
      { risk: "Proof / case study gap", likelihood: "Medium", impact: "Medium", mitigation: "Offer free pilots in exchange for case studies." },
      { risk: "Long or stalled sales cycles", likelihood: "Medium", impact: "High", mitigation: "Implement clear milestones and checkpoints." },
      { risk: "Key person dependency", likelihood: "Low", impact: "High", mitigation: "Document processes and train the team." }
    ],
    campaignSuccessMetrics: {
      pipelineGeneratedTargetByTier: [
        { tier: "Tier 1", target: "$2M" },
        { tier: "Tier 2", target: "$1M" },
        { tier: "Tier 3", target: "$500k" }
      ],
      mqlToSqlConversionRateTarget: "25%",
      cacTargetByChannel: [
        { channel: "LinkedIn Outbound", target: "$1,200" },
        { channel: "Paid Search", target: "$1,800" },
        { channel: "Cold Email Outbound", target: "$900" }
      ],
      dealVelocityBenchmarkByTier: [
        { tier: "Tier 1", days: "45" },
        { tier: "Tier 2", days: "60" },
        { tier: "Tier 3", days: "90" }
      ]
    }
  };
}
