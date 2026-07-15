import { NextResponse } from "next/server";
import { getMAOOrchestrator } from "@/lib/mao";

export async function GET() {
  const orchestrator = getMAOOrchestrator();
  return NextResponse.json({
    success: true,
    data: orchestrator.getMetrics(),
  });
}
