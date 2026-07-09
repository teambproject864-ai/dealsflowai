import { NextRequest, NextResponse } from "next/server";
import { getOrchestrator, initializeIntegratedSystem } from "@/lib/integrated-system";

export async function GET(request: NextRequest) {
  try {
    initializeIntegratedSystem();
    const orchestrator = getOrchestrator();
    const stats = orchestrator.getStatistics();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
