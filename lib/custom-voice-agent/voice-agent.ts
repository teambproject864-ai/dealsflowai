/**
 * CustomVoiceAgent: Proprietary standalone AI voice call agent.
 * Uses the project LLM provider (via ai-provider-router) for all NLP.
 * Independent of existing call-bot.ts and TwilioService implementations.
 */
import { performDynamicInference } from "@/lib/ai-provider-router";
import { voiceSessionCache } from "./voice-session-cache";

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
 * Escapes characters for XML TwiML safety.
 */
export function xmlEscape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Returns either a Play tag using ElevenLabs TTS (if configured) or a Say tag using Polly Neural.
 */
export function getTwiMLVoiceTag(text: string, agentName: string, sessionId?: string): string {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  const safeText = xmlEscape(text);

  if (apiKey && appUrl && appUrl !== "http://localhost:3089" && !appUrl.includes("localhost")) {
    const persona = agentName.toLowerCase();
    const ttsUrl = `${appUrl.replace(/\/$/, "")}/api/custom-voice/tts?text=${encodeURIComponent(text)}&persona=${persona}${sessionId ? `&sessionId=${sessionId}` : ""}`;
    return `<Play>${xmlEscape(ttsUrl)}</Play>`;
  }

  // Fallback to Polly Neural with natural prosody rate tag
  return `<Say voice="Polly.Joanna-Neural"><prosody rate="92%">${safeText}</prosody></Say>`;
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
  } catch (error: any) {
    console.error("[CustomVoiceAgent] LLM generation failed:", error.message);
    throw error; // Re-throw so generateCallResponseWithFallback handles it
  }
}

/**
 * Generates agent's response with a circuit-breaker and Stage-based Pre-scripted Fallback
 */
export async function generateCallResponseWithFallback(
  turn: ConversationTurn,
  sessionId: string
): Promise<{ text: string; isEndingCall: boolean }> {
  const startTime = Date.now();
  
  // Track consecutive failures in session cache
  const session = voiceSessionCache.get(sessionId);
  const failureCount = session ? (session as any).failureCount || 0 : 0;

  if (failureCount >= 3) {
    console.warn(`[CustomVoiceAgent] Session ${sessionId} hit circuit breaker with 3 consecutive LLM failures.`);
    return {
      text: "I apologize, I am experiencing some technical difficulties and need to end the call. I will try calling you back later. Goodbye.",
      isEndingCall: true,
    };
  }

  try {
    const text = await generateCallResponse(turn);
    const latency = Date.now() - startTime;
    console.log(`[CustomVoiceAgent] LLM Latency for session ${sessionId}: ${latency}ms`);
    
    if (latency > 400) {
      console.warn(`[CustomVoiceAgent] Latency warning: turn took ${latency}ms`);
    }

    if (session) {
      voiceSessionCache.update(sessionId, { failureCount: 0 } as any);
    }

    const lowerText = text.toLowerCase();
    const isEndingCall = 
      lowerText.includes("goodbye") || 
      lowerText.includes("bye-bye") ||
      lowerText.includes("thank you for your time") ||
      lowerText.includes("have a wonderful day");

    return { text, isEndingCall };
  } catch (err: any) {
    const newFailureCount = failureCount + 1;
    console.error(`[CustomVoiceAgent] LLM generation error #${newFailureCount} for session ${sessionId}:`, err.message);

    if (session) {
      voiceSessionCache.update(sessionId, { failureCount: newFailureCount } as any);
    }

    const isEndingCall = newFailureCount >= 3;
    if (isEndingCall) {
      return {
        text: "I am having trouble with our connection right now. Let me follow up with you later. Goodbye.",
        isEndingCall: true,
      };
    }

    // Return stage-based fallback response
    const turnCount = turn.transcript.length;
    let fallbackText = "I appreciate you sharing that. Could you tell me more about your current process?";
    if (turnCount <= 2) {
      fallbackText = "I appreciate you sharing that. Can you tell me a little bit about what your team is currently focused on?";
    } else if (turnCount <= 5) {
      fallbackText = "That makes a lot of sense. Many companies we work with face similar challenges. How are you handling that currently?";
    } else {
      fallbackText = "I see. Let's make sure we address this in detail. Would you be open to a brief discovery call next week?";
    }

    return { text: fallbackText, isEndingCall: false };
  }
}

/**
 * Generates a TwiML response for the initial webhook that starts the call.
 * Uses nested Say/Play inside Gather for true barge-in (interruption support).
 */
export function buildGreetingTwiML(greeting: string, callbackUrl: string, agentName = "AI Agent", sessionId?: string): string {
  const voiceTag = getTwiMLVoiceTag(greeting, agentName, sessionId);
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${callbackUrl}" method="POST" speechTimeout="1" timeout="10" language="en-US" enhanced="true" speechModel="phone_call">
    ${voiceTag}
  </Gather>
  <Say voice="Polly.Joanna-Neural">I didn't hear a response. Goodbye, and have a wonderful day!</Say>
</Response>`;
}

/**
 * Generates a TwiML response for subsequent speech-callback turns.
 */
export function buildResponseTwiML(
  agentResponse: string,
  callbackUrl: string,
  isEndingCall = false,
  agentName = "AI Agent",
  sessionId?: string
): string {
  const voiceTag = getTwiMLVoiceTag(agentResponse, agentName, sessionId);
  if (isEndingCall) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${voiceTag}
  <Hangup/>
</Response>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${callbackUrl}" method="POST" speechTimeout="1" timeout="10" language="en-US" enhanced="true" speechModel="phone_call">
    ${voiceTag}
  </Gather>
  <Say voice="Polly.Joanna-Neural">Thank you for your time. Goodbye!</Say>
</Response>`;
}

/**
 * Generates a general interruptible TwiML response.
 */
export function buildInterruptibleTwiML(text: string, callbackUrl: string, agentName = "AI Agent", sessionId?: string): string {
  const voiceTag = getTwiMLVoiceTag(text, agentName, sessionId);
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${callbackUrl}" method="POST" speechTimeout="1" timeout="10" language="en-US" enhanced="true" speechModel="phone_call">
    ${voiceTag}
  </Gather>
  <Say voice="Polly.Joanna-Neural">Goodbye!</Say>
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

