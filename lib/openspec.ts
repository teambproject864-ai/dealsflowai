import { z } from "zod";

// Zod schema for Firmographic/Demographic entry
export const Table1FirmographicEntrySchema = z.object({
  priorityTier: z.string(),
  industryVertical: z.string(),
  companySize: z.string(),
  arrRange: z.string(),
  location: z.string(),
  keyDecisionMakerDemographics: z.string(),
  notes: z.string(),
  primaryCostDriver: z.string().default("N/A"),
  currentSolutionStatus: z.string().default("N/A"),
  numberOfSitesTeamsLocations: z.string().default("N/A"),
  sustainabilityEsgComplianceCommitment: z.string().default("N/A"),
});

// Zod schema for Pain Point Analysis entry
export const Table2PainPointEntrySchema = z.object({
  painPoint: z.string(),
  severity: z.string(),
  businessImpact: z.string(),
  rootCause: z.string(),
  dealFlowAISolution: z.string(),
  frequencyOfPain: z.string().default("N/A"),
  howPainIsCurrentlyDiscovered: z.string().default("N/A"),
  competitorCurrentSolutionInUse: z.string().default("N/A"),
});

// Zod schema for Decision Maker Influence entry
export const Table3DecisionMakerEntrySchema = z.object({
  role: z.string(),
  influenceScore: z.string(),
  coreDecisionRole: z.string(),
  top3Priorities: z.string(),
  dealFlowAIMessagingFocus: z.string(),
  preferredContactChannel: z.string().default("N/A"),
  primaryObjectionType: z.string().default("N/A"),
  contentFormatPreference: z.string().default("N/A"),
});

// Zod schema for Lead Scoring entry
export const Table4LeadScoringEntrySchema = z.object({
  category: z.string(),
  criterion: z.string(),
  points: z.string(),
});

// Zod schema for Channel Effectiveness entry
export const Table5ChannelEntrySchema = z.object({
  channel: z.string(),
  icpSegmentsBestFor: z.string(),
  monthlyLeadVolume: z.string(),
  conversionRate: z.string(),
  costPerAcquisition: z.string(),
  ltvToCacRatio: z.string(),
  budgetAllocation: z.string(),
  optimizationRecommendations: z.string(),
});

// Zod schema for Purchasing Journey stage
export const PurchasingJourneyStageSchema = z.object({
  stage: z.string(),
  duration: z.string(),
  customerActions: z.string(),
  customerNeedsQuestions: z.string(),
  channelPreferences: z.string(),
  dealFlowAIAssetsEngagement: z.string(),
});

// Zod schema for Competitive Landscape entry
export const CompetitiveLandscapeEntrySchema = z.object({
  competitorName: z.string(),
  coreOffering: z.string(),
  keyWeakness: z.string(),
  companyDifferentiator: z.string(),
  positioningStatement: z.string(),
});

// Zod schema for Messaging & Positioning entry
export const MessagingPositioningEntrySchema = z.object({
  painPoint: z.string(),
  valuePillar: z.string(),
  hookLine: z.string(),
  supportingProofPoint: z.string(),
  cta: z.string(),
  personaMessaging: z.array(z.object({
    persona: z.string(),
    messaging: z.string(),
  })),
});

// Zod schema for Objection Handling entry
export const ObjectionHandlingEntrySchema = z.object({
  objection: z.string(),
  personaMostLikelyToRaiseIt: z.string(),
  responseFramework: z.string(),
  supportingAsset: z.string(),
});

// Zod schema for Risk Register entry
export const RiskRegisterEntrySchema = z.object({
  risk: z.string(),
  likelihood: z.enum(["High", "Medium", "Low"]),
  impact: z.enum(["High", "Medium", "Low"]),
  mitigation: z.string(),
});

