import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateWhatsAppMessage, saveWhatsAppMessage } from "@/lib/custom-whatsapp-agent/whatsapp-service";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

/**
 * POST /api/custom-whatsapp/send
 * Composes (via LLM) and sends/schedules a custom WhatsApp message.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "agent") {
      return NextResponse.json({ success: false, error: "Not authenticated as agent" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      toPhone,
      customerName = "Valued Customer",
      whatsAppParameters,
      customContent,
      scheduleAt,
    } = body;

    if (!toPhone) {
      return NextResponse.json({ success: false, error: "toPhone is required" }, { status: 400 });
    }

    // Fetch agent's WhatsApp parameters from Firestore if not provided
    let resolvedParameters = whatsAppParameters;
    if (!resolvedParameters) {
      const { db } = await import("@/lib/firebase-admin");
      if (db) {
        const agentDoc = await db.collection("users").doc(user.id).get();
        resolvedParameters = agentDoc.data()?.whatsAppMessageParameters || "";
      }
    }

    // Generate message content using LLM or use provided customContent
    const messageContent = customContent
      ? customContent
      : await generateWhatsAppMessage({
          agentName: user.name,
          customerName,
          whatsAppParameters: resolvedParameters || "",
        });

    const messageId = `cwm-${uuidv4()}`;
    const isScheduled = !!scheduleAt && new Date(scheduleAt) > new Date();
    const now = new Date().toISOString();

    const message = {
      messageId,
      agentId: user.id,
      agentName: user.name,
      toPhone,
      direction: "outbound" as const,
      content: messageContent,
      status: isScheduled ? ("queued" as const) : ("sent" as const),
      ...(isScheduled ? { scheduledAt: scheduleAt } : { sentAt: now }),
      createdAt: now,
    };

    await saveWhatsAppMessage(message);

    // Send via Twilio WhatsApp if not scheduled
    let messageSid: string | null = null;
    if (!isScheduled) {
      try {
        const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
        const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN?.trim();
        const twilioFrom = process.env.TWILIO_PHONE_NUMBER?.trim();

        if (twilioAccountSid && twilioAuthToken && twilioFrom) {
          const twilio = (await import("twilio")).default;
          const client = twilio(twilioAccountSid, twilioAuthToken);
          const formattedTo = toPhone.startsWith("whatsapp:") ? toPhone : `whatsapp:${toPhone}`;
          const formattedFrom = twilioFrom.startsWith("whatsapp:") ? twilioFrom : `whatsapp:${twilioFrom}`;
          const result = await client.messages.create({ body: messageContent, from: formattedFrom, to: formattedTo });
          messageSid = result.sid;
          await saveWhatsAppMessage({ messageId, messageSid, status: "sent" });
        } else {
          // Sandbox/mock mode
          messageSid = `MOCK_WA_${messageId}`;
          console.log("[CustomWhatsApp] Twilio not configured — mock send:", messageSid);
        }
      } catch (err: any) {
        console.error("[CustomWhatsApp] Twilio send failed:", err.message);
        await saveWhatsAppMessage({ messageId, status: "failed" });
        return NextResponse.json({ success: false, error: `Message send failed: ${err.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      messageId,
      messageSid,
      status: message.status,
      content: messageContent,
      ...(isScheduled && { scheduledAt: scheduleAt }),
    });
  } catch (error: any) {
    console.error("[CustomWhatsApp/send] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * GET /api/custom-whatsapp/send
 * Returns WhatsApp message logs.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const { db } = await import("@/lib/firebase-admin");
    if (!db) {
      return NextResponse.json({ success: true, messages: [] });
    }

    let query;
    if (user.role === "admin") {
      const snapshot = await db.collection("custom_whatsapp_messages").orderBy("createdAt", "desc").limit(100).get();
      const messages = snapshot.docs.map(d => d.data());
      return NextResponse.json({ success: true, messages });
    } else {
      const snapshot = await db.collection("custom_whatsapp_messages")
        .where("agentId", "==", user.id)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();
      const messages = snapshot.docs.map(d => d.data());
      return NextResponse.json({ success: true, messages });
    }
  } catch (error: any) {
    console.error("[CustomWhatsApp/send GET] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal error" }, { status: 500 });
  }
}
