import { NextRequest, NextResponse } from "next/server";
import { initializeIntegratedSystem } from "@/lib/integrated-system";

export async function POST(request: NextRequest) {
  try {
    const system = initializeIntegratedSystem();
    return NextResponse.json({
      success: true,
      message: "Integrated system initialized successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
