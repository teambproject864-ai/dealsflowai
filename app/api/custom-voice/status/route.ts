import { NextRequest, NextResponse } from "next/server";
import { voiceSessionCache } from "@/lib/custom-voice-agent/voice-session-cache";
import { db } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/custom-voice/status?sessionId=xxx
 * Retrieves the real-time status and transcript of a call session.
 * Used for live polling in the UI.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Missing sessionId parameter" }, { status: 400 });
    }

    // Read from in-memory cache first
    const cached = voiceSessionCache.get(sessionId);
    if (cached) {
      return NextResponse.json({
        success: true,
        source: "cache",
        session: {
          sessionId,
          agentName: cached.agentName,
          status: cached.status,
          transcript: cached.transcript,
          startedAt: cached.callStartedAt,
        },
      });
    }

    // Fallback to Firestore
    if (!db) {
      return NextResponse.json({ success: false, error: "Database not available" }, { status: 500 });
    }

    const doc = await db.collection("custom_voice_calls").doc(sessionId).get();
    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }

    const data = doc.data()!;
    return NextResponse.json({
      success: true,
      source: "firestore",
      session: {
        sessionId,
        agentName: data.agentName,
        status: data.status,
        transcript: data.transcript || [],
        startedAt: data.startedAt || data.createdAt,
        endedAt: data.endedAt,
        duration: data.duration,
      },
    });
  } catch (error: any) {
    console.error("[CustomVoice/status] Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
