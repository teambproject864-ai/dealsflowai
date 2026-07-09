import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/firebase-admin";
import { requireAuth, hashPassword } from "@/lib/auth";
import { validatePasswordStrength } from "@/lib/security";
import bcrypt from "bcrypt";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Only admins can create agents
  const { user: currentUser, errorResponse } = await requireAuth(request, ["admin"]);
  if (errorResponse) return errorResponse;

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

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    // Check if agent with same email already exists
    const usersSnapshot = await db.collection("users").where("email", "==", email.toLowerCase()).get();
    if (!usersSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const newAgentId = `agent-${Date.now().toString(36)}`;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newAgent = {
      id: newAgentId,
      name,
      email: email.toLowerCase(),
      role,
      phoneNumber,
      countryCode,
      callConversationFramework,
      whatsAppMessageParameters,
      hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    await db.collection("users").doc(newAgentId).set(newAgent);

    // Log audit trail
    await db.collection("audit_logs").add({
      id: `audit-${Date.now()}`,
      actionType: "agent_activity",
      actionDetails: `Admin created agent account: ${name} (${email})`,
      performedBy: currentUser!.id,
      performedByRole: currentUser!.role,
      targetId: newAgentId,
      targetType: "agent",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Agent account created successfully",
      agent: { id: newAgentId, name, email, role, phoneNumber, createdAt: newAgent.createdAt },
    });
  } catch (error) {
    console.error("[admin-agents-create] Error creating agent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create agent account" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAuth(request, ["admin", "agent"]);
  if (errorResponse) return errorResponse;

  try {
    let agents: any[] = [];
    
    if (db) {
      const snapshot = await db.collection("users").where("role", "==", "agent").get();
      snapshot.forEach(doc => {
        const data = doc.data();
        // remove sensitive field hashedPassword in GET response
        const { hashedPassword, ...cleanAgent } = data;
        agents.push(cleanAgent);
      });
      // Sort alphabetically by name
      agents.sort((a, b) => a.name.localeCompare(b.name));
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

export async function PUT(request: NextRequest) {
  const { user: currentUser, errorResponse } = await requireAuth(request, ["admin"]);
  if (errorResponse) return errorResponse;

  try {
    const { agentId, name, email, phoneNumber, newPassword } = await request.json().catch(() => ({}));

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: "Agent ID is required" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 550 });
    }

    const agentRef = db.collection("users").doc(agentId);
    const doc = await agentRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 6 characters" },
          { status: 400 }
        );
      }
      updateData.hashedPassword = bcrypt.hashSync(newPassword, 10);
    }

    await agentRef.update(updateData);

    // Log audit trail
    await db.collection("audit_logs").add({
      id: `audit-${Date.now()}`,
      actionType: "agent_activity",
      actionDetails: `Admin updated agent ${agentId} details ${newPassword ? "(password reset included)" : ""}`,
      performedBy: currentUser!.id,
      performedByRole: currentUser!.role,
      targetId: agentId,
      targetType: "agent",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Agent updated successfully",
    });
  } catch (error) {
    console.error("[admin-agents-update] Error updating agent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update agent" },
      { status: 550 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { user: currentUser, errorResponse } = await requireAuth(request, ["admin"]);
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(request.url);
    const agentId = url.searchParams.get("agentId");

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: "Agent ID is required" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    await db.collection("users").doc(agentId).delete();

    // Reassign all customers assigned to this agent to empty/unassigned
    const customersSnap = await db.collection("customers").where("assignedAgentId", "==", agentId).get();
    const batch = db.batch();
    customersSnap.forEach((doc) => {
      batch.update(doc.ref, {
        assignedAgentId: "",
        assignedAgentName: "",
        updatedAt: new Date().toISOString(),
      });
    });
    await batch.commit();

    // Log audit trail
    await db.collection("audit_logs").add({
      id: `audit-${Date.now()}`,
      actionType: "agent_activity",
      actionDetails: `Admin deleted agent ID: ${agentId}`,
      performedBy: currentUser!.id,
      performedByRole: currentUser!.role,
      targetId: agentId,
      targetType: "agent",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Agent deleted and customer assignments cleared successfully",
    });
  } catch (error) {
    console.error("[admin-agents-delete] Error deleting agent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete agent" },
      { status: 500 }
    );
  }
}
