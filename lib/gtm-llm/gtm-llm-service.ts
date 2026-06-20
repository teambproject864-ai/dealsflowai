import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { LRUCache } from "lru-cache";
import type { GTMInput, GTMOutput } from "./types";
import { GTMOutputSchema } from "./types";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "demo-key",
  compatibility: "strict",
});

const inferenceCache = new LRUCache<string, GTMOutput>({
  max: 100,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
});

export async function analyzeGTMStrategy(input: GTMInput): Promise<GTMOutput> {
  const cacheKey = JSON.stringify(input);
  const cached = inferenceCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: GTMOutputSchema,
    prompt: `
      You are a world-class Go-To-Market (GTM) strategy specialist with 20+ years of experience.
      Given the following input data, provide a comprehensive GTM analysis:
      
      Product: ${input.product}
      Industry: ${input.industry}
      Budget: $${input.budget}
      Timeline: ${input.timelineMonths} months
      
      Market Research: ${JSON.stringify(input.marketResearch, null, 2)}
      Customer Segments: ${JSON.stringify(input.customerSegments, null, 2)}
      Competitive Landscape: ${JSON.stringify(input.competitiveLandscape, null, 2)}
      Sales Channel Metrics: ${JSON.stringify(input.salesChannelMetrics, null, 2)}
      
      Please provide:
      1. Strategy recommendations with target segments, priority channels, messaging, and launch phases
      2. Market penetration forecast for month 1, 3, 6, and 12
      3. CAC optimization opportunities
      4. Launch timeline risks with mitigation plans
      5. Overall confidence score (0-100)
    `,
  });

  inferenceCache.set(cacheKey, object);
  return object;
}

export async function validateGTMAnalysis(
  analysis: GTMOutput,
  historicalData: Array<{ campaign: string; actualPerformance: number; predictedPerformance: number }>
): Promise<number> {
  const totalPredictions = historicalData.length;
  if (totalPredictions === 0) return 0;

  let correctPredictions = 0;
  historicalData.forEach((point) => {
    const error = Math.abs(point.actualPerformance - point.predictedPerformance);
    if (error <= point.predictedPerformance * 0.15) {
      correctPredictions++;
    }
  });

  return (correctPredictions / totalPredictions) * 100;
}
