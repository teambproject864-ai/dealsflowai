/**
 * POST /api/agent/genbi-chat
 * AI-powered GenBI (Generative Business Intelligence) chatbot for agents.
 *
 * Converts natural language questions to Firestore queries, executes them,
 * and returns results. Supports an error-correction loop where agents paste
 * failed query errors back and get a corrected version.
 *
 * Security:
 *  - Agent/admin only
 *  - Read-only (no writes permitted)
 *  - Rate-limited via existing middleware
 *  - Query results are scoped to the requesting agent's accessible data
 */

import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { performDynamicInference } from "@/lib/ai-provider-router";
import { checkRateLimitSensitive } from "@/lib/rate-limiter-middleware";

export const dynamic = "force-dynamic";

// ─── Allowed queryable Firestore collections ──────────────────────────────────
// Only these collections can be queried through the chatbot (security boundary)
const ALLOWED_COLLECTIONS = [
  "gtm_intakes",
  "gtm_playbooks",
  "gtm_reports",
  "leads",
  "customers",
] as const;

type AllowedCollection = typeof ALLOWED_COLLECTIONS[number];

// ─── Firestore Query Executor ─────────────────────────────────────────────────

interface ParsedQuery {
  collection: string;
  filters: Array<{ field: string; op: string; value: any }>;
  orderBy?: { field: string; direction: "asc" | "desc" };
  limit?: number;
  selectFields?: string[];
}

/**
 * Validates that the collection is in the allowlist (security check).
 */
function isAllowedCollection(col: string): col is AllowedCollection {
  return ALLOWED_COLLECTIONS.includes(col as AllowedCollection);
}

/**
 * Executes a structured Firestore query (read-only).
 * Returns an array of matching documents.
 */
async function executeFirestoreQuery(parsed: ParsedQuery): Promise<any[]> {
  if (!db) throw new Error("Database not configured");

  if (!isAllowedCollection(parsed.collection)) {
    throw new Error(`Collection '${parsed.collection}' is not accessible through this interface. Allowed: ${ALLOWED_COLLECTIONS.join(", ")}`);
  }

  let query: FirebaseFirestore.Query = db.collection(parsed.collection);

  // Apply filters
  for (const filter of parsed.filters || []) {
    const op = filter.op as FirebaseFirestore.WhereFilterOp;
    query = query.where(filter.field, op, filter.value);
  }

  // Apply ordering
  if (parsed.orderBy) {
    query = query.orderBy(parsed.orderBy.field, parsed.orderBy.direction);
  }

  // Apply limit (max 100 for safety)
  const limit = Math.min(parsed.limit || 20, 100);
  query = query.limit(limit);

  const snap = await query.get();
  const results: any[] = [];

  snap.forEach((doc) => {
    const data = doc.data();
    if (parsed.selectFields && parsed.selectFields.length > 0) {
      const selected: any = { id: doc.id };
      for (const field of parsed.selectFields) {
        if (field in data) selected[field] = data[field];
      }
      results.push(selected);
    } else {
      results.push({ id: doc.id, ...data });
    }
  });

  return results;
}

// ─── AI Prompt Builders ───────────────────────────────────────────────────────

function buildNLToQuerySystemPrompt(): string {
  return `You are a Firestore query generator for DealFlow.AI — a B2B sales automation platform. You convert natural language business questions into structured Firestore query JSON.

ALLOWED COLLECTIONS (ONLY these can be queried):
- gtm_intakes: GTM intake form submissions. Fields: id, companyName, productName, websiteUrl, targetMarketRegion, primaryUseCase, marketingBudgetAllocation, stakeholders[], createdAt, customerId, playbookStatus
- gtm_playbooks: AI-generated GTM playbooks. Fields: trackingId, customerId, productName, companyName, status (generating|ready|error), confidence (0-100), generatedAt, executiveSummary, channelStrategy, playbookSteps[], kpis[]
- gtm_reports: GTM metric reports. Fields: id, customerId, reportName, category, status, region, segment, revenue, conversionRate, cac, ltv, updatedAt
- leads: Lead records. Fields: id, name, email, company, status, createdAt, assignedAgentId
- customers: Customer profiles. Fields: id, name, email, companyName, status, createdAt

RULES:
1. Respond ONLY with valid JSON matching the schema below — no markdown, no explanation
2. If the question cannot be answered from these collections, set "error" field explaining why
3. All filter values must match the field types described above
4. Keep limits to 20 by default, max 50
5. Order by createdAt desc by default unless specified

OUTPUT SCHEMA:
{
  "collection": "collection_name",
  "filters": [{"field": "fieldName", "op": "==|<|>|<=|>=|array-contains", "value": "value"}],
  "orderBy": {"field": "createdAt", "direction": "desc"},
  "limit": 20,
  "selectFields": ["field1", "field2"],
  "explanation": "Human-readable explanation of what this query does",
  "error": null
}`;
}

