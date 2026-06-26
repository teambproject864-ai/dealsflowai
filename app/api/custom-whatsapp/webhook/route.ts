import { NextRequest, NextResponse } from "next/server";
import { generateWhatsAppReply, saveWhatsAppMessage, getAgentWhatsAppMessages } from "@/lib/custom-whatsapp-agent/whatsapp-service";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

/**
 * POST /api/custom-whatsapp/webhook
 * Public webhook for incoming WhatsApp messages from Twilio.
 * Auto-generates LLM replies using the agent's WhatsApp parameters.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const fromPhone = form.get("From")?.toString() || "";
    const toPhone = form.get("To")?.toString() || "";
    const incomingBody = form.get("Body")?.toString() || "";

    if (!fromPhone || !incomingBody) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // Strip whatsapp: prefix
    const cleanFromPhone = fromPhone.replace("whatsapp:", "");

    // Find agent associated with the "To" number
    const { db } = await import("@/lib/firebase-admin");
    let agentId: string | null = null;
    let agentName = "AI Agent";
    let whatsAppParameters = "";

    if (db) {
      const agentSnapshot = await db.collection("users")
        .where("role", "==", "agent")
        .where("phoneNumber", "==", toPhone.replace("whatsapp:", ""))
        .limit(1)
        .get();

      if (!agentSnapshot.empty) {
        const agentData = agentSnapshot.docs[0].data();
        agentId = agentData.id;
        agentName = agentData.name || "AI Agent";
        whatsAppParameters = agentData.whatsAppMessageParameters || "";
      }
    }

    // Save incoming message
    const incomingMessageId = `cwm-in-${uuidv4()}`;
    await saveWhatsAppMessage({
      messageId: incomingMessageId,
      agentId: agentId || "unknown",
      agentName,
      toPhone: cleanFromPhone, // "to" from agent perspective means the customer's number
      direction: "inbound",
      content: incomingBody,
      status: "read",
      createdAt: new Date().toISOString(),
    });

    // Get conversation history for context
    const history = agentId ? await getAgentWhatsAppMessages(agentId) : [];
    const relevantHistory = history.filter(m => m.toPhone === cleanFromPhone).slice(0, 8);

    // Generate auto-reply using LLM
    const replyText = await generateWhatsAppReply({
      agentName,
      customerName: "Valued Customer",
      whatsAppParameters,
      incomingMessage: incomingBody,
      conversationHistory: relevantHistory,
    });

    // Save outbound reply
    const replyMessageId = `cwm-out-${uuidv4()}`;
    await saveWhatsAppMessage({
      messageId: replyMessageId,
      agentId: agentId || "unknown",
      agentName,
      toPhone: cleanFromPhone,
      direction: "outbound",
      content: replyText,
      status: "sent",
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    // Reply via TwiML
    const safeReply = replyText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safeReply}</Message></Response>`;
    return new NextResponse(twiml, {
      status: 200,
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("[CustomWhatsApp/webhook] Error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}
