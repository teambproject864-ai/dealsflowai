import { NextRequest, NextResponse } from "next/server";
import { getOrchestrator, initializeIntegratedSystem } from "@/lib/integrated-system";

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    initializeIntegratedSystem();
    const orchestrator = getOrchestrator();
    const task = orchestrator.getTask(params.taskId);
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, task });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
