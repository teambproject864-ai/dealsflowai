import { NextResponse } from "next/server";
import { analysisGraph } from "@/lib/agents/analysisGraph";
import { v4 as uuidv4 } from "uuid";
import { getInMemoryLeads, getInMemoryAnalyses } from "@/lib/memory-storage";
import { ExtendedLeadRecord } from "@/lib/types";
import { checkRateLimitSensitive } from "@/lib/rate-limiter-middleware";
import { db } from "@/lib/firebase-admin";
import { encryptLead, decryptLead } from "@/lib/security";
import { logAuditEvent } from "@/lib/audit-logger";
import { terminateLLMJobsForAnalysis } from "@/lib/llm-job-tracker";

export const maxDuration = 120; // Extended from 60 to allow more time
export const dynamic = "force-dynamic";

const inMemoryLeads = getInMemoryLeads();
const inMemoryAnalyses = getInMemoryAnalyses();

// Performance monitoring store
interface AnalysisPerformanceEntry {
  analysisId: string;
  startTime: number;
  durationMs: number;
  success: boolean;
  modelUsed?: string;
}
const performanceEntries: AnalysisPerformanceEntry[] = [];

// Endpoint to get performance metrics
export async function GET() {
  return NextResponse.json({
    success: true,
    metrics: performanceEntries.slice(-50), // Last 50 entries
    stats: {
      total: performanceEntries.length,
      successCount: performanceEntries.filter(e => e.success).length,
      avgDurationMs: performanceEntries.length > 0 
        ? Math.round(performanceEntries.reduce((sum, e) => sum + e.durationMs, 0) / performanceEntries.length) 
        : 0
    }
  });
}

export async function POST(req: Request) {
  const startTime = Date.now();
  let success = false;
  let analysisId: string | undefined;

  // Check rate limit first
  const rateLimitResponse = await checkRateLimitSensitive(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    console.log("[analyze/route] Starting analysis request...");
    const { leadId, companyData: providedData } = await req.json();

    // Generate analysis ID early to track LLM jobs
    analysisId = uuidv4();

    let companyData = providedData;
    if (!companyData && leadId) {
      companyData = inMemoryLeads.get(leadId);
      if (!companyData && db) {
        const doc = await db.collection("leads").doc(leadId).get();
        if (doc.exists) {
          companyData = decryptLead(doc.data() as ExtendedLeadRecord);
          inMemoryLeads.set(leadId, companyData as ExtendedLeadRecord);
        }
      }
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

    // Add analysisId to companyData so it's available in analysisGraph
    const companyDataWithAnalysisId = { ...companyData, analysisId };

    console.log("[analyze/route] Invoking analysis graph...");
    const graphState = await analysisGraph.invoke({ companyData: companyDataWithAnalysisId });

    if (graphState.error) {
      throw new Error(graphState.error);
    }

    const analysis = graphState.analysisResult;
    success = true;

    const analysisRecord = {
      id: analysisId,
      leadId,
      companyName: companyData.companyName || null,
      ...analysis,
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore
    if (db) {
      await db.collection("analyses").doc(analysisId).set(analysisRecord);
    }
    
    // Log audit event
    await logAuditEvent(req, leadId || "unauth-analysis", "ANALYSIS_RUN", { analysisId, companyName: companyData.companyName });
    inMemoryAnalyses.set(analysisId, analysisRecord);

    if (leadId) {
      let leadRecord = inMemoryLeads.get(leadId);
      if (!leadRecord && db) {
        const doc = await db.collection("leads").doc(leadId).get();
        if (doc.exists) {
          leadRecord = decryptLead(doc.data() as ExtendedLeadRecord);
        }
      }
      
      if (leadRecord) {
        const updatedLead = {
          ...leadRecord,
          analysisId,
        };
        if (db) {
          await db.collection("leads").doc(leadId).set(encryptLead(updatedLead));
        }
        inMemoryLeads.set(leadId, updatedLead);
      }
    }

    console.log("[analyze/route] Analysis complete, returning response");
    return NextResponse.json({
      success: true,
      analysisId,
      leadId,
      companyName: companyData.companyName || null,
      ...analysis,
    });
  } catch (error) {
    console.error("[analyze/route] Error analyzing company:", error);
    const message = error instanceof Error ? error.message : "Failed to analyze company";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    // Terminate all LLM jobs associated with this analysis, whether successful or failed
    if (analysisId) {
      try {
        console.log(`[analyze/route] Terminating LLM jobs for analysis ${analysisId}`);
        terminateLLMJobsForAnalysis(`gtm-analysis-${analysisId}`);
      } catch (terminateErr) {
        console.error(`[analyze/route] Failed to terminate LLM jobs for analysis ${analysisId}:`, terminateErr);
      }
    }

    // Record performance metrics
    const durationMs = Date.now() - startTime;
    console.log(`[analyze/route] Request complete. Duration: ${durationMs}ms, Success: ${success}`);
    
    if (analysisId) {
      performanceEntries.push({
        analysisId,
        startTime,
        durationMs,
        success
      });
      // Keep only last 100 entries
      if (performanceEntries.length > 100) {
        performanceEntries.shift();
      }
    }
  }
}
