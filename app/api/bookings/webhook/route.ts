// app/api/bookings/webhook/route.ts
import { NextResponse } from "next/server";
import { initiateVoiceCall } from "@/lib/voice-confirmation";
import { z } from "zod";

const webhookSchema = z.object({
  callId: z.string().min(1),
  event: z.literal("booking_confirmed"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const validated = webhookSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "Invalid webhook payload", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { callId } = validated.data;

    // Fire and forget call initiation in the background so we return immediately
    void (async () => {
      try {
        await initiateVoiceCall(callId, 1);
      } catch (err: any) {
        console.error(`[BookingsWebhook] Background voice confirmation failed for call ${callId}:`, err.message);
      }
    })();

    return NextResponse.json({
      success: true,
      message: "Voice call confirmation triggered successfully",
      callId,
    });
  } catch (error: any) {
    console.error("[BookingsWebhook] Webhook endpoint error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process webhook trigger", message: error.message },
      { status: 500 }
    );
  }
}
