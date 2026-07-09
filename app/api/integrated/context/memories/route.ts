import { NextRequest, NextResponse } from "next/server";
import { getContextGraph, initializeIntegratedSystem } from "@/lib/integrated-system";

export async function GET(request: NextRequest) {
  try {
    initializeIntegratedSystem();
    const contextGraph = getContextGraph();
    const store = contextGraph.getStore();
    
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId") || undefined;
    
    const memories = agentId 
      ? store.getAgentMemories(agentId)
      : store.queryMemories({});
    
    return NextResponse.json({ success: true, memories });
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
    const contextGraph = getContextGraph();
    const body = await request.json();
    
    let memory;
    switch (body.type) {
      case "interaction":
        memory = contextGraph.storeInteraction(body.agentId, body.content, body.options);
        break;
      case "state":
        memory = contextGraph.storeAgentState(body.agentId, body.state, body.options);
        break;
      case "task-outcome":
        memory = contextGraph.storeTaskOutcome(body.agentId, body.taskId, body.outcome, body.options);
        break;
      case "shared":
        memory = contextGraph.storeSharedContext(body.agentId, body.context, body.accessList, body.options);
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Invalid memory type" },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ success: true, memory });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
