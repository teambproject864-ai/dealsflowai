import { NextRequest, NextResponse } from "next/server";
import { textToSpeech } from "@/lib/elevenlabs";

export const dynamic = "force-dynamic";

/**
 * GET /api/custom-voice/tts?text=xxx&persona=yyy
 * Call ElevenLabs text-to-speech engine and returns the audio buffer directly as audio/mpeg.
 * Heavily cached by headers for performance.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text");
    const persona = searchParams.get("persona") || "alex";

    if (!text) {
      return new NextResponse("Missing text parameter", { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return new NextResponse("ElevenLabs API Key not configured", { status: 500 });
    }

    // Call ElevenLabs
    const audioBuffer = await textToSpeech(text, persona);
    const uint8Array = new Uint8Array(audioBuffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400, immutable", // Cache the synthesized response
      },
    });
  } catch (error: any) {
    console.error("[CustomVoice/tts] ElevenLabs TTS generation failed:", error.message);
    return new NextResponse("TTS Generation Failed", { status: 500 });
  }
}
