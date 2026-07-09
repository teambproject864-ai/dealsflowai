import { z } from "zod";

export const MarketResearchDataSchema = z.object({
  marketSize: z.number().positive(),
  marketGrowthRate: z.number(),
  targetAudience: z.array(z.string()),
  marketTrends: z.array(z.string()),
  marketChallenges: z.array(z.string()),
});

export const CustomerSegmentationSchema = z.object({
  segments: z.array(
    z.object({
      id: z.string(),
      size: z.number().positive(),
      needs: z.array(z.string()),
      painPoints: z.array(z.string()),
      valuePropositionFit: z.number().min(0).max(100),
    })
  ),
});

export const CompetitiveLandscapeSchema = z.object({
  competitors: z.array(
    z.object({
      name: z.string(),
      marketShare: z.number(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
    })
  ),
  marketLeader: z.string().optional(),
});

export const SalesChannelMetricsSchema = z.object({
  channels: z.array(
    z.object({
      name: z.string(),
      traffic: z.number().positive(),
      conversionRate: z.number().min(0).max(100),
      cac: z.number().positive(),
      ltv: z.number().positive(),
    })
  ),
});

export const GTMInputSchema = z.object({
  product: z.string(),
  industry: z.string(),
  marketResearch: MarketResearchDataSchema,
  customerSegments: CustomerSegmentationSchema,
  competitiveLandscape: CompetitiveLandscapeSchema,
  salesChannelMetrics: SalesChannelMetricsSchema,
  budget: z.number().positive(),
  timelineMonths: z.number().positive(),
});

export const GTMStrategyRecommendationSchema = z.object({
  targetSegments: z.array(z.string()),
  priorityChannels: z.array(z.string()),
  messaging: z.string(),
  launchPhases: z.array(z.string()),
  keyMilestones: z.array(
    z.object({ name: z.string(), date: z.string(), deliverables: z.array(z.string()) })
  ),
});

export const MarketPenetrationForecastSchema = z.object({
  month1: z.number().min(0).max(100),
  month3: z.number().min(0).max(100),
  month6: z.number().min(0).max(100),
  month12: z.number().min(0).max(100),
  assumptions: z.array(z.string()),
});

export const CACOptimizationSchema = z.object({
  opportunities: z.array(
    z.object({
      channel: z.string(),
      potentialReductionPercent: z.number().min(0).max(100),
      estimatedAnnualSavings: z.number().positive(),
      implementationDifficulty: z.enum(["low", "medium", "high"]),
    })
  ),
});

export const LaunchTimelineRiskSchema = z.object({
  risks: z.array(
    z.object({
      risk: z.string(),
      likelihood: z.enum(["low", "medium", "high"]),
      impact: z.enum(["low", "medium", "high"]),
      mitigationPlan: z.string(),
    })
  ),
});

export const GTMOutputSchema = z.object({
  strategyRecommendations: GTMStrategyRecommendationSchema,
  penetrationForecast: MarketPenetrationForecastSchema,
  cacOptimization: CACOptimizationSchema,
  timelineRisks: LaunchTimelineRiskSchema,
  overallConfidence: z.number().min(0).max(100),
});

export type MarketResearchData = z.infer<typeof MarketResearchDataSchema>;
export type CustomerSegmentation = z.infer<typeof CustomerSegmentationSchema>;
export type CompetitiveLandscape = z.infer<typeof CompetitiveLandscapeSchema>;
export type SalesChannelMetrics = z.infer<typeof SalesChannelMetricsSchema>;
export type GTMInput = z.infer<typeof GTMInputSchema>;
export type GTMStrategyRecommendation = z.infer<typeof GTMStrategyRecommendationSchema>;
export type MarketPenetrationForecast = z.infer<typeof MarketPenetrationForecastSchema>;
export type CACOptimization = z.infer<typeof CACOptimizationSchema>;
export type LaunchTimelineRisk = z.infer<typeof LaunchTimelineRiskSchema>;
export type GTMOutput = z.infer<typeof GTMOutputSchema>;
