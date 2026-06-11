import { NextResponse } from "next/server";
import { analysisGraph } from "@/lib/agents/analysisGraph";
import { v4 as uuidv4 } from "uuid";
import { getInMemoryLeads, getInMemoryAnalyses } from "@/lib/memory-storage";
import { checkRateLimit } from "@/lib/rate-limiter";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const inMemoryLeads = getInMemoryLeads();
const inMemoryAnalyses = getInMemoryAnalyses();

export async function POST(req: Request) {
  // Check rate limit first
  const rateLimitCheck = await checkRateLimit(req);
  if (!rateLimitCheck.allowed) {
    const headers = new Headers();
    if (rateLimitCheck.msBeforeNext) {
      headers.set('Retry-After', Math.ceil(rateLimitCheck.msBeforeNext / 1000).toString());
    }
    return NextResponse.json(
      { success: false, error: "Too many requests, please try again later" },
      { status: 429, headers }
    );
  }

  try {
    const { leadId, companyData: providedData } = await req.json();

    let companyData = providedData;
    if (!companyData && leadId) {
      companyData = inMemoryLeads.get(leadId);
      if (!companyData) {
        return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
      }
    }

    if (!companyData?.websiteUrl) {
      return NextResponse.json(
        { success: false, error: "Company website URL is required for GTM analysis" },
        { status: 400 }
      );
    }

    const graphState = await analysisGraph.invoke({ companyData });

    if (graphState.error) {
      throw new Error(graphState.error);
    }

    const analysis = graphState.analysisResult;
    const analysisId = uuidv4();

    inMemoryAnalyses.set(analysisId, {
      id: analysisId,
      leadId,
      companyName: companyData.companyName || null,
      ...analysis,
      createdAt: new Date().toISOString(),
    });

    if (leadId && inMemoryLeads.has(leadId)) {
      inMemoryLeads.set(leadId, {
        ...inMemoryLeads.get(leadId),
        analysisId,
      });
    }

    return NextResponse.json({
      success: true,
      analysisId,
      leadId,
      companyName: companyData.companyName || null,
      ...analysis,
    });
  } catch (error) {
    console.error("Error analyzing company:", error);
    const message = error instanceof Error ? error.message : "Failed to analyze company";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
