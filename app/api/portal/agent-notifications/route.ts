import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { seedFirestore } from "@/lib/db-init";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "agent") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await seedFirestore();

    let notifications: any[] = [];
    if (db) {
      const snap = await db.collection("agent_notifications")
        .where("agentId", "==", user.id)
        .orderBy("createdAt", "desc")
        .get();

      snap.forEach((doc: any) => {
        notifications.push({ id: doc.id, ...doc.data() });
      });
    }

    return NextResponse.json({ success: true, notifications }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-agent-notifications-get] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
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
    const { id, read } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Notification ID is required" }, { status: 400 });
    }

    await db.collection("agent_notifications").doc(id).set({
      read: read ?? true,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-agent-notifications-post] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update notification" }, { status: 500 });
  }
}
