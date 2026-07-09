/**
 * Custom WhatsApp Message Agent: Proprietary standalone WhatsApp agent.
 * Uses the project LLM provider for all message generation and NLP.
 * Independent of existing TwilioService implementations.
 */
import { performDynamicInference } from "@/lib/ai-provider-router";

export interface WhatsAppMessage {
  messageId: string;
  agentId: string;
  agentName: string;
  toPhone: string;
  direction: "outbound" | "inbound";
  content: string;
  status: "queued" | "sent" | "delivered" | "read" | "failed";
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  messageSid?: string;
  createdAt: string;
}

export interface MessageGenerationParams {
  agentName: string;
  customerName: string;
  whatsAppParameters: string;
  context?: string;
}

/**
 * Builds the system prompt for WhatsApp message generation.
 */
function buildWhatsAppSystemPrompt(agentName: string, parameters: string): string {
  return `You are ${agentName}, a professional AI agent from DealFlow.AI composing a WhatsApp business message.

MESSAGE PARAMETERS:
${parameters || "Tone: Professional. Goal: Engage the prospect and schedule a call."}

RULES:
- Keep messages concise — WhatsApp messages should be under 300 words.
- Be personable and conversational, not corporate or spammy.
- Include a clear, single call-to-action.
- Use natural line breaks for readability.
- Do NOT use excessive emojis or punctuation.
- Do NOT include greetings in the format "Dear Sir/Ma'am".

Output ONLY the final WhatsApp message text, nothing else.`;
}

/**
 * Generates a WhatsApp message using the LLM.
 */
export async function generateWhatsAppMessage(params: MessageGenerationParams): Promise<string> {
  const systemPrompt = buildWhatsAppSystemPrompt(params.agentName, params.whatsAppParameters);
  const prompt = `Generate a WhatsApp business message for ${params.customerName}.${params.context ? ` Context: ${params.context}` : ""}`;

  try {
    const response = await performDynamicInference(prompt, systemPrompt, { requestType: "whatsapp-message" });
    return response.trim();
  } catch {
    return `Hi ${params.customerName}, this is ${params.agentName} from DealFlow AI. I wanted to reach out and see if you'd be open to a quick conversation about improving your revenue pipeline. Would 15 minutes work for you this week?`;
  }
}

/**
 * Generates an auto-reply to an incoming WhatsApp message.
 */
export async function generateWhatsAppReply(params: {
  agentName: string;
  customerName: string;
  whatsAppParameters: string;
  incomingMessage: string;
  conversationHistory?: WhatsAppMessage[];
}): Promise<string> {
  const systemPrompt = buildWhatsAppSystemPrompt(params.agentName, params.whatsAppParameters);

  const historyContext = params.conversationHistory
    ?.slice(-4)
    .map(m => `${m.direction === "outbound" ? params.agentName : params.customerName}: ${m.content}`)
    .join("\n") || "";

  const prompt = `${historyContext ? `Previous messages:\n${historyContext}\n\n` : ""}${params.customerName} just replied: "${params.incomingMessage}"\n\nGenerate your reply.`;

  try {
    const response = await performDynamicInference(prompt, systemPrompt, { requestType: "whatsapp-reply" });
    return response.trim();
  } catch {
    return `Thank you for your reply! I'll get back to you shortly with more information.`;
  }
}

/**
 * Saves a WhatsApp message to Firestore.
 */
export async function saveWhatsAppMessage(message: Partial<WhatsAppMessage> & { messageId: string }): Promise<void> {
  try {
    const { db } = await import("@/lib/firebase-admin");
    if (!db) return;
    await db.collection("custom_whatsapp_messages").doc(message.messageId).set(
      { ...message, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (err: any) {
    console.error("[CustomWhatsApp] Failed to save message:", err.message);
  }
}

/**
 * Retrieves WhatsApp messages for an agent.
 */
export async function getAgentWhatsAppMessages(agentId: string): Promise<WhatsAppMessage[]> {
  try {
    const { db } = await import("@/lib/firebase-admin");
    if (!db) return [];
    const snapshot = await db.collection("custom_whatsapp_messages")
      .where("agentId", "==", agentId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    return snapshot.docs.map(doc => doc.data() as WhatsAppMessage);
  } catch (err: any) {
    console.error("[CustomWhatsApp] Failed to fetch messages:", err.message);
    return [];
  }
}

/**
 * Retrieves all WhatsApp messages (admin view).
 */
export async function getAllWhatsAppMessages(): Promise<WhatsAppMessage[]> {
  try {
    const { db } = await import("@/lib/firebase-admin");
    if (!db) return [];
    const snapshot = await db.collection("custom_whatsapp_messages")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    return snapshot.docs.map(doc => doc.data() as WhatsAppMessage);
  } catch (err: any) {
    console.error("[CustomWhatsApp] Failed to fetch all messages:", err.message);
    return [];
  }
}

/**
 * Retrieves WhatsApp messages for a specific phone number (customer view).
 */
export async function getCustomerWhatsAppMessages(toPhone: string): Promise<WhatsAppMessage[]> {
  try {
    const { db } = await import("@/lib/firebase-admin");
    if (!db) return [];
    const snapshot = await db.collection("custom_whatsapp_messages")
      .where("toPhone", "==", toPhone)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    return snapshot.docs.map(doc => doc.data() as WhatsAppMessage);
  } catch (err: any) {
    console.error("[CustomWhatsApp] Failed to fetch customer messages:", err.message);
    return [];
  }
}
