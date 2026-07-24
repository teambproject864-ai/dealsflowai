import { NextResponse } from "next/server";
import { analyzeGTMStrategy, validateGTMAnalysis } from "@/lib/gtm-llm/gtm-llm-service";
import { GTMInputSchema } from "@/lib/gtm-llm/types";
import { isModelAllowedForRole, getModelById } from "@/lib/model-registry";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();
    
    if (body.modelId) {
      const userRole = user?.role || "customer";
      if (!isModelAllowedForRole(body.modelId, userRole)) {
        const model = getModelById(body.modelId);
        return NextResponse.json(
          {
            success: false,
            error: `Model '${model?.name || body.modelId}' is not authorized for role '${userRole}'.`
          },
          { status: 403 }
        );
      }
    }

    const input = GTMInputSchema.parse(body);
    const result = await analyzeGTMStrategy(input);

    return NextResponse.json({
      success: true,
      data: result,
      modelUsed: body.modelId || "default"
    });

  } catch (error) {
    console.error("GTM Analysis Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const historicalData = [
      { campaign: "Campaign 1", actualPerformance: 12, predictedPerformance: 10 },
      { campaign: "Campaign 2", actualPerformance: 20, predictedPerformance: 22 },
      { campaign: "Campaign 3", actualPerformance: 8, predictedPerformance: 9 },
    ];

    const validationScore = await validateGTMAnalysis({} as any, historicalData);

    return NextResponse.json({
      success: true,
      validationScore,
      targetScore: 85,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
      },
      { status: 500 }
    );
  }
}
