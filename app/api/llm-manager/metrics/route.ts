
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { llmManager } from "@/lib/llm-manager";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { user } = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const metrics = llmManager.getMetrics();
    const interactions = llmManager.getInteractions(50);

    return NextResponse.json({
      success: true,
      metrics,
      recentInteractions: interactions,
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "failed_to_get_metrics" },
      { status: 500 }
    );
  }
}