function buildErrorCorrectionSystemPrompt(): string {
  return `You are a Firestore query debugger for DealFlow.AI. The user ran a Firestore query that failed. Your job is to:
1. Analyze the error message
2. Understand what went wrong (invalid field name, wrong operator, type mismatch, missing index, etc.)
3. Produce a CORRECTED query in the same JSON format

ALLOWED COLLECTIONS:
- gtm_intakes: id, companyName, productName, websiteUrl, targetMarketRegion, primaryUseCase, marketingBudgetAllocation, stakeholders[], createdAt, customerId
- gtm_playbooks: trackingId, customerId, productName, companyName, status, confidence, generatedAt
- gtm_reports: id, customerId, reportName, category, status, region, revenue, conversionRate, cac, ltv, updatedAt
- leads: id, name, email, company, status, createdAt, assignedAgentId
- customers: id, name, email, companyName, status, createdAt

RULES:
1. Respond ONLY with valid JSON — no markdown, no explanation outside the JSON
2. Include "correctionNotes" field explaining what you fixed
3. The corrected query must be syntactically valid and avoid the original error

OUTPUT SCHEMA:
{
  "collection": "collection_name",
  "filters": [...],
  "orderBy": {"field": "createdAt", "direction": "desc"},
  "limit": 20,
  "selectFields": [],
  "explanation": "What this query does",
  "correctionNotes": "What was wrong and what was changed",
  "error": null
}`;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await checkRateLimitSensitive(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Only agents and admins can use the GenBI chatbot
    if (user.role === "customer") {
      return NextResponse.json({ success: false, error: "Forbidden: GenBI chatbot is only available to agents" }, { status: 403 });
    }

    const body = await request.json();
    const {
      message,                // Natural language question
      errorContext,           // SQL/query error from previous failed attempt
      previousQuery,          // The parsed query that failed (for correction)
      executeQuery,           // If true, execute the query; if false, just return the generated query
      parsedQuery,            // Pre-built parsed query to execute (skip generation)
    } = body;

    if (!message && !parsedQuery) {
      return NextResponse.json({ success: false, error: "message or parsedQuery is required" }, { status: 400 });
    }

    // ── Mode 3: Execute a pre-generated query ──
    if (executeQuery && parsedQuery) {
      try {
        const results = await executeFirestoreQuery(parsedQuery as ParsedQuery);
        return NextResponse.json({
          success: true,
          mode: "execute",
          results,
          rowCount: results.length,
          message: `Query executed successfully. ${results.length} record(s) returned.`,
        });
      } catch (execError: any) {
        return NextResponse.json({
          success: false,
          mode: "execute",
          error: execError.message || "Query execution failed",
          errorCode: "EXEC_ERROR",
          hint: "Paste this error into the chat with 'Fix this error:' to get a corrected query.",
        });
      }
    }

    // ── Mode 2: Error correction ──
    if (errorContext && previousQuery) {
      const correctionPrompt = `The following Firestore query failed with an error.

FAILED QUERY:
${JSON.stringify(previousQuery, null, 2)}

ERROR MESSAGE:
${errorContext}

ORIGINAL USER QUESTION: ${message || "unknown"}

Please analyze the error and produce a corrected query.`;

      const rawResponse = await performDynamicInference(
        correctionPrompt,
        buildErrorCorrectionSystemPrompt(),
        { requestType: "analysis" }
      );

      let correctedQuery: any = null;
      let parseError: string | null = null;

      try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          correctedQuery = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        parseError = "Could not parse AI response as JSON";
      }

      return NextResponse.json({
        success: true,
        mode: "error_correction",
        correctedQuery,
        correctionNotes: correctedQuery?.correctionNotes || "Query corrected based on error analysis",
        explanation: correctedQuery?.explanation || "",
        parseError,
        rawResponse,
        message: correctedQuery
          ? `✓ Corrected query generated. Review it and click Execute to run.`
          : `The AI attempted to correct the query but had trouble. Raw response included for review.`,
      });
    }

    // ── Mode 1: Natural Language → Query Generation ──
    const nlPrompt = `Convert this business question to a Firestore query:\n\n"${message}"`;

    const rawResponse = await performDynamicInference(
      nlPrompt,
      buildNLToQuerySystemPrompt(),
      { requestType: "analysis" }
    );

    let generatedQuery: any = null;
    let parseError: string | null = null;

    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedQuery = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      parseError = "Could not parse AI response as JSON";
    }

    if (generatedQuery?.error) {
      return NextResponse.json({
        success: true,
        mode: "nl_to_query",
        generatedQuery: null,
        cannotAnswer: true,
        message: generatedQuery.error,
      });
    }

    return NextResponse.json({
      success: true,
      mode: "nl_to_query",
      generatedQuery,
      explanation: generatedQuery?.explanation || "Query generated from your question",
      parseError,
      message: generatedQuery
        ? `Query generated. Review it below and click Execute to run against live data.`
        : `Unable to parse the generated query. Raw response included.`,
      rawResponse: parseError ? rawResponse : undefined,
    });

  } catch (error: any) {
    console.error("[api-agent-genbi-chat] Error:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Failed to process GenBI request",
    }, { status: 500 });
  }
}
