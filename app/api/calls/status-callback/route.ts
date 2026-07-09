// app/api/calls/status-callback/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { handleCallFailure, VoiceConfirmationRecord } from "@/lib/voice-confirmation";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const callId = searchParams.get("callId");

    if (!callId) {
      return NextResponse.json({ success: false, error: "Missing callId parameter" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: false, error: "Database not available" }, { status: 500 });
    }

    // Twilio status callbacks are sent as application/x-www-form-urlencoded
    const formData = await req.formData().catch(() => new Headers());
    const callSid = formData.get("CallSid")?.toString();
    const callStatus = formData.get("CallStatus")?.toString();
    const callDurationStr = formData.get("CallDuration")?.toString();
    const callDuration = callDurationStr ? parseInt(callDurationStr, 10) : 0;

    console.log(`[TwilioCallback] callId: ${callId}, CallSid: ${callSid}, Status: ${callStatus}, Duration: ${callDuration}`);

    // Try finding the record in voice_confirmations first
    const configDocRef = db.collection("voice_confirmations").doc(callId);
    let snap = await configDocRef.get();
    let isCustomVoice = false;
    let targetDocRef = configDocRef;

    if (!snap.exists) {
      // Fallback check: check custom_voice_calls collection
      const customDocRef = db.collection("custom_voice_calls").doc(callId);
      const customSnap = await customDocRef.get();
      if (customSnap.exists) {
        snap = customSnap;
        targetDocRef = customDocRef;
        isCustomVoice = true;
      } else {
        return NextResponse.json({ success: false, error: "Call record not found in either collection" }, { status: 404 });
      }
    }

    const currentData = snap.data();

    // Idempotency guard: Don't let late transitional status callbacks overwrite terminal statuses
    if (currentData?.status === "completed" && ["queued", "ringing", "in-progress"].includes(callStatus || "")) {
      return NextResponse.json({ success: true, message: "Call already completed, ignoring late callback" });
    }

    if (isCustomVoice) {
      const status = callStatus === "completed" ? "completed" : callStatus === "failed" ? "failed" : "in-progress";
      await targetDocRef.update({
        status,
        ...(callStatus === "completed" && { endedAt: new Date().toISOString(), duration: callDuration }),
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.json({ success: true });
    }

    // Process Voice Confirmation record
    const config = currentData as VoiceConfirmationRecord;

    // Log the callback event
    await db.collection("audit_logs").add({
      callId,
      leadId: config.leadId,
      type: "voice_confirmation_callback",
      twilioCallSid: callSid || "",
      status: callStatus || "",
      duration: callDuration,
      createdAt: new Date().toISOString(),
    });

    const attempts = config.attempts || [];
    const attemptIndex = attempts.findIndex(a => a.twilioCallSid === callSid);

    if (attemptIndex !== -1) {
      attempts[attemptIndex].status = callStatus || "unknown";
      attempts[attemptIndex].completedAt = new Date().toISOString();
      attempts[attemptIndex].duration = callDuration;
    } else {
      attempts.push({
        attempt: config.attemptsCount || 1,
        twilioCallSid: callSid || "",
        initiatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        duration: callDuration,
        status: callStatus || "unknown",
      });
    }

    let finalStatus = config.status;

    if (callStatus === "completed") {
      finalStatus = "completed";
    } else if (["failed", "busy", "no-answer", "canceled"].includes(callStatus || "")) {
      finalStatus = "failed";
    } else if (callStatus === "ringing") {
      finalStatus = "ringing";
    } else if (callStatus === "in-progress" || callStatus === "answered") {
      finalStatus = "answered";
    }

    await configDocRef.update({
      attempts,
      status: finalStatus,
      updatedAt: new Date().toISOString(),
    });

    // If call failed, busy, or no-answer, initiate retry logic
    if (["failed", "busy", "no-answer"].includes(callStatus || "")) {
      void handleCallFailure(callId, `twilio_callback_status:${callStatus}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[TwilioCallback] Error in status callback endpoint:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return NextResponse.json({ success: true, message: "Twilio status callback active (POST requests only)" });
}

