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

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId") || "session-1";

    let messages: any[] = [];
    if (db) {
      const snap = await db.collection("chat_messages")
        .where("sessionId", "==", sessionId)
        .orderBy("timestamp", "asc")
        .get();

      snap.forEach((doc: any) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
    }

    return NextResponse.json({ success: true, messages }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-chat-get] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch chat messages" }, { status: 500 });
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
    const { content, sessionId = "session-1", attachments } = body;

    if (!content && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ success: false, error: "Content or attachments required" }, { status: 400 });
    }

    const msgId = `msg-${Date.now()}`;
    const newMsg = {
      id: msgId,
      sessionId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      content: content || "",
      timestamp: new Date().toISOString(),
      read: false,
      attachments: attachments || [],
    };

    await db.collection("chat_messages").doc(msgId).set(newMsg);

    return NextResponse.json({ success: true, message: newMsg }, { status: 201 });
  } catch (error) {
    console.error("[api-portal-chat-post] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
  }
}
