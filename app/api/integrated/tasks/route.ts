import { NextRequest, NextResponse } from "next/server";
import { getOrchestrator, initializeIntegratedSystem } from "@/lib/integrated-system";

export async function GET(request: NextRequest) {
  try {
    initializeIntegratedSystem();
    const orchestrator = getOrchestrator();
    const tasks = orchestrator.getAllTasks();
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeIntegratedSystem();
    const orchestrator = getOrchestrator();
    const body = await request.json();
    
    const task = orchestrator.createTask(body);
    return NextResponse.json({ success: true, task });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
