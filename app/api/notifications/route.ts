import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // ── Authentication ─────────────────────────────────────────
  const { user, errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    let notifications: any[] = [];

    if (db) {
      let query: any = db.collection("in_app_notifications");

      if (user!.role === "admin") {
        query = query.where("role", "==", "admin");
      } else if (user!.role === "agent") {
        // Look up by agent ID (e.g. agent-praneeth) or agent key (e.g. praneeth)
        // We check if either the userId matches or the role is agent.
        // For security & scope, we match the userId or role.
        const agentKey = user!.id.replace("agent-", "");
        query = query.where("userId", "in", [user!.id, agentKey]);
      } else if (user!.role === "customer") {
        query = query.where("userId", "==", user!.id);
      }

      const snapshot = await query.orderBy("createdAt", "desc").limit(50).get();
      snapshot.forEach((doc: any) => {
        notifications.push({
          firebaseId: doc.id,
          ...doc.data(),
        });
      });
    }

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    console.error("[GET notifications] failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // ── Authentication ─────────────────────────────────────────
  const { user, errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { action, notificationId } = body;

    if (!db) {
      return NextResponse.json({ success: true, message: "Firestore not enabled, mock success" });
    }

    if (action === "mark-all-read") {
      let query: any = db.collection("in_app_notifications").where("unread", "==", true);
      if (user!.role === "admin") {
        query = query.where("role", "==", "admin");
      } else if (user!.role === "agent") {
        const agentKey = user!.id.replace("agent-", "");
        query = query.where("userId", "in", [user!.id, agentKey]);
      } else if (user!.role === "customer") {
        query = query.where("userId", "==", user!.id);
      }

      const snapshot = await query.get();
      const batch = db.batch();
      snapshot.forEach((doc: any) => {
        batch.update(doc.ref, { unread: false });
      });
      await batch.commit();

      return NextResponse.json({ success: true });
    }

    if (action === "toggle-read" && notificationId) {
      const docRef = db.collection("in_app_notifications").doc(notificationId);
      const doc = await docRef.get();
      if (doc.exists) {
        const data = doc.data();
        await docRef.update({ unread: !data?.unread });
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: false, error: "Notification not found" }, { status: 404 });
    }

    if (action === "delete" && notificationId) {
      await db.collection("in_app_notifications").doc(notificationId).delete();
      return NextResponse.json({ success: true });
    }

    if (action === "clear-all") {
      let query: any = db.collection("in_app_notifications");
      if (user!.role === "admin") {
        query = query.where("role", "==", "admin");
      } else if (user!.role === "agent") {
        const agentKey = user!.id.replace("agent-", "");
        query = query.where("userId", "in", [user!.id, agentKey]);
      } else if (user!.role === "customer") {
        query = query.where("userId", "==", user!.id);
      }

      const snapshot = await query.get();
      const batch = db.batch();
      snapshot.forEach((doc: any) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("[POST notifications] failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process notifications" },
      { status: 500 }
    );
  }
}
