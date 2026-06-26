import { NextRequest, NextResponse } from "next/server";
import {
  generateCallGreeting,
  buildGreetingTwiML,
  saveCallSession,
} from "@/lib/custom-voice-agent/voice-agent";
import { db } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

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

    // Handle status callback events from Twilio
    if (event === "status") {
      const form = await req.formData();
      const callStatus = form.get("CallStatus")?.toString() || "";
      if (sessionId) {
        const status = callStatus === "completed" ? "completed" : callStatus === "failed" ? "failed" : "in-progress";
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

    // Fetch agent info and framework from Firestore
    let agentName = "AI Agent";
    let callFramework = "";
    if (db) {
      const sessionDoc = await db.collection("custom_voice_calls").doc(sessionId).get();
      if (sessionDoc.exists) {
        const data = sessionDoc.data()!;
        agentName = data.agentName || "AI Agent";
        callFramework = data.callFramework || "";
        await saveCallSession({ sessionId, status: "in-progress" });
      }
    }

    const greeting = await generateCallGreeting(agentName, callFramework);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3089";
    const callbackUrl = `${appUrl}/api/custom-voice/speech-callback?sessionId=${sessionId}`;
    const twiml = buildGreetingTwiML(greeting, callbackUrl);

    // Log first agent turn in transcript
    if (db) {
      await db.collection("custom_voice_calls").doc(sessionId).update({
        transcript: [{ role: "agent", text: greeting, timestamp: new Date().toISOString() }],
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
