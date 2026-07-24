import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { getAgentByKey } from "@/lib/types";
import { REVENUE_AGENTS } from "@/lib/revenue-agents";

import { sendEmail } from "@/lib/notifications";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

export interface AgentChangeRequestRecord {
  id: string;
  customerId: string;
  customerName: string;
  currentAgentKey: string;
  requestedAgentKey: string;
  requestedAgentName: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

// Memory fallback store
const inMemoryRequests = new Map<string, AgentChangeRequestRecord>();

export async function POST(req: Request) {
  const { user, errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { requestedAgentKey, reason } = body;

    if (!requestedAgentKey || !reason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: requestedAgentKey, reason" },
        { status: 400 }
      );
    }

    const requestedAgent = getAgentByKey(requestedAgentKey as any);
    if (!requestedAgent) {
      return NextResponse.json(
        { success: false, error: "Requested agent not found" },
        { status: 404 }
      );
    }

    const requestRecord: AgentChangeRequestRecord = {
      id: `req-${uuidv4()}`,
      customerId: user!.id,
      customerName: user!.name || "Valued Customer",
      currentAgentKey: "agent-alpha", // default/existing assignment
      requestedAgentKey,
      requestedAgentName: requestedAgent.name,
      reason,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to memory
    inMemoryRequests.set(requestRecord.id, requestRecord);

    // Save to Firestore
    if (db) {
      await db.collection("agent_change_requests").doc(requestRecord.id).set(requestRecord);

      // In-app alert to admin
      await db.collection("in_app_notifications").add({
        id: uuidv4(),
        userId: "admin",
        role: "admin",
        title: "Agent Change Requested",
        description: `${user!.name} requested to change agent to ${requestedAgent.name}. Reason: ${reason}`,
        type: "info",
        createdAt: new Date().toISOString(),
        unread: true,
      });

      // Audit log entry with hash chain
      const payloadStr = JSON.stringify(requestRecord);
      const hash = createHash("sha256").update(payloadStr).digest("hex");
      await db.collection("audit_logs").add({
        id: `audit-${requestRecord.id}`,
        actionType: "agent_change_requested",
        actionDetails: `Customer ${user!.name} requested agent change to ${requestedAgent.name}`,
        performedBy: user!.id,
        performedByRole: user!.role,
        targetId: requestRecord.id,
        targetType: "agent_change_request",
        hash,
        createdAt: new Date().toISOString(),
      });
    }

    // Send alert email to admin
    try {
      await sendEmail({
        to: "admin@dealflow.ai",
        subject: `[DealFlow] Agent Change Requested: ${user!.name}`,
        body: `
          <h3>Agent Change Request Submitted</h3>
          <p>Customer <strong>${user!.name}</strong> (${user!.email}) has requested an agent reassignment.</p>
          <ul>
            <li><strong>Requested Agent:</strong> ${requestedAgent.name} (${requestedAgentKey})</li>
            <li><strong>Reason:</strong> ${reason}</li>
          </ul>
          <p>Log in to Admin Portal to approve or reject this request.</p>
        `,
      });
    } catch (e) {
      console.warn("[agent-change-requests POST] Email alert failed:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Agent change request submitted successfully for administrator review",
      request: requestRecord,
    });
  } catch (err: any) {
    console.error("[agent-change-requests POST] failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to submit agent change request" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { user, errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    let requests: AgentChangeRequestRecord[] = [];

    if (db) {
      const snap = await db.collection("agent_change_requests").get();
      snap.forEach(doc => requests.push(doc.data() as AgentChangeRequestRecord));
    } else {
      requests = Array.from(inMemoryRequests.values());
    }

    // Role-based filtering: customer sees only their requests, admin sees all
    if (user!.role === "customer") {
      requests = requests.filter(r => r.customerId === user!.id);
    }

    requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (err: any) {
    console.error("[agent-change-requests GET] failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch agent change requests" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const { user, errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  // Restrict approval/rejection strictly to Admin
  if (user!.role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Forbidden: Only administrators can process agent change requests" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { requestId, status, reviewNotes } = body;

    if (!requestId || !status || (status !== "approved" && status !== "rejected")) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid fields: requestId, status ('approved'|'rejected')" },
        { status: 400 }
      );
    }

    let requestRecord: AgentChangeRequestRecord | undefined;
    if (db) {
      const doc = await db.collection("agent_change_requests").doc(requestId).get();
      if (doc.exists) requestRecord = doc.data() as AgentChangeRequestRecord;
    } else {
      requestRecord = inMemoryRequests.get(requestId);
    }

    if (!requestRecord) {
      return NextResponse.json(
        { success: false, error: "Request record not found" },
        { status: 404 }
      );
    }

    requestRecord.status = status;
    requestRecord.reviewedBy = user!.name || "Admin";
    requestRecord.reviewNotes = reviewNotes || "";
    requestRecord.updatedAt = new Date().toISOString();

    // Update memory
    inMemoryRequests.set(requestId, requestRecord);

    if (db) {
      await db.collection("agent_change_requests").doc(requestId).set(requestRecord);

      if (status === "approved") {
        // Update Customer assigned agent
        await db.collection("customers").doc(requestRecord.customerId).update({
          assignedAgentId: `agent-${requestRecord.requestedAgentKey}`,
          assignedAgentName: requestRecord.requestedAgentName,
          updatedAt: new Date().toISOString(),
        });
      }

      // Notify customer
      await db.collection("in_app_notifications").add({
        id: uuidv4(),
        userId: requestRecord.customerId,
        role: "customer",
        title: `Agent Change Request ${status.toUpperCase()}`,
        description: `Your agent change request for ${requestRecord.requestedAgentName} has been ${status}.`,
        type: status === "approved" ? "success" : "warning",
        createdAt: new Date().toISOString(),
        unread: true,
      });

      // Audit Log with SHA-256
      const payloadStr = JSON.stringify(requestRecord);
      const hash = createHash("sha256").update(payloadStr).digest("hex");
      await db.collection("audit_logs").add({
        id: `audit-${requestRecord.id}-review`,
        actionType: `agent_change_request_${status}`,
        actionDetails: `Admin ${user!.name} ${status} request ${requestId}`,
        performedBy: user!.id,
        performedByRole: user!.role,
        targetId: requestId,
        targetType: "agent_change_request",
        hash,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Agent change request ${status} successfully`,
      request: requestRecord,
    });
  } catch (err: any) {
    console.error("[agent-change-requests PUT] failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update agent change request" },
      { status: 500 }
    );
  }
}