// OpenSpec GTM Analysis schema
export const GTMAnalysisSpecSchema = z.object({
  executiveSummary: z.string().min(10),
  icpDefinition: z.object({
    inclusionCriteria: z.array(z.string()),
    exclusionCriteria: z.array(z.string()),
  }),
  table1FirmographicDemographic: z.array(Table1FirmographicEntrySchema),
  behavioralPsychographicTraits: z.object({
    observableBehavioralPatterns: z.array(z.string()),
    corePsychographicAttributes: z.array(z.string()),
  }),
  table2PainPointAnalysis: z.array(Table2PainPointEntrySchema),
  table3DecisionMakerInfluence: z.array(Table3DecisionMakerEntrySchema),
  purchasingJourneyMapping: z.array(PurchasingJourneyStageSchema),
  table4LeadScoringFramework: z.object({
    criteria: z.array(Table4LeadScoringEntrySchema),
    qualificationThresholds: z.object({
      mql: z.string(),
      sql: z.string(),
      sal: z.string(),
    }),
  }),
  table5ChannelEffectiveness: z.array(Table5ChannelEntrySchema),
  crossTeamAlignmentGuidelines: z.object({
    raciFramework: z.array(z.any()).default([]),
    communicationCadenceSlas: z.array(z.any()).default([]),
    sharedSLAs: z.array(z.object({
      sla: z.string(),
      owner: z.string(),
      escalationPath: z.string(),
    })),
    weeklyReviewMeeting: z.object({
      cadence: z.string(),
      owner: z.string(),
    }),
    hotLeadCriteria: z.string(),
  }),
  icpValidationChecklist: z.object({
    preQualificationChecklist: z.array(z.string()),
    quarterlyValidationReview: z.array(z.string()),
    dataSourcesForValidation: z.array(z.string()),
    icpUpdateTriggers: z.array(z.string()),
    quarterlyReviewOwner: z.string(),
    scoringThresholdForRevision: z.string(),
    reviewChecklist: z.array(z.string()),
  }),
});

// OpenSpec Strategic Playbook schema
export const StrategicPlaybookSpecSchema = z.object({
  sectionACompetitiveLandscape: z.array(CompetitiveLandscapeEntrySchema),
  sectionBMessagingAndPositioning: z.array(MessagingPositioningEntrySchema),
  sectionCObjectionHandlingMatrix: z.array(ObjectionHandlingEntrySchema),
  sectionDTamSamSom: z.object({
    tam: z.string(),
    sam: z.string(),
    som: z.string(),
  }),
  sectionEPartnerAndChannelStrategy: z.object({
    referralPartners: z.array(z.string()),
    partnerIncentiveModel: z.string(),
    coMarketingOpportunities: z.array(z.string()),
  }),
  sectionFRiskRegister: z.array(RiskRegisterEntrySchema),
  campaignSuccessMetrics: z.object({
    pipelineGeneratedTargetByTier: z.array(z.object({
      tier: z.string(),
      target: z.string(),
    })),
    mqlToSqlConversionRateTarget: z.string(),
    cacTargetByChannel: z.array(z.object({
      channel: z.string(),
      target: z.string(),
    })),
    dealVelocityBenchmarkByTier: z.array(z.object({
      tier: z.string(),
      days: z.string(),
    })),
  }),
});

export type GTMAnalysisSpec = z.infer<typeof GTMAnalysisSpecSchema>;
export type StrategicPlaybookSpec = z.infer<typeof StrategicPlaybookSpecSchema>;

export class OpenSpecValidator {
  static validateGTM(data: any): { success: boolean; errors?: string[] } {
    const result = GTMAnalysisSpecSchema.safeParse(data);
    if (result.success) {
      return { success: true };
    }
    return {
      success: false,
      errors: result.error.errors.map(e => `${e.path.join(".")}: ${e.message}`),
    };
  }

  static validatePlaybook(data: any): { success: boolean; errors?: string[] } {
    const result = StrategicPlaybookSpecSchema.safeParse(data);
    if (result.success) {
      return { success: true };
    }
    return {
      success: false,
      errors: result.error.errors.map(e => `${e.path.join(".")}: ${e.message}`),
    };
  }
}
