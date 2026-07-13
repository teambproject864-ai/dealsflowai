
import { NextResponse } from "next/server";
import { getEcosystem } from "@/lib/a2a/integration-layer";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const ecosystem = getEcosystem();
    const metrics = ecosystem.getMessageBus().getLogger().getMetrics();
    const systemStates = ecosystem.getAllSystemStates();

    return NextResponse.json({
      success: true,
      metrics,
      systemStates: Object.fromEntries(systemStates.entries()),
      retryQueue: ecosystem.getMessageBus().getRetryManager().getRetryQueue(),
    });
  } catch (error: any) {
    console.error("[Integrated Ecosystem] Metrics error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get metrics" },
      { status: 500 }
    );
  }
}
