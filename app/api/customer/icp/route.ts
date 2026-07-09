import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { addAuditLog } from "@/lib/auth";
import { getInMemoryICPEntries, getInMemoryAgentNotifications } from "@/lib/memory-storage";
import { DEMO_AGENTS } from "@/lib/auth";
import type { ICPEntry } from "@/lib/portal-types";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "customer") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const { name, description, targetIndustries, targetCompanySizes, targetGeographicRegions, decisionMakers, painPoints, valueProposition } = body;
    if (!name || !description || !targetIndustries?.length || !targetCompanySizes?.length) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields (name, description, targetIndustries, targetCompanySizes)",
      }, { status: 400 });
    }

    // Assign an agent (for demo purposes)
    const defaultAgent = DEMO_AGENTS[0];

    // Create new ICP entry
    const newICPEntry: ICPEntry = {
      id: `icp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      customerId: user.id,
      customerName: user.name,
      name,
      description,
      targetIndustries: Array.isArray(targetIndustries) ? targetIndustries : [targetIndustries],
      targetCompanySizes: Array.isArray(targetCompanySizes) ? targetCompanySizes : [targetCompanySizes],
      targetGeographicRegions: targetGeographicRegions ? (Array.isArray(targetGeographicRegions) ? targetGeographicRegions : [targetGeographicRegions]) : [],
      decisionMakers: decisionMakers ? (Array.isArray(decisionMakers) ? decisionMakers : [decisionMakers]) : [],
      painPoints: painPoints ? (Array.isArray(painPoints) ? painPoints : [painPoints]) : [],
      valueProposition: valueProposition || "",
      assignedAgentId: defaultAgent.id,
      assignedAgentName: defaultAgent.name,
      status: "draft" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in memory
    const icpEntries = getInMemoryICPEntries();
    icpEntries.set(newICPEntry.id, newICPEntry);

    // Create a notification for the assigned agent
    const notifications = getInMemoryAgentNotifications();
    notifications.unshift({
      id: `notif-${Date.now()}`,
      agentId: defaultAgent.id,
      title: "New ICP Entry Submitted",
      message: `${user.name} (${user.email}) has submitted a new ICP entry: ${newICPEntry.name}`,
      type: "icp-created",
      read: false,
      createdAt: new Date().toISOString(),
    });

    // Log audit entry
    addAuditLog(user.email, user.role, true, `Customer created new ICP entry: ${newICPEntry.name}`);

    return NextResponse.json({ success: true, icpEntry: newICPEntry }, { status: 201 });

  } catch (error) {
    console.error("Error creating ICP entry:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const icpEntries = getInMemoryICPEntries();
    let entries: ICPEntry[] = [];

    if (user.role === "customer") {
      // Return only customer's own ICP entries
      entries = Array.from(icpEntries.values()).filter(
        (entry) => entry.customerId === user.id
      );
    } else if (user.role === "agent") {
      // Return entries assigned to this agent
      entries = Array.from(icpEntries.values()).filter(
        (entry) => entry.assignedAgentId === user.id
      );
    } else if (user.role === "admin") {
      // Return all entries
      entries = Array.from(icpEntries.values());
    }

    return NextResponse.json({
      success: true,
      icpEntries: entries,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching ICP entries:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error",
    }, { status: 500 });
  }
}