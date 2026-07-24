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

    let calls: any[] = [];
    if (db) {
      let queryRef: any = db.collection("calls");

      if (user.role === "customer") {
        queryRef = queryRef.where("receiverId", "==", user.id);
      } else if (user.role === "agent") {
        queryRef = queryRef.where("callerId", "==", user.id);
      }

      const snap = await queryRef.orderBy("startedAt", "desc").get();
      if (snap && snap.forEach) {
        snap.forEach((doc: any) => {
          calls.push({ id: doc.id, ...doc.data() });
        });
      }

    }

    return NextResponse.json({ success: true, calls }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-calls-get] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch calls" }, { status: 500 });
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
    const { id, sessionId, callerId, callerName, callerRole, receiverId, receiverName, receiverRole, status, duration, startedAt, endedAt } = body;

    const callId = id || `call-${Date.now()}`;
    const callData: any = {
      sessionId: sessionId || "session-1",
      callerId: callerId || user.id,
      callerName: callerName || user.name,
      callerRole: callerRole || user.role,
      receiverId,
      receiverName,
      receiverRole: receiverRole || "customer",
      status: status || "completed",
      duration: Number(duration) || 0,
      startedAt: startedAt || new Date().toISOString(),
      endedAt: endedAt || new Date().toISOString(),
    };

    await db.collection("calls").doc(callId).set(callData);

    return NextResponse.json({ success: true, call: { id: callId, ...callData } }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-calls-post] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to save call record" }, { status: 500 });
  }
}
