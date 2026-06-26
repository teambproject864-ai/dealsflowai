import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "agent") {
      return NextResponse.json({ success: false, error: "Not authenticated as agent" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({
        success: true,
        settings: {
          phoneNumber: "",
          countryCode: "US",
          callConversationFramework: "",
          whatsAppMessageParameters: "",
        }
      });
    }

    const agentDoc = await db.collection("users").doc(user.id).get();
    if (!agentDoc.exists) {
      return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 });
    }

    const data = agentDoc.data();
    return NextResponse.json({
      success: true,
      settings: {
        phoneNumber: data?.phoneNumber || "",
        countryCode: data?.countryCode || "US",
        callConversationFramework: data?.callConversationFramework || "",
        whatsAppMessageParameters: data?.whatsAppMessageParameters || "",
      }
    });
  } catch (error: any) {
    console.error("[AgentSettingsGET] Error fetching settings:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "agent") {
      return NextResponse.json({ success: false, error: "Not authenticated as agent" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { phoneNumber, countryCode, callConversationFramework, whatsAppMessageParameters } = body;

    if (!db) {
      return NextResponse.json({ success: true, message: "Mock updated successfully (db not configured)" });
    }

    await db.collection("users").doc(user.id).set({
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(countryCode !== undefined && { countryCode }),
      ...(callConversationFramework !== undefined && { callConversationFramework }),
      ...(whatsAppMessageParameters !== undefined && { whatsAppMessageParameters }),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error: any) {
    console.error("[AgentSettingsPATCH] Error updating settings:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
