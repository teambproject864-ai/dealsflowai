import { NextResponse } from "next/server";
import { getMAOOrchestrator } from "@/lib/mao";

export async function GET() {
  const orchestrator = getMAOOrchestrator();
  return NextResponse.json({
    success: true,
    data: orchestrator.getAgents(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, count = 1 } = body;
  const orchestrator = getMAOOrchestrator();
  
  if (action === "scaleUp") {
    orchestrator.scaleUp(count);
  } else if (action === "scaleDown") {
    orchestrator.scaleDown(count);
  }
  
  return NextResponse.json({
    success: true,
    data: orchestrator.getAgents(),
  });
}
