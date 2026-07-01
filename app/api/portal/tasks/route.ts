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

    let tasks: any[] = [];
    if (db) {
      let queryRef: any = db.collection("tasks");

      if (user.role === "customer") {
        queryRef = queryRef.where("customerId", "==", user.id);
      } else if (user.role === "agent") {
        queryRef = queryRef.where("assignedAgentId", "==", user.id);
      }

      const snap = await queryRef.orderBy("createdAt", "desc").get();
      snap.forEach((doc: any) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
    }

    return NextResponse.json({ success: true, tasks }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-tasks-get] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, status, assignedAgentId, customerId, priority, progressNotes, milestones } = body;

    if (user.role === "customer") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (!db) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    const taskId = id || `task-${Date.now()}`;
    const taskData: any = {
      title,
      description,
      status: status || "todo",
      assignedAgentId: assignedAgentId || user.id,
      customerId,
      priority: priority || "medium",
      progressNotes: progressNotes || [],
      milestones: milestones || [],
      updatedAt: new Date().toISOString(),
    };

    if (!id) {
      taskData.id = taskId;
      taskData.createdAt = new Date().toISOString();
    }

    await db.collection("tasks").doc(taskId).set(taskData, { merge: true });

    // Write audit log
    await db.collection("audit_logs").add({
      id: `audit-${Date.now()}`,
      actionType: id ? "task_update" : "task_create",
      actionDetails: `${user.name} (${user.role}) ${id ? "updated" : "created"} task: ${title}`,
      performedBy: user.id,
      performedByRole: user.role,
      targetId: taskId,
      targetType: "task",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, task: { id: taskId, ...taskData } }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-tasks-post] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to save task" }, { status: 500 });
  }
}
