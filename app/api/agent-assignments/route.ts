import { NextResponse } from "next/server";
import {
  getInMemoryAgentAssignments,
  getInMemoryLeads,
} from "@/lib/memory-storage";
import { AgentAssignment, ExtendedLeadRecord, getAgentByKey } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/firebase-admin";
import { checkRateLimit } from "@/lib/rate-limiter";
import * as admin from "firebase-admin";
import { requireAuth } from "@/lib/auth";
import { sendEmail } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Check rate limit first
  const rateLimitCheck = await checkRateLimit(req);
  if (!rateLimitCheck.allowed) {
    const headers = new Headers();
    if (rateLimitCheck.msBeforeNext) {
      headers.set('Retry-After', Math.ceil(rateLimitCheck.msBeforeNext / 1000).toString());
    }
    return NextResponse.json(
      { success: false, error: "Too many requests, please try again later" },
      { status: 429, headers }
    );
  }

  try {
    const body = await req.json();
    const { leadId, agentKey } = body;

    if (!leadId || !agentKey) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (leadId, agentKey)" },
        { status: 400 }
      );
    }

    // Resolve automatic assignment
    let finalAgentKey = agentKey;
    if (agentKey === "automatic") {
      const { assignRandomAgent } = await import("@/lib/revenue-agents");
      const randResult = await assignRandomAgent();
      finalAgentKey = randResult.agentKey;
      console.log(`[AgentAssignment] Resolved 'automatic' selection to randomly assigned agent: ${finalAgentKey}`);
    }

    const agentProfile = getAgentByKey(finalAgentKey as any);
    if (!agentProfile) {
      return NextResponse.json(
        { success: false, error: `Agent not found for key: ${finalAgentKey}` },
        { status: 404 }
      );
    }

    const assignment: AgentAssignment = {
      id: uuidv4(),
      leadId,
      agentKey: finalAgentKey as any,
      agentName: agentProfile.name,
      assignedAt: new Date().toISOString(),
      status: "active",
    };

    const assignmentsMap = getInMemoryAgentAssignments();
    assignmentsMap.set(assignment.id, assignment);

    // Save to Firestore
    if (db) {
      await db.collection("agent_assignments").doc(assignment.id).set(assignment);
    }

    // Also update the lead record in Firestore and cache
    const leadsMap = getInMemoryLeads();
    let lead = leadsMap.get(leadId);
    if (!lead && db) {
      const doc = await db.collection("leads").doc(leadId).get();
      if (doc.exists) {
        lead = doc.data() as ExtendedLeadRecord;
      }
    }

    if (lead) {
      const updatedLead = {
        ...lead,
        assignedAgentKey: finalAgentKey,
        agentAssignmentId: assignment.id,
      };
      leadsMap.set(leadId, updatedLead);
      if (db) {
        await db.collection("leads").doc(leadId).set(updatedLead);
      }
    }

    // Send instant in-app notifications
    const nowStr = new Date().toISOString();
    const companyName = lead?.companyName || "a new company";
    const customerName = lead?.contactName || "Customer";
    const customerEmail = lead?.contactEmail || "";

    if (db) {
      // Notification for assigned agent
      await db.collection("in_app_notifications").add({
        id: uuidv4(),
        userId: finalAgentKey,
        role: "agent",
        title: "New Requirement Assigned",
        description: `You have been assigned to ${companyName}'s requirement request.`,
        type: "success",
        createdAt: nowStr,
        unread: true,
      });

      // Notification for admin team
      await db.collection("in_app_notifications").add({
        id: uuidv4(),
        userId: "admin",
        role: "admin",
        title: "New Requirement Submitted",
        description: `Lead "${companyName}" submitted by ${customerName} and assigned to ${agentProfile.name}.`,
        type: "info",
        createdAt: nowStr,
        unread: true,
      });
    }

    // Send instant email notifications to the assigned agent and admin team
    try {
      const agentEmail = `${finalAgentKey}@dealflow.ai`; // Mock/determined agent email
      const adminEmail = "admin@dealflow.ai";

      // Notify Agent
      await sendEmail({
        to: agentEmail,
        subject: `[DealFlow] New Assignment: ${companyName}`,
        body: `
          <h3>Hello ${agentProfile.name},</h3>
          <p>You have been assigned to a new customer requirement request:</p>
          <ul>
            <li><strong>Company:</strong> ${companyName}</li>
            <li><strong>Customer Name:</strong> ${customerName}</li>
            <li><strong>Customer Email:</strong> ${customerEmail}</li>
          </ul>
          <p>Please log in to your Agent Portal to view the Ideal Customer Profiles and full playbook.</p>
        `
      });

      // Notify Admin
      await sendEmail({
        to: adminEmail,
        subject: `[DealFlow] New Requirement Submitted: ${companyName}`,
        body: `
          <h3>Hello Admin Team,</h3>
          <p>A new customer requirement has been submitted and assigned:</p>
          <ul>
            <li><strong>Company:</strong> ${companyName}</li>
            <li><strong>Customer:</strong> ${customerName} (${customerEmail})</li>
            <li><strong>Assigned Agent:</strong> ${agentProfile.name} (${finalAgentKey})</li>
          </ul>
          <p>You can manage this requirement and reassign the agent from your Admin Dashboard.</p>
        `
      });
    } catch (emailError: any) {
      console.warn("[AgentAssignment Notification] Email delivery skipped/failed:", emailError.message);
    }

    return NextResponse.json({ success: true, assignment });
  } catch (error) {
    console.error("[agent-assignments POST] failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to assign agent" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  // ── Authentication ─────────────────────────────────────────
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");
    const agentKey = searchParams.get("agentKey");

    let assignments: AgentAssignment[] = [];

    // Retrieve from Firestore if available
    if (db) {
      let query: any = db.collection("agent_assignments");
      if (leadId) {
        query = query.where("leadId", "==", leadId);
      }
      if (agentKey) {
        query = query.where("agentKey", "==", agentKey);
      }
      const snap = await query.get();
      snap.forEach((doc: any) => {
        assignments.push(doc.data() as AgentAssignment);
      });
    } else {
      // Fallback to in-memory map
      assignments = Array.from(getInMemoryAgentAssignments().values());
      if (leadId) {
        assignments = assignments.filter(a => a.leadId === leadId);
      }
      if (agentKey) {
        assignments = assignments.filter(a => a.agentKey === agentKey);
      }
    }

    return NextResponse.json({ success: true, assignments });
  } catch (error) {
    console.error("[agent-assignments GET] failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}