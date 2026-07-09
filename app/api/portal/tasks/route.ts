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

      const snap = await queryRef.get();
      snap.forEach((doc: any) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });

      // Sort by createdAt descending
      tasks.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
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
    const {
      id,
      title,
      description,
      status,
      assignedAgentId,
      assignedAgentName,
      customerId,
      customerName,
      priority,
      progressNotes,
      milestones,
      dueDate,
      collaborationNotes,
      sharedFiles,
      sharedLinks
    } = body;

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
      assignedAgentName: assignedAgentName || "",
      customerId,
      customerName: customerName || "",
      priority: priority || "medium",
      progressNotes: progressNotes || [],
      milestones: milestones || [],
      dueDate: dueDate || "",
      collaborationNotes: collaborationNotes || [],
      sharedFiles: sharedFiles || [],
      sharedLinks: sharedLinks || [],
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

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admins only" }, { status: 403 });
    }

    const url = new URL(request.url);
    const taskId = url.searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json({ success: false, error: "Task ID is required" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    await db.collection("tasks").doc(taskId).delete();

    // Write audit log
    await db.collection("audit_logs").add({
      id: `audit-${Date.now()}`,
      actionType: "other",
      actionDetails: `${user.name} (${user.role}) deleted task ID: ${taskId}`,
      performedBy: user.id,
      performedByRole: user.role,
      targetId: taskId,
      targetType: "task",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: "Task deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-tasks-delete] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete task" }, { status: 500 });
  }
}
