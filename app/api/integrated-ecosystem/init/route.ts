
import { NextResponse } from "next/server";
import { getEcosystem } from "@/lib/a2a/integration-layer";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const ecosystem = getEcosystem();
    await ecosystem.initializeEcosystem();

    const metrics = ecosystem.getMessageBus().getLogger().getMetrics();
    const systemStates = ecosystem.getAllSystemStates();

    return NextResponse.json({
      success: true,
      message: "Unified ecosystem initialized successfully",
      metrics,
      systemStates: Object.fromEntries(systemStates.entries()),
    });
  } catch (error: any) {
    console.error("[Integrated Ecosystem] Init error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initialize ecosystem" },
      { status: 500 }
    );
  }
}
