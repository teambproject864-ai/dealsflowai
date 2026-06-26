import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const {
      name,
      email,
      password,
      role = "agent",
      phoneNumber = "",
      countryCode = "US",
      callConversationFramework = "",
      whatsAppMessageParameters = ""
    } = await request.json().catch(() => ({}));

    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if agent with same email already exists
    if (db) {
      const usersSnapshot = await db.collection("users").where("email", "==", email).get();
      if (!usersSnapshot.empty) {
        return NextResponse.json(
          { success: false, error: "User with this email already exists" },
          { status: 409 }
        );
      }
    }

    const newAgentId = `agent-${Date.now().toString(36)}`;
    const newAgent = {
      id: newAgentId,
      name,
      email,
      role,
      phoneNumber,
      countryCode,
      callConversationFramework,
      whatsAppMessageParameters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    // Save to Firestore if available
    if (db) {
      await db.collection("users").doc(newAgentId).set(newAgent);
    }

    return NextResponse.json({
      success: true,
      message: "Agent account created successfully",
      agent: newAgent,
    });
  } catch (error) {
    console.error("[admin-agents-create] Error creating agent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create agent account" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    let agents: any[] = [];
    
    if (db) {
      const snapshot = await db.collection("users").where("role", "==", "agent").get();
      snapshot.forEach(doc => {
        agents.push(doc.data());
      });
    }

    return NextResponse.json({
      success: true,
      agents,
    });
  } catch (error) {
    console.error("[admin-agents-list] Error fetching agents:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
