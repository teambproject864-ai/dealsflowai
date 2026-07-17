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
      const queryRef: any = db.collection("tasks");

      if (user.role === "customer") {
        // Customers only see their own tasks
        const snap = await queryRef.where("customerId", "==", user.id).get();
        snap.forEach((doc: any) => {
          tasks.push({ id: doc.id, ...doc.data() });
        });
      } else if (user.role === "agent") {
        // Agents see tasks assigned to them OR unassigned
        const snap = await queryRef.get();
        snap.forEach((doc: any) => {
          const data = doc.data();
          if (data.assignedAgentId === user.id || !data.assignedAgentId) {
            tasks.push({ id: doc.id, ...data });
          }
        });
      } else {
        // Admins see all tasks
        const snap = await queryRef.get();
        snap.forEach((doc: any) => {
          tasks.push({ id: doc.id, ...doc.data() });
        });
      }

      // Sort by createdAt descending
      tasks.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return NextResponse.json({ success: true, tasks }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-tasks-get] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// Helper to normalize priority
function normalizePriority(priority: string | undefined): string {
  if (!priority) return "Medium";
  const lower = priority.toLowerCase();
  if (lower === "critical") return "Critical";
  if (lower === "high") return "High";
  if (lower === "medium") return "Medium";
  if (lower === "low") return "Low";
  return "Medium";
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
      priority: normalizePriority(priority),
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
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Get taskId from either search params or request body
    let taskId: string | null = null;
    const url = new URL(request.url);
    taskId = url.searchParams.get("taskId");
    if (!taskId) {
      try {
        const body = await request.json();
        taskId = body.id;
      } catch (e) {
        // Body might be empty, that's okay
      }
    }

    if (!taskId) {
      return NextResponse.json({ success: false, error: "Task ID is required" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    // Get the task to check ownership/assignment
    const taskDoc = await db.collection("tasks").doc(taskId).get();
    if (!taskDoc.exists) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    const taskData = taskDoc.data();

    // Check permissions: Admin can delete any, Agent can delete their own assigned tasks
    if (user.role === "agent" && taskData?.assignedAgentId !== user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await db.collection("tasks").doc(taskId).delete();

    // Write audit log
    await db.collection("audit_logs").add({
      id: `audit-${Date.now()}`,
      actionType: "task_delete",
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
