import { NextResponse } from "next/server";
import { requireAuth, addAuditLog } from "@/lib/auth";
import { getAgentByKey } from "@/lib/types";
import { ExtendedLeadRecord } from "@/lib/types";
import { getInMemoryLeads, getInMemoryAgentAssignments } from "@/lib/memory-storage";
import { db } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/notifications";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // ── Authentication & Authorization ────────────────────────
  const { user, errorResponse } = await requireAuth(req, ["admin"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { leadId, newAgentKey } = body;

    if (!leadId || !newAgentKey) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters (leadId, newAgentKey)" },
        { status: 400 }
      );
    }

    // 1. Fetch the lead record
    const leadsMap = getInMemoryLeads();
    let lead = leadsMap.get(leadId);
    if (!lead && db) {
      const doc = await db.collection("leads").doc(leadId).get();
      if (doc.exists) {
        lead = doc.data() as ExtendedLeadRecord;
      }
    }

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Requirement (Lead) not found" },
        { status: 404 }
      );
    }

    const outgoingAgentKey = lead.assignedAgentKey || "unassigned";
    const companyName = lead.companyName || "Company";
    const customerName = lead.contactName || "Customer";
    const customerEmail = lead.contactEmail || "";

    if (outgoingAgentKey === newAgentKey) {
      return NextResponse.json(
        { success: false, error: "New agent is already assigned to this requirement" },
        { status: 400 }
      );
    }

    // 2. Fetch the new agent profile
    const { getAgentByKey: getAgentProfile } = await import("@/lib/types");
    const newAgentProfile = getAgentProfile(newAgentKey);
    if (!newAgentProfile) {
      return NextResponse.json(
        { success: false, error: `New agent profile not found for: ${newAgentKey}` },
        { status: 404 }
      );
    }

    const outgoingAgentProfile = getAgentProfile(outgoingAgentKey as any);
    const outgoingAgentName = outgoingAgentProfile?.name || "Unassigned";

    // 3. Perform Reassignment in memory and Firestore
    const updatedLead = {
      ...lead,
      assignedAgentKey: newAgentKey,
      updatedAt: new Date().toISOString(),
    };
    leadsMap.set(leadId, updatedLead);

    if (db) {
      await db.collection("leads").doc(leadId).set(updatedLead);
    }

    // 4. Create/update assignment record
    const assignmentId = lead.agentAssignmentId || uuidv4();
    const assignment = {
      id: assignmentId,
      leadId,
      agentKey: newAgentKey,
      agentName: newAgentProfile.name,
      assignedAt: new Date().toISOString(),
      status: "active" as const,
    };
    getInMemoryAgentAssignments().set(assignmentId, assignment);

    if (db) {
      await db.collection("agent_assignments").doc(assignmentId).set(assignment);
    }

    const nowStr = new Date().toISOString();

    // 5. In-app notifications
    if (db) {
      // Notification for incoming agent
      await db.collection("in_app_notifications").add({
        id: uuidv4(),
        userId: newAgentKey,
        role: "agent",
        title: "Requirement Assigned",
        description: `You have been newly assigned to ${companyName}'s requirement request, replacing ${outgoingAgentName}.`,
        type: "success",
        createdAt: nowStr,
        unread: true,
      });

      // Notification for outgoing agent
      if (outgoingAgentKey !== "unassigned") {
        await db.collection("in_app_notifications").add({
          id: uuidv4(),
          userId: outgoingAgentKey,
          role: "agent",
          title: "Requirement Unassigned",
          description: `You have been unassigned from ${companyName}. The requirement was reassigned to ${newAgentProfile.name}.`,
          type: "warning",
          createdAt: nowStr,
          unread: true,
        });
      }

      // Notification for customer
      const leadWithCustomer = lead as ExtendedLeadRecord & { customerId?: string };
      if (leadWithCustomer.customerId) {
        await db.collection("in_app_notifications").add({
          id: uuidv4(),
          userId: leadWithCustomer.customerId,
          role: "customer",
          title: "Agent Reassigned",
          description: `Your assigned Agent has been updated. ${newAgentProfile.name} is now handling your request.`,
          type: "info",
          createdAt: nowStr,
          unread: true,
        });
      }
    }

    // 6. Email notifications
    try {
      const adminEmail = user?.email || "admin@dealflow.ai";
      const incomingAgentEmail = `${newAgentKey}@dealflow.ai`;
      const outgoingAgentEmail = outgoingAgentKey !== "unassigned" ? `${outgoingAgentKey}@dealflow.ai` : null;

      // Email to customer
      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject: `[DealFlow] Your assigned agent has been updated`,
          body: `
            <h3>Hello ${customerName},</h3>
            <p>We wanted to let you know that the assigned agent for your requirement at <strong>${companyName}</strong> has been updated.</p>
            <p><strong>New Assigned Agent:</strong> ${newAgentProfile.name}</p>
            <p>You can contact your new agent directly inside the Customer Portal chat.</p>
            <p>Best regards,<br>The DealFlow Team</p>
          `
        });
      }

      // Email to newly assigned agent
      await sendEmail({
        to: incomingAgentEmail,
        subject: `[DealFlow] New Requirement Reassignment: ${companyName}`,
        body: `
          <h3>Hello ${newAgentProfile.name},</h3>
          <p>You have been assigned to a customer requirement request, replacing ${outgoingAgentName}:</p>
          <ul>
            <li><strong>Company:</strong> ${companyName}</li>
            <li><strong>Customer Name:</strong> ${customerName}</li>
            <li><strong>Customer Email:</strong> ${customerEmail}</li>
          </ul>
          <p>Please log in to your Agent Portal to view details and start working.</p>
        `
      });

      // Email to outgoing agent
      if (outgoingAgentEmail) {
        await sendEmail({
          to: outgoingAgentEmail,
          subject: `[DealFlow] Assignment Transferred: ${companyName}`,
          body: `
            <h3>Hello ${outgoingAgentName},</h3>
            <p>Your assignment for <strong>${companyName}</strong> has been transferred to <strong>${newAgentProfile.name}</strong>.</p>
            <p>No further action is required from your side.</p>
          `
        });
      }
    } catch (emailError: any) {
      console.warn("[AdminReassignment Notification] Email delivery skipped/failed:", emailError.message);
    }

    // 7. Log to security audit trail
    const ip = (req as any).ip || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const auditEmail = user?.email || "admin@dealflow.ai";
    addAuditLog(
      auditEmail,
      "admin",
      true,
      `Agent reassigned for ${companyName} (Lead ID: ${leadId}) from ${outgoingAgentName} (${outgoingAgentKey}) to ${newAgentProfile.name} (${newAgentKey})`,
      ip,
      userAgent
    );

    return NextResponse.json({ success: true, newAgentName: newAgentProfile.name });
  } catch (error: any) {
    console.error("[Reassign Agent Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reassign agent" },
      { status: 500 }
    );
  }
}
