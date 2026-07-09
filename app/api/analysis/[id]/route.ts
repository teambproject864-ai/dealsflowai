import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getInMemoryAnalyses } from "@/lib/memory-storage";
import { loadServiceAccount } from "@/lib/service-account";
import { checkRateLimitSensitive } from "@/lib/rate-limiter-middleware";
import { cached } from "@/lib/cache";

export const dynamic = "force-dynamic";

const inMemoryAnalyses = getInMemoryAnalyses();

function pickFields(obj: any, fields: string[]): any {
  if (!fields || fields.length === 0) return obj;
  const result: any = {};
  fields.forEach(field => {
    const parts = field.split('.');
    let current = obj;
    let target = result;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        if (current && current[part] !== undefined) {
          target[part] = current[part];
        }
      } else {
        if (!target[part]) target[part] = {};
        target = target[part];
        current = current && current[part];
      }
    }
  });
  return result;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await checkRateLimitSensitive(req);
  if (rateLimitResponse) return rateLimitResponse;
  try {
    const { id: analysisId } = await params;
    const url = new URL(req.url);
    const fieldsParam = url.searchParams.get('fields');
    const fields = fieldsParam ? fieldsParam.split(',') : [];

    const memoryCached = inMemoryAnalyses.get(analysisId);
    if (memoryCached) {
      console.log(`[Cache HIT] Analysis (in-memory): ${analysisId}`);
      const responseData = {
        success: true,
        analysisId: memoryCached.analysisId || analysisId,
        leadId: memoryCached.leadId,
        ...pickFields(memoryCached, fields),
      };
      return NextResponse.json(responseData);
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

    // Use our LRU cache for analysis data
    const analysisData = await cached(
      `analysis:${analysisId}`,
      async () => {
        console.log(`[Cache MISS] Analysis: ${analysisId}`);
        if (!db) return null;
        const analysisDoc = await db.collection("analyses").doc(analysisId).get();
        if (!analysisDoc.exists) {
          return null;
        }
        // Store in in-memory analysis store too
        const data = { ...analysisDoc.data(), id: analysisDoc.id };
        inMemoryAnalyses.set(analysisId, data as any);
        return data;
      },
      { ttl: 1000 * 60 * 30 } // 30-minute TTL for analysis data
    );

    if (!analysisData) {
      return NextResponse.json(
        { success: false, error: "Analysis not found" },
        { status: 404 }
      );
    }

    const responseData = {
      success: true,
      analysisId: analysisId,
      ...pickFields(analysisData, fields),
    };

    // Add cache-control headers for static content
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=300, s-maxage=900');

    return NextResponse.json(responseData, { headers });
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}
