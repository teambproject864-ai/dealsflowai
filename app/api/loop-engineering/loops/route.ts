
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";
import { LoopEngine, LoopConfiguration, LoopPhase } from "@/lib/loop-engineering";
import { KimiClient } from "@/lib/kimi";

let loopEngine: LoopEngine | null = null;

function getLoopEngine(): LoopEngine {
  if (!loopEngine) {
    const kimiClient = new KimiClient();
    loopEngine = new LoopEngine(kimiClient);
  }
  return loopEngine;
}

export async function GET() {
  try {
    const engine = getLoopEngine();
    const loops = engine.getAllLoops();
    return NextResponse.json(loops);
  } catch (error) {
    console.error("Error fetching loops:", error);
    return NextResponse.json({ error: "Failed to fetch loops" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const engine = getLoopEngine();
    const body = await request.json();
    const config: LoopConfiguration = {
      id: v4(),
      name: body.name,
      projectId: body.projectId,
      maxIterations: body.maxIterations || 10,
      targetErrorRate: body.targetErrorRate || 0.1,
      enableSelfImprovement: body.enableSelfImprovement !== false,
      phases: body.phases || [
        LoopPhase.REQUIREMENT_PARSE,
        LoopPhase.TASK_DECOMPOSITION,
        LoopPhase.CODE_GENERATION,
        LoopPhase.VALIDATION
      ]
    };
    const loop = engine.createLoop(config);
    return NextResponse.json(loop, { status: 201 });
  } catch (error) {
    console.error("Error creating loop:", error);
    return NextResponse.json({ error: "Failed to create loop" }, { status: 500 });
  }
}

