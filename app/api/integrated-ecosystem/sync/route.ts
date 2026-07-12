
import { NextResponse } from "next/server";
import { getEcosystem } from "@/lib/a2a/integration-layer";
import { getCurrentUser } from "@/lib/auth";
import { EcosystemSystemId } from "@/lib/a2a/integration-layer";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { systemId, stateType, stateData } = body;

    if (!systemId || !stateType || !stateData) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: systemId, stateType, stateData" },
        { status: 400 }
      );
    }

    const ecosystem = getEcosystem();
    await ecosystem.sendStateSync(
      systemId as EcosystemSystemId,
      stateType,
      stateData
    );

    return NextResponse.json({
      success: true,
      message: "State sync broadcast successfully",
    });
  } catch (error: any) {
    console.error("[Integrated Ecosystem] Sync error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync state" },
      { status: 500 }
    );
  }
}
