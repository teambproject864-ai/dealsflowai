import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getInMemoryAnalyses } from "@/lib/memory-storage";
import { loadServiceAccount } from "@/lib/service-account";
import { checkRateLimitSensitive } from "@/lib/rate-limiter-middleware";

export const dynamic = "force-dynamic";

const inMemoryAnalyses = getInMemoryAnalyses();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await checkRateLimitSensitive(req);
  if (rateLimitResponse) return rateLimitResponse;
  try {
    const { id: analysisId } = await params;

    const cached = inMemoryAnalyses.get(analysisId);
    if (cached) {
      return NextResponse.json({
        success: true,
        analysisId: cached.analysisId || analysisId,
        leadId: cached.leadId,
        ...cached,
      });
    }

    if (!loadServiceAccount()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Analysis not found in session. Configure FIREBASE_SERVICE_ACCOUNT_PATH (e.g. ./dealflow_firebase.json) or re-run analysis.",
        },
        { status: 404 }
      );
    }

    const analysisDoc = await db.collection("analyses").doc(analysisId).get();

    if (!analysisDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      analysisId: analysisDoc.id,
      ...analysisDoc.data(),
    });
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}
