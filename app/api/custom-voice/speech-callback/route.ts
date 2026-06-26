import { NextRequest, NextResponse } from "next/server";
import { generateCallResponse, buildResponseTwiML, saveCallSession } from "@/lib/custom-voice-agent/voice-agent";
import { db } from "@/lib/firebase-admin";
import admin from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const END_KEYWORDS = ["goodbye", "bye", "end call", "hang up", "stop", "no thanks", "not interested", "talk later"];

function detectEndOfCall(text: string): boolean {
  const lower = text.toLowerCase();
  return END_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * POST /api/custom-voice/speech-callback
 * Called by Twilio after each customer speech input.
 * Sends transcript to LLM and returns next spoken response as TwiML.
 */
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>I'm sorry, I lost the context of our conversation. Goodbye!</Say><Hangup/></Response>`;
      return new NextResponse(twiml, { status: 200, headers: { "Content-Type": "text/xml" } });
    }

    const form = await req.formData();
    const customerSpeech = form.get("SpeechResult")?.toString() || "";

    if (!customerSpeech.trim()) {
      // No speech detected — re-prompt
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Gather input="speech" action="/api/custom-voice/speech-callback?sessionId=${sessionId}" method="POST" speechTimeout="3" timeout="10" language="en-US"><Say voice="Polly.Joanna">I didn't catch that. Could you please repeat?</Say></Gather></Response>`;
      return new NextResponse(twiml, { status: 200, headers: { "Content-Type": "text/xml" } });
    }

    // Fetch session state
    let agentName = "AI Agent";
    let callFramework = "";
    let existingTranscript: any[] = [];

    if (db) {
      const sessionDoc = await db.collection("custom_voice_calls").doc(sessionId).get();
      if (sessionDoc.exists) {
        const data = sessionDoc.data()!;
        agentName = data.agentName || "AI Agent";
        callFramework = data.callFramework || "";
        existingTranscript = data.transcript || [];
      }
    }

    // Append customer turn
    const customerTurn = { role: "customer" as const, text: customerSpeech, timestamp: new Date().toISOString() };
    const updatedTranscript = [...existingTranscript, customerTurn];

    // Detect end-of-call keywords
    const isEnding = detectEndOfCall(customerSpeech);

    // Generate agent response via LLM
    const agentResponse = await generateCallResponse({
      customerSpeech,
      callFramework,
      agentName,
      transcript: updatedTranscript,
    });

    const agentTurn = { role: "agent" as const, text: agentResponse, timestamp: new Date().toISOString() };
    const finalTranscript = [...updatedTranscript, agentTurn];

    // Persist updated transcript
    if (db) {
      await db.collection("custom_voice_calls").doc(sessionId).update({
        transcript: finalTranscript,
        ...(isEnding && { status: "completed", endedAt: new Date().toISOString() }),
        updatedAt: new Date().toISOString(),
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3089";
    const callbackUrl = `${appUrl}/api/custom-voice/speech-callback?sessionId=${sessionId}`;
    const twiml = buildResponseTwiML(agentResponse, callbackUrl, isEnding);

    return new NextResponse(twiml, {
      status: 200,
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("[CustomVoice/speech-callback] Error:", error);
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>I apologize for the interruption. Let me get back to you. Goodbye!</Say><Hangup/></Response>`;
    return new NextResponse(twiml, { status: 200, headers: { "Content-Type": "text/xml" } });
  }
}
