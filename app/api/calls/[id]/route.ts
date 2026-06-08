import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: callId } = await params;
    const callDoc = await db.collection("calls").doc(callId).get();

    if (!callDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Call not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      callId: callDoc.id,
      ...callDoc.data(),
    });
  } catch (error) {
    console.error("Error fetching call:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch call" },
      { status: 500 }
    );
  }
}
