import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { buildAnalysisUserPrompt } from "@/lib/prompts";
import * as cheerio from "cheerio";

function getHfOpenAI() {
  return createOpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.HUGGINGFACE_API_TOKEN || process.env.HUGGINGFACE_API_KEY || "dummy",
  });
}

export const AnalysisState = Annotation.Root({
  companyData: Annotation<any>(),
  websiteContent: Annotation<string>(),
  analysisResult: Annotation<any>(),
  error: Annotation<string>(),
});

async function scrapeWebsiteNode(state: typeof AnalysisState.State) {
  try {
    const url = state.companyData?.websiteUrl;
    if (!url) {
      return { websiteContent: "No website provided." };
    }

    const fullUrl = url.startsWith("http") ? url : `https://${url}`;

    const response = await fetch(fullUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return { websiteContent: `Failed to scrape website: ${response.statusText}` };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $("script, style, noscript, iframe, img, svg").remove();

    let text = $("body").text();
    text = text.replace(/\s+/g, " ").trim();

    const truncatedText = text.substring(0, 4000);

    return { websiteContent: truncatedText };
  } catch (error) {
    console.error("Scraping error:", error);
    return {
      websiteContent: `Failed to scrape website: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function generateObjectWithRetry(params: any, maxRetries = 3, initialDelay = 1000) {
  let attempt = 0;
  while (true) {
    try {
      return await generateObject(params);
    } catch (error: any) {
      attempt++;
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (attempt >= maxRetries) {
        throw error;
      }

      const delay = initialDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      console.error(`[HF Inference API] Attempt ${attempt} failed: ${errorMessage}`);
    }
  }
}

const sectionSchema = z.object({
  title: z.string(),
  content: z.string(),
});

async function analyzeCompany(state: typeof AnalysisState.State) {
  try {
    const prompt = buildAnalysisUserPrompt(
      {
        companyName: state.companyData?.companyName || "Unknown",
        websiteUrl: state.companyData?.websiteUrl || "",
      },
      state.websiteContent
    );
    const hfOpenAI = getHfOpenAI();

    const { object } = await generateObjectWithRetry({
      model: hfOpenAI.chat("meta-llama/Meta-Llama-3-8B-Instruct"),
      mode: "json",
      system:
        "You are a senior GTM analyst. You MUST respond in pure JSON matching the requested schema. Never include call scripts or email scripts.",
      prompt,
      schema: z.object({
        healthScore: z.number().int().min(0).max(100),
        gtmPlan: z.string(),
        idealCustomerProfiles: z.array(sectionSchema).min(1),
        comprehensiveBrandOverview: z.string(),
        strategicOutreachApproach: z.string(),
        marketDifferentiationTriggers: z.array(z.string()).min(1),
        goToMarketCoreFramework: z.string(),
        customerJourneyPipeline: z.array(sectionSchema).min(1),
      }),
    });

    return { analysisResult: object };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze";
    console.error("[Analysis Graph] Node execution error:", error);
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
