import { NextResponse } from "next/server";
import { getOrchestrator } from "@/lib/instances";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { query, data } = await req.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 }
      );
    }

    const orchestrator = getOrchestrator();
    const result = await orchestrator.runResearchWorkflow(query, data);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error in research workflow:", error);
    const message = error instanceof Error ? error.message : "Research workflow failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
