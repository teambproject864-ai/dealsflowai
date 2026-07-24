// app/api/admin/llm-pipeline/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { dealflowLLM, pipelineManager } from "@/lib/dealflow-llm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await requireAuth(req, ["admin", "agent"]);
  if (errorResponse) return errorResponse;

  try {
    const status = pipelineManager.getPipelineStatus();
    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    console.error("[LLMPipelineAPI] GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await requireAuth(req, ["admin"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { action, prompt, referenceContent } = body;

    if (action === "trigger_pipeline") {
      const samplePrompt = prompt || "Optimize RevOps outbound pipeline and calculate customer LTV";
      const result = await dealflowLLM.evaluateAndConditionallyRetrain(
        samplePrompt,
        referenceContent || "High converting B2B campaign strategy reference."
      );
      return NextResponse.json({
        success: true,
        message: result.retrained ? "Pipeline executed retraining and benchmark evaluation." : "Model passed benchmarks. Production configuration maintained.",
        result
      });
    }

    if (action === "rollback") {
      const rollbackResult = pipelineManager.executeRollback();
      return NextResponse.json({
        success: true,
        data: rollbackResult
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action requested" }, { status: 400 });
  } catch (error: any) {
    console.error("[LLMPipelineAPI] POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
