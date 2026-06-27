import { NextRequest, NextResponse } from "next/server";
import {
  generateCallResponseWithFallback,
  buildResponseTwiML,
  saveCallSession,
} from "@/lib/custom-voice-agent/voice-agent";
import { voiceSessionCache } from "@/lib/custom-voice-agent/voice-session-cache";
import { db } from "@/lib/firebase-admin";
import twilio from "twilio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const END_KEYWORDS = ["goodbye", "bye", "end call", "hang up", "stop", "no thanks", "not interested", "talk later"];

function detectEndOfCall(text: string): boolean {
  const lower = text.toLowerCase();
  return END_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * Validates that the request comes from Twilio.
 */
async function validateTwilioRequest(req: NextRequest, params: Record<string, string>): Promise<boolean> {
  const signature = req.headers.get("x-twilio-signature");
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();

  if (process.env.NODE_ENV !== "production" && !signature) {
    console.log("[CustomVoice/speech-callback] Skipping signature validation in development mode (no signature header).");
    return true;
  }

  if (!authToken) {
    console.warn("[CustomVoice/speech-callback] TWILIO_AUTH_TOKEN is not configured. Skipping validation.");
    return true;
  }

  if (!signature) {
    console.error("[CustomVoice/speech-callback] Missing x-twilio-signature header.");
    return false;
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const urlObj = new URL(req.url);
  const validationUrl = `${proto}://${host}${urlObj.pathname}${urlObj.search}`;

  try {
    const isValid = twilio.validateRequest(authToken, signature, validationUrl, params);
    if (!isValid) {
      console.error(`[CustomVoice/speech-callback] Twilio validation failed for URL: ${validationUrl}`);
    }
    return isValid;
  } catch (err: any) {
    console.error("[CustomVoice/speech-callback] Error in validateRequest:", err.message);
    return false;
  }
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

    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    // Validate Twilio signature
    const isValid = await validateTwilioRequest(req, params);
    if (!isValid) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Unauthorized request.</Say><Hangup/></Response>`;
      return new NextResponse(twiml, { status: 403, headers: { "Content-Type": "text/xml" } });
    }

    const customerSpeech = params["SpeechResult"]?.toString() || "";
    const confidenceVal = params["Confidence"] ? parseFloat(params["Confidence"]) : 1.0;

    // Fetch session state (Cache first, Firestore fallback)
    let agentName = "AI Agent";
    let callFramework = "";
    let existingTranscript: any[] = [];
    let repromptCount = 0;

    const cached = voiceSessionCache.get(sessionId);
    if (cached) {
      agentName = cached.agentName;
      callFramework = cached.callFramework;
      existingTranscript = cached.transcript;
      repromptCount = cached.repromptCount;
    } else if (db) {
      const sessionDoc = await db.collection("custom_voice_calls").doc(sessionId).get();
      if (sessionDoc.exists) {
        const data = sessionDoc.data()!;
        agentName = data.agentName || "AI Agent";
        callFramework = data.callFramework || "";
        existingTranscript = data.transcript || [];
        repromptCount = data.repromptCount || 0;

        // Warm session cache
        voiceSessionCache.set(sessionId, {
          agentName,
          callFramework,
          transcript: existingTranscript,
          repromptCount,
          callStartedAt: data.startedAt || new Date().toISOString(),
          status: data.status || "in-progress",
        });
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3089";
    const callbackUrl = `${appUrl}/api/custom-voice/speech-callback?sessionId=${sessionId}`;

    // Reprompt helper function
    const handleReprompt = async (reasonText: string) => {
      const nextRepromptCount = repromptCount + 1;
      const isEnding = nextRepromptCount >= 3;

      voiceSessionCache.update(sessionId, { repromptCount: nextRepromptCount });

      if (db) {
        db.collection("custom_voice_calls")
          .doc(sessionId)
          .update({
            repromptCount: nextRepromptCount,
            ...(isEnding && { status: "completed", endedAt: new Date().toISOString() }),
            updatedAt: new Date().toISOString(),
          })
          .catch((err) => console.error("[CustomVoice/speech-callback] Async Firestore error:", err.message));
      }

      if (isEnding) {
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">Thank you. Since we are having connection issues, I will end the call now. Goodbye!</Say>
  <Hangup/>
</Response>`;
        return new NextResponse(twiml, { status: 200, headers: { "Content-Type": "text/xml" } });
      }

      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${callbackUrl}" method="POST" speechTimeout="1" timeout="10" language="en-US" enhanced="true" speechModel="phone_call">
    <Say voice="Polly.Joanna-Neural"><prosody rate="92%">${reasonText}</prosody></Say>
  </Gather>
  <Say voice="Polly.Joanna-Neural">Goodbye!</Say>
</Response>`;
      return new NextResponse(twiml, { status: 200, headers: { "Content-Type": "text/xml" } });
    };

    // 1. Check for silence (no speech detected)
    if (!customerSpeech.trim()) {
      return await handleReprompt("I didn't hear anything. Could you please repeat that?");
    }

    // 2. Check for low confidence transcription
    if (confidenceVal < 0.4) {
      console.warn(`[CustomVoice/speech-callback] Low confidence (${confidenceVal}) for speech: "${customerSpeech}"`);
      return await handleReprompt("I didn't quite catch that. Could you please say it again?");
    }

    // Reset reprompt count if we have valid speech
    if (repromptCount > 0) {
      voiceSessionCache.update(sessionId, { repromptCount: 0 });
      if (db) {
        db.collection("custom_voice_calls")
          .doc(sessionId)
          .update({ repromptCount: 0 })
          .catch((err) => console.error("[CustomVoice/speech-callback] Async Firestore error:", err.message));
      }
    }

    // Append customer turn
    const customerTurn = { role: "customer" as const, text: customerSpeech, timestamp: new Date().toISOString() };
    const updatedTranscript = [...existingTranscript, customerTurn];

    // Detect customer end-of-call intent
    const isCustomerEnding = detectEndOfCall(customerSpeech);

    // Generate agent response
    const { text: agentResponse, isEndingCall: isAgentEnding } = await generateCallResponseWithFallback(
      {
        customerSpeech,
        callFramework,
        agentName,
        transcript: updatedTranscript,
      },
      sessionId
    );

    const shouldEndCall = isCustomerEnding || isAgentEnding;

    const agentTurn = { role: "agent" as const, text: agentResponse, timestamp: new Date().toISOString() };
    const finalTranscript = [...updatedTranscript, agentTurn];

    // Update session cache
    voiceSessionCache.update(sessionId, {
      transcript: finalTranscript,
      status: shouldEndCall ? "completed" : "in-progress",
    });

    // Persist updated transcript asynchronously
    if (db) {
      db.collection("custom_voice_calls")
        .doc(sessionId)
        .update({
          transcript: finalTranscript,
          status: shouldEndCall ? "completed" : "in-progress",
          ...(shouldEndCall && { endedAt: new Date().toISOString() }),
          updatedAt: new Date().toISOString(),
        })
        .catch((err) => console.error("[CustomVoice/speech-callback] Async Firestore error:", err.message));
    }

    const twiml = buildResponseTwiML(agentResponse, callbackUrl, shouldEndCall, agentName, sessionId);

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

