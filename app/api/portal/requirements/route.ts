import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { seedFirestore } from "@/lib/db-init";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await seedFirestore();

    let requirements: any[] = [];
    if (db) {
      let queryRef: any = db.collection("requirements");

      if (user.role === "customer") {
        queryRef = queryRef.where("customerId", "==", user.id);
      } else if (user.role === "agent") {
        queryRef = queryRef.where("assignedAgentId", "==", user.id);
      }

      const snap = await queryRef.orderBy("updatedAt", "desc").get();
      snap.forEach((doc: any) => {
        requirements.push({ id: doc.id, ...doc.data() });
      });
    }

    return NextResponse.json({ success: true, requirements }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-requirements-get] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch requirements" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { id, customerId, customerName, requesterName, requesterEmail, category, description, priority, status, assignedAgentId, assignedAgentName } = body;

    const reqId = id || `req-${Date.now()}`;
    const reqData: any = {
      customerId: customerId || user.id,
      customerName: customerName || user.name,
      requesterName: requesterName || user.name,
      requesterEmail: requesterEmail || user.email,
      category: category || "General Inquiry",
      description: description || "",
      priority: priority || "Medium",
      status: status || "Open",
      assignedAgentId: assignedAgentId || "",
      assignedAgentName: assignedAgentName || "",
      updatedAt: new Date().toISOString(),
    };

    if (!id) {
      reqData.id = reqId;
      reqData.createdAt = new Date().toISOString();
    }

    await db.collection("requirements").doc(reqId).set(reqData, { merge: true });

    // Write audit log
    await db.collection("audit_logs").add({
      id: `audit-${Date.now()}`,
      actionType: id ? "document_update" : "task_create",
      actionDetails: `${user.name} (${user.role}) ${id ? "updated" : "created"} requirement: ${description.substring(0, 30)}...`,
      performedBy: user.id,
      performedByRole: user.role,
      targetId: reqId,
      targetType: "requirement",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, requirement: { id: reqId, ...reqData } }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-requirements-post] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to save requirement" }, { status: 500 });
  }
}
