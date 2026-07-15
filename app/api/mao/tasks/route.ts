import { NextResponse } from "next/server";
import { getMAOOrchestrator } from "@/lib/mao";

export async function GET() {
  const orchestrator = getMAOOrchestrator();
  return NextResponse.json({
    success: true,
    data: orchestrator.getTasks(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { type, customerId, inputData, priority = "medium" } = body;
  const orchestrator = getMAOOrchestrator();
  
  const taskId = orchestrator.submitTask(type, customerId, inputData, priority);
  
  return NextResponse.json({
    success: true,
    data: { taskId },
  });
}
