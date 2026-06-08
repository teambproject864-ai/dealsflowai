import { z } from "zod";
import type { AnalysisResult } from "./types";

const sectionSchema = z.object({
  title: z.string(),
  content: z.string(),
});

const analysisSchema = z.object({
  healthScore: z.number().min(0).max(100),
  gtmPlan: z.string().min(1),
  idealCustomerProfiles: z.array(sectionSchema).min(1),
  comprehensiveBrandOverview: z.string().min(1),
  strategicOutreachApproach: z.string().min(1),
  marketDifferentiationTriggers: z.array(z.string()).min(1),
  goToMarketCoreFramework: z.string().min(1),
  customerJourneyPipeline: z.array(sectionSchema).min(1),
});

export function stripJsonFence(raw: string): string {
  let t = raw.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return t.trim();
}

export function parseAnalysisJson(raw: string): AnalysisResult {
  const cleaned = stripJsonFence(raw);
  const parsed: unknown = JSON.parse(cleaned);
  return analysisSchema.parse(parsed) as unknown as AnalysisResult;
}
