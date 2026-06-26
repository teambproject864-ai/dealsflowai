import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateCallGreeting, saveCallSession } from "@/lib/custom-voice-agent/voice-agent";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

/**
 * POST /api/custom-voice/call
 * Initiates a custom AI voice call to the specified phone number.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "agent") {
      return NextResponse.json({ success: false, error: "Not authenticated as agent" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { toPhone, callFramework, agentName } = body;

    if (!toPhone) {
      return NextResponse.json({ success: false, error: "toPhone is required" }, { status: 400 });
    }

    const sessionId = `cvc-${uuidv4()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3089";
    const webhookUrl = `${appUrl}/api/custom-voice/webhook?sessionId=${sessionId}&agentId=${user.id}`;

    // Create session record in Firestore
    await saveCallSession({
      sessionId,
      agentId: user.id,
      agentName: agentName || user.name,
      callFramework: callFramework || "",
      toPhone,
      status: "initiated",
      startedAt: new Date().toISOString(),
      transcript: [],
      createdAt: new Date().toISOString(),
    });

    // Initiate Twilio outbound call using existing credentials
    let callSid: string | null = null;
    try {
      const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN?.trim();
      const twilioFrom = process.env.TWILIO_PHONE_NUMBER?.trim();

      if (twilioAccountSid && twilioAuthToken && twilioFrom) {
        const twilio = (await import("twilio")).default;
        const client = twilio(twilioAccountSid, twilioAuthToken);
        const call = await client.calls.create({
          to: toPhone,
          from: twilioFrom,
          url: webhookUrl,
          method: "POST",
          statusCallback: `${appUrl}/api/custom-voice/webhook?sessionId=${sessionId}&event=status`,
          statusCallbackMethod: "POST",
        });
        callSid = call.sid;
        await saveCallSession({ sessionId, callSid, status: "ringing" });
      } else {
        // Sandbox/mock mode — simulate a call SID for testing
        callSid = `MOCK_CALL_${sessionId}`;
        await saveCallSession({ sessionId, callSid, status: "ringing" });
        console.log("[CustomVoice] Twilio not configured — mock call initiated:", callSid);
      }
    } catch (twilioErr: any) {
      console.error("[CustomVoice] Twilio call initiation failed:", twilioErr.message);
      await saveCallSession({ sessionId, status: "failed" });
      return NextResponse.json({ success: false, error: `Call initiation failed: ${twilioErr.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sessionId,
      callSid,
      status: "ringing",
      webhookUrl,
    });
  } catch (error: any) {
    console.error("[CustomVoice/call] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * GET /api/custom-voice/call?sessionId=xxx
 * Returns logs for a specific call session.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    const { db } = await import("@/lib/firebase-admin");
    if (!db) {
      return NextResponse.json({ success: true, sessions: [] });
    }

    let query;
    if (sessionId) {
      const doc = await db.collection("custom_voice_calls").doc(sessionId).get();
      return NextResponse.json({ success: true, session: doc.exists ? doc.data() : null });
    } else if (user.role === "admin") {
      const snapshot = await db.collection("custom_voice_calls").orderBy("createdAt", "desc").limit(100).get();
      const sessions = snapshot.docs.map(d => d.data());
      return NextResponse.json({ success: true, sessions });
    } else {
      const snapshot = await db.collection("custom_voice_calls")
        .where("agentId", "==", user.id)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();
      const sessions = snapshot.docs.map(d => d.data());
      return NextResponse.json({ success: true, sessions });
    }
  } catch (error: any) {
    console.error("[CustomVoice/call GET] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal error" }, { status: 500 });
  }
}
