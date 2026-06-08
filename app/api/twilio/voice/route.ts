import { NextResponse } from "next/server";
import { TwilioService } from "@/lib/twilio-service";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { to, twiml } = body;

    if (!to || !twiml) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: 'to' and 'twiml'" },
        { status: 400 }
      );
    }

    const twilio = TwilioService.getInstance();
    const result = await twilio.initiateVoiceCall(to, twiml);

    return NextResponse.json({
      success: true,
      callSid: result.sid,
      status: result.status,
    });
  } catch (error: any) {
    console.error("[TwilioVoiceAPI] Outbound call dispatch failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initiate outbound call" },
      { status: 500 }
    );
  }
}
