import { NextResponse } from "next/server";
import {
  getInMemoryAgentAssignments,
  getInMemoryLeads,
} from "@/lib/memory-storage";
import { AgentAssignment, getAgentByKey } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leadId, agentKey } = body;

    if (!leadId || !agentKey) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (leadId, agentKey)" },
        { status: 400 }
      );
    }

    const agentProfile = getAgentByKey(agentKey as any);
    if (!agentProfile) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    const assignment: AgentAssignment = {
      id: uuidv4(),
      leadId,
      agentKey: agentKey as any,
      agentName: agentProfile.name,
      assignedAt: new Date().toISOString(),
      status: "active",
    };

    const assignmentsMap = getInMemoryAgentAssignments();
    assignmentsMap.set(assignment.id, assignment);

    // Also update the lead record
    const leadsMap = getInMemoryLeads();
    const lead = leadsMap.get(leadId);
    if (lead) {
      leadsMap.set(leadId, {
        ...lead,
        assignedAgentKey: agentKey,
        agentAssignmentId: assignment.id,
      });
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
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");
    const agentKey = searchParams.get("agentKey");

    const assignments = Array.from(getInMemoryAgentAssignments().values());
    let filteredAssignments = assignments;

    if (leadId) {
      filteredAssignments = filteredAssignments.filter(a => a.leadId === leadId);
    }
    if (agentKey) {
      filteredAssignments = filteredAssignments.filter(a => a.agentKey === agentKey);
    }

    return NextResponse.json({ success: true, assignments: filteredAssignments });
  } catch (error) {
    console.error("[agent-assignments GET] failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}