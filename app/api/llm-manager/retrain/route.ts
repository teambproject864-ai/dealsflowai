
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { llmManager } from "@/lib/llm-manager";
import { orchestrationManager } from "@/lib/llm-manager/orchestration";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { user } = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const interactions = llmManager.getInteractions(100);
    const newModel = await orchestrationManager.retrainModel(interactions);

    return NextResponse.json({
      success: true,
      model: newModel,
      message: "Retraining initiated successfully",
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "failed_to_retrain_model" },
      { status: 500 }
    );
  }
}

