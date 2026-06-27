import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/custom-voice/audio-fallback
 * Standard fallback endpoint registered with Twilio calls.
 * Executed if the main speech-callback webhook times out or crashes.
 */
export async function POST(req: NextRequest) {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">I apologize, but we are experiencing a connection issue. We will call you back shortly. Goodbye!</Say>
  <Hangup/>
</Response>`;
  
  return new NextResponse(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}
