/**
 * CustomVoiceAgent: Proprietary standalone AI voice call agent.
 * Uses the project LLM provider (via ai-provider-router) for all NLP.
 * Independent of existing call-bot.ts and TwilioService implementations.
 */
import { performDynamicInference } from "@/lib/ai-provider-router";

export interface VoiceCallSession {
  sessionId: string;
  agentId: string;
  agentName: string;
  callFramework: string;
  toPhone: string;
  callSid?: string;
  status: "initiated" | "ringing" | "in-progress" | "completed" | "failed";
  startedAt: string;
  endedAt?: string;
  transcript: Array<{ role: "agent" | "customer"; text: string; timestamp: string }>;
  createdAt: string;
}

export interface ConversationTurn {
  customerSpeech: string;
  callFramework: string;
  agentName: string;
  transcript: Array<{ role: "agent" | "customer"; text: string }>;
}

/**
 * Builds the system prompt for the AI voice agent based on the configured framework.
 */
export function buildVoiceSystemPrompt(agentName: string, callFramework: string): string {
  return `You are ${agentName}, an AI Revenue Agent from DealFlow.AI conducting a professional business call.

CALL FRAMEWORK:
${callFramework || "Introduce DealFlow AI, understand the prospect's revenue challenges, and propose a discovery call."}

RULES:
- Keep responses concise and natural (2-4 sentences max) — this is spoken audio.
- Be professional, warm, and consultative.
- Always listen and acknowledge what the customer says before responding.
- If the customer wants to end the call, thank them graciously.
- Do NOT read out bullet points or lists — convert them to natural speech.
- If asked something outside your scope, politely redirect.

Respond ONLY with the spoken text. Do not include stage directions, labels, or punctuation formatting.`;
}

/**
 * Generates the opening greeting for a call.
 */
export async function generateCallGreeting(agentName: string, callFramework: string): Promise<string> {
  const systemPrompt = buildVoiceSystemPrompt(agentName, callFramework);
  const prompt = "Generate a warm, professional opening greeting to start this business call. Introduce yourself briefly.";

  try {
    const response = await performDynamicInference(prompt, systemPrompt, { requestType: "voice-call" });
    return response.trim();
  } catch {
    return `Hello, this is ${agentName} from DealFlow AI. Thank you for taking my call today. How are you doing?`;
  }
}

/**
 * Generates the agent's response to a customer's spoken input.
 */
export async function generateCallResponse(turn: ConversationTurn): Promise<string> {
  const systemPrompt = buildVoiceSystemPrompt(turn.agentName, turn.callFramework);

  const conversationHistory = turn.transcript
    .slice(-6) // Last 3 exchanges
    .map(t => `${t.role === "agent" ? turn.agentName : "Customer"}: ${t.text}`)
    .join("\n");

  const prompt = `Conversation so far:
${conversationHistory}

Customer just said: "${turn.customerSpeech}"

Now generate your next spoken response as ${turn.agentName}.`;

  try {
    const response = await performDynamicInference(prompt, systemPrompt, { requestType: "voice-call" });
    return response.trim();
  } catch {
    return "I apologize, I didn't quite catch that. Could you please repeat what you said?";
  }
}

/**
 * Generates a TwiML response for the initial webhook that starts the call.
 */
export function buildGreetingTwiML(greeting: string, callbackUrl: string): string {
  const safeGreeting = greeting.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" rate="slow">${safeGreeting}</Say>
  <Gather input="speech" action="${callbackUrl}" method="POST" speechTimeout="3" timeout="10" language="en-US">
    <Say voice="Polly.Joanna">Please go ahead.</Say>
  </Gather>
  <Say voice="Polly.Joanna">I didn't hear a response. Goodbye, and have a wonderful day!</Say>
</Response>`;
}

/**
 * Generates a TwiML response for subsequent speech-callback turns.
 */
export function buildResponseTwiML(agentResponse: string, callbackUrl: string, isEndingCall = false): string {
  const safeResponse = agentResponse.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  if (isEndingCall) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" rate="slow">${safeResponse}</Say>
  <Hangup/>
</Response>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" rate="slow">${safeResponse}</Say>
  <Gather input="speech" action="${callbackUrl}" method="POST" speechTimeout="3" timeout="10" language="en-US">
    <Say voice="Polly.Joanna">Please continue.</Say>
  </Gather>
  <Say voice="Polly.Joanna">Thank you for your time. Goodbye!</Say>
</Response>`;
}

/**
 * Persists a call session to Firestore.
 */
export async function saveCallSession(session: Partial<VoiceCallSession> & { sessionId: string }): Promise<void> {
  try {
    const { db } = await import("@/lib/firebase-admin");
    if (!db) return;
    await db.collection("custom_voice_calls").doc(session.sessionId).set(
      { ...session, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (err: any) {
    console.error("[CustomVoiceAgent] Failed to save session:", err.message);
  }
}

/**
 * Retrieves all call logs for a specific agent.
 */
export async function getAgentCallLogs(agentId: string): Promise<VoiceCallSession[]> {
  try {
    const { db } = await import("@/lib/firebase-admin");
    if (!db) return [];
    const snapshot = await db.collection("custom_voice_calls")
      .where("agentId", "==", agentId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    return snapshot.docs.map(doc => doc.data() as VoiceCallSession);
  } catch (err: any) {
    console.error("[CustomVoiceAgent] Failed to fetch call logs:", err.message);
    return [];
  }
}

/**
 * Retrieves all call logs (admin view).
 */
export async function getAllCallLogs(): Promise<VoiceCallSession[]> {
  try {
    const { db } = await import("@/lib/firebase-admin");
    if (!db) return [];
    const snapshot = await db.collection("custom_voice_calls")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    return snapshot.docs.map(doc => doc.data() as VoiceCallSession);
  } catch (err: any) {
    console.error("[CustomVoiceAgent] Failed to fetch all call logs:", err.message);
    return [];
  }
}
