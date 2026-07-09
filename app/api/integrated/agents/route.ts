import { NextRequest, NextResponse } from "next/server";
import { getOrchestrator, initializeIntegratedSystem } from "@/lib/integrated-system";

export async function GET(request: NextRequest) {
  try {
    initializeIntegratedSystem();
    const orchestrator = getOrchestrator();
    const agents = orchestrator.getAllAgents();
    return NextResponse.json({ success: true, agents });
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
    
    const agent = orchestrator.registerAgent(body);
    return NextResponse.json({ success: true, agent });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
