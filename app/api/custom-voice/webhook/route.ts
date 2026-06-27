import { NextRequest, NextResponse } from "next/server";
import {
  generateCallGreeting,
  buildGreetingTwiML,
  saveCallSession,
} from "@/lib/custom-voice-agent/voice-agent";
import { voiceSessionCache } from "@/lib/custom-voice-agent/voice-session-cache";
import { db } from "@/lib/firebase-admin";
import twilio from "twilio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Validates that the request comes from Twilio.
 */
async function validateTwilioRequest(req: NextRequest, params: Record<string, string>): Promise<boolean> {
  const signature = req.headers.get("x-twilio-signature");
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();

  if (process.env.NODE_ENV !== "production" && !signature) {
    console.log("[CustomVoice/webhook] Skipping signature validation in development mode (no signature header).");
    return true;
  }

  if (!authToken) {
    console.warn("[CustomVoice/webhook] TWILIO_AUTH_TOKEN is not configured. Skipping validation.");
    return true;
  }

  if (!signature) {
    console.error("[CustomVoice/webhook] Missing x-twilio-signature header.");
    return false;
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const urlObj = new URL(req.url);
  const validationUrl = `${proto}://${host}${urlObj.pathname}${urlObj.search}`;

  try {
    const isValid = twilio.validateRequest(authToken, signature, validationUrl, params);
    if (!isValid) {
      console.error(`[CustomVoice/webhook] Twilio validation failed for URL: ${validationUrl}`);
    }
    return isValid;
  } catch (err: any) {
    console.error("[CustomVoice/webhook] Error in validateRequest:", err.message);
    return false;
  }
}

/**
 * POST /api/custom-voice/webhook
 * Entry webhook called by Twilio when a call connects.
 * Returns TwiML with a greeting and opens a speech Gather loop.
 */
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const event = searchParams.get("event");

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

    // Handle status callback events from Twilio
    if (event === "status") {
      const callStatus = params["CallStatus"] || "";
      if (sessionId) {
        const status = callStatus === "completed" ? "completed" : callStatus === "failed" ? "failed" : "in-progress";
        
        // Update in-memory cache if it exists
        voiceSessionCache.update(sessionId, { status: status as any });
        
        await saveCallSession({
          sessionId,
          status: status as any,
          ...(callStatus === "completed" && { endedAt: new Date().toISOString() }),
        });
      }
      return new NextResponse("OK", { status: 200 });
    }

    if (!sessionId) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, an error occurred. Goodbye.</Say><Hangup/></Response>`;
      return new NextResponse(twiml, { status: 200, headers: { "Content-Type": "text/xml" } });
    }

    // Fetch agent info and framework from Firestore or Cache
    let agentName = "AI Agent";
    let callFramework = "";
    
    const cached = voiceSessionCache.get(sessionId);
    if (cached) {
      agentName = cached.agentName;
      callFramework = cached.callFramework;
    } else if (db) {
      const sessionDoc = await db.collection("custom_voice_calls").doc(sessionId).get();
      if (sessionDoc.exists) {
        const data = sessionDoc.data()!;
        agentName = data.agentName || "AI Agent";
        callFramework = data.callFramework || "";
        
        // Warm session cache
        voiceSessionCache.set(sessionId, {
          agentName,
          callFramework,
          transcript: [],
          repromptCount: 0,
          callStartedAt: new Date().toISOString(),
          status: "in-progress",
        });

        await saveCallSession({ sessionId, status: "in-progress" });
      }
    }

    const greeting = await generateCallGreeting(agentName, callFramework);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3089";
    const callbackUrl = `${appUrl}/api/custom-voice/speech-callback?sessionId=${sessionId}`;
    const twiml = buildGreetingTwiML(greeting, callbackUrl, agentName, sessionId);

    // Update transcript in cache & Firestore
    const greetingTurn = { role: "agent" as const, text: greeting, timestamp: new Date().toISOString() };
    const cachedSession = voiceSessionCache.get(sessionId);
    if (cachedSession) {
      voiceSessionCache.update(sessionId, {
        transcript: [greetingTurn],
      });
    }

    if (db) {
      await db.collection("custom_voice_calls").doc(sessionId).update({
        transcript: [greetingTurn],
        updatedAt: new Date().toISOString(),
      });
    }

    return new NextResponse(twiml, {
      status: 200,
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("[CustomVoice/webhook] Error:", error);
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>I apologize, a technical issue occurred. Goodbye!</Say><Hangup/></Response>`;
    return new NextResponse(twiml, { status: 200, headers: { "Content-Type": "text/xml" } });
  }
}

