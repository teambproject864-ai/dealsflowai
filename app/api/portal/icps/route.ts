import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAuth(request, ["admin", "agent"]);
  if (errorResponse) return errorResponse;

  try {
    let icps: any[] = [];
    if (db) {
      const snap = await db.collection("icps").orderBy("createdAt", "desc").get();
      snap.forEach((doc: any) => {
        icps.push({ id: doc.id, ...doc.data() });
      });
    }
    return NextResponse.json({ success: true, icps }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-icps-get] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch ICP entries" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request, ["admin"]);
  if (errorResponse) return errorResponse;
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, description, targetIndustries, targetCompanySizes, targetGeographicRegions, decisionMakers, painPoints, valueProposition, assignedAgentId, assignedAgentName, status, matchingCustomers, conversionRate, averageDealSize } = body;

    if (!db) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    if (!name || !description) {
      return NextResponse.json({ success: false, error: "Name and description are required" }, { status: 400 });
    }

    const icpId = id || `icp-${Date.now()}`;
    const icpData: any = {
      name,
      description,
      targetIndustries: targetIndustries || [],
      targetCompanySizes: targetCompanySizes || [],
      targetGeographicRegions: targetGeographicRegions || [],
      decisionMakers: decisionMakers || [],
      painPoints: painPoints || [],
      valueProposition: valueProposition || "",
      assignedAgentId: assignedAgentId || "",
      assignedAgentName: assignedAgentName || "",
      status: status || "draft",
      matchingCustomers: matchingCustomers || [],
      conversionRate: conversionRate || 0,
      averageDealSize: averageDealSize || 0,
      updatedAt: new Date().toISOString(),
    };

    if (!id) {
      icpData.id = icpId;
      icpData.createdAt = new Date().toISOString();
    }

    await db.collection("icps").doc(icpId).set(icpData, { merge: true });

    // Write audit log
    await db.collection("audit_logs").add({
      id: `audit-${Date.now()}`,
      actionType: id ? "document_update" : "document_upload",
      actionDetails: `${user.name} (${user.role}) ${id ? "updated" : "created"} ICP profile: ${name}`,
      performedBy: user.id,
      performedByRole: user.role,
      targetId: icpId,
      targetType: "icp",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, icp: { id: icpId, ...icpData } }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-icps-post] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to save ICP entry" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request, ["admin"]);
  if (errorResponse) return errorResponse;
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const icpId = url.searchParams.get("icpId");

    if (!icpId) {
      return NextResponse.json({ success: false, error: "ICP ID is required" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    await db.collection("icps").doc(icpId).delete();

    // Write audit log
    await db.collection("audit_logs").add({
      id: `audit-${Date.now()}`,
      actionType: "other",
      actionDetails: `${user.name} (${user.role}) deleted ICP profile ID: ${icpId}`,
      performedBy: user.id,
      performedByRole: user.role,
      targetId: icpId,
      targetType: "icp",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: "ICP profile deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-icps-delete] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete ICP entry" }, { status: 500 });
  }
}
