import { NextResponse } from "next/server";
import { listRevenueAgentsWithAvailability } from "@/lib/revenue-agents";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const agents = await listRevenueAgentsWithAvailability();
    return NextResponse.json({ success: true, agents });
  } catch (error) {
    console.error("[agents] list failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load revenue agents" },
      { status: 500 }
    );
  }
}
